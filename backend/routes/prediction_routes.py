from flask import Blueprint, request, jsonify

from services.model_service import (
    validate_patient,
    predict_patient
)

prediction_bp = Blueprint(
    "prediction", __name__
)


@prediction_bp.post("/api/predict")
def predict():

    try:
        data = request.get_json(silent=True)

        patient = validate_patient(data)

        result = predict_patient(patient)

        result["disclaimer"] = (
            "Educational ML prediction only. "
            "Not a medical diagnosis."
        )

        return jsonify(result), 200

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400