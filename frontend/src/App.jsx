import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import ModelPerformance from './pages/ModelPerformance';
import About from './pages/About';
import { checkApiHealth, getAllMetrics } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState('checking');
  const [metricsData, setMetricsData] = useState(null);
  const [confusionData, setConfusionData] = useState(null);
  const [edaData, setEdaData] = useState(null);

  useEffect(() => {
    // Check backend health
    checkApiHealth().then(status => {
      setApiStatus(status.status === 'healthy' ? 'online' : 'offline');
    });

    // Load metrics and EDA summary
    getAllMetrics().then(data => {
      if (data) {
        setMetricsData(data.metrics);
        setConfusionData(data.confusion);
        setEdaData(data.eda);
      }
    });

    // Periodic health check every 15s
    const interval = setInterval(() => {
      checkApiHealth().then(status => {
        setApiStatus(status.status === 'healthy' ? 'online' : 'offline');
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiStatus={apiStatus}
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            metrics={metricsData}
            eda={edaData}
            onNavigatePredict={() => setActiveTab('prediction')}
          />
        )}

        {activeTab === 'prediction' && (
          <Prediction />
        )}

        {activeTab === 'performance' && (
          <ModelPerformance
            metrics={metricsData}
            confusion={confusionData}
          />
        )}

        {activeTab === 'about' && (
          <About />
        )}
      </main>

      <footer className="footer">
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong>BeanAI</strong> — Intelligent Dry Bean Classification System | B.Tech AI & Data Science
          </div>
          <div>
            Team IDs: <code className="font-mono">24EU01007</code> • <code className="font-mono">24EU01046</code> • <code className="font-mono">24EU01055</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
