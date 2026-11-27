const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Send and receive HTTP-only auth cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || `Request failed (${response.status})`);
    error.statusCode = response.status;
    error.errors = payload.errors || null;
    throw error;
  }

  return payload.data;
}

export function register(data) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function login(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST',
  });
}

export function getProfile() {
  return request('/auth/me', {
    method: 'GET',
  });
}

export function updateProfile(data) {
  return request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
