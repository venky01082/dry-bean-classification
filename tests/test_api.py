import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "team" in data

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["total_classes"] == 7

def test_model_info_endpoint(client):
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert data["accuracy"] > 0.85
    assert len(data["classes"]) == 7

def test_samples_endpoint(client):
    response = client.get("/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert len(data["samples"]) == 7

def test_prediction_endpoint(client):
    sample_payload = {
        "Area": 28395.0, "Perimeter": 610.291, "MajorAxisLength": 208.178, "MinorAxisLength": 173.888,
        "AspectRation": 1.197, "Eccentricity": 0.549, "ConvexArea": 28715.0, "EquivDiameter": 190.141,
        "Extent": 0.763, "Solidity": 0.988, "roundness": 0.958, "Compactness": 0.913,
        "ShapeFactor1": 0.007, "ShapeFactor2": 0.003, "ShapeFactor3": 0.834, "ShapeFactor4": 0.999
    }
    response = client.post("/predict", json=sample_payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_class" in data
    assert data["predicted_class"] in ["SEKER", "BARBUNYA", "BOMBAY", "CALI", "DERMASON", "HOROZ", "SIRA"]
    assert data["class_probability"] > 0.0
    assert len(data["probabilities"]) == 7

def test_prediction_validation_failure(client):
    invalid_payload = {
        "Area": -100.0, "Perimeter": 610.291, "MajorAxisLength": 208.178, "MinorAxisLength": 173.888,
        "AspectRation": 1.197, "Eccentricity": 0.549, "ConvexArea": 28715.0, "EquivDiameter": 190.141,
        "Extent": 0.763, "Solidity": 0.988, "roundness": 0.958, "Compactness": 0.913,
        "ShapeFactor1": 0.007, "ShapeFactor2": 0.003, "ShapeFactor3": 0.834, "ShapeFactor4": 0.999
    }
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422
