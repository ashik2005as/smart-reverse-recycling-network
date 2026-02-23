"""
Solar degradation model training script.
Run: python train.py --epochs 40 --output weights/
"""
import argparse
import os
import numpy as np

try:
    import tensorflow as tf
    _TF_AVAILABLE = True
except ImportError:
    _TF_AVAILABLE = False


def generate_synthetic_data(n_samples: int = 4000, input_steps: int = 12, n_features: int = 5):
    """Generate synthetic monthly solar panel readings."""
    rng = np.random.default_rng(7)
    X, y = [], []

    for _ in range(n_samples):
        age = rng.uniform(0, 25)
        temp = rng.uniform(20, 55)
        efficiency = rng.uniform(10, 22)

        # Ground-truth degradation (0-1)
        deg_true = min(1.0, age * 0.045 + max(0, temp - 35) * 0.008)

        seq = []
        for t in range(input_steps):
            eff_t = efficiency - age * 0.007 * t / 12
            tmp_t = temp + rng.normal(0, 3)
            irr   = rng.uniform(200, 800)           # W/m²
            dust  = rng.uniform(0, 1)
            age_t = age + t / 12
            # Clip normalised values to [0, 1] to handle out-of-range data gracefully
            seq.append([
                max(0.0, min(1.0, eff_t / 22)),   # efficiency / max_efficiency (22%)
                max(0.0, min(1.0, tmp_t / 60)),   # temperature / max_temp (60°C)
                max(0.0, min(1.0, irr / 1000)),   # irradiance / max_irradiance (1000 W/m²)
                dust,
                max(0.0, min(1.0, age_t / 25)),   # age / panel_lifetime (25 years)
            ])

        X.append(seq)
        y.append(deg_true)

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def train(epochs: int = 40, output_dir: str = "weights/"):
    if not _TF_AVAILABLE:
        print("TensorFlow not installed.")
        return

    from model import build_model

    print("Generating synthetic solar data...")
    X_train, y_train = generate_synthetic_data(4000)
    X_val,   y_val   = generate_synthetic_data(1000)

    model = build_model(input_steps=12, n_features=5)

    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=8, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(patience=4, factor=0.5),
    ]

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=64,
        callbacks=callbacks,
        verbose=1,
    )

    os.makedirs(output_dir, exist_ok=True)
    model.save_weights(os.path.join(output_dir, "solar_gru.weights.h5"))
    print(f"Weights saved to {output_dir}")

    print(f"Final val loss: {history.history['val_loss'][-1]:.4f}, "
          f"MAE: {history.history['val_mae'][-1]:.4f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs",  type=int, default=40)
    parser.add_argument("--output",  type=str, default="weights/")
    args = parser.parse_args()
    train(epochs=args.epochs, output_dir=args.output)
