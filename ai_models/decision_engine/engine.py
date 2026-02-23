"""
Multi-Criteria Reuse vs Recycle Decision Engine.
Uses weighted scoring across SOH, market demand, refurbishment cost, and material value.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class DecisionResult:
    decision: str           # "Second-life Battery" | "Repair" | "Recycle"
    confidence: float       # 0-1
    score: float            # weighted composite score 0-100
    rationale: str
    carbon_credits: float


# Default weights (tunable based on policy/market conditions)
DEFAULT_WEIGHTS = {
    "soh":                  0.40,
    "market_demand":        0.20,
    "refurbishment_cost":   0.20,
    "material_value":       0.20,
}

# Decision thresholds
THRESHOLDS = {
    "second_life": 65,
    "repair":      45,
    # below 45 → Recycle
}


class DecisionEngine:
    """
    Multi-criteria decision engine for battery reuse/repair/recycle recommendation.

    Usage:
        engine = DecisionEngine()
        result = engine.decide(soh=78, market_demand=0.7, refurb_cost_inr=5000,
                               material_value_usd=800, capacity_kwh=75)
    """

    def __init__(self, weights: Optional[dict] = None):
        self.weights = weights or DEFAULT_WEIGHTS

    def decide(
        self,
        soh: float,
        market_demand: float,           # 0-1 (1 = high demand for second-life)
        refurb_cost_inr: float,         # Refurbishment cost in INR
        material_value_usd: float,      # Recovery value in USD
        capacity_kwh: float,
    ) -> DecisionResult:
        """
        Run multi-criteria decision analysis.

        Args:
            soh:               State of Health 0-100
            market_demand:     Market demand score 0-1
            refurb_cost_inr:   Cost to repair/refurbish (INR)
            material_value_usd: Economic value from material recovery (USD)
            capacity_kwh:      Battery capacity

        Returns:
            DecisionResult with decision, confidence, and rationale
        """
        # Normalise each criterion to 0-100
        soh_score = soh                                               # already 0-100
        demand_score = market_demand * 100                            # 0-100
        # Lower refurb cost → higher score
        cost_score = max(0, 100 - (refurb_cost_inr / 500))           # ₹50,000 = score 0
        # Higher material value → favour recycling (inverse for second-life score)
        mat_score = min(100, material_value_usd / 20)                 # $2000 = 100

        w = self.weights
        composite = (
            w["soh"] * soh_score +
            w["market_demand"] * demand_score +
            w["refurbishment_cost"] * cost_score +
            w["material_value"] * mat_score
        )

        if composite >= THRESHOLDS["second_life"] and soh >= 75:
            decision = "Second-life Battery"
            rationale = (
                f"High SOH ({soh}%) and strong market demand make second-life deployment optimal. "
                f"Estimated value retention: {int(soh * 0.8)}% of original capacity."
            )
            confidence = min(0.99, composite / 100 + 0.10)
        elif composite >= THRESHOLDS["repair"] or (soh >= 60 and refurb_cost_inr < 30000):
            decision = "Repair"
            rationale = (
                f"Battery is repairable (SOH {soh}%). Refurbishment cost ₹{refurb_cost_inr:,.0f} "
                f"is viable for stationary storage applications."
            )
            confidence = min(0.95, composite / 100 + 0.05)
        else:
            decision = "Recycle"
            rationale = (
                f"Low SOH ({soh}%) and high refurbishment cost make material recovery the most "
                f"economical choice. Estimated recovery value: ${material_value_usd:.0f}."
            )
            confidence = min(0.97, (100 - composite) / 100 + 0.15)

        carbon_credits = round(soh * 0.023 * (capacity_kwh / 75), 2)

        return DecisionResult(
            decision=decision,
            confidence=round(confidence, 2),
            score=round(composite, 1),
            rationale=rationale,
            carbon_credits=carbon_credits,
        )


if __name__ == "__main__":
    engine = DecisionEngine()

    # Test cases
    for soh, demand, cost, mat_val, cap in [
        (88, 0.8, 8000,  600, 75),   # → Second-life
        (70, 0.5, 25000, 800, 40),   # → Repair
        (45, 0.2, 40000, 950, 75),   # → Recycle
    ]:
        result = engine.decide(soh, demand, cost, mat_val, cap)
        print(f"SOH={soh}% → {result.decision} (confidence={result.confidence}) | {result.rationale[:60]}…")
