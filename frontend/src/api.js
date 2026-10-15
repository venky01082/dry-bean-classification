// API client for BeanAI FastAPI backend with offline fallback
import fallbackMetrics from './data/metrics.json';
import fallbackSamples from './data/sample_beans.json';
import fallbackConfusion from './data/confusion_matrix.json';
import fallbackEda from './data/eda_summary.json';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API not healthy');
    return await res.json();
  } catch (err) {
    return { status: 'offline', model_loaded: false, champion_model: fallbackMetrics.champion_model, total_classes: 7 };
  }
}

export async function getModelInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/model-info`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to fetch model info');
    return await res.json();
  } catch (err) {
    const champ = fallbackMetrics.champion_model;
    const champData = fallbackMetrics.models[champ];
    return {
      model_name: champ,
      accuracy: champData.accuracy,
      macro_f1: champData.macro_f1,
      weighted_f1: champData.weighted_f1,
      cv_macro_f1: champData.cv_macro_f1,
      best_parameters: champData.best_parameters,
      dataset_samples: fallbackMetrics.sample_count,
      feature_count: fallbackMetrics.feature_count,
      classes: fallbackMetrics.classes,
      sorted_feature_importance: fallbackMetrics.sorted_feature_importance
    };
  }
}

export async function getAllMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return await res.json();
  } catch (err) {
    return {
      metrics: fallbackMetrics,
      confusion: fallbackConfusion,
      eda: fallbackEda
    };
  }
}

export async function getSampleBeans() {
  try {
    const res = await fetch(`${API_BASE_URL}/samples`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to fetch samples');
    return await res.json();
  } catch (err) {
    return {
      samples: fallbackSamples,
      descriptions: {
        SEKER: "Small, rounded dry bean with high compactness and roundness. Common Turkish variety prized for quick cooking.",
        BARBUNYA: "Medium-oval variety with characteristic speckled patterning (borlotti type). Hearty texture with sweet, savory flavor.",
        BOMBAY: "Largest dry bean variety by surface area and diameter. Plump, flattened white runner bean with exceptional creaminess.",
        CALI: "Large, elongated kidney-style bean. Substantial meatiness, retains firmness during long braising.",
        DERMASON: "Medium-small, round-oval white bean. The most widely cultivated commercial dry bean in Turkey.",
        HOROZ: "Long, slender cylindrical white bean characterized by high aspect ratio and eccentricity.",
        SIRA: "Medium-compact white bean slightly smaller and flatter than Dermason, high solidity and uniform shape."
      }
    };
  }
}

export async function predictBeanVariety(features) {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(features)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Prediction failed. Check inputs.');
  }
  return await res.json();
}
