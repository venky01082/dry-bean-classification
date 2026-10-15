import os
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')

DATA_PATH = os.path.join("data", "dry_beans.csv")
REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH)
features = [col for col in df.columns if col != 'Class']

print("--- EDA SUMMARY ---")
print("Dimensions:", df.shape)
print("Columns:", list(df.columns))

# 1. Summary statistics
stats = df.describe().to_dict()
class_counts = df['Class'].value_counts().to_dict()
class_percentages = (df['Class'].value_counts(normalize=True) * 100).round(2).to_dict()

eda_summary = {
    "total_samples": len(df),
    "num_features": len(features),
    "num_classes": df['Class'].nunique(),
    "class_counts": class_counts,
    "class_percentages": class_percentages,
    "missing_values": int(df.isnull().sum().sum()),
    "duplicate_rows": int(df.duplicated().sum()),
    "feature_names": features,
    "feature_stats": {
        feat: {
            "mean": round(float(df[feat].mean()), 4),
            "std": round(float(df[feat].std()), 4),
            "min": round(float(df[feat].min()), 4),
            "median": round(float(df[feat].median()), 4),
            "max": round(float(df[feat].max()), 4),
        } for feat in features
    }
}

with open(os.path.join(REPORTS_DIR, "eda_summary.json"), "w") as f:
    json.dump(eda_summary, f, indent=2)
print("Saved eda_summary.json")

# 2. Class Distribution Plot
plt.figure(figsize=(10, 5))
palette = sns.color_palette("viridis", len(class_counts))
ax = sns.countplot(data=df, x='Class', order=df['Class'].value_counts().index, palette=palette)
plt.title("Dry Bean Variety Distribution (UCI Dataset, N=13,611)", fontsize=14, fontweight='bold', pad=15)
plt.xlabel("Bean Variety", fontsize=12)
plt.ylabel("Sample Count", fontsize=12)
for p in ax.patches:
    ax.annotate(f'{int(p.get_height()):,}', (p.get_x() + p.get_width() / 2., p.get_height()),
                ha='center', va='center', xytext=(0, 6), textcoords='offset points', fontweight='bold', fontsize=10)
plt.tight_layout()
plt.savefig(os.path.join(REPORTS_DIR, "class_distribution.png"), dpi=200)
plt.close()
print("Saved class_distribution.png")

# 3. Correlation Heatmap
plt.figure(figsize=(14, 11))
corr = df[features].corr()
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, mask=mask, annot=True, fmt=".2f", cmap="coolwarm", center=0,
            square=True, linewidths=0.5, cbar_kws={"shrink": .8})
plt.title("Feature Correlation Matrix (16 Morphological Features)", fontsize=15, fontweight='bold', pad=15)
plt.tight_layout()
plt.savefig(os.path.join(REPORTS_DIR, "correlation_heatmap.png"), dpi=200)
plt.close()
print("Saved correlation_heatmap.png")

# 4. Feature Boxplots (Area, Perimeter, AspectRation, Compactness)
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
key_feats = [('Area', 'Area (pixels)'), ('Perimeter', 'Perimeter (pixels)'), 
             ('AspectRation', 'Aspect Ratio (L/l)'), ('Compactness', 'Compactness (Ed/L)')]

for idx, (feat, label) in enumerate(key_feats):
    ax = axes[idx // 2, idx % 2]
    sns.boxplot(data=df, x='Class', y=feat, ax=ax, palette="Set2")
    ax.set_title(f"Distribution of {label} across Varieties", fontweight='bold')
    ax.set_xlabel("")
    ax.set_ylabel(label)
    ax.tick_params(axis='x', rotation=30)

plt.suptitle("Geometric & Morphological Comparison Across Dry Bean Classes", fontsize=16, fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(REPORTS_DIR, "feature_boxplots.png"), dpi=200)
plt.close()
print("Saved feature_boxplots.png")

print("EDA analysis completed successfully!")
