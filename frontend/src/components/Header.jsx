import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const NAV_ITEMS = [
  { id: 'landing', label: 'Home' },
  { id: 'listings', label: 'Surplus Catalog' },
  { id: 'donor-dashboard', label: 'Donate Food' },
  { id: 'ngo-dashboard', label: 'NGO Portal' },
  { id: 'volunteer-dashboard', label: 'Volunteer' },
  { id: 'admin-dashboard', label: 'Governance' },
];

export function Header({ currentPage, onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    onNavigate('landing');
  };

  return (
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
            <span className="brand-sub">Food Rescue Network</span>
          </span>
        </button>

        <nav className="primary-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
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
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </Button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                style={{
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-forest)' }}></span>
                <span>{user.organizationName || user.fullName || 'My Account'}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>({user.role})</span>
              </button>

              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
