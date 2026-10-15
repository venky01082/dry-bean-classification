import os
import sys
import time
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, f1_score, classification_report

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "dry_beans.csv")

FEATURE_NAMES = [
    "Area", "Perimeter", "MajorAxisLength", "MinorAxisLength",
    "AspectRation", "Eccentricity", "ConvexArea", "EquivDiameter",
    "Extent", "Solidity", "roundness", "Compactness",
    "ShapeFactor1", "ShapeFactor2", "ShapeFactor3", "ShapeFactor4"
]

def run_hyperparameter_tuning_demo():
    print("=" * 75)
    print("🔬 DEDICATED HYPERPARAMETER TUNING & OPTIMIZATION MODULE")
    print("=" * 75)
    print("Method: Stratified 5-Fold Cross-Validation via GridSearchCV")
    print("Scoring Metric: Macro F1-Score (ensures equal weight across all 7 classes)\n")
    
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_NAMES]
    y = df["Class"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    tuning_configs = {
        "Logistic Regression": {
            "default_model": Pipeline([
                ("scaler", StandardScaler()),
                ("classifier", LogisticRegression(max_iter=1000, random_state=42))
            ]),
            "pipeline": Pipeline([
                ("scaler", StandardScaler()),
                ("classifier", LogisticRegression(max_iter=1000, random_state=42))
            ]),
            "grid": {
                "classifier__C": [0.1, 1.0, 10.0],
                "classifier__solver": ["lbfgs", "saga"]
            }
        },
        "Random Forest": {
            "default_model": Pipeline([
                ("classifier", RandomForestClassifier(random_state=42, n_jobs=-1))
            ]),
            "pipeline": Pipeline([
                ("classifier", RandomForestClassifier(random_state=42, n_jobs=-1))
            ]),
            "grid": {
                "classifier__n_estimators": [100, 200],
                "classifier__max_depth": [15, 25, None],
                "classifier__min_samples_split": [2, 5]
            }
        },
        "Support Vector Machine (SVM)": {
            "default_model": Pipeline([
                ("scaler", StandardScaler()),
                ("classifier", SVC(probability=True, random_state=42))
            ]),
            "pipeline": Pipeline([
                ("scaler", StandardScaler()),
                ("classifier", SVC(probability=True, random_state=42))
            ]),
            "grid": {
                "classifier__C": [1.0, 10.0],
                "classifier__kernel": ["rbf"],
                "classifier__gamma": ["scale", "auto"]
            }
        }
    }
    
    summary_results = []
    
    for name, config in tuning_configs.items():
        print("-" * 75)
        print(f"📌 Tuning Candidate: {name}")
        print(f"Search Grid: {config['grid']}")
        
        # 1. Evaluate baseline default model before tuning
        config["default_model"].fit(X_train, y_train)
        def_pred = config["default_model"].predict(X_test)
        def_acc = accuracy_score(y_test, def_pred)
        def_f1 = f1_score(y_test, def_pred, average="macro")
        
        # 2. Run GridSearchCV
        print("Running 5-fold cross validation across all parameter combinations...")
        t0 = time.time()
        grid_search = GridSearchCV(
            estimator=config["pipeline"],
            param_grid=config["grid"],
            cv=cv,
            scoring="f1_macro",
            n_jobs=-1
        )
        grid_search.fit(X_train, y_train)
        tuning_time = round(time.time() - t0, 2)
        
        best_pipe = grid_search.best_estimator_
        best_params = {k.replace("classifier__", ""): v for k, v in grid_search.best_params_.items()}
        
        # 3. Evaluate tuned model on held-out test set
        tuned_pred = best_pipe.predict(X_test)
        tuned_acc = accuracy_score(y_test, tuned_pred)
        tuned_f1 = f1_score(y_test, tuned_pred, average="macro")
        
        f1_improvement = (tuned_f1 - def_f1) * 100
        
        print(f"Optimal Parameters: {best_params}")
        print(f"Best 5-Fold CV Score: {grid_search.best_score_*100:.2f}%")
        print(f"Default Test Macro F1: {def_f1*100:.2f}%  -->  Tuned Test Macro F1: {tuned_f1*100:.2f}%")
        print(f"Optimization Time: {tuning_time}s\n")
        
        summary_results.append({
            "Model": name,
            "Default F1 (%)": round(def_f1 * 100, 2),
            "Tuned F1 (%)": round(tuned_f1 * 100, 2),
            "Improvement (%)": f"+{f1_improvement:.2f}%" if f1_improvement >= 0 else f"{f1_improvement:.2f}%",
            "Tuned Accuracy (%)": round(tuned_acc * 100, 2),
            "Optimal Hyperparameters": str(best_params)
        })
        
    print("=" * 75)
    print("📊 HYPERPARAMETER TUNING IMPACT SUMMARY TABLE")
    print("=" * 75)
    res_df = pd.DataFrame(summary_results)
    print(res_df.to_string(index=False))
    print("=" * 75)

if __name__ == "__main__":
    run_hyperparameter_tuning_demo()
