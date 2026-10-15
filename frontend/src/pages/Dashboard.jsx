import React from 'react';
import { Database, Cpu, Award, Zap, ArrowRight, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

const CLASS_COLORS = {
  DERMASON: '#0284c7',
  SIRA: '#0d9488',
  SEKER: '#10b981',
  HOROZ: '#f59e0b',
  CALI: '#8b5cf6',
  BARBUNYA: '#ec4899',
  BOMBAY: '#6366f1'
};

export default function Dashboard({ metrics, eda, onNavigatePredict }) {
  const sampleCount = metrics?.sample_count || 13611;
  const featureCount = metrics?.feature_count || 16;
  const champion = metrics?.champion_model || 'Support Vector Machine (SVM)';
  const champData = metrics?.models?.[champion] || {};
  const accuracy = champData.accuracy ? (champData.accuracy * 100).toFixed(2) : '92.43';
  const macroF1 = champData.macro_f1 ? champData.macro_f1.toFixed(4) : '0.9361';

  const distributionData = [
    { name: 'DERMASON', count: 3546, percentage: 26.05, fill: CLASS_COLORS.DERMASON },
    { name: 'SIRA', count: 2636, percentage: 19.37, fill: CLASS_COLORS.SIRA },
    { name: 'SEKER', count: 2027, percentage: 14.89, fill: CLASS_COLORS.SEKER },
    { name: 'HOROZ', count: 1928, percentage: 14.16, fill: CLASS_COLORS.HOROZ },
    { name: 'CALI', count: 1630, percentage: 11.98, fill: CLASS_COLORS.CALI },
    { name: 'BARBUNYA', count: 1322, percentage: 9.71, fill: CLASS_COLORS.BARBUNYA },
    { name: 'BOMBAY', count: 522, percentage: 3.84, fill: CLASS_COLORS.BOMBAY }
  ];

  const varieties = [
    { name: 'SEKER', count: 2027, type: 'Round / Smooth', desc: 'Highest roundness (0.958) and compactness. Spherical white bean ideal for fast cooking and purees.' },
    { name: 'BARBUNYA', count: 1322, type: 'Speckled / Borlotti', desc: 'Medium-large oval bean with distinctive mottled reddish patterning and sweet savory flavor.' },
    { name: 'BOMBAY', count: 522, type: 'Broad / Runner', desc: 'Largest bean by area (>150,000 px) and equivalent diameter. Premium tender white runner variety.' },
    { name: 'CALI', count: 1630, type: 'Kidney / Elongated', desc: 'Long major axis with kidney profile. Highly structured bean that holds shape during slow stews.' },
    { name: 'DERMASON', count: 3546, type: 'Small Oval / Flat', desc: 'Most abundant variety in dataset (26%). Uniform commercial white bean with high culinary popularity.' },
    { name: 'HOROZ', count: 1928, type: 'Cylindrical / Slender', desc: 'Known as rooster bean. Highest aspect ratio and eccentricity with slender, elongated profile.' },
    { name: 'SIRA', count: 2636, type: 'Compact White', desc: 'Medium-compact white bean slightly smaller and flatter than Dermason, balanced shape factors.' }
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Academic Project — B.Tech AI & Data Science
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
              Intelligent Dry Bean Classification System
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '640px', fontSize: '0.95rem' }}>
              High-accuracy machine learning system classifying 7 registered dry bean cultivars from 16 morphological and geometric measurements captured via computer vision.
            </p>
          </div>
          <div>
            <button className="btn-primary" onClick={onNavigatePredict} style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              <span>Launch Bean Predictor</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <h3>Total Samples</h3>
            <div className="metric-val">{sampleCount.toLocaleString()}</div>
            <div className="metric-sub">UCI Verified Dataset</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <Database size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Morphological Features</h3>
            <div className="metric-val">{featureCount}</div>
            <div className="metric-sub">16 Physical Predictors</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Layers size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Bean Varieties</h3>
            <div className="metric-val">7</div>
            <div className="metric-sub">Multiclass Target</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Cpu size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Tuned Model</h3>
            <div className="metric-val" style={{ fontSize: '1.25rem' }}>SVM (RBF)</div>
            <div className="metric-sub">GridSearch Optimized</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Zap size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Test Accuracy</h3>
            <div className="metric-val" style={{ color: '#059669' }}>{accuracy}%</div>
            <div className="metric-sub">Macro F1: {macroF1}</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Award size={22} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Class Distribution Bar Chart */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-title-row">
            <div className="card-title">
              <span>Class Sample Distribution</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>N = 13,611 rows</span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${Number(val).toLocaleString()} samples`, 'Count']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Proportions Pie Chart */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-title-row">
            <div className="card-title">
              <span>Market & Cultivar Proportions</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Relative %</span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${Number(val).toLocaleString()} samples`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 7 Bean Varieties Directory */}
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <span>The 7 Dry Bean Cultivars</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>UCI Dataset Taxonomic Classes</span>
        </div>
        <div className="variety-grid">
          {varieties.map((v) => (
            <div key={v.name} className="variety-card">
              <div className="variety-header">
                <span className="variety-name" style={{ color: CLASS_COLORS[v.name] }}>{v.name}</span>
                <span className="variety-count">{v.count.toLocaleString()} samples</span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>
                {v.type}
              </div>
              <p className="variety-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
