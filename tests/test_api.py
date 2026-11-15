import sys
from pathlib import Path

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app import app
from services.model_service import model


@pytest.fixture(scope="module")
def client():
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client


@pytest.fixture(scope="module")
def patient():
    path = ROOT / "data" / "processed" / "X_test.csv"
    return pd.read_csv(path).iloc[0].to_dict()


# Test 1: Backend health
def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "healthy"


# Test 2: Model evaluation
def test_metrics(client):
    response = client.get("/api/metrics")

    assert response.status_code == 200

    data = response.get_json()

    assert "accuracy" in data
    assert "roc_auc" in data
    assert "confusion_matrix" in data

    assert 0 <= data["accuracy"] <= 1
    assert 0 <= data["roc_auc"] <= 1

    cm = data["confusion_matrix"]

    n_test = len(pd.read_csv(
        ROOT / "data" / "processed" / "y_test.csv"
    ))

    assert sum(map(sum, cm)) == n_test


# Test 3: Patient prediction
def test_prediction(client, patient):
    response = client.post(
        "/api/predict",
        json=patient
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["predicted_class"] in [0, 1]

    p0 = data["probability_class_0"]
    p1 = data["probability_class_1"]

    assert 0 <= p0 <= 1
    assert 0 <= p1 <= 1
    assert abs(p0 + p1 - 1) < 0.00001

    expected = int(model.predict(
        pd.DataFrame([patient])
    )[0])

    assert data["predicted_class"] == expected


# Test 4: Invalid input
def test_invalid_input(client, patient):
    invalid = patient.copy()
    invalid.pop("age")

    response = client.post(
        "/api/predict",
        json=invalid
    )

    assert response.status_code == 400
    assert "error" in response.get_json()


# Test 5: SHAP and LIME explanations
def test_explanations(client, patient):
    response = client.post(
        "/api/explain",
        json=patient
    )

    assert response.status_code == 200

    data = response.get_json()

    assert "prediction" in data
    assert "explanations" in data

    explanations = data["explanations"]

    assert len(explanations["shap"]["features"]) == 13
    assert len(explanations["lime"]["features"]) > 0

    assert (
        data["prediction"]["predicted_class"]
        == int(model.predict(pd.DataFrame([patient]))[0])
    )