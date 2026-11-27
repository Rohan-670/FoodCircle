import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import {
  MOCK_ADMIN_VERIFICATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_DONATIONS,
} from '../data/mockData';

export function AdminDashboardPage() {
  const [section, setSection] = useState('verifications');
  const [verifications, setVerifications] = useState(MOCK_ADMIN_VERIFICATIONS);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);
  const [feedback, setFeedback] = useState('');

  const handleVerifyOrg = (id, orgName) => {
    setVerifications(verifications.filter((v) => v.id !== id));
    const newLog = {
      id: `aud-${Date.now()}`,
      action: 'ORGANIZATION_VERIFIED',
      target: orgName,
      admin: 'System Administrator',
      timestamp: 'Just now',
    };
    setAuditLogs([newLog, ...auditLogs]);
    setFeedback(`"${orgName}" successfully verified & activated!`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleRejectOrg = (id, orgName) => {
    setVerifications(verifications.filter((v) => v.id !== id));
    const newLog = {
      id: `aud-${Date.now()}`,
      action: 'ORGANIZATION_REJECTED',
      target: orgName,
      admin: 'System Administrator',
      timestamp: 'Just now',
    };
    setAuditLogs([newLog, ...auditLogs]);
    setFeedback(`"${orgName}" application rejected.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const sidebarItems = [
    { id: 'verifications', label: 'Verification Queue', count: verifications.length },
    { id: 'donations', label: 'Active Network Batches', count: MOCK_DONATIONS.length },
    { id: 'audit', label: 'Audit Trail', count: auditLogs.length },
  ];

  const metrics = [
    { label: 'Registered Entities', value: '54', note: 'Donors, NGOs, Volunteers' },
    { label: 'Active Volume', value: '220 kg', note: 'Across all active corridors' },
    { label: 'Active Deliveries', value: '3', note: 'QR-tracked couriers' },
    { label: 'Pending Verification', value: String(verifications.length), note: 'Review required' },
  ];

  return (
    <DashboardLayout
      roleLabel="Admin"
      title="Platform Governance &amp; Administration"
      subtitle="Review organization registrations, manage accounts, and audit operations."
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

      {section === 'verifications' && (
        <Card
          title="Organization Verification Queue"
          subtitle="Review registration details before granting platform access."
        >
          {verifications.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              No pending verification requests. All organizations reviewed!
            </p>
          ) : (
            <div className="form-stack">
              {verifications.map((item) => (
                <div
                  key={item.id}
                  className="info-strip"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{item.organization}</strong>
                      <Badge tone="forest">{item.type}</Badge>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{item.darpanId || item.fssaiLicense || item.registrationNo}</span> • Area: {item.serviceArea} • Submitted {item.submittedAt}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      size="sm"
                      onClick={() => handleVerifyOrg(item.id, item.organization)}
                    >
                      Verify &amp; Activate
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRejectOrg(item.id, item.organization)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {section === 'donations' && (
        <Card title="Active Network Batches" subtitle="Live food batches across all corridors.">
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Batch / Donor</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DONATIONS.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {d.donorName}
                      </div>
                    </td>
                    <td>{d.category}</td>
                    <td>{d.quantity} {d.unit}</td>
                    <td><Badge tone="mint">{d.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {section === 'audit' && (
        <Card title="Immutable Audit Trail" subtitle="System records and admin decisions.">
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.timestamp}</td>
                    <td><Badge tone="forest">{a.action}</Badge></td>
                    <td>{a.target}</td>
                    <td style={{ fontSize: '0.84rem' }}>{a.admin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboardPage;
