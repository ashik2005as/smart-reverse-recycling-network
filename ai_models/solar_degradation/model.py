"""
Solar Panel Degradation Model.
Architecture: Conv1D + GRU time-series forecasting model.
Input features: [efficiency, temperature, age, irradiance, dust_index]
Output: degradation score (0-1)
"""
try:
    import tensorflow as tf
    from tensorflow.keras import Sequential
    from tensorflow.keras.layers import Conv1D, GRU, Dense, Dropout, MaxPooling1D
    _TF_AVAILABLE = True
except ImportError:
    _TF_AVAILABLE = False


def build_model(input_steps: int = 12, n_features: int = 5):
    """
    Build Conv1D + GRU model for solar degradation prediction.

    Args:
        input_steps: Monthly readings window (default: 12 months).
        n_features:  Feature count per step.

    Returns:
        Compiled Keras model.
    """
    if not _TF_AVAILABLE:
        raise ImportError("TensorFlow is required. Install with: pip install tensorflow")

    model = Sequential([
        Conv1D(32, kernel_size=3, activation="relu", input_shape=(input_steps, n_features)),
        MaxPooling1D(pool_size=2),
        GRU(32, return_sequences=False),
        Dropout(0.2),
        Dense(16, activation="relu"),
        Dense(1, activation="sigmoid"),  # 0-1 degradation score
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="mse",
        metrics=["mae"],
    )
    return model


if __name__ == "__main__":
    if _TF_AVAILABLE:
        m = build_model()
        m.summary()
    else:
        print("TensorFlow not available.")
