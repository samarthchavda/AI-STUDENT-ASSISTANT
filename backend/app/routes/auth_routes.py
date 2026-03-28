from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta, datetime
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.database import get_db
from app.models import User as UserModel, RefreshToken, TokenBlacklist, PasswordResetOTP, PlanType
from app.models.schemas import UserCreate, UserLogin, User, Token, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest, UserProfileUpdate
from app.core.email import send_otp_email, send_welcome_email
import hmac
import hashlib
import logging
from app.core.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_password_strength,
    normalize_email,
    is_account_locked,
    handle_failed_login,
    reset_failed_login_attempts,
    blacklist_token,
    get_current_user
)
from app.core.config import settings
from pydantic import BaseModel
from app.core.middleware import rate_limit
import secrets
import asyncio
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

# Thread pool for background tasks
executor = ThreadPoolExecutor(max_workers=4)


async def get_or_create_google_user(db: Session, email: str, name: str) -> tuple[UserModel, bool]:
    """
    Optimized get_or_create for Google OAuth users.
    Returns (user, is_new_user)
    
    Uses database index on (email, auth_provider) for fast lookup.
    """
    # Fast indexed lookup
    user = db.query(UserModel).filter(UserModel.email == email).first()
    
    if user:
        return user, False
    
    # Create new user
    user = UserModel(
        email=email,
        name=name,
        hashed_password=None,
        is_google_user=True,
        auth_provider="google"
    )
    db.add(user)
    db.flush()  # Get ID without full commit
    return user, True


async def validate_google_token_async(credential: str, client_id: str) -> dict:
    """
    Async wrapper for Google token validation.
    Runs in thread pool to avoid blocking the event loop.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        executor,
        lambda: id_token.verify_oauth2_token(credential, requests.Request(), client_id)
    )



def _user_plan_value(user: UserModel) -> str:
    plan = getattr(user, "plan", None)
    if hasattr(plan, "value"):
        return plan.value
    if isinstance(plan, str) and plan:
        return plan
    return PlanType.FREE.value


def _hash_otp(otp: str) -> str:
    """Return the HMAC-SHA256 hex digest of an OTP using the app secret key."""
    return hmac.new(
        settings.secret_key.encode(), otp.encode(), hashlib.sha256
    ).hexdigest()

class GoogleAuthRequest(BaseModel):
    credential: str


@router.post("/register", response_model=Token)
@rate_limit("5/minute")  # Strict rate limit for registration
async def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with password strength validation"""
    
    # Normalize email
    normalized_email = normalize_email(user.email)
    
    # Check if user exists
    db_user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate password strength
    is_valid, message = validate_password_strength(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        email=normalized_email,
        name=user.name,
        hashed_password=hashed_password,
        auth_provider="local"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send welcome email (non-blocking - don't fail registration if email fails)
    try:
        send_welcome_email(normalized_email, user.name)
    except Exception as e:
        logger.error(f"Failed to send welcome email to {normalized_email}: {e}")
        # Continue with registration even if email fails
    
    # Generate tokens
    access_token = create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id},
        expires_delta=timedelta(minutes=15)
    )
    
    refresh_token_str, refresh_expires = create_refresh_token(
        data={"sub": db_user.email, "user_id": db_user.id}
    )
    
    # Store refresh token in database
    refresh_token_obj = RefreshToken(
        user_id=db_user.id,
        token=refresh_token_str,
        expires_at=refresh_expires
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name,
                "plan_type": _user_plan_value(db_user),
            "is_admin": db_user.is_admin,
            "solutions_viewed": db_user.solutions_viewed
        }
    }


@router.post("/login", response_model=Token)
@rate_limit("10/minute")  # Strict rate limit for login to prevent brute force
async def login(request: Request, user_login: UserLogin, db: Session = Depends(get_db)):
    """Login user with account locking after 5 failed attempts"""
    
    # Normalize email
    normalized_email = normalize_email(user_login.email)
    
    user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
    
    if not user:
        # Security: Don't reveal whether email exists
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # If password hash is missing, this is a Google sign-up account
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account was created with Google. Please use 'Sign in with Google' to login."
        )
    
    # Check if account is locked
    is_locked, lock_message = is_account_locked(user)
    if is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=lock_message
        )
    
    # Verify password only for local accounts with a stored password hash
    if not verify_password(user_login.password, user.hashed_password):
        # Handle failed login attempt
        handle_failed_login(user, db)
        
        # Security: Don't reveal whether email exists or password is wrong
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Reset failed login attempts on successful login
    reset_failed_login_attempts(user, db)
    
    # Generate tokens
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=15)
    )
    
    refresh_token_str, refresh_expires = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    # Store refresh token in database
    refresh_token_obj = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=refresh_expires
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan_type": _user_plan_value(user),
            "is_admin": user.is_admin,
            "phone": getattr(user, 'phone', None),
            "phone_verified": getattr(user, 'phone_verified', False),
            "college": getattr(user, 'college', None),
            "branch": getattr(user, 'branch', None),
            "cgpa": getattr(user, 'cgpa', None),
            "graduation_year": getattr(user, 'graduation_year', None),
            "linkedin_url": getattr(user, 'linkedin_url', None),
            "github_url": getattr(user, 'github_url', None),
            "solutions_viewed": getattr(user, 'solutions_viewed', 0)
        }
    }


@router.post("/refresh", response_model=Token)
@rate_limit("20/minute")
async def refresh_access_token(
    request: Request,
    refresh_request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    Access Token: 15 minutes
    Refresh Token: 7 days
    """
    
    # Decode refresh token
    payload = decode_token(refresh_request.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Verify token type
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    # Check if refresh token exists and is not revoked
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_request.refresh_token,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or revoked"
        )
    
    # Get user
    user = db.query(UserModel).filter(UserModel.id == refresh_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Generate new access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=15)
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_request.refresh_token,  # Return same refresh token
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan_type": _user_plan_value(user),
            "is_admin": user.is_admin,
            "solutions_viewed": getattr(user, 'solutions_viewed', 0)
        }
    }


@router.post("/logout")
@rate_limit("10/minute")
async def logout(
    request: Request,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout user by blacklisting access token and revoking refresh tokens
    """
    
    # Get access token from request
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    access_token = auth_header.split(" ")[1]
    
    # Decode token to get expiration
    payload = decode_token(access_token)
    if payload and "exp" in payload:
        expires_at = datetime.fromtimestamp(payload["exp"])
        
        # Blacklist access token
        blacklist_token(access_token, expires_at, db)
    
    # Revoke all refresh tokens for this user
    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.revoked == False
    ).update({"revoked": True})
    
    db.commit()
    
    return {
        "message": "Successfully logged out",
        "detail": "All tokens have been revoked"
    }


@router.post("/google", response_model=Token)
@rate_limit("10/minute")  # Rate limit for Google OAuth
async def google_auth(
    request: Request, 
    auth_data: GoogleAuthRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    ⚡ OPTIMIZED Google OAuth - Instant Login
    
    Performance optimizations:
    1. Async token validation (non-blocking)
    2. Fast indexed database lookup
    3. Single database commit
    4. Background email sending (after response)
    5. JWT generation from secure .env secret
    
    Expected response time: <500ms
    """
    try:
        if not settings.google_client_id:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google OAuth is not configured on server. Set GOOGLE_CLIENT_ID in backend/.env and restart backend."
            )

        # Async token validation - runs in thread pool to avoid blocking
        idinfo = await validate_google_token_async(
            auth_data.credential,
            settings.google_client_id
        )
        
        # Extract user info from validated token
        email = idinfo.get('email')
        name = idinfo.get('name', '')
        google_id = idinfo.get('sub')
        picture = idinfo.get('picture')  # For future profile picture sync
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google account")
        
        # Normalize email
        normalized_email = normalize_email(email)
        
        # Fast get_or_create with indexed lookup
        user, is_new_user = await get_or_create_google_user(db, normalized_email, name)
        
        # Generate JWT tokens (fast, in-memory, uses SECRET_KEY from .env)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=timedelta(minutes=15)
        )
        
        refresh_token_str, refresh_expires = create_refresh_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        # Store refresh token
        refresh_token_obj = RefreshToken(
            user_id=user.id,
            token=refresh_token_str,
            expires_at=refresh_expires
        )
        db.add(refresh_token_obj)
        
        # Single optimized commit
        db.commit()
        
        # Background tasks - executed AFTER response is sent to client
        if is_new_user:
            background_tasks.add_task(send_welcome_email, normalized_email, name)
        
        # Future: Sync profile picture in background
        # if picture:
        #     background_tasks.add_task(sync_google_profile_picture, user.id, picture)
        
        # Instant response - user sees dashboard immediately
        return {
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "plan_type": _user_plan_value(user),
                "is_admin": user.is_admin,
                "phone": getattr(user, 'phone', None),
                "phone_verified": getattr(user, 'phone_verified', False),
                "college": getattr(user, 'college', None),
                "branch": getattr(user, 'branch', None),
                "cgpa": getattr(user, 'cgpa', None),
                "graduation_year": getattr(user, 'graduation_year', None),
                "linkedin_url": getattr(user, 'linkedin_url', None),
                "github_url": getattr(user, 'github_url', None),
                "solutions_viewed": getattr(user, 'solutions_viewed', 0)
            }
        }
        
    except HTTPException:
        raise
    except ValueError:
        # Invalid token or audience mismatch
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google authentication token. Check Google OAuth Client ID match in frontend and backend."
        )
    except Exception as e:
        # Log error internally but don't expose details to user
        print(f"[SECURITY] Google auth error: {type(e).__name__}")  # Log error type only, not details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed"
        )


@router.get("/me")
async def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    """Get current authenticated user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "plan_type": _user_plan_value(current_user),
        "is_admin": current_user.is_admin,
        "auth_provider": current_user.auth_provider,
        "phone": getattr(current_user, 'phone', None),
        "phone_verified": getattr(current_user, 'phone_verified', False),
        "college": getattr(current_user, 'college', None),
        "branch": getattr(current_user, 'branch', None),
        "cgpa": getattr(current_user, 'cgpa', None),
        "graduation_year": getattr(current_user, 'graduation_year', None),
        "linkedin_url": getattr(current_user, 'linkedin_url', None),
        "github_url": getattr(current_user, 'github_url', None),
        "created_at": current_user.created_at
    }


@router.put("/user/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    try:
        # Update only provided fields - use setattr to handle missing columns gracefully
        if profile_data.phone is not None:
            setattr(current_user, 'phone', profile_data.phone)
        if profile_data.college is not None:
            setattr(current_user, 'college', profile_data.college)
        if profile_data.branch is not None:
            setattr(current_user, 'branch', profile_data.branch)
        if profile_data.cgpa is not None:
            setattr(current_user, 'cgpa', profile_data.cgpa)
        if profile_data.graduation_year is not None:
            setattr(current_user, 'graduation_year', profile_data.graduation_year)
        if profile_data.linkedin_url is not None:
            setattr(current_user, 'linkedin_url', profile_data.linkedin_url)
        if profile_data.github_url is not None:
            setattr(current_user, 'github_url', profile_data.github_url)
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "name": current_user.name,
                "plan_type": _user_plan_value(current_user),
                "is_admin": current_user.is_admin,
                "phone": getattr(current_user, 'phone', None),
                "phone_verified": getattr(current_user, 'phone_verified', False),
                "college": getattr(current_user, 'college', None),
                "branch": getattr(current_user, 'branch', None),
                "cgpa": getattr(current_user, 'cgpa', None),
                "graduation_year": getattr(current_user, 'graduation_year', None),
                "linkedin_url": getattr(current_user, 'linkedin_url', None),
                "github_url": getattr(current_user, 'github_url', None)
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


# ---------------------------------------------------------------------------
# Forgot-password / Reset-password (OTP-based)
# ---------------------------------------------------------------------------

@router.post("/forgot-password")
@rate_limit("5/minute")
async def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Generate a 6-digit OTP, store it (HMAC-hashed) with a 10-minute expiry,
    and email it to the user.

    Always returns the same response to avoid leaking whether an email exists.
    Users from any auth provider can reset via OTP to set/update a password.
    """
    normalized_email = normalize_email(body.email)
    user = db.query(UserModel).filter(UserModel.email == normalized_email).first()

    if user:
        otp = str(secrets.randbelow(900_000) + 100_000)  # 100000–999999

        # Invalidate any previous unused OTPs for this email
        db.query(PasswordResetOTP).filter(
            PasswordResetOTP.email == normalized_email,
            PasswordResetOTP.used == False,
        ).update({"used": True})

        otp_entry = PasswordResetOTP(
            email=normalized_email,
            otp_hash=_hash_otp(otp),
            expires_at=datetime.utcnow() + timedelta(minutes=10),
        )
        db.add(otp_entry)
        db.commit()

        try:
            send_otp_email(normalized_email, otp)
        except RuntimeError:
            # Email delivery failed — roll back the OTP so the user can retry
            db.delete(otp_entry)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not deliver OTP email. Please try again later.",
            )

    # Always return the same message (don't reveal whether the email exists)
    return {"message": "If this email is registered, you will receive an OTP shortly."}


@router.post("/reset-password")
@rate_limit("10/minute")
async def reset_password(
    request: Request,
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Verify the OTP submitted by the user, check expiry, then update the
    password (hashed) in the database and mark the OTP as used.
    """
    normalized_email = normalize_email(body.email)

    # Find the most-recent valid (unused, non-expired) OTP for this email
    otp_entry = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.email == normalized_email,
            PasswordResetOTP.used == False,
            PasswordResetOTP.expires_at > datetime.utcnow(),
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )

    # Constant-time comparison to prevent timing attacks
    if not otp_entry or not hmac.compare_digest(
        otp_entry.otp_hash, _hash_otp(body.otp)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    # Validate new password strength
    is_valid, message = validate_password_strength(body.new_password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    user.hashed_password = get_password_hash(body.new_password)
    otp_entry.used = True
    db.commit()

    return {"message": "Password updated successfully."}
