import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from 'recharts';
import Card from '../common/Card.jsx';

export default function FeatureBarChart({ title, subtitle, data, valueKey }) {
  const rows = (data || []).slice(0, 13).map((row) => ({
    feature: row.feature,
    rule: row.rule,
    value: Number(row[valueKey] ?? row.value ?? 0),
  }));
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="chart-scroll">
        <div className="chart-box" style={{ height: Math.max(330, rows.length * 30 + 80) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={rows} margin={{ top: 4, right: 32, bottom: 10, left: 18 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#23324c" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v.toFixed(2)} />
              <YAxis type="category" dataKey="feature" width={87} tick={{ fill: '#d5e0ee', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#17243a', border: '1px solid #32445f', borderRadius: 9, color: '#eef6ff' }}
                formatter={(value) => [Number(value).toFixed(5), 'Contribution']} />
              <ReferenceLine x={0} stroke="#94a3b8" />
              <Bar dataKey="value" radius={[3, 3, 3, 3]} maxBarSize={16}>
                {rows.map((row, i) => <Cell key={i} fill={row.value >= 0 ? '#41c7b1' : '#f5a56b'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="legend"><span><i className="legend-dot positive"/>Positive contribution</span><span><i className="legend-dot negative"/>Negative contribution</span></div>
    </Card>
  );
}
