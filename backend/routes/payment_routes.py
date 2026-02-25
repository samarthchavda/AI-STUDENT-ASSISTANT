from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import PaymentCheckoutRequest, PaymentVerifyRequest
from config import settings
import json

router = APIRouter(prefix="/api/payment", tags=["Payment"])

# Demo payment plans
PLANS = {
    "free": {"name": "Free", "price": 0, "currency": "INR"},
    "basic": {"name": "Basic", "monthly": 299, "yearly": 2999, "currency": "INR"},
    "pro": {"name": "Pro", "monthly": 599, "yearly": 5999, "currency": "INR"}
}

@router.get("/plans")
def get_plans():
    """Get all available plans"""
    return {
        "plans": PLANS,
        "note": "Demo pricing - Configure Stripe/Razorpay in production"
    }

@router.post("/checkout")
def create_checkout(request: PaymentCheckoutRequest, db: Session = Depends(get_db)):
    """
    Create payment checkout session
    DEMO MODE - Using demo API keys
    """
    plan = PLANS.get(request.plan)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # In production, create actual Stripe/Razorpay session:
    # import stripe
    # stripe.api_key = settings.stripe_api_key
    # session = stripe.checkout.Session.create(...)
    
    # Demo response
    return {
        "status": "success",
        "sessionId": f"demo_session_{request.plan}_{request.paymentMethod}",
        "checkoutUrl": "https://demo-payment-url.com",
        "plan": request.plan,
        "amount": plan.get("monthly", 0) if "monthly" in plan else 0,
        "currency": plan.get("currency", "INR"),
        "note": "DEMO MODE - Using demo API keys. Configure real Stripe/Razorpay keys in .env",
        "demoKeys": {
            "stripe": settings.stripe_api_key,
            "razorpay": settings.razorpay_key_id
        }
    }

@router.post("/verify")
def verify_payment(request: PaymentVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify payment after completion
    DEMO MODE
    """
    # In production, verify with payment provider:
    # session = stripe.checkout.Session.retrieve(request.sessionId)
    
    # Demo response
    return {
        "status": "verified",
        "sessionId": request.sessionId,
        "paymentStatus": "completed",
        "note": "Demo verification - would check actual payment status in production"
    }

@router.post("/webhook")
async def payment_webhook(payload: dict):
    """
    Handle payment provider webhooks
    DEMO MODE
    """
    # In production:
    # Verify webhook signature
    # Update database based on payment status
    # Send confirmation emails
    
    return {
        "status": "received",
        "note": "Demo webhook handler"
    }
