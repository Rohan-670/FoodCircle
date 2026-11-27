import React from 'react';
import Badge from './Badge';

export function PageContainer({
  eyebrow,
  title,
  subtitle,
  actions,
  showMockBanner = true,
  children,
}) {
  return (
    <div className="page-container">
      {showMockBanner && (
        <div className="mock-banner" role="note">
          <span>
            <strong>Static UI Preview:</strong> Displaying sample mock data. Backend API
            connections are intentionally disabled in this design-system preview.
          </span>
          <Badge tone="terracotta">Mock Data Preview</Badge>
        </div>
      )}

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
