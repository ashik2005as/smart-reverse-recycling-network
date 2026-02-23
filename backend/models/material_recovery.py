from sqlalchemy import Column, Integer, String, Float, DateTime, func
from database import Base


class MaterialRecovery(Base):
    """SQLAlchemy model for a material recovery record."""
    __tablename__ = "material_recovery_records"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String(50), nullable=False)    # battery / solar
    source_id = Column(Integer, nullable=True)          # FK to battery or solar panel
    lithium_kg = Column(Float, default=0.0)
    nickel_kg = Column(Float, default=0.0)
    cobalt_kg = Column(Float, default=0.0)
    silver_kg = Column(Float, default=0.0)
    silicon_kg = Column(Float, default=0.0)
    copper_kg = Column(Float, default=0.0)
    manganese_kg = Column(Float, default=0.0)
    economic_value_usd = Column(Float, default=0.0)
    co2_saved_kg = Column(Float, default=0.0)
    recycler = Column(String(200), nullable=True)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
