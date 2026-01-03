import './Card.css'

function Card({ 
  children, 
  title, 
  subtitle,
  actions,
  className = '',
  ...props 
}) {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  )
}

export default Card
