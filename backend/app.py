from flask import Flask, jsonify
from flask_cors import CORS

from routes.prediction_routes import prediction_bp
from routes.explanation_routes import explanation_bp
from routes.metrics_routes import metrics_bp

app = Flask(__name__)

# Allow your local React frontend
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ]
        }
    }
)

app.register_blueprint(prediction_bp)
app.register_blueprint(explanation_bp)
app.register_blueprint(metrics_bp)


@app.get("/")
def home():
    return jsonify({
        "message": "CVD Explainable ML Backend",
        "status": "running"
    })


@app.get("/health")
def health():
    return jsonify({
        "status": "healthy",
        "message": "Flask backend is running!"
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )