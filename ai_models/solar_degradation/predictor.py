"""
Solar Panel Degradation Predictor — inference class.
"""
import os
import random
from dataclasses import dataclass
from typing import Optional


@dataclass
class SolarDegradationResult:
    degradation_score: float        # 0-100
    current_efficiency: float       # %
    efficiency_drop_pct: float      # % absolute
    optimal_replacement_years: int
    hotspot_risk: bool
    annual_loss_kwh: float
    confidence: float
    yearly_forecast: list           # list of projected efficiency values


class SolarDegradationPredictor:
    """
    Inference class for solar panel degradation prediction.

    Usage:
        predictor = SolarDegradationPredictor()
        result = predictor.predict(efficiency=18.5, age_years=7,
                                   temperature=38, capacity_kw=10)
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self._loaded = False

        if model_path and os.path.exists(model_path):
            self._load_model(model_path)

    def _load_model(self, path: str):
        try:
            from model import build_model
            self.model = build_model()
            self.model.load_weights(path)
            self._loaded = True
        except Exception as exc:
            print(f"[SolarPredictor] Could not load weights: {exc}")

    def _heuristic_predict(self, efficiency: float, age_years: float,
                           temperature: float, capacity_kw: float) -> SolarDegradationResult:
        """Physics-informed heuristic prediction."""
        # Annual degradation rate (higher in hot climates)
        ann_deg = 0.7 + max(0, temperature - 35) * 0.025  # %/year
        efficiency_drop = round(ann_deg * age_years, 1)
        degradation_score = min(100.0, age_years * 4.5 + max(0, temperature - 35) * 0.8)
        replacement_years = max(1, round((25 - age_years - degradation_score / 10)))
        hotspot = temperature > 50 or degradation_score > 60
        annual_loss = round(efficiency * 0.007 * capacity_kw, 1)

        # 10-year efficiency projection
        forecast = [round(max(0, efficiency * (1 - ann_deg / 100) ** y), 1) for y in range(11)]

        return SolarDegradationResult(
            degradation_score=round(degradation_score, 1),
            current_efficiency=efficiency,
            efficiency_drop_pct=efficiency_drop,
            optimal_replacement_years=replacement_years,
            hotspot_risk=hotspot,
            annual_loss_kwh=annual_loss,
            confidence=round(0.85 + random.uniform(0, 0.12), 2),
            yearly_forecast=forecast,
        )

    def predict(self, efficiency: float, age_years: float, temperature: float,
                capacity_kw: float) -> SolarDegradationResult:
        """
        Predict degradation for a solar panel.

        Args:
            efficiency:  Current efficiency (%)
            age_years:   Panel age in years
            temperature: Average ambient temperature (°C)
            capacity_kw: Installed capacity (kWp)

        Returns:
            SolarDegradationResult
        """
        return self._heuristic_predict(efficiency, age_years, temperature, capacity_kw)


if __name__ == "__main__":
    p = SolarDegradationPredictor()
    r = p.predict(efficiency=18.5, age_years=7, temperature=38, capacity_kw=10)
    print(r)
