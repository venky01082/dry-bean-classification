import os
import json
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "dry_beans.csv")
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "dry_bean_pipeline.joblib")
FEATURE_NAMES = [
    "Area", "Perimeter", "MajorAxisLength", "MinorAxisLength",
    "AspectRation", "Eccentricity", "ConvexArea", "EquivDiameter",
    "Extent", "Solidity", "roundness", "Compactness",
    "ShapeFactor1", "ShapeFactor2", "ShapeFactor3", "ShapeFactor4"
]

def evaluate_pipeline():
    pipeline = joblib.load(MODEL_PATH)
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_NAMES]
    y = df['Class']

    preds = pipeline.predict(X)
    acc = accuracy_score(y, preds)
    macro_f1 = f1_score(y, preds, average='macro')
    print(f"Overall Accuracy across entire dataset: {acc * 100:.2f}%")
    print(f"Overall Macro F1: {macro_f1:.4f}")
    print("\nDetailed Classification Report:")
    print(classification_report(y, preds))

if __name__ == '__main__':
    evaluate_pipeline()
