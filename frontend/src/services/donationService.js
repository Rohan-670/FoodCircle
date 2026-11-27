const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

export function createDonation(formData) {
  return request('/donations', {
    method: 'POST',
    body: formData,
  });
}

export function updateDonation(donationId, formData) {
  return request(`/donations/${donationId}`, {
    method: 'PATCH',
    body: formData,
  });
}

export function cancelDonation(donationId) {
  return request(`/donations/${donationId}/cancel`, {
    method: 'PATCH',
  });
}

export function getDonorDonations() {
  return request('/donations/my', {
    method: 'GET',
  });
}

export function browseDonations(filters = {}) {
  const params = new URLSearchParams();
  if (filters.foodCategory) params.set('foodCategory', filters.foodCategory);
  if (filters.minQuantity) params.set('minQuantity', filters.minQuantity);
  if (filters.location) params.set('location', filters.location);
  if (filters.urgency && filters.urgency !== 'ALL') params.set('urgency', filters.urgency);

  const queryString = params.toString();
  return request(`/donations${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
}

export function requestDonation(donationId, payload = {}) {
  return request(`/donations/${donationId}/requests`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function respondToRequest(requestId, action) {
  return request(`/donations/requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });
}
