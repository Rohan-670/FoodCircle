import React, { useState, useEffect } from 'react';
import * as dashboardService from '../services/dashboardService';

export function ImpactAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    dashboardService
      .getImpactAnalytics()
      .then((res) => setAnalytics(res.analytics))
      .catch((err) => setError(err.message || 'Failed to load impact analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading impact analytics...</p>;
  if (error) return <div className="auth-error">{error}</div>;
  if (!analytics) return null;

  const maxCategoryQty = Math.max(
    1,
    ...(analytics.categoryBreakdown || []).map((c) => c.totalQuantity)
  );

  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Platform Impact Analytics
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Aggregated directly from verified database records (no estimated or fabricated metrics).
        </p>
      </section>

      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="detail-label">Total Food Donated</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)' }}>
            {analytics.totalFoodDonated}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Total units pledged (excluding cancelled)
          </div>
        </div>

        <div className="card">
          <div className="detail-label">Total Food Delivered</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary-color)' }}>
            {analytics.totalFoodDelivered}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Units confirmed delivered to NGOs
          </div>
        </div>

        <div className="card">
          <div className="detail-label">Completed Donations</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {analytics.completedDonationsCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Successful end-to-end distributions
          </div>
        </div>

        <div className="card">
          <div className="detail-label">Participating NGOs</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {analytics.participatingNgosCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Verified &amp; active NGO partners
          </div>
        </div>

        <div className="card">
          <div className="detail-label">Active Volunteers</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {analytics.activeVolunteersCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Available &amp; active delivery volunteers
          </div>
        </div>
      </div>

      {/* Category Distribution Bar Chart */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Food Donated by Category</h3>
        {!analytics.categoryBreakdown || analytics.categoryBreakdown.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            No donation records exist yet. Metrics will appear automatically once donations are posted.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {analytics.categoryBreakdown.map((item) => {
              const widthPct = Math.round((item.totalQuantity / maxCategoryQty) * 100);
              return (
                <div key={item.category}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.9rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <strong>{item.category}</strong>
                    <span>
                      {item.totalQuantity} units ({item.donationCount} batches)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '12px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${widthPct}%`,
                        height: '100%',
                        backgroundColor: 'var(--primary-color)',
                        borderRadius: '9999px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImpactAnalyticsPage;
