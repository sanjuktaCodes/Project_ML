import numpy as np
import pandas as pd
import shap

from functools import lru_cache
from sklearn.linear_model import LogisticRegression
from lime.lime_tabular import LimeTabularExplainer

from services.model_service import (
    ROOT, model, FEATURES, CATEGORICAL
)


@lru_cache(maxsize=1)
def get_explainers():

    train = pd.read_csv(
        ROOT / "data" / "processed" / "X_train.csv"
    )[FEATURES]

    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["classifier"]

    if not isinstance(classifier, LogisticRegression):
        raise RuntimeError(
            "This SHAP implementation requires "
            "Logistic Regression."
        )

    encoded = preprocessor.transform(train)

    if hasattr(encoded, "toarray"):
        encoded = encoded.toarray()

    encoded_names = list(
        preprocessor.get_feature_names_out()
    )

    encoded_df = pd.DataFrame(
        encoded,
        columns=encoded_names
    )

    # Create SHAP explainer
    shap_explainer = shap.LinearExplainer(
        classifier,
        encoded_df
    )

    # Create LIME explainer
    categorical_indices = [
        FEATURES.index(col)
        for col in CATEGORICAL
    ]

    lime_explainer = LimeTabularExplainer(
        training_data=train.to_numpy(dtype=float),
        feature_names=FEATURES,
        class_names=["Class 0", "Class 1"],
        categorical_features=categorical_indices,
        mode="classification",
        discretize_continuous=True,
        random_state=42
    )

    return (
        preprocessor,
        shap_explainer,
        lime_explainer,
        encoded_names
    )


def explain_patient(patient_df):

    preprocessor, shap_exp, lime_exp, names = (
        get_explainers()
    )

    # ---------- SHAP ----------
    encoded = preprocessor.transform(patient_df)

    if hasattr(encoded, "toarray"):
        encoded = encoded.toarray()

    encoded_df = pd.DataFrame(
        encoded, columns=names
    )

    shap_values = shap_exp(encoded_df).values[0]

    # Combine one-hot contributions into original features
    shap_results = []

    for feature in FEATURES:

        if feature in CATEGORICAL:
            indices = [
                i for i, name in enumerate(names)
                if name.startswith(f"cat__{feature}_")
            ]
        else:
            indices = [
                i for i, name in enumerate(names)
                if name == f"num__{feature}"
            ]

        if not indices:
            raise RuntimeError(
                f"SHAP mapping failed for {feature}"
            )

        contribution = float(
            np.sum(shap_values[indices])
        )

        shap_results.append({
            "feature": feature,
            "value": round(contribution, 6)
        })

    shap_results.sort(
        key=lambda x: abs(x["value"]),
        reverse=True
    )

    # ---------- LIME ----------
    def predict_fn(rows):

        df = pd.DataFrame(
            rows,
            columns=FEATURES
        )

        for col in CATEGORICAL:
            df[col] = df[col].round().astype(int)

        return model.predict_proba(df)

    explanation = lime_exp.explain_instance(
        data_row=patient_df.iloc[0].to_numpy(
            dtype=float
        ),
        predict_fn=predict_fn,
        labels=(1,),
        num_features=len(FEATURES),
        num_samples=3000
    )

    lime_map = explanation.as_map()[1]
    lime_rules = explanation.as_list(label=1)

    lime_results = []

    for (feature_index, weight), (rule, _) in zip(
        lime_map, lime_rules
    ):
        lime_results.append({
            "feature": FEATURES[feature_index],
            "rule": rule,
            "weight": round(float(weight), 6)
        })

    lime_results.sort(
        key=lambda x: abs(x["weight"]),
        reverse=True
    )

    return {
        "shap": {
            "unit": "log_odds",
            "base_value": float(shap_exp.expected_value),
            "features": shap_results
        },
        "lime": {
            "unit": "local_probability_surrogate",
            "features": lime_results
        }
    }