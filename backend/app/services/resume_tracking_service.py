"""
Resume Tracking Service
Handles tracking of resume activity for admin analytics
"""
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import json


class ResumeTrackingService:
    """Service for tracking resume activity"""
    
    @staticmethod
    def track_resume_activity(
        db: Session,
        user_id: int,
        template_id: str,
        template_name: Optional[str] = None,
        template_tier: str = 'free',
        ats_score: Optional[int] = None,
        ai_generated: bool = False,
        resume_data: Optional[dict] = None
    ) -> int:
        """
        Track resume load/save/update activity
        Creates or updates resume_tracking record
        Returns: resume_tracking.id
        """
        try:
            # Check if record exists
            result = db.execute(
                text("""
                    SELECT id FROM resume_tracking 
                    WHERE user_id = :user_id AND template_id = :template_id
                    ORDER BY updated_at DESC
                    LIMIT 1
                """),
                {"user_id": user_id, "template_id": template_id}
            )
            existing = result.fetchone()
            
            if existing:
                # Update existing record
                resume_id = existing[0]
                update_query = """
                    UPDATE resume_tracking 
                    SET updated_at = CURRENT_TIMESTAMP
                """
                params = {"resume_id": resume_id}
                
                if template_name:
                    update_query += ", template_name = :template_name"
                    params["template_name"] = template_name
                
                if ats_score is not None:
                    update_query += ", ats_score = :ats_score"
                    params["ats_score"] = ats_score
                
                if resume_data:
                    update_query += ", resume_data = :resume_data::jsonb"
                    params["resume_data"] = json.dumps(resume_data)
                
                update_query += " WHERE id = :resume_id"
                
                db.execute(text(update_query), params)
                db.commit()
                
                return resume_id
            else:
                # Insert new record
                result = db.execute(
                    text("""
                        INSERT INTO resume_tracking 
                        (user_id, template_id, template_name, template_tier, ats_score, ai_generated, resume_data, created_at, updated_at)
                        VALUES (:user_id, :template_id, :template_name, :template_tier, :ats_score, :ai_generated, :resume_data::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        RETURNING id
                    """),
                    {
                        "user_id": user_id,
                        "template_id": template_id,
                        "template_name": template_name or template_id.replace('-', ' ').title(),
                        "template_tier": template_tier,
                        "ats_score": ats_score or 0,
                        "ai_generated": ai_generated,
                        "resume_data": json.dumps(resume_data) if resume_data else None
                    }
                )
                resume_id = result.fetchone()[0]
                db.commit()
                
                return resume_id
                
        except Exception as e:
            db.rollback()
            print(f"❌ Resume tracking error: {e}")
            # Don't fail the main operation if tracking fails
            return -1
    
    @staticmethod
    def track_pdf_export(
        db: Session,
        user_id: int,
        template_id: str
    ) -> bool:
        """
        Track PDF export/download
        Increments pdf_export_count for the resume
        Returns: success status
        """
        try:
            # Find the most recent resume for this user and template
            result = db.execute(
                text("""
                    UPDATE resume_tracking 
                    SET pdf_export_count = pdf_export_count + 1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = (
                        SELECT id FROM resume_tracking 
                        WHERE user_id = :user_id AND template_id = :template_id
                        ORDER BY updated_at DESC
                        LIMIT 1
                    )
                    RETURNING id
                """),
                {"user_id": user_id, "template_id": template_id}
            )
            
            if result.fetchone():
                db.commit()
                return True
            else:
                # No existing record, create one with export count
                db.execute(
                    text("""
                        INSERT INTO resume_tracking 
                        (user_id, template_id, template_name, pdf_export_count, created_at, updated_at)
                        VALUES (:user_id, :template_id, :template_name, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    """),
                    {
                        "user_id": user_id,
                        "template_id": template_id,
                        "template_name": template_id.replace('-', ' ').title()
                    }
                )
                db.commit()
                return True
                
        except Exception as e:
            db.rollback()
            print(f"❌ PDF export tracking error: {e}")
            return False

    
    @staticmethod
    def track_ai_generation(
        db: Session,
        user_id: int,
        request_type: str,
        status: str,
        response_time_ms: Optional[int] = None,
        error_message: Optional[str] = None
    ) -> bool:
        """
        Track AI generation request
        Logs to ai_generation_logs table
        
        Args:
            user_id: User ID
            request_type: 'summary', 'project', 'experience', 'template_recommendation', 'enhance_section', 'suggest_skills'
            status: 'success' or 'failed'
            response_time_ms: Response time in milliseconds
            error_message: Error message if failed
        
        Returns: success status
        """
        try:
            db.execute(
                text("""
                    INSERT INTO ai_generation_logs 
                    (user_id, module, request_type, status, response_time_ms, error_message, created_at)
                    VALUES (:user_id, 'resume', :request_type, :status, :response_time_ms, :error_message, CURRENT_TIMESTAMP)
                """),
                {
                    "user_id": user_id,
                    "request_type": request_type,
                    "status": status,
                    "response_time_ms": response_time_ms,
                    "error_message": error_message
                }
            )
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            print(f"❌ AI generation tracking error: {e}")
            return False


# Singleton instance
resume_tracking_service = ResumeTrackingService()
