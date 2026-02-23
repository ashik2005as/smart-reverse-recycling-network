"""
Data preprocessing utilities for battery health model.
"""
import numpy as np


# Normalisation bounds (fit on training data)
_BOUNDS = {
    "voltage":     (3.0, 4.2),
    "current":     (0.0, 400.0),
    "temperature": (10.0, 60.0),
    "cycles":      (0.0, 2000.0),
    "capacity":    (0.0, 150.0),
}


def _minmax(value: float, low: float, high: float) -> float:
    """Min-max normalise a scalar."""
    if high == low:
        return 0.0
    return max(0.0, min(1.0, (value - low) / (high - low)))


def preprocess_battery_input(voltage: float, current: float, temperature: float,
                              cycles: int, capacity: float,
                              input_steps: int = 10) -> np.ndarray:
    """
    Preprocess a single battery reading into model input shape.

    Returns:
        np.ndarray of shape (1, input_steps, 5)
    """
    features = [
        _minmax(voltage,     *_BOUNDS["voltage"]),
        _minmax(current,     *_BOUNDS["current"]),
        _minmax(temperature, *_BOUNDS["temperature"]),
        _minmax(cycles,      *_BOUNDS["cycles"]),
        _minmax(capacity,    *_BOUNDS["capacity"]),
    ]
    # Repeat single reading across all time steps
    sequence = np.array([features] * input_steps, dtype=np.float32)
    return sequence.reshape(1, input_steps, len(features))


def add_gaussian_noise(data: np.ndarray, std: float = 0.02) -> np.ndarray:
    """Add Gaussian noise for data augmentation during training."""
    return data + np.random.normal(0, std, data.shape).astype(np.float32)
