# 🎯 Dry Bean Classification System — Final Project Presentation Guide
**Course:** B.Tech in Artificial Intelligence & Data Science  
**Project Title:** Dry Bean Classification Using Machine Learning with FastAPI & React Dashboard  
**Team Members:** `24EU01007`, `24EU01046`, `24EU01055`  
**Dataset:** UCI Dry Bean Dataset (13,611 samples, 16 features, 7 varieties)

---

## 📽️ 12-Slide Presentation Structure (Viva / Project Defense)

### Slide 1: Title & Team Introductions
- **Project Title:** BeanAI — Intelligent Dry Bean Classification System
- **Academic Program:** B.Tech Artificial Intelligence & Data Science
- **Team Roster & Work Distribution:**
  - `24EU01007`: Dataset Acquisition, Exploratory Data Analysis, Data Preprocessing & Validation
  - `24EU01046`: ML Pipeline Design, Model Comparison (LR, RF, SVM), Hyperparameter Tuning, Evaluation
  - `24EU01055`: FastAPI Backend Architecture, React Dashboard, Real-time Visualizations, Integration
- **Key Deliverable:** End-to-end operational Machine Learning pipeline coupled with interactive web frontend.

---

### Slide 2: Problem Statement & Industrial Motivation
- **Context:** Turkey is a leading global producer of dry beans (*Phaseolus vulgaris L.*). Different registered commercial varieties command distinct market prices and culinary uses.
- **Problem:** Many varieties exhibit overlapping external traits. Manual inspection in seed certification and grading facilities is:
  - Subjective and operator-dependent.
  - Slow and labor-intensive.
  - Vulnerable to human fatigue.
- **Solution:** An automated, objective Computer Vision & Machine Learning classification system that predicts seed cultivar with >92% accuracy from 16 extracted physical measurements.

---

### Slide 3: Dataset Source & Taxonomic Characteristics
- **Dataset Source:** UCI Machine Learning Repository (Koklu & Ozkan, 2020).
- **Scale:** 13,611 high-resolution seed image records.
- **7 Cultivars:**
  1. `DERMASON` (3,546 samples, 26.05%) — Most prevalent commercial white bean.
  2. `SIRA` (2,636 samples, 19.37%) — Compact white bean, culinary staple.
  3. `SEKER` (2,027 samples, 14.89%) — Spherical, highest roundness (0.958).
  4. `HOROZ` (1,928 samples, 14.16%) — Cylindrical rooster bean, high aspect ratio.
  5. `CALI` (1,630 samples, 11.98%) — Elongated kidney-type cultivar.
  6. `BARBUNYA` (1,322 samples, 9.71%) — Mottled borlotti variety.
  7. `BOMBAY` (522 samples, 3.84%) — Distinctly massive runner bean (>150,000 px² area).
- **Data Quality:** Zero missing values across all 13,611 instances. 68 exact duplicate records identified and tracked.

---

### Slide 4: Exploratory Data Analysis (EDA) Insights
- **Key Observations from Visualizations:**
  - `Area` and `ConvexArea` exhibit near-perfect collinearity ($r > 0.99$).
  - `BOMBAY` is easily separable purely based on scale (`Area` and `Perimeter`).
  - `SEKER` is readily distinguished by high `roundness` and `Compactness`.
  - Significant morphological proximity exists between `DERMASON` and `SIRA`, requiring non-linear decision boundaries.
- **Correlation Matrix:** Identified redundant feature pairs; highlighted the discriminant power of dimensionless shape factors (`ShapeFactor1` through `ShapeFactor4`).

---

### Slide 5: Data Preprocessing & Leakage Prevention
- **Feature Partitioning:** 16 predictors separated from target column `Class`.
- **Train/Test Splitting:** Stratified 80/20 split (10,888 training rows, 2,723 test rows) maintaining class balance.
- **Leakage Safeguards:**
  - Feature scaling (`StandardScaler`) was strictly nested inside `sklearn.pipeline.Pipeline`.
  - Scaler statistics $(\mu, \sigma)$ fitted exclusively on training folds; test set was strictly held out until final evaluation.

---

### Slide 6: Three Machine Learning Architectures Compared
1. **Logistic Regression (Multinomial Baseline):**
   - Softmax multiclass classification with L2 regularization.
   - Scaled inputs; fast, linear reference model.
2. **Random Forest Classifier (Ensemble):**
   - Bagging ensemble of decision trees with feature sub-sampling.
   - Scale-invariant, captures non-linear interactions, provides Gini feature importance.
3. **Support Vector Machine (SVM - Margin Based):**
   - Non-linear separation using Radial Basis Function (RBF) kernel.
   - Calibrated probability estimates enabled for multi-class posterior confidence.

---

### Slide 7: Hyperparameter Tuning via Stratified 5-Fold CV
- Exhaustive grid search with 5-fold cross-validation:
  - **Logistic Regression:** Tuned $C \in [0.1, 1.0, 10.0]$, Solver $\in [\text{lbfgs}, \text{saga}]$.  
    *Optimal:* $C=10.0, \text{solver}='saga'$ (CV Macro F1: **0.9368**).
  - **Random Forest:** Tuned `n_estimators` $\in [100, 200]$, `max_depth` $\in [15, 25, \text{None}]$.  
    *Optimal:* $n=100, \text{max\_depth}=15$ (CV Macro F1: **0.9358**).
  - **Support Vector Machine (SVM):** Tuned $C \in [1.0, 10.0]$, $\gamma \in ['scale', 'auto']$.  
    *Optimal:* $C=10.0, \text{kernel}='rbf', \gamma='scale'$ (CV Macro F1: **0.9443**).

---

### Slide 8: Experimental Model Comparison & Results
*Evaluated on Held-Out Test Set (2,723 unseen samples):*

| Model | Test Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 | Train Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SVM (RBF) [Champion]** | **92.43%** | **93.85%** | **93.42%** | **0.9361** | **0.9242** | 20.8s |
| **Logistic Regression** | 92.14% | 93.60% | 93.10% | 0.9332 | 0.9213 | 47.1s |
| **Random Forest** | 91.88% | 93.48% | 92.83% | 0.9313 | 0.9186 | 56.4s |

- **Selection Decision:** Support Vector Machine (RBF) achieved highest test accuracy (92.43%) and macro F1 (0.9361), while maintaining swift inference (0.16 ms per bean).

---

### Slide 9: Confusion Matrix & Error Analysis
- **Diagonal Dominance:** High True Positive rates across all classes:
  - `BOMBAY`: 100% accuracy (no false positives or negatives).
  - `BARBUNYA` & `CALI`: >94% correct classification.
  - `SEKER`: 95% correct classification due to distinctive roundness.
- **Misclassification Bottleneck:** ~7% of `SIRA` samples misclassified as `DERMASON` due to biological variation and overlapping geometric ratios in small-sized white bean varieties.

---

### Slide 10: System Architecture & FastAPI Backend
- **Trained Pipeline Persistence:** Fitted `StandardScaler` + `SVC` serialized using Joblib into `models/dry_bean_pipeline.joblib`.
- **Inference Guarantee:** Deployed backend loads the pipeline once on startup; predictions execute in milliseconds without retraining.
- **RESTful Endpoints:**
  - `GET /health`: Healthcheck & model verification.
  - `GET /model-info`: Hyperparameters and test metrics.
  - `POST /predict`: Pydantic validated 16-feature input with class probability distribution.
  - `GET /samples`: Real curated seed presets.

---

### Slide 11: Live Frontend Demonstration (BeanAI)
- **UI Architecture:** React + Vite + Recharts + Lucide-react.
- **Live Demo Flow:**
  1. Navigate to **Dashboard**: review verified dataset metrics and class distributions.
  2. Open **Bean Prediction**: select preset for `BOMBAY` -> observe immediate 100% confidence classification.
  3. Select preset for `HOROZ` -> highlight elongated axis detection.
  4. Review **Model Performance**: inspect live interactive confusion matrix and feature importance charts.

---

### Slide 12: Real-World Applications, Limitations & Conclusion
- **Applications:** Optical sorting chutes in seed processing mills, quality inspection kiosks, and agricultural trade certification.
- **Limitations:** Dependent on 2D silhouette segmentations; does not account for internal seed defects or humidity-based swelling without camera recalibration.
- **Future Scope:** Integrating deep learning (Vision Transformers / MobileNet) for direct image classification alongside tabular physical parameters.
- **Conclusion:** Successfully delivered an industry-ready, academic-grade ML product combining rigorous cross-validation and a modern reactive dashboard.

---

## 💡 Likely Faculty Viva Questions & Sample Answers

1. **Q: Why is Macro F1 preferred over Accuracy in this project?**  
   *A:* The dataset is imbalanced (Dermason has 3,546 samples while Bombay has 522). Accuracy is dominated by majority classes, whereas Macro F1 calculates unweighted mean F1 across all 7 classes, ensuring rare varieties like Bombay are equally prioritized.

2. **Q: How did you ensure data leakage did not occur during scaling?**  
   *A:* We used `sklearn.pipeline.Pipeline([('scaler', StandardScaler()), ('classifier', SVC())])`. The scaler's mean and variance are learned exclusively from the training split during `.fit()`, and only applied via `.transform()` on test folds.

3. **Q: Why does SVM outperform Random Forest on this tabular dataset?**  
   *A:* The 16 features are continuous geometric and ratio-based measurements with smooth, non-linear physical decision boundaries. The RBF kernel maps these continuous morphological ratios into infinite-dimensional Hilbert space, separating subtle convex hulls more cleanly than orthogonal tree splits.
