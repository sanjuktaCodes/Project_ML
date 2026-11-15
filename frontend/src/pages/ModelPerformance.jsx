import { ChartNoAxesCombined, RefreshCw, Target, Gauge, Trophy, FileWarning } from 'lucide-react';
import ErrorNotice from '../components/common/ErrorNotice.jsx';
import StatCard from '../components/common/StatCard.jsx';
import ModelComparison from '../components/analytics/ModelComparison.jsx';
import ConfusionMatrix from '../components/analytics/ConfusionMatrix.jsx';
import Card from '../components/common/Card.jsx';

export default function ModelPerformance({ metrics, loading, error, refresh }) {
  const report = metrics?.classification_report;
  return (
    <div className="page-content">
      <div className="page-heading space-between"><div className="heading-title"><div className="heading-icon"><ChartNoAxesCombined size={23}/></div><div><h2>Model performance</h2><p>Cross-validation results and held-out test evaluation.</p></div></div>
        <button className="secondary-btn" type="button" onClick={refresh} disabled={loading}><RefreshCw size={16}/>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      <ErrorNotice message={error} onRetry={refresh}/>
      {metrics ? <>
        <div className="stats-grid stats-three">
          <StatCard label="Selected classifier" value={metrics.best_model || 'Not available'} subtitle="Highest cross-validation ROC-AUC" icon={Trophy} iconClass="purple"/>
          <StatCard label="Test accuracy" value={`${(metrics.accuracy * 100).toFixed(2)}%`} subtitle="Held-out test data" icon={Target} iconClass="green"/>
          <StatCard label="Test ROC-AUC" value={Number(metrics.roc_auc).toFixed(4)} subtitle="Area under ROC curve" icon={Gauge} iconClass="indigo"/>
        </div>
        <ModelComparison comparisons={metrics.model_comparison}/>
        <div className="metrics-detail-grid">
          <ConfusionMatrix matrix={metrics.confusion_matrix}/>
          <Card title="Class-specific metrics" subtitle="Precision, recall and F1 on test data">
            <div className="metrics-table"><div className="metric-row metric-header"><span>Class</span><span>Precision</span><span>Recall</span><span>F1</span></div>
              {['0','1'].map((key)=><div className="metric-row" key={key}><b>Class {key}</b><span>{report?.[key]?.precision?.toFixed(3) ?? '—'}</span><span>{report?.[key]?.recall?.toFixed(3) ?? '—'}</span><span>{report?.[key]?.['f1-score']?.toFixed(3) ?? '—'}</span></div>)}
            </div>
            <div className="inline-note"><FileWarning size={16}/><span>Results are from a small educational dataset. They do not establish clinical validity.</span></div>
          </Card>
        </div>
        <Card title="ROC curve" subtitle="Saved during your notebook evaluation step"><p className="muted">The Flask metrics endpoint currently returns the ROC-AUC score but not the individual ROC coordinates. Your generated chart is saved at <code>outputs/figures/roc_curve.png</code> in the main project folder.</p></Card>
      </> : <div className="placeholder-card tall"><ChartNoAxesCombined size={44}/><h3>{loading ? 'Loading performance metrics…' : 'Metrics unavailable'}</h3><p>Make sure your Flask backend is running and outputs/metrics/model_comparison.csv exists.</p></div>}
    </div>
  );
}
