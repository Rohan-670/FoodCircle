import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Header({ currentPage, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  return (
    <header className="header">
      <div
        className="header-logo"
        style={{ cursor: 'pointer' }}
        onClick={() => onNavigate('home')}
      >
        <span className="header-icon" role="img" aria-label="bowl of food">
          🍲
        </span>
        <h1 className="header-title">Surplus Food Donation &amp; NGO Coordination</h1>
      </div>

      <nav className="header-nav">
        <button
          type="button"
          className={`nav-button ${currentPage === 'home' ? 'nav-active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>

        {isAuthenticated ? (
          <>
            <button
              type="button"
              className={`nav-button ${currentPage === 'profile' ? 'nav-active' : ''}`}
              onClick={() => onNavigate('profile')}
            >
              {user.fullName} ({user.role})
            </button>
            <button
              type="button"
              className="nav-button nav-outline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`nav-button ${currentPage === 'login' ? 'nav-active' : ''}`}
              onClick={() => onNavigate('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className="nav-button nav-primary"
              onClick={() => onNavigate('signup')}
            >
              Sign Up
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
