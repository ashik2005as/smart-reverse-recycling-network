"""
Database connection setup with SQLAlchemy.
Falls back gracefully when PostgreSQL is not available (demo mode).
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import DATABASE_URL

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    _db_available = True
except Exception:
    engine = None
    SessionLocal = None
    _db_available = False

Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    if SessionLocal is None:
        # Demo mode — no database connected
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Call on startup."""
    if engine:
        Base.metadata.create_all(bind=engine)
