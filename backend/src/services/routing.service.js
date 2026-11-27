const { calculateDistanceKm } = require('./matching.service');
const logger = require('../utils/logger');

const DEFAULT_ROUTING_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Fetch driving route and ETA from a configurable routing provider (OSRM by default).
 * Falls back gracefully if coordinates are missing or the routing service fails.
 *
 * @param {{ lat?: number|null, lng?: number|null }} origin
 * @param {{ lat?: number|null, lng?: number|null }} destination
 * @param {typeof fetch} fetchImpl - Injectable fetch for testing
 */
async function getRoute(origin, destination, fetchImpl = fetch) {
  const hasCoords =
    origin?.lat != null &&
    origin?.lng != null &&
    destination?.lat != null &&
    destination?.lng != null;

  if (!hasCoords) {
    return {
      available: false,
      provider: 'FALLBACK',
      distanceKm: null,
      durationMinutes: null,
      geometry: [],
      fallbackReason: 'Pickup or delivery coordinates are missing.',
    };
  }

  const straightLineKm = Number(
    calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng).toFixed(2)
  );
  const straightLineGeometry = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  const baseUrl = process.env.ROUTING_API_URL || DEFAULT_ROUTING_URL;
  const url = `${baseUrl}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

  try {
    const response = await fetchImpl(url, {
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      throw new Error(`Routing service responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const route = data?.routes?.[0];
    if (!route || !route.geometry?.coordinates) {
      throw new Error('No route returned by routing provider');
    }

    // Convert GeoJSON [lng, lat] coordinates to Leaflet [lat, lng]
    const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return {
      available: true,
      provider: 'OSRM',
      distanceKm: Number((route.distance / 1000).toFixed(2)),
      durationMinutes: Math.max(1, Math.round(route.duration / 60)),
      geometry,
      fallbackReason: null,
    };
  } catch (error) {
    logger.warn(`Routing service fallback triggered: ${error.message}`);
    return {
      available: false,
      provider: 'FALLBACK',
      distanceKm: straightLineKm,
      durationMinutes: null,
      geometry: straightLineGeometry,
      fallbackReason:
        'Routing service is unavailable; displaying straight-line path without ETA.',
    };
  }
}

module.exports = {
  getRoute,
};
