import React, { useState, useEffect, useCallback } from 'react';
import * as adminService from '../services/adminService';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [donations, setDonations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [notesById, setNotesById] = useState({});
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        statsRes,
        usersRes,
        reportsRes,
        donationsRes,
        deliveriesRes,
        logsRes,
        verHistRes,
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers({ role: roleFilter, search: searchFilter }),
        adminService.getReports(),
        adminService.getDonations(),
        adminService.getDeliveries(),
        adminService.getAuditLogs(),
        adminService.getVerificationHistory(),
      ]);

      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
      setReports(reportsRes.reports || []);
      setDonations(donationsRes.donations || []);
      setDeliveries(deliveriesRes.deliveries || []);
      setAuditLogs(logsRes.logs || []);
      setVerificationHistory(verHistRes.records || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchFilter]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleToggleAccount = async (userId, currentActive) => {
    setError('');
    setStatusMsg('');
    try {
      await adminService.updateAccountStatus(userId, !currentActive);
      setStatusMsg(
        `Account ${!currentActive ? 'reactivated' : 'suspended'} successfully.`
      );
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyNgo = async (ngoId, status) => {
    setError('');
    setStatusMsg('');
    try {
      await adminService.verifyNgo(ngoId, {
        status,
        notes: notesById[ngoId] || '',
      });
      setStatusMsg(`NGO verification updated to ${status}.`);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyDonor = async (donorId, status) => {
    setError('');
    setStatusMsg('');
    try {
      await adminService.verifyDonor(donorId, {
        status,
        notes: notesById[donorId] || '',
      });
      setStatusMsg(`Donor verification updated to ${status}.`);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReviewReport = async (reportId, status, cancelDonation = false) => {
    setError('');
    setStatusMsg('');
    try {
      await adminService.reviewReport(reportId, {
        status,
        adminNotes: notesById[reportId] || '',
        cancelDonation,
      });
      setStatusMsg(`Report marked as ${status}.`);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Administrator Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Platform governance, organization verification, reported food safety reviews, and audit logs.
        </p>
      </section>

      {error && <div className="auth-error">{error}</div>}
      {statusMsg && <div className="auth-success">{statusMsg}</div>}

      {/* Summary Metrics */}
      {stats && (
        <div className="grid-cards" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <div className="detail-label">Users Breakdown</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.3rem 0' }}>
              {stats.totalUsers} Total
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Donors: {stats.totalDonors} • NGOs: {stats.totalNgos} • Volunteers:{' '}
              {stats.totalVolunteers}
            </div>
          </div>

          <div className="card">
            <div className="detail-label">Donations Overview</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.3rem 0' }}>
              {stats.availableDonations} Available
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Completed: {stats.completedDonations} • Cancelled/Expired:{' '}
              {stats.cancelledAndExpiredDonations}
            </div>
          </div>

          <div className="card">
            <div className="detail-label">Operations &amp; Compliance</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.3rem 0' }}>
              {stats.activeDeliveries} Active Deliveries
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Pending Verifications: {stats.pendingVerifications} • Open Reports:{' '}
              {stats.openReports}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          ['users', 'Users & Verifications'],
          ['reports', 'Reported Donations'],
          ['records', 'Donations & Deliveries'],
          ['audit', 'Audit Logs & History'],
        ].map(([tabKey, label]) => (
          <button
            key={tabKey}
            type="button"
            className={activeTab === tabKey ? 'primary-button' : 'secondary-button'}
            onClick={() => setActiveTab(tabKey)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading administrative records...</p>
      ) : (
        <>
          {activeTab === 'users' && (
            <div>
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="admin-role-filter">Filter by Role</label>
                    <select
                      id="admin-role-filter"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="">All Roles</option>
                      <option value="DONOR">DONOR</option>
                      <option value="NGO">NGO</option>
                      <option value="VOLUNTEER">VOLUNTEER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="admin-search">Search Name or Email</label>
                    <input
                      id="admin-search"
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Search..."
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {users.map((u) => {
                  const orgProfile = u.ngoProfile || u.donorProfile;
                  return (
                    <div key={u.id} className="card">
                      <div className="profile-header">
                        <div>
                          <h4>
                            {u.fullName} ({u.role})
                          </h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {u.email}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span
                            className={`status-indicator ${
                              u.isActive ? 'status-online' : 'status-offline'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                          {u.role !== 'ADMIN' && (
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => handleToggleAccount(u.id, u.isActive)}
                            >
                              {u.isActive ? 'Suspend' : 'Reactivate'}
                            </button>
                          )}
                        </div>
                      </div>

                      {orgProfile && (
                        <div style={{ display: 'grid', gap: '0.6rem' }}>
                          <div style={{ fontSize: '0.9rem' }}>
                            <strong>Organization:</strong> {orgProfile.organizationName} |{' '}
                            <strong>Verification:</strong> {orgProfile.verificationStatus}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              placeholder="Verification notes"
                              value={notesById[orgProfile.id] || ''}
                              onChange={(e) =>
                                setNotesById((prev) => ({
                                  ...prev,
                                  [orgProfile.id]: e.target.value,
                                }))
                              }
                              style={{
                                flex: 1,
                                minWidth: '200px',
                                padding: '0.45rem 0.7rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                              }}
                            />
                            <button
                              type="button"
                              className="primary-button"
                              onClick={() =>
                                u.ngoProfile
                                  ? handleVerifyNgo(orgProfile.id, 'APPROVED')
                                  : handleVerifyDonor(orgProfile.id, 'APPROVED')
                              }
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() =>
                                u.ngoProfile
                                  ? handleVerifyNgo(orgProfile.id, 'REJECTED')
                                  : handleVerifyDonor(orgProfile.id, 'REJECTED')
                              }
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {reports.length === 0 ? (
                <div className="card">
                  <p>No reported donations found.</p>
                </div>
              ) : (
                reports.map((rep) => (
                  <div key={rep.id} className="card">
                    <div className="profile-header">
                      <div>
                        <h4>{rep.donation?.title || rep.donationId}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Reason: {rep.reason}
                        </span>
                      </div>
                      <span className="header-badge">{rep.status}</span>
                    </div>
                    {rep.details && <p style={{ fontSize: '0.9rem' }}>{rep.details}</p>}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Admin review notes"
                        value={notesById[rep.id] || ''}
                        onChange={(e) =>
                          setNotesById((prev) => ({
                            ...prev,
                            [rep.id]: e.target.value,
                          }))
                        }
                        style={{
                          flex: 1,
                          minWidth: '200px',
                          padding: '0.45rem 0.7rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                        }}
                      />
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          handleReviewReport(rep.id, 'ACTION_TAKEN', true)
                        }
                      >
                        Cancel Donation &amp; Resolve
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleReviewReport(rep.id, 'DISMISSED', false)
                        }
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'records' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '0.75rem' }}>Recent Donations ({donations.length})</h3>
                {donations.map((d) => (
                  <div key={d.id} className="profile-info-box">
                    <strong>{d.title}</strong> ({d.foodCategory}) — {d.quantity} {d.unit} |{' '}
                    <strong>Status:</strong> {d.status} |{' '}
                    <strong>Donor:</strong> {d.donor?.organizationName}
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '0.75rem' }}>Recent Deliveries ({deliveries.length})</h3>
                {deliveries.map((del) => (
                  <div key={del.id} className="profile-info-box">
                    <strong>{del.donation?.title || del.donationId}</strong> |{' '}
                    <strong>Status:</strong> {del.status} |{' '}
                    <strong>Volunteer:</strong> {del.volunteer?.user?.fullName || 'Unassigned'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '0.75rem' }}>Audit Logs ({auditLogs.length})</h3>
                {auditLogs.map((log) => (
                  <div key={log.id} className="profile-info-box">
                    <strong>{log.action}</strong> ({log.targetType}: {log.targetId}) —{' '}
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '0.75rem' }}>
                  Verification History ({verificationHistory.length})
                </h3>
                {verificationHistory.map((vh) => (
                  <div key={vh.id} className="profile-info-box">
                    <strong>{vh.targetType}</strong> ({vh.targetProfileId}) →{' '}
                    <strong>{vh.status}</strong> {vh.notes ? `| Notes: ${vh.notes}` : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboardPage;
