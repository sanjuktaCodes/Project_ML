import { ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card.jsx';
import RiskGauge from './RiskGauge.jsx';

export default function PredictionResult({ prediction, onExplain, explaining }) {
  if (!prediction) return null;
  const positive = Number(prediction.predicted_class) === 1;
  return (
    <Card title="Prediction result" subtitle="Output from your saved best_model.joblib" className="result-panel">
      <div className="result-layout">
        <RiskGauge probability={prediction.probability_class_1}/>
        <div className="result-copy">
          <div className={`result-tag ${positive ? 'tag-amber' : 'tag-green'}`}><CheckCircle2 size={15}/> Predicted Class {prediction.predicted_class}</div>
          <h2>{prediction.label || `Class ${prediction.predicted_class}`}</h2>
          <p>Class 0 probability: <b>{(prediction.probability_class_0 * 100).toFixed(2)}%</b></p>
          <p>Class 1 probability: <b>{(prediction.probability_class_1 * 100).toFixed(2)}%</b></p>
          <button className="primary-btn" onClick={onExplain} disabled={explaining} type="button">
            {explaining ? 'Generating explanations…' : 'Generate SHAP + LIME'} <ArrowRight size={16}/>
          </button>
        </div>
      </div>
      <div className="inline-note"><Info size={16}/><span>These are model-estimated class probabilities, not a diagnosis or a medically validated risk score.</span></div>
    </Card>
  );
}
