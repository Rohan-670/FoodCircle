import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button } from '../components/ui';
import {
  MOCK_ADMIN_VERIFICATIONS,
  MOCK_ADMIN_REPORTS,
  MOCK_AUDIT_LOGS,
  MOCK_DONATIONS,
} from '../data/mockData';

export function AdminDashboardPage() {
  const [section, setSection] = useState('verifications');

  const sidebarItems = [
    { id: 'verifications', label: 'Verification Queue', count: MOCK_ADMIN_VERIFICATIONS.length },
    { id: 'reports', label: 'Reported Donations', count: MOCK_ADMIN_REPORTS.length },
    { id: 'donations', label: 'Donations & Users', count: MOCK_DONATIONS.length },
    { id: 'audit', label: 'Audit Logs', count: MOCK_AUDIT_LOGS.length },
  ];

  const metrics = [
    { label: 'Total Users (Mock)', value: '48', note: '18 Donors • 12 NGOs • 17 Vol' },
    { label: 'Available Donations (Mock)', value: '6', note: '32 completed • 4 expired' },
    { label: 'Active Deliveries (Mock)', value: '3', note: 'Live QR & GPS tracked' },
    { label: 'Pending Verifications (Mock)', value: '2', note: '1 Open Safety Report' },
  ];

  return (
    <DashboardLayout
      roleLabel="Administrator"
      title="Platform Governance & Compliance"
      subtitle="Verify NGOs and donors, review food safety reports, manage account status, and audit actions."
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
    >
      {section === 'verifications' && (
        <Card
          title="Pending Organization Verifications (Mock Data)"
          subtitle="All approval or rejection decisions are recorded in Verification History and Audit Logs."
        >
          <div className="form-stack">
            {MOCK_ADMIN_VERIFICATIONS.map((item) => (
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
                  <strong>{item.organization}</strong>{' '}
                  <Badge tone="sage">{item.type}</Badge>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Reg: {item.registrationNo} • Area: {item.serviceArea} • Submitted{' '}
                    {item.submittedAt}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button size="sm" disabled title="Disabled in static UI preview">
                    Approve
                  </Button>
                  <Button variant="secondary" size="sm" disabled title="Disabled in static UI preview">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {section === 'reports' && (
        <Card
          title="Reported Donations Queue (Mock Data)"
          subtitle="Review food safety concerns and cancel unsafe listings if necessary."
        >
          {MOCK_ADMIN_REPORTS.map((rep) => (
            <div key={rep.id} className="info-strip">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong>{rep.donationTitle}</strong>
                <Badge tone="terracotta">{rep.status}</Badge>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0.75rem' }}>
                <strong>Reason:</strong> {rep.reason} — {rep.notes} (Reported by{' '}
                {rep.reportedBy})
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="terracotta" size="sm" disabled title="Disabled in static UI preview">
                  Cancel Donation &amp; Resolve
                </Button>
                <Button variant="secondary" size="sm" disabled title="Disabled in static UI preview">
                  Dismiss Report
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {section === 'donations' && (
        <Card title="Platform Donation Records (Mock Data)">
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Donor</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DONATIONS.map((d) => (
                  <tr key={d.id}>
                    <td>{d.title}</td>
                    <td>{d.donorName}</td>
                    <td>
                      {d.quantity} {d.unit}
                    </td>
                    <td>
                      <Badge tone="mint">{d.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {section === 'audit' && (
        <Card title="Immutable Audit Logs (Mock Data)">
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Admin</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_AUDIT_LOGS.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <Badge tone="forest">{log.action}</Badge>
                    </td>
                    <td>{log.target}</td>
                    <td>{log.admin}</td>
                    <td>{log.timestamp}</td>
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
