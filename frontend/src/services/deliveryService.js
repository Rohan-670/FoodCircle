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

export function requestVolunteer(donationId, notes) {
  return request(`/deliveries/donations/${donationId}/request-volunteer`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export function getAvailableTasks() {
  return request('/deliveries/available');
}

export function getMyDeliveries() {
  return request('/deliveries/my');
}

export function acceptTask(deliveryId) {
  return request(`/deliveries/${deliveryId}/accept`, {
    method: 'POST',
  });
}

export function getDeliveryById(deliveryId) {
  return request(`/deliveries/${deliveryId}`);
}

export function getDeliveryRoute(deliveryId) {
  return request(`/deliveries/${deliveryId}/route`);
}

export function updateVolunteerLocation(deliveryId, { latitude, longitude, consentGranted }) {
  return request(`/deliveries/${deliveryId}/location`, {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude, consentGranted }),
  });
}

export function stopVolunteerLocation(deliveryId) {
  return request(`/deliveries/${deliveryId}/location/stop`, {
    method: 'POST',
  });
}

export function confirmPickup(deliveryId, token) {
  return request(`/deliveries/${deliveryId}/confirm-pickup`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function startTransit(deliveryId) {
  return request(`/deliveries/${deliveryId}/start-transit`, {
    method: 'POST',
  });
}

export function confirmDelivery(deliveryId, token) {
  return request(`/deliveries/${deliveryId}/confirm-delivery`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
