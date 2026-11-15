"""Step 12: save a grounded dataset quality and coding audit.
Run from project root: python src/dataset_audit.py
"""
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "heart.csv"
OUT = ROOT / "outputs" / "validation"
OUT.mkdir(parents=True, exist_ok=True)

original = pd.read_csv(RAW)
df = original.drop_duplicates()

print("Original records:", len(original))
print("Duplicate records:", original.duplicated().sum())
print("Unique records:", len(df))
print("Missing values:", int(original.isna().sum().sum()))
print("Unique target classes:", sorted(df["target"].dropna().unique().tolist()))
print("Target distribution:\n", df["target"].value_counts().sort_index())

categorical = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal", "target"]
rows = []
for column in df.columns:
    values = sorted(df[column].dropna().unique().tolist())
    rows.append({
        "feature": column,
        "kind": "coded category" if column in categorical else "numeric",
        "minimum": df[column].min(),
        "maximum": df[column].max(),
        "distinct_values": len(values),
        "observed_codes": ", ".join(map(str, values)) if column in categorical else "",
        "missing_values": int(df[column].isna().sum()),
    })

pd.DataFrame(rows).to_csv(OUT / "dataset_audit.csv", index=False)
print("\nSaved:", OUT / "dataset_audit.csv")
print("Confirm code meanings and target definitions with the dataset source before labeling them in the UI/report.")
