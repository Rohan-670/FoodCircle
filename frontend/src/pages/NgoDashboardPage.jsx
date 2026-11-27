import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import { MOCK_NGO_RECOMMENDATIONS } from '../data/mockData';
import {
  getStoredDonations,
  addStoredRequest,
  getStoredRequests,
  updateStoredDonationStatus,
} from '../data/store';

export function NgoDashboardPage({ onNavigate }) {
  const [section, setSection] = useState('recommended');
  const [recommendations, setRecommendations] = useState(MOCK_NGO_RECOMMENDATIONS);
  const [myRequests, setMyRequests] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setMyRequests(getStoredRequests());
  }, []);

  const handleRequestBatch = (rec) => {
    const newReq = {
      id: `req-${Date.now()}`,
      batch: rec.donation.title,
      ngoName: 'Mercy Community Kitchen & Shelter',
      servings: rec.donation.quantity,
      sla: `~${rec.donation.slaMinutes || 30} mins`,
      status: 'PENDING',
    };

    const updatedRequests = addStoredRequest(newReq);
    setMyRequests(updatedRequests);
    updateStoredDonationStatus(rec.donation.id, 'REQUESTED');

    setFeedback(`Allocation request submitted for "${rec.donation.title}". Waiting for kitchen confirmation.`);
    setTimeout(() => setFeedback(''), 4500);
  };

  const sidebarItems = [
    { id: 'recommended', label: 'Matched Batches', count: recommendations.length },
    { id: 'accepted', label: 'My Requests', count: myRequests.length },
    { id: 'deliveries', label: 'Incoming Deliveries', count: 1 },
  ];

  const metrics = [
    { label: 'NGO Status', value: 'Verified', note: 'Central Ward Facility' },
    { label: 'Storage Buffer', value: '1,400 kg', note: 'Available capacity' },
    { label: 'Matched Batches', value: String(recommendations.length), note: 'Score ≥ 75/100' },
    { label: 'Daily Target', value: '650 meals', note: 'Shelter community' },
  ];

  return (
    <DashboardLayout
      roleLabel="NGO"
      title="Mercy Community Kitchen &amp; Shelter"
      subtitle="Review algorithmic donation recommendations and manage active allocations."
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
      actions={
        <Button variant="secondary" onClick={() => onNavigate('listings')}>
          Surplus Catalog
        </Button>
      }
    >
      {feedback && (
        <div style={{ backgroundColor: 'var(--color-mint)', border: '1px solid var(--color-mint-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--color-forest)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {section === 'recommended' && (
        <div className="form-stack">
          {recommendations.map((rec) => {
            const hasRequested = myRequests.some((r) => r.batch === rec.donation.title);
            return (
              <Card
                key={rec.id}
                title={rec.donation.title}
                subtitle={`${rec.donation.donorName} • ${rec.distanceKm} km away`}
                badge={<Badge tone="forest">Match: {rec.score}/100</Badge>}
                footer={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Weights: Distance 30% • Category 20% • Qty 20% • Urgency 15% • Capacity 15%
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onNavigate('details', rec.donation.id)}
                      >
                        Inspect Details
                      </Button>
                      <Button
                        size="sm"
                        disabled={hasRequested}
                        onClick={() => handleRequestBatch(rec)}
                      >
                        {hasRequested ? '✓ Request Submitted' : 'Request Allocation'}
                      </Button>
                    </div>
                  </div>
                }
              >
                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', backgroundColor: 'var(--bg-muted)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                    <div>Distance: <strong>{rec.breakdown.distance}%</strong></div>
                    <div>Category: <strong>{rec.breakdown.category}%</strong></div>
                    <div>Quantity: <strong>{rec.breakdown.quantity}%</strong></div>
                    <div>Urgency: <strong>{rec.breakdown.urgency}%</strong></div>
                    <div>Capacity: <strong>{rec.breakdown.capacity}%</strong></div>
                  </div>

                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.25rem' }}>
                    {rec.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {section === 'accepted' && (
        <Card title="My Allocation Requests" subtitle="Track your requested and accepted food batches.">
          {myRequests.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No active requests.</p>
          ) : (
            <div className="table-wrap">
              <table className="editorial-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Servings</th>
                    <th>Estimated Arrival</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.batch}</strong></td>
                      <td>{r.servings}</td>
                      <td>{r.sla}</td>
                      <td>
                        <Badge tone={r.status === 'ACCEPTED' ? 'forest' : 'mint'}>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {section === 'deliveries' && (
        <Card title="Live Inbound Delivery" badge={<Badge tone="terracotta">In Transit</Badge>}>
          <div style={{ fontSize: '0.88rem', display: 'grid', gap: '0.65rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Courier Charlie Verma is currently en route with thermal food carriers.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('volunteer-dashboard')}
              >
                View Courier Board →
              </Button>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                ● ETA: 11 minutes
              </span>
            </div>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default NgoDashboardPage;
