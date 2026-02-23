"""
Data preprocessing utilities for solar degradation model.
"""
import numpy as np


def preprocess_solar_input(efficiency: float, age_years: float, temperature: float,
                            capacity_kw: float, input_steps: int = 12) -> np.ndarray:
    """
    Preprocess a single solar panel reading into model input shape.

    Returns:
        np.ndarray of shape (1, input_steps, 5)
    """
    # Normalise features
    eff_norm  = min(1.0, efficiency / 22.0)
    temp_norm = min(1.0, temperature / 60.0)
    age_norm  = min(1.0, age_years / 25.0)
    irr_norm  = 0.6   # assume average irradiance
    dust_norm = 0.3   # assume moderate dust

    features = [eff_norm, temp_norm, irr_norm, dust_norm, age_norm]
    sequence = np.array([features] * input_steps, dtype=np.float32)
    return sequence.reshape(1, input_steps, len(features))
