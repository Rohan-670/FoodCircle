import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import { MOCK_NGO_RECOMMENDATIONS, MOCK_DONATIONS } from '../data/mockData';

export function NgoDashboardPage({ onNavigate }) {
  const [section, setSection] = useState('recommended');

  const sidebarItems = [
    { id: 'recommended', label: 'Recommended Matches', count: 2 },
    { id: 'accepted', label: 'Accepted Donations', count: 1 },
    { id: 'pending', label: 'Pending Requests', count: 1 },
    { id: 'deliveries', label: 'Incoming Deliveries', count: 1 },
  ];

  const metrics = [
    { label: 'Verification Status', value: 'Verified', note: 'Approved by Admin' },
    { label: 'Recommended (Mock)', value: '2', note: 'Weighted match ≥ 75' },
    { label: 'Pending Requests (Mock)', value: '1', note: 'Awaiting donor decision' },
    { label: 'Incoming Transit (Mock)', value: '1', note: 'Volunteer assigned' },
  ];

  return (
    <DashboardLayout
      roleLabel="NGO Partner"
      title="Hope Shelter & Community Kitchen"
      subtitle="Review explainable donation recommendations, manage requests, and track incoming deliveries."
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
      actions={
        <Button variant="secondary" onClick={() => onNavigate('listings')}>
          Browse All Listings
        </Button>
      }
    >
      {section === 'recommended' && (
        <div className="form-stack">
          {MOCK_NGO_RECOMMENDATIONS.map((rec) => (
            <Card
              key={rec.id}
              title={rec.donation.title}
              subtitle={`${rec.donation.donorName} • ${rec.distanceKm} km away`}
              badge={<Badge tone="forest">Match Score: {rec.score}/100</Badge>}
              footer={
                <>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Weights: Distance 30% • Category 20% • Qty 20% • Urgency 15% • Capacity 15%
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onNavigate('details', rec.donation.id)}
                    >
                      Inspect Batch
                    </Button>
                    <Button size="sm" disabled title="Disabled in static UI preview">
                      Request Batch
                    </Button>
                  </div>
                </>
              }
            >
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.3rem' }}>
                {rec.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {section === 'accepted' && (
        <Card
          title="Accepted Donations (Mock Data)"
          badge={<Badge tone="mint">ACCEPTED</Badge>}
        >
          <p style={{ fontSize: '0.92rem' }}>
            <strong>{MOCK_DONATIONS[3].title}</strong> — {MOCK_DONATIONS[3].quantity}{' '}
            {MOCK_DONATIONS[3].unit} from {MOCK_DONATIONS[3].donorName}.
          </p>
        </Card>
      )}

      {section === 'pending' && (
        <Card
          title="Pending Requests (Mock Data)"
          badge={<Badge tone="sage">PENDING</Badge>}
        >
          <p style={{ fontSize: '0.92rem' }}>
            <strong>{MOCK_DONATIONS[1].title}</strong> — Submitted 35 minutes ago; awaiting
            donor approval.
          </p>
        </Card>
      )}

      {section === 'deliveries' && (
        <Card
          title="Incoming Delivery & QR Handoff (Mock Data)"
          badge={<Badge tone="terracotta">VOLUNTEER_ASSIGNED</Badge>}
        >
          <p style={{ fontSize: '0.92rem', marginBottom: '0.75rem' }}>
            Volunteer courier is en route to pickup. Single-use delivery QR token will be
            verified upon arrival at Hope Shelter Lane.
          </p>
          <div className="info-strip">
            ETA: ~11 mins (OSRM route preview • Mock data)
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default NgoDashboardPage;
