import React, { useState, useEffect, useCallback } from 'react';
import * as notificationService from '../services/notificationService';

export function NotificationsPage({ onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState({
    requestAlerts: true,
    deliveryAlerts: true,
    expiryAlerts: true,
    verificationAlerts: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [notifRes, prefRes] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getPreferences(),
      ]);
      setNotifications(notifRes.notifications || []);
      const count = notifRes.unreadCount || 0;
      setUnreadCount(count);
      if (onUnreadChange) onUnreadChange(count);
      if (prefRes.preferences) setPreferences(prefRes.preferences);
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setStatusMsg('All notifications marked as read.');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrefToggle = async (key) => {
    const nextPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(nextPrefs);
    try {
      await notificationService.updatePreferences({ [key]: nextPrefs[key] });
      setStatusMsg('Notification preferences saved.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <section className="profile-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Notifications ({unreadCount} Unread)
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time and persistent alerts for requests, deliveries, expiry warnings, and verification.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="primary-button"
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </button>
        )}
      </section>

      {error && <div className="auth-error">{error}</div>}
      {statusMsg && <div className="auth-success">{statusMsg}</div>}

      {/* Preferences */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Notification Preferences</h3>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {[
            ['requestAlerts', 'Donation Requests & Decisions'],
            ['deliveryAlerts', 'Volunteer & Delivery Updates'],
            ['expiryAlerts', 'Approaching Expiry Warnings'],
            ['verificationAlerts', 'Account Verification Results'],
          ].map(([key, label]) => (
            <label
              key={key}
              style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={Boolean(preferences[key])}
                onChange={() => handlePrefToggle(key)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="card">
          <p>You have no notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.9rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                borderLeft: n.isRead
                  ? '4px solid var(--border-color)'
                  : '4px solid var(--primary-color)',
                backgroundColor: n.isRead ? '#ffffff' : '#f0fdf4',
              }}
            >
              <div className="profile-header" style={{ marginBottom: '0.4rem', paddingBottom: '0.5rem' }}>
                <div>
                  <strong>{n.title}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {n.type} • {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.82rem' }}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.92rem' }}>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
