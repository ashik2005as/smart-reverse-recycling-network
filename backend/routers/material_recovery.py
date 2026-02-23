"""
Material Recovery estimation router.
"""
from fastapi import APIRouter
from schemas.material_recovery import MaterialRecoveryRequest, MaterialRecoveryResponse, MaterialDetail

router = APIRouter()

# Market prices USD/kg
PRICES = {
    "lithium": 22.5, "nickel": 14.2, "cobalt": 33.1,
    "silver": 830.0, "silicon": 2.8, "copper": 8.9, "manganese": 2.1,
}

# Battery composition per kWh
BATTERY_COMP = {
    "lithium": 0.16, "nickel": 0.48, "cobalt": 0.11,
    "manganese": 0.22, "copper": 0.25,
}

# Solar panel composition per kWp
SOLAR_COMP = {
    "silicon": 5.2, "silver": 0.02, "copper": 0.8,
}

RECOVERY_EFF = {"battery": 0.92, "solar": 0.85}


@router.post("/estimate", response_model=MaterialRecoveryResponse)
def estimate_recovery(req: MaterialRecoveryRequest):
    """Estimate recoverable materials and economic value."""
    total = req.capacity * req.quantity
    comp = BATTERY_COMP if req.source_type == "battery" else SOLAR_COMP
    eff = RECOVERY_EFF.get(req.source_type, 0.90)

    materials = {}
    total_value = 0.0
    for mat, ratio in comp.items():
        raw = ratio * total
        recoverable = raw * eff
        price = PRICES.get(mat, 5.0)
        value = recoverable * price
        total_value += value
        materials[mat] = MaterialDetail(raw_kg=round(raw, 2), recoverable_kg=round(recoverable, 2), value_usd=round(value, 2))

    co2_saved = total * (12.4 if req.source_type == "battery" else 3.8)

    return MaterialRecoveryResponse(
        source_type=req.source_type,
        total_units=req.quantity,
        materials=materials,
        total_value_usd=round(total_value, 2),
        co2_saved_kg=round(co2_saved, 1),
        esg_carbon_credits=round(total_value * 0.015, 2),
    )
