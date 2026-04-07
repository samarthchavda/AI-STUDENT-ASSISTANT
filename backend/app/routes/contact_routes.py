"""Contact form routes - public and admin"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import logging

from app.core.database import get_db
from app.models import ContactMessage, ContactMessageStatus, User
from app.core.auth import get_current_user
from app.core.email import send_email

router = APIRouter()
logger = logging.getLogger(__name__)

# Request/Response models
class ContactFormRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

class ContactMessageResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    subject: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UpdateStatusRequest(BaseModel):
    status: str

# Dependency to check if user is admin
async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admin access required."
        )
    return current_user

# ============================================================================
# PUBLIC ENDPOINTS
# ============================================================================

@router.post("/submit")
async def submit_contact_form(
    form_data: ContactFormRequest,
    db: Session = Depends(get_db)
):
    """Public endpoint to submit contact form"""
    try:
        logger.info(f"[CONTACT] New submission from {form_data.email}")
        
        # Validate required fields
        if not form_data.full_name or not form_data.full_name.strip():
            raise HTTPException(status_code=400, detail="Full name is required")
        if not form_data.subject or not form_data.subject.strip():
            raise HTTPException(status_code=400, detail="Subject is required")
        if not form_data.message or not form_data.message.strip():
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Create contact message
        contact_message = ContactMessage(
            full_name=form_data.full_name.strip(),
            email=form_data.email.lower().strip(),
            phone=form_data.phone.strip() if form_data.phone else None,
            subject=form_data.subject.strip(),
            message=form_data.message.strip(),
            status=ContactMessageStatus.NEW
        )
        
        db.add(contact_message)
        db.commit()
        db.refresh(contact_message)
        
        logger.info(f"[CONTACT] Message saved with ID: {contact_message.id}")
        
        # Send notification email to admin (optional - won't fail if email not configured)
        try:
            send_admin_notification_email(
                name=form_data.full_name,
                email=form_data.email,
                subject=form_data.subject,
                message=form_data.message,
                phone=form_data.phone
            )
            logger.info(f"[CONTACT] Admin notification email sent")
        except Exception as email_error:
            logger.warning(f"[CONTACT] Failed to send admin notification: {str(email_error)}")
            # Don't fail the request if email fails
        
        return {
            "success": True,
            "message": "Thank you for contacting us! We'll get back to you soon.",
            "id": contact_message.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CONTACT] Error: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to submit contact form. Please try again."
        )

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@router.get("/admin/messages", response_model=List[ContactMessageResponse])
async def get_all_contact_messages(
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all contact messages (admin only)"""
    try:
        query = db.query(ContactMessage)
        
        # Apply status filter if provided
        if status_filter and status_filter in ['new', 'read', 'archived']:
            query = query.filter(ContactMessage.status == ContactMessageStatus(status_filter))
        
        # Get messages ordered by newest first
        messages = query.order_by(ContactMessage.created_at.desc()).offset(skip).limit(limit).all()
        
        return messages
        
    except Exception as e:
        logger.error(f"[CONTACT ADMIN] Error fetching messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch contact messages")

@router.get("/admin/messages/stats")
async def get_contact_messages_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get contact messages statistics (admin only)"""
    try:
        total = db.query(ContactMessage).count()
        new = db.query(ContactMessage).filter(ContactMessage.status == ContactMessageStatus.NEW).count()
        read = db.query(ContactMessage).filter(ContactMessage.status == ContactMessageStatus.READ).count()
        archived = db.query(ContactMessage).filter(ContactMessage.status == ContactMessageStatus.ARCHIVED).count()
        
        return {
            "total": total,
            "new": new,
            "read": read,
            "archived": archived
        }
        
    except Exception as e:
        logger.error(f"[CONTACT ADMIN] Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")

@router.patch("/admin/messages/{message_id}/status")
async def update_message_status(
    message_id: int,
    status_data: UpdateStatusRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Update contact message status (admin only)"""
    try:
        message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
        
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        # Validate status
        if status_data.status not in ['new', 'read', 'archived']:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        message.status = ContactMessageStatus(status_data.status)
        message.updated_at = datetime.utcnow()
        
        db.commit()
        
        logger.info(f"[CONTACT ADMIN] Message {message_id} status updated to {status_data.status}")
        
        return {
            "success": True,
            "message": "Status updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CONTACT ADMIN] Error updating status: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update status")

@router.delete("/admin/messages/{message_id}")
async def delete_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Delete contact message (admin only)"""
    try:
        message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
        
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        db.delete(message)
        db.commit()
        
        logger.info(f"[CONTACT ADMIN] Message {message_id} deleted")
        
        return {
            "success": True,
            "message": "Message deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CONTACT ADMIN] Error deleting message: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete message")

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def send_admin_notification_email(
    name: str,
    email: str,
    subject: str,
    message: str,
    phone: Optional[str] = None
):
    """Send notification email to admin about new contact form submission"""
    
    admin_email = "admin@codecampus.ai"  # TODO: Make this configurable
    
    email_subject = f"New Contact Form Submission: {subject}"
    
    text_body = f"""
New Contact Form Submission

From: {name}
Email: {email}
Phone: {phone or 'Not provided'}
Subject: {subject}

Message:
{message}

---
Submitted at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
    """
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="color: white; margin: 0;">📧 New Contact Form Submission</h2>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #667eea;">Contact Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0;"><strong>Name:</strong></td>
                            <td style="padding: 8px 0;">{name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Email:</strong></td>
                            <td style="padding: 8px 0;"><a href="mailto:{email}">{email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                            <td style="padding: 8px 0;">{phone or 'Not provided'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Subject:</strong></td>
                            <td style="padding: 8px 0;">{subject}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #667eea;">Message</h3>
                    <p style="white-space: pre-wrap;">{message}</p>
                </div>
                
                <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">
                    Submitted at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        send_email(
            to_email=admin_email,
            subject=email_subject,
            body=text_body,
            html_body=html_body
        )
    except Exception as e:
        logger.warning(f"Failed to send admin notification email: {str(e)}")
        # Don't raise - this is optional
