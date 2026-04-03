from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from sqlalchemy import text
from app.core.auth import get_current_user
from app.core.database import engine

router = APIRouter()

class Notification(BaseModel):
    id: int
    notification_type: str
    title: str
    message: str
    action_url: str | None
    is_read: bool
    created_at: datetime

@router.get("/list", response_model=List[Notification])
async def get_notifications(
    limit: int = 20,
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Get user notifications"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            query = """
                SELECT id, notification_type, title, message, action_url, is_read, created_at
                FROM user_notifications
                WHERE user_id = :user_id
            """
            
            if unread_only:
                query += " AND is_read = FALSE"
            
            query += " ORDER BY created_at DESC LIMIT :limit"
            
            result = conn.execute(
                text(query),
                {"user_id": user_id, "limit": limit}
            )
            
            notifications = []
            for row in result:
                notifications.append(Notification(
                    id=row[0],
                    notification_type=row[1],
                    title=row[2],
                    message=row[3],
                    action_url=row[4],
                    is_read=row[5],
                    created_at=row[6]
                ))
            
            return notifications
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")

@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            count = conn.execute(
                text("""
                    SELECT COUNT(*) 
                    FROM user_notifications 
                    WHERE user_id = :user_id AND is_read = FALSE
                """),
                {"user_id": user_id}
            ).scalar()
            
            return {"unread_count": count or 0}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch count: {str(e)}")

@router.post("/{notification_id}/mark-read")
async def mark_notification_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    UPDATE user_notifications
                    SET is_read = TRUE
                    WHERE id = :notification_id AND user_id = :user_id
                """),
                {"notification_id": notification_id, "user_id": user_id}
            )
            conn.commit()
            
            return {"message": "Notification marked as read"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notification: {str(e)}")

@router.post("/mark-all-read")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    UPDATE user_notifications
                    SET is_read = TRUE
                    WHERE user_id = :user_id AND is_read = FALSE
                """),
                {"user_id": user_id}
            )
            conn.commit()
            
            return {"message": "All notifications marked as read"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notifications: {str(e)}")

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a notification"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    DELETE FROM user_notifications
                    WHERE id = :notification_id AND user_id = :user_id
                """),
                {"notification_id": notification_id, "user_id": user_id}
            )
            conn.commit()
            
            return {"message": "Notification deleted"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete notification: {str(e)}")

# System notification creation (called by other services)
@router.post("/create")
async def create_notification(
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    action_url: str | None = None
):
    """Create a notification (internal use)"""
    
    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO user_notifications 
                    (user_id, notification_type, title, message, action_url)
                    VALUES (:user_id, :type, :title, :message, :url)
                """),
                {
                    "user_id": user_id,
                    "type": notification_type,
                    "title": title,
                    "message": message,
                    "url": action_url
                }
            )
            conn.commit()
            
            return {"message": "Notification created"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create notification: {str(e)}")
