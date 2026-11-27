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
    { id: 'verifications', label: 'NITI Aayog DARPAN Queue', count: MOCK_ADMIN_VERIFICATIONS.length },
    { id: 'reports', label: 'Food Safety Reports', count: MOCK_ADMIN_REPORTS.length },
    { id: 'donations', label: 'Surplus Batches & Network', count: MOCK_DONATIONS.length },
    { id: 'audit', label: 'Compliance Audit Trail', count: MOCK_AUDIT_LOGS.length },
  ];

  const metrics = [
    { label: 'Registered Entities', value: '54', note: '24 Donors • 18 NGOs • 12 Vol' },
    { label: 'Active Surplus Volume', value: '220 kg', note: 'All within consumption SLA' },
    { label: 'Active Deliveries', value: '3', note: 'Live single-use QR tracking' },
    { label: 'DARPAN Pending Review', value: '2', note: 'Tier evaluation in progress' },
  ];

  return (
    <DashboardLayout
      roleLabel="Platform Administrator"
      title="Statutory Governance &amp; Compliance Hub"
      subtitle="Verify NITI Aayog DARPAN credentials, review FSSAI safety incidents, manage 5-tier privileges, and monitor immutable audit logs."
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
    >
      {/* Statutory Guidance Banner */}
      <div className="statutory-shield-box" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.15rem' }}>
        <strong style={{ color: 'var(--color-forest)' }}>NITI Aayog DARPAN &amp; FSSAI Verification Standards:</strong>{' '}
        <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          All NGO partners are verified against the central NGO DARPAN database and assigned privilege tiers based on cold chain infrastructure (≤4°C) and verified daily meal buffer capacities.
        </span>
      </div>

      {section === 'verifications' && (
        <Card
          title="Organization Verification Queue (DARPAN &amp; FSSAI)"
          subtitle="Review official registration credentials before granting surplus allocation rights."
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{item.organization}</strong>
                    <Badge tone="forest">{item.type}</Badge>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                      {item.tier}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Reg: <span style={{ fontFamily: 'var(--font-mono)' }}>{item.darpanId || item.fssaiLicense || item.registrationNo}</span> • Area: {item.serviceArea} • Cold Chain: {item.coldChainCapability ? 'Equipped (≤4°C)' : 'Ambient Only'} • Submitted {item.submittedAt}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button size="sm" disabled title="Disabled in static UI preview">
                    Verify &amp; Activate
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
          title="Food Safety Incident Queue (Mock Data)"
          subtitle="Investigate potential thermal violations, packaging tears, or expired batch notices."
        >
          {MOCK_ADMIN_REPORTS.map((rep) => (
            <div key={rep.id} className="info-strip">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong>{rep.donationTitle}</strong>
                <Badge tone="terracotta">{rep.status}</Badge>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0.75rem' }}>
                <strong>Reason:</strong> {rep.reason} — {rep.notes} (Reported by {rep.reportedBy})
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button size="sm" variant="secondary" disabled title="Disabled in static preview">
                  Quarantine Batch
                </Button>
                <Button size="sm" variant="ghost" disabled title="Disabled in static preview">
                  Dismiss Report
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {section === 'donations' && (
        <Card
          title="Surplus Batches &amp; Registered Entities"
          subtitle="Real-time oversight of all platform activity."
        >
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Batch / Entity</th>
                  <th>Category / Type</th>
                  <th>License / DARPAN</th>
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
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{d.fssaiLicense}</span></td>
                    <td><Badge tone="mint">{d.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {section === 'audit' && (
        <Card
          title="Immutable Platform Audit Logs"
          subtitle="Cryptographically logged system transactions, verifications, and single-use QR confirmations."
        >
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
                {MOCK_AUDIT_LOGS.map((a) => (
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
