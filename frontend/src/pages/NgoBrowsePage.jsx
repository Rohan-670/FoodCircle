import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as donationService from '../services/donationService';

export function NgoBrowsePage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [requestNotes, setRequestNotes] = useState({});
  const [requestingId, setRequestingId] = useState(null);

  const [filters, setFilters] = useState({
    foodCategory: '',
    minQuantity: '',
    location: '',
    urgency: 'ALL',
  });

  const loadDonations = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await donationService.browseDonations(activeFilters);
      setDonations(data.donations || []);
    } catch (err) {
      setError(err.message || 'Failed to load available donations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations(filters);
  }, [loadDonations]); // initial load

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadDonations(filters);
  };

  const handleResetFilters = () => {
    const cleared = {
      foodCategory: '',
      minQuantity: '',
      location: '',
      urgency: 'ALL',
    };
    setFilters(cleared);
    loadDonations(cleared);
  };

  const handleRequestDonation = async (donationId) => {
    setError('');
    setSuccessMsg('');
    setRequestingId(donationId);
    try {
      await donationService.requestDonation(donationId, {
        notes: requestNotes[donationId] || undefined,
      });
      setSuccessMsg('Donation request submitted! Awaiting donor approval.');
      await loadDonations(filters);
    } catch (err) {
      setError(err.message || 'Failed to submit donation request.');
    } finally {
      setRequestingId(null);
    }
  };

  const myNgoId = user?.ngoProfile?.id;

  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Browse Available Surplus Food
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Filter active donations by category, quantity, location, and expiry urgency.
        </p>
      </section>

      {/* Filter Bar */}
      <form
        onSubmit={handleApplyFilters}
        className="card"
        style={{ marginBottom: '2rem' }}
      >
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="filter-category">Food Category</label>
            <input
              id="filter-category"
              name="foodCategory"
              type="text"
              value={filters.foodCategory}
              onChange={handleFilterChange}
              placeholder="e.g. Cooked Meals"
            />
          </div>

          <div className="form-group">
            <label htmlFor="filter-qty">Minimum Quantity</label>
            <input
              id="filter-qty"
              name="minQuantity"
              type="number"
              min="1"
              value={filters.minQuantity}
              onChange={handleFilterChange}
              placeholder="e.g. 20"
            />
          </div>

          <div className="form-group">
            <label htmlFor="filter-location">Location / Address</label>
            <input
              id="filter-location"
              name="location"
              type="text"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Search street or district"
            />
          </div>

          <div className="form-group">
            <label htmlFor="filter-urgency">Urgency</label>
            <select
              id="filter-urgency"
              name="urgency"
              value={filters.urgency}
              onChange={handleFilterChange}
            >
              <option value="ALL">All Deadlines</option>
              <option value="CRITICAL">Critical (Expires within 4 hours)</option>
              <option value="HIGH">High (Expires within 12 hours)</option>
              <option value="MEDIUM">Medium (Expires within 24 hours)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="primary-button">
            Apply Filters
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </div>
      </form>

      {error && <div className="auth-error">{error}</div>}
      {successMsg && <div className="auth-success">{successMsg}</div>}

      {loading ? (
        <p>Loading available donations...</p>
      ) : donations.length === 0 ? (
        <div className="card">
          <p>No available donations match your current filters.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {donations.map((donation) => {
            const alreadyRequested = donation.requests?.some(
              (r) => r.ngoId === myNgoId
            );
            const hoursLeft = Math.max(
              0,
              Math.round(
                (new Date(donation.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
              )
            );

            return (
              <div key={donation.id} className="card">
                <div className="profile-header" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                      {donation.title}
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      By {donation.donor?.organizationName} ({donation.donor?.businessType})
                    </span>
                  </div>
                  <span className="header-badge">{donation.status}</span>
                </div>

                {donation.imageUrl && (
                  <img
                    src={donation.imageUrl}
                    alt={donation.title}
                    style={{
                      width: '100%',
                      maxHeight: '160px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '0.75rem',
                    }}
                  />
                )}

                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Category:</strong> {donation.foodCategory} •{' '}
                  <strong>Quantity:</strong> {donation.quantity} {donation.unit}
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <strong>Pickup:</strong> {donation.pickupAddress}
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <strong>Expires:</strong>{' '}
                  {new Date(donation.expiresAt).toLocaleString()} (~{hoursLeft}h left)
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <strong>Storage:</strong> {donation.storageRequirements || 'N/A'} |{' '}
                  <strong>Packaging:</strong> {donation.packagingInfo || 'N/A'}
                  {donation.allergenInfo ? ` | Allergens: ${donation.allergenInfo}` : ''}
                </p>

                {user?.role === 'NGO' && (
                  <div style={{ marginTop: '1rem' }}>
                    {alreadyRequested ? (
                      <div className="status-indicator status-online">
                        ✓ Request Submitted
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Optional pickup notes for donor"
                          value={requestNotes[donation.id] || ''}
                          onChange={(e) =>
                            setRequestNotes((prev) => ({
                              ...prev,
                              [donation.id]: e.target.value,
                            }))
                          }
                          style={{
                            padding: '0.5rem 0.7rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.88rem',
                          }}
                        />
                        <button
                          type="button"
                          className="primary-button"
                          disabled={requestingId === donation.id}
                          onClick={() => handleRequestDonation(donation.id)}
                        >
                          {requestingId === donation.id
                            ? 'Requesting...'
                            : 'Request Donation'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NgoBrowsePage;
