"""
Decision Engine router — AI-powered Reuse / Repair / Recycle / Dispose decisions.
"""
import random
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class DecisionRequest(BaseModel):
    asset_type: str          # "battery" | "solar"
    soh: Optional[float] = None
    efficiency: Optional[float] = None
    age_years: float
    temperature: float
    cycles: Optional[int] = None
    capacity: Optional[float] = None


def _generate_passport_id() -> str:
    return "DP-" + secrets.token_hex(4).upper()


def _demo_ts(delta_minutes: int = 0) -> str:
    now = datetime.now()
    demo = datetime(2026, 2, 23, now.hour, now.minute, now.second)
    if delta_minutes:
        demo = demo - timedelta(minutes=delta_minutes)
    return demo.isoformat(timespec="seconds")


def _analyze_battery(req: DecisionRequest) -> dict:
    soh = req.soh or 75.0
    if soh >= 80:
        decision = "reuse"
        reasoning = "SOH ≥ 80%: Battery is in excellent condition suitable for second-life applications such as stationary energy storage."
        next_steps = ["Test for second-life suitability", "List on marketplace", "Issue digital passport", "Ship to second-life partner"]
        value_recovery = 85.0
        co2_saved = round(soh * 4.5, 1)
        facility = "GreenRecycle Ltd, Mumbai"
    elif soh >= 60:
        decision = "repair"
        reasoning = "SOH 60–79%: Battery capacity has degraded but cell replacement can restore functionality for another service cycle."
        next_steps = ["Diagnose degraded cells", "Schedule cell replacement", "Re-test after repair", "Update digital passport"]
        value_recovery = 60.0
        co2_saved = round(soh * 3.2, 1)
        facility = "EV Repair Centre, Bangalore"
    elif soh >= 40:
        decision = "recycle"
        reasoning = "SOH 40–59%: Battery is near end-of-life; material recovery via hydrometallurgy is the most sustainable option."
        next_steps = ["Schedule recycling pickup", "Transfer to certified recycler", "Recover Li/Co/Ni", "Issue material recovery certificate"]
        value_recovery = 40.0
        co2_saved = round(soh * 2.1, 1)
        facility = "BattRecycle Pvt Ltd, Chennai"
    else:
        decision = "dispose"
        reasoning = "SOH < 40%: Battery has reached end-of-life. Certified disposal required to prevent toxic leakage."
        next_steps = ["Contact certified disposal facility", "Arrange safe transport", "Get disposal certificate", "Log in compliance system"]
        value_recovery = 15.0
        co2_saved = round(soh * 0.8, 1)
        facility = "CPCB-Certified Disposal, Delhi"

    return {
        "decision": decision,
        "confidence": round(0.85 + random.uniform(0, 0.12), 2),
        "reasoning": reasoning,
        "next_steps": next_steps,
        "estimated_value_recovery_pct": value_recovery,
        "environmental_impact": {
            "co2_saved_kg": co2_saved,
            "water_saved_litres": round(co2_saved * 3.8, 1),
            "landfill_diverted_kg": round(req.capacity or 75, 1),
        },
        "recommended_facility": facility,
        "digital_passport_id": _generate_passport_id(),
    }


def _analyze_solar(req: DecisionRequest) -> dict:
    eff = req.efficiency or 14.0
    age = req.age_years
    degradation = max(0, (25 - eff) / 25 * 100)

    if eff >= 16 and age < 15:
        decision = "reuse"
        reasoning = "Efficiency ≥ 16% and age < 15 years: Panel is performing well and can be redeployed in another installation."
        next_steps = ["Inspect for physical damage", "Clean panel surface", "Re-certify output", "List on marketplace"]
        value_recovery = 80.0
        co2_saved = round(eff * 5.2, 1)
        facility = "SolarReuse India, Ahmedabad"
    elif eff >= 12:
        decision = "repair"
        reasoning = "Efficiency 12–15%: Hotspots or micro-cracks may be causing degradation. Repair or partial replacement is viable."
        next_steps = ["Thermal imaging inspection", "Replace damaged cells/strings", "Re-test output", "Update passport"]
        value_recovery = 55.0
        co2_saved = round(eff * 3.5, 1)
        facility = "SolarTech Services, Hyderabad"
    elif eff < 12 or (age > 20 and eff < 15):
        decision = "recycle"
        reasoning = "Efficiency < 12% or panel aged >20 years with declining efficiency: Silicon and silver recovery is most economical at this stage."
        next_steps = ["Decommission panel", "Transport to recycler", "Recover Si/Ag/Al/glass", "Issue recycling certificate"]
        value_recovery = 35.0
        co2_saved = round(eff * 1.9, 1)
        facility = "SolarWaste Co, Ahmedabad"
    else:
        decision = "dispose"
        reasoning = "Panel is severely degraded. Certified disposal is required."
        next_steps = ["Contact certified disposal facility", "Arrange transport", "Get disposal certificate", "Log in compliance system"]
        value_recovery = 10.0
        co2_saved = round(eff * 0.5, 1)
        facility = "CPCB-Certified Disposal, Jaipur"

    return {
        "decision": decision,
        "confidence": round(0.82 + random.uniform(0, 0.15), 2),
        "reasoning": reasoning,
        "next_steps": next_steps,
        "estimated_value_recovery_pct": value_recovery,
        "environmental_impact": {
            "co2_saved_kg": co2_saved,
            "water_saved_litres": round(co2_saved * 2.5, 1),
            "landfill_diverted_kg": round((req.capacity or 20) * 1.2, 1),
        },
        "recommended_facility": facility,
        "digital_passport_id": _generate_passport_id(),
    }


@router.post("/analyze")
def analyze_asset(req: DecisionRequest):
    """Run AI-powered decision analysis on submitted asset parameters."""
    if req.asset_type == "battery":
        return _analyze_battery(req)
    return _analyze_solar(req)


@router.get("/history")
def get_decision_history() -> List[dict]:
    """Return mock list of past decisions with timestamps."""
    return [
        {"id": 1, "asset_type": "battery", "asset_id": "BT-4521", "decision": "recycle",  "confidence": 0.91, "soh": 45.2, "timestamp": _demo_ts(30),  "facility": "BattRecycle Pvt Ltd, Chennai"},
        {"id": 2, "asset_type": "solar",   "asset_id": "SP-0887", "decision": "repair",   "confidence": 0.87, "efficiency": 13.1, "timestamp": _demo_ts(90),  "facility": "SolarTech Services, Hyderabad"},
        {"id": 3, "asset_type": "battery", "asset_id": "BT-1892", "decision": "reuse",    "confidence": 0.95, "soh": 84.7, "timestamp": _demo_ts(180), "facility": "GreenRecycle Ltd, Mumbai"},
        {"id": 4, "asset_type": "solar",   "asset_id": "SP-3341", "decision": "recycle",  "confidence": 0.89, "efficiency": 10.2, "timestamp": _demo_ts(300), "facility": "SolarWaste Co, Ahmedabad"},
        {"id": 5, "asset_type": "battery", "asset_id": "BT-7760", "decision": "dispose",  "confidence": 0.93, "soh": 28.1, "timestamp": _demo_ts(480), "facility": "CPCB-Certified Disposal, Delhi"},
        {"id": 6, "asset_type": "battery", "asset_id": "BT-2233", "decision": "repair",   "confidence": 0.88, "soh": 68.4, "timestamp": _demo_ts(600), "facility": "EV Repair Centre, Bangalore"},
    ]
