import { useCallback, useEffect, useState } from 'react';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import Sidebar from './components/common/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Prediction from './pages/Prediction.jsx';
import Explainability from './pages/Explainability.jsx';
import ModelPerformance from './pages/ModelPerformance.jsx';
import { checkHealth, getMetrics, predictPatient, explainPatient } from './services/api.js';

const headings = {
  dashboard: 'Overview', prediction: 'Patient analysis',
  explain: 'Explainable AI', performance: 'Research metrics',
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [health, setHealth] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState('');
  const [lastPatient, setLastPatient] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [explanations, setExplanations] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [predictionError, setPredictionError] = useState('');
  const [explanationError, setExplanationError] = useState('');

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true); setMetricsError('');
    try {
      const data = await getMetrics();
      setMetrics(data);
      setHealth(true);
    } catch (error) {
      setMetrics(null); setMetricsError(error.message);
    } finally { setMetricsLoading(false); }
  }, []);

  useEffect(() => {
    checkHealth().then(() => setHealth(true)).catch(() => setHealth(false));
    loadMetrics();
  }, [loadMetrics]);

  const runPrediction = async (patient) => {
    setPredicting(true); setPredictionError(''); setExplanationError('');
    setPrediction(null); setExplanations(null); setLastPaitent(null);
    try {
      const result = await predictPatient(patient);
      setLastPatient(patient);
      setPrediction(result);
      setHealth(true);
    } catch (error) { setPredictionError(error.message); }
    finally { setPredicting(false); }
  };

  const runExplanation = async () => {
    if (!lastPatient) { setPage('prediction'); return; }
    setExplaining(true); setExplanationError(''); setExplanations(null);
    setPage('explain');
    try {
      const result = await explainPatient(lastPatient);
      setExplanations(result.explanations);
      if (result.prediction) setPrediction(result.prediction);
    } catch (error) { setExplanationError(error.message); }
    finally { setExplaining(false); }
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage}/>
      <div className="app-main">
        <header className="topbar">
          <div><div className="breadcrumb">RESEARCH / <span>{headings[page].toUpperCase()}</span></div><h1>{headings[page]}</h1></div>
          <div className={`connection ${health ? 'online' : 'offline'}`}>
            {health ? <Wifi size={15}/> : <WifiOff size={15}/>}{health ? 'API connected' : 'API not verified'}
          </div>
        </header>
        <main>
          {page === 'dashboard' && <Dashboard metrics={metrics} error={metricsError} loading={metricsLoading} onNavigate={setPage} lastPrediction={prediction}/>}
          {page === 'prediction' && <Prediction prediction={prediction} onPredict={runPrediction} onExplain={runExplanation} predicting={predicting} explaining={explaining} error={predictionError}/>}
          {page === 'explain' && <Explainability result={explanations} hasPatient={!!lastPatient} loading={explaining} error={explanationError} onExplain={runExplanation} onNavigate={setPage}/>}
          {page === 'performance' && <ModelPerformance metrics={metrics} loading={metricsLoading} error={metricsError} refresh={loadMetrics}/>}
        </main>
        <footer className="app-footer"><Activity size={14}/> CardioExplain • Academic research demonstrator • Not for diagnosis or treatment decisions</footer>
      </div>
    </div>
  );
}
