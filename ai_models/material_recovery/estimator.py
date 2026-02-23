"""
Material Recovery Digital Twin Estimator.
Calculates recoverable materials and economic value from battery/solar waste.
"""
from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class MaterialQuantity:
    raw_kg: float
    recoverable_kg: float
    value_usd: float
    price_per_kg: float


@dataclass
class RecoveryResult:
    source_type: str
    total_units: int
    total_capacity: float
    materials: Dict[str, MaterialQuantity] = field(default_factory=dict)
    total_value_usd: float = 0.0
    co2_saved_kg: float = 0.0
    esg_carbon_credits: float = 0.0
    water_saved_litres: float = 0.0


# ── Market prices (USD/kg, approximate) ──────────────────────────────────────
MATERIAL_PRICES: Dict[str, float] = {
    "lithium":   22.5,
    "nickel":    14.2,
    "cobalt":    33.1,
    "silver":   830.0,
    "silicon":    2.8,
    "copper":     8.9,
    "manganese":  2.1,
    "aluminium":  2.4,
}

# ── Composition factors ───────────────────────────────────────────────────────
# Battery: kg per kWh
BATTERY_COMPOSITION: Dict[str, float] = {
    "lithium":   0.160,
    "nickel":    0.480,
    "cobalt":    0.110,
    "manganese": 0.220,
    "copper":    0.250,
    "aluminium": 0.300,
}

# Solar panel: kg per kWp
SOLAR_COMPOSITION: Dict[str, float] = {
    "silicon":   5.200,
    "silver":    0.020,
    "copper":    0.800,
    "aluminium": 8.500,
}

# Hydrometallurgical recovery efficiency (fraction)
RECOVERY_EFFICIENCY: Dict[str, float] = {
    "lithium":   0.92,
    "nickel":    0.95,
    "cobalt":    0.93,
    "silver":    0.97,
    "silicon":   0.88,
    "copper":    0.96,
    "manganese": 0.90,
    "aluminium": 0.94,
}

# CO₂ saved vs virgin mining (kg CO₂ per kg material recovered)
CO2_SAVINGS_PER_KG: Dict[str, float] = {
    "lithium":   15.0,
    "nickel":    11.0,
    "cobalt":    8.0,
    "silver":   105.0,
    "silicon":   5.0,
    "copper":    3.2,
    "manganese": 1.8,
    "aluminium": 8.0,
}


class MaterialRecoveryEstimator:
    """
    Digital twin model for material recovery estimation.

    Usage:
        estimator = MaterialRecoveryEstimator()
        result = estimator.estimate(source_type='battery', capacity=75, quantity=50)
    """

    def estimate(
        self,
        source_type: str,           # 'battery' or 'solar'
        capacity: float,            # kWh (battery) or kWp (solar)
        quantity: int = 1,
        recovery_override: Optional[Dict[str, float]] = None,
    ) -> RecoveryResult:
        """
        Estimate recoverable materials and economic value.

        Args:
            source_type:        'battery' or 'solar'
            capacity:           kWh per unit (battery) or kWp per unit (solar)
            quantity:           Number of units
            recovery_override:  Optional per-material recovery efficiency override

        Returns:
            RecoveryResult with detailed material breakdown
        """
        composition = BATTERY_COMPOSITION if source_type == "battery" else SOLAR_COMPOSITION
        total_capacity = capacity * quantity
        eff = recovery_override or RECOVERY_EFFICIENCY

        materials: Dict[str, MaterialQuantity] = {}
        total_value = 0.0
        total_co2 = 0.0
        total_water = 0.0

        for mat, ratio in composition.items():
            raw_kg = ratio * total_capacity
            rec_eff = eff.get(mat, 0.90)
            recoverable_kg = raw_kg * rec_eff
            price = MATERIAL_PRICES.get(mat, 5.0)
            value = recoverable_kg * price
            total_value += value
            total_co2 += recoverable_kg * CO2_SAVINGS_PER_KG.get(mat, 3.0)
            # Approximate water saved (litres) — lithium mining uses ~2 million L/tonne
            if mat == "lithium":
                total_water += recoverable_kg * 2000

            materials[mat] = MaterialQuantity(
                raw_kg=round(raw_kg, 3),
                recoverable_kg=round(recoverable_kg, 3),
                value_usd=round(value, 2),
                price_per_kg=price,
            )

        return RecoveryResult(
            source_type=source_type,
            total_units=quantity,
            total_capacity=total_capacity,
            materials=materials,
            total_value_usd=round(total_value, 2),
            co2_saved_kg=round(total_co2, 1),
            esg_carbon_credits=round(total_value * 0.015, 2),
            water_saved_litres=round(total_water, 0),
        )


if __name__ == "__main__":
    est = MaterialRecoveryEstimator()

    print("=== 50 × 75 kWh EV Battery Packs ===")
    r = est.estimate("battery", capacity=75, quantity=50)
    for mat, m in r.materials.items():
        print(f"  {mat:12s}: {m.recoverable_kg:.1f} kg → ${m.value_usd:,.0f}")
    print(f"  Total value: ${r.total_value_usd:,.0f} | CO₂ saved: {r.co2_saved_kg:.0f} kg")

    print("\n=== 200 × 300 W Solar Panels (0.3 kWp each) ===")
    r2 = est.estimate("solar", capacity=0.3, quantity=200)
    for mat, m in r2.materials.items():
        print(f"  {mat:12s}: {m.recoverable_kg:.1f} kg → ${m.value_usd:,.0f}")
    print(f"  Total value: ${r2.total_value_usd:,.0f} | CO₂ saved: {r2.co2_saved_kg:.0f} kg")
