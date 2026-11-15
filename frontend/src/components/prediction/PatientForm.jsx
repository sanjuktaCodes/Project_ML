import { Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import Card from '../common/Card.jsx';

// Example dataset row, not a real patient or medical recommendation.
// The numeric values are retained for compatibility with the trained Flask model.
export const examplePatient = {
  age: 52, sex: 1, cp: 0, trestbps: 125, chol: 212,
  fbs: 0, restecg: 1, thalach: 168, exang: 0,
  oldpeak: 1.0, slope: 2, ca: 2, thal: 3,
};

// Display labels use the commonly documented 0-based Cleveland-style encoding.
// Dataset copies sometimes differ; verify the source's codebook before using
// these labels for medical interpretation.
const choice = (value, label) => ({ value, label });

const fieldGroups = [
  {
    title: 'Personal & symptom inputs',
    fields: [
      { key: 'age', label: 'Age (years)', min: 1, max: 120, step: 1 },
      {
        key: 'sex', label: 'Sex',
        options: [choice(0, 'Female'), choice(1, 'Male')],
      },
      {
        key: 'cp', label: 'Chest pain type',
        options: [
          choice(0, 'Typical angina'),
          choice(1, 'Atypical angina'),
          choice(2, 'Non-anginal pain'),
          choice(3, 'Asymptomatic'),
        ],
      },
      {
        key: 'exang', label: 'Exercise-induced angina',
        options: [choice(0, 'No'), choice(1, 'Yes')],
      },
    ],
  },
  {
    title: 'Clinical measurements',
    fields: [
      { key: 'trestbps', label: 'Resting BP (mmHg)', min: 60, max: 260, step: 1 },
      { key: 'chol', label: 'Cholesterol (mg/dL)', min: 80, max: 650, step: 1 },
      { key: 'thalach', label: 'Maximum heart rate (bpm)', min: 40, max: 250, step: 1 },
      { key: 'oldpeak', label: 'ST depression (oldpeak)', min: 0, max: 7, step: 0.1 },
    ],
  },
  {
    title: 'Additional clinical inputs',
    fields: [
      {
        key: 'fbs', label: 'Fasting blood sugar',
        options: [
          choice(0, '120 mg/dL or less'),
          choice(1, 'Above 120 mg/dL'),
        ],
      },
      {
        key: 'restecg', label: 'Resting ECG result',
        options: [
          choice(0, 'Normal'),
          choice(1, 'ST-T wave abnormality'),
          choice(2, 'Left ventricular hypertrophy'),
        ],
      },
      {
        key: 'slope', label: 'Exercise ST-segment slope',
        options: [
          choice(0, 'Upsloping'),
          choice(1, 'Flat'),
          choice(2, 'Downsloping'),
        ],
      },
      {
        key: 'ca', label: 'Major vessels seen by fluoroscopy',
        options: [
          choice(0, 'No major vessels'),
          choice(1, '1 major vessel'),
          choice(2, '2 major vessels'),
          choice(3, '3 major vessels'),
          choice(4, 'Other / undocumented value'),
        ],
      },
      {
        key: 'thal', label: 'Thallium stress-test result',
        options: [
          choice(0, 'Unknown / unspecified'),
          choice(1, 'Fixed perfusion defect'),
          choice(2, 'Normal perfusion'),
          choice(3, 'Reversible perfusion defect'),
        ],
      },
    ],
  },
];

export default function PatientForm({ onSubmit, loading }) {
  const [values, setValues] = useState({ ...examplePatient });
  const [formError, setFormError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const patient = {};

    for (const group of fieldGroups) {
      for (const field of group.fields) {
        const raw = values[field.key];
        const value = Number(raw);

        if (raw === '' || raw === null || raw === undefined || !Number.isFinite(value)) {
          setFormError(`Please enter a valid value for ${field.label}.`);
          return;
        }

        if (field.options) {
          if (!field.options.some((option) => option.value === value)) {
            setFormError(`Please select a valid option for ${field.label}.`);
            return;
          }
        } else {
          if (value < field.min || value > field.max) {
            setFormError(`${field.label} must be between ${field.min} and ${field.max}.`);
            return;
          }
          if (field.step === 1 && !Number.isInteger(value)) {
            setFormError(`${field.label} must be a whole number.`);
            return;
          }
        }

        patient[field.key] = value;
      }
    }

    setFormError('');
    onSubmit(patient);
  };

  return (
    <form onSubmit={submit}>
      <Card title="Patient parameters" subtitle="Enter all 13 inputs used by your trained model">
        <p className="subtle-warning">
          Descriptions are shown instead of numeric codes. The original numeric values are still
          sent to the model. Category meanings can vary by dataset version; verify against the
          source codebook before clinical interpretation.
        </p>

        {fieldGroups.map((group) => (
          <div key={group.title} className="form-group-section">
            <h4>{group.title}</h4>
            <div className="field-grid">
              {group.fields.map((field) => (
                <label className="field" key={field.key}>
                  <span>{field.label}</span>
                  {field.options ? (
                    <select
                      value={values[field.key]}
                      disabled={loading}
                      required
                      onChange={(event) => setValues((previous) => ({
                        ...previous,
                        [field.key]: event.target.value,
                      }))}
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      required
                      value={values[field.key]}
                      disabled={loading}
                      onChange={(event) => setValues((previous) => ({
                        ...previous,
                        [field.key]: event.target.value,
                      }))}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}

        {formError && <p className="form-error" role="alert">{formError}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-btn"
            disabled={loading}
            onClick={() => {
              setValues({ ...examplePatient });
              setFormError('');
            }}
          >
            <RotateCcw size={16} /> Reset example
          </button>
          <button type="submit" className="primary-btn" disabled={loading}>
            <Play size={16} /> {loading ? 'Predicting…' : 'Run prediction'}
          </button>
        </div>
      </Card>
    </form>
  );
}