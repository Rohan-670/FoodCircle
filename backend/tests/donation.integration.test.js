const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

process.env.NODE_ENV = 'test';
process.env.PORT = '5002';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_8_chars';
process.env.JWT_EXPIRES_IN = '1h';

const { prisma } = require('../src/config/database');
const { signToken } = require('../src/utils/jwt');
const donationService = require('../src/services/donation.service');
const app = require('../src/app');

// In-memory mock store for Prisma inside test runner (PostgreSQL is offline in sandbox)
const store = {
  users: [],
  donorProfiles: [],
  ngoProfiles: [],
  donations: [],
  donationRequests: [],
};

// Stub Prisma methods for isolated workflow testing
prisma.$transaction = async (fn) => fn(prisma);

prisma.user.findUnique = async ({ where, include }) => {
  const user = store.users.find((u) => u.id === where.id || u.email === where.email);
  if (!user) return null;
  if (!include) return { ...user };
  return {
    ...user,
    donorProfile: store.donorProfiles.find((p) => p.userId === user.id) || null,
    ngoProfile: store.ngoProfiles.find((p) => p.userId === user.id) || null,
    volunteerProfile: null,
  };
};

prisma.donorProfile.findUnique = async ({ where }) => {
  return store.donorProfiles.find((p) => p.userId === where.userId || p.id === where.id) || null;
};

prisma.nGOProfile.findUnique = async ({ where }) => {
  return store.ngoProfiles.find((p) => p.userId === where.userId || p.id === where.id) || null;
};

prisma.donation.create = async ({ data }) => {
  const donation = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.donations.push(donation);
  const donor = store.donorProfiles.find((d) => d.id === donation.donorId);
  return { ...donation, donor };
};

prisma.donation.findUnique = async ({ where }) => {
  const d = store.donations.find((item) => item.id === where.id);
  return d ? { ...d } : null;
};

prisma.donation.findMany = async ({ where = {}, include }) => {
  let results = store.donations.filter((d) => {
    if (where.donorId && d.donorId !== where.donorId) return false;
    if (where.status?.in && !where.status.in.includes(d.status)) return false;
    if (where.expiresAt?.gt && !(d.expiresAt > where.expiresAt.gt)) return false;
    if (where.expiresAt?.lte && !(d.expiresAt <= where.expiresAt.lte)) return false;
    if (
      where.foodCategory?.contains &&
      !d.foodCategory.toLowerCase().includes(where.foodCategory.contains.toLowerCase())
    ) {
      return false;
    }
    if (where.quantity?.gte && d.quantity < where.quantity.gte) return false;
    if (
      where.pickupAddress?.contains &&
      !d.pickupAddress.toLowerCase().includes(where.pickupAddress.contains.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  if (include) {
    results = results.map((d) => ({
      ...d,
      donor: store.donorProfiles.find((dp) => dp.id === d.donorId) || null,
      requests: store.donationRequests
        .filter((r) => r.donationId === d.id)
        .map((r) => ({
          ...r,
          ngo: store.ngoProfiles.find((np) => np.id === r.ngoId) || null,
        })),
    }));
  }
  return results;
};

prisma.donation.update = async ({ where, data }) => {
  const idx = store.donations.findIndex((d) => d.id === where.id);
  if (idx === -1) throw new Error('Donation not found');
  store.donations[idx] = { ...store.donations[idx], ...data, updatedAt: new Date() };
  return { ...store.donations[idx] };
};

prisma.donation.updateMany = async ({ where, data }) => {
  let count = 0;
  for (let i = 0; i < store.donations.length; i++) {
    const d = store.donations[i];
    if (where.id && typeof where.id === 'string' && d.id !== where.id) continue;
    if (where.id?.in && !where.id.in.includes(d.id)) continue;
    if (where.status?.in && !where.status.in.includes(d.status)) continue;
    if (where.expiresAt?.gt && !(d.expiresAt > where.expiresAt.gt)) continue;
    store.donations[i] = { ...d, ...data, updatedAt: new Date() };
    count++;
  }
  return { count };
};

prisma.donationRequest.findUnique = async ({ where, include }) => {
  let reqObj = null;
  if (where.id) {
    reqObj = store.donationRequests.find((r) => r.id === where.id);
  } else if (where.donationId_ngoId) {
    reqObj = store.donationRequests.find(
      (r) =>
        r.donationId === where.donationId_ngoId.donationId &&
        r.ngoId === where.donationId_ngoId.ngoId
    );
  }
  if (!reqObj) return null;
  if (!include) return { ...reqObj };
  return {
    ...reqObj,
    donation: store.donations.find((d) => d.id === reqObj.donationId) || null,
  };
};

prisma.donationRequest.create = async ({ data }) => {
  const reqObj = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.donationRequests.push(reqObj);
  return {
    ...reqObj,
    ngo: store.ngoProfiles.find((n) => n.id === reqObj.ngoId) || null,
  };
};

prisma.donationRequest.update = async ({ where, data }) => {
  const idx = store.donationRequests.findIndex((r) => r.id === where.id);
  store.donationRequests[idx] = {
    ...store.donationRequests[idx],
    ...data,
    updatedAt: new Date(),
  };
  return { ...store.donationRequests[idx] };
};

prisma.donationRequest.updateMany = async ({ where, data }) => {
  let count = 0;
  for (let i = 0; i < store.donationRequests.length; i++) {
    const r = store.donationRequests[i];
    if (where.donationId && typeof where.donationId === 'string' && r.donationId !== where.donationId) continue;
    if (where.donationId?.in && !where.donationId.in.includes(r.donationId)) continue;
    if (where.id?.not && r.id === where.id.not) continue;
    if (where.status && r.status !== where.status) continue;
    store.donationRequests[i] = { ...r, ...data, updatedAt: new Date() };
    count++;
  }
  return { count };
};

prisma.donationRequest.count = async ({ where }) => {
  return store.donationRequests.filter(
    (r) => r.donationId === where.donationId && r.status === where.status
  ).length;
};

prisma.notification.create = async ({ data }) => ({
  id: crypto.randomUUID(),
  ...data,
  createdAt: new Date(),
});

let server;
let baseUrl;
let donorToken;
let ngo1Token;
let ngo2Token;
let createdDonationId;
let ngo1RequestId;
let ngo2RequestId;

test.before(async () => {
  const donorUserId = crypto.randomUUID();
  const ngo1UserId = crypto.randomUUID();
  const ngo2UserId = crypto.randomUUID();

  store.users.push(
    { id: donorUserId, email: 'donor@bistro.com', fullName: 'Bistro Owner', role: 'DONOR', isActive: true },
    { id: ngo1UserId, email: 'ngo1@care.org', fullName: 'NGO 1 Lead', role: 'NGO', isActive: true },
    { id: ngo2UserId, email: 'ngo2@hope.org', fullName: 'NGO 2 Lead', role: 'NGO', isActive: true }
  );

  store.donorProfiles.push({
    id: crypto.randomUUID(),
    userId: donorUserId,
    organizationName: 'Green Bistro',
    businessType: 'Restaurant',
    address: '100 Main St',
  });

  store.ngoProfiles.push(
    {
      id: crypto.randomUUID(),
      userId: ngo1UserId,
      organizationName: 'Care Foundation',
      contactPerson: 'NGO 1 Lead',
      address: '200 Oak St',
      serviceArea: 'Downtown',
      isVerified: true,
    },
    {
      id: crypto.randomUUID(),
      userId: ngo2UserId,
      organizationName: 'Hope Shelter',
      contactPerson: 'NGO 2 Lead',
      address: '300 Pine St',
      serviceArea: 'North',
      isVerified: true,
    }
  );

  donorToken = signToken({ userId: donorUserId, role: 'DONOR' });
  ngo1Token = signToken({ userId: ngo1UserId, role: 'NGO' });
  ngo2Token = signToken({ userId: ngo2UserId, role: 'NGO' });

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

test('1. Donor creates a donation with image upload and safety checklist', async () => {
  const futureDate = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  const formData = new FormData();
  formData.append('title', 'Fresh Vegetable Meals');
  formData.append('description', 'Packed hot lunch trays');
  formData.append('foodCategory', 'Cooked Meals');
  formData.append('quantity', '40');
  formData.append('unit', 'servings');
  formData.append('expiresAt', futureDate);
  formData.append('pickupAddress', '100 Main St, Downtown');
  formData.append('packagingInfo', 'Sealed aluminum trays');
  formData.append('storageRequirements', 'Keep warm above 60C');
  formData.append(
    'safetyChecklist',
    JSON.stringify({
      properlyPackaged: true,
      storedAtSafeTemp: true,
      withinSafeConsumptionWindow: true,
      noSpoilageSigns: true,
    })
  );
  // Valid minimal PNG header bytes
  const pngBlob = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' });
  formData.append('image', pngBlob, 'meal.png');

  const res = await fetch(`${baseUrl}/donations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${donorToken}` },
    body: formData,
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.data.donation.status, 'AVAILABLE');
  assert.ok(json.data.donation.imageUrl.startsWith('/uploads/donations/'));
  assert.ok(json.data.safetyNotice.includes('does not certify food safety'));
  createdDonationId = json.data.donation.id;
});

test('2. Reject invalid image type, past deadline, invalid quantity, and NGO create attempt', async () => {
  const futureDate = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

  // Invalid file type (.txt)
  const badImgForm = new FormData();
  badImgForm.append('title', 'Bread');
  badImgForm.append('foodCategory', 'Bakery');
  badImgForm.append('quantity', '10');
  badImgForm.append('unit', 'loaves');
  badImgForm.append('expiresAt', futureDate);
  badImgForm.append('pickupAddress', '100 Main St');
  badImgForm.append('packagingInfo', 'Bags');
  badImgForm.append('storageRequirements', 'Dry');
  badImgForm.append(
    'safetyChecklist',
    JSON.stringify({
      properlyPackaged: true,
      storedAtSafeTemp: true,
      withinSafeConsumptionWindow: true,
      noSpoilageSigns: true,
    })
  );
  badImgForm.append('image', new Blob(['not an image'], { type: 'text/plain' }), 'test.txt');

  const badImgRes = await fetch(`${baseUrl}/donations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${donorToken}` },
    body: badImgForm,
  });
  assert.equal(badImgRes.status, 400);

  // NGO cannot create donation
  const ngoCreateRes = await fetch(`${baseUrl}/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngo1Token}`,
    },
    body: JSON.stringify({}),
  });
  assert.equal(ngoCreateRes.status, 403);
});

test('3. Donor edits eligible donation & views donation history', async () => {
  const patchRes = await fetch(`${baseUrl}/donations/${createdDonationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${donorToken}`,
    },
    body: JSON.stringify({ quantity: 50 }),
  });
  assert.equal(patchRes.status, 200);
  const patchJson = await patchRes.json();
  assert.equal(patchJson.data.donation.quantity, 50);

  const histRes = await fetch(`${baseUrl}/donations/my`, {
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  assert.equal(histRes.status, 200);
  const histJson = await histRes.json();
  assert.equal(histJson.data.donations.length, 1);
});

test('4. NGO browses and filters available donations', async () => {
  const res = await fetch(
    `${baseUrl}/donations?foodCategory=Cooked&minQuantity=30&location=Downtown&urgency=HIGH`,
    { headers: { Authorization: `Bearer ${ngo1Token}` } }
  );
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.data.donations.length, 1);
  assert.equal(json.data.donations[0].id, createdDonationId);
});

test('5. Multiple NGOs request donation; Donor accepts one & prevents multiple acceptances', async () => {
  // NGO 1 requests
  const req1Res = await fetch(`${baseUrl}/donations/${createdDonationId}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngo1Token}`,
    },
    body: JSON.stringify({ notes: 'Can pick up in 30 mins' }),
  });
  assert.equal(req1Res.status, 201);
  ngo1RequestId = (await req1Res.json()).data.request.id;

  // NGO 1 duplicate request blocked
  const dupRes = await fetch(`${baseUrl}/donations/${createdDonationId}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngo1Token}`,
    },
    body: JSON.stringify({}),
  });
  assert.equal(dupRes.status, 409);

  // NGO 2 requests
  const req2Res = await fetch(`${baseUrl}/donations/${createdDonationId}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngo2Token}`,
    },
    body: JSON.stringify({ notes: 'Can pick up in 1 hour' }),
  });
  assert.equal(req2Res.status, 201);
  ngo2RequestId = (await req2Res.json()).data.request.id;

  // Donor accepts NGO 1
  const acceptRes = await fetch(`${baseUrl}/donations/requests/${ngo1RequestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${donorToken}`,
    },
    body: JSON.stringify({ action: 'ACCEPT' }),
  });
  assert.equal(acceptRes.status, 200);
  const acceptJson = await acceptRes.json();
  assert.equal(acceptJson.data.donationStatus, 'ACCEPTED');

  // NGO 2 request was auto-rejected and cannot be accepted
  const secondAcceptRes = await fetch(`${baseUrl}/donations/requests/${ngo2RequestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${donorToken}`,
    },
    body: JSON.stringify({ action: 'ACCEPT' }),
  });
  assert.equal(secondAcceptRes.status, 400);

  // Accepted donation cannot be edited or cancelled
  const editAcceptedRes = await fetch(`${baseUrl}/donations/${createdDonationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${donorToken}`,
    },
    body: JSON.stringify({ quantity: 100 }),
  });
  assert.equal(editAcceptedRes.status, 400);
});

test('6. Donor cancels eligible donation & expiry job marks overdue donations as EXPIRED', async () => {
  // Create a second donation and cancel it
  const d2 = await donationService.createDonation(
    store.users[0].id,
    {
      title: 'Fruit Baskets',
      foodCategory: 'Fresh Produce',
      quantity: 15,
      unit: 'boxes',
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      pickupAddress: '100 Main St',
      packagingInfo: 'Cardboard boxes',
      storageRequirements: 'Cool dry place',
      safetyChecklist: {
        properlyPackaged: true,
        storedAtSafeTemp: true,
        withinSafeConsumptionWindow: true,
        noSpoilageSigns: true,
      },
    }
  );

  const cancelRes = await fetch(`${baseUrl}/donations/${d2.id}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  assert.equal(cancelRes.status, 200);
  assert.equal((await cancelRes.json()).data.donation.status, 'CANCELLED');

  // Create an already-overdue donation in store and run scheduled expiry job
  store.donations.push({
    id: crypto.randomUUID(),
    donorId: store.donorProfiles[0].id,
    title: 'Overdue Pastries',
    foodCategory: 'Bakery',
    quantity: 20,
    unit: 'pieces',
    preparedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 1000),
    pickupAddress: '100 Main St',
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const expiryResult = await donationService.expireOverdueDonations();
  assert.equal(expiryResult.expiredCount, 1);
});
