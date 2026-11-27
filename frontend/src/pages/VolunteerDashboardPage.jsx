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
    { id: 'assigned', label: 'Active Delivery Task', count: 1 },
    { id: 'available', label: 'Available Tasks', count: 1 },
    { id: 'history', label: 'Completed Deliveries', count: 9 },
  ];

  const metrics = [
    { label: 'Courier Credential', value: 'Verified', note: 'FC-VOL-9941 • Insulated Fleet' },
    { label: 'Active Task', value: '1', note: 'VOLUNTEER_ASSIGNED' },
    { label: 'Available in Corridor', value: '1', note: '3.5 km distance' },
    { label: 'Completed Deliveries', value: '9', note: '100% QR verified handoffs' },
  ];

  const activeTask = MOCK_VOLUNTEER_TASKS[0];

  return (
    <DashboardLayout
      roleLabel="Citizen Logistics Courier"
      title="Charlie Verma — Dispatch"
      subtitle="Courier ID: FC-VOL-9941 • Central Logistics Ward • Insulated Thermal Carrier Equipped"
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
    >
      {/* Statutory Guidance Banner */}
      <div className="statutory-shield-box" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.15rem' }}>
        <strong style={{ color: 'var(--color-forest)' }}>Good Samaritan Courier Protection:</strong>{' '}
        <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Volunteer couriers transporting surplus food within temperature and time limits are protected under statutory Good Samaritan provisions. Location sharing is strictly consent-based and ceases automatically upon delivery confirmation.
        </span>
      </div>

      {section === 'assigned' && (
        <div className="form-stack">
          <Card
            title={activeTask.title}
            subtitle={`${activeTask.distanceKm} km route • Est. ${activeTask.etaMinutes} mins (OSRM Route)`}
            badge={<Badge tone="forest">{activeTask.status}</Badge>}
          >
            <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <div>
                <strong>Donor / Pickup:</strong> {activeTask.pickupAddress} ({activeTask.donorName})
              </div>
              <div>
                <strong>Recipient NGO:</strong> {activeTask.deliveryAddress} ({activeTask.ngoName})
              </div>
            </div>

            <div className="info-strip" style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.4rem' }}>
                Delivery Workflow Progression
              </strong>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {WORKFLOW_STEPS.map((step, idx) => {
                  const isCurrent = idx === activeTask.timelineStep;
                  const isDone = idx < activeTask.timelineStep;
                  return (
                    <Badge
                      key={step}
                      tone={isCurrent ? 'forest' : isDone ? 'mint' : 'neutral'}
                    >
                      {idx + 1}. {step}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {/* QR Pickup Token Preview */}
              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.88rem' }}>1. Single-Use Pickup QR Token</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.3rem 0' }}>
                  Present to donor kitchen to confirm custody transfer.
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', backgroundColor: 'var(--bg-surface)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', wordBreak: 'break-all' }}>
                  {activeTask.pickupQrToken}
                </div>
              </div>

              {/* QR Delivery Token Preview */}
              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.88rem' }}>2. Single-Use Delivery QR Token</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.3rem 0' }}>
                  Scan at recipient NGO food bank upon physical handover.
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', backgroundColor: 'var(--bg-surface)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', wordBreak: 'break-all' }}>
                  {activeTask.deliveryQrToken}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant={gpsConsent ? 'primary' : 'secondary'}
                onClick={() => setGpsConsent(!gpsConsent)}
              >
                {gpsConsent ? 'Stop Location Sharing' : 'Consent & Share Live GPS'}
              </Button>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Status:{' '}
                {gpsConsent ? (
                  <strong style={{ color: 'var(--color-forest)' }}>Live GPS Active (Socket.IO Room)</strong>
                ) : (
                  'GPS Sharing Paused'
                )}
              </span>
            </div>
          </Card>
        </div>
      )}

      {section === 'available' && (
        <Card
          title="Open Dispatch Tasks (Corridor)"
          badge={<Badge tone="sage">1 TASK</Badge>}
        >
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Surplus Batch</th>
                  <th>Pickup</th>
                  <th>Drop-off</th>
                  <th>Distance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Packaged UHT Milk &amp; Yogurt Cups</td>
                  <td>112 Ring Road, East District</td>
                  <td>88 Mission Road, South Zone</td>
                  <td>3.5 km</td>
                  <td>
                    <Button size="sm" disabled title="Disabled in static preview">
                      Accept Task
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {section === 'history' && (
        <Card
          title="Completed Deliveries"
          badge={<Badge tone="mint">9 DELIVERIES</Badge>}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            All 9 past deliveries completed on time with verified single-use QR chain of custody.
          </p>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default VolunteerDashboardPage;
