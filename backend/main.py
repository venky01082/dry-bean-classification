import os
import sys
import json
import joblib
import pandas as pd
from typing import Dict, Any
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.schemas import (
    BeanFeatures, BatchBeanFeatures, PredictionResponse,
    BatchPredictionResponse, ModelInfoResponse, HealthResponse
)

MODEL_PATH = os.path.join(BASE_DIR, "models", "dry_bean_pipeline.joblib")
METRICS_PATH = os.path.join(BASE_DIR, "reports", "metrics.json")
SAMPLES_PATH = os.path.join(BASE_DIR, "reports", "sample_beans.json")
CONFUSION_PATH = os.path.join(BASE_DIR, "reports", "confusion_matrix.json")
EDA_PATH = os.path.join(BASE_DIR, "reports", "eda_summary.json")

FEATURE_NAMES = [
    "Area", "Perimeter", "MajorAxisLength", "MinorAxisLength",
    "AspectRation", "Eccentricity", "ConvexArea", "EquivDiameter",
    "Extent", "Solidity", "roundness", "Compactness",
    "ShapeFactor1", "ShapeFactor2", "ShapeFactor3", "ShapeFactor4"
]

BEAN_DESCRIPTIONS = {
    "SEKER": "Small, rounded dry bean with high compactness and roundness. Common Turkish variety prized for quick cooking and silky texture in soups and purees.",
    "BARBUNYA": "Medium-oval variety with characteristic speckled patterning (borlotti type). Hearty texture with sweet, chestnut-like flavor.",
    "BOMBAY": "Largest dry bean variety by surface area and diameter. Plump, flattened white runner bean with exceptional creaminess when cooked.",
    "CALI": "Large, elongated kidney-style bean. Substantial meatiness, retains firmness during long braising, popular for traditional salads and casseroles.",
    "DERMASON": "Medium-small, round-oval white bean. The most widely cultivated commercial dry bean in Turkey, balanced geometric profile.",
    "HOROZ": "Long, slender cylindrical white bean characterized by high aspect ratio and eccentricity. Distinctive shape known as rooster bean.",
    "SIRA": "Medium-compact white bean slightly smaller and flatter than Dermason, high solidity and uniform shape."
}

# Global state
app_state: Dict[str, Any] = {
    "pipeline": None,
    "metrics": None,
    "samples": None,
    "confusion": None,
    "eda": None,
    "classes": []
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model and metrics on startup
    if os.path.exists(MODEL_PATH):
        try:
            app_state["pipeline"] = joblib.load(MODEL_PATH)
            app_state["classes"] = list(app_state["pipeline"].classes_)
            print(f"Loaded ML pipeline from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading pipeline: {e}")
    else:
        print(f"Warning: Model not found at {MODEL_PATH}")

    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            app_state["metrics"] = json.load(f)

    if os.path.exists(SAMPLES_PATH):
        with open(SAMPLES_PATH, "r") as f:
            app_state["samples"] = json.load(f)

    if os.path.exists(CONFUSION_PATH):
        with open(CONFUSION_PATH, "r") as f:
            app_state["confusion"] = json.load(f)

    if os.path.exists(EDA_PATH):
        with open(EDA_PATH, "r") as f:
            app_state["eda"] = json.load(f)

    yield

app = FastAPI(
    title="BeanAI — Dry Bean Classification API",
    description="Production-grade Machine Learning REST API for predicting dry bean varieties from 16 morphological measurements.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
def root():
    return {
        "project": "Dry Bean Classification System (BeanAI)",
        "course": "B.Tech AI & Data Science",
        "team": ["24EU01007", "24EU01046", "24EU01055"],
        "status": "online",
        "docs_url": "/docs",
        "dataset": "UCI Dry Bean Dataset (13,611 samples, 16 features, 7 varieties)"
    }

@app.get("/health", response_model=HealthResponse, tags=["General"])
def health():
    pipeline = app_state.get("pipeline")
    metrics = app_state.get("metrics") or {}
    return HealthResponse(
        status="healthy" if pipeline is not None else "degraded",
        model_loaded=pipeline is not None,
        champion_model=metrics.get("champion_model", "Unknown"),
        total_classes=len(app_state.get("classes", []))
    )

@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
def model_info():
    metrics = app_state.get("metrics")
    if not metrics:
        raise HTTPException(status_code=503, detail="Model metrics have not been generated yet.")
    
    champ_name = metrics["champion_model"]
    champ_data = metrics["models"][champ_name]
    
    return ModelInfoResponse(
        model_name=champ_name,
        accuracy=champ_data["accuracy"],
        macro_f1=champ_data["macro_f1"],
        weighted_f1=champ_data["weighted_f1"],
        cv_macro_f1=champ_data["cv_macro_f1"],
        best_parameters=champ_data["best_parameters"],
        dataset_samples=metrics["sample_count"],
        feature_count=metrics["feature_count"],
        classes=metrics["classes"],
        sorted_feature_importance=metrics["sorted_feature_importance"]
    )

@app.get("/metrics", tags=["Model"])
def get_metrics():
    if not app_state.get("metrics"):
        raise HTTPException(status_code=503, detail="Metrics not available.")
    return {
        "metrics": app_state["metrics"],
        "confusion": app_state.get("confusion"),
        "eda": app_state.get("eda")
    }

@app.get("/samples", tags=["Data"])
def get_samples():
    if not app_state.get("samples"):
        raise HTTPException(status_code=503, detail="Sample beans not available.")
    return {
        "samples": app_state["samples"],
        "descriptions": BEAN_DESCRIPTIONS
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(bean: BeanFeatures):
    pipeline = app_state.get("pipeline")
    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model pipeline is not loaded."
        )

    data_dict = bean.model_dump()
    df = pd.DataFrame([data_dict])[FEATURE_NAMES]

    try:
        prediction = pipeline.predict(df)[0]
        classes = app_state.get("classes", [])
        
        probabilities = {}
        confidence = 1.0
        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba(df)[0]
            probabilities = {cls: round(float(p), 4) for cls, p in zip(classes, probs)}
            confidence = round(float(max(probs)), 4)

        metrics = app_state.get("metrics") or {}
        model_name = metrics.get("champion_model", "Tuned Classifier Pipeline")

        return PredictionResponse(
            predicted_class=prediction,
            class_probability=confidence,
            model=model_name,
            probabilities=probabilities,
            bean_description=BEAN_DESCRIPTIONS.get(prediction, "Classified Dry Bean Variety")
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/predict-batch", response_model=BatchPredictionResponse, tags=["Prediction"])
def predict_batch(batch: BatchBeanFeatures):
    pipeline = app_state.get("pipeline")
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Model pipeline is not loaded.")

    if not batch.beans:
        raise HTTPException(status_code=400, detail="Empty bean batch provided.")

    df_list = [b.model_dump() for b in batch.beans]
    df = pd.DataFrame(df_list)[FEATURE_NAMES]

    try:
        predictions = pipeline.predict(df)
        classes = app_state.get("classes", [])
        has_proba = hasattr(pipeline, "predict_proba")
        probs = pipeline.predict_proba(df) if has_proba else None

        metrics = app_state.get("metrics") or {}
        model_name = metrics.get("champion_model", "Tuned Classifier Pipeline")

        results = []
        for i, pred in enumerate(predictions):
            p_dict = {}
            conf = 1.0
            if has_proba:
                p_dict = {cls: round(float(p), 4) for cls, p in zip(classes, probs[i])}
                conf = round(float(max(probs[i])), 4)
            results.append(PredictionResponse(
                predicted_class=pred,
                class_probability=conf,
                model=model_name,
                probabilities=p_dict,
                bean_description=BEAN_DESCRIPTIONS.get(pred, "")
            ))

        return BatchPredictionResponse(count=len(results), predictions=results)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Batch prediction error: {str(e)}")
