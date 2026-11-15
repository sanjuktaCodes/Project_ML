import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Card from '../common/Card.jsx';

export default function ModelComparison({ comparisons = [] }) {
  const data = comparisons.map((row) => ({
    name: row.Model,
    accuracy: Number(row['CV Accuracy']) * 100,
    auc: Number(row['CV ROC-AUC']) * 100,
  }));
  return (
    <Card title="Model comparison" subtitle="Five-fold cross-validation on the training split">
      {data.length === 0 ? <p className="muted">No comparison metrics available.</p> : (
        <div className="chart-box chart-wide">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, bottom: 15, left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#23324c" />
              <XAxis dataKey="name" tick={{ fill: '#c6d4e3', fontSize: 11 }}/>
              <YAxis domain={[0,100]} tickFormatter={(v) => `${v}%`} tick={{ fill: '#94a3b8', fontSize: 11 }}/>
              <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}%`, '']} contentStyle={{ background:'#17243a', border:'1px solid #32445f', color:'#eef6ff' }}/>
              <Legend wrapperStyle={{ fontSize: 12 }}/>
              <Bar dataKey="accuracy" name="CV Accuracy" fill="#4e8dff" radius={[5,5,0,0]} />
              <Bar dataKey="auc" name="CV ROC-AUC" fill="#48ceb2" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
