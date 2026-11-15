"""Step 12: end-to-end, five-case validation of the CVD Flask API.
Run from project root: python tests/final_validation.py
"""
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app import app  # noqa: E402
from services.model_service import FEATURES, CATEGORICAL, model  # noqa: E402

DATA = ROOT / "data" / "processed"
OUT = ROOT / "outputs" / "validation"
OUT.mkdir(parents=True, exist_ok=True)

X_train = pd.read_csv(DATA / "X_train.csv")
X_test = pd.read_csv(DATA / "X_test.csv")
y_test = pd.read_csv(DATA / "y_test.csv").iloc[:, 0]

assert len(X_test) == len(y_test), "Test X/y row counts differ"
assert list(X_test.columns) == FEATURES, "Test columns do not match model input"
assert not set(map(tuple, X_train.to_numpy())).intersection(
    set(map(tuple, X_test.to_numpy()))
), "Data leakage: identical feature rows appear in training and test sets"

comparison = pd.read_csv(ROOT / "outputs" / "metrics" / "model_comparison.csv")
best_name = comparison.sort_values("CV ROC-AUC", ascending=False).iloc[0]["Model"]
classifier = model.named_steps["classifier"]
classifier_name = (
    "Logistic Regression" if isinstance(classifier, LogisticRegression)
    else "Random Forest" if isinstance(classifier, RandomForestClassifier)
    else "SVM" if isinstance(classifier, CalibratedClassifierCV)
    else type(classifier).__name__
)
assert classifier_name == best_name, (
    f"Saved best model is {classifier_name} but comparison CSV selects {best_name}"
)

results = []
with app.test_client() as client:
    health = client.get("/health")
    assert health.status_code == 200 and health.get_json()["status"] == "healthy"
    print("[PASS] Health endpoint")

    metrics_response = client.get("/api/metrics")
    assert metrics_response.status_code == 200, metrics_response.get_data(as_text=True)
    metrics = metrics_response.get_json()
    assert metrics["best_model"] == classifier_name
    assert sum(map(sum, metrics["confusion_matrix"])) == len(X_test)
    print(f"[PASS] Metrics endpoint - {classifier_name}, accuracy {metrics['accuracy']:.4f}")

    invalid = X_test.iloc[0].to_dict()
    invalid.pop("age")
    assert client.post("/api/predict", json=invalid).status_code == 400
    invalid = X_test.iloc[0].to_dict()
    invalid["age"] = -5
    assert client.post("/api/predict", json=invalid).status_code == 400
    print("[PASS] Missing and invalid fields rejected")

    for i in range(min(5, len(X_test))):
        row = X_test.iloc[i]
        patient = {
            key: int(row[key]) if key in CATEGORICAL else float(row[key])
            for key in FEATURES
        }

        prediction_response = client.post("/api/predict", json=patient)
        assert prediction_response.status_code == 200, prediction_response.get_data(as_text=True)
        prediction = prediction_response.get_json()

        reference_class = int(model.predict(X_test.iloc[[i]])[0])
        reference_p1 = float(model.predict_proba(X_test.iloc[[i]])[0, 1])
        assert prediction["predicted_class"] == reference_class
        assert abs(prediction["probability_class_1"] - reference_p1) < 1e-5
        assert abs(prediction["probability_class_0"] + prediction["probability_class_1"] - 1) < 1e-5

        explain_response = client.post("/api/explain", json=patient)
        assert explain_response.status_code == 200, explain_response.get_data(as_text=True)
        payload = explain_response.get_json()
        shap_result = payload["explanations"]["shap"]
        lime_result = payload["explanations"]["lime"]
        shap_features = shap_result["features"]
        lime_features = lime_result["features"]
        assert len(shap_features) == len(FEATURES)
        assert {x["feature"] for x in shap_features} == set(FEATURES)
        assert len(lime_features) > 0

        # For Logistic Regression, SHAP's log-odds values should reconstruct
        # the model's raw decision score (within API rounding tolerance).
        reconstruction_error = np.nan
        if isinstance(classifier, LogisticRegression):
            log_odds = float(shap_result["base_value"]) + sum(
                float(x["value"]) for x in shap_features
            )
            decision_score = float(model.decision_function(X_test.iloc[[i]])[0])
            reconstruction_error = abs(log_odds - decision_score)
            assert reconstruction_error < 1e-4, (
                f"Patient {i+1}: SHAP reconstruction error {reconstruction_error}"
            )

        top_shap = [x["feature"] for x in sorted(
            shap_features, key=lambda x: abs(x["value"]), reverse=True
        )[:5]]
        top_lime = [x["feature"] for x in sorted(
            lime_features, key=lambda x: abs(x["weight"]), reverse=True
        )[:5]]
        results.append({
            "Patient": i + 1,
            "Actual": int(y_test.iloc[i]),
            "Predicted": reference_class,
            "Class_1_Probability": round(reference_p1, 6),
            "Top_SHAP_Feature": top_shap[0],
            "Top_LIME_Feature": top_lime[0],
            "Top_5_Overlap": len(set(top_shap) & set(top_lime)),
            "SHAP_Reconstruction_Error": reconstruction_error,
        })
        print(f"[PASS] Patient {i+1}: prediction + SHAP + LIME")

pd.DataFrame(results).to_csv(OUT / "five_patient_api_validation.csv", index=False)
print("\nAll checks passed!")
print("Saved:", OUT / "five_patient_api_validation.csv")
