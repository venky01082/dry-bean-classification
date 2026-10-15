import os
import joblib
import numpy as np
import pandas as pd
import pytest

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "dry_bean_pipeline.joblib")
FEATURE_NAMES = [
    "Area", "Perimeter", "MajorAxisLength", "MinorAxisLength",
    "AspectRation", "Eccentricity", "ConvexArea", "EquivDiameter",
    "Extent", "Solidity", "roundness", "Compactness",
    "ShapeFactor1", "ShapeFactor2", "ShapeFactor3", "ShapeFactor4"
]

@pytest.fixture
def pipeline():
    assert os.path.exists(MODEL_PATH), "Model file missing"
    return joblib.load(MODEL_PATH)

@pytest.fixture
def sample_bean():
    return {
        "Area": 28395.0, "Perimeter": 610.291, "MajorAxisLength": 208.178, "MinorAxisLength": 173.888,
        "AspectRation": 1.197, "Eccentricity": 0.549, "ConvexArea": 28715.0, "EquivDiameter": 190.141,
        "Extent": 0.763, "Solidity": 0.988, "roundness": 0.958, "Compactness": 0.913,
        "ShapeFactor1": 0.007, "ShapeFactor2": 0.003, "ShapeFactor3": 0.834, "ShapeFactor4": 0.999
    }

def test_pipeline_classes(pipeline):
    expected_classes = {'BARBUNYA', 'BOMBAY', 'CALI', 'DERMASON', 'HOROZ', 'SEKER', 'SIRA'}
    assert set(pipeline.classes_) == expected_classes

def test_single_prediction(pipeline, sample_bean):
    df = pd.DataFrame([sample_bean])[FEATURE_NAMES]
    pred = pipeline.predict(df)
    assert len(pred) == 1
    assert pred[0] in pipeline.classes_

def test_probability_distribution(pipeline, sample_bean):
    df = pd.DataFrame([sample_bean])[FEATURE_NAMES]
    if hasattr(pipeline, "predict_proba"):
        probs = pipeline.predict_proba(df)[0]
        assert len(probs) == 7
        assert np.isclose(sum(probs), 1.0, atol=1e-3)
        assert all(0 <= p <= 1 for p in probs)
