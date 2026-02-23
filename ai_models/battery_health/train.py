"""
Battery health model training script with synthetic data generation.
Run: python train.py --epochs 50 --output weights/
"""
import argparse
import os
import numpy as np

try:
    _TF_AVAILABLE = True
    import tensorflow as tf
except ImportError:
    _TF_AVAILABLE = False


def generate_synthetic_data(n_samples: int = 5000, input_steps: int = 10, n_features: int = 5):
    """
    Generate synthetic battery time-series data.
    Features: [voltage, current, temperature, cycles_norm, capacity_norm]
    Label: SOH (0-1)
    """
    rng = np.random.default_rng(42)
    X, y = [], []

    for _ in range(n_samples):
        cycles = rng.integers(0, 2000)
        temp = rng.uniform(15, 55)
        capacity = rng.uniform(20, 100)

        # SOH ground truth using simplified degradation model:
        #   3000 cycles = typical end-of-life for Li-ion (0% SOH at 3000 cycles)
        #   40°C = thermal degradation threshold (above this, extra degradation kicks in)
        #   200 = scale factor mapping excess temperature to SOH reduction
        #   0.15 = minimum clamped SOH (15% floor for end-of-life state)
        soh_true = max(0.15, min(1.0, 1.0 - cycles / 3000 - max(0, temp - 40) / 200))

        # Generate sequence of readings
        seq = []
        for t in range(input_steps):
            v = rng.uniform(3.2, 4.2)
            c = rng.uniform(50, 300)
            tmp = temp + rng.normal(0, 2)
            seq.append([v, c, tmp, cycles / 2000, capacity / 100])

        X.append(seq)
        y.append(soh_true)

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def train(epochs: int = 50, output_dir: str = "weights/"):
    if not _TF_AVAILABLE:
        print("TensorFlow not installed. Install with: pip install tensorflow")
        return

    from model import build_model

    print("Generating synthetic training data...")
    X_train, y_train = generate_synthetic_data(n_samples=5000)
    X_val,   y_val   = generate_synthetic_data(n_samples=1000)

    print(f"Training samples: {len(X_train)}, Validation: {len(X_val)}")

    model = build_model(input_steps=10, n_features=5)

    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(patience=5, factor=0.5),
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
    model.save_weights(os.path.join(output_dir, "battery_lstm.weights.h5"))
    print(f"Model weights saved to {output_dir}")

    final_loss = history.history["val_loss"][-1]
    final_mae  = history.history["val_mae"][-1]
    print(f"Final validation loss: {final_loss:.4f}, MAE: {final_mae:.4f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs",  type=int, default=50)
    parser.add_argument("--output",  type=str, default="weights/")
    args = parser.parse_args()
    train(epochs=args.epochs, output_dir=args.output)
