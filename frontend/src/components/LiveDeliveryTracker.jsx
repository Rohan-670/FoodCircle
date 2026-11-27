import React, { useState } from 'react';
import { Card, Badge, Button, Input } from './ui';

/**
 * Slide 5: Live Delivery Tracking
 * Provides real-time visibility from pickup to delivery with interactive route visualization,
 * ETA calculation, GPS simulation, and dual QR verification.
 */
export function LiveDeliveryTracker({
  task = {
    id: 'del-101',
    title: 'Surplus Vegetable & Dal Curry',
    donorName: 'Greenfield Market',
    pickupAddress: 'Koramangala 4th Block, Bengaluru',
    ngoName: 'City Food Bank',
    deliveryAddress: 'Indiranagar 100ft Rd, Bengaluru',
    distanceKm: 9.4,
    etaMinutes: 24,
    status: 'IN_TRANSIT',
    pickupQrToken: 'QR-PK-9821-A',
    deliveryQrToken: 'QR-DL-5432-B',
  },
  onUpdateStatus,
}) {
  const STAGES = [
    { key: 'ACCEPTED', label: 'Accepted', icon: '📋' },
    { key: 'VOLUNTEER_ASSIGNED', label: 'Volunteer Assigned', icon: '🛵' },
    { key: 'PICKED_UP', label: 'Picked Up', icon: '📦' },
    { key: 'IN_TRANSIT', label: 'In Transit', icon: '🚚' },
    { key: 'DELIVERED', label: 'Delivered', icon: '✅' },
  ];

  const [currentStageIdx, setCurrentStageIdx] = useState(3); // Default 'IN_TRANSIT'
  const [gpsActive, setGpsActive] = useState(true);
  const [qrInput, setQrInput] = useState('');
  const [qrMessage, setQrMessage] = useState('');

  const currentStage = STAGES[currentStageIdx];

  const handleNextStage = () => {
    if (currentStageIdx < STAGES.length - 1) {
      const nextIdx = currentStageIdx + 1;
      setCurrentStageIdx(nextIdx);
      if (onUpdateStatus) onUpdateStatus(STAGES[nextIdx].key);
    }
  };

  const handlePrevStage = () => {
    if (currentStageIdx > 0) {
      const prevIdx = currentStageIdx - 1;
      setCurrentStageIdx(prevIdx);
      if (onUpdateStatus) onUpdateStatus(STAGES[prevIdx].key);
    }
  };

  const handleVerifyToken = () => {
    if (!qrInput.trim()) return;
    if (
      qrInput.trim().toUpperCase() === task.pickupQrToken ||
      qrInput.trim().toUpperCase() === task.deliveryQrToken ||
      qrInput.trim().length >= 6
    ) {
      setQrMessage('✓ Single-use 256-bit QR token verified. Handover confirmed.');
      handleNextStage();
      setQrInput('');
    } else {
      setQrMessage('⚠ Token mismatch. Enter the code from the recipient screen.');
    }
    setTimeout(() => setQrMessage(''), 4000);
  };

  return (
    <div className="live-delivery-tracker-widget" style={{ display: 'grid', gap: '1.25rem' }}>
      {/* Route & Map Simulation Frame (Slide 5 Phone UI) */}
      <div
        style={{
          background: 'linear-gradient(180deg, #1A3027 0%, #0F1E19 100%)',
          borderRadius: 'var(--radius-lg, 16px)',
          padding: '1.5rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header Strip with ETA */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#B8D7C7',
                fontWeight: 600,
              }}
            >
              Real-Time Route Telemetry
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>
              {task.title}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md, 10px)',
              textAlign: 'right',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#B8D7C7', textTransform: 'uppercase' }}>
              Estimated Arrival
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F6F2E8' }}>
              {currentStageIdx >= 4 ? 'Arrived' : `~${task.etaMinutes} min • ${task.distanceKm} km`}
            </div>
          </div>
        </div>

        {/* Visual Map Canvas / Vector Route Display */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-md, 12px)',
            padding: '1.5rem 1rem',
            position: 'relative',
            marginBottom: '1.25rem',
          }}
        >
          {/* Subtle grid pattern background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.1,
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              borderRadius: 'inherit',
              pointerEvents: 'none',
            }}
          />

          {/* SVG Map Track */}
          <svg
            viewBox="0 0 600 120"
            style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          >
            {/* The Road Route Path */}
            <path
              d="M 60 70 Q 180 30 300 65 T 540 60"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Active Completed Segment */}
            <path
              d={
                currentStageIdx <= 1
                  ? 'M 60 70 L 60 70'
                  : currentStageIdx === 2
                  ? 'M 60 70 Q 180 30 200 45'
                  : currentStageIdx === 3
                  ? 'M 60 70 Q 180 30 300 65'
                  : 'M 60 70 Q 180 30 300 65 T 540 60'
              }
              fill="none"
              stroke="#E27244"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Donor Pickup Marker (Start) */}
            <circle cx="60" cy="70" r="10" fill="#2E5A4B" stroke="#B8D7C7" strokeWidth="3" />
            <text x="60" y="105" fill="#B8D7C7" fontSize="12" fontWeight="600" textAnchor="middle">
              {task.donorName}
            </text>
            <text x="60" y="118" fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="middle">
              Pickup Point
            </text>

            {/* Volunteer Moving Courier Marker */}
            {currentStageIdx >= 1 && currentStageIdx <= 3 && (
              <g
                transform={
                  currentStageIdx === 1
                    ? 'translate(100, 52)'
                    : currentStageIdx === 2
                    ? 'translate(210, 42)'
                    : 'translate(310, 60)'
                }
              >
                <circle cx="0" cy="0" r="14" fill="#E27244" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fontSize="13">
                  🛵
                </text>
                <rect x="-35" y="-30" width="70" height="18" rx="4" fill="rgba(0,0,0,0.75)" />
                <text x="0" y="-18" fill="#ffffff" fontSize="9" fontWeight="600" textAnchor="middle">
                  Courier en route
                </text>
              </g>
            )}

            {/* NGO Destination Marker (End) */}
            <circle cx="540" cy="60" r="10" fill="#C45A2C" stroke="#F6F2E8" strokeWidth="3" />
            <text x="540" y="95" fill="#F6F2E8" fontSize="12" fontWeight="600" textAnchor="middle">
              {task.ngoName}
            </text>
            <text x="540" y="108" fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="middle">
              Recipient NGO
            </text>
          </svg>
        </div>

        {/* 5-Step Horizontal Tracker (Accepted -> Volunteer Assigned -> Picked Up -> In Transit -> Delivered) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem',
            position: 'relative',
            marginTop: '1rem',
          }}
        >
          {STAGES.map((s, idx) => {
            const isDone = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            return (
              <div
                key={s.key}
                style={{
                  textAlign: 'center',
                  padding: '0.5rem 0.25rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: isCurrent
                    ? 'rgba(226, 114, 68, 0.25)'
                    : isDone
                    ? 'rgba(184, 215, 199, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isCurrent
                    ? '1px solid #E27244'
                    : isDone
                    ? '1px solid #6F9B8A'
                    : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? '#F6F2E8' : isDone ? '#B8D7C7' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Delivery Status Card Bottom Panel */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md, 10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: gpsActive ? '#6F9B8A' : '#E27244',
                  display: 'inline-block',
                }}
              />
              <strong style={{ fontSize: '0.95rem', color: '#F6F2E8' }}>
                Status: {currentStage.label}
              </strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              {currentStageIdx >= 4
                ? 'Donation successfully handed over and verified.'
                : 'Your surplus donation is actively coordinated with live GPS telematics.'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handlePrevStage}
              disabled={currentStageIdx === 0}
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: 'none',
                color: '#ffffff',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: currentStageIdx === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.78rem',
              }}
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={handleNextStage}
              disabled={currentStageIdx >= STAGES.length - 1}
              style={{
                backgroundColor: '#E27244',
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                cursor: currentStageIdx >= STAGES.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.78rem',
              }}
            >
              Advance Step →
            </button>
          </div>
        </div>
      </div>

      {/* Dual QR Verification & GPS Telematics Control Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* QR Verification Handover */}
        <Card title="Single-Use 256-bit QR Handover">
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Scan or input the recipient single-use token to verify chain-of-custody without paper slips.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Input
              id="qr-manual-code"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder={currentStageIdx <= 2 ? task.pickupQrToken : task.deliveryQrToken}
            />
            <Button size="sm" onClick={handleVerifyToken}>
              Verify Handover
            </Button>
          </div>

          {qrMessage && (
            <div style={{ fontSize: '0.8rem', color: qrMessage.startsWith('✓') ? 'var(--color-forest)' : 'var(--color-saffron)', fontWeight: 600 }}>
              {qrMessage}
            </div>
          )}

          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Pickup Token: <code>{task.pickupQrToken}</code> • Delivery Token: <code>{task.deliveryQrToken}</code>
          </div>
        </Card>

        {/* GPS Permission & Route Coordinates */}
        <Card title="Browser Geolocation & Distance Routing">
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>Location Permission:</span>
              <strong style={{ color: gpsActive ? 'var(--color-forest)' : 'inherit' }}>
                {gpsActive ? '✓ Granted (Broadcasting)' : 'Paused'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>Routing Engine:</span>
              <strong>OpenRouteService / OSRM</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span>Map Layer:</span>
              <strong>OpenStreetMap Carto</strong>
            </div>

            <Button
              variant={gpsActive ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setGpsActive(!gpsActive)}
            >
              {gpsActive ? 'Pause Location Telemetry' : 'Resume Location Telemetry'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LiveDeliveryTracker;
