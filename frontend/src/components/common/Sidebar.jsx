import { Activity, ChartNoAxesCombined, HeartPulse, LayoutDashboard, ScanHeart, ShieldCheck } from 'lucide-react';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prediction', label: 'New prediction', icon: ScanHeart },
  { id: 'explain', label: 'Explainability', icon: Activity },
  { id: 'performance', label: 'Model performance', icon: ChartNoAxesCombined },
];

export default function Sidebar({ page, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><HeartPulse size={24} /></div>
        <div><strong>CardioExplain</strong><small>Explainable ML Studio</small></div>
      </div>
      <div className="sidebar-caption">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => onNavigate(id)}
            className={`nav-link ${page === id ? 'active' : ''}`}>
            <Icon size={18} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <ShieldCheck size={18} />
        <span>Academic demonstration only<br />Not a medical diagnosis</span>
      </div>
    </aside>
  );
}
