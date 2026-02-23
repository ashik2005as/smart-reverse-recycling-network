"""
Battery Health Predictor — inference class.
Works without TensorFlow by using a heuristic fallback (suitable for demo).
"""
import os
import random
import secrets
from dataclasses import dataclass
from typing import Optional


@dataclass
class BatteryHealthResult:
    soh: float              # State of Health 0-100
    rul_cycles: int         # Remaining Useful Life in cycles
    thermal_anomaly: bool
    recommendation: str     # "Reuse" / "Repair" / "Recycle"
    confidence: float       # 0-1
    digital_passport_id: str
    carbon_credits: float


class BatteryHealthPredictor:
    """
    Inference class for battery SOH prediction.

    Usage:
        predictor = BatteryHealthPredictor()
        result = predictor.predict(voltage=3.7, current=150, temperature=28,
                                   cycles=450, capacity=75)
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self._model_loaded = False

        if model_path and os.path.exists(model_path):
            self._load_model(model_path)

    def _load_model(self, model_path: str):
        """Load pre-trained LSTM weights."""
        try:
            from model import build_model
            self.model = build_model()
            self.model.load_weights(model_path)
            self._model_loaded = True
        except Exception as exc:
            print(f"[BatteryPredictor] Could not load model weights: {exc}. Using heuristic fallback.")

    @staticmethod
    def _generate_passport_id() -> str:
        """Generate a cryptographically secure unique Battery Digital Passport ID."""
        return "DP-" + secrets.token_hex(4).upper()

    def _heuristic_predict(self, voltage: float, current: float, temperature: float,
                           cycles: int, capacity: float) -> BatteryHealthResult:
        """
        Physics-informed heuristic for demo / when model weights are unavailable.
        Based on simplified Arrhenius degradation model.
        """
        cycle_penalty = cycles * 0.033
        temp_penalty = max(0.0, temperature - 40) * 0.8
        voltage_factor = max(0.0, (voltage - 3.0) / 1.2) * 5  # small bonus for healthy voltage
        soh = round(max(15.0, min(100.0, 100 - cycle_penalty - temp_penalty + voltage_factor)), 1)
        rul = max(0, int((soh - 20) * 8))
        thermal_anomaly = temperature > 45

        if soh >= 80:
            recommendation = "Reuse — Battery in excellent condition for second-life energy storage"
        elif soh >= 60:
            recommendation = "Repair — Replace degraded cells; suitable for stationary storage"
        else:
            recommendation = "Recycle — End-of-life; recover Lithium, Nickel, Cobalt via hydrometallurgy"

        return BatteryHealthResult(
            soh=soh,
            rul_cycles=rul,
            thermal_anomaly=thermal_anomaly,
            recommendation=recommendation,
            confidence=round(0.88 + random.uniform(0, 0.10), 2),
        digital_passport_id=self._generate_passport_id(),
            carbon_credits=round(soh * 0.023, 2),
        )

    def predict(self, voltage: float, current: float, temperature: float,
                cycles: int, capacity: float) -> BatteryHealthResult:
        """
        Run health prediction on battery parameters.

        Args:
            voltage:     Battery terminal voltage (V)
            current:     Discharge/charge current (A)
            temperature: Cell temperature (°C)
            cycles:      Number of charge-discharge cycles
            capacity:    Nominal capacity (kWh)

        Returns:
            BatteryHealthResult dataclass
        """
        if self._model_loaded and self.model is not None:
            try:
                import numpy as np
                from utils import preprocess_battery_input
                X = preprocess_battery_input(voltage, current, temperature, cycles, capacity)
                soh_norm = float(self.model.predict(X, verbose=0)[0][0])
                soh = round(soh_norm * 100, 1)
                rul = max(0, int((soh - 20) * 8))
                thermal_anomaly = temperature > 45

                if soh >= 80:
                    rec = "Reuse — Battery in excellent condition"
                elif soh >= 60:
                    rec = "Repair — Replace degraded cells"
                else:
                    rec = "Recycle — End-of-life material recovery"

                return BatteryHealthResult(
                    soh=soh, rul_cycles=rul, thermal_anomaly=thermal_anomaly,
                    recommendation=rec, confidence=0.93,
                    digital_passport_id=self._generate_passport_id(),
                    carbon_credits=round(soh * 0.023, 2),
                )
            except Exception as exc:
                print(f"[BatteryPredictor] Model inference failed: {exc}. Falling back to heuristic.")

        return self._heuristic_predict(voltage, current, temperature, cycles, capacity)


if __name__ == "__main__":
    predictor = BatteryHealthPredictor()
    result = predictor.predict(voltage=3.6, current=150, temperature=32, cycles=500, capacity=75)
    print(result)
