import React from 'react';

/**
 * Premium Vector Logo for "Surplus Food Donation & NGO Coordination System"
 * Combines the food coordination circle, sharing hands / bowl, fresh leaf, and heart accent.
 */
export function Logo({ size = 36, showText = false, subtitle = true, className = '' }) {
  return (
    <div
      className={`app-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-label="Surplus Food Donation & NGO Coordination System Emblem"
      >
        <defs>
          <linearGradient id="forestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E5A4B" />
            <stop offset="100%" stopColor="#1B332A" />
          </linearGradient>
          <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E27244" />
            <stop offset="100%" stopColor="#C45A2C" />
          </linearGradient>
          <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E4F0E8" />
            <stop offset="100%" stopColor="#B8D7C7" />
          </linearGradient>
          <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Outer Circular Coordination Ring */}
        <circle cx="24" cy="24" r="23" fill="url(#forestGrad)" />

        {/* Circular Coordination Orbit Track (Dashed/Smooth) */}
        <circle
          cx="24"
          cy="24"
          r="19"
          stroke="url(#mintGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 2.5"
          strokeOpacity="0.45"
        />

        {/* Coordination Nodes (3 nodes for Donor, NGO, Volunteer) */}
        <circle cx="24" cy="5" r="2" fill="#E27244" />
        <circle cx="7.5" cy="33.5" r="1.8" fill="#B8D7C7" />
        <circle cx="40.5" cy="33.5" r="1.8" fill="#B8D7C7" />

        {/* The Sharing Bowl / Gentle Hands Foundation */}
        <path
          d="M12 25 C12 34 17 38 24 38 C31 38 36 34 36 25 C31 28 17 28 12 25 Z"
          fill="url(#warmGrad)"
          filter="url(#subtleGlow)"
        />

        {/* Sprouting Life & Freshness Leaf (Left) */}
        <path
          d="M24 24 C17 21 16 13 24 10 C25.5 15 25.5 20 24 24 Z"
          fill="#D7E5DC"
        />

        {/* Sprouting Compassion & Harvest Leaf (Right) */}
        <path
          d="M24 24 C31 21 32 13 24 10 C26 15 25.5 19 24 24 Z"
          fill="#86B2A0"
        />

        {/* Leaf Center Stem */}
        <path
          d="M24 11 L24 25"
          stroke="#1B332A"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Community Heart / Ember of Care in Center */}
        <path
          d="M24 26 C22.8 24.5 20.5 25 20.5 26.8 C20.5 28.5 24 31 24 31 C24 31 27.5 28.5 27.5 26.8 C27.5 25 25.2 24.5 24 26 Z"
          fill="#FFFFFF"
        />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            className="brand-name"
            style={{
              fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
              fontWeight: 700,
              fontSize: '1.02rem',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
            }}
          >
            Surplus Food Donation &amp; NGO Coordination System
          </span>
          {subtitle && (
            <span
              className="brand-sub"
              style={{
                fontSize: '0.74rem',
                color: 'var(--color-saffron, #C8794A)',
                fontWeight: 600,
                letterSpacing: '0.02em',
                marginTop: '1px',
              }}
            >
              Connecting Surplus Food With Those Who Need It
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;
