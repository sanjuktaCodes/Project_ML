import pandas as pd
from pathlib import Path

path = Path(__file__).resolve().parent.parent / "data" / "raw" / "heart.csv"

df = pd.read_csv(path)

print("Dataset loaded successfully!")
print("\nShape:", df.shape)
print("\nFirst 5 rows:")
print(df.head())
print("\nColumn names:")
print(df.columns.tolist())
print("\nMissing values:")
print(df.isnull().sum())