import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import { MOCK_DONATIONS } from '../data/mockData';

export function DonorDashboardPage({ onNavigate }) {
  const [section, setSection] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Active & Accepted', count: 3 },
    { id: 'requests', label: 'Incoming NGO Requests', count: 2 },
    { id: 'safety', label: 'FSSAI Safety Checklist' },
    { id: 'history', label: 'Completed Deliveries', count: 14 },
  ];

  const metrics = [
    { label: 'FSSAI Registration', value: 'Verified', note: 'FSSAI-11223344009182' },
    { label: 'Active Surplus Batches', value: '2', note: 'Within safe consumption window' },
    { label: 'Accepted by NGOs', value: '1', note: 'Awaiting volunteer pickup' },
    { label: 'Meals Rescued (Total)', value: '820', note: 'Good Samaritan compliant' },
  ];

  return (
    <DashboardLayout
      roleLabel="Surplus Food Donor"
      title="Saffron Courtyard Banquets"
      subtitle="FSSAI License: FSSAI-11223344009182 • Tier 5 Verified Commercial Kitchen"
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
      actions={
        <Button
          variant="secondary"
          disabled
          title="Backend creation is disabled in static UI preview"
        >
          + Post New Surplus Batch
        </Button>
      }
    >
      {/* Statutory Guidance Banner */}
      <div className="statutory-shield-box" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.15rem' }}>
        <strong style={{ color: 'var(--color-forest)' }}>Good Samaritan Statutory Shield:</strong>{' '}
        <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Donations made in good faith conforming to FSSAI Schedule I safety requirements are immune from liability. Ensure hot batches remain above 60°C or cold batches below 7°C.
        </span>
      </div>

      {section === 'overview' && (
        <Card
          title="Active Surplus Batches (Live Tracking)"
          subtitle="Click any batch to inspect FSSAI safety checklist and single-use QR handoff."
        >
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Food Batch</th>
                  <th>Dietary / Volume</th>
                  <th>Holding Temp</th>
                  <th>Expiry Window</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DONATIONS.slice(0, 3).map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {d.category}
                      </div>
                    </td>
                    <td>
                      <div><strong>{d.quantity} {d.unit}</strong></div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-forest)' }}>{d.dietary}</div>
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>{d.holdingTemp}</td>
                    <td>
                      <span style={{ color: d.urgency === 'CRITICAL' ? 'var(--color-saffron)' : 'inherit', fontWeight: 600 }}>
                        {d.expiresAt}
                      </span>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {d.hoursRemaining}h remaining
                      </div>
                    </td>
                    <td>
                      <Badge
                        tone={
                          d.urgency === 'CRITICAL'
                            ? 'terracotta'
                            : d.status === 'REQUESTED'
                            ? 'sage'
                            : 'mint'
                        }
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('details', d.id)}
                      >
                        Inspect Details →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {section === 'requests' && (
        <Card
          title="Incoming NGO Allocation Requests (Mock Data)"
          badge={<Badge tone="sage">2 PENDING</Badge>}
        >
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Requesting NGO</th>
                  <th>DARPAN ID</th>
                  <th>Turnaround SLA</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vegetable Pulao &amp; Lentil Curry (65 servings)</td>
                  <td>Mercy Community Kitchen</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)' }}>KA/2021/0149921</span></td>
                  <td>~25 mins</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <Button size="sm" disabled title="Disabled in static preview">Accept</Button>
                      <Button size="sm" variant="ghost" disabled title="Disabled in static preview">Decline</Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Artisan Loaves (40 loaves)</td>
                  <td>Annapurna Relief Food Bank</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)' }}>KA/2019/0088214</span></td>
                  <td>~35 mins</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <Button size="sm" disabled title="Disabled in static preview">Accept</Button>
                      <Button size="sm" variant="ghost" disabled title="Disabled in static preview">Decline</Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {section === 'safety' && (
        <Card
          title="FSSAI Schedule I Donor Safety Affirmation"
          subtitle="All surplus listings mandate four-point safety verification before NGO visibility."
        >
          <ul style={{ listStyle: 'none', display: 'grid', gap: '0.65rem', fontSize: '0.92rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Badge tone="mint">✓</Badge>
              <span>Prepared in an FSSAI-registered commercial or event kitchen.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Badge tone="mint">✓</Badge>
              <span>Packaged in food-grade, tamper-evident containers.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Badge tone="mint">✓</Badge>
              <span>Hot holding above 60°C or rapid chilled below 7°C maintained.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Badge tone="mint">✓</Badge>
              <span>Clear allergen disclosures (dairy, gluten, nuts) declared on batch label.</span>
            </li>
          </ul>
        </Card>
      )}

      {section === 'history' && (
        <Card
          title="Completed Food Rescue History (Mock Data)"
          badge={<Badge tone="forest">14 DELIVERIES</Badge>}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            14 surplus batches successfully rescued and confirmed via single-use QR handoff tokens.
            Zero reported safety incidents or spoilage events.
          </p>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default DonorDashboardPage;
