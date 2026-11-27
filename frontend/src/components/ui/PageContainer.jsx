import React from 'react';

export function PageContainer({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <div className="page-container">
      {(title || eyebrow || subtitle || actions) && (
        <header className="page-header">
          <div>
            {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
            {title && <h1 className="page-title">{title}</h1>}
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>{actions}</div>}
        </header>
      )}

      {children}
    </div>
  );
}

export default PageContainer;
