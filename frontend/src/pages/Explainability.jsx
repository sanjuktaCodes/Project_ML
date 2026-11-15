import { Activity, ArrowRight, Info } from 'lucide-react';
import FeatureBarChart from '../components/explainability/FeatureBarChart.jsx';
import Card from '../components/common/Card.jsx';
import ErrorNotice from '../components/common/ErrorNotice.jsx';

export default function Explainability({ result, loading, error, hasPatient, onExplain, onNavigate }) {
  return (
    <div className="page-content">
      <div className="page-heading"><div className="heading-icon"><Activity size={23}/></div><div><h2>Explainability</h2><p>Feature-attribution analysis for your most recent input.</p></div></div>
      <ErrorNotice message={error}/>
      {!result ? (
        <div className="placeholder-card tall"><Activity size={44}/><h3>No explanations available yet</h3><p>{hasPatient ? 'Generate SHAP and LIME explanations for the most recent prediction.' : 'First run a prediction using the patient form.'}</p>
          <button className="primary-btn" type="button" disabled={loading} onClick={hasPatient ? onExplain : () => onNavigate('prediction')}>
            {loading ? 'Generating…' : hasPatient ? 'Generate explanations' : 'Go to prediction'} <ArrowRight size={16}/>
          </button>
        </div>
      ) : (
        <>
          <div className="inline-note"><Info size={17}/><span>SHAP values are measured in log-odds; LIME weights come from a local probability surrogate. Their magnitudes are not directly comparable. Signs indicate direction toward or away from Class 1.</span></div>
          <div className="explain-grid">
            <FeatureBarChart title="SHAP explanation" subtitle="Aggregated contributions by original feature · log-odds" data={result.shap?.features} valueKey="value" />
            <FeatureBarChart title="LIME explanation" subtitle="Local surrogate feature weights · Class 1" data={result.lime?.features} valueKey="weight" />
          </div>
          <Card title="LIME feature rules" subtitle="Perturbation intervals and conditions around this input">
            <div className="rules-list">{(result.lime?.features || []).map((item, i) => <div className="rule-row" key={`${item.feature}-${i}`}><b>{item.feature}</b><span>{item.rule}</span><strong>{Number(item.weight) >= 0 ? '+' : ''}{Number(item.weight).toFixed(4)}</strong></div>)}</div>
          </Card>
        </>
      )}
    </div>
  );
}
