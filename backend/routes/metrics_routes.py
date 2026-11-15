import pandas as pd

from flask import Blueprint, jsonify
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

from services.model_service import ROOT, model

metrics_bp = Blueprint("metrics", __name__)


@metrics_bp.get("/api/metrics")
def get_metrics():

    data = ROOT / "data" / "processed"

    X_test = pd.read_csv(data / "X_test.csv")

    y_test = pd.read_csv(
        data / "y_test.csv"
    ).squeeze("columns")

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    comparison = pd.read_csv(
        ROOT / "outputs" / "metrics"
        / "model_comparison.csv"
    )

    comparison = comparison.round(4)

    best_name = comparison.sort_values(
        "CV ROC-AUC",
        ascending=False
    ).iloc[0]["Model"]

    return jsonify({
        "best_model": best_name,
        "accuracy": float(
            accuracy_score(y_test, y_pred)
        ),
        "roc_auc": float(
            roc_auc_score(y_test, y_prob)
        ),
        "confusion_matrix": confusion_matrix(
            y_test, y_pred, labels=[0, 1]
        ).tolist(),
        "classification_report": classification_report(
            y_test,
            y_pred,
            output_dict=True,
            zero_division=0
        ),
        "model_comparison": comparison.to_dict(
            orient="records"
        )
    })