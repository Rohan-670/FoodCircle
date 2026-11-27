import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import { MOCK_DONATIONS } from '../data/mockData';

export function DonorDashboardPage({ onNavigate }) {
  const [section, setSection] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Active & Accepted', count: 3 },
    { id: 'requests', label: 'Incoming Requests', count: 2 },
    { id: 'safety', label: 'Safety Checklist' },
    { id: 'history', label: 'Completed History', count: 14 },
  ];

  const metrics = [
    { label: 'Active Listings (Mock)', value: '2', note: 'Available or requested' },
    { label: 'Accepted Batches (Mock)', value: '1', note: 'Awaiting pickup' },
    { label: 'Completed (Mock)', value: '14', note: 'Confirmed via QR' },
    { label: 'Total Meals Shared (Mock)', value: '820', note: 'Sample cumulative units' },
  ];

  return (
    <DashboardLayout
      roleLabel="Food Donor"
      title="Saffron Courtyard Kitchen"
      subtitle="Manage surplus food batches, safety checklists, and incoming NGO requests."
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
          + Post Surplus Batch (Preview Only)
        </Button>
      }
    >
      {section === 'overview' && (
        <Card
          title="Current Surplus Batches (Mock Data)"
          subtitle="Click any batch to inspect full safety metadata."
        >
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Food Batch</th>
                  <th>Quantity</th>
                  <th>Deadline</th>
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
                      {d.quantity} {d.unit}
                    </td>
                    <td>{d.expiresAt}</td>
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
                        View Details
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
          title="Incoming NGO Requests (Mock Data)"
          subtitle="Only one NGO may be accepted per surplus batch."
        >
          <div className="form-stack">
            <div className="info-strip" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <strong>Hope Shelter Kitchen</strong> (Verified NGO • 1.8 km away)
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Requested: Vegetable Pulao &amp; Lentil Curry Trays (65 servings)
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button size="sm" disabled title="Disabled in static UI preview">
                  Accept
                </Button>
                <Button variant="secondary" size="sm" disabled title="Disabled in static UI preview">
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {section === 'safety' && (
        <Card
          title="Donor Food Safety Protocol"
          subtitle="Safety details are donor-reported; photos do not certify food safety."
        >
          <ul style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.5rem', fontSize: '0.92rem' }}>
            <li>Record exact preparation or collection timestamp.</li>
            <li>Specify safe-consumption deadline and storage temperature.</li>
            <li>Declare all known allergens (dairy, nuts, gluten, soy).</li>
            <li>Confirm all 4 donor safety checklist items before publishing.</li>
          </ul>
        </Card>
      )}

      {section === 'history' && (
        <Card title="Recent Completed Deliveries (Mock Data)">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Sample historical record: <strong>Packaged UHT Milk &amp; Yogurt Cups</strong> (80
            packs) delivered to <strong>Metro Community Pantry</strong> with QR confirmation.
          </p>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default DonorDashboardPage;
