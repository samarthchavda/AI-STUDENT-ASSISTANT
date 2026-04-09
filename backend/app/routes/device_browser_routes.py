from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from app.core.auth import get_current_user, require_admin
from app.core.database import get_db

router = APIRouter(prefix="/tracking", tags=["Device & Browser"])

# Request Model
class DeviceBrowserLog(BaseModel):
    session_id: str
    device_type: Optional[str] = None
    device_brand: Optional[str] = None
    browser_name: Optional[str] = None
    browser_version: Optional[str] = None
    os_name: Optional[str] = None
    os_version: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    country: Optional[str] = None
    city: Optional[str] = None

# User Endpoint
@router.post("/device-browser")
async def log_device_browser(
    log: DeviceBrowserLog,
    request: Request,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log device and browser information"""
    try:
        user_agent = request.headers.get('user-agent', '')
        
        screen_resolution = None
        if log.screen_width and log.screen_height:
            screen_resolution = f"{log.screen_width}x{log.screen_height}"
        
        query = text("""
            INSERT INTO device_browser_logs 
            (user_id, session_id, device_type, device_brand, browser_name, browser_version,
             os_name, os_version, screen_width, screen_height, screen_resolution,
             country, city, user_agent)
            VALUES (:user_id, :session_id, :device_type, :device_brand, :browser_name, :browser_version,
                    :os_name, :os_version, :screen_width, :screen_height, :screen_resolution,
                    :country, :city, :user_agent)
            RETURNING id
        """)
        
        result = db.execute(query, {
            'user_id': current_user.id,
            'session_id': log.session_id,
            'device_type': log.device_type,
            'device_brand': log.device_brand,
            'browser_name': log.browser_name,
            'browser_version': log.browser_version,
            'os_name': log.os_name,
            'os_version': log.os_version,
            'screen_width': log.screen_width,
            'screen_height': log.screen_height,
            'screen_resolution': screen_resolution,
            'country': log.country,
            'city': log.city,
            'user_agent': user_agent
        })
        
        log_id = result.fetchone()[0]
        db.commit()
        
        return {"success": True, "log_id": log_id}
        
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}

# Admin Endpoints
@router.get("/admin/device-browser/summary")
async def get_device_browser_summary(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get device/browser summary"""
    try:
        db.execute(text("SELECT refresh_device_browser_summary()"))
        
        query = text("""
            SELECT 
                COUNT(DISTINCT user_id) as total_users,
                COUNT(DISTINCT session_id) as total_sessions,
                COUNT(DISTINCT device_type) as device_types,
                COUNT(DISTINCT browser_name) as browsers
            FROM device_browser_logs
        """)
        
        result = db.execute(query).fetchone()
        
        return {
            "total_users": int(result[0]) if result[0] else 0,
            "total_sessions": int(result[1]) if result[1] else 0,
            "device_types": int(result[2]) if result[2] else 0,
            "browsers": int(result[3]) if result[3] else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/device-browser/device-distribution")
async def get_device_distribution(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get device type distribution"""
    try:
        query = text("""
            SELECT * FROM device_type_distribution
            ORDER BY user_count DESC
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "device_type": row[0],
                "user_count": int(row[1]),
                "session_count": int(row[2]),
                "percentage": float(row[3])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/device-browser/browser-distribution")
async def get_browser_distribution(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get browser distribution"""
    try:
        query = text("""
            SELECT * FROM browser_distribution
            ORDER BY user_count DESC
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "browser_name": row[0],
                "user_count": int(row[1]),
                "session_count": int(row[2]),
                "percentage": float(row[3])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/device-browser/os-distribution")
async def get_os_distribution(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get OS distribution"""
    try:
        query = text("""
            SELECT * FROM os_distribution
            ORDER BY user_count DESC
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "os_name": row[0],
                "user_count": int(row[1]),
                "session_count": int(row[2]),
                "percentage": float(row[3])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/device-browser/mobile-vs-desktop")
async def get_mobile_vs_desktop(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get mobile vs desktop comparison"""
    try:
        query = text("""
            SELECT * FROM mobile_vs_desktop
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "category": row[0],
                "user_count": int(row[1]),
                "session_count": int(row[2]),
                "percentage": float(row[3])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/device-browser/screen-resolutions")
async def get_screen_resolutions(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get screen resolution distribution"""
    try:
        query = text("""
            SELECT * FROM screen_resolution_distribution
            ORDER BY user_count DESC
            LIMIT 20
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "resolution": row[0],
                "user_count": int(row[1]),
                "percentage": float(row[2])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/device-browser/geographic-distribution")
async def get_geographic_distribution(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get geographic distribution"""
    try:
        query = text("""
            SELECT * FROM geographic_distribution
            ORDER BY user_count DESC
            LIMIT 50
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "country": row[0],
                "city": row[1],
                "user_count": int(row[2]),
                "session_count": int(row[3])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/device-browser/user-preferences")
async def get_user_device_preferences(
    limit: int = 50,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user device preferences"""
    try:
        query = text("""
            SELECT * FROM user_device_preferences
            ORDER BY total_sessions DESC
            LIMIT :limit
        """)
        
        results = db.execute(query, {'limit': limit}).fetchall()
        
        data = [
            {
                "user_id": int(row[0]),
                "name": row[1],
                "email": row[2],
                "primary_device": row[3],
                "primary_browser": row[4],
                "primary_os": row[5],
                "device_count": int(row[6]),
                "total_sessions": int(row[7])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
