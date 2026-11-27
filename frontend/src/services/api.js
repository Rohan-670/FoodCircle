const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Fetch health status from backend
 * @returns {Promise<object>}
 */
export async function fetchHealthStatus() {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

export default {
  fetchHealthStatus,
};
