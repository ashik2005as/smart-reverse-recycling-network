from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SolarPanelBase(BaseModel):
    manufacturer: Optional[str] = None
    capacity_kw: float
    efficiency: Optional[float] = None
    age_years: Optional[float] = None
    location: Optional[str] = None
    temperature: Optional[float] = None
    degradation_score: Optional[float] = None
    status: Optional[str] = "active"


class SolarPanelCreate(SolarPanelBase):
    pass


class SolarPanelResponse(SolarPanelBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SolarPredictRequest(BaseModel):
    efficiency: float
    age_years: float
    temperature: float
    capacity_kw: float
    location: Optional[str] = None
    manufacturer: Optional[str] = None


class SolarPredictResponse(BaseModel):
    degradation_score: float
    current_efficiency: float
    efficiency_drop_pct: float
    optimal_replacement_years: int
    hotspot_risk: bool
    annual_loss_kwh: float
    confidence: float
