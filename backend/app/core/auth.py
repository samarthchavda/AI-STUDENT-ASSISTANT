from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from passlib.hash import pbkdf2_sha256
from app.core.config import settings
import re
import secrets

security = HTTPBearer()
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    deprecated="auto",
    bcrypt__truncate_error=False,
)

# Password validation regex
PASSWORD_REGEX = re.compile(
    r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
)

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength
    Requirements:
    - Minimum 8 characters
    - At least 1 letter
    - At least 1 number
    - At least 1 special character (@$!%*#?&)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[@$!%*#?&]', password):
        return False, "Password must contain at least one special character (@$!%*#?&)"
    
    return True, "Password is strong"


def normalize_email(email: str) -> str:
    """Normalize email to lowercase and strip whitespace"""
    return email.lower().strip()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash with extra safety"""
    # 1. Check if hashed_password exists (Google users don't have it)
    if not hashed_password:
        print("[AUTH] No hashed password found for this user.")
        return False
        
    try:
        # 2. Use pwd_context to verify
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # 3. Log the error if bcrypt/passlib fails
        print(f"[AUTH] Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash password with safety check for bcrypt 72-byte limit"""
    # UTF-8 encoding check jaruri che karan ke special chars vadhare jagya roke
    pw_bytes = password.encode('utf-8')
    if len(pw_bytes) > 72:
        password = password[:72]
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token (short-lived: 15 minutes)"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def create_refresh_token(data: dict) -> tuple[str, datetime]:
    """Create JWT refresh token (long-lived: 7 days)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt, expire


def decode_token(token: str):
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None


def is_token_blacklisted(token: str, db: Session) -> bool:
    """Check if token is blacklisted"""
    from app.models import TokenBlacklist
    
    blacklisted = db.query(TokenBlacklist).filter(
        TokenBlacklist.token == token,
        TokenBlacklist.expires_at > datetime.utcnow()
    ).first()
    
    return blacklisted is not None


def blacklist_token(token: str, expires_at: datetime, db: Session):
    """Add token to blacklist"""
    from app.models import TokenBlacklist
    
    blacklisted_token = TokenBlacklist(
        token=token,
        expires_at=expires_at
    )
    db.add(blacklisted_token)
    db.commit()


def is_account_locked(user) -> tuple[bool, Optional[str]]:
    """Check if user account is locked due to failed login attempts"""
    if user.account_locked_until and user.account_locked_until > datetime.utcnow():
        remaining = (user.account_locked_until - datetime.utcnow()).total_seconds() / 60
        return True, f"Account locked. Try again in {int(remaining)} minutes"
    return False, None


def handle_failed_login(user, db: Session):
    """Handle failed login attempt - lock account after 5 failures"""
    current_attempts = user.failed_login_attempts or 0
    user.failed_login_attempts = current_attempts + 1
    
    if user.failed_login_attempts >= 5:
        # Lock account for 15 minutes
        user.account_locked_until = datetime.utcnow() + timedelta(minutes=15)
        user.failed_login_attempts = 0  # Reset counter
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account locked due to too many failed login attempts. Try again in 15 minutes."
        )
    
    db.commit()


def reset_failed_login_attempts(user, db: Session):
    """Reset failed login attempts on successful login"""
    user.failed_login_attempts = 0
    user.account_locked_until = None
    db.commit()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current user from JWT token"""
    from app.core.database import SessionLocal
    from app.models import User
    
    db = SessionLocal()
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        
        # Check if token is blacklisted
        if is_token_blacklisted(token, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        
        # Verify token type
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    db.close()
    
    # Return user object
    return user


def require_admin(current_user = Depends(get_current_user)):
    """Require admin role for endpoint access"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
