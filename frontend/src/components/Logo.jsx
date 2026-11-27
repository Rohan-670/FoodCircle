import React from 'react';

/**
 * Trendy Modern Vector Logo for "FoodCircle"
 * Features a sleek geometric circular ribbon intertwining a fresh rescue leaf (emerald)
 * and sharing food loop (sunset terracotta) with a center community spark.
 */
export function Logo({ size = 36, showText = false, subtitle = true, className = '' }) {
  return (
    <div
      className={`app-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        textDecoration: 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(32, 60, 50, 0.22))' }}
        aria-label="FoodCircle Logo"
      >
        <defs>
          {/* Deep Forest Tech Canvas Gradient */}
          <linearGradient id="fcBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B382E" />
            <stop offset="100%" stopColor="#0F241C" />
          </linearGradient>

          {/* Fresh Emerald Leaf Arc */}
          <linearGradient id="fcLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Vibrant Sunset Terracotta Food Loop */}
          <linearGradient id="fcWarmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Golden Core Spark */}
          <linearGradient id="fcSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>

          {/* Subtle Ambient Glow */}
          <filter id="fcGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Modern Rounded Squircle Container */}
        <rect width="48" height="48" rx="14" fill="url(#fcBaseGrad)" />
        <rect
          x="0.75"
          y="0.75"
          width="46.5"
          height="46.5"
          rx="13.25"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
        />

        {/* Outer Coordinate Loop Halo (Dotted Orbit) */}
        <circle
          cx="24"
          cy="24"
          r="17"
          stroke="#34D399"
          strokeWidth="1.2"
          strokeDasharray="2.5 3.5"
          strokeOpacity="0.35"
        />

        {/* Left Sprouting Leaf Ribbon (Flowing Counter-Clockwise) */}
        <path
          d="M24 10 C16 10 11 16 11 23 C11 29 15 34 21 36 C18 32 17 27 18 22 C19 16 23 12 24 10 Z"
          fill="url(#fcLeafGrad)"
        />

        {/* Right Food Rescue Bowl & Coordination Arc (Flowing Clockwise) */}
        <path
          d="M24 38 C32 38 37 32 37 25 C37 19 33 14 27 12 C30 16 31 21 30 26 C29 32 25 36 24 38 Z"
          fill="url(#fcWarmGrad)"
        />

        {/* Interlocking Smooth Flowing Circle Bridge */}
        <path
          d="M21 36 C24 37.5 27 36 29 34 C31 32 32 29 32 26"
          stroke="url(#fcWarmGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M27 12 C24 10.5 21 12 19 14 C17 16 16 19 16 22"
          stroke="url(#fcLeafGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Center Community Heart & Compassion Node */}
        <circle cx="24" cy="24" r="3.2" fill="url(#fcSparkGrad)" filter="url(#fcGlow)" />

        {/* Micro Satellite Coordination Dots (Donor, NGO, Volunteer) */}
        <circle cx="24" cy="6.5" r="1.6" fill="#34D399" />
        <circle cx="41.5" cy="24" r="1.6" fill="#FB923C" />
        <circle cx="6.5" cy="24" r="1.6" fill="#FDE68A" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
                fontWeight: 700,
                fontSize: '1.28rem',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Food
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans, "Inter", sans-serif)',
                fontWeight: 700,
                fontSize: '1.28rem',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--color-forest)',
              }}
            >
              Circle
            </span>
          </div>
          {subtitle && (
            <span
              style={{
                fontFamily: 'var(--font-sans, "Inter", sans-serif)',
                fontSize: '0.72rem',
                color: 'var(--color-saffron, #C8794A)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '1px',
              }}
            >
              Food Rescue Network
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;
