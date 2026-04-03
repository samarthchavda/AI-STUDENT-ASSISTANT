"""Subscription access control helper"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import User, Subscription, PlanType

class SubscriptionAccess:
    """Helper class for checking subscription-based feature access"""
    
    @staticmethod
    def has_active_subscription(user: User, db: Session) -> bool:
        """Check if user has an active paid subscription"""
        if not user:
            return False
        
        # Check if user has PRO or BASIC plan
        if user.plan in [PlanType.PRO, PlanType.BASIC]:
            # Check if subscription is still valid
            subscription = db.query(Subscription).filter(
                Subscription.user_id == user.id,
                Subscription.status == 'active'
            ).order_by(Subscription.created_at.desc()).first()
            
            if subscription:
                # Check if not expired
                if subscription.expires_at and subscription.expires_at < datetime.utcnow():
                    subscription.status = 'expired'
                    user.plan = PlanType.FREE
                    db.commit()
                    return False
                return True
        
        return False
    
    @staticmethod
    def is_pro_user(user: User, db: Session) -> bool:
        """Check if user has PRO plan access"""
        if not user or user.plan != PlanType.PRO:
            return False
        
        return SubscriptionAccess.has_active_subscription(user, db)
    
    @staticmethod
    def is_basic_or_pro_user(user: User, db: Session) -> bool:
        """Check if user has BASIC or PRO plan access"""
        if not user or user.plan == PlanType.FREE:
            return False
        
        return SubscriptionAccess.has_active_subscription(user, db)
    
    @staticmethod
    def can_access_premium_resumes(user: User, db: Session) -> bool:
        """Check if user can access premium resume templates"""
        return SubscriptionAccess.is_pro_user(user, db)
    
    @staticmethod
    def can_access_unlimited_ai(user: User, db: Session) -> bool:
        """Check if user has unlimited AI queries"""
        return SubscriptionAccess.is_pro_user(user, db)
    
    @staticmethod
    def can_access_company_sheets(user: User, db: Session) -> bool:
        """Check if user can access company preparation sheets"""
        return SubscriptionAccess.is_basic_or_pro_user(user, db)
    
    @staticmethod
    def can_access_advanced_dsa(user: User, db: Session) -> bool:
        """Check if user can access advanced DSA features"""
        return SubscriptionAccess.is_pro_user(user, db)
    
    @staticmethod
    def can_access_mock_tests(user: User, db: Session) -> bool:
        """Check if user can access unlimited mock tests"""
        return SubscriptionAccess.is_basic_or_pro_user(user, db)
    
    @staticmethod
    def get_ai_query_limit(user: User, db: Session) -> int:
        """Get daily AI query limit for user"""
        if SubscriptionAccess.is_pro_user(user, db):
            return -1  # Unlimited
        elif user and user.plan == PlanType.BASIC:
            if SubscriptionAccess.has_active_subscription(user, db):
                return 100
        return 25  # Free tier
    
    @staticmethod
    def get_code_debug_limit(user: User, db: Session) -> int:
        """Get daily code debug limit for user"""
        if SubscriptionAccess.is_pro_user(user, db):
            return -1  # Unlimited
        elif user and user.plan == PlanType.BASIC:
            if SubscriptionAccess.has_active_subscription(user, db):
                return 5
        return 0  # Free tier has no code debugging
    
    @staticmethod
    def get_subscription_info(user: User, db: Session) -> dict:
        """Get detailed subscription information"""
        if not user:
            return {
                "plan": "free",
                "has_active_subscription": False,
                "features": {
                    "ai_queries_per_day": 25,
                    "code_debugs_per_day": 0,
                    "premium_resumes": False,
                    "company_sheets": False,
                    "advanced_dsa": False,
                    "unlimited_mock_tests": False
                }
            }
        
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == 'active'
        ).order_by(Subscription.created_at.desc()).first()
        
        has_active = SubscriptionAccess.has_active_subscription(user, db)
        
        return {
            "plan": user.plan.value if hasattr(user.plan, 'value') else str(user.plan).lower(),
            "has_active_subscription": has_active,
            "subscription_source": user.subscription_source or 'free',
            "expires_at": subscription.expires_at.isoformat() if subscription and subscription.expires_at else None,
            "days_remaining": (subscription.expires_at - datetime.utcnow()).days if subscription and subscription.expires_at else None,
            "features": {
                "ai_queries_per_day": SubscriptionAccess.get_ai_query_limit(user, db),
                "code_debugs_per_day": SubscriptionAccess.get_code_debug_limit(user, db),
                "premium_resumes": SubscriptionAccess.can_access_premium_resumes(user, db),
                "company_sheets": SubscriptionAccess.can_access_company_sheets(user, db),
                "advanced_dsa": SubscriptionAccess.can_access_advanced_dsa(user, db),
                "unlimited_mock_tests": SubscriptionAccess.can_access_mock_tests(user, db)
            }
        }
