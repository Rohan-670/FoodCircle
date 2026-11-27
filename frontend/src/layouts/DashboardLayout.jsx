import React from 'react';
import { PageContainer, Card, Badge } from '../components/ui';

export function DashboardLayout({
  roleLabel,
  title,
  subtitle,
  sidebarItems = [],
  activeSection,
  onSectionChange,
  metrics = [],
  actions,
  children,
}) {
  return (
    <PageContainer
      eyebrow={`${roleLabel} Workspace`}
      title={title}
      subtitle={subtitle}
      actions={actions}
    >
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar" aria-label={`${roleLabel} navigation`}>
          <div className="dashboard-role-tag">{roleLabel} Menu</div>
          <nav className="sidebar-nav">
            {sidebarItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-btn ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onSectionChange(item.id)}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <Badge tone={isActive ? 'mint' : 'neutral'}>{item.count}</Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="dashboard-main">
          {metrics.length > 0 && (
            <div className="grid-4">
              {metrics.map((m) => (
                <Card key={m.label}>
                  <div className="kpi-label">{m.label}</div>
                  <div className="kpi-value">{m.value}</div>
                  {m.note && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {m.note}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {children}
        </div>
      </div>
    </PageContainer>
  );
}

export default DashboardLayout;
