# 🌱 BeanAI — Intelligent Dry Bean Classification System

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.6+-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/Academic-B.Tech_AI_%26_DS-blue)]()

An end-to-end Machine Learning system and modern interactive web dashboard for classifying **7 registered dry bean cultivars** from **16 morphological measurements** extracted from seed imagery.

Built for **B.Tech Artificial Intelligence & Data Science**.

---

## 👥 Project Team & Responsibilities

| Student ID | Role | Key Contributions |
| :--- | :--- | :--- |
| **`24EU01007`** | **Data Engineering & EDA Lead** | UCI dataset acquisition, data validation, exploratory data analysis, correlation heatmaps, feature distribution boxplots, stratified train/test split. |
| **`24EU01046`** | **ML Modeling & Tuning Lead** | Model pipeline construction, comparison of 3 models (Logistic Regression, Random Forest, SVM), 5-fold Stratified CV hyperparameter tuning, model serialization (`joblib`). |
| **`24EU01055`** | **Backend & Frontend Lead** | FastAPI RESTful API with Pydantic validation, React + Vite dashboard, Recharts visualizations, 1-click real bean presets, integration & automated test suite. |

---

## 🏛️ System Architecture

```
                      +---------------------------------------+
                      |       UCI Dry Bean Dataset (602)      |
                      |       13,611 rows x 16 features       |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Stratified 80/20 Split        |
                      |      Train: 10,888 | Test: 2,723      |
                      +---------------------------------------+
                                          |
                        +-----------------+-----------------+
                        |                 |                 |
                        v                 v                 v
                 [Logistic Reg.]   [Random Forest]     [SVM (RBF)]
                   Scaled + CV       Ensemble + CV     Scaled + CV
                        |                 |                 |
                        +-----------------+-----------------+
                                          |
                                          v
                      +---------------------------------------+
                      |   Champion Pipeline: SVM (RBF Kernel) |
                      |   Accuracy: 92.43% | Macro F1: 0.9361 |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |      Serialized Pipeline (.joblib)    |
                      |    models/dry_bean_pipeline.joblib    |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |            FastAPI Backend            |
                      |        http://127.0.0.1:8000          |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         React + Vite Dashboard        |
                      |        http://localhost:5173          |
                      +---------------------------------------+
```

---

## 📊 Experimental Results (Test Set: N = 2,723)

All candidates were tuned via **Stratified 5-Fold Cross Validation** on training folds, then evaluated on the untouched held-out test split:

| Model | Test Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 | 5-Fold CV F1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Support Vector Machine (SVM) 🏆** | **92.43%** | **93.85%** | **93.42%** | **0.9361** | **0.9242** | **0.9443** |
| **Logistic Regression** | 92.14% | 93.60% | 93.10% | 0.9332 | 0.9213 | 0.9368 |
| **Random Forest** | 91.88% | 93.48% | 92.83% | 0.9313 | 0.9186 | 0.9358 |

### The 7 Dry Bean Classes:
1. `DERMASON` (3,546 samples) — Balanced, commercial round-oval white bean.
2. `SIRA` (2,636 samples) — Compact white bean, slightly flatter.
3. `SEKER` (2,027 samples) — High roundness (0.958) and compactness.
4. `HOROZ` (1,928 samples) — Slender, elongated cylindrical rooster bean.
5. `CALI` (1,630 samples) — Large kidney-shaped cultivar.
6. `BARBUNYA` (1,322 samples) — Speckled borlotti-type variety.
7. `BOMBAY` (522 samples) — Giant runner bean (>150,000 px² area).

---

## 📁 Repository Directory Structure

```
Dry Bean/
├── backend/
│   ├── main.py              # FastAPI application, CORS & prediction routes
│   └── schemas.py           # Pydantic data schemas & 16-feature validation
├── data/
│   └── dry_beans.csv        # Cleaned UCI dataset (13,611 rows x 17 cols)
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar & UI components
│   │   ├── pages/           # Dashboard, Prediction, Performance, About
│   │   ├── api.js           # REST API client with offline fallback
│   │   ├── index.css        # Professional modern stylesheet
│   │   └── App.jsx          # Root application component
│   ├── package.json
│   └── vite.config.js
├── models/
│   └── dry_bean_pipeline.joblib   # Fitted StandardScaler + SVM pipeline
├── notebooks/
│   ├── 01_eda.ipynb         # Academic Jupyter Notebook for presentation
│   └── eda.py               # Statistical profiling & plot generator
├── reports/
│   ├── class_distribution.png
│   ├── correlation_heatmap.png
│   ├── feature_boxplots.png
│   ├── metrics.json         # Real model metrics & hyperparameters
│   ├── confusion_matrix.json# 7x7 raw and normalized matrices
│   ├── sample_beans.json    # Real curated bean records for UI presets
│   └── presentation_guide.md# 12-slide Viva / Presentation guide
├── src/
│   ├── data_loader.py       # UCI dataset acquisition & validation
│   ├── train.py             # 3-model CV grid search & pipeline exporter
│   ├── evaluate.py          # Detailed metric evaluation
│   └── predict.py           # Standalone Python predictor module
├── tests/
│   ├── test_model.py        # Model consistency & probability unit tests
│   └── test_api.py          # FastAPI endpoint integration tests
├── requirements.txt         # Python dependencies
└── README.md                # Project documentation
```

---

## ⚡ Quick Start Guide (Windows PowerShell)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Setup Python Environment
```powershell
# Install required Python dependencies
python -m pip install -r requirements.txt
```

### 3. Run Automated Tests
```powershell
python -m pytest tests/ -v
```
*All 9 unit tests verify pipeline persistence, probability consistency, and API validation.*

### 4. Start the FastAPI Backend
```powershell
uvicorn backend.main:app --reload --port 8000
```
- Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- API Health Status: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 5. Start the React Frontend Dashboard
In a new terminal window:
```powershell
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🌐 API Reference

### `POST /predict`
Predict the dry bean variety from 16 measurements.
```json
{
  "Area": 28395,
  "Perimeter": 610.291,
  "MajorAxisLength": 208.178,
  "MinorAxisLength": 173.888,
  "AspectRation": 1.197,
  "Eccentricity": 0.549,
  "ConvexArea": 28715,
  "EquivDiameter": 190.141,
  "Extent": 0.763,
  "Solidity": 0.988,
  "roundness": 0.958,
  "Compactness": 0.913,
  "ShapeFactor1": 0.0073,
  "ShapeFactor2": 0.0031,
  "ShapeFactor3": 0.834,
  "ShapeFactor4": 0.999
}
```

**Response:**
```json
{
  "predicted_class": "SEKER",
  "class_probability": 0.8225,
  "model": "Support Vector Machine (SVM)",
  "probabilities": {
    "BARBUNYA": 0.0008,
    "BOMBAY": 0.0004,
    "CALI": 0.0025,
    "DERMASON": 0.1666,
    "HOROZ": 0.0006,
    "SEKER": 0.8225,
    "SIRA": 0.0065
  },
  "bean_description": "Small, rounded dry bean with high compactness and roundness..."
}
```

---

## 📚 Scientific Reference

> Koklu, M. and Ozkan, I.A., (2020), *"Multiclass Classification of Dry Beans Using Computer Vision and Machine Learning Techniques."* **Computers and Electronics in Agriculture**, 174, 105507.  
> DOI: [10.1016/j.compag.2020.105507](https://doi.org/10.1016/j.compag.2020.105507)  
> Dataset: [UCI Machine Learning Repository — Dry Bean Dataset](https://archive.ics.uci.edu/dataset/602/dry+bean+dataset)
