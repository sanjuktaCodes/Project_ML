import pandas as pd
import joblib
from pathlib import Path

from sklearn.compose import ColumnTransformer
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, roc_auc_score
)

# 1. Paths
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "processed"
MODELS = ROOT / "models"
OUT = ROOT / "outputs" / "metrics"

MODELS.mkdir(exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

# 2. Load data
X_train = pd.read_csv(DATA / "X_train.csv")
X_test = pd.read_csv(DATA / "X_test.csv")
y_train = pd.read_csv(DATA / "y_train.csv").squeeze("columns")
y_test = pd.read_csv(DATA / "y_test.csv").squeeze("columns")

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

# 3. Define feature types
numeric = ["age", "trestbps", "chol", "thalach", "oldpeak"]

categorical = [
    "sex", "cp", "fbs", "restecg",
    "exang", "slope", "ca", "thal"
]

# 4. Preprocessing
num_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

cat_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore"))
])

preprocessor = ColumnTransformer([
    ("num", num_pipeline, numeric),
    ("cat", cat_pipeline, categorical)
])

# 5. Define models
models = {
    "Logistic Regression": LogisticRegression(
        max_iter=2000
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        random_state=42
    ),

    # Fixed SVM warning
    "SVM": CalibratedClassifierCV(
        SVC(random_state=42),
        ensemble=False
    )
}

filenames = {
    "Logistic Regression": "logistic_regression.joblib",
    "Random Forest": "random_forest.joblib",
    "SVM": "svm.joblib"
}

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

results = []
trained_models = {}

# 6. Train and compare
for name, classifier in models.items():

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", classifier)
    ])

    auc = cross_val_score(
        pipeline, X_train, y_train,
        cv=cv, scoring="roc_auc"
    ).mean()

    acc = cross_val_score(
        pipeline, X_train, y_train,
        cv=cv, scoring="accuracy"
    ).mean()

    pipeline.fit(X_train, y_train)

    trained_models[name] = pipeline

    joblib.dump(
        pipeline,
        MODELS / filenames[name]
    )

    results.append({
        "Model": name,
        "CV Accuracy": acc,
        "CV ROC-AUC": auc
    })

    print(f"\n{name}")
    print(f"CV Accuracy: {acc:.4f}")
    print(f"CV ROC-AUC: {auc:.4f}")

# 7. Select best model using cross-validation
results_df = pd.DataFrame(results)

results_df.to_csv(
    OUT / "model_comparison.csv",
    index=False
)

best_name = results_df.sort_values(
    "CV ROC-AUC",
    ascending=False
).iloc[0]["Model"]

best_model = trained_models[best_name]

joblib.dump(
    best_model,
    MODELS / "best_model.joblib"
)

# 8. Evaluate best model
predictions = best_model.predict(X_test)
probabilities = best_model.predict_proba(X_test)[:, 1]

print("\nBEST MODEL:", best_name)

print(
    "\nTest Accuracy:",
    round(accuracy_score(y_test, predictions), 4)
)

print(
    "Test ROC-AUC:",
    round(roc_auc_score(y_test, probabilities), 4)
)

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

print("\nModel training completed successfully!")