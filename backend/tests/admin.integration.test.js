const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

process.env.NODE_ENV = 'test';
process.env.PORT = '5005';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_8_chars';
process.env.JWT_EXPIRES_IN = '1h';

const { prisma } = require('../src/config/database');
const { signToken } = require('../src/utils/jwt');
const app = require('../src/app');

const store = {
  users: [],
  donorProfiles: [],
  ngoProfiles: [],
  volunteerProfiles: [],
  donations: [],
  deliveries: [],
  verificationRecords: [],
  donationReports: [],
  auditLogs: [],
};

// Stub Prisma methods for isolated test execution
prisma.$transaction = async (fn) => fn(prisma);

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

prisma.user.findMany = async ({ where = {}, skip = 0, take = 20 }) => {
  const filtered = store.users.filter((u) => {
    if (where.role && u.role !== where.role) return false;
    if (where.isActive !== undefined && u.isActive !== where.isActive) return false;
    return true;
  });
  return filtered.slice(skip, skip + take).map((u) => ({
    ...u,
    donorProfile: store.donorProfiles.find((p) => p.userId === u.id) || null,
    ngoProfile: store.ngoProfiles.find((p) => p.userId === u.id) || null,
    volunteerProfile: store.volunteerProfiles.find((p) => p.userId === u.id) || null,
  }));
};

prisma.user.count = async ({ where = {} } = {}) =>
  store.users.filter((u) => (!where.role || u.role === where.role)).length;

prisma.user.update = async ({ where, data }) => {
  const idx = store.users.findIndex((u) => u.id === where.id);
  store.users[idx] = { ...store.users[idx], ...data, updatedAt: new Date() };
  return { ...store.users[idx] };
};

prisma.nGOProfile.findUnique = async ({ where }) =>
  store.ngoProfiles.find((n) => n.id === where.id || n.userId === where.userId) || null;
prisma.nGOProfile.count = async ({ where = {} } = {}) =>
  store.ngoProfiles.filter((n) => !where.verificationStatus || n.verificationStatus === where.verificationStatus).length;
prisma.nGOProfile.update = async ({ where, data }) => {
  const idx = store.ngoProfiles.findIndex((n) => n.id === where.id);
  store.ngoProfiles[idx] = { ...store.ngoProfiles[idx], ...data };
  return store.ngoProfiles[idx];
};

prisma.donorProfile.findUnique = async ({ where }) =>
  store.donorProfiles.find((d) => d.id === where.id || d.userId === where.userId) || null;
prisma.donorProfile.count = async ({ where = {} } = {}) =>
  store.donorProfiles.filter((d) => !where.verificationStatus || d.verificationStatus === where.verificationStatus).length;
prisma.donorProfile.update = async ({ where, data }) => {
  const idx = store.donorProfiles.findIndex((d) => d.id === where.id);
  store.donorProfiles[idx] = { ...store.donorProfiles[idx], ...data };
  return store.donorProfiles[idx];
};

prisma.donation.findUnique = async ({ where }) =>
  store.donations.find((d) => d.id === where.id) || null;
prisma.donation.findMany = async ({ where = {}, skip = 0, take = 20 }) =>
  store.donations
    .filter((d) => (!where.status || d.status === where.status))
    .slice(skip, skip + take)
    .map((d) => ({
      ...d,
      donor: store.donorProfiles.find((dp) => dp.id === d.donorId) || null,
    }));
prisma.donation.count = async ({ where = {} } = {}) =>
  store.donations.filter((d) => {
    if (where.status?.in) return where.status.in.includes(d.status);
    if (where.status) return d.status === where.status;
    return true;
  }).length;
prisma.donation.update = async ({ where, data }) => {
  const idx = store.donations.findIndex((d) => d.id === where.id);
  store.donations[idx] = { ...store.donations[idx], ...data };
  return store.donations[idx];
};

prisma.delivery.findMany = async ({ skip = 0, take = 20 }) =>
  store.deliveries.slice(skip, skip + take);
prisma.delivery.count = async ({ where = {} } = {}) =>
  store.deliveries.filter((d) => !where.status?.in || where.status.in.includes(d.status)).length;

prisma.verificationRecord.create = async ({ data }) => {
  const rec = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
  store.verificationRecords.push(rec);
  return rec;
};
prisma.verificationRecord.findMany = async ({ skip = 0, take = 20 }) =>
  store.verificationRecords.slice(skip, skip + take);
prisma.verificationRecord.count = async () => store.verificationRecords.length;

prisma.donationReport.create = async ({ data }) => {
  const rep = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
  store.donationReports.push(rep);
  return rep;
};
prisma.donationReport.findUnique = async ({ where, include }) => {
  const rep = store.donationReports.find((r) => r.id === where.id);
  if (!rep) return null;
  if (!include) return rep;
  return {
    ...rep,
    donation: store.donations.find((d) => d.id === rep.donationId) || null,
  };
};
prisma.donationReport.findMany = async ({ skip = 0, take = 20 }) =>
  store.donationReports.slice(skip, skip + take);
prisma.donationReport.count = async ({ where = {} } = {}) =>
  store.donationReports.filter((r) => !where.status || r.status === where.status).length;
prisma.donationReport.update = async ({ where, data }) => {
  const idx = store.donationReports.findIndex((r) => r.id === where.id);
  store.donationReports[idx] = { ...store.donationReports[idx], ...data };
  return store.donationReports[idx];
};

prisma.auditLog.create = async ({ data }) => {
  const log = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
  store.auditLogs.push(log);
  return log;
};
prisma.auditLog.findMany = async ({ skip = 0, take = 20 }) =>
  store.auditLogs.slice(skip, skip + take);
prisma.auditLog.count = async () => store.auditLogs.length;

prisma.notification.create = async ({ data }) => ({
  id: crypto.randomUUID(),
  ...data,
  createdAt: new Date(),
});

let server;
let baseUrl;
let adminToken;
let donorToken;
let ngoToken;
let ngoProfileId;
let donorProfileId;
let donorUserId;
let donationId;

test.before(async () => {
  const adminId = crypto.randomUUID();
  donorUserId = crypto.randomUUID();
  const ngoUserId = crypto.randomUUID();
  const volUserId = crypto.randomUUID();

  donorProfileId = crypto.randomUUID();
  ngoProfileId = crypto.randomUUID();

  store.users.push(
    { id: adminId, email: 'admin@sys.com', fullName: 'Admin', role: 'ADMIN', isActive: true, passwordHash: 'secret' },
    { id: donorUserId, email: 'donor@sys.com', fullName: 'Donor', role: 'DONOR', isActive: true, passwordHash: 'secret' },
    { id: ngoUserId, email: 'ngo@sys.com', fullName: 'NGO', role: 'NGO', isActive: true, passwordHash: 'secret' },
    { id: volUserId, email: 'vol@sys.com', fullName: 'Volunteer', role: 'VOLUNTEER', isActive: true, passwordHash: 'secret' }
  );

  store.donorProfiles.push({
    id: donorProfileId,
    userId: donorUserId,
    organizationName: 'Bistro',
    verificationStatus: 'PENDING',
    isVerified: false,
  });

  store.ngoProfiles.push({
    id: ngoProfileId,
    userId: ngoUserId,
    organizationName: 'Care NGO',
    verificationStatus: 'PENDING',
    isVerified: false,
  });

  store.volunteerProfiles.push({ id: crypto.randomUUID(), userId: volUserId });

  donationId = crypto.randomUUID();
  store.donations.push({
    id: donationId,
    donorId: donorProfileId,
    title: 'Rice Trays',
    foodCategory: 'Cooked Meals',
    quantity: 20,
    unit: 'servings',
    status: 'AVAILABLE',
    expiresAt: new Date(Date.now() + 3600000),
  });

  adminToken = signToken({ userId: adminId, role: 'ADMIN' });
  donorToken = signToken({ userId: donorUserId, role: 'DONOR' });
  ngoToken = signToken({ userId: ngoUserId, role: 'NGO' });

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}/api/v1`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('1. Non-admin users are blocked from all admin endpoints (403 Forbidden)', async () => {
  const adminEndpoints = [
    ['GET', '/admin/dashboard'],
    ['GET', '/admin/users'],
    ['PATCH', `/admin/ngos/${ngoProfileId}/verify`],
    ['PATCH', `/admin/donors/${donorProfileId}/verify`],
    ['GET', '/admin/verifications/history'],
    ['GET', '/admin/reports'],
    ['GET', '/admin/donations'],
    ['GET', '/admin/deliveries'],
    ['GET', '/admin/audit-logs'],
  ];

  for (const [method, path] of adminEndpoints) {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
      body: method === 'PATCH' ? JSON.stringify({ status: 'APPROVED' }) : undefined,
    });
    assert.equal(res.status, 403, `Expected 403 for NGO on ${method} ${path}`);
  }
});

test('2. Admin views dashboard metrics and paginated users (without passwordHash)', async () => {
  const dashRes = await fetch(`${baseUrl}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(dashRes.status, 200);
  const dashJson = await dashRes.json();
  assert.equal(dashJson.data.stats.totalUsers, 4);
  assert.equal(dashJson.data.stats.availableDonations, 1);
  assert.equal(dashJson.data.stats.pendingVerifications, 2);

  const usersRes = await fetch(`${baseUrl}/admin/users?page=1&limit=2&role=NGO`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(usersRes.status, 200);
  const usersJson = await usersRes.json();
  assert.equal(usersJson.data.users.length, 1);
  assert.equal(usersJson.data.users[0].passwordHash, undefined);
  assert.equal(usersJson.data.pagination.page, 1);
});

test('3. Admin approves NGO & rejects Donor with verification notes and history', async () => {
  const ngoRes = await fetch(`${baseUrl}/admin/ngos/${ngoProfileId}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'APPROVED',
      notes: 'Registration certificate verified',
    }),
  });
  assert.equal(ngoRes.status, 200);
  assert.equal((await ngoRes.json()).data.ngoProfile.isVerified, true);

  const donorRes = await fetch(`${baseUrl}/admin/donors/${donorProfileId}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'REJECTED',
      notes: 'Incomplete business address',
    }),
  });
  assert.equal(donorRes.status, 200);
  assert.equal((await donorRes.json()).data.donorProfile.verificationStatus, 'REJECTED');

  const histRes = await fetch(`${baseUrl}/admin/verifications/history`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(histRes.status, 200);
  assert.equal((await histRes.json()).data.records.length, 2);
});

test('4. NGO reports unsafe donation; Admin reviews, cancels donation, and logs audit trail', async () => {
  const repRes = await fetch(`${baseUrl}/donations/${donationId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngoToken}`,
    },
    body: JSON.stringify({
      reason: 'Packaging damaged',
      details: 'Seal broken during inspection',
    }),
  });
  assert.equal(repRes.status, 201);
  const reportId = (await repRes.json()).data.report.id;

  const reviewRes = await fetch(`${baseUrl}/admin/reports/${reportId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'ACTION_TAKEN',
      adminNotes: 'Cancelled donation due to packaging issue',
      cancelDonation: true,
    }),
  });
  assert.equal(reviewRes.status, 200);
  assert.equal(store.donations[0].status, 'CANCELLED');

  // Verify audit logs recorded all admin actions
  const logsRes = await fetch(`${baseUrl}/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(logsRes.status, 200);
  const logsJson = await logsRes.json();
  assert.ok(logsJson.data.logs.length >= 3);
});
