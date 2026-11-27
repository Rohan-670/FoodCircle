import React from 'react';

export function Card({
  title,
  subtitle,
  badge,
  footer,
  interactive = false,
  className = '',
  children,
  ...props
}) {
  return (
    <section
      className={`card ${interactive ? 'card-interactive' : ''} ${className}`.trim()}
      {...props}
    >
      {(title || subtitle || badge) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {badge}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </section>
  );
}

export default Card;
