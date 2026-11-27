import React from 'react';

export function StatusCard({ status, data, error, onRefresh }) {
  const isOnline = status === 'online';
  const isLoading = status === 'loading';

  return (
    <div className="health-status-container">
      <div className="health-status-title">
        <div>
          <h3>Backend Connectivity Status</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Live communication check with Express API (<code>/api/health</code>)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            className={`status-indicator ${
              isLoading
                ? 'status-loading'
                : isOnline
                ? 'status-online'
                : 'status-offline'
            }`}
          >
            ● {isLoading ? 'Checking...' : isOnline ? 'Connected' : 'Offline'}
          </span>
          <button
            className="refresh-button"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>
      </div>

      {isOnline && data && (
        <div className="health-details">
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="detail-value" style={{ color: 'var(--primary-color)' }}>
              {data.status.toUpperCase()}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Uptime</span>
            <span className="detail-value">{data.uptime}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Environment</span>
            <span className="detail-value">{data.environment}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Checked</span>
            <span className="detail-value">
              {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {!isOnline && !isLoading && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderRadius: '8px',
            color: '#b91c1c',
            fontSize: '0.9rem',
          }}
        >
          <strong>Cannot reach backend:</strong> {error || 'Ensure backend server is running on port 5000'}
        </div>
      )}
    </div>
  );
}

export default StatusCard;
