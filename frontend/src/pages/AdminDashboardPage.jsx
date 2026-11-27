import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import {
  getStoredVerifications,
  updateStoredVerification,
  getStoredAuditLogs,
  addStoredAuditLog,
  getStoredDonations,
} from '../data/store';

export function AdminDashboardPage({ onNavigate }) {
  const [section, setSection] = useState('verifications');
  const [verifications, setVerifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [donations, setDonations] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setVerifications(getStoredVerifications());
    setAuditLogs(getStoredAuditLogs());
    setDonations(getStoredDonations());
  }, []);

  const pendingVerifications = verifications.filter((v) => v.status === 'PENDING');

  const handleVerifyOrg = (id, orgName) => {
    const updatedVerifications = updateStoredVerification(id, 'VERIFIED');
    setVerifications(updatedVerifications);

    const updatedLogs = addStoredAuditLog('ORGANIZATION_VERIFIED', orgName);
    setAuditLogs(updatedLogs);

    setFeedback(`Organization "${orgName}" verified and approved for full operations.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleRejectOrg = (id, orgName) => {
    const updatedVerifications = updateStoredVerification(id, 'REJECTED');
    setVerifications(updatedVerifications);

    const updatedLogs = addStoredAuditLog('ORGANIZATION_REJECTED', orgName);
    setAuditLogs(updatedLogs);

    setFeedback(`Organization "${orgName}" application rejected.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const sidebarItems = [
    { id: 'verifications', label: 'Verification Queue', count: pendingVerifications.length },
    { id: 'donations', label: 'Network Food Batches', count: donations.length },
    { id: 'audit', label: 'Audit Trail', count: auditLogs.length },
  ];

  const metrics = [
    { label: 'Registered Entities', value: '54', note: 'Donors, NGOs, Couriers' },
    { label: 'Active Volume', value: '220 kg', note: 'Across all active corridors' },
    { label: 'Active Deliveries', value: '3', note: 'Live QR tracking' },
    { label: 'Pending Queue', value: String(pendingVerifications.length), note: 'Review required' },
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
      actions={
        onNavigate && (
          <Button variant="secondary" onClick={() => onNavigate('impact-dashboard')}>
            Impact Analytics →
          </Button>
        )
      }
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
          subtitle="Review documentation and approve valid charity and donor accounts."
        >
          {pendingVerifications.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              No pending verification requests. All partner applications reviewed.
            </p>
          ) : (
            <div className="form-stack">
              {pendingVerifications.map((item) => (
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
                      Registration No: <span style={{ fontFamily: 'var(--font-mono)' }}>{item.registrationNo}</span> • Area: {item.serviceArea} • Submitted {item.submittedAt}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      size="sm"
                      onClick={() => handleVerifyOrg(item.id, item.organization)}
                    >
                      Approve &amp; Activate
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
        <Card title="Active Network Food Batches" subtitle="Live food surplus entries across all logistics zones.">
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
                {donations.map((d) => (
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
        <Card title="Audit Trail" subtitle="System records and administrative actions.">
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
