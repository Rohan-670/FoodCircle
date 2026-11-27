import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as donationService from '../services/donationService';
import * as matchingService from '../services/matchingService';

export function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [donorDonations, setDonorDonations] = useState([]);
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [filters, setFilters] = useState({
    minScore: '',
    maxDistanceKm: '',
    urgency: 'ALL',
  });

  const loadDonorDonations = useCallback(async () => {
    const data = await donationService.getDonorDonations();
    const active = (data.donations || []).filter((d) =>
      ['AVAILABLE', 'REQUESTED'].includes(d.status)
    );
    setDonorDonations(active);
    if (active.length > 0 && !selectedDonationId) {
      setSelectedDonationId(active[0].id);
    }
    return active;
  }, [selectedDonationId]);

  const loadRecommendations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      if (user.role === 'NGO') {
        const data = await matchingService.getRecommendedDonationsForNgo(filters);
        setRecommendations(data.recommendations || []);
        if (data.notice) setError(data.notice);
      } else if (user.role === 'DONOR') {
        let targetId = selectedDonationId;
        if (!targetId) {
          const active = await loadDonorDonations();
          targetId = active[0]?.id || '';
        }
        if (targetId) {
          const data = await matchingService.getRecommendedNgosForDonation(
            targetId,
            filters
          );
          setRecommendations(data.recommendations || []);
        } else {
          setRecommendations([]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedDonationId, filters, loadDonorDonations]);

  useEffect(() => {
    if (user?.role === 'DONOR') {
      loadDonorDonations();
    }
  }, [user, loadDonorDonations]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleAction = async (donationId, ngoId, action) => {
    setError('');
    setStatusMsg('');
    try {
      const result = await matchingService.sendRecommendationAction({
        donationId,
        ngoId,
        action,
      });
      if (action === 'IGNORE') {
        setStatusMsg('Recommendation ignored.');
      } else if (result.resultType === 'REQUEST_CREATED') {
        setStatusMsg('Donation request submitted to donor.');
      } else if (result.resultType === 'INVITE_SENT') {
        setStatusMsg('Invitation notification sent to the NGO.');
      } else {
        setStatusMsg('Recommendation action recorded.');
      }
      await loadRecommendations();
    } catch (err) {
      setError(err.message || 'Failed to record recommendation action.');
    }
  };

  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          {user?.role === 'DONOR'
            ? 'Recommended NGOs for Your Donations'
            : 'Recommended Surplus Food Donations'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Transparent suitability scoring based on distance (30%), food category (20%),
          quantity (20%), urgency (15%), and NGO capacity (15%). Scores are advisory only
          and never auto-accept a donation.
        </p>
      </section>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="form-row">
          {user?.role === 'DONOR' && (
            <div className="form-group">
              <label htmlFor="rec-donation-select">Select Active Donation</label>
              <select
                id="rec-donation-select"
                value={selectedDonationId}
                onChange={(e) => setSelectedDonationId(e.target.value)}
              >
                {donorDonations.length === 0 && (
                  <option value="">No active donations</option>
                )}
                {donorDonations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.quantity} {d.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="rec-min-score">Minimum Score (0–100)</label>
            <input
              id="rec-min-score"
              type="number"
              min="0"
              max="100"
              value={filters.minScore}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, minScore: e.target.value }))
              }
              placeholder="e.g. 60"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rec-max-dist">Max Distance (km)</label>
            <input
              id="rec-max-dist"
              type="number"
              min="1"
              value={filters.maxDistanceKm}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxDistanceKm: e.target.value }))
              }
              placeholder="e.g. 25"
            />
          </div>

          {user?.role === 'NGO' && (
            <div className="form-group">
              <label htmlFor="rec-urgency">Urgency</label>
              <select
                id="rec-urgency"
                value={filters.urgency}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, urgency: e.target.value }))
                }
              >
                <option value="ALL">All Urgencies</option>
                <option value="CRITICAL">Critical (≤ 4h)</option>
                <option value="HIGH">High (≤ 12h)</option>
                <option value="MEDIUM">Medium (≤ 24h)</option>
                <option value="LOW">Low (&gt; 24h)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}
      {statusMsg && <div className="auth-success">{statusMsg}</div>}

      {loading ? (
        <p>Calculating recommendations...</p>
      ) : recommendations.length === 0 ? (
        <div className="card">
          <p>No matching recommendations found for your current filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {recommendations.map((rec) => {
            const key = `${rec.donationId || rec.donation?.id}-${rec.ngoId || rec.ngo?.id}`;
            const donationId = rec.donationId || rec.donation?.id;
            const ngoId = rec.ngoId || rec.ngo?.id;

            return (
              <div key={key} className="card">
                <div className="profile-header" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      {user?.role === 'DONOR'
                        ? rec.ngo.organizationName
                        : rec.donation.title}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {user?.role === 'DONOR'
                        ? `Service Area: ${rec.ngo.serviceArea}`
                        : `Donor: ${rec.donation.donor?.organizationName} • ${rec.donation.quantity} ${rec.donation.unit}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="header-badge">
                      Score: {rec.totalScore}/100
                    </span>
                    <span className="status-indicator status-loading">
                      Urgency: {rec.urgency.level} ({rec.urgency.hoursRemaining}h)
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Distance:</strong>{' '}
                  {rec.distanceKm !== null ? `${rec.distanceKm} km` : 'Coordinates unavailable'}
                </p>

                <div className="profile-info-box" style={{ marginBottom: '0.75rem' }}>
                  <strong>Score Breakdown:</strong> Distance {rec.breakdown.distance}% •
                  Category {rec.breakdown.foodCategory}% • Quantity {rec.breakdown.quantity}% •
                  Urgency {rec.breakdown.urgency}% • Capacity {rec.breakdown.capacity}%
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.88rem' }}>Why this was recommended:</strong>
                  <ul className="card-role-list" style={{ marginTop: '0.35rem' }}>
                    {rec.reasons.map((reason, idx) => (
                      <li key={idx} className="card-role-item">
                        <span className="card-role-bullet">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => handleAction(donationId, ngoId, 'ACCEPT')}
                  >
                    {user?.role === 'DONOR'
                      ? 'Invite NGO'
                      : 'Request Recommended Donation'}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleAction(donationId, ngoId, 'IGNORE')}
                  >
                    Ignore
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecommendationsPage;
