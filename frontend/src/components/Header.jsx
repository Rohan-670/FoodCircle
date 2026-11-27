import React from 'react';

export function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <span className="header-icon" role="img" aria-label="bowl of food">🍲</span>
        <h1 className="header-title">Surplus Food Donation & NGO Coordination</h1>
      </div>
      <span className="header-badge">Phase 1: Foundation</span>
    </header>
  );
}

export default Header;
