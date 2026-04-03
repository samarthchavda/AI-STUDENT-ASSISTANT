"""Razorpay payment routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import razorpay
import hmac
import hashlib
import os
from dotenv import load_dotenv

from app.core.database import get_db
from app.models import User, Payment, Subscription, Invoice, PaymentWebhook, PlanType
from app.core.auth import get_current_user
from app.core.email import send_email

load_dotenv()

router = APIRouter()

# Razorpay client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise Exception("Razorpay credentials not found in environment")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Pricing configuration (matches frontend PricingPage.tsx)
PRICING_CONFIG = {
    'free': {
        'monthly': 0,
        'yearly': 0
    },
    'basic': {
        'monthly': 259,
        'yearly': 2599
    },
    'pro': {
        'monthly': 599,
        'yearly': 5999
    }
}

# Request/Response models
class CreateOrderRequest(BaseModel):
    plan: str  # 'free', 'basic', 'pro'
    billing_cycle: str  # 'monthly', 'yearly'

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    plan: str
    billing_cycle: str
    user_name: str
    user_email: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: str
    billing_cycle: str

class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str
    subscription_id: Optional[int] = None
    invoice_number: Optional[str] = None


def generate_invoice_number() -> str:
    """Generate unique invoice number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"INV-{timestamp}"


def calculate_expiry_date(billing_cycle: str, start_date: datetime) -> datetime:
    """Calculate subscription expiry date"""
    if billing_cycle == 'monthly':
        return start_date + timedelta(days=30)
    elif billing_cycle == 'yearly':
        return start_date + timedelta(days=365)
    else:
        return start_date + timedelta(days=30)


def get_plan_enum(plan_str: str) -> PlanType:
    """Convert plan string to PlanType enum"""
    plan_map = {
        'free': PlanType.FREE,
        'basic': PlanType.BASIC,
        'pro': PlanType.PRO
    }
    return plan_map.get(plan_str.lower(), PlanType.FREE)


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_razorpay_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Razorpay order for payment"""
    
    # Validate plan
    if request.plan not in PRICING_CONFIG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan: {request.plan}"
        )
    
    # Validate billing cycle
    if request.billing_cycle not in ['monthly', 'yearly']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid billing cycle: {request.billing_cycle}"
        )
    
    # Get amount from pricing config
    amount = PRICING_CONFIG[request.plan][request.billing_cycle]
    
    # Free plan doesn't need payment
    if amount == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Free plan doesn't require payment"
        )
    
    # Convert to paise (Razorpay uses smallest currency unit)
    amount_paise = amount * 100
    
    try:
        # Create Razorpay order
        order_data = {
            "amount": amount_paise,
            "currency": "INR",
            "notes": {
                "user_id": current_user.id,
                "user_email": current_user.email,
                "plan": request.plan,
                "billing_cycle": request.billing_cycle
            }
        }
        
        razorpay_order = razorpay_client.order.create(data=order_data)
        
        # Create pending payment record
        payment = Payment(
            user_id=current_user.id,
            plan=get_plan_enum(request.plan),
            amount=amount_paise,
            currency="INR",
            status="pending",
            payment_id=None,
            order_id=razorpay_order['id'],
            notes=order_data['notes']
        )
        db.add(payment)
        db.commit()
        
        return CreateOrderResponse(
            order_id=razorpay_order['id'],
            amount=amount_paise,
            currency="INR",
            key_id=RAZORPAY_KEY_ID,
            plan=request.plan,
            billing_cycle=request.billing_cycle,
            user_name=current_user.name,
            user_email=current_user.email
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify Razorpay payment signature and activate subscription"""
    
    try:
        # Verify signature
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            f"{request.razorpay_order_id}|{request.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != request.razorpay_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature"
            )
        
        # Find payment record
        payment = db.query(Payment).filter(
            Payment.order_id == request.razorpay_order_id,
            Payment.user_id == current_user.id
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment record not found"
            )
        
        # Check if already processed
        if payment.status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment already processed"
            )
        
        # Update payment record
        payment.payment_id = request.razorpay_payment_id
        payment.signature = request.razorpay_signature
        payment.status = "completed"
        
        # Calculate dates
        start_date = datetime.utcnow()
        expiry_date = calculate_expiry_date(request.billing_cycle, start_date)
        
        # Create subscription record
        subscription = Subscription(
            user_id=current_user.id,
            plan_name=request.plan,
            billing_cycle=request.billing_cycle,
            source='payment',
            amount_paid=payment.amount,
            currency=payment.currency,
            razorpay_payment_id=request.razorpay_payment_id,
            razorpay_order_id=request.razorpay_order_id,
            status='active',
            starts_at=start_date,
            expires_at=expiry_date
        )
        db.add(subscription)
        db.flush()  # Get subscription ID
        
        # Update user plan
        current_user.plan = get_plan_enum(request.plan)
        current_user.subscription_source = 'payment'
        current_user.plan_updated_at = start_date
        
        # Generate invoice
        invoice_number = generate_invoice_number()
        amount_rupees = payment.amount / 100
        
        validity_period = f"{start_date.strftime('%d %b %Y')} to {expiry_date.strftime('%d %b %Y')}"
        
        invoice = Invoice(
            invoice_number=invoice_number,
            user_id=current_user.id,
            subscription_id=subscription.id,
            user_name=current_user.name,
            user_email=current_user.email,
            plan_name=request.plan,
            billing_cycle=request.billing_cycle,
            amount_paid=payment.amount,
            currency=payment.currency,
            payment_id=request.razorpay_payment_id,
            order_id=request.razorpay_order_id,
            validity_period=validity_period
        )
        db.add(invoice)
        
        db.commit()
        
        # Send confirmation email
        try:
            send_payment_confirmation_email(
                user_email=current_user.email,
                user_name=current_user.name,
                plan=request.plan,
                billing_cycle=request.billing_cycle,
                amount=amount_rupees,
                payment_id=request.razorpay_payment_id,
                invoice_number=invoice_number,
                start_date=start_date,
                expiry_date=expiry_date
            )
        except Exception as email_error:
            print(f"Failed to send confirmation email: {email_error}")
            # Don't fail the payment if email fails
        
        return VerifyPaymentResponse(
            success=True,
            message=f"Payment successful! Your {request.plan.upper()} plan is now active.",
            subscription_id=subscription.id,
            invoice_number=invoice_number
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )


def send_payment_confirmation_email(
    user_email: str,
    user_name: str,
    plan: str,
    billing_cycle: str,
    amount: float,
    payment_id: str,
    invoice_number: str,
    start_date: datetime,
    expiry_date: datetime
):
    """Send payment confirmation email"""
    
    subject = f"Payment Successful - {plan.upper()} Plan Activated"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🎉 Payment Successful!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px;">Hi <strong>{user_name}</strong>,</p>
                
                <p>Thank you for upgrading to <strong>{plan.upper()}</strong> plan! Your payment has been processed successfully.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                    <h3 style="margin-top: 0; color: #667eea;">Subscription Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0;"><strong>Plan:</strong></td>
                            <td style="padding: 8px 0;">{plan.upper()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Billing Cycle:</strong></td>
                            <td style="padding: 8px 0;">{billing_cycle.capitalize()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
                            <td style="padding: 8px 0;">₹{amount:.2f}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Payment ID:</strong></td>
                            <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">{payment_id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Invoice Number:</strong></td>
                            <td style="padding: 8px 0; font-family: monospace;">{invoice_number}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Start Date:</strong></td>
                            <td style="padding: 8px 0;">{start_date.strftime('%d %B %Y')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Expiry Date:</strong></td>
                            <td style="padding: 8px 0;">{expiry_date.strftime('%d %B %Y')}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2e7d32;">✨ Premium Features Unlocked</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Unlimited AI queries</li>
                        <li>Priority AI responses</li>
                        <li>Unlimited mock tests & code debugging</li>
                        <li>DSA practice with hints</li>
                        <li>Resume builder & analysis</li>
                        <li>Interview preparation tools</li>
                        <li>24/7 priority support</li>
                    </ul>
                </div>
                
                <p>You can now access all premium features on your dashboard.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://your-app-url.com/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        Go to Dashboard
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666;">
                    Need help? Contact us at <a href="mailto:support@codecampus.ai" style="color: #667eea;">support@codecampus.ai</a>
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    This is an automated email. Please do not reply to this message.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    send_email(
        to_email=user_email,
        subject=subject,
        html_content=html_content
    )


@router.post("/webhook")
async def razorpay_webhook(
    request: dict,
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """Handle Razorpay webhooks"""
    
    try:
        # Verify webhook signature
        webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
        
        if webhook_secret and x_razorpay_signature:
            # Verify signature
            import json
            payload = json.dumps(request, separators=(',', ':'))
            expected_signature = hmac.new(
                webhook_secret.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if expected_signature != x_razorpay_signature:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid webhook signature"
                )
        
        # Log webhook
        event_id = request.get('event', {}).get('id', 'unknown')
        event_type = request.get('event', {}).get('type', 'unknown')
        
        # Check if already processed
        existing = db.query(PaymentWebhook).filter(
            PaymentWebhook.event_id == event_id
        ).first()
        
        if existing:
            return {"status": "already_processed"}
        
        # Save webhook
        webhook = PaymentWebhook(
            event_id=event_id,
            event_type=event_type,
            payload=request,
            processed=False
        )
        db.add(webhook)
        db.commit()
        
        # Process webhook based on event type
        if event_type == 'payment.captured':
            # Payment successful
            payment_entity = request.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')
            
            if order_id:
                payment = db.query(Payment).filter(
                    Payment.order_id == order_id
                ).first()
                
                if payment and payment.status == 'pending':
                    payment.payment_id = payment_id
                    payment.status = 'completed'
                    webhook.processed = True
                    db.commit()
        
        elif event_type == 'payment.failed':
            # Payment failed
            payment_entity = request.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payment_entity.get('order_id')
            
            if order_id:
                payment = db.query(Payment).filter(
                    Payment.order_id == order_id
                ).first()
                
                if payment:
                    payment.status = 'failed'
                    webhook.processed = True
                    db.commit()
        
        return {"status": "success"}
        
    except Exception as e:
        print(f"Webhook processing error: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/subscription/status")
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's subscription status"""
    
    # Get active subscription
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == 'active'
    ).order_by(Subscription.created_at.desc()).first()
    
    if not subscription:
        return {
            "has_subscription": False,
            "plan": current_user.plan.value if hasattr(current_user.plan, 'value') else current_user.plan,
            "source": current_user.subscription_source or 'free'
        }
    
    # Check if expired
    if subscription.expires_at and subscription.expires_at < datetime.utcnow():
        subscription.status = 'expired'
        db.commit()
        
        return {
            "has_subscription": False,
            "plan": current_user.plan.value if hasattr(current_user.plan, 'value') else current_user.plan,
            "source": 'expired',
            "expired_at": subscription.expires_at.isoformat()
        }
    
    return {
        "has_subscription": True,
        "subscription_id": subscription.id,
        "plan": subscription.plan_name,
        "billing_cycle": subscription.billing_cycle,
        "source": subscription.source,
        "status": subscription.status,
        "starts_at": subscription.starts_at.isoformat(),
        "expires_at": subscription.expires_at.isoformat() if subscription.expires_at else None,
        "days_remaining": (subscription.expires_at - datetime.utcnow()).days if subscription.expires_at else None
    }


@router.get("/invoices")
async def get_user_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's invoices"""
    
    invoices = db.query(Invoice).filter(
        Invoice.user_id == current_user.id
    ).order_by(Invoice.created_at.desc()).all()
    
    return [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "plan_name": inv.plan_name,
            "billing_cycle": inv.billing_cycle,
            "amount_paid": inv.amount_paid / 100,  # Convert to rupees
            "currency": inv.currency,
            "payment_id": inv.payment_id,
            "validity_period": inv.validity_period,
            "invoice_date": inv.invoice_date.isoformat()
        }
        for inv in invoices
    ]


@router.get("/subscription/info")
async def get_subscription_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed subscription information with feature access"""
    from app.core.subscription import SubscriptionAccess
    
    return SubscriptionAccess.get_subscription_info(current_user, db)
