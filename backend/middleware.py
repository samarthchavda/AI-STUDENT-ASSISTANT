"""
Security Middleware for CodeCampus AI
Includes rate limiting, security headers, and request validation
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
from typing import Callable
import re

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Remove server header
        if "server" in response.headers:
            del response.headers["server"]
        
        return response


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Validate and sanitize incoming requests"""
    
    # Suspicious patterns that might indicate attacks
    SUSPICIOUS_PATTERNS = [
        r"<script[^>]*>.*?</script>",  # XSS
        r"javascript:",  # XSS
        r"on\w+\s*=",  # Event handlers
        r"union.*select",  # SQL injection
        r"drop\s+table",  # SQL injection
        r"insert\s+into",  # SQL injection
        r"\.\./",  # Path traversal
        r"\.\.\\",  # Path traversal
    ]
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Check request size (prevent large payload attacks)
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10_000_000:  # 10MB limit
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": "Request payload too large"}
            )
        
        # Validate content type for POST/PUT requests
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if not any(ct in content_type for ct in ["application/json", "multipart/form-data", "application/x-www-form-urlencoded"]):
                if content_type:  # Only check if content-type is provided
                    return JSONResponse(
                        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                        content={"detail": "Unsupported media type"}
                    )
        
        # Check for suspicious patterns in URL
        url_path = str(request.url.path)
        for pattern in self.SUSPICIOUS_PATTERNS:
            if re.search(pattern, url_path, re.IGNORECASE):
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"detail": "Invalid request"}
                )
        
        response = await call_next(request)
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log requests for monitoring (without sensitive data)"""
    
    SENSITIVE_HEADERS = ["authorization", "cookie", "x-api-key"]
    SENSITIVE_PATHS = ["/api/auth/login", "/api/auth/register"]
    
    async def dispatch(self, request: Request, call_next: Callable):
        start_time = time.time()
        
        # Log request (without sensitive data)
        method = request.method
        path = request.url.path
        client_ip = get_remote_address(request)
        
        # Don't log sensitive endpoints in detail
        if path not in self.SENSITIVE_PATHS:
            print(f"[REQUEST] {method} {path} from {client_ip}")
        else:
            print(f"[REQUEST] {method} {path} from {client_ip} (auth endpoint)")
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            print(f"[RESPONSE] {path} - Status: {response.status_code} - Time: {process_time:.3f}s")
            
            # Add processing time header
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            print(f"[ERROR] {path} - Error: {type(e).__name__} - Time: {process_time:.3f}s")
            raise


class IPBlockingMiddleware(BaseHTTPMiddleware):
    """Block suspicious IPs (can be extended with database)"""
    
    # In production, load this from database or config
    BLOCKED_IPS = set()
    
    async def dispatch(self, request: Request, call_next: Callable):
        client_ip = get_remote_address(request)
        
        if client_ip in self.BLOCKED_IPS:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Access denied"}
            )
        
        response = await call_next(request)
        return response


# Rate limit configurations for different endpoints
def get_rate_limit_key(request: Request) -> str:
    """Get rate limit key based on user or IP"""
    # Try to get user from token
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        # Use token as key for authenticated users
        return f"user:{auth_header}"
    
    # Use IP for unauthenticated users
    return f"ip:{get_remote_address(request)}"


# Rate limit decorator for routes
def rate_limit(limit: str):
    """
    Rate limit decorator
    Usage: @rate_limit("5/minute")
    """
    return limiter.limit(limit, key_func=get_rate_limit_key)

