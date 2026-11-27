import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import { MOCK_NGO_RECOMMENDATIONS, MOCK_DONATIONS } from '../data/mockData';

export function NgoDashboardPage({ onNavigate }) {
  const [section, setSection] = useState('recommended');

  const sidebarItems = [
    { id: 'recommended', label: 'Algorithmic Matches', count: 2 },
    { id: 'accepted', label: 'Accepted Batches', count: 1 },
    { id: 'pending', label: 'Pending Requests', count: 1 },
    { id: 'deliveries', label: 'Incoming Transit', count: 1 },
  ];

  const metrics = [
    { label: 'NITI Aayog DARPAN', value: 'KA/2021/0149921', note: 'Tier 5 Verified Partner' },
    { label: 'Cold-Chain Buffer', value: '1,400 kg', note: '≤4°C Insulated Units' },
    { label: 'Suitable Matches', value: '2 Batches', note: 'Score ≥ 75/100' },
    { label: 'Daily Serving Target', value: '650 meals', note: 'Central Ward Shelters' },
  ];

  return (
    <DashboardLayout
      roleLabel="Verified NGO Partner"
      title="Mercy Community Kitchen &amp; Shelter"
      subtitle="DARPAN ID: KA/2021/0149921 • Central Ward Distribution Center"
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
      actions={
        <Button variant="secondary" onClick={() => onNavigate('listings')}>
          Browse Surplus Catalog
        </Button>
      }
    >
      {/* Statutory Guidance Banner */}
      <div className="statutory-shield-box" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.15rem' }}>
        <strong style={{ color: 'var(--color-forest)' }}>Transparent Heuristic Matching:</strong>{' '}
        <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Suitability scores are calculated using a configurable weighted formula (Distance 30%, Category 20%, Quantity 20%, Urgency 15%, Capacity 15%). Recommendations require explicit NGO acceptance; batches are never claimed automatically.
        </span>
      </div>

      {section === 'recommended' && (
        <div className="form-stack">
          {MOCK_NGO_RECOMMENDATIONS.map((rec) => (
            <Card
              key={rec.id}
              title={rec.donation.title}
              subtitle={`${rec.donation.donorName} • ${rec.distanceKm} km away • FSSAI: ${rec.donation.fssaiLicense}`}
              badge={<Badge tone="forest">Suitability Score: {rec.score}/100</Badge>}
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
                      Inspect Batch Details
                    </Button>
                    <Button size="sm" disabled title="Disabled in static UI preview">
                      Claim Allocation (Preview)
                    </Button>
                  </div>
                </div>
              }
            >
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', backgroundColor: 'var(--bg-muted)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  <div>Distance: <strong>{rec.breakdown.distance}%</strong></div>
                  <div>Category: <strong>{rec.breakdown.category}%</strong></div>
                  <div>Quantity: <strong>{rec.breakdown.quantity}%</strong></div>
                  <div>Urgency: <strong>{rec.breakdown.urgency}%</strong></div>
                  <div>Capacity: <strong>{rec.breakdown.capacity}%</strong></div>
                </div>

                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.35rem' }}>
                  {rec.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}

      {section === 'accepted' && (
        <Card
          title="Accepted Food Batches (Mock Data)"
          badge={<Badge tone="mint">ACCEPTED</Badge>}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Packaged UHT Toned Milk &amp; Yogurt Cups (80 packs) accepted from Metro Cold Chain Express.
          </p>
          <div className="info-strip">
            <strong>Logistics Notice:</strong> A volunteer courier has been requested. Handoff confirmation will occur via single-use delivery QR token upon arrival.
          </div>
        </Card>
      )}

      {section === 'pending' && (
        <Card
          title="Pending Allocation Requests (Mock Data)"
          badge={<Badge tone="sage">1 REQUEST</Badge>}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Request submitted for <strong>Vegetable Pulao &amp; Lentil Curry</strong> (65 servings). Awaiting donor confirmation.
          </p>
        </Card>
      )}

      {section === 'deliveries' && (
        <Card
          title="Incoming Delivery Tracker (Mock Data)"
          badge={<Badge tone="terracotta">IN TRANSIT</Badge>}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Volunteer Courier Charlie Verma is en route with insulated thermal containers. Estimated delivery in 11 minutes.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('volunteer-dashboard')}
          >
            Inspect Courier Dispatch Board →
          </Button>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default NgoDashboardPage;
