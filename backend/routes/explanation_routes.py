from flask import Blueprint, request, jsonify

from services.model_service import (
    validate_patient,
    predict_patient
)

from services.explanation_service import (
    explain_patient
)

explanation_bp = Blueprint(
    "explanation", __name__
)


@explanation_bp.post("/api/explain")
def explain():

    try:
        data = request.get_json(silent=True)

        patient = validate_patient(data)

        prediction = predict_patient(patient)
        explanations = explain_patient(patient)

        return jsonify({
            "prediction": prediction,
            "explanations": explanations,
            "disclaimer": (
                "Educational explanations only. "
                "Not clinical evidence or a diagnosis."
            )
        }), 200

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400