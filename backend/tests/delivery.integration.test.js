const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const { io: ioClient } = require('socket.io-client');

process.env.NODE_ENV = 'test';
process.env.PORT = '5004';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_8_chars';
process.env.JWT_EXPIRES_IN = '1h';

const { prisma } = require('../src/config/database');
const { signToken } = require('../src/utils/jwt');
const routingService = require('../src/services/routing.service');
const { initializeSocketIO } = require('../src/sockets/deliverySocket');
const app = require('../src/app');

const store = {
  users: [],
  donorProfiles: [],
  ngoProfiles: [],
  volunteerProfiles: [],
  donations: [],
  donationRequests: [],
  deliveries: [],
};

// Stub Prisma methods for isolated test execution
prisma.$transaction = async (arg) => {
  if (typeof arg === 'function') return arg(prisma);
  return Promise.all(arg);
};

prisma.user.findUnique = async ({ where, include }) => {
  const user = store.users.find((u) => u.id === where.id || u.email === where.email);
  if (!user) return null;
  if (!include) return { ...user };
  return {
    ...user,
    donorProfile: store.donorProfiles.find((p) => p.userId === user.id) || null,
    ngoProfile: store.ngoProfiles.find((p) => p.userId === user.id) || null,
    volunteerProfile: store.volunteerProfiles.find((p) => p.userId === user.id) || null,
  };
};

prisma.donorProfile.findUnique = async ({ where }) =>
  store.donorProfiles.find((p) => p.userId === where.userId || p.id === where.id) || null;
prisma.nGOProfile.findUnique = async ({ where }) =>
  store.ngoProfiles.find((p) => p.userId === where.userId || p.id === where.id) || null;
prisma.volunteerProfile.findUnique = async ({ where }) =>
  store.volunteerProfiles.find((p) => p.userId === where.userId || p.id === where.id) || null;
prisma.volunteerProfile.update = async ({ where, data }) => {
  const idx = store.volunteerProfiles.findIndex((v) => v.id === where.id);
  store.volunteerProfiles[idx] = { ...store.volunteerProfiles[idx], ...data };
  return store.volunteerProfiles[idx];
};

prisma.donation.findUnique = async ({ where, include }) => {
  const d = store.donations.find((item) => item.id === where.id);
  if (!d) return null;
  if (!include) return { ...d };
  return {
    ...d,
    requests: store.donationRequests.filter(
      (r) =>
        r.donationId === d.id &&
        (!include.requests?.where?.ngoId || r.ngoId === include.requests.where.ngoId) &&
        (!include.requests?.where?.status || r.status === include.requests.where.status)
    ),
    delivery: store.deliveries.find((del) => del.donationId === d.id) || null,
  };
};
prisma.donation.update = async ({ where, data }) => {
  const idx = store.donations.findIndex((d) => d.id === where.id);
  store.donations[idx] = { ...store.donations[idx], ...data };
  return store.donations[idx];
};

prisma.delivery.create = async ({ data }) => {
  const del = {
    id: crypto.randomUUID(),
    volunteerId: null,
    pickupQrUsedAt: null,
    deliveryQrUsedAt: null,
    isLocationSharing: false,
    lastVolunteerLat: null,
    lastVolunteerLng: null,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.deliveries.push(del);
  return { ...del };
};

prisma.delivery.findUnique = async ({ where, include }) => {
  const del = store.deliveries.find((d) => d.id === where.id);
  if (!del) return null;
  if (!include) return { ...del };
  const donation = store.donations.find((don) => don.id === del.donationId) || null;
  const donor = donation
    ? store.donorProfiles.find((dp) => dp.id === donation.donorId) || null
    : null;
  const volunteer = del.volunteerId
    ? store.volunteerProfiles.find((vp) => vp.id === del.volunteerId) || null
    : null;
  return {
    ...del,
    donation: donation ? { ...donation, donor } : null,
    volunteer: volunteer
      ? { ...volunteer, user: store.users.find((u) => u.id === volunteer.userId) }
      : null,
  };
};

prisma.delivery.findMany = async ({ where = {} }) => {
  return store.deliveries
    .filter((d) => {
      if (where.status && d.status !== where.status) return false;
      if (where.volunteerId !== undefined && d.volunteerId !== where.volunteerId) return false;
      if (where.ngoId && d.ngoId !== where.ngoId) return false;
      return true;
    })
    .map((d) => ({
      ...d,
      donation: store.donations.find((don) => don.id === d.donationId) || null,
    }));
};

prisma.delivery.update = async ({ where, data }) => {
  const idx = store.deliveries.findIndex((d) => d.id === where.id);
  store.deliveries[idx] = { ...store.deliveries[idx], ...data, updatedAt: new Date() };
  return { ...store.deliveries[idx] };
};

prisma.delivery.updateMany = async ({ where, data }) => {
  let count = 0;
  for (let i = 0; i < store.deliveries.length; i++) {
    const d = store.deliveries[i];
    if (where.id && d.id !== where.id) continue;
    if (where.status && d.status !== where.status) continue;
    if (where.volunteerId !== undefined && d.volunteerId !== where.volunteerId) continue;
    store.deliveries[i] = { ...d, ...data, updatedAt: new Date() };
    count++;
  }
  return { count };
};

let server;
let baseUrl;
let socketBaseUrl;
let donorToken;
let ngoToken;
let otherNgoToken;
let vol1Token;
let vol2Token;
let donationId;
let deliveryId;

test.before(async () => {
  const donorUserId = crypto.randomUUID();
  const ngoUserId = crypto.randomUUID();
  const otherNgoUserId = crypto.randomUUID();
  const vol1UserId = crypto.randomUUID();
  const vol2UserId = crypto.randomUUID();

  store.users.push(
    { id: donorUserId, email: 'donor@d.com', fullName: 'Donor', role: 'DONOR', isActive: true },
    { id: ngoUserId, email: 'ngo@n.com', fullName: 'NGO 1', role: 'NGO', isActive: true },
    { id: otherNgoUserId, email: 'other@n.com', fullName: 'NGO 2', role: 'NGO', isActive: true },
    { id: vol1UserId, email: 'v1@v.com', fullName: 'Volunteer 1', role: 'VOLUNTEER', isActive: true },
    { id: vol2UserId, email: 'v2@v.com', fullName: 'Volunteer 2', role: 'VOLUNTEER', isActive: true }
  );

  const donorProfileId = crypto.randomUUID();
  const ngoProfileId = crypto.randomUUID();
  const otherNgoProfileId = crypto.randomUUID();

  store.donorProfiles.push({
    id: donorProfileId,
    userId: donorUserId,
    organizationName: 'Bistro',
    address: '100 Main St',
    latitude: 12.9716,
    longitude: 77.5946,
  });

  store.ngoProfiles.push(
    {
      id: ngoProfileId,
      userId: ngoUserId,
      organizationName: 'Care NGO',
      address: '200 Oak St',
      latitude: 12.9816,
      longitude: 77.6046,
      isVerified: true,
    },
    {
      id: otherNgoProfileId,
      userId: otherNgoUserId,
      organizationName: 'Other NGO',
      address: '300 Pine St',
      isVerified: true,
    }
  );

  store.volunteerProfiles.push(
    { id: crypto.randomUUID(), userId: vol1UserId, isAvailable: true },
    { id: crypto.randomUUID(), userId: vol2UserId, isAvailable: true }
  );

  donationId = crypto.randomUUID();
  store.donations.push({
    id: donationId,
    donorId: donorProfileId,
    title: 'Hot Meals',
    foodCategory: 'Cooked Meals',
    quantity: 30,
    unit: 'servings',
    pickupAddress: '100 Main St',
    latitude: 12.9716,
    longitude: 77.5946,
    status: 'ACCEPTED',
    expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
  });

  store.donationRequests.push({
    id: crypto.randomUUID(),
    donationId,
    ngoId: ngoProfileId,
    status: 'APPROVED',
  });

  donorToken = signToken({ userId: donorUserId, role: 'DONOR' });
  ngoToken = signToken({ userId: ngoUserId, role: 'NGO' });
  otherNgoToken = signToken({ userId: otherNgoUserId, role: 'NGO' });
  vol1Token = signToken({ userId: vol1UserId, role: 'VOLUNTEER' });
  vol2Token = signToken({ userId: vol2UserId, role: 'VOLUNTEER' });

  server = http.createServer(app);
  initializeSocketIO(server);

  await new Promise((resolve) => {
    server.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}/api/v1`;
      socketBaseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('1. NGO requests volunteer & two volunteers attempt to accept the same task', async () => {
  const reqVolRes = await fetch(
    `${baseUrl}/deliveries/donations/${donationId}/request-volunteer`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
      body: JSON.stringify({ notes: 'Please bring insulated bag' }),
    }
  );
  assert.equal(reqVolRes.status, 201);
  const reqVolJson = await reqVolRes.json();
  deliveryId = reqVolJson.data.delivery.id;
  assert.equal(reqVolJson.data.delivery.status, 'PENDING_VOLUNTEER');
  // NGO must not see donor's pickupQrToken
  assert.equal(reqVolJson.data.delivery.pickupQrToken, undefined);

  // Volunteer 1 sees available task
  const availRes = await fetch(`${baseUrl}/deliveries/available`, {
    headers: { Authorization: `Bearer ${vol1Token}` },
  });
  assert.equal(availRes.status, 200);
  const availJson = await availRes.json();
  assert.equal(availJson.data.tasks.length, 1);

  // Volunteer 1 accepts task
  const accept1 = await fetch(`${baseUrl}/deliveries/${deliveryId}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${vol1Token}` },
  });
  assert.equal(accept1.status, 200);
  assert.equal((await accept1.json()).data.delivery.status, 'VOLUNTEER_ASSIGNED');

  // Volunteer 2 tries to accept same task -> 409 Conflict
  const accept2 = await fetch(`${baseUrl}/deliveries/${deliveryId}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${vol2Token}` },
  });
  assert.equal(accept2.status, 409);
});

test('2. Live location updates, consent check, Socket.IO broadcast, and unauthorized access block', async () => {
  // Missing consent (or GPS permission denial) -> 400
  const noConsentRes = await fetch(`${baseUrl}/deliveries/${deliveryId}/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${vol1Token}`,
    },
    body: JSON.stringify({ latitude: 12.975, longitude: 77.599, consentGranted: false }),
  });
  assert.equal(noConsentRes.status, 400);

  // Unauthorized NGO trying to read delivery details -> 403
  const unauthHttp = await fetch(`${baseUrl}/deliveries/${deliveryId}`, {
    headers: { Authorization: `Bearer ${otherNgoToken}` },
  });
  assert.equal(unauthHttp.status, 403);

  // Connect authorized NGO socket and unauthorized NGO socket
  const ngoSocket = ioClient(socketBaseUrl, { auth: { token: ngoToken } });
  const unauthSocket = ioClient(socketBaseUrl, { auth: { token: otherNgoToken } });

  await new Promise((resolve) => ngoSocket.on('connect', resolve));
  await new Promise((resolve) => unauthSocket.on('connect', resolve));

  const joinedPromise = new Promise((resolve) => ngoSocket.once('delivery:joined', resolve));
  const deniedPromise = new Promise((resolve) => unauthSocket.once('delivery:error', resolve));

  ngoSocket.emit('delivery:join', { deliveryId });
  unauthSocket.emit('delivery:join', { deliveryId });

  await joinedPromise;
  const deniedErr = await deniedPromise;
  assert.ok(deniedErr.message.includes('not authorized'));

  // Listen for live location update on authorized NGO socket
  const locPromise = new Promise((resolve) =>
    ngoSocket.once('delivery:location_updated', resolve)
  );

  const locRes = await fetch(`${baseUrl}/deliveries/${deliveryId}/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${vol1Token}`,
    },
    body: JSON.stringify({ latitude: 12.975, longitude: 77.599, consentGranted: true }),
  });
  assert.equal(locRes.status, 200);

  const socketLoc = await locPromise;
  assert.equal(socketLoc.latitude, 12.975);
  assert.equal(socketLoc.longitude, 77.599);

  // Stop location sharing
  const stopRes = await fetch(`${baseUrl}/deliveries/${deliveryId}/location/stop`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${vol1Token}` },
  });
  assert.equal(stopRes.status, 200);
  assert.equal((await stopRes.json()).data.isLocationSharing, false);

  ngoSocket.disconnect();
  unauthSocket.disconnect();
});

test('3. QR pickup & delivery confirmation, token validation, and replay prevention', async () => {
  // Reject using donationId as QR token
  const fakeQrRes = await fetch(`${baseUrl}/deliveries/${deliveryId}/confirm-pickup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${vol1Token}`,
    },
    body: JSON.stringify({ token: donationId }),
  });
  assert.equal(fakeQrRes.status, 400);

  // Donor gets pickupQrToken
  const donorDetail = await (
    await fetch(`${baseUrl}/deliveries/${deliveryId}`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    })
  ).json();
  const pickupToken = donorDetail.data.delivery.pickupQrToken;
  assert.ok(pickupToken && pickupToken.length >= 32);

  // Volunteer confirms pickup with real token
  const pickupRes = await fetch(`${baseUrl}/deliveries/${deliveryId}/confirm-pickup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${vol1Token}`,
    },
    body: JSON.stringify({ token: pickupToken }),
  });
  assert.equal(pickupRes.status, 200);
  assert.equal((await pickupRes.json()).data.delivery.status, 'PICKUP_CONFIRMED');

  // Replay pickup token -> 409 Conflict
  const replayPickup = await fetch(`${baseUrl}/deliveries/${deliveryId}/confirm-pickup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${vol1Token}`,
    },
    body: JSON.stringify({ token: pickupToken }),
  });
  assert.equal(replayPickup.status, 409);

  // Start transit
  const transitRes = await fetch(`${baseUrl}/deliveries/${deliveryId}/start-transit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${vol1Token}` },
  });
  assert.equal(transitRes.status, 200);
  assert.equal((await transitRes.json()).data.delivery.status, 'IN_TRANSIT');

  // NGO gets deliveryQrToken
  const ngoDetail = await (
    await fetch(`${baseUrl}/deliveries/${deliveryId}`, {
      headers: { Authorization: `Bearer ${ngoToken}` },
    })
  ).json();
  const deliveryToken = ngoDetail.data.delivery.deliveryQrToken;
  assert.ok(deliveryToken && deliveryToken.length >= 32);

  // Volunteer confirms delivery
  const deliverRes = await fetch(`${baseUrl}/deliveries/${deliveryId}/confirm-delivery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${vol1Token}`,
    },
    body: JSON.stringify({ token: deliveryToken }),
  });
  assert.equal(deliverRes.status, 200);
  const deliverJson = await deliverRes.json();
  assert.equal(deliverJson.data.delivery.status, 'DELIVERY_CONFIRMED');
  assert.equal(deliverJson.data.delivery.isLocationSharing, false);

  // Replay delivery token -> 409 Conflict
  const replayDelivery = await fetch(
    `${baseUrl}/deliveries/${deliveryId}/confirm-delivery`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vol1Token}`,
      },
      body: JSON.stringify({ token: deliveryToken }),
    }
  );
  assert.equal(replayDelivery.status, 409);
});

test('4. Routing service failure triggers graceful straight-line fallback', async () => {
  const failingFetch = async () => {
    throw new Error('Network unreachable');
  };

  const fallbackRoute = await routingService.getRoute(
    { lat: 12.9716, lng: 77.5946 },
    { lat: 12.9816, lng: 77.6046 },
    failingFetch
  );

  assert.equal(fallbackRoute.available, false);
  assert.equal(fallbackRoute.provider, 'FALLBACK');
  assert.equal(fallbackRoute.durationMinutes, null);
  assert.equal(fallbackRoute.geometry.length, 2);
  assert.ok(fallbackRoute.distanceKm > 0);
  assert.ok(fallbackRoute.fallbackReason.includes('unavailable'));
});
