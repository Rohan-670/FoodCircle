import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import { MOCK_VOLUNTEER_TASKS } from '../data/mockData';

const WORKFLOW_STEPS = [
  'ACCEPTED',
  'VOLUNTEER_ASSIGNED',
  'PICKUP_CONFIRMED',
  'IN_TRANSIT',
  'DELIVERY_CONFIRMED',
];

export function VolunteerDashboardPage() {
  const [section, setSection] = useState('assigned');
  const [gpsConsent, setGpsConsent] = useState(false);

  const sidebarItems = [
    { id: 'assigned', label: 'Active Assignment', count: 1 },
    { id: 'available', label: 'Available Tasks', count: 1 },
    { id: 'history', label: 'Completed History', count: 9 },
  ];

  const metrics = [
    { label: 'Availability', value: 'Online', note: 'Central Ward' },
    { label: 'Active Task (Mock)', value: '1', note: 'VOLUNTEER_ASSIGNED' },
    { label: 'Open Tasks (Mock)', value: '1', note: '3.5 km distance' },
    { label: 'Completed (Mock)', value: '9', note: '100% QR confirmed' },
  ];

  const activeTask = MOCK_VOLUNTEER_TASKS[0];

  return (
    <DashboardLayout
      roleLabel="Volunteer Courier"
      title="Charlie Verma — Dispatch"
      subtitle="Accept pickup tasks, manage consent-based GPS sharing, and confirm handoffs with single-use QR codes."
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
    >
      {section === 'assigned' && (
        <div className="form-stack">
          <Card
            title={activeTask.title}
            subtitle={`${activeTask.distanceKm} km route • Est. ${activeTask.etaMinutes} mins (Mock)`}
            badge={<Badge tone="forest">{activeTask.status}</Badge>}
          >
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <div>
                <strong>Pickup:</strong> {activeTask.pickupAddress}
              </div>
              <div>
                <strong>Drop-off:</strong> {activeTask.deliveryAddress}
              </div>
            </div>

            <div className="info-strip" style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.4rem' }}>
                Delivery Workflow Progress
              </strong>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {WORKFLOW_STEPS.map((step, idx) => (
                  <Badge
                    key={step}
                    tone={idx <= activeTask.timelineStep ? 'mint' : 'neutral'}
                  >
                    {step}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="info-strip">
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.65rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={gpsConsent}
                  onChange={(e) => setGpsConsent(e.target.checked)}
                />
                <span>
                  I consent to share live GPS coordinates for this active delivery (auto-stops
                  upon completion).
                </span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button size="sm" disabled title="Disabled in static UI preview">
                  Share Live Location
                </Button>
                <Button variant="secondary" size="sm" disabled title="Disabled in static UI preview">
                  Scan Pickup QR
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {section === 'available' && (
        <Card
          title={MOCK_VOLUNTEER_TASKS[1].title}
          subtitle={`${MOCK_VOLUNTEER_TASKS[1].distanceKm} km • Est. ${MOCK_VOLUNTEER_TASKS[1].etaMinutes} mins (Mock)`}
          badge={<Badge tone="sage">PENDING_VOLUNTEER</Badge>}
          footer={
            <Button size="sm" disabled title="Disabled in static UI preview">
              Accept Delivery Task
            </Button>
          }
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>Pickup:</strong> {MOCK_VOLUNTEER_TASKS[1].pickupAddress}
            <br />
            <strong>Drop-off:</strong> {MOCK_VOLUNTEER_TASKS[1].deliveryAddress}
          </p>
        </Card>
      )}

      {section === 'history' && (
        <Card title="Completed Delivery History (Mock Data)">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Sample record: <strong>Seasonal Produce Crate</strong> — Pickup &amp; delivery
            confirmed via single-use QR tokens; GPS sharing stopped automatically.
          </p>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default VolunteerDashboardPage;
