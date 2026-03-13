from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from google.oauth2 import id_token
from google.auth.transport import requests
from database import get_db
from models import User as UserModel, RefreshToken, TokenBlacklist
from schemas import UserCreate, UserLogin, User, Token, RefreshTokenRequest
from auth import (
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
from config import settings
from pydantic import BaseModel
from middleware import rate_limit
import secrets

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

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
            "plan_type": db_user.plan.value,
            "is_admin": db_user.is_admin
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
    
    # Check if account is locked
    is_locked, lock_message = is_account_locked(user)
    if is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=lock_message
        )
    
    # Verify password
    if not user.hashed_password or not verify_password(user_login.password, user.hashed_password):
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
            "plan_type": user.plan.value,
            "is_admin": user.is_admin
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
            "plan_type": user.plan.value,
            "is_admin": user.is_admin
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
async def google_auth(request: Request, auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate user with Google OAuth"""
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            auth_data.credential, 
            requests.Request(), 
            settings.google_client_id
        )
        
        # Get user info from Google
        email = idinfo.get('email')
        name = idinfo.get('name', '')
        google_id = idinfo.get('sub')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google account")
        
        # Normalize email
        normalized_email = normalize_email(email)
        
        # Check if user exists
        user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
        
        if not user:
            # Create new user with Google OAuth
            user = UserModel(
                email=normalized_email,
                name=name,
                hashed_password=None,  # No password for OAuth users
                is_google_user=True,
                auth_provider="google"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
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
                "plan_type": user.plan.value,
                "is_admin": user.is_admin
            }
        }
        
    except ValueError as e:
        # Invalid token - don't expose internal error details
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        # Log error internally but don't expose details to user
        print(f"[SECURITY] Google auth error: {type(e).__name__}")  # Log error type only, not details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )


@router.get("/me")
async def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    """Get current authenticated user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "plan_type": current_user.plan.value,
        "is_admin": current_user.is_admin,
        "auth_provider": current_user.auth_provider,
        "created_at": current_user.created_at
    }
