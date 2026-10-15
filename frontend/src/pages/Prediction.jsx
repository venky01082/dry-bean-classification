import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, AlertCircle, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { predictBeanVariety, getSampleBeans } from '../api';

const CLASS_COLORS = {
  DERMASON: '#0284c7',
  SIRA: '#0d9488',
  SEKER: '#10b981',
  HOROZ: '#f59e0b',
  CALI: '#8b5cf6',
  BARBUNYA: '#ec4899',
  BOMBAY: '#6366f1'
};

const INITIAL_FORM = {
  Area: 28395,
  Perimeter: 610.291,
  MajorAxisLength: 208.178,
  MinorAxisLength: 173.888,
  AspectRation: 1.197,
  Eccentricity: 0.549,
  ConvexArea: 28715,
  EquivDiameter: 190.141,
  Extent: 0.763,
  Solidity: 0.988,
  roundness: 0.958,
  Compactness: 0.913,
  ShapeFactor1: 0.0073,
  ShapeFactor2: 0.0031,
  ShapeFactor3: 0.834,
  ShapeFactor4: 0.999
};

const FEATURE_GROUPS = [
  {
    title: 'Size & Boundary Dimensions',
    features: [
      { key: 'Area', label: 'Area', hint: 'Zone in pixels (px²)', min: 10000, max: 300000, step: 10 },
      { key: 'Perimeter', label: 'Perimeter', hint: 'Circumference (px)', min: 300, max: 2500, step: 0.1 },
      { key: 'MajorAxisLength', label: 'Major Axis Length', hint: 'Primary axis (px)', min: 100, max: 800, step: 0.1 },
      { key: 'MinorAxisLength', label: 'Minor Axis Length', hint: 'Secondary axis (px)', min: 100, max: 500, step: 0.1 },
      { key: 'ConvexArea', label: 'Convex Area', hint: 'Convex hull pixels', min: 10000, max: 300000, step: 10 },
      { key: 'EquivDiameter', label: 'Equivalent Diameter', hint: 'Equivalent circle (px)', min: 100, max: 600, step: 0.1 }
    ]
  },
  {
    title: 'Geometry & Compactness',
    features: [
      { key: 'AspectRation', label: 'Aspect Ratio', hint: 'L / l ratio', min: 1.0, max: 3.5, step: 0.001 },
      { key: 'Eccentricity', label: 'Eccentricity', hint: 'Ellipse focal index (0-1)', min: 0.0, max: 1.0, step: 0.001 },
      { key: 'Extent', label: 'Extent', hint: 'Area / bounding box (0-1)', min: 0.4, max: 1.0, step: 0.001 },
      { key: 'Solidity', label: 'Solidity', hint: 'Area / convex area (0-1)', min: 0.8, max: 1.0, step: 0.001 },
      { key: 'roundness', label: 'Roundness', hint: '4π*Area / Perimeter²', min: 0.4, max: 1.0, step: 0.001 },
      { key: 'Compactness', label: 'Compactness', hint: 'Ed / L (0-1)', min: 0.4, max: 1.0, step: 0.001 }
    ]
  },
  {
    title: 'Morphological Shape Factors',
    features: [
      { key: 'ShapeFactor1', label: 'Shape Factor 1', hint: 'MajorAxis / Area', min: 0.001, max: 0.02, step: 0.0001 },
      { key: 'ShapeFactor2', label: 'Shape Factor 2', hint: 'MinorAxis / Area', min: 0.0005, max: 0.01, step: 0.0001 },
      { key: 'ShapeFactor3', label: 'Shape Factor 3', hint: 'Area / (L² * π/4)', min: 0.2, max: 1.0, step: 0.001 },
      { key: 'ShapeFactor4', label: 'Shape Factor 4', hint: 'Area / (L*l * π/4)', min: 0.8, max: 1.0, step: 0.0005 }
    ]
  }
];

export default function Prediction() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [samples, setSamples] = useState({});
  const [selectedSample, setSelectedSample] = useState('SEKER');

  useEffect(() => {
    getSampleBeans().then(data => {
      if (data && data.samples) {
        setSamples(data.samples);
      }
    });
  }, []);

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value === '' ? '' : parseFloat(value) || 0
    }));
  };

  const handleLoadSample = (variety) => {
    if (samples[variety]) {
      setFormData(samples[variety]);
      setSelectedSample(variety);
      setError(null);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setResult(null);
    setError(null);
    setSelectedSample('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client validation
    for (const [k, v] of Object.entries(formData)) {
      if (v === '' || isNaN(v) || v <= 0) {
        setError(`Please enter a valid positive number for ${k}`);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await predictBeanVariety(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to predict bean variety.');
    } finally {
      setLoading(false);
    }
  };

  // Format probabilities for Recharts
  const probChartData = result?.probabilities
    ? Object.entries(result.probabilities)
        .map(([cls, prob]) => ({
          name: cls,
          value: prob,
          fill: CLASS_COLORS[cls] || '#10b981'
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Interactive Bean Variety Prediction</h1>
        <p className="page-subtitle">
          Input 16 computer vision geometric measurements or load authentic bean sample records to test the classifier.
        </p>
      </div>

      {/* Preset Toolbar */}
      <div className="preset-toolbar">
        <span className="preset-title">
          <Sparkles size={16} /> Quick Load Sample Bean:
        </span>
        {Object.keys(samples).length > 0 ? (
          Object.keys(samples).map(variety => (
            <button
              key={variety}
              type="button"
              className={`preset-btn ${selectedSample === variety ? 'active' : ''}`}
              onClick={() => handleLoadSample(variety)}
            >
              {variety}
            </button>
          ))
        ) : (
          ['SEKER', 'BARBUNYA', 'BOMBAY', 'CALI', 'DERMASON', 'HOROZ', 'SIRA'].map(v => (
            <button key={v} type="button" className="preset-btn" onClick={() => handleLoadSample(v)}>
              {v}
            </button>
          ))
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-grid-3">
          {FEATURE_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="form-section-box">
              <div className="form-section-title">
                <span>{group.title}</span>
              </div>
              {group.features.map(f => (
                <div key={f.key} className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">{f.label}</label>
                    <span className="form-hint">{f.hint}</span>
                  </div>
                  <input
                    type="number"
                    step={f.step}
                    className="form-input"
                    value={formData[f.key] ?? ''}
                    onChange={(e) => handleInputChange(f.key, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: '200px' }}>
            <Sparkles size={18} />
            <span>{loading ? 'Classifying Bean...' : 'Predict Bean Variety'}</span>
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} />
            <span>Reset Inputs</span>
          </button>
        </div>
      </form>

      {/* Prediction Result Section */}
      {result && (
        <div className="result-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#065f46', letterSpacing: '0.5px' }}>
                Classification Result
              </span>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="result-badge" style={{ backgroundColor: CLASS_COLORS[result.predicted_class] || '#065f46' }}>
                  {result.predicted_class}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Model Confidence</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                {(result.class_probability * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                {result.model}
              </div>
            </div>
          </div>

          <div className="confidence-bar-bg">
            <div
              className="confidence-bar-fill"
              style={{
                width: `${result.class_probability * 100}%`,
                background: CLASS_COLORS[result.predicted_class] || '#10b981'
              }}
            ></div>
          </div>

          <p style={{ color: '#334155', fontSize: '0.92rem', marginBottom: '1.5rem', background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <strong>Cultivar Characteristics:</strong> {result.bean_description}
          </p>

          {/* Probability Distribution Bar Chart */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <BarChart2 size={18} color="#475569" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                Class Probability Distribution
              </h3>
            </div>

            <div style={{ width: '100%', height: 260, background: '#ffffff', borderRadius: 8, padding: '1rem', border: '1px solid #e2e8f0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={probChartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <Tooltip
                    formatter={(val) => [`${(Number(val) * 100).toFixed(1)}%`, 'Probability']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {probChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
