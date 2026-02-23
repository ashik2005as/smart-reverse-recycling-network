from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BatteryBase(BaseModel):
    manufacturer: Optional[str] = None
    capacity_kwh: float
    voltage: Optional[float] = None
    current: Optional[float] = None
    current_soh: Optional[float] = None
    cycles: Optional[int] = None
    temperature: Optional[float] = None
    location: Optional[str] = None
    status: Optional[str] = "active"


class BatteryCreate(BatteryBase):
    pass


class BatteryResponse(BatteryBase):
    id: int
    digital_passport_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BatteryPredictRequest(BaseModel):
    voltage: float
    current: float
    temperature: float
    cycles: int
    capacity: float
    manufacturer: Optional[str] = None


class BatteryPredictResponse(BaseModel):
    soh: float                       # 0-100
    rul_cycles: int
    thermal_anomaly: bool
    recommendation: str
    confidence: float
    digital_passport_id: str
    carbon_credits: float
