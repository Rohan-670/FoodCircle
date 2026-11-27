const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }
  return payload.data;
}

export function getDashboardStats() {
  return request('/admin/dashboard');
}

export function getUsers({ page = 1, limit = 10, role = '', search = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (role) params.set('role', role);
  if (search) params.set('search', search);
  return request(`/admin/users?${params.toString()}`);
}

export function updateAccountStatus(userId, isActive) {
  return request(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}

export function verifyNgo(ngoId, { status, notes }) {
  return request(`/admin/ngos/${ngoId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
}

export function verifyDonor(donorId, { status, notes }) {
  return request(`/admin/donors/${donorId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
}

export function getVerificationHistory({ page = 1, limit = 10 } = {}) {
  return request(`/admin/verifications/history?page=${page}&limit=${limit}`);
}

export function getReports({ page = 1, limit = 10, status = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return request(`/admin/reports?${params.toString()}`);
}

export function reviewReport(reportId, { status, adminNotes, cancelDonation }) {
  return request(`/admin/reports/${reportId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNotes, cancelDonation }),
  });
}

export function getDonations({ page = 1, limit = 10, status = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return request(`/admin/donations?${params.toString()}`);
}

export function getDeliveries({ page = 1, limit = 10, status = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return request(`/admin/deliveries?${params.toString()}`);
}

export function getAuditLogs({ page = 1, limit = 15 } = {}) {
  return request(`/admin/audit-logs?page=${page}&limit=${limit}`);
}
