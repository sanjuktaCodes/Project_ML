export default function StatCard({ label, value, subtitle, icon: Icon, iconClass = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span>{label}</span>{Icon && <div className={`stat-icon ${iconClass}`}><Icon size={20}/></div>}</div>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </div>
  );
}
