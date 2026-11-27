import React from 'react';
import Logo from './Logo';

export function Footer({ onNavigate }) {
  const handleNav = (page) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-inner" style={{ flexDirection: 'column', gap: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <Logo size={28} />
              <strong style={{ fontSize: '0.95rem' }}>Surplus Food Donation &amp; NGO Coordination System</strong>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '32ch' }}>
              Connecting surplus food with those who need it through real-time coordination, transparent matching, and volunteer tracking.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Platform</div>
            <ul className="footer-link-list">
              <li>
                <button type="button" onClick={() => handleNav('listings')}>
                  Surplus Catalog
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('donor-dashboard')}>
                  Donor Hub
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('ngo-dashboard')}>
                  NGO Recommendations
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('volunteer-dashboard')}>
                  Volunteer &amp; Tracking
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('impact-dashboard')}>
                  Impact Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Management</div>
            <ul className="footer-link-list">
              <li>
                <button type="button" onClick={() => handleNav('admin-dashboard')}>
                  Organization Verification
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('admin-dashboard')}>
                  Audit Logs
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('settings')}>
                  Profile Settings
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Support</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Dispatch Support: <strong>+91 (80) 2345-FOOD</strong>
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-forest)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
              All systems operational
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <span>FoodCircle &copy; {new Date().getFullYear()} • Food Rescue &amp; NGO Coordination</span>
          <span>Fast, verified handoffs with single-use QR tokens</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
