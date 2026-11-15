import math
import joblib
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = ROOT / "models" / "best_model.joblib"

# Load the trained model
model = joblib.load(MODEL_PATH)

FEATURES = [
    "age", "sex", "cp", "trestbps", "chol",
    "fbs", "restecg", "thalach", "exang",
    "oldpeak", "slope", "ca", "thal"
]

CATEGORICAL = [
    "sex", "cp", "fbs", "restecg",
    "exang", "slope", "ca", "thal"
]

ALLOWED_CODES = {
    "sex": [0, 1],
    "cp": [0, 1, 2, 3],
    "fbs": [0, 1],
    "restecg": [0, 1, 2],
    "exang": [0, 1],
    "slope": [0, 1, 2],
    "ca": [0, 1, 2, 3, 4],
    "thal": [0, 1, 2, 3]
}

# Basic input limits for the educational prototype
RANGES = {
    "age": (1, 120),
    "trestbps": (60, 260),
    "chol": (80, 650),
    "thalach": (40, 250),
    "oldpeak": (0, 7)
}


def validate_patient(data):
    if not isinstance(data, dict):
        raise ValueError("Send a JSON object.")

    missing = [f for f in FEATURES if f not in data]

    if missing:
        raise ValueError(
            "Missing fields: " + ", ".join(missing)
        )

    patient = {}

    for feature in FEATURES:
        value = data[feature]

        if isinstance(value, bool) or not isinstance(
            value, (int, float)
        ):
            raise ValueError(
                f"{feature} must be a number."
            )

        if not math.isfinite(float(value)):
            raise ValueError(
                f"{feature} must be finite."
            )

        if feature in CATEGORICAL:
            if not float(value).is_integer():
                raise ValueError(
                    f"{feature} must be an integer."
                )

            value = int(value)

            if value not in ALLOWED_CODES[feature]:
                raise ValueError(
                    f"Invalid category for {feature}."
                )

        else:
            value = float(value)
            low, high = RANGES[feature]

            if not low <= value <= high:
                raise ValueError(
                    f"{feature} must be between "
                    f"{low} and {high}."
                )

        patient[feature] = value

    return pd.DataFrame([patient], columns=FEATURES)


def predict_patient(patient_df):

    predicted_class = int(
        model.predict(patient_df)[0]
    )

    probabilities = model.predict_proba(
        patient_df
    )[0]

    return {
        "predicted_class": predicted_class,
        "label": f"Class {predicted_class}",
        "probability_class_0": round(
            float(probabilities[0]), 6
        ),
        "probability_class_1": round(
            float(probabilities[1]), 6
        )
    }