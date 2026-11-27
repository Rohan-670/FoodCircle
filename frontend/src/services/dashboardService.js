const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }
  return payload.data;
}

export function getDonorDashboard() {
  return request('/dashboards/donor');
}

export function getNgoDashboard() {
  return request('/dashboards/ngo');
}

export function getVolunteerDashboard() {
  return request('/dashboards/volunteer');
}

export function getImpactAnalytics() {
  return request('/analytics/impact');
}
