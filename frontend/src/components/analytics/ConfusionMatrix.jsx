import Card from '../common/Card.jsx';

export default function ConfusionMatrix({ matrix }) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) return null;
  const max = Math.max(...matrix.flat(), 1);
  return (
    <Card title="Confusion matrix" subtitle="Test-set classification outcomes">
      <div className="confusion-wrap">
        <div className="confusion-top"><span>Predicted class 0</span><span>Predicted class 1</span></div>
        <div className="confusion-body">
          <div className="confusion-labels"><span>Actual 0</span><span>Actual 1</span></div>
          <div className="confusion-grid">
            {matrix.flat().map((n, i) => <div key={i} className={`cm-cell ${i === 0 || i === 3 ? 'cm-correct' : 'cm-incorrect'}`}
              style={{ opacity: 0.65 + 0.35 * (Number(n) / max) }}>
              <strong>{n}</strong><small>{i === 0 ? 'True negative' : i === 1 ? 'False positive' : i === 2 ? 'False negative' : 'True positive'}</small>
            </div>)}
          </div>
        </div>
      </div>
    </Card>
  );
}
