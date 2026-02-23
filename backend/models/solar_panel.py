from sqlalchemy import Column, Integer, String, Float, DateTime, func
from database import Base


class SolarPanel(Base):
    """SQLAlchemy model for Solar Panel asset."""
    __tablename__ = "solar_panels"

    id = Column(Integer, primary_key=True, index=True)
    manufacturer = Column(String(100), nullable=True)
    capacity_kw = Column(Float, nullable=False)          # kWp
    efficiency = Column(Float, nullable=True)            # %
    age_years = Column(Float, nullable=True)
    location = Column(String(200), nullable=True)
    temperature = Column(Float, nullable=True)           # avg ambient °C
    degradation_score = Column(Float, nullable=True)     # 0-100
    status = Column(String(50), default="active")        # active / decommissioned / recycled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
