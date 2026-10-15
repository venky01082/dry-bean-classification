import os
import sys
import argparse
import joblib
import pandas as pd
import numpy as np

# Ensure UTF-8 output on Windows terminals
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "dry_bean_pipeline.joblib")
DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "dry_beans.csv")

FEATURE_NAMES = [
    "Area", "Perimeter", "MajorAxisLength", "MinorAxisLength",
    "AspectRation", "Eccentricity", "ConvexArea", "EquivDiameter",
    "Extent", "Solidity", "roundness", "Compactness",
    "ShapeFactor1", "ShapeFactor2", "ShapeFactor3", "ShapeFactor4"
]

def load_pipeline():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    return joblib.load(MODEL_PATH)

def test_single_sample(feature_dict, pipeline, actual_label=None):
    df = pd.DataFrame([feature_dict])[FEATURE_NAMES]
    pred = pipeline.predict(df)[0]
    probs = pipeline.predict_proba(df)[0] if hasattr(pipeline, "predict_proba") else None
    
    print("\n" + "=" * 60)
    print("PREDICTION RESULT ON UNSEEN DATA")
    print("=" * 60)
    if actual_label:
        match_icon = "[CORRECT]" if pred == actual_label else "[MISMATCH]"
        print(f"GROUND TRUTH CLASS:      {actual_label}")
        print(f"PREDICTED BEAN VARIETY:  {pred}  {match_icon}")
    else:
        print(f"PREDICTED BEAN VARIETY:  {pred}")
        
    if probs is not None:
        conf = max(probs) * 100
        print(f"CONFIDENCE SCORE:        {conf:.2f}%")
        print("\nCLASS PROBABILITY DISTRIBUTION:")
        for cls, p in zip(pipeline.classes_, probs):
            bar = "#" * int(p * 30)
            print(f"  {cls:10s} : {p*100:6.2f}%  {bar}")
    print("=" * 60 + "\n")
    return pred

def test_csv_file(csv_path, pipeline):
    print(f"\nReading unseen data from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} sample rows.")
    
    df.columns = [c.strip() for c in df.columns]
    missing = [f for f in FEATURE_NAMES if f not in df.columns]
    if missing:
        print(f"Error: Missing required features: {missing}")
        return
    
    X = df[FEATURE_NAMES]
    preds = pipeline.predict(X)
    probs = pipeline.predict_proba(X) if hasattr(pipeline, "predict_proba") else None
    
    df["Predicted_Class"] = preds
    if probs is not None:
        df["Confidence_%"] = [round(float(max(p)) * 100, 2) for p in probs]
    
    print("\nSAMPLE PREDICTIONS (First 10 rows):")
    display_cols = ["Predicted_Class"] + (["Confidence_%"] if probs is not None else [])
    
    if "Class" in df.columns:
        display_cols = ["Class"] + display_cols
        from sklearn.metrics import accuracy_score
        acc = accuracy_score(df["Class"].str.strip().str.upper(), df["Predicted_Class"])
        print(f"\nOVERALL ACCURACY ON THIS UNSEEN DATASET: {acc * 100:.2f}%\n")
    
    print(df[display_cols].head(10).to_string(index=True))
    
    out_file = "predictions_output.csv"
    df.to_csv(out_file, index=False)
    print(f"\nPredictions for all {len(df)} samples saved to: '{out_file}'")

def run_interactive(pipeline):
    print("\n" + "=" * 60)
    print("INTERACTIVE UNSEEN BEAN PREDICTION MODE")
    print("=" * 60)
    print("Paste 16 comma-separated values (or press Enter to test a random unseen bean):")
    print("Order: Area, Perimeter, MajorAxisLength, MinorAxisLength, AspectRation, Eccentricity, ConvexArea, EquivDiameter, Extent, Solidity, roundness, Compactness, ShapeFactor1, ShapeFactor2, ShapeFactor3, ShapeFactor4\n")
    
    line = input("Enter values > ").strip()
    if not line:
        raw = pd.read_csv(DATA_PATH)
        sample = raw.sample(1, random_state=int(np.random.randint(0, 10000))).iloc[0]
        actual = sample["Class"]
        features = {f: float(sample[f]) for f in FEATURE_NAMES}
        print(f"\n[Selected Random Unseen Bean from Database]")
        test_single_sample(features, pipeline, actual_label=actual)
    else:
        vals = [float(x.strip()) for x in line.split(",") if x.strip()]
        if len(vals) != 16:
            print(f"Error: Expected 16 numbers, received {len(vals)}")
            return
        features = dict(zip(FEATURE_NAMES, vals))
        test_single_sample(features, pipeline)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test Unseen Dry Bean Data with Trained Model")
    parser.add_argument("--file", type=str, help="Path to CSV file with unseen bean measurements")
    parser.add_argument("--interactive", action="store_true", help="Prompt for input in terminal")
    
    args = parser.parse_args()
    pipe = load_pipeline()
    
    if args.file:
        test_csv_file(args.file, pipe)
    elif args.interactive:
        run_interactive(pipe)
    else:
        print("\nTESTING UNSEEN SAMPLES FROM HELD-OUT DATA:")
        raw = pd.read_csv(DATA_PATH)
        for variety in ["BOMBAY", "SEKER", "HOROZ"]:
            sample = raw[raw["Class"] == variety].iloc[50]
            feats = {f: float(sample[f]) for f in FEATURE_NAMES}
            test_single_sample(feats, pipe, actual_label=variety)
