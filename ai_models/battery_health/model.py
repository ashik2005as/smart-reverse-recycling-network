"""
Battery Health LSTM Model Definition.
Architecture: LSTM → Dense → SOH output
Input features: [voltage, current, temperature, cycles, capacity]
"""
import numpy as np

try:
    import tensorflow as tf
    from tensorflow.keras import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
    _TF_AVAILABLE = True
except ImportError:
    _TF_AVAILABLE = False


def build_model(input_steps: int = 10, n_features: int = 5) -> "tf.keras.Model":
    """
    Build LSTM model for battery SOH prediction.

    Args:
        input_steps: Number of time steps per sample.
        n_features: Number of input features per step.

    Returns:
        Compiled Keras model.
    """
    if not _TF_AVAILABLE:
        raise ImportError("TensorFlow is required to build the LSTM model. Install with: pip install tensorflow")

    model = Sequential([
        LSTM(64, input_shape=(input_steps, n_features), return_sequences=True),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        BatchNormalization(),
        Dense(16, activation="relu"),
        Dense(1, activation="sigmoid"),  # SOH output 0-1 (multiply by 100 for %)
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="mse",
        metrics=["mae"],
    )
    return model


def get_model_summary() -> str:
    """Return a text summary of the model architecture."""
    if not _TF_AVAILABLE:
        return "TensorFlow not available — model summary unavailable."
    model = build_model()
    lines = []
    model.summary(print_fn=lines.append)
    return "\n".join(lines)


if __name__ == "__main__":
    print(get_model_summary())
