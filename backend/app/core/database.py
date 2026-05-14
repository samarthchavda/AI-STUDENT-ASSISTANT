from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine with appropriate settings for SQLite/PostgreSQL
if settings.database_url.startswith("sqlite"):
    # SQLite configuration (for local development)
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False, "timeout": 10},
        echo=False,
        pool_pre_ping=True,
        pool_recycle=3600
    )
else:
    # PostgreSQL configuration (for production)
    engine = create_engine(
        settings.database_url,
        pool_size=20,  # Number of connections to keep open (increased from 10)
        max_overflow=40,  # Additional connections when pool is full (doubled)
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,  # Recycle connections after 1 hour
        echo=False,  # Disable SQL logging for performance
        connect_args={"connect_timeout": 5}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
