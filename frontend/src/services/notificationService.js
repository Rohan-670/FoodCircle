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

export function getNotifications({ page = 1, limit = 20, unreadOnly = false } = {}) {
  return request(
    `/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`
  );
}

export function getUnreadCount() {
  return request('/notifications/unread-count');
}

export function markAsRead(notificationId) {
  return request(`/notifications/${notificationId}/read`, { method: 'PATCH' });
}

export function markAllAsRead() {
  return request('/notifications/read-all', { method: 'PATCH' });
}

export function getPreferences() {
  return request('/notifications/preferences');
}

export function updatePreferences(prefs) {
  return request('/notifications/preferences', {
    method: 'PATCH',
    body: JSON.stringify(prefs),
  });
}
