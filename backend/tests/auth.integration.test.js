const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

// Ensure env vars exist before loading app
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_8_chars';
process.env.JWT_EXPIRES_IN = '1h';

const { prisma } = require('../src/config/database');
const { hashPassword } = require('../src/utils/password');
const app = require('../src/app');

// In-memory mock store for Prisma inside test runner (PostgreSQL is offline in sandbox)
const store = {
  users: [],
  donorProfiles: [],
  ngoProfiles: [],
  volunteerProfiles: [],
};

function attachProfiles(user) {
  if (!user) return null;
  return {
    ...user,
    donorProfile: store.donorProfiles.find((p) => p.userId === user.id) || null,
    ngoProfile: store.ngoProfiles.find((p) => p.userId === user.id) || null,
    volunteerProfile: store.volunteerProfiles.find((p) => p.userId === user.id) || null,
  };
}

// Stub Prisma methods for isolated test execution
prisma.$transaction = async (fn) => fn(prisma);
prisma.user.findUnique = async ({ where, include }) => {
  const user = store.users.find(
    (u) => (where.id && u.id === where.id) || (where.email && u.email === where.email)
  );
  if (!user) return null;
  return include ? attachProfiles(user) : { ...user };
};
prisma.user.findMany = async ({ include }) => {
  return store.users.map((u) => (include ? attachProfiles(u) : { ...u }));
};
prisma.user.create = async ({ data }) => {
  const user = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.users.push(user);
  return { ...user };
};
prisma.user.update = async ({ where, data }) => {
  const idx = store.users.findIndex((u) => u.id === where.id);
  if (idx === -1) throw new Error('User not found');
  store.users[idx] = { ...store.users[idx], ...data, updatedAt: new Date() };
  return { ...store.users[idx] };
};
prisma.donorProfile.create = async ({ data }) => {
  const profile = { id: crypto.randomUUID(), ...data, createdAt: new Date(), updatedAt: new Date() };
  store.donorProfiles.push(profile);
  return profile;
};
prisma.donorProfile.update = async ({ where, data }) => {
  const idx = store.donorProfiles.findIndex((p) => p.userId === where.userId);
  store.donorProfiles[idx] = { ...store.donorProfiles[idx], ...data, updatedAt: new Date() };
  return store.donorProfiles[idx];
};
prisma.nGOProfile.create = async ({ data }) => {
  const profile = { id: crypto.randomUUID(), ...data, createdAt: new Date(), updatedAt: new Date() };
  store.ngoProfiles.push(profile);
  return profile;
};
prisma.nGOProfile.update = async ({ where, data }) => {
  const idx = store.ngoProfiles.findIndex(
    (p) => (where.id && p.id === where.id) || (where.userId && p.userId === where.userId)
  );
  store.ngoProfiles[idx] = { ...store.ngoProfiles[idx], ...data, updatedAt: new Date() };
  return store.ngoProfiles[idx];
};
prisma.volunteerProfile.create = async ({ data }) => {
  const profile = { id: crypto.randomUUID(), ...data, createdAt: new Date(), updatedAt: new Date() };
  store.volunteerProfiles.push(profile);
  return profile;
};
prisma.volunteerProfile.update = async ({ where, data }) => {
  const idx = store.volunteerProfiles.findIndex((p) => p.userId === where.userId);
  store.volunteerProfiles[idx] = { ...store.volunteerProfiles[idx], ...data, updatedAt: new Date() };
  return store.volunteerProfiles[idx];
};

let server;
let baseUrl;
let tokens = {};
let userIds = {};

test.before(async () => {
  // Seed an initial ADMIN user directly (simulating prisma/seed.js)
  const adminHash = await hashPassword('AdminPass123!');
  const admin = {
    id: crypto.randomUUID(),
    email: 'admin@surplusfood.local',
    passwordHash: adminHash,
    fullName: 'System Admin',
    phone: '+15550000000',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.users.push(admin);
  userIds.ADMIN = admin.id;

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

test('1. Register DONOR, NGO, and VOLUNTEER accounts (without exposing passwordHash)', async () => {
  // Donor
  const donorRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'DONOR',
      fullName: 'Alice Donor',
      email: 'donor@example.com',
      password: 'Password123',
      phone: '+15551112222',
      organizationName: 'Green Bistro',
      businessType: 'Restaurant',
      address: '123 Main St',
      latitude: 12.9716,
      longitude: 77.5946,
    }),
  });
  assert.equal(donorRes.status, 201);
  const donorJson = await donorRes.json();
  assert.equal(donorJson.success, true);
  assert.equal(donorJson.data.user.role, 'DONOR');
  assert.equal(donorJson.data.user.passwordHash, undefined);
  assert.equal(donorJson.data.user.donorProfile.organizationName, 'Green Bistro');
  assert.ok(donorRes.headers.get('set-cookie').includes('auth_token='));
  tokens.DONOR = donorJson.data.token;
  userIds.DONOR = donorJson.data.user.id;

  // NGO
  const ngoRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'NGO',
      organizationName: 'Helping Hands NGO',
      contactPerson: 'Bob Manager',
      email: 'ngo@example.com',
      password: 'Password123',
      phone: '+15553334444',
      address: '45 Charity Ave',
      serviceArea: 'North District',
    }),
  });
  assert.equal(ngoRes.status, 201);
  const ngoJson = await ngoRes.json();
  assert.equal(ngoJson.data.user.role, 'NGO');
  assert.equal(ngoJson.data.user.ngoProfile.isVerified, false);
  assert.equal(ngoJson.data.user.passwordHash, undefined);
  tokens.NGO = ngoJson.data.token;
  userIds.NGO = ngoJson.data.user.id;

  // Volunteer
  const volRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'VOLUNTEER',
      fullName: 'Charlie Volunteer',
      email: 'volunteer@example.com',
      password: 'Password123',
      phone: '+15556667777',
      serviceArea: 'Central Zone',
      vehicleType: 'Bike',
      isAvailable: true,
    }),
  });
  assert.equal(volRes.status, 201);
  const volJson = await volRes.json();
  assert.equal(volJson.data.user.role, 'VOLUNTEER');
  assert.equal(volJson.data.user.volunteerProfile.isAvailable, true);
  assert.equal(volJson.data.user.passwordHash, undefined);
  tokens.VOLUNTEER = volJson.data.token;
  userIds.VOLUNTEER = volJson.data.user.id;
});

test('2. Block public ADMIN registration', async () => {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'ADMIN',
      fullName: 'Hacker Admin',
      email: 'hacker@example.com',
      password: 'Password123',
      phone: '+15559999999',
    }),
  });
  assert.equal(res.status, 400);
});

test('3. Prevent duplicate email registration', async () => {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'DONOR',
      fullName: 'Duplicate User',
      email: 'donor@example.com',
      password: 'Password123',
      phone: '+15550001111',
      organizationName: 'Dup Bistro',
      address: '999 Side St',
    }),
  });
  assert.equal(res.status, 409);
  const json = await res.json();
  assert.equal(json.success, false);
});

test('4. Login for every role & reject invalid password', async () => {
  // Invalid password
  const badRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'donor@example.com', password: 'WrongPassword1' }),
  });
  assert.equal(badRes.status, 401);

  // Valid login for all 4 roles
  const logins = [
    ['DONOR', 'donor@example.com', 'Password123'],
    ['NGO', 'ngo@example.com', 'Password123'],
    ['VOLUNTEER', 'volunteer@example.com', 'Password123'],
    ['ADMIN', 'admin@surplusfood.local', 'AdminPass123!'],
  ];

  for (const [role, email, password] of logins) {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.data.user.role, role);
    assert.equal(json.data.user.passwordHash, undefined);
    tokens[role] = json.data.token;
  }
});

test('5. Protected routes: reject unauthenticated, allow authenticated profile get & update', async () => {
  const unauthRes = await fetch(`${baseUrl}/auth/me`);
  assert.equal(unauthRes.status, 401);

  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${tokens.DONOR}` },
  });
  assert.equal(meRes.status, 200);
  const meJson = await meRes.json();
  assert.equal(meJson.data.user.email, 'donor@example.com');
  assert.equal(meJson.data.user.passwordHash, undefined);

  const updateRes = await fetch(`${baseUrl}/auth/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.DONOR}`,
    },
    body: JSON.stringify({ fullName: 'Alice Updated', address: '456 Updated Rd' }),
  });
  assert.equal(updateRes.status, 200);
  const updateJson = await updateRes.json();
  assert.equal(updateJson.data.user.fullName, 'Alice Updated');
  assert.equal(updateJson.data.user.donorProfile.address, '456 Updated Rd');
});

test('6. Role-based authorization: block non-ADMIN from admin routes, allow ADMIN', async () => {
  for (const role of ['DONOR', 'NGO', 'VOLUNTEER']) {
    const res = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${tokens[role]}` },
    });
    assert.equal(res.status, 403, `${role} should receive 403 Forbidden on admin route`);
  }

  const adminRes = await fetch(`${baseUrl}/admin/users`, {
    headers: { Authorization: `Bearer ${tokens.ADMIN}` },
  });
  assert.equal(adminRes.status, 200);
  const adminJson = await adminRes.json();
  assert.equal(adminJson.data.users.length, 4);
  for (const u of adminJson.data.users) {
    assert.equal(u.passwordHash, undefined);
  }
});

test('7. Account status handling: deactivated user cannot log in or access protected routes', async () => {
  const deactivateRes = await fetch(`${baseUrl}/admin/users/${userIds.DONOR}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.ADMIN}`,
    },
    body: JSON.stringify({ isActive: false }),
  });
  assert.equal(deactivateRes.status, 200);

  // Existing token rejected on protected route
  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${tokens.DONOR}` },
  });
  assert.equal(meRes.status, 403);

  // Login rejected
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'donor@example.com', password: 'Password123' }),
  });
  assert.equal(loginRes.status, 403);
});

test('8. Logout clears auth cookie', async () => {
  const res = await fetch(`${baseUrl}/auth/logout`, { method: 'POST' });
  assert.equal(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie.includes('auth_token=;'));
});
