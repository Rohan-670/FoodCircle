import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui';

const NAV_ITEMS = [
  { id: 'landing', label: 'Home' },
  { id: 'listings', label: 'Listings' },
  { id: 'details', label: 'Details' },
  { id: 'donor-dashboard', label: 'Donor' },
  { id: 'ngo-dashboard', label: 'NGO' },
  { id: 'volunteer-dashboard', label: 'Volunteer' },
  { id: 'admin-dashboard', label: 'Admin' },
  { id: 'settings', label: 'Settings' },
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
            <span className="brand-sub">Surplus Food Rescue</span>
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
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('login')}
          >
            Login
          </Button>
          <Button size="sm" onClick={() => onNavigate('signup')}>
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
