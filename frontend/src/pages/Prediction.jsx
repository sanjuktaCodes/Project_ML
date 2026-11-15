import { ClipboardList } from 'lucide-react';
import PatientForm from '../components/prediction/PatientForm.jsx';
import PredictionResult from '../components/prediction/PredictionResult.jsx';
import ErrorNotice from '../components/common/ErrorNotice.jsx';

export default function Prediction({ prediction, onPredict, onExplain, predicting, explaining, error }) {
  return (
    <div className="page-content">
      <div className="page-heading"><div className="heading-icon"><ClipboardList size={23}/></div><div><h2>New prediction</h2><p>Enter coded features from the Heart Disease dataset.</p></div></div>
      <div className="prediction-layout">
        <PatientForm onSubmit={onPredict} loading={predicting}/>
        <div className="prediction-side">
          <ErrorNotice message={error}/>
          {prediction ? <PredictionResult prediction={prediction} onExplain={onExplain} explaining={explaining}/>
            : <div className="placeholder-card"><ClipboardList size={38}/><h3>Awaiting patient input</h3><p>Submit the form to see the predicted class and model probabilities.</p></div>}
        </div>
      </div>
    </div>
  );
}
