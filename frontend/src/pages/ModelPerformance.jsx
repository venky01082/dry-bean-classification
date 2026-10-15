import React, { useState } from 'react';
import { BarChart3, Grid, Sliders, CheckCircle, Table } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

export default function ModelPerformance({ metrics, confusion }) {
  const [cmView, setCmView] = useState('normalized'); // 'normalized' or 'raw'

  const modelsData = metrics?.models || {};
  const classes = metrics?.classes || ['BARBUNYA', 'BOMBAY', 'CALI', 'DERMASON', 'HOROZ', 'SEKER', 'SIRA'];

  // Comparison chart data
  const comparisonData = Object.entries(modelsData).map(([name, data]) => ({
    name: name.replace(' (SVM)', ''),
    fullName: name,
    accuracy: Number((data.accuracy * 100).toFixed(2)),
    macro_f1: Number((data.macro_f1 * 100).toFixed(2)),
    cv_score: Number((data.cv_macro_f1 * 100).toFixed(2)),
    train_time: data.train_time_seconds,
    latency: data.inference_time_ms_per_sample
  }));

  // Top feature importances
  const featureImportanceData = metrics?.sorted_feature_importance
    ? metrics.sorted_feature_importance.slice(0, 10).map(item => ({
        feature: item.feature,
        importance: Number((item.importance * 100).toFixed(2))
      }))
    : [];

  // Confusion matrix
  const matrix = cmView === 'normalized'
    ? confusion?.normalized_matrix || []
    : confusion?.raw_matrix || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Model Evaluation & Performance Benchmarks</h1>
        <p className="page-subtitle">
          Rigorous comparison of Logistic Regression, Random Forest, and Support Vector Machine trained on 10,888 samples and evaluated on 2,723 held-out test beans.
        </p>
      </div>

      {/* Model Comparison Bar Chart */}
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <BarChart3 size={20} color="#10b981" />
            <span>Candidate Model Comparison (Test Set Metrics)</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Held-out Test (20% Stratified)</span>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <XAxis dataKey="name" tick={{ fontWeight: 600, fontSize: 13 }} />
              <YAxis domain={[88, 96]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`]} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="accuracy" name="Test Accuracy (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="macro_f1" name="Macro F1-Score (%)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cv_score" name="5-Fold CV Macro F1 (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Metrics Table */}
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <Table size={20} color="#0284c7" />
            <span>Detailed Model Performance Matrix</span>
          </div>
          <span style={{ fontSize: '0.8rem', background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.6rem', borderRadius: 6, fontWeight: 700 }}>
            Champion: {metrics?.champion_model}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Test Accuracy</th>
                <th>Macro Precision</th>
                <th>Macro Recall</th>
                <th>Macro F1</th>
                <th>Weighted F1</th>
                <th>CV Macro F1</th>
                <th>Train Time</th>
                <th>Inference / Bean</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(modelsData).map(([name, data]) => {
                const isChampion = name === metrics?.champion_model;
                return (
                  <tr key={name} style={isChampion ? { background: '#f0fdf4', fontWeight: 600 } : {}}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isChampion && <CheckCircle size={16} color="#10b981" />}
                      <span>{name}</span>
                    </td>
                    <td>{(data.accuracy * 100).toFixed(2)}%</td>
                    <td>{(data.macro_precision * 100).toFixed(2)}%</td>
                    <td>{(data.macro_recall * 100).toFixed(2)}%</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>{(data.macro_f1 * 100).toFixed(2)}%</td>
                    <td>{(data.weighted_f1 * 100).toFixed(2)}%</td>
                    <td>{(data.cv_macro_f1 * 100).toFixed(2)}%</td>
                    <td>{data.train_time_seconds}s</td>
                    <td>{data.inference_time_ms_per_sample} ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix and Feature Importance 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Confusion Matrix Card */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-title-row">
            <div className="card-title">
              <Grid size={20} color="#8b5cf6" />
              <span>Confusion Matrix ({metrics?.champion_model})</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className={`preset-btn ${cmView === 'normalized' ? 'active' : ''}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setCmView('normalized')}
              >
                Normalized %
              </button>
              <button
                className={`preset-btn ${cmView === 'raw' ? 'active' : ''}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setCmView('raw')}
              >
                Raw Counts
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
            Rows: Actual Variety | Columns: Predicted Variety
          </p>

          <div className="matrix-container">
            <table className="cm-table">
              <thead>
                <tr>
                  <th className="cm-header-cell">Actual \ Pred</th>
                  {classes.map(c => (
                    <th key={c} className="cm-header-cell" style={{ width: 56 }}>{c.slice(0, 4)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="cm-header-cell" style={{ textAlign: 'right', paddingRight: '0.5rem' }}>
                      {classes[rIdx]}
                    </td>
                    {row.map((val, cIdx) => {
                      const isDiagonal = rIdx === cIdx;
                      const normVal = cmView === 'normalized' ? val : (confusion?.normalized_matrix?.[rIdx]?.[cIdx] || 0);
                      const bgAlpha = Math.max(0.08, normVal);
                      const bgColor = isDiagonal
                        ? `rgba(16, 185, 129, ${bgAlpha})`
                        : val > 0 ? `rgba(239, 68, 68, ${Math.min(0.6, val * 4)})` : '#f8fafc';
                      
                      return (
                        <td
                          key={cIdx}
                          className="cm-cell"
                          style={{
                            backgroundColor: bgColor,
                            color: isDiagonal && bgAlpha > 0.5 ? '#064e3b' : '#1e293b'
                          }}
                        >
                          {cmView === 'normalized' ? `${(val * 100).toFixed(0)}%` : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Feature Importance Chart */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-title-row">
            <div className="card-title">
              <Sliders size={20} color="#f59e0b" />
              <span>Top Feature Importances (Random Forest)</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Gini Impurity Relative %</span>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportanceData} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fontWeight: 600 }} />
                <Tooltip formatter={v => [`${v}%`, 'Importance Weight']} />
                <Bar dataKey="importance" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                  {featureImportanceData.map((_, index) => (
                    <Cell key={`feat-${index}`} fill={index < 3 ? '#d97706' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hyperparameter Optimization Details */}
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <Sliders size={20} color="#475569" />
            <span>Hyperparameter Tuning Specifications (Stratified 5-Fold Cross Validation)</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {Object.entries(modelsData).map(([name, data]) => (
            <div key={name} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                {name}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <strong>Best CV Macro F1:</strong> {(data.cv_macro_f1 * 100).toFixed(2)}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                <strong>Optimal Parameters:</strong>
                <pre style={{ background: '#ffffff', padding: '0.5rem', borderRadius: 4, marginTop: '0.25rem', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                  {JSON.stringify(data.best_parameters, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
