from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


class MaterialRecoveryRequest(BaseModel):
    source_type: str            # battery / solar
    capacity: float             # kWh for battery, kWp for solar
    quantity: int = 1


class MaterialDetail(BaseModel):
    raw_kg: float
    recoverable_kg: float
    value_usd: float


class MaterialRecoveryResponse(BaseModel):
    source_type: str
    total_units: int
    materials: Dict[str, MaterialDetail]
    total_value_usd: float
    co2_saved_kg: float
    esg_carbon_credits: float


class MaterialRecoveryRecord(BaseModel):
    id: int
    source_type: str
    lithium_kg: float
    nickel_kg: float
    cobalt_kg: float
    silver_kg: float
    silicon_kg: float
    copper_kg: float
    economic_value_usd: float
    co2_saved_kg: float
    recycler: Optional[str] = None
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
