import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import * as deliveryService from '../services/deliveryService';
import DeliveryMap from '../components/DeliveryMap';
import QrCodeDisplay from '../components/QrCodeDisplay';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function DeliveryTrackingPage() {
  const { user } = useAuth();
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [gpsConsent, setGpsConsent] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const myRes = await deliveryService.getMyDeliveries();
      const list = myRes.deliveries || [];
      setMyDeliveries(list);

      if (user?.role === 'VOLUNTEER') {
        const availRes = await deliveryService.getAvailableTasks();
        setAvailableTasks(availRes.tasks || []);
      }

      if (list.length > 0 && !selectedDelivery) {
        const detail = await deliveryService.getDeliveryById(list[0].id);
        setSelectedDelivery(detail.delivery);
        const routeRes = await deliveryService.getDeliveryRoute(list[0].id);
        setRoute(routeRes.route);
      } else if (selectedDelivery) {
        const detail = await deliveryService.getDeliveryById(selectedDelivery.id);
        setSelectedDelivery(detail.delivery);
        const routeRes = await deliveryService.getDeliveryRoute(selectedDelivery.id);
        setRoute(routeRes.route);
      }
    } catch (err) {
      setError(err.message || 'Failed to load deliveries.');
    } finally {
      setLoading(false);
    }
  }, [user?.role, selectedDelivery?.id]);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Socket.IO real-time updates for selected delivery
  useEffect(() => {
    if (!selectedDelivery?.id) return;

    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('delivery:join', { deliveryId: selectedDelivery.id });
    });

    socket.on('delivery:status_updated', (payload) => {
      if (payload.deliveryId === selectedDelivery.id) {
        setSelectedDelivery((prev) =>
          prev ? { ...prev, status: payload.status } : prev
        );
      }
    });

    socket.on('delivery:location_updated', (payload) => {
      if (payload.deliveryId === selectedDelivery.id) {
        setSelectedDelivery((prev) =>
          prev
            ? {
                ...prev,
                isLocationSharing: true,
                lastVolunteerLat: payload.latitude,
                lastVolunteerLng: payload.longitude,
                lastLocationUpdatedAt: payload.updatedAt,
              }
            : prev
        );
      }
    });

    socket.on('delivery:location_stopped', (payload) => {
      if (payload.deliveryId === selectedDelivery.id) {
        setSelectedDelivery((prev) =>
          prev ? { ...prev, isLocationSharing: false } : prev
        );
      }
    });

    return () => {
      socket.emit('delivery:leave', { deliveryId: selectedDelivery.id });
      socket.disconnect();
    };
  }, [selectedDelivery?.id]);

  const stopGpsWatch = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => () => stopGpsWatch(), [stopGpsWatch]);

  const handleSelectDelivery = async (deliveryId) => {
    setError('');
    try {
      const detail = await deliveryService.getDeliveryById(deliveryId);
      setSelectedDelivery(detail.delivery);
      const routeRes = await deliveryService.getDeliveryRoute(deliveryId);
      setRoute(routeRes.route);
    } catch (err) {
      setError(err.message || 'Failed to load delivery details.');
    }
  };

  const handleAcceptTask = async (deliveryId) => {
    setError('');
    setStatusMsg('');
    try {
      await deliveryService.acceptTask(deliveryId);
      setStatusMsg('Delivery task accepted!');
      await handleSelectDelivery(deliveryId);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not accept task.');
    }
  };

  const handleStartLocationSharing = () => {
    setGpsError('');
    if (!gpsConsent) {
      setGpsError('Please check the consent box before sharing your live location.');
      return;
    }
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await deliveryService.updateVolunteerLocation(selectedDelivery.id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            consentGranted: true,
          });
          setStatusMsg('Live location shared.');
        } catch (err) {
          setGpsError(err.message);
        }
      },
      (geoErr) => {
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setGpsError(
            'Location permission was denied. You can continue the delivery using QR confirmations without live GPS.'
          );
        } else {
          setGpsError('Unable to retrieve GPS signal. Falling back to manual milestones.');
        }
        stopGpsWatch();
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  };

  const handleStopLocationSharing = async () => {
    stopGpsWatch();
    try {
      await deliveryService.stopVolunteerLocation(selectedDelivery.id);
      setStatusMsg('Live location sharing stopped.');
      await handleSelectDelivery(selectedDelivery.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmPickup = async () => {
    setError('');
    setStatusMsg('');
    try {
      await deliveryService.confirmPickup(selectedDelivery.id, qrInput);
      setQrInput('');
      setStatusMsg('Pickup confirmed via QR token!');
      await handleSelectDelivery(selectedDelivery.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartTransit = async () => {
    setError('');
    setStatusMsg('');
    try {
      await deliveryService.startTransit(selectedDelivery.id);
      setStatusMsg('Delivery is now IN_TRANSIT.');
      await handleSelectDelivery(selectedDelivery.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmDelivery = async () => {
    setError('');
    setStatusMsg('');
    try {
      await deliveryService.confirmDelivery(selectedDelivery.id, qrInput);
      stopGpsWatch();
      setQrInput('');
      setStatusMsg('Delivery confirmed via QR token! Location sharing stopped.');
      await handleSelectDelivery(selectedDelivery.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Deliveries &amp; Real-Time Tracking
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Coordinate volunteer pickups, live Leaflet/OpenStreetMap tracking, and single-use QR handoffs.
        </p>
      </section>

      {error && <div className="auth-error">{error}</div>}
      {statusMsg && <div className="auth-success">{statusMsg}</div>}

      {/* Volunteer Available Tasks */}
      {user?.role === 'VOLUNTEER' && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Available Delivery Tasks
          </h3>
          {availableTasks.length === 0 ? (
            <div className="card">
              <p>No pending delivery tasks at the moment.</p>
            </div>
          ) : (
            <div className="grid-cards">
              {availableTasks.map((task) => (
                <div key={task.id} className="card">
                  <h4>{task.donation?.title || 'Food Delivery'}</h4>
                  <p style={{ fontSize: '0.88rem', margin: '0.4rem 0' }}>
                    <strong>Pickup:</strong> {task.pickupAddress}
                    <br />
                    <strong>Drop-off:</strong> {task.deliveryAddress}
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => handleAcceptTask(task.id)}
                  >
                    Accept Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Assigned / Active Deliveries Selector */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Your Deliveries
        </h3>
        {loading ? (
          <p>Loading deliveries...</p>
        ) : myDeliveries.length === 0 ? (
          <div className="card">
            <p>No deliveries found for your account.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {myDeliveries.map((d) => (
              <button
                key={d.id}
                type="button"
                className={
                  selectedDelivery?.id === d.id ? 'primary-button' : 'secondary-button'
                }
                onClick={() => handleSelectDelivery(d.id)}
              >
                {d.donation?.title || 'Delivery'} ({d.status})
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Selected Delivery Detail + Map + QR */}
      {selectedDelivery && (
        <div className="card">
          <div className="profile-header">
            <div>
              <h3>{selectedDelivery.donation?.title || 'Delivery Tracking'}</h3>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Pickup: {selectedDelivery.pickupAddress} → Delivery:{' '}
                {selectedDelivery.deliveryAddress}
              </span>
            </div>
            <span className="header-badge">{selectedDelivery.status}</span>
          </div>

          {route && (
            <div className="profile-info-box">
              <strong>Route Provider:</strong> {route.provider} |{' '}
              <strong>Distance:</strong>{' '}
              {route.distanceKm !== null ? `${route.distanceKm} km` : 'Unavailable'} |{' '}
              <strong>Estimated Arrival:</strong>{' '}
              {route.durationMinutes !== null
                ? `${route.durationMinutes} mins`
                : 'Unavailable (fallback mode)'}
              {route.fallbackReason && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {route.fallbackReason}
                </div>
              )}
            </div>
          )}

          <DeliveryMap
            pickup={{
              lat: selectedDelivery.pickupLatitude,
              lng: selectedDelivery.pickupLongitude,
              address: selectedDelivery.pickupAddress,
            }}
            delivery={{
              lat: selectedDelivery.deliveryLatitude,
              lng: selectedDelivery.deliveryLongitude,
              address: selectedDelivery.deliveryAddress,
            }}
            volunteerLocation={{
              isSharing: selectedDelivery.isLocationSharing,
              lat: selectedDelivery.lastVolunteerLat,
              lng: selectedDelivery.lastVolunteerLng,
            }}
            route={route}
          />

          {/* QR Codes for Authorized Donor / NGO */}
          <div style={{ marginTop: '1.5rem' }}>
            {user?.role === 'DONOR' && selectedDelivery.pickupQrToken && (
              <QrCodeDisplay
                title="Pickup Confirmation QR (Show to Volunteer at Pickup)"
                token={selectedDelivery.pickupQrToken}
              />
            )}
            {user?.role === 'NGO' && selectedDelivery.deliveryQrToken && (
              <QrCodeDisplay
                title="Delivery Confirmation QR (Show to Volunteer on Arrival)"
                token={selectedDelivery.deliveryQrToken}
              />
            )}
          </div>

          {/* Volunteer Controls */}
          {user?.role === 'VOLUNTEER' &&
            !['DELIVERY_CONFIRMED', 'CANCELLED'].includes(selectedDelivery.status) && (
              <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div className="profile-info-box" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={gpsConsent}
                      onChange={(e) => setGpsConsent(e.target.checked)}
                    />
                    <span>I consent to share my live GPS location during this delivery</span>
                  </label>

                  {gpsError && <div className="auth-error">{gpsError}</div>}

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleStartLocationSharing}
                    >
                      Start Live Location Sharing
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleStopLocationSharing}
                    >
                      Stop Location Sharing
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Enter scanned QR token"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                    }}
                  />
                  {selectedDelivery.status === 'VOLUNTEER_ASSIGNED' && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleConfirmPickup}
                    >
                      Confirm Pickup (QR)
                    </button>
                  )}
                  {selectedDelivery.status === 'PICKUP_CONFIRMED' && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleStartTransit}
                    >
                      Mark In Transit
                    </button>
                  )}
                  {['PICKUP_CONFIRMED', 'IN_TRANSIT'].includes(
                    selectedDelivery.status
                  ) && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleConfirmDelivery}
                    >
                      Confirm Delivery (QR)
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default DeliveryTrackingPage;
