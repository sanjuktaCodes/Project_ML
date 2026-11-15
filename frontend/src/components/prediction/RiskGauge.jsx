export default function RiskGauge({ probability }) {
  const percent = Math.round(Math.max(0, Math.min(1, Number(probability) || 0)) * 100);
  return (
    <div className="gauge-wrap" aria-label={`Model's estimated probability for Class 1: ${percent}%`}>
      <div className="gauge" style={{ '--progress': `${percent}%` }}>
        <div className="gauge-inner"><strong>{percent}%</strong><span>Class 1 estimate</span></div>
      </div>
    </div>
  );
}
