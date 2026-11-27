import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function ProfilePage({ onNavigate }) {
  const { user, logout, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');

      if (user.donorProfile) {
        setAddress(user.donorProfile.address || '');
      } else if (user.ngoProfile) {
        setAddress(user.ngoProfile.address || '');
        setServiceArea(user.ngoProfile.serviceArea || '');
      } else if (user.volunteerProfile) {
        setAddress(user.volunteerProfile.address || '');
        setServiceArea(user.volunteerProfile.serviceArea || '');
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Authentication Required</h2>
          <p className="auth-subtitle">Please sign in to view your profile.</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => onNavigate('login')}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    setSaving(true);

    try {
      const payload = { fullName, phone };
      if (user.role === 'DONOR') {
        payload.address = address;
      } else if (user.role === 'NGO' || user.role === 'VOLUNTEER') {
        if (address) payload.address = address;
        if (serviceArea) payload.serviceArea = serviceArea;
      }

      await updateProfile(payload);
      setStatusMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <div className="profile-header">
          <div>
            <h2>{user.fullName}</h2>
            <p className="auth-subtitle" style={{ marginBottom: 0 }}>
              {user.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="header-badge">{user.role}</span>
            <span
              className={`status-indicator ${
                user.isActive ? 'status-online' : 'status-offline'
              }`}
            >
              {user.isActive ? 'Active' : 'Deactivated'}
            </span>
          </div>
        </div>

        {user.role === 'NGO' && user.ngoProfile && (
          <div className="profile-info-box">
            <strong>Organization:</strong> {user.ngoProfile.organizationName} |{' '}
            <strong>Verification:</strong>{' '}
            {user.ngoProfile.isVerified ? 'Verified ✓' : 'Pending Admin Verification'}
          </div>
        )}

        {user.role === 'DONOR' && user.donorProfile && (
          <div className="profile-info-box">
            <strong>Business:</strong> {user.donorProfile.organizationName} (
            {user.donorProfile.businessType})
          </div>
        )}

        {user.role === 'VOLUNTEER' && user.volunteerProfile && (
          <div className="profile-info-box">
            <strong>Availability:</strong>{' '}
            {user.volunteerProfile.isAvailable ? 'Available' : 'Unavailable'}{' '}
            {user.volunteerProfile.vehicleType &&
              `| Vehicle: ${user.volunteerProfile.vehicleType}`}
          </div>
        )}

        {statusMessage && <div className="auth-success">{statusMessage}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSave} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-phone">Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {user.role !== 'ADMIN' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profile-address">Address</label>
                <input
                  id="profile-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {(user.role === 'NGO' || user.role === 'VOLUNTEER') && (
                <div className="form-group">
                  <label htmlFor="profile-service-area">Service Area</label>
                  <input
                    id="profile-service-area"
                    type="text"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
