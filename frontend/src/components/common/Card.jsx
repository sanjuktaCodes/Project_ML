export default function Card({ title, subtitle, children, right, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || right) && (
        <div className="panel-heading">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
