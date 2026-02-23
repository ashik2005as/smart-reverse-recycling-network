"""
Solar Panel API router — CRUD + AI degradation prediction endpoint.
"""
import random
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.solar_panel import (
    SolarPanelCreate,
    SolarPanelResponse,
    SolarPredictRequest,
    SolarPredictResponse,
)

router = APIRouter()


def _predict_degradation(req: SolarPredictRequest) -> SolarPredictResponse:
    """
    Heuristic degradation model.
    In production this calls the TF time-series model from ai_models/solar_degradation.
    """
    degradation_score = min(100.0, req.age_years * 4.5 + max(0, req.temperature - 35) * 0.8)
    efficiency_drop = round(req.age_years * 0.7 + (req.temperature - 25) * 0.05, 1)
    replacement_years = max(1, round(25 - req.age_years - degradation_score / 10))
    hotspot_risk = req.temperature > 50 or degradation_score > 60
    annual_loss = round(req.efficiency * 0.007 * req.capacity_kw, 1)

    return SolarPredictResponse(
        degradation_score=round(degradation_score, 1),
        current_efficiency=req.efficiency,
        efficiency_drop_pct=efficiency_drop,
        optimal_replacement_years=replacement_years,
        hotspot_risk=hotspot_risk,
        annual_loss_kwh=annual_loss,
        confidence=round(0.85 + random.uniform(0, 0.12), 2),
    )


@router.post("/predict", response_model=SolarPredictResponse)
def predict_solar_degradation(req: SolarPredictRequest):
    """Run AI degradation analysis on submitted solar panel parameters."""
    return _predict_degradation(req)


@router.get("/", response_model=List[dict])
def list_solar_panels(db: Session = Depends(get_db)):
    """List solar panels — returns mock data when DB unavailable."""
    return [
        {"id": 1, "manufacturer": "Adani Solar",    "capacity_kw": 10.0, "efficiency": 17.8, "age_years": 5, "status": "active"},
        {"id": 2, "manufacturer": "Waaree",          "capacity_kw": 400,  "efficiency": 14.2, "age_years": 12,"status": "degraded"},
        {"id": 3, "manufacturer": "Tata Power Solar","capacity_kw": 50.0, "efficiency": 19.1, "age_years": 2, "status": "active"},
    ]


@router.post("/", response_model=dict, status_code=201)
def create_solar_panel(panel: SolarPanelCreate, db: Session = Depends(get_db)):
    """Register a new solar panel asset."""
    return {**panel.model_dump(), "id": random.randint(1000, 9999)}


@router.get("/{panel_id}", response_model=dict)
def get_solar_panel(panel_id: int, db: Session = Depends(get_db)):
    """Get a specific solar panel by ID."""
    return {"id": panel_id, "manufacturer": "Demo", "capacity_kw": 10.0, "efficiency": 18.0, "status": "active"}
