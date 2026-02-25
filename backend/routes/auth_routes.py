from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
from database import get_db
from models import User as UserModel
from schemas import UserCreate, UserLogin, User, Token
from auth import verify_password, get_password_hash, create_access_token
from config import settings
from pydantic import BaseModel
import secrets

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class GoogleAuthRequest(BaseModel):
    credential: str

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
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
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    user = db.query(UserModel).filter(UserModel.email == user_login.email).first()
    
    if not user or not verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan_type": user.plan.value,
            "is_admin": user.is_admin
        }
    }

@router.post("/google", response_model=Token)
def google_auth(auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
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
        
        # Check if user exists
        user = db.query(UserModel).filter(UserModel.email == email).first()
        
        if not user:
            # Create new user with Google OAuth
            # For Google users, use a simple marker since they never use password auth
            user = UserModel(
                email=email,
                name=name,
                hashed_password="GOOGLE_OAUTH_USER",  # Marker for Google users
                is_google_user=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
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
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )
