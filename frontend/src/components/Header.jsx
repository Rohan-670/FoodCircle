import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui';

const PRIMARY_FLOWS = [
  { id: 'landing', label: 'Home' },
  { id: 'donor-dashboard', label: 'I Have Food' },
  { id: 'ngo-dashboard', label: 'I Need Food' },
  { id: 'volunteer-dashboard', label: 'Volunteer' },
  { id: 'listings', label: 'Surplus Catalog' },
  { id: 'admin-dashboard', label: 'Admin Hub' },
];

export function Header({ currentPage, onNavigate }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Statutory & Compliance Banner modeled after donatefood.in */}
      <div className="statutory-topbar">
        <div className="statutory-topbar-inner">
          <div className="statutory-badge">
            <span className="statutory-badge-dot" aria-hidden="true"></span>
            <span>
              <strong>FSSAI 2019 Guidelines</strong> • Statutory Good Samaritan Legal Shield • NITI Aayog DARPAN Verified Network
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ opacity: 0.85 }}>Single-Use 256-bit QR Delivery Handoffs</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span style={{ color: '#fed7aa', fontWeight: 600 }}>Zero Commercial Food Waste</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="site-header-inner">
          <button
            type="button"
            className="brand-link"
            onClick={() => onNavigate('landing')}
          >
            <span className="brand-mark" aria-hidden="true">
              FC
            </span>
            <span>
              <span className="brand-name">FoodCircle</span>
              <span className="brand-sub">Surplus Food Rescue &amp; Coordination</span>
            </span>
          </button>

          {/* Primary Nav matching donatefood.in role-first pathways */}
          <nav className="primary-nav" aria-label="Primary navigation">
            {PRIMARY_FLOWS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${currentPage === item.id ? 'is-active' : ''}`}
                aria-current={currentPage === item.id ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="header-actions">
            {/* Quick Demo Role Switcher */}
            <div className="role-quick-switcher" title="Quick Role Switcher for previewing features">
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                Role:
              </span>
              <button
                type="button"
                className={`role-pill-btn ${currentPage === 'donor-dashboard' ? 'is-active' : ''}`}
                onClick={() => onNavigate('donor-dashboard')}
              >
                Donor
              </button>
              <button
                type="button"
                className={`role-pill-btn ${currentPage === 'ngo-dashboard' ? 'is-active' : ''}`}
                onClick={() => onNavigate('ngo-dashboard')}
              >
                NGO
              </button>
              <button
                type="button"
                className={`role-pill-btn ${currentPage === 'volunteer-dashboard' ? 'is-active' : ''}`}
                onClick={() => onNavigate('volunteer-dashboard')}
              >
                Volunteer
              </button>
              <button
                type="button"
                className={`role-pill-btn ${currentPage === 'admin-dashboard' ? 'is-active' : ''}`}
                onClick={() => onNavigate('admin-dashboard')}
              >
                Admin
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('login')}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => onNavigate('signup')}
            >
              Register
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
