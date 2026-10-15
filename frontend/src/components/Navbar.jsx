import React from 'react';
import { Sprout, LayoutDashboard, Binary, BarChart3, Users2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiStatus }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prediction', label: 'Bean Prediction', icon: Binary },
    { id: 'performance', label: 'Model Performance', icon: BarChart3 },
    { id: 'about', label: 'About & Team', icon: Users2 }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon">
            <Sprout size={24} />
          </div>
          <div className="brand-text">
            <h1>BeanAI</h1>
            <span>Intelligent Dry Bean Classifier</span>
          </div>
        </div>

        <div className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={17} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className={`nav-status ${apiStatus === 'online' ? 'status-online' : 'status-offline'}`}>
          <div className="status-dot"></div>
          <span>FastAPI: {apiStatus === 'online' ? 'Connected' : 'Offline Mode'}</span>
        </div>
      </div>
    </nav>
  );
}
