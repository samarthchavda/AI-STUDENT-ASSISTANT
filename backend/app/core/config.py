from pydantic_settings import BaseSettings
from pydantic import field_validator
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

class Settings(BaseSettings):
    # App
    app_name: str = "AI Student Assistant"
    app_version: str = "1.0.0"
    environment: str = "development"
    
    # Database
    database_url: str
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours
    
    # Google OAuth
    google_client_id: str = ""

    # Frontend / CORS
    frontend_urls: str = ""
    
    # AI APIs (Only Gemini is used)
    gemini_api_key: str = ""
    
    # Payment
    stripe_api_key: str = ""
    stripe_webhook_secret: str = ""
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    # Email / SMTP (for OTP delivery)
    mail_server: str = "smtp.gmail.com"
    mail_port: int = 587
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = ""
    mail_from_name: str = "CodeCampus AI"
    
    # Code Execution (Judge0)
    use_mock_execution: str = "true"
    judge0_api_key: str = ""
    judge0_api_url: str = "https://judge0-ce.p.rapidapi.com"
    use_rapidapi: str = "false"

    @field_validator("google_client_id", "frontend_urls", mode="before")
    @classmethod
    def strip_env_values(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value
    
    class Config:
        env_file = str(ENV_FILE)
        env_file_encoding = "utf-8"

settings = Settings()
