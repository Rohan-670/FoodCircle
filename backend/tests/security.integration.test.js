const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.PORT = '5006';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_8_chars';
process.env.JWT_EXPIRES_IN = '1h';

const { prisma } = require('../src/config/database');
const app = require('../src/app');

// In-memory store for isolated security tests
const store = {
  users: [
    {
      id: 'donor-user-1',
      email: 'donor@example.com',
      passwordHash: 'hashed',
      role: 'DONOR',
      isActive: true,
      donorProfile: { id: 'donor-prof-1', userId: 'donor-user-1', organizationName: 'Donor Corp' },
    },
    {
      id: 'vol-user-1',
      email: 'volunteer@example.com',
      passwordHash: 'hashed',
      role: 'VOLUNTEER',
      isActive: true,
      volunteerProfile: { id: 'vol-prof-1', userId: 'vol-user-1' },
    },
    {
      id: 'admin-user-1',
      email: 'admin@example.com',
      passwordHash: 'hashed',
      role: 'ADMIN',
      isActive: true,
    },
  ],
  donations: [],
};

// Stub Prisma methods for isolated execution without a live DB
prisma.$queryRaw = async () => [{ 1: 1 }];
prisma.$transaction = async (fn) => fn(prisma);
prisma.user.findUnique = async ({ where, include }) => {
  const user = store.users.find((u) => u.id === where.id || u.email === where.email);
  if (!user) return null;
  return { ...user };
};
prisma.donorProfile.findUnique = async ({ where }) => {
  return store.users.find((u) => u.id === where.userId)?.donorProfile || null;
};
prisma.volunteerProfile.findUnique = async ({ where }) => {
  return store.users.find((u) => u.id === where.userId)?.volunteerProfile || null;
};

function createTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((res) => server.close(res)),
      });
    });
  });
}

test('Security & Boundary Enforcement Suite', async (t) => {
  const { server, baseUrl, close } = await createTestServer();

  t.after(async () => {
    await close();
  });

  await t.test('1. Enforces mandatory HTTP security headers on all responses', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);

    // Verify security headers
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');

    // Verify x-powered-by header is hidden
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  await t.test('2. Rejects forged, unsigned, or tampered JWT tokens', async () => {
    // 2a. Forged token with invalid signature
    const forgedToken = jwt.sign(
      { userId: 'admin-user-1', role: 'ADMIN' },
      'wrong-secret-key-1234567890'
    );
    const res1 = await fetch(`${baseUrl}/api/v1/admin/dashboard`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.equal(res1.status, 401);
    const body1 = await res1.json();
    assert.equal(body1.success, false);

    // 2b. Malformed token string
    const res2 = await fetch(`${baseUrl}/api/v1/admin/dashboard`, {
      headers: { Authorization: 'Bearer totally.invalid.token' },
    });
    assert.equal(res2.status, 401);

    // 2c. Expired token
    const expiredToken = jwt.sign(
      { userId: 'admin-user-1', role: 'ADMIN' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const res3 = await fetch(`${baseUrl}/api/v1/admin/dashboard`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(res3.status, 401);
  });

  await t.test('3. Enforces strict role boundary isolation (RBAC)', async () => {
    const donorToken = jwt.sign(
      { userId: 'donor-user-1', role: 'DONOR' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const volunteerToken = jwt.sign(
      { userId: 'vol-user-1', role: 'VOLUNTEER' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Donor cannot access volunteer endpoints (403 Forbidden)
    const volRes = await fetch(`${baseUrl}/api/v1/deliveries/available`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert.equal(volRes.status, 403);

    // Volunteer cannot create donations (403 Forbidden - DONOR role required)
    const createDonationRes = await fetch(`${baseUrl}/api/v1/donations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${volunteerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Unauthorized Batch',
        foodCategory: 'Cooked',
        quantity: 10,
        unit: 'servings',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        pickupAddress: '123 Fake Street',
        packagingInfo: 'Boxes',
        storageRequirements: 'Keep warm',
      }),
    });
    assert.equal(createDonationRes.status, 403);

    // Donor cannot access admin audit logs (403 Forbidden - ADMIN role required)
    const adminRes = await fetch(`${baseUrl}/api/v1/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert.equal(adminRes.status, 403);
  });

  await t.test('4. Rejects injection & invalid payload shapes cleanly with 400 Bad Request', async () => {
    const donorToken = jwt.sign(
      { userId: 'donor-user-1', role: 'DONOR' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Negative quantity rejection
    const resNegativeQty = await fetch(`${baseUrl}/api/v1/donations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${donorToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Batch',
        foodCategory: 'Cooked',
        quantity: -50,
        unit: 'kg',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        pickupAddress: '42 Main St',
        packagingInfo: 'Boxes',
        storageRequirements: 'Keep cool',
      }),
    });
    assert.equal(resNegativeQty.status, 400);
    const body = await resNegativeQty.json();
    assert.equal(body.success, false);
    assert.ok(
      body.message.includes('Validation') ||
      (body.errors && JSON.stringify(body.errors).includes('Quantity must be greater than 0'))
    );

    // Past expiry rejection
    const resPastExpiry = await fetch(`${baseUrl}/api/v1/donations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${donorToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Expired Food',
        foodCategory: 'Cooked',
        quantity: 10,
        unit: 'kg',
        expiresAt: new Date(Date.now() - 3600000).toISOString(),
        pickupAddress: '42 Main St',
        packagingInfo: 'Boxes',
        storageRequirements: 'Keep cool',
      }),
    });
    assert.equal(resPastExpiry.status, 400);
  });
});
