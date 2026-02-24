"""
Impact Calculator router — environmental and economic impact calculations.
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ImpactRequest(BaseModel):
    batteries_recycled: int = 0
    solar_panels_recycled: int = 0
    batteries_reused: int = 0
    solar_panels_reused: int = 0


@router.post("/calculate")
def calculate_impact(req: ImpactRequest) -> dict:
    """Calculate environmental and economic impact for given recycling/reuse volumes."""
    # Per-unit impact constants (approximate real-world values)
    BATTERY_RECYCLE_CO2   = 120    # kg CO2 saved per battery recycled
    BATTERY_REUSE_CO2     = 200    # kg CO2 saved per battery reused (avoids new production)
    SOLAR_RECYCLE_CO2     = 80     # kg CO2 saved per panel recycled
    SOLAR_REUSE_CO2       = 150    # kg CO2 saved per panel reused

    BATTERY_RECYCLE_WATER = 450    # litres saved per battery recycled
    BATTERY_REUSE_WATER   = 800
    SOLAR_RECYCLE_WATER   = 300
    SOLAR_REUSE_WATER     = 600

    BATTERY_WEIGHT_KG     = 75     # avg EV battery pack weight
    SOLAR_WEIGHT_KG       = 20     # avg solar panel weight

    BATTERY_ENERGY_KWH    = 350    # kWh saved per battery recycled
    SOLAR_ENERGY_KWH      = 200

    BATTERY_RECYCLE_INR   = 18000  # economic value per battery recycled (material recovery)
    BATTERY_REUSE_INR     = 35000  # economic value per battery reused (second-life)
    SOLAR_RECYCLE_INR     = 8000
    SOLAR_REUSE_INR       = 15000

    # Material recovery per battery (approx kg)
    lithium_kg   = (req.batteries_recycled + req.batteries_reused) * 1.2
    cobalt_kg    = req.batteries_recycled * 0.85
    nickel_kg    = req.batteries_recycled * 2.4
    copper_kg    = (req.batteries_recycled + req.batteries_reused + req.solar_panels_recycled) * 3.2
    silicon_kg   = (req.solar_panels_recycled + req.solar_panels_reused) * 6.4
    silver_g     = (req.solar_panels_recycled + req.solar_panels_reused) * 0.47 * 1000  # grams
    glass_kg     = (req.solar_panels_recycled + req.solar_panels_reused) * 10.5
    aluminium_kg = (req.solar_panels_recycled + req.solar_panels_reused) * 8.4 + (req.batteries_recycled) * 1.1

    co2_saved = (
        req.batteries_recycled * BATTERY_RECYCLE_CO2 +
        req.batteries_reused   * BATTERY_REUSE_CO2   +
        req.solar_panels_recycled * SOLAR_RECYCLE_CO2 +
        req.solar_panels_reused   * SOLAR_REUSE_CO2
    )
    water_saved = (
        req.batteries_recycled * BATTERY_RECYCLE_WATER +
        req.batteries_reused   * BATTERY_REUSE_WATER   +
        req.solar_panels_recycled * SOLAR_RECYCLE_WATER +
        req.solar_panels_reused   * SOLAR_REUSE_WATER
    )
    energy_saved = (
        (req.batteries_recycled + req.batteries_reused) * BATTERY_ENERGY_KWH +
        (req.solar_panels_recycled + req.solar_panels_reused) * SOLAR_ENERGY_KWH
    )
    landfill_diverted = (
        (req.batteries_recycled + req.batteries_reused) * BATTERY_WEIGHT_KG +
        (req.solar_panels_recycled + req.solar_panels_reused) * SOLAR_WEIGHT_KG
    )
    toxic_prevented = (
        req.batteries_recycled * 22.5 +
        req.solar_panels_recycled * 0.3
    )
    economic_value = (
        req.batteries_recycled * BATTERY_RECYCLE_INR +
        req.batteries_reused   * BATTERY_REUSE_INR   +
        req.solar_panels_recycled * SOLAR_RECYCLE_INR +
        req.solar_panels_reused   * SOLAR_REUSE_INR
    )
    carbon_credits = round(co2_saved / 1000, 1)   # 1 credit = 1 tonne CO2
    esg_improvement = round(min(25.0, (co2_saved / 5000) * 5), 1)

    return {
        "co2_saved_kg": co2_saved,
        "co2_equivalent_trees": round(co2_saved / 20),
        "water_saved_litres": water_saved,
        "energy_saved_kwh": energy_saved,
        "landfill_diverted_kg": landfill_diverted,
        "toxic_chemicals_prevented_kg": round(toxic_prevented, 1),
        "materials_recovered": {
            "lithium_kg":    round(lithium_kg, 1),
            "cobalt_kg":     round(cobalt_kg, 1),
            "nickel_kg":     round(nickel_kg, 1),
            "copper_kg":     round(copper_kg, 1),
            "silicon_kg":    round(silicon_kg, 1),
            "silver_g":      round(silver_g, 0),
            "glass_kg":      round(glass_kg, 1),
            "aluminium_kg":  round(aluminium_kg, 1),
        },
        "economic_value_inr": economic_value,
        "carbon_credits_earned": carbon_credits,
        "esg_score_improvement": esg_improvement,
    }


@router.get("/platform-total")
def get_platform_total() -> dict:
    """Return cumulative platform-wide impact totals (mock data for demo)."""
    return {
        "co2_saved_kg": 4500000,
        "co2_equivalent_trees": 225000,
        "water_saved_litres": 18000000,
        "energy_saved_kwh": 12500000,
        "landfill_diverted_kg": 3200000,
        "toxic_chemicals_prevented_kg": 850000,
        "batteries_recycled": 24500,
        "batteries_reused": 8200,
        "solar_panels_recycled": 31000,
        "solar_panels_reused": 12500,
        "economic_value_inr": 1250000000,
        "carbon_credits_earned": 4500,
        "materials_recovered": {
            "lithium_kg": 45000,
            "cobalt_kg": 32000,
            "nickel_kg": 89000,
            "copper_kg": 120000,
            "silicon_kg": 240000,
            "silver_g": 18000000,
            "glass_kg": 1500000,
            "aluminium_kg": 320000,
        },
    }
