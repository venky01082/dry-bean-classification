import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "dry_bean_pipeline.joblib")

FEATURE_NAMES = [
    "Area", "Perimeter", "MajorAxisLength", "MinorAxisLength",
    "AspectRation", "Eccentricity", "ConvexArea", "EquivDiameter",
    "Extent", "Solidity", "roundness", "Compactness",
    "ShapeFactor1", "ShapeFactor2", "ShapeFactor3", "ShapeFactor4"
]

class BeanPredictor:
    def __init__(self, model_path=MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}. Train the model first using src/train.py.")
        self.pipeline = joblib.load(model_path)
        self.classes = list(self.pipeline.classes_)

    def predict(self, feature_dict: dict) -> dict:
        df = pd.DataFrame([feature_dict])[FEATURE_NAMES]
        prediction = self.pipeline.predict(df)[0]
        
        probabilities = {}
        confidence = None
        if hasattr(self.pipeline, "predict_proba"):
            probs = self.pipeline.predict_proba(df)[0]
            probabilities = {cls: round(float(prob), 4) for cls, prob in zip(self.classes, probs)}
            confidence = round(float(max(probs)), 4)
            
        return {
            "predicted_class": prediction,
            "confidence": confidence,
            "probabilities": probabilities
        }

    def predict_batch(self, feature_list: list) -> list:
        df = pd.DataFrame(feature_list)[FEATURE_NAMES]
        predictions = self.pipeline.predict(df)
        
        has_proba = hasattr(self.pipeline, "predict_proba")
        probs = self.pipeline.predict_proba(df) if has_proba else None
        
        results = []
        for i, pred in enumerate(predictions):
            p_dict = {}
            conf = None
            if has_proba:
                p_dict = {cls: round(float(p), 4) for cls, p in zip(self.classes, probs[i])}
                conf = round(float(max(probs[i])), 4)
            results.append({
                "predicted_class": pred,
                "confidence": conf,
                "probabilities": p_dict
            })
        return results

if __name__ == "__main__":
    predictor = BeanPredictor()
    sample = {
        "Area": 28395, "Perimeter": 610.291, "MajorAxisLength": 208.178, "MinorAxisLength": 173.888,
        "AspectRation": 1.197, "Eccentricity": 0.549, "ConvexArea": 28715, "EquivDiameter": 190.141,
        "Extent": 0.763, "Solidity": 0.988, "roundness": 0.958, "Compactness": 0.913,
        "ShapeFactor1": 0.007, "ShapeFactor2": 0.003, "ShapeFactor3": 0.834, "ShapeFactor4": 0.999
    }
    result = predictor.predict(sample)
    print("Test Prediction:", result)
