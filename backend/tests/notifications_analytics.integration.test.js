const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const { io: ioClient } = require('socket.io-client');

process.env.NODE_ENV = 'test';
process.env.PORT = '5006';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_8_chars';
process.env.JWT_EXPIRES_IN = '1h';

const { prisma } = require('../src/config/database');
const { signToken } = require('../src/utils/jwt');
const { initializeSocketIO } = require('../src/sockets/deliverySocket');
const notificationService = require('../src/services/notification.service');
const app = require('../src/app');

const store = {
  users: [],
  donorProfiles: [],
  ngoProfiles: [],
  volunteerProfiles: [],
  donations: [],
  donationRequests: [],
  deliveries: [],
  notifications: [],
  recommendationFeedback: [],
};

// Stub Prisma methods for isolated test execution
prisma.user.findUnique = async ({ where, include, select }) => {
  const user = store.users.find((u) => u.id === where.id || u.email === where.email);
  if (!user) return null;
  if (select?.notificationPreferences) {
    return { notificationPreferences: user.notificationPreferences || null };
  }
  if (!include) return { ...user };
  return {
    ...user,
    donorProfile: store.donorProfiles.find((p) => p.userId === user.id) || null,
    ngoProfile: store.ngoProfiles.find((p) => p.userId === user.id) || null,
    volunteerProfile: store.volunteerProfiles.find((p) => p.userId === user.id) || null,
  };
};
prisma.user.update = async ({ where, data }) => {
  const idx = store.users.findIndex((u) => u.id === where.id);
  store.users[idx] = { ...store.users[idx], ...data };
  return store.users[idx];
};

prisma.donorProfile.findUnique = async ({ where }) =>
  store.donorProfiles.find((p) => p.userId === where.userId || p.id === where.id) || null;
prisma.nGOProfile.findUnique = async ({ where }) =>
  store.ngoProfiles.find((p) => p.userId === where.userId || p.id === where.id) || null;
prisma.nGOProfile.count = async () =>
  store.ngoProfiles.filter((n) => n.isVerified).length;
prisma.volunteerProfile.findUnique = async ({ where }) =>
  store.volunteerProfiles.find((p) => p.userId === where.userId || p.id === where.id) || null;
prisma.volunteerProfile.count = async () =>
  store.volunteerProfiles.filter((v) => v.isAvailable).length;

prisma.donation.findMany = async ({ where = {} } = {}) =>
  store.donations.filter((d) => (!where.donorId || d.donorId === where.donorId));
prisma.donation.aggregate = async ({ where = {} }) => {
  const matching = store.donations.filter((d) => {
    if (where.status?.not && d.status === where.status.not) return false;
    if (typeof where.status === 'string' && d.status !== where.status) return false;
    return true;
  });
  return {
    _sum: { quantity: matching.reduce((acc, d) => acc + d.quantity, 0) },
  };
};
prisma.donation.count = async ({ where = {} } = {}) =>
  store.donations.filter((d) => !where.status || d.status === where.status).length;
prisma.donation.groupBy = async () => {
  const map = new Map();
  for (const d of store.donations) {
    if (d.status === 'CANCELLED') continue;
    const prev = map.get(d.foodCategory) || { foodCategory: d.foodCategory, _sum: { quantity: 0 }, _count: { id: 0 } };
    prev._sum.quantity += d.quantity;
    prev._count.id += 1;
    map.set(d.foodCategory, prev);
  }
  return Array.from(map.values());
};

prisma.donationRequest.findMany = async ({ where = {} } = {}) =>
  store.donationRequests.filter((r) => !where.ngoId || r.ngoId === where.ngoId);
prisma.delivery.findMany = async () => store.deliveries;
prisma.recommendationFeedback.findMany = async () => store.recommendationFeedback;

prisma.notification.create = async ({ data }) => {
  const n = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
  store.notifications.push(n);
  return n;
};
prisma.notification.findMany = async ({ where = {}, skip = 0, take = 20 }) =>
  store.notifications
    .filter((n) => n.userId === where.userId && (where.isRead === undefined || n.isRead === where.isRead))
    .slice(skip, skip + take);
prisma.notification.count = async ({ where = {} }) =>
  store.notifications.filter(
    (n) => n.userId === where.userId && (where.isRead === undefined || n.isRead === where.isRead)
  ).length;
prisma.notification.findUnique = async ({ where }) =>
  store.notifications.find((n) => n.id === where.id) || null;
prisma.notification.update = async ({ where, data }) => {
  const idx = store.notifications.findIndex((n) => n.id === where.id);
  store.notifications[idx] = { ...store.notifications[idx], ...data };
  return store.notifications[idx];
};
prisma.notification.updateMany = async ({ where, data }) => {
  let count = 0;
  for (let i = 0; i < store.notifications.length; i++) {
    if (store.notifications[i].userId === where.userId && !store.notifications[i].isRead) {
      store.notifications[i] = { ...store.notifications[i], ...data };
      count++;
    }
  }
  return { count };
};

let server;
let baseUrl;
let socketBaseUrl;
let donorToken;
let ngoToken;
let volToken;
let donorUserId;

test.before(async () => {
  donorUserId = crypto.randomUUID();
  const ngoUserId = crypto.randomUUID();
  const volUserId = crypto.randomUUID();

  store.users.push(
    { id: donorUserId, email: 'd@test.com', fullName: 'Donor', role: 'DONOR', isActive: true },
    { id: ngoUserId, email: 'n@test.com', fullName: 'NGO', role: 'NGO', isActive: true },
    { id: volUserId, email: 'v@test.com', fullName: 'Volunteer', role: 'VOLUNTEER', isActive: true }
  );

  const donorProfileId = crypto.randomUUID();
  const ngoProfileId = crypto.randomUUID();

  store.donorProfiles.push({ id: donorProfileId, userId: donorUserId, organizationName: 'Bistro' });
  store.ngoProfiles.push({
    id: ngoProfileId,
    userId: ngoUserId,
    organizationName: 'Care NGO',
    isVerified: true,
    user: { isActive: true },
  });
  store.volunteerProfiles.push({ id: crypto.randomUUID(), userId: volUserId, isAvailable: true });

  store.donations.push(
    {
      id: crypto.randomUUID(),
      donorId: donorProfileId,
      title: 'Cooked Meals',
      foodCategory: 'Cooked Meals',
      quantity: 40,
      unit: 'servings',
      status: 'DELIVERED',
      expiresAt: new Date(Date.now() + 5 * 3600000),
    },
    {
      id: crypto.randomUUID(),
      donorId: donorProfileId,
      title: 'Fresh Bread',
      foodCategory: 'Bakery',
      quantity: 20,
      unit: 'loaves',
      status: 'AVAILABLE',
      expiresAt: new Date(Date.now() + 5 * 3600000),
    }
  );

  donorToken = signToken({ userId: donorUserId, role: 'DONOR' });
  ngoToken = signToken({ userId: ngoUserId, role: 'NGO' });
  volToken = signToken({ userId: volUserId, role: 'VOLUNTEER' });

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

test('1. Real-time Socket.IO & persistent notifications, read state, and preferences', async () => {
  const socket = ioClient(socketBaseUrl, { auth: { token: donorToken } });
  await new Promise((resolve) => socket.on('connect', resolve));

  const notifPromise = new Promise((resolve) =>
    socket.once('notification:new', resolve)
  );

  await notificationService.createNotification({
    userId: donorUserId,
    type: 'REQUEST_RECEIVED',
    title: 'New Request',
    message: 'Care NGO requested Fresh Bread.',
  });

  const liveNotif = await notifPromise;
  assert.equal(liveNotif.title, 'New Request');
  socket.disconnect();

  // List & unread count
  const listRes = await fetch(`${baseUrl}/notifications`, {
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  assert.equal(listRes.status, 200);
  const listJson = await listRes.json();
  assert.equal(listJson.data.unreadCount, 1);

  // Mark as read
  const readRes = await fetch(`${baseUrl}/notifications/${liveNotif.id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  assert.equal(readRes.status, 200);

  // Preferences: opt out of expiryAlerts
  const prefRes = await fetch(`${baseUrl}/notifications/preferences`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${donorToken}`,
    },
    body: JSON.stringify({ expiryAlerts: false }),
  });
  assert.equal(prefRes.status, 200);

  const skipped = await notificationService.createNotification({
    userId: donorUserId,
    type: 'DONATION_EXPIRING_SOON',
    title: 'Expiring Soon',
    message: 'Should be skipped due to preference',
  });
  assert.equal(skipped, null);
});

test('2. Role-specific dashboards enforce role isolation', async () => {
  const donorDash = await fetch(`${baseUrl}/dashboards/donor`, {
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  assert.equal(donorDash.status, 200);
  const donorJson = await donorDash.json();
  assert.equal(donorJson.data.dashboard.summary.completedCount, 1);
  assert.equal(donorJson.data.dashboard.summary.activeCount, 1);

  const forbiddenNgo = await fetch(`${baseUrl}/dashboards/donor`, {
    headers: { Authorization: `Bearer ${ngoToken}` },
  });
  assert.equal(forbiddenNgo.status, 403);

  const ngoDash = await fetch(`${baseUrl}/dashboards/ngo`, {
    headers: { Authorization: `Bearer ${ngoToken}` },
  });
  assert.equal(ngoDash.status, 200);

  const volDash = await fetch(`${baseUrl}/dashboards/volunteer`, {
    headers: { Authorization: `Bearer ${volToken}` },
  });
  assert.equal(volDash.status, 200);
});

test('3. Impact analytics aggregates directly from database records', async () => {
  const res = await fetch(`${baseUrl}/analytics/impact`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.data.analytics.totalFoodDonated, 60);
  assert.equal(json.data.analytics.totalFoodDelivered, 40);
  assert.equal(json.data.analytics.completedDonationsCount, 1);
  assert.equal(json.data.analytics.participatingNgosCount, 1);
  assert.equal(json.data.analytics.activeVolunteersCount, 1);
  assert.equal(json.data.analytics.categoryBreakdown.length, 2);
});
