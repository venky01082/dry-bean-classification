import os
import zipfile
import urllib.request
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
CSV_PATH = os.path.join(DATA_DIR, "dry_beans.csv")
ZIP_PATH = os.path.join(DATA_DIR, "dry_bean_dataset.zip")
UCI_URL = "https://archive.ics.uci.edu/static/public/602/dry+bean+dataset.zip"

FEATURE_NAMES = [
    "Area", "Perimeter", "MajorAxisLength", "MinorAxisLength",
    "AspectRation", "Eccentricity", "ConvexArea", "EquivDiameter",
    "Extent", "Solidity", "roundness", "Compactness",
    "ShapeFactor1", "ShapeFactor2", "ShapeFactor3", "ShapeFactor4"
]
TARGET_NAME = "Class"

def download_and_extract_dataset():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(CSV_PATH):
        print(f"Cleaned CSV already exists at {CSV_PATH}")
        return CSV_PATH
    
    excel_path = os.path.join(DATA_DIR, "Dry_Bean_Dataset.xlsx")
    nested_excel = os.path.join(DATA_DIR, "DryBeanDataset", "Dry_Bean_Dataset.xlsx")

    if not os.path.exists(excel_path) and not os.path.exists(nested_excel):
        print(f"Downloading dataset from {UCI_URL}...")
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(UCI_URL, headers=headers)
        with urllib.request.urlopen(req) as response, open(ZIP_PATH, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Saved zip archive to {ZIP_PATH}")
        
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            zip_ref.extractall(DATA_DIR)
        print(f"Extracted zip archive to {DATA_DIR}")

    actual_excel = excel_path if os.path.exists(excel_path) else nested_excel
    if not os.path.exists(actual_excel):
        # Check recursively in DATA_DIR for any .xlsx
        for root, dirs, files in os.walk(DATA_DIR):
            for file in files:
                if file.endswith(".xlsx"):
                    actual_excel = os.path.join(root, file)
                    break

    print(f"Reading Excel file: {actual_excel}...")
    df = pd.read_excel(actual_excel)
    print(f"Raw dataset shape: {df.shape}")

    # Standardize column names (strip whitespace)
    df.columns = [c.strip() for c in df.columns]

    # Verify features and target
    missing_feats = [f for f in FEATURE_NAMES if f not in df.columns]
    if missing_feats:
        raise ValueError(f"Missing expected features: {missing_feats}. Found: {list(df.columns)}")
    if TARGET_NAME not in df.columns:
        raise ValueError(f"Missing target '{TARGET_NAME}'. Found: {list(df.columns)}")

    # Ensure correct column ordering: 16 features + Class
    df = df[FEATURE_NAMES + [TARGET_NAME]]
    df[TARGET_NAME] = df[TARGET_NAME].astype(str).str.strip().str.upper()

    df.to_csv(CSV_PATH, index=False)
    print(f"Processed dataset saved to {CSV_PATH} with {len(df)} rows and {len(df.columns)} columns.")
    return CSV_PATH

def load_data():
    if not os.path.exists(CSV_PATH):
        download_and_extract_dataset()
    df = pd.read_csv(CSV_PATH)
    X = df[FEATURE_NAMES]
    y = df[TARGET_NAME]
    return df, X, y

if __name__ == "__main__":
    download_and_extract_dataset()
    df, X, y = load_data()
    print("\nDataset Info:")
    print(f"Total Samples: {len(df)}")
    print(f"Features ({len(FEATURE_NAMES)}): {FEATURE_NAMES}")
    print(f"Target: {TARGET_NAME}")
    print(f"Missing values: {df.isnull().sum().sum()}")
    print(f"Duplicate rows: {df.duplicated().sum()}")
    print("\nClass distribution:")
    print(y.value_counts())
