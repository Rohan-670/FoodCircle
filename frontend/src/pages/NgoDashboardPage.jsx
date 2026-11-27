import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import { MOCK_NGO_RECOMMENDATIONS } from '../data/mockData';

export function NgoDashboardPage({ onNavigate }) {
  const [section, setSection] = useState('recommended');
  const [recommendations, setRecommendations] = useState(MOCK_NGO_RECOMMENDATIONS);
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [feedback, setFeedback] = useState('');

  const handleRequestBatch = (recId, title) => {
    const next = new Set(requestedIds);
    next.add(recId);
    setRequestedIds(next);
    setFeedback(`Allocation request submitted for "${title}"!`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const sidebarItems = [
    { id: 'recommended', label: 'Matched Batches', count: recommendations.length },
    { id: 'accepted', label: 'Accepted Batches', count: 1 + requestedIds.size },
    { id: 'deliveries', label: 'Incoming Deliveries', count: 1 },
  ];

  const metrics = [
    { label: 'NGO Status', value: 'Verified', note: 'Central Ward Hub' },
    { label: 'Storage Buffer', value: '1,400 kg', note: 'Available capacity' },
    { label: 'Suitable Matches', value: String(recommendations.length), note: 'Score ≥ 75/100' },
    { label: 'Daily Goal', value: '650 meals', note: 'Shelter targets' },
  ];

  return (
    <DashboardLayout
      roleLabel="NGO"
      title="Mercy Community Kitchen"
      subtitle="Review algorithmic donation recommendations and manage incoming deliveries."
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
            const isRequested = requestedIds.has(rec.id);
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
                        disabled={isRequested}
                        onClick={() => handleRequestBatch(rec.id, rec.donation.title)}
                      >
                        {isRequested ? '✓ Request Sent' : 'Request Batch'}
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
        <Card title="Accepted Batches" badge={<Badge tone="mint">Ready for Pickup</Badge>}>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.88rem' }}>
            <div className="info-strip">
              <strong>Packaged UHT Milk &amp; Yogurt Cups (80 packs)</strong> — Metro Cold Chain Express
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Assigned to Volunteer Charlie Verma • Arriving in ~11 mins
              </div>
            </div>
            {Array.from(requestedIds).map((id) => (
              <div key={id} className="info-strip" style={{ borderLeft: '3px solid var(--color-forest)' }}>
                <strong>Allocation request pending donor confirmation</strong>
              </div>
            ))}
          </div>
        </Card>
      )}

      {section === 'deliveries' && (
        <Card title="Live Delivery Status" badge={<Badge tone="terracotta">In Transit</Badge>}>
          <div style={{ fontSize: '0.88rem', display: 'grid', gap: '0.65rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Courier Charlie Verma is en route with thermal carriers.
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
