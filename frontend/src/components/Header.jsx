import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui';

const NAV_ITEMS = [
  { id: 'landing', label: 'Home' },
  { id: 'listings', label: 'Surplus Catalog' },
  { id: 'donor-dashboard', label: 'Donor' },
  { id: 'ngo-dashboard', label: 'NGO' },
  { id: 'volunteer-dashboard', label: 'Volunteer' },
  { id: 'admin-dashboard', label: 'Admin' },
];

export function Header({ currentPage, onNavigate }) {
  const { theme, toggleTheme } = useTheme();

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
          {/* Quick interactive role switcher */}
          <div className="role-quick-switcher" title="Switch role view">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
              View:
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
  );
}

export default Header;
