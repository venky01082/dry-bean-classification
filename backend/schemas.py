from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class BeanFeatures(BaseModel):
    Area: float = Field(..., gt=0, description="Area of the bean zone in pixels")
    Perimeter: float = Field(..., gt=0, description="Circumference length of the bean boundary")
    MajorAxisLength: float = Field(..., gt=0, description="Longest distance along bean axis")
    MinorAxisLength: float = Field(..., gt=0, description="Shortest distance perpendicular to main axis")
    AspectRation: float = Field(..., gt=0, description="Ratio between MajorAxisLength and MinorAxisLength")
    Eccentricity: float = Field(..., ge=0, le=1.0, description="Eccentricity of the ellipse having the same moments")
    ConvexArea: float = Field(..., gt=0, description="Number of pixels in smallest convex polygon")
    EquivDiameter: float = Field(..., gt=0, description="Diameter of a circle with the same area")
    Extent: float = Field(..., ge=0, le=1.0, description="Ratio of bean area to bounding box area")
    Solidity: float = Field(..., ge=0, le=1.0, description="Ratio of bean area to convex area")
    roundness: float = Field(..., ge=0, le=1.0, description="Roundness measure (4*pi*Area / Perimeter^2)")
    Compactness: float = Field(..., ge=0, le=1.0, description="Compactness of the bean (Ed / L)")
    ShapeFactor1: float = Field(..., gt=0, description="Shape factor 1 (MajorAxisLength / Area)")
    ShapeFactor2: float = Field(..., gt=0, description="Shape factor 2 (MinorAxisLength / Area)")
    ShapeFactor3: float = Field(..., gt=0, description="Shape factor 3 (Area / MajorAxisLength^2 * 4 / pi)")
    ShapeFactor4: float = Field(..., gt=0, description="Shape factor 4 (Area / (MajorAxisLength * MinorAxisLength * pi / 4))")

    model_config = {
        "json_schema_extra": {
            "example": {
                "Area": 28395.0,
                "Perimeter": 610.291,
                "MajorAxisLength": 208.178,
                "MinorAxisLength": 173.888,
                "AspectRation": 1.197,
                "Eccentricity": 0.549,
                "ConvexArea": 28715.0,
                "EquivDiameter": 190.141,
                "Extent": 0.763,
                "Solidity": 0.988,
                "roundness": 0.958,
                "Compactness": 0.913,
                "ShapeFactor1": 0.007,
                "ShapeFactor2": 0.003,
                "ShapeFactor3": 0.834,
                "ShapeFactor4": 0.999
            }
        }
    }

class BatchBeanFeatures(BaseModel):
    beans: List[BeanFeatures]

class PredictionResponse(BaseModel):
    predicted_class: str
    class_probability: float
    model: str
    probabilities: Dict[str, float]
    bean_description: Optional[str] = None

class BatchPredictionResponse(BaseModel):
    count: int
    predictions: List[PredictionResponse]

class ModelInfoResponse(BaseModel):
    model_name: str
    accuracy: float
    macro_f1: float
    weighted_f1: float
    cv_macro_f1: float
    best_parameters: Dict[str, object]
    dataset_samples: int
    feature_count: int
    classes: List[str]
    sorted_feature_importance: List[Dict[str, object]]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    champion_model: str
    total_classes: int
