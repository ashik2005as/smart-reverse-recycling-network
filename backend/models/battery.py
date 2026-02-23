from sqlalchemy import Column, Integer, String, Float, DateTime, func
from database import Base


class Battery(Base):
    """SQLAlchemy model for EV Battery asset."""
    __tablename__ = "batteries"

    id = Column(Integer, primary_key=True, index=True)
    manufacturer = Column(String(100), nullable=True)
    capacity_kwh = Column(Float, nullable=False)        # kWh
    voltage = Column(Float, nullable=True)              # Volts
    current = Column(Float, nullable=True)              # Amperes
    current_soh = Column(Float, nullable=True)          # State of Health 0-100
    cycles = Column(Integer, nullable=True)             # Charge cycles
    temperature = Column(Float, nullable=True)          # °C
    location = Column(String(200), nullable=True)
    status = Column(String(50), default="active")       # active / recycled / second-life
    digital_passport_id = Column(String(20), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
