import React from 'react';

export function Footer({ onNavigate }) {
  const handleNav = (page) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-inner" style={{ flexDirection: 'column', gap: '2rem' }}>
        {/* Compliance Badges Bar modeled on donatefood.in */}
        <div className="footer-badge-strip" style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-forest)' }}>
              COMPLIANCE BENCHMARKS:
            </span>
            <span className="geo-filter-pill">FSSAI 2019 Schedule I</span>
            <span className="geo-filter-pill">NITI Aayog DARPAN</span>
            <span className="geo-filter-pill">Good Samaritan Statutory Protection</span>
            <span className="geo-filter-pill">Single-Use 256-bit QR Tokens</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Digital Public Infrastructure for Food Rescue
          </div>
        </div>

        {/* 3 Columns Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', width: '100%' }}>
          <div>
            <div className="footer-col-title">Surplus Food Rescue</div>
            <ul className="footer-link-list">
              <li>
                <button type="button" onClick={() => handleNav('donor-dashboard')}>
                  Log Surplus Food Batch (Donor)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('listings')}>
                  Browse Active Surplus Catalog
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('ngo-dashboard')}>
                  Transparent Recommendation Engine
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('donor-dashboard')}>
                  FSSAI Food Safety Checklist
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Logistics &amp; Coordination</div>
            <ul className="footer-link-list">
              <li>
                <button type="button" onClick={() => handleNav('volunteer-dashboard')}>
                  Volunteer Task Board
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('volunteer-dashboard')}>
                  Consent-Based GPS Sharing
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('volunteer-dashboard')}>
                  QR Pickup &amp; Delivery Confirmation
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('landing')}>
                  Real-Time Proximity Geo-Locator
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Governance &amp; Trust</div>
            <ul className="footer-link-list">
              <li>
                <button type="button" onClick={() => handleNav('admin-dashboard')}>
                  NITI Aayog DARPAN Verification Queue
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('admin-dashboard')}>
                  Immutable Audit Logs
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('admin-dashboard')}>
                  Food Safety Incident Reports
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('settings')}>
                  Profile &amp; Notification Preferences
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Dispatch Coordination</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.65rem' }}>
              Central Ward Relief Hotline: <strong style={{ color: 'var(--text-primary)' }}>+91 (80) 2345-FOOD</strong>
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Operating 7 days a week for immediate cooked banquet and cafeteria surplus dispatches.
            </p>
          </div>
        </div>

        {/* Good Samaritan Statutory Shield Callout */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>
            Statutory Good Samaritan Protection:
          </strong>{' '}
          In accordance with the Supreme Court ruling in <em>Save Life Foundation v. Union of India</em> and FSSAI guidelines on Surplus Food Distribution, donors and logistics volunteers acting in good faith without negligence are protected against civil or criminal liabilities for food donated within safe holding limits.
        </div>

        {/* Bottom Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <span>
            <strong>FoodCircle</strong> — Surplus Food Rescue &amp; Coordination System
          </span>
          <span>
            Static Editorial Preview • Aligned with donatefood.in Public Standards
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
