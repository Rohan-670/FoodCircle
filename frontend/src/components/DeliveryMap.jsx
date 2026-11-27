import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function DeliveryMap({
  pickup,
  delivery,
  volunteerLocation,
  route,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter =
        pickup?.lat != null && pickup?.lng != null
          ? [pickup.lat, pickup.lng]
          : [12.9716, 77.5946];

      const map = L.map(mapContainerRef.current).setView(defaultCenter, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers and route polylines
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    const bounds = [];

    if (pickup?.lat != null && pickup?.lng != null) {
      const marker = L.circleMarker([pickup.lat, pickup.lng], {
        radius: 9,
        color: '#16a34a',
        fillColor: '#22c55e',
        fillOpacity: 0.9,
      })
        .bindPopup(`<strong>Pickup (Donor)</strong><br/>${pickup.address || ''}`)
        .addTo(map);
      layersRef.current.push(marker);
      bounds.push([pickup.lat, pickup.lng]);
    }

    if (delivery?.lat != null && delivery?.lng != null) {
      const marker = L.circleMarker([delivery.lat, delivery.lng], {
        radius: 9,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.9,
      })
        .bindPopup(`<strong>Delivery (NGO)</strong><br/>${delivery.address || ''}`)
        .addTo(map);
      layersRef.current.push(marker);
      bounds.push([delivery.lat, delivery.lng]);
    }

    if (
      volunteerLocation?.isSharing &&
      volunteerLocation?.lat != null &&
      volunteerLocation?.lng != null
    ) {
      const volMarker = L.circleMarker(
        [volunteerLocation.lat, volunteerLocation.lng],
        {
          radius: 10,
          color: '#d97706',
          fillColor: '#f59e0b',
          fillOpacity: 0.95,
        }
      )
        .bindPopup('<strong>Volunteer (Live)</strong>')
        .addTo(map);
      layersRef.current.push(volMarker);
      bounds.push([volunteerLocation.lat, volunteerLocation.lng]);
    }

    if (route?.geometry && route.geometry.length > 1) {
      const polyline = L.polyline(route.geometry, {
        color: route.available ? '#16a34a' : '#64748b',
        weight: 4,
        dashArray: route.available ? undefined : '8, 8',
      }).addTo(map);
      layersRef.current.push(polyline);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }, [pickup, delivery, volunteerLocation, route]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const hasAnyCoords =
    (pickup?.lat != null && pickup?.lng != null) ||
    (delivery?.lat != null && delivery?.lng != null);

  return (
    <div>
      {!hasAnyCoords && (
        <div className="profile-info-box" style={{ marginBottom: '0.75rem' }}>
          Coordinates are not available for this delivery. Map shows default area;
          addresses are listed above.
        </div>
      )}
      <div
        ref={mapContainerRef}
        style={{
          height: '340px',
          width: '100%',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          zIndex: 1,
        }}
      />
    </div>
  );
}

export default DeliveryMap;
