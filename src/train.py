import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

DATA_PATH = os.path.join("data", "dry_beans.csv")
MODELS_DIR = "models"
REPORTS_DIR = "reports"
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

FEATURE_NAMES = [
    "Area", "Perimeter", "MajorAxisLength", "MinorAxisLength",
    "AspectRation", "Eccentricity", "ConvexArea", "EquivDiameter",
    "Extent", "Solidity", "roundness", "Compactness",
    "ShapeFactor1", "ShapeFactor2", "ShapeFactor3", "ShapeFactor4"
]
TARGET_NAME = "Class"

def train_and_evaluate():
    print("Loading Dry Bean dataset...")
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_NAMES]
    y = df[TARGET_NAME]

    class_names = sorted(list(y.unique()))
    print(f"Classes ({len(class_names)}): {class_names}")

    # Stratified Train/Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # 1. Model Definitions & Hyperparameter Grids
    models_config = {
        "Logistic Regression": {
            "pipeline": Pipeline([
                ("scaler", StandardScaler()),
                ("classifier", LogisticRegression(max_iter=1000, random_state=42))
            ]),
            "param_grid": {
                "classifier__C": [0.1, 1.0, 10.0],
                "classifier__solver": ["lbfgs", "saga"]
            }
        },
        "Random Forest": {
            "pipeline": Pipeline([
                ("classifier", RandomForestClassifier(random_state=42, n_jobs=-1))
            ]),
            "param_grid": {
                "classifier__n_estimators": [100, 200],
                "classifier__max_depth": [15, 25, None],
                "classifier__min_samples_split": [2, 5]
            }
        },
        "Support Vector Machine (SVM)": {
            "pipeline": Pipeline([
                ("scaler", StandardScaler()),
                ("classifier", SVC(probability=True, random_state=42))
            ]),
            "param_grid": {
                "classifier__C": [1.0, 10.0],
                "classifier__kernel": ["rbf"],
                "classifier__gamma": ["scale", "auto"]
            }
        }
    }

    comparison_results = {}
    fitted_pipelines = {}
    best_overall_score = -1.0
    best_overall_name = None
    best_overall_pipeline = None

    for name, config in models_config.items():
        print(f"\n==========================================")
        print(f"Training & Tuning: {name}")
        print(f"==========================================")

        grid_search = GridSearchCV(
            estimator=config["pipeline"],
            param_grid=config["param_grid"],
            cv=cv,
            scoring="f1_macro",
            n_jobs=-1,
            verbose=1
        )

        start_train_time = time.time()
        grid_search.fit(X_train, y_train)
        train_time = round(time.time() - start_train_time, 3)

        best_pipe = grid_search.best_estimator_
        fitted_pipelines[name] = best_pipe
        best_params = {k.replace("classifier__", ""): v for k, v in grid_search.best_params_.items()}
        print(f"Best CV Macro F1: {grid_search.best_score_:.4f}")
        print(f"Best Parameters: {best_params}")
        print(f"Training Time: {train_time}s")

        # Evaluate on Test Set
        start_pred_time = time.time()
        y_pred = best_pipe.predict(X_test)
        pred_time = round((time.time() - start_pred_time) / len(X_test) * 1000, 4) # ms per sample

        acc = float(accuracy_score(y_test, y_pred))
        macro_p = float(precision_score(y_test, y_pred, average="macro"))
        macro_r = float(recall_score(y_test, y_pred, average="macro"))
        macro_f1 = float(f1_score(y_test, y_pred, average="macro"))
        weighted_f1 = float(f1_score(y_test, y_pred, average="weighted"))

        cm = confusion_matrix(y_test, y_pred, labels=class_names)
        cm_norm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]

        cls_report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True)

        print(f"Test Accuracy: {acc * 100:.2f}%")
        print(f"Test Macro F1: {macro_f1:.4f}")

        comparison_results[name] = {
            "model_name": name,
            "accuracy": round(acc, 4),
            "macro_precision": round(macro_p, 4),
            "macro_recall": round(macro_r, 4),
            "macro_f1": round(macro_f1, 4),
            "weighted_f1": round(weighted_f1, 4),
            "cv_macro_f1": round(float(grid_search.best_score_), 4),
            "best_parameters": best_params,
            "train_time_seconds": train_time,
            "inference_time_ms_per_sample": pred_time,
            "confusion_matrix": cm.tolist(),
            "confusion_matrix_normalized": np.round(cm_norm, 4).tolist(),
            "classification_report": cls_report
        }

        if macro_f1 > best_overall_score:
            best_overall_score = macro_f1
            best_overall_name = name
            best_overall_pipeline = best_pipe

    print(f"\n==========================================")
    print(f"CHAMPION MODEL: {best_overall_name} (Macro F1: {best_overall_score:.4f})")
    print(f"==========================================")

    # Save champion pipeline
    pipeline_path = os.path.join(MODELS_DIR, "dry_bean_pipeline.joblib")
    joblib.dump(best_overall_pipeline, pipeline_path)
    print(f"Saved fitted pipeline to {pipeline_path}")

    # Feature Importance (from Random Forest)
    rf_pipe = fitted_pipelines["Random Forest"]
    rf_model = rf_pipe.named_steps["classifier"]
    feature_importances = dict(zip(FEATURE_NAMES, [round(float(x), 4) for x in rf_model.feature_importances_]))
    sorted_features = sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)

    # Save metrics JSON
    metrics_export = {
        "dataset_name": "UCI Dry Bean Dataset",
        "sample_count": len(df),
        "feature_count": len(FEATURE_NAMES),
        "features": FEATURE_NAMES,
        "classes": class_names,
        "champion_model": best_overall_name,
        "champion_pipeline_path": pipeline_path,
        "models": comparison_results,
        "feature_importance": feature_importances,
        "sorted_feature_importance": [{"feature": k, "importance": v} for k, v in sorted_features],
        "test_set_size": len(X_test),
        "train_set_size": len(X_train),
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    metrics_file = os.path.join(REPORTS_DIR, "metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(metrics_export, f, indent=2)
    print(f"Saved metrics to {metrics_file}")

    # Save confusion matrix details
    cm_export = {
        "classes": class_names,
        "champion_model": best_overall_name,
        "raw_matrix": comparison_results[best_overall_name]["confusion_matrix"],
        "normalized_matrix": comparison_results[best_overall_name]["confusion_matrix_normalized"]
    }
    with open(os.path.join(REPORTS_DIR, "confusion_matrix.json"), "w") as f:
        json.dump(cm_export, f, indent=2)

    # Extract Curated Sample Beans for UI Testing (1 real bean per class)
    samples = {}
    for c in class_names:
        sample_row = df[df[TARGET_NAME] == c].iloc[10] # pick representative row
        sample_dict = {f: float(round(sample_row[f], 4)) for f in FEATURE_NAMES}
        samples[c] = sample_dict

    with open(os.path.join(REPORTS_DIR, "sample_beans.json"), "w") as f:
        json.dump(samples, f, indent=2)
    print("Saved sample_beans.json")

    # Verify reloading
    loaded_pipe = joblib.load(pipeline_path)
    test_sample = pd.DataFrame([samples[class_names[0]]])[FEATURE_NAMES]
    pred = loaded_pipe.predict(test_sample)[0]
    print(f"\nVerification test: Predicted {class_names[0]} sample as: {pred}")

if __name__ == "__main__":
    train_and_evaluate()
