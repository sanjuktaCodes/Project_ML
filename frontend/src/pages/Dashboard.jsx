import { Activity, ArrowRight, Brain, ChartNoAxesCombined, Database, Target } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import StatCard from '../components/common/StatCard.jsx';
import ErrorNotice from '../components/common/ErrorNotice.jsx';

export default function Dashboard({ metrics, error, loading, onNavigate, lastPrediction }) {
  return (
    <div className="page-content">
      <div className="hero">
        <div className="hero-kicker"><Activity size={15}/> RESEARCH WORKSPACE</div>
        <h2>Understand the prediction.<br/><em>Not just the result.</em></h2>
        <p>Explore cardiovascular disease classification and explain individual predictions with SHAP and LIME.</p>
        <button className="primary-btn" type="button" onClick={() => onNavigate('prediction')}>Analyze a patient <ArrowRight size={17}/></button>
        <div className="hero-art" aria-hidden="true"><Activity size={145} strokeWidth={0.8} /></div>
      </div>
      <div className="stats-grid">
        <StatCard label="Best model" value={metrics?.best_model || (loading ? 'Loading…' : '—')} subtitle="Selected by CV ROC-AUC" icon={Brain} iconClass="indigo"/>
        <StatCard label="Test accuracy" value={metrics ? `${(metrics.accuracy * 100).toFixed(2)}%` : '—'} subtitle="Untouched test split" icon={Target} iconClass="green"/>
        <StatCard label="Test ROC-AUC" value={metrics ? metrics.roc_auc.toFixed(4) : '—'} subtitle="Discrimination metric" icon={ChartNoAxesCombined} iconClass="purple"/>
        <StatCard label="Test records" value={metrics?.confusion_matrix?.flat().reduce((a,b)=>a+b,0) ?? '—'} subtitle="Unique held-out rows" icon={Database} iconClass="orange"/>
      </div>
      <ErrorNotice message={error}/>
      <div className="dashboard-grid">
        <Card title="Project workflow" subtitle="How the analysis is organized">
          <div className="workflow">
            {['Data cleaning & split','Model comparison','Classification output','Local explanations'].map((stage,index)=>(
              <div key={stage} className="workflow-item"><span className="workflow-number">0{index+1}</span><b>{stage}</b><span>{['302 unique records','Cross-validated models','Class 0 / Class 1','SHAP + LIME'][index]}</span></div>
            ))}
          </div>
        </Card>
        <Card title="Current analysis" subtitle="Most recent prediction in this browser session">
          {lastPrediction ? <div className="latest-result"><div className="latest-number">{(lastPrediction.probability_class_1*100).toFixed(1)}%</div><p>Estimated probability of Class 1</p><strong>Predicted class {lastPrediction.predicted_class}</strong><button className="text-link" onClick={()=>onNavigate('explain')} type="button">View explanations <ArrowRight size={15}/></button></div> : <div className="empty-state"><Brain size={37}/><p>No prediction yet</p><span>Enter patient parameters to see a prediction and explanations.</span><button className="text-link" onClick={()=>onNavigate('prediction')} type="button">Start prediction <ArrowRight size={15}/></button></div>}
        </Card>
      </div>
    </div>
  );
}
