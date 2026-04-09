from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
import json

router = APIRouter(prefix="/tracking", tags=["Feature Usage"])

# Request Model
class FeatureUsageLog(BaseModel):
    feature_name: str
    feature_category: Optional[str] = None
    action_type: str  # open, use, complete, abandon, error
    duration_seconds: int = 0
    success: bool = True
    metadata: Optional[dict] = None

# User Endpoint
@router.post("/feature-usage")
async def log_feature_usage(
    log: FeatureUsageLog,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log feature usage"""
    try:
        query = text("""
            INSERT INTO feature_usage_logs 
            (user_id, feature_name, feature_category, action_type, duration_seconds, success, metadata)
            VALUES (:user_id, :feature_name, :feature_category, :action_type, :duration_seconds, :success, :metadata::jsonb)
            RETURNING id
        """)
        
        metadata_json = json.dumps(log.metadata) if log.metadata else None
        
        result = db.execute(query, {
            'user_id': current_user.id,
            'feature_name': log.feature_name,
            'feature_category': log.feature_category,
            'action_type': log.action_type,
            'duration_seconds': log.duration_seconds,
            'success': log.success,
            'metadata': metadata_json
        })
        
        log_id = result.fetchone()[0]
        db.commit()
        
        return {"success": True, "log_id": log_id}
        
    except Exception as e:
        db.rollback()
        print(f"Feature usage logging error: {str(e)}")
        return {"success": False, "message": str(e)}

# Admin Endpoints
@router.get("/admin/feature-usage/summary")
async def get_feature_usage_summary(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get feature usage summary"""
    try:
        db.execute(text("SELECT refresh_feature_usage_summary()"))
        
        query = text("""
            SELECT 
                COUNT(DISTINCT feature_name) as total_features,
                SUM(total_uses) as total_uses,
                SUM(unique_users) as total_unique_users,
                ROUND(AVG(success_rate), 2) as avg_success_rate
            FROM feature_usage_summary
        """)
        
        result = db.execute(query).fetchone()
        
        return {
            "total_features": int(result[0]) if result[0] else 0,
            "total_uses": int(result[1]) if result[1] else 0,
            "total_unique_users": int(result[2]) if result[2] else 0,
            "avg_success_rate": float(result[3]) if result[3] else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/feature-usage/most-used")
async def get_most_used_features(
    limit: int = 10,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get most used features"""
    try:
        query = text("""
            SELECT * FROM most_used_features
            LIMIT :limit
        """)
        
        results = db.execute(query, {'limit': limit}).fetchall()
        
        data = [
            {
                "feature_name": row[0],
                "feature_category": row[1],
                "total_uses": int(row[2]),
                "unique_users": int(row[3]),
                "success_rate": float(row[4]),
                "avg_duration": float(row[5]),
                "completion_rate": float(row[6]) if row[6] else 0
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/feature-usage/least-used")
async def get_least_used_features(
    limit: int = 10,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get least used features"""
    try:
        query = text("""
            SELECT * FROM least_used_features
            LIMIT :limit
        """)
        
        results = db.execute(query, {'limit': limit}).fetchall()
        
        data = [
            {
                "feature_name": row[0],
                "feature_category": row[1],
                "total_uses": int(row[2]),
                "unique_users": int(row[3]),
                "success_rate": float(row[4]),
                "avg_duration": float(row[5])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/feature-usage/by-category")
async def get_feature_usage_by_category(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get feature usage by category"""
    try:
        query = text("""
            SELECT * FROM feature_usage_by_category
            ORDER BY total_uses DESC
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "category": row[0],
                "total_uses": int(row[1]),
                "unique_users": int(row[2]),
                "avg_duration": float(row[3]),
                "success_rate": float(row[4])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/feature-usage/dropoff-analysis")
async def get_dropoff_analysis(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get feature drop-off analysis"""
    try:
        query = text("""
            SELECT * FROM feature_dropoff_analysis
            ORDER BY dropoff_rate DESC
            LIMIT 20
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "feature_name": row[0],
                "opens": int(row[1]),
                "completions": int(row[2]),
                "abandons": int(row[3]),
                "dropoff_rate": float(row[4])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/feature-usage/trends")
async def get_feature_usage_trends(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get feature usage trends"""
    try:
        query = text("""
            SELECT * FROM feature_usage_trends
            WHERE usage_date >= CURRENT_DATE - INTERVAL ':days days'
            ORDER BY usage_date DESC, total_uses DESC
        """)
        
        results = db.execute(query, {'days': days}).fetchall()
        
        data = [
            {
                "date": row[0].isoformat(),
                "feature_name": row[1],
                "total_uses": int(row[2]),
                "unique_users": int(row[3])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/feature-usage/errors")
async def get_feature_errors(
    limit: int = 50,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get feature error analysis"""
    try:
        query = text("""
            SELECT * FROM feature_error_analysis
            ORDER BY error_count DESC
            LIMIT :limit
        """)
        
        results = db.execute(query, {'limit': limit}).fetchall()
        
        data = [
            {
                "feature_name": row[0],
                "error_count": int(row[1]),
                "total_uses": int(row[2]),
                "error_rate": float(row[3])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
