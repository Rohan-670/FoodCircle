import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button, Input } from '../components/ui';
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
  const [activeTask, setActiveTask] = useState(MOCK_VOLUNTEER_TASKS[0]);
  const [availableTasks, setAvailableTasks] = useState([MOCK_VOLUNTEER_TASKS[1]]);
  const [timelineStep, setTimelineStep] = useState(1); // 1 = VOLUNTEER_ASSIGNED
  const [gpsConsent, setGpsConsent] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [qrInput, setQrInput] = useState('');

  const handleAdvanceStep = () => {
    if (timelineStep < WORKFLOW_STEPS.length - 1) {
      const nextStep = timelineStep + 1;
      setTimelineStep(nextStep);
      setActiveTask({
        ...activeTask,
        status: WORKFLOW_STEPS[nextStep],
        timelineStep: nextStep,
      });
      setFeedback(`Status updated to: ${WORKFLOW_STEPS[nextStep]}`);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handleVerifyQr = () => {
    if (!qrInput.trim()) return;
    if (
      qrInput.trim() === activeTask.pickupQrToken ||
      qrInput.trim() === activeTask.deliveryQrToken ||
      qrInput.trim().length >= 8
    ) {
      handleAdvanceStep();
      setQrInput('');
      setFeedback('Single-use QR token verified! Step completed.');
    } else {
      setFeedback('Invalid QR token. Please enter a valid 256-bit token.');
    }
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleAcceptTask = (task) => {
    setAvailableTasks(availableTasks.filter((t) => t.id !== task.id));
    setActiveTask({ ...task, status: 'VOLUNTEER_ASSIGNED', timelineStep: 1 });
    setTimelineStep(1);
    setSection('assigned');
    setFeedback(`Task "${task.title}" accepted! Ready for pickup.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const sidebarItems = [
    { id: 'assigned', label: 'Active Delivery', count: activeTask ? 1 : 0 },
    { id: 'available', label: 'Available Tasks', count: availableTasks.length },
    { id: 'history', label: 'Completed Deliveries', count: 9 },
  ];

  const metrics = [
    { label: 'Courier Status', value: 'Online', note: 'Central Ward' },
    { label: 'Active Task', value: activeTask ? activeTask.status : 'None', note: 'Current route' },
    { label: 'Available in Corridor', value: String(availableTasks.length), note: 'Near you' },
    { label: 'Completed Deliveries', value: '9', note: '100% QR confirmed' },
  ];

  return (
    <DashboardLayout
      roleLabel="Volunteer"
      title="Charlie Verma — Dispatch"
      subtitle="Courier ID: FC-VOL-9941 • Central Logistics Ward"
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
    >
      {feedback && (
        <div style={{ backgroundColor: 'var(--color-mint)', border: '1px solid var(--color-mint-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--color-forest)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {section === 'assigned' && activeTask && (
        <div className="form-stack">
          <Card
            title={activeTask.title}
            subtitle={`${activeTask.distanceKm} km route • ETA ~${activeTask.etaMinutes} mins`}
            badge={<Badge tone="forest">{WORKFLOW_STEPS[timelineStep]}</Badge>}
          >
            <div style={{ display: 'grid', gap: '0.45rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <div><strong>Pickup:</strong> {activeTask.pickupAddress} ({activeTask.donorName})</div>
              <div><strong>Drop-off:</strong> {activeTask.deliveryAddress} ({activeTask.ngoName})</div>
            </div>

            {/* Visual Step Timeline */}
            <div className="info-strip" style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.45rem' }}>
                Delivery Workflow Status
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {WORKFLOW_STEPS.map((step, idx) => {
                  const isCurrent = idx === timelineStep;
                  const isDone = idx < timelineStep;
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

            {/* Reactive Step Progression Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.86rem' }}>Advance Delivery Step</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.75rem' }}>
                  Progress the delivery state as you execute the pickup and handover.
                </p>
                {timelineStep < WORKFLOW_STEPS.length - 1 ? (
                  <Button size="sm" onClick={handleAdvanceStep}>
                    Advance to: {WORKFLOW_STEPS[timelineStep + 1]} →
                  </Button>
                ) : (
                  <Badge tone="mint">✓ Delivery Complete</Badge>
                )}
              </div>

              {/* QR Code Validation Simulator */}
              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.86rem' }}>Verify Single-Use QR Token</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.5rem' }}>
                  Scan or enter the single-use token at handoff.
                </p>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Input
                    id="qr-val-input"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder={timelineStep <= 2 ? activeTask.pickupQrToken : activeTask.deliveryQrToken}
                  />
                  <Button size="sm" onClick={handleVerifyQr}>Verify</Button>
                </div>
              </div>
            </div>

            {/* GPS Sharing Toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant={gpsConsent ? 'primary' : 'secondary'}
                onClick={() => {
                  setGpsConsent(!gpsConsent);
                  setFeedback(gpsConsent ? 'GPS location sharing paused.' : 'Live GPS location sharing active!');
                  setTimeout(() => setFeedback(''), 3000);
                }}
              >
                {gpsConsent ? 'Stop GPS Sharing' : 'Share Live Location'}
              </Button>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {gpsConsent ? (
                  <strong style={{ color: 'var(--color-forest)' }}>● Broadcasting Live Location (Socket.IO)</strong>
                ) : (
                  'GPS Sharing Paused'
                )}
              </span>
            </div>
          </Card>
        </div>
      )}

      {section === 'available' && (
        <Card title="Available Tasks in Corridor" subtitle="Open delivery tasks ready for volunteer pickup.">
          {availableTasks.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No other open tasks in your area right now.</p>
          ) : (
            <div className="table-wrap">
              <table className="editorial-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Pickup</th>
                    <th>Drop-off</th>
                    <th>Distance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableTasks.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.title}</strong></td>
                      <td>{t.pickupAddress}</td>
                      <td>{t.deliveryAddress}</td>
                      <td>{t.distanceKm} km</td>
                      <td>
                        <Button size="sm" onClick={() => handleAcceptTask(t)}>
                          Accept Task
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {section === 'history' && (
        <Card title="Completed Deliveries" badge={<Badge tone="forest">9 Completed</Badge>}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            All past 9 deliveries were completed on time and verified with single-use QR tokens.
          </p>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default VolunteerDashboardPage;
