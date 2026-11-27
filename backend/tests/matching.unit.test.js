const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.PORT = '5003';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_8_chars';
process.env.JWT_EXPIRES_IN = '1h';

const { calculateMatchScore } = require('../src/services/matching.service');
const { DEFAULT_MATCHING_WEIGHTS } = require('../src/config/matchingWeights');

test('1. Ranks sample NGOs transparently for a sample donation', () => {
  const now = new Date('2026-11-27T10:00:00.000Z');
  const donation = {
    id: 'don-1',
    title: 'Cooked Rice & Curry Trays',
    foodCategory: 'Cooked Meals',
    quantity: 50,
    unit: 'servings',
    pickupAddress: '100 MG Road, Downtown',
    latitude: 12.9716,
    longitude: 77.5946,
    expiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3h -> CRITICAL (100)
  };

  // NGO 1: Close (0 km), verified, active, matches category, covers requirement, sufficient capacity
  const ngo1 = {
    id: 'ngo-1',
    organizationName: 'Downtown Care Kitchen',
    serviceArea: 'Downtown',
    latitude: 12.9716,
    longitude: 77.5946,
    preferredCategories: ['Cooked Meals', 'Bakery'],
    requiredQuantity: 50,
    capacity: 100,
    isVerified: true,
    user: { isActive: true },
  };

  // NGO 2: ~11 km away, verified, active, different category, smaller requirement & capacity
  const ngo2 = {
    id: 'ngo-2',
    organizationName: 'Northside Shelter',
    serviceArea: 'Northside',
    latitude: 13.0716,
    longitude: 77.5946,
    preferredCategories: ['Fresh Produce'],
    requiredQuantity: 100,
    capacity: 25,
    isVerified: true,
    user: { isActive: true },
  };

  // NGO 3: Unverified NGO
  const ngo3 = {
    id: 'ngo-3',
    organizationName: 'Unverified Group',
    serviceArea: 'Downtown',
    latitude: 12.9716,
    longitude: 77.5946,
    preferredCategories: ['Cooked Meals'],
    requiredQuantity: 50,
    capacity: 100,
    isVerified: false,
    user: { isActive: true },
  };

  const score1 = calculateMatchScore(donation, ngo1, DEFAULT_MATCHING_WEIGHTS, now);
  const score2 = calculateMatchScore(donation, ngo2, DEFAULT_MATCHING_WEIGHTS, now);
  const score3 = calculateMatchScore(donation, ngo3, DEFAULT_MATCHING_WEIGHTS, now);

  assert.equal(score1.eligible, true);
  assert.equal(score1.totalScore, 100);
  assert.equal(score1.distanceKm, 0);
  assert.equal(score1.urgency.level, 'CRITICAL');

  assert.equal(score2.eligible, true);
  assert.ok(score2.distanceKm > 10 && score2.distanceKm < 12);
  assert.ok(score2.totalScore < score1.totalScore);
  assert.equal(score2.breakdown.foodCategory, 20);
  assert.equal(score2.breakdown.quantity, 50);
  assert.equal(score2.breakdown.capacity, 50);

  assert.equal(score3.eligible, false);
  assert.equal(score3.totalScore, 0);
  assert.ok(score3.reasons[0].includes('not yet verified'));
});

test('2. Handles missing coordinates gracefully using service area fallback', () => {
  const now = new Date('2026-11-27T10:00:00.000Z');
  const donationNoCoords = {
    foodCategory: 'Bakery',
    quantity: 20,
    unit: 'loaves',
    pickupAddress: '45 Central Market, East District',
    latitude: null,
    longitude: null,
    expiresAt: new Date(now.getTime() + 10 * 60 * 60 * 1000), // 10h -> HIGH (80)
  };

  const ngoMatchingArea = {
    serviceArea: 'East District',
    latitude: null,
    longitude: null,
    preferredCategories: [],
    requiredQuantity: null,
    capacity: null,
    isVerified: true,
    user: { isActive: true },
  };

  const result = calculateMatchScore(
    donationNoCoords,
    ngoMatchingArea,
    DEFAULT_MATCHING_WEIGHTS,
    now
  );

  assert.equal(result.eligible, true);
  assert.equal(result.distanceKm, null);
  assert.equal(result.breakdown.distance, 70);
  assert.equal(result.breakdown.foodCategory, 50); // Neutral, not invented
  assert.equal(result.breakdown.quantity, 50); // Neutral, not invented
  assert.equal(result.breakdown.capacity, 50); // Neutral, not invented
  assert.equal(result.urgency.level, 'HIGH');
});

test('3. Supports configurable custom weights', () => {
  const now = new Date('2026-11-27T10:00:00.000Z');
  const donation = {
    foodCategory: 'Produce',
    quantity: 10,
    unit: 'kg',
    pickupAddress: 'Remote Road',
    latitude: null,
    longitude: null,
    expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // CRITICAL (100)
  };
  const ngo = {
    serviceArea: 'Other Area',
    preferredCategories: ['Produce'], // 100
    requiredQuantity: 10, // 100
    capacity: 20, // 100
    isVerified: true,
    user: { isActive: true },
  };

  const urgencyHeavy = calculateMatchScore(
    donation,
    ngo,
    { distance: 0.1, foodCategory: 0.1, quantity: 0.1, urgency: 0.6, capacity: 0.1 },
    now
  );
  assert.equal(urgencyHeavy.totalScore, 94); // 40*0.1 + 100*0.1 + 100*0.1 + 100*0.6 + 100*0.1 = 94
});
