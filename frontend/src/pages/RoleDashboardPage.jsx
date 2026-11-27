import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as dashboardService from '../services/dashboardService';

export function RoleDashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');

    const loader =
      user.role === 'DONOR'
        ? dashboardService.getDonorDashboard
        : user.role === 'NGO'
        ? dashboardService.getNgoDashboard
        : dashboardService.getVolunteerDashboard;

    loader()
      .then((res) => setDashboard(res.dashboard))
      .catch((err) => setError(err.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p>Loading your dashboard...</p>;
  if (error) return <div className="auth-error">{error}</div>;
  if (!dashboard) return null;

  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          {user.role} Overview Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Real-time summary of your permitted activities and active records.
        </p>
      </section>

      {user.role === 'DONOR' && (
        <>
          <div className="grid-cards">
            <div className="card">
              <div className="detail-label">Active Donations</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.activeCount}
              </div>
            </div>
            <div className="card">
              <div className="detail-label">Accepted / In Progress</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.acceptedCount}
              </div>
            </div>
            <div className="card">
              <div className="detail-label">Completed Donations</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.completedCount}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="profile-header">
              <h3>Recent Activity</h3>
              <button
                type="button"
                className="primary-button"
                onClick={() => onNavigate('donor-dashboard')}
              >
                Manage Donations
              </button>
            </div>
            {dashboard.recentActivity.length === 0 ? (
              <p>No recent activity recorded yet.</p>
            ) : (
              dashboard.recentActivity.map((act) => (
                <div key={act.id} className="profile-info-box">
                  <strong>{act.title}</strong> — {act.message}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {user.role === 'NGO' && (
        <>
          <div className="grid-cards">
            <div className="card">
              <div className="detail-label">Recommended Donations</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.recommendedCount}
              </div>
            </div>
            <div className="card">
              <div className="detail-label">Accepted Donations</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.acceptedCount}
              </div>
            </div>
            <div className="card">
              <div className="detail-label">Pending Requests</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.pendingRequestsCount}
              </div>
            </div>
            <div className="card">
              <div className="detail-label">Incoming Deliveries</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.incomingDeliveriesCount}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="profile-header">
              <h3>Top Recommended Donations</h3>
              <button
                type="button"
                className="primary-button"
                onClick={() => onNavigate('ngo-browse')}
              >
                Browse All Donations
              </button>
            </div>
            {dashboard.recommendedDonations.length === 0 ? (
              <p>No recommended donations available right now.</p>
            ) : (
              dashboard.recommendedDonations.map((rec) => (
                <div key={rec.donation.id} className="profile-info-box">
                  <strong>{rec.donation.title}</strong> ({rec.donation.quantity}{' '}
                  {rec.donation.unit}) — Match Score: {rec.totalScore}/100
                </div>
              ))
            )}
          </div>
        </>
      )}

      {user.role === 'VOLUNTEER' && (
        <>
          <div className="grid-cards">
            <div className="card">
              <div className="detail-label">Available Tasks</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.availableCount}
              </div>
            </div>
            <div className="card">
              <div className="detail-label">Assigned Tasks</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.assignedCount}
              </div>
            </div>
            <div className="card">
              <div className="detail-label">Completed Deliveries</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {dashboard.summary.completedCount}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="profile-header">
              <h3>Delivery History ({dashboard.summary.totalHistoryCount})</h3>
              <button
                type="button"
                className="primary-button"
                onClick={() => onNavigate('deliveries')}
              >
                Open Delivery Tracker
              </button>
            </div>
            {dashboard.deliveryHistory.length === 0 ? (
              <p>You have not accepted any delivery tasks yet.</p>
            ) : (
              dashboard.deliveryHistory.map((del) => (
                <div key={del.id} className="profile-info-box">
                  <strong>{del.donation?.title || 'Delivery'}</strong> — Status:{' '}
                  {del.status} | Pickup: {del.pickupAddress}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RoleDashboardPage;
