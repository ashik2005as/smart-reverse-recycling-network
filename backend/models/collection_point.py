from sqlalchemy import Column, Integer, String, Float, DateTime, func
from database import Base


class CollectionPoint(Base):
    """SQLAlchemy model for a physical waste collection point."""
    __tablename__ = "collection_points"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)          # max units
    current_load = Column(Integer, default=0)           # current units stored
    type = Column(String(50), default="mixed")          # battery / solar / mixed
    address = Column(String(300), nullable=True)
    contact = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
