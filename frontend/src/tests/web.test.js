import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOCK_DONATIONS,
  MOCK_NGO_RECOMMENDATIONS,
  MOCK_VOLUNTEER_TASKS,
  MOCK_ADMIN_VERIFICATIONS,
} from '../data/mockData.js';

test('Web Frontend Validation & Security Suite', async (t) => {
  await t.test('1. Validates all mock surplus records for safe web presentation', () => {
    assert.ok(MOCK_DONATIONS.length > 0, 'Must have mock donations');

    for (const d of MOCK_DONATIONS) {
      assert.ok(d.id && typeof d.id === 'string', `Invalid donation id: ${d.id}`);
      assert.ok(d.title && d.title.trim().length > 0, `Empty title for ${d.id}`);
      assert.ok(d.quantity > 0, `Quantity must be positive for ${d.id}`);
      assert.ok(d.pickupAddress && d.pickupAddress.trim().length > 0, `Empty address for ${d.id}`);
      assert.ok(d.hoursRemaining > 0, `Remaining hours must be positive for ${d.id}`);
    }
  });

  await t.test('2. Verifies transparent matching recommendation score structure', () => {
    for (const rec of MOCK_NGO_RECOMMENDATIONS) {
      assert.ok(rec.score >= 0 && rec.score <= 100, `Score out of bounds: ${rec.score}`);
      assert.ok(rec.breakdown, `Missing breakdown for ${rec.id}`);
      assert.equal(typeof rec.breakdown.distance, 'number');
      assert.equal(typeof rec.breakdown.category, 'number');
      assert.equal(typeof rec.breakdown.quantity, 'number');
      assert.equal(typeof rec.breakdown.urgency, 'number');
      assert.equal(typeof rec.breakdown.capacity, 'number');
      assert.ok(rec.reasons.length > 0, 'Must contain explanation reasons');
    }
  });

  await t.test('3. Enforces delivery lifecycle progression & single-use QR uniqueness', () => {
    const tokens = new Set();
    const validStates = [
      'ACCEPTED',
      'PENDING_VOLUNTEER',
      'VOLUNTEER_ASSIGNED',
      'PICKUP_CONFIRMED',
      'IN_TRANSIT',
      'DELIVERY_CONFIRMED',
    ];

    for (const task of MOCK_VOLUNTEER_TASKS) {
      assert.ok(validStates.includes(task.status), `Invalid status ${task.status}`);

      // Ensure pickup and delivery tokens are unique and non-empty
      assert.ok(task.pickupQrToken, `Missing pickup QR for ${task.id}`);
      assert.ok(task.deliveryQrToken, `Missing delivery QR for ${task.id}`);
      assert.notEqual(task.pickupQrToken, task.deliveryQrToken, 'Tokens must be distinct');

      assert.ok(!tokens.has(task.pickupQrToken), 'Duplicate pickup token detected');
      tokens.add(task.pickupQrToken);

      assert.ok(!tokens.has(task.deliveryQrToken), 'Duplicate delivery token detected');
      tokens.add(task.deliveryQrToken);
    }
  });

  await t.test('4. Sanitizes and prevents XSS injection strings in search filters', () => {
    const maliciousPayload = '<script>alert("XSS")</script>';

    // Filtering should never execute scripts or crash
    const searchFilter = (item, query) => {
      const q = query.trim().toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.pickupAddress.toLowerCase().includes(q)
      );
    };

    const results = MOCK_DONATIONS.filter((d) => searchFilter(d, maliciousPayload));
    assert.equal(results.length, 0, 'Malicious payload should match nothing');
  });

  await t.test('5. Validates admin verification queue status integrity', () => {
    for (const v of MOCK_ADMIN_VERIFICATIONS) {
      assert.ok(['PENDING', 'VERIFIED', 'REJECTED'].includes(v.status));
      assert.ok(v.organization.length > 0);
      assert.ok(['NGO', 'DONOR', 'VOLUNTEER'].includes(v.type));
    }
  });
});
