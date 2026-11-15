import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split

# Project paths
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "raw" / "heart.csv"
OUT = ROOT / "data" / "processed"
OUT.mkdir(parents=True, exist_ok=True)

# 1. Load dataset
df = pd.read_csv(DATA)

print("Original dataset:", df.shape)

# 2. Check missing values
print("Missing values:", df.isnull().sum().sum())

# 3. Remove duplicate records
print("Duplicate records:", df.duplicated().sum())
df = df.drop_duplicates().copy()

print("After removing duplicates:", df.shape)

# 4. Separate features and target
X = df.drop(columns=["target"])
y = df["target"].astype(int)

if not set(y.unique()).issubset({0, 1}):
    raise ValueError("Target must contain only 0 and 1")

# 5. Split into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# 6. Save processed datasets
X_train.to_csv(OUT / "X_train.csv", index=False)
X_test.to_csv(OUT / "X_test.csv", index=False)
y_train.to_csv(OUT / "y_train.csv", index=False)
y_test.to_csv(OUT / "y_test.csv", index=False)

print("\nPreprocessing completed!")
print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))
print("\nTraining class counts:")
print(y_train.value_counts().sort_index())
print("\nFiles saved in data/processed/")