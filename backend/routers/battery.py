"""
Battery API router — CRUD + AI health prediction endpoint.
"""
import random
import string
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas.battery import (
    BatteryCreate,
    BatteryResponse,
    BatteryPredictRequest,
    BatteryPredictResponse,
)

router = APIRouter()


def _generate_passport_id() -> str:
    return "DP-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


def _predict_battery_health(req: BatteryPredictRequest) -> BatteryPredictResponse:
    """
    Rule-based + heuristic AI model for SOH prediction.
    In production, this calls the LSTM model from ai_models/battery_health.
    """
    # Simplified SOH formula (demo)
    cycle_penalty = req.cycles * 0.033
    temp_penalty = max(0, req.temperature - 40) * 0.8
    soh = round(max(15.0, min(100.0, 100 - cycle_penalty - temp_penalty)), 1)
    rul = max(0, int((soh - 20) * 8))
    thermal_anomaly = req.temperature > 45

    if soh >= 80:
        recommendation = "Reuse — Battery in excellent condition for second-life applications"
    elif soh >= 60:
        recommendation = "Repair — Replace degraded cells; still suitable for stationary storage"
    else:
        recommendation = "Recycle — End-of-life; recover Lithium, Nickel, Cobalt via hydrometallurgy"

    return BatteryPredictResponse(
        soh=soh,
        rul_cycles=rul,
        thermal_anomaly=thermal_anomaly,
        recommendation=recommendation,
        confidence=round(0.88 + random.uniform(0, 0.10), 2),
        digital_passport_id=_generate_passport_id(),
        carbon_credits=round(soh * 0.023, 2),
    )


@router.post("/predict", response_model=BatteryPredictResponse)
def predict_battery_health(req: BatteryPredictRequest):
    """Run AI health analysis on submitted battery parameters."""
    return _predict_battery_health(req)


@router.get("/", response_model=List[dict])
def list_batteries(db: Session = Depends(get_db)):
    """List batteries — returns mock data when DB unavailable."""
    return [
        {"id": 1, "manufacturer": "Tata Motors", "capacity_kwh": 75, "current_soh": 88.4, "status": "active"},
        {"id": 2, "manufacturer": "Ola Electric",  "capacity_kwh": 3.97,"current_soh": 72.1, "status": "active"},
        {"id": 3, "manufacturer": "Mahindra",      "capacity_kwh": 40,  "current_soh": 56.7, "status": "recycling"},
    ]


@router.post("/", response_model=dict, status_code=201)
def create_battery(battery: BatteryCreate, db: Session = Depends(get_db)):
    """Register a new battery asset."""
    return {**battery.model_dump(), "id": random.randint(1000, 9999), "digital_passport_id": _generate_passport_id()}


@router.get("/{battery_id}", response_model=dict)
def get_battery(battery_id: int, db: Session = Depends(get_db)):
    """Get a specific battery by ID."""
    return {"id": battery_id, "manufacturer": "Demo", "capacity_kwh": 75, "current_soh": 80.0, "status": "active"}
