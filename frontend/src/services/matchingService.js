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

export function getRecommendedNgosForDonation(donationId, filters = {}) {
  const params = new URLSearchParams();
  if (filters.minScore) params.set('minScore', filters.minScore);
  if (filters.maxDistanceKm) params.set('maxDistanceKm', filters.maxDistanceKm);
  if (filters.serviceArea) params.set('serviceArea', filters.serviceArea);
  const qs = params.toString();
  return request(`/recommendations/donations/${donationId}/ngos${qs ? `?${qs}` : ''}`);
}

export function getRecommendedDonationsForNgo(filters = {}) {
  const params = new URLSearchParams();
  if (filters.minScore) params.set('minScore', filters.minScore);
  if (filters.maxDistanceKm) params.set('maxDistanceKm', filters.maxDistanceKm);
  if (filters.foodCategory) params.set('foodCategory', filters.foodCategory);
  if (filters.urgency && filters.urgency !== 'ALL') params.set('urgency', filters.urgency);
  const qs = params.toString();
  return request(`/recommendations/ngos/donations${qs ? `?${qs}` : ''}`);
}

export function sendRecommendationAction({ donationId, ngoId, action }) {
  return request('/recommendations/actions', {
    method: 'POST',
    body: JSON.stringify({ donationId, ngoId, action }),
  });
}
