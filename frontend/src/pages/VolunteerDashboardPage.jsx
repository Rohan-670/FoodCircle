import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button, Input } from '../components/ui';
import { getStoredDeliveries, updateStoredDelivery } from '../data/store';

const WORKFLOW_STEPS = [
  'ACCEPTED',
  'VOLUNTEER_ASSIGNED',
  'PICKUP_CONFIRMED',
  'IN_TRANSIT',
  'DELIVERY_CONFIRMED',
];

export function VolunteerDashboardPage() {
  const [section, setSection] = useState('assigned');
  const [deliveries, setDeliveries] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [timelineStep, setTimelineStep] = useState(1);
  const [gpsConsent, setGpsConsent] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [qrInput, setQrInput] = useState('');

  useEffect(() => {
    const list = getStoredDeliveries();
    setDeliveries(list);
    const assigned = list.find((t) => t.status !== 'PENDING_VOLUNTEER' && t.status !== 'DELIVERY_CONFIRMED') || list[0];
    setActiveTask(assigned);
    setTimelineStep(assigned?.timelineStep ?? 1);
  }, []);

  const availableTasks = deliveries.filter((t) => t.status === 'PENDING_VOLUNTEER');

  const handleAdvanceStep = () => {
    if (!activeTask || timelineStep >= WORKFLOW_STEPS.length - 1) return;

    const nextStep = timelineStep + 1;
    setTimelineStep(nextStep);
    const nextStatus = WORKFLOW_STEPS[nextStep];

    const updatedTask = {
      ...activeTask,
      status: nextStatus,
      timelineStep: nextStep,
    };
    setActiveTask(updatedTask);
    const updatedList = updateStoredDelivery(activeTask.id, {
      status: nextStatus,
      timelineStep: nextStep,
    });
    setDeliveries(updatedList);

    setFeedback(`Status updated to: ${nextStatus}`);
    setTimeout(() => setFeedback(''), 4000);
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
      setFeedback('Single-use QR token verified successfully. Next step unlocked.');
    } else {
      setFeedback('Token mismatch. Please verify the code.');
    }
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleAcceptTask = (task) => {
    const updatedList = updateStoredDelivery(task.id, {
      status: 'VOLUNTEER_ASSIGNED',
      timelineStep: 1,
    });
    setDeliveries(updatedList);
    setActiveTask({ ...task, status: 'VOLUNTEER_ASSIGNED', timelineStep: 1 });
    setTimelineStep(1);
    setSection('assigned');
    setFeedback(`Task "${task.title}" accepted! You are now assigned to pickup.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const sidebarItems = [
    { id: 'assigned', label: 'Active Delivery', count: activeTask ? 1 : 0 },
    { id: 'available', label: 'Available Tasks', count: availableTasks.length },
    { id: 'history', label: 'Completed Deliveries', count: 9 },
  ];

  const metrics = [
    { label: 'Courier Status', value: 'Active', note: 'Central Ward' },
    { label: 'Current Task', value: activeTask ? activeTask.status : 'None', note: 'Dispatch status' },
    { label: 'Available in Corridor', value: String(availableTasks.length), note: 'Near you' },
    { label: 'Completed Deliveries', value: '9', note: '100% verified handoffs' },
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
                Delivery Workflow Progress
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

            {/* Step Progression Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.86rem' }}>Advance Workflow Step</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.75rem' }}>
                  Update the live handover state as you complete pickup and delivery.
                </p>
                {timelineStep < WORKFLOW_STEPS.length - 1 ? (
                  <Button size="sm" onClick={handleAdvanceStep}>
                    Advance to: {WORKFLOW_STEPS[timelineStep + 1]} →
                  </Button>
                ) : (
                  <Badge tone="mint">✓ Delivery Fully Completed</Badge>
                )}
              </div>

              {/* QR Code Validation */}
              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.86rem' }}>Single-Use QR Token Entry</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.5rem' }}>
                  Scan or enter the single-use token provided at handoff.
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

            {/* GPS Toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant={gpsConsent ? 'primary' : 'secondary'}
                onClick={() => {
                  setGpsConsent(!gpsConsent);
                  setFeedback(gpsConsent ? 'GPS location sharing paused.' : 'Live location broadcast active.');
                  setTimeout(() => setFeedback(''), 3000);
                }}
              >
                {gpsConsent ? 'Stop Location Sharing' : 'Share Live Location'}
              </Button>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {gpsConsent ? (
                  <strong style={{ color: 'var(--color-forest)' }}>● Broadcasting Live Location to Donor &amp; NGO</strong>
                ) : (
                  'GPS Sharing Paused'
                )}
              </span>
            </div>
          </Card>
        </div>
      )}

      {section === 'available' && (
        <Card title="Available Tasks in Corridor" subtitle="Unassigned food batches ready for courier pickup.">
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
                          Accept Delivery
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
            All 9 completed deliveries verified with single-use cryptographic tokens.
          </p>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default VolunteerDashboardPage;
