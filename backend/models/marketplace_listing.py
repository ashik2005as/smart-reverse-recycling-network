from sqlalchemy import Column, Integer, String, Float, DateTime, func
from database import Base


class MarketplaceListing(Base):
    """SQLAlchemy model for a marketplace listing."""
    __tablename__ = "marketplace_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    type = Column(String(50), nullable=False)           # battery / solar / pickup
    description = Column(String(1000), nullable=True)
    price = Column(Float, nullable=True)                # INR, 0 = free
    condition = Column(String(100), nullable=True)
    seller = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    quantity = Column(Integer, default=1)
    status = Column(String(50), default="available")    # available / sold / recycling_ready / service
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
