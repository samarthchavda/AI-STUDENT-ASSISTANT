from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.core.auth import require_admin
from app.core.database import get_db

router = APIRouter(prefix="/tracking", tags=["Engagement Metrics"])

# Admin Endpoints
@router.get("/admin/engagement/dau-wau-mau")
async def get_dau_wau_mau(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get DAU/WAU/MAU metrics"""
    try:
        db.execute(text("SELECT refresh_dau_wau_mau_metrics()"))
        
        query = text("""
            SELECT 
                metric_date,
                dau,
                wau,
                mau,
                stickiness_ratio,
                avg_sessions_per_user,
                avg_time_per_user
            FROM dau_wau_mau_metrics
            WHERE metric_date >= CURRENT_DATE - INTERVAL ':days days'
            ORDER BY metric_date DESC
        """)
        
        results = db.execute(query, {'days': days}).fetchall()
        
        data = [
            {
                "date": row[0].isoformat(),
                "dau": int(row[1]) if row[1] else 0,
                "wau": int(row[2]) if row[2] else 0,
                "mau": int(row[3]) if row[3] else 0,
                "stickiness_ratio": float(row[4]) if row[4] else 0,
                "avg_sessions": float(row[5]) if row[5] else 0,
                "avg_time": float(row[6]) if row[6] else 0
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/engagement/summary")
async def get_engagement_summary(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get engagement summary stats"""
    try:
        db.execute(text("SELECT refresh_dau_wau_mau_metrics()"))
        
        query = text("""
            SELECT 
                dau,
                wau,
                mau,
                stickiness_ratio
            FROM dau_wau_mau_metrics
            ORDER BY metric_date DESC
            LIMIT 1
        """)
        
        result = db.execute(query).fetchone()
        
        if not result:
            return {"dau": 0, "wau": 0, "mau": 0, "stickiness_ratio": 0}
        
        return {
            "dau": int(result[0]) if result[0] else 0,
            "wau": int(result[1]) if result[1] else 0,
            "mau": int(result[2]) if result[2] else 0,
            "stickiness_ratio": float(result[3]) if result[3] else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/engagement/churn-risk")
async def get_churn_risk_users(
    limit: int = 50,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get users at risk of churning"""
    try:
        query = text("""
            SELECT 
                user_id,
                name,
                email,
                plan,
                days_inactive,
                total_active_days,
                avg_sessions_per_day,
                avg_time_per_day,
                churn_risk_score,
                churn_risk_level,
                last_active_date
            FROM churn_risk_users
            ORDER BY churn_risk_score DESC
            LIMIT :limit
        """)
        
        results = db.execute(query, {'limit': limit}).fetchall()
        
        data = [
            {
                "user_id": int(row[0]),
                "name": row[1],
                "email": row[2],
                "plan": row[3],
                "days_inactive": int(row[4]) if row[4] else 0,
                "total_active_days": int(row[5]) if row[5] else 0,
                "avg_sessions_per_day": float(row[6]) if row[6] else 0,
                "avg_time_per_day": float(row[7]) if row[7] else 0,
                "churn_risk_score": int(row[8]) if row[8] else 0,
                "churn_risk_level": row[9],
                "last_active_date": row[10].isoformat() if row[10] else None
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/engagement/retention-cohorts")
async def get_retention_cohorts(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get retention cohort analysis"""
    try:
        query = text("""
            SELECT 
                cohort_week,
                cohort_size,
                weeks_since_signup,
                active_users,
                retention_rate
            FROM retention_cohorts
            WHERE cohort_week >= CURRENT_DATE - INTERVAL '12 weeks'
            ORDER BY cohort_week DESC, weeks_since_signup
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "cohort_week": row[0].isoformat() if row[0] else None,
                "cohort_size": int(row[1]),
                "weeks_since_signup": int(row[2]),
                "active_users": int(row[3]),
                "retention_rate": float(row[4])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/engagement/feature-adoption")
async def get_feature_adoption(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get feature adoption rates"""
    try:
        query = text("""
            SELECT 
                feature_name,
                users_count,
                usage_count,
                adoption_rate,
                avg_uses_per_user
            FROM feature_adoption_rates
            ORDER BY adoption_rate DESC
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "feature_name": row[0],
                "users_count": int(row[1]),
                "usage_count": int(row[2]),
                "adoption_rate": float(row[3]),
                "avg_uses_per_user": float(row[4])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/engagement/user-segments")
async def get_user_segments(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user engagement segments"""
    try:
        query = text("""
            SELECT 
                engagement_segment,
                COUNT(*) as user_count,
                ROUND(AVG(engagement_score), 2) as avg_score,
                ROUND(AVG(active_days_last_30), 2) as avg_active_days
            FROM user_engagement_segments
            GROUP BY engagement_segment
            ORDER BY 
                CASE engagement_segment
                    WHEN 'Power User' THEN 1
                    WHEN 'Active User' THEN 2
                    WHEN 'Regular User' THEN 3
                    WHEN 'Casual User' THEN 4
                    ELSE 5
                END
        """)
        
        results = db.execute(query).fetchall()
        
        data = [
            {
                "segment": row[0],
                "user_count": int(row[1]),
                "avg_score": float(row[2]),
                "avg_active_days": float(row[3])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
