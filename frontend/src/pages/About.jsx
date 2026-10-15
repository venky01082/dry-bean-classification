import React from 'react';
import { Users2, GraduationCap, BookOpen, Layers, CheckCircle2, Award, Terminal } from 'lucide-react';

export default function About() {
  const teamMembers = [
    {
      id: '24EU01007',
      role: 'Data Engineering & EDA Lead',
      badge: 'Phase 1 & 2',
      tasks: [
        'UCI Dry Bean dataset acquisition, extraction, and verification',
        'Exploratory data analysis across 13,611 samples and 16 features',
        'Class distribution, correlation heatmaps, and outlier checks',
        'Stratified 80/20 train/test splitting and leakage prevention'
      ]
    },
    {
      id: '24EU01046',
      role: 'ML Modeling & Tuning Lead',
      badge: 'Phase 3 & 4',
      tasks: [
        'Training candidate models: Logistic Regression, Random Forest, SVM',
        '5-Fold Stratified Cross-Validation & GridSearchCV tuning',
        'Evaluating Macro F1, Weighted F1, Confusion Matrix & Latencies',
        'Exporting optimal champion pipeline via Joblib serialization'
      ]
    },
    {
      id: '24EU01055',
      role: 'Backend, Frontend & Integration Lead',
      badge: 'Phase 5 & 6',
      tasks: [
        'FastAPI REST endpoints with Pydantic validation for 16 features',
        'React + Vite interactive dashboard, charts & real bean presets',
        'CORS configuration, API error handling & offline fallback',
        'Automated pytest suite & end-to-end integration testing'
      ]
    }
  ];

  const techStack = [
    { name: 'Python 3', category: 'Core Language', desc: 'Numerical compute & backend engine' },
    { name: 'Scikit-Learn', category: 'Machine Learning', desc: 'Pipelines, StandardScaler, GridSearchCV, SVM, RF, LR' },
    { name: 'Pandas & NumPy', category: 'Data Analysis', desc: 'DataFrames, matrix operations & statistics' },
    { name: 'FastAPI & Pydantic', category: 'Backend REST API', desc: 'Type-safe request validation and high performance' },
    { name: 'Joblib', category: 'Model Persistence', desc: 'Serializing trained pipelines for instant inference' },
    { name: 'React & Vite', category: 'Frontend Dashboard', desc: 'Fast client-side rendering with reactive state' },
    { name: 'Recharts', category: 'Data Visualization', desc: 'Interactive bar charts, pie charts & distributions' },
    { name: 'Pytest', category: 'Automated Testing', desc: 'Unit tests for pipeline predictions and HTTP endpoints' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Project Overview & Team Information</h1>
        <p className="page-subtitle">
          B.Tech in Artificial Intelligence & Data Science — Capstone Dry Bean Classification Project.
        </p>
      </div>

      {/* Project Identity Card */}
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <GraduationCap size={22} color="#10b981" />
            <span>Academic Project Specification</span>
          </div>
          <span style={{ fontSize: '0.82rem', background: '#ecfdf5', color: '#065f46', padding: '0.25rem 0.75rem', borderRadius: 20, fontWeight: 700 }}>
            B.Tech AI & Data Science
          </span>
        </div>

        <p style={{ color: '#334155', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Different dry bean varieties frequently exhibit overlapping morphological appearances, making manual agricultural grading time-consuming, prone to human fatigue, and inconsistent. <strong>BeanAI</strong> provides an automated computer-vision-based machine learning pipeline that accurately identifies bean cultivars from 16 physical measurements including area, perimeter, axis lengths, compactness, and dimensionless shape factors.
        </p>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>PROBLEM TYPE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Supervised Multiclass Classification</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>DATASET SIZE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>13,611 Verified Samples</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TARGET VARIETIES</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>7 Turkish Bean Cultivars</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CHAMPION MODEL</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>Support Vector Machine (92.43% Acc)</div>
          </div>
        </div>
      </div>

      {/* Team Division Card */}
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <Users2 size={22} color="#0284c7" />
            <span>Team Member Responsibilities</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Three-Member Project Team</span>
        </div>

        <div className="team-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="team-card">
              <span className="team-badge">{member.badge}</span>
              <div className="team-id">{member.id}</div>
              <div className="team-role">{member.role}</div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {member.tasks.map((task, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', marginBottom: '0.45rem' }}>
                    <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset & Literature Citation */}
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <BookOpen size={22} color="#8b5cf6" />
            <span>Dataset Attribution & Scientific Citation</span>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
            UCI Machine Learning Repository — Dry Bean Dataset
          </div>
          <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            Koklu, M. and Ozkan, I.A., (2020), "Multiclass Classification of Dry Beans Using Computer Vision and Machine Learning Techniques." <em>Computers and Electronics in Agriculture</em>, 174, 105507. DOI: 10.1016/j.compag.2020.105507.
          </p>
          <a
            href="https://archive.ics.uci.edu/dataset/602/dry+bean+dataset"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
          >
            Access UCI Dataset Repository ↗
          </a>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <Layers size={22} color="#f59e0b" />
            <span>Technology Stack</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {techStack.map(tech => (
            <div key={tech.name} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{tech.name}</span>
                <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '0.15rem 0.45rem', borderRadius: 4, fontWeight: 600 }}>
                  {tech.category}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
