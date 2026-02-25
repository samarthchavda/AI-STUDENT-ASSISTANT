from pydantic_settings import BaseSettings

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
    access_token_expire_minutes: int = 30
    
    # Google OAuth
    google_client_id: str = ""
    
    # AI APIs
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    
    # Payment
    stripe_api_key: str = ""
    stripe_webhook_secret: str = ""
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
