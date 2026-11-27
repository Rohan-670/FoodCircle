import {
  MOCK_DONATIONS,
  MOCK_VOLUNTEER_TASKS,
  MOCK_ADMIN_VERIFICATIONS,
  MOCK_AUDIT_LOGS,
} from './mockData';

const DONATIONS_KEY = 'fc_donations';
const REQUESTS_KEY = 'fc_requests';
const DELIVERIES_KEY = 'fc_deliveries';
const VERIFICATIONS_KEY = 'fc_verifications';
const AUDIT_LOGS_KEY = 'fc_audit_logs';

function loadOrInit(key, defaultData) {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch {
    // fallback
  }
  return defaultData;
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // fallback
  }
}

export function getStoredDonations() {
  return loadOrInit(DONATIONS_KEY, MOCK_DONATIONS);
}

export function addStoredDonation(donation) {
  const list = getStoredDonations();
  const updated = [donation, ...list];
  save(DONATIONS_KEY, updated);
  return updated;
}

export function updateStoredDonationStatus(id, status) {
  const list = getStoredDonations();
  const updated = list.map((d) => (d.id === id ? { ...d, status } : d));
  save(DONATIONS_KEY, updated);
  return updated;
}

export function getStoredRequests() {
  const initial = [
    {
      id: 'req-1',
      batch: 'Vegetable Pulao & Lentil Curry Trays',
      ngoName: 'Mercy Community Kitchen',
      servings: 65,
      sla: '~25 mins',
      status: 'PENDING',
    },
    {
      id: 'req-2',
      batch: 'Whole-Grain Artisan Loaves & Rolls',
      ngoName: 'Annapurna Relief Food Bank',
      servings: 40,
      sla: '~35 mins',
      status: 'PENDING',
    },
  ];
  return loadOrInit(REQUESTS_KEY, initial);
}

export function addStoredRequest(request) {
  const list = getStoredRequests();
  const updated = [request, ...list];
  save(REQUESTS_KEY, updated);
  return updated;
}

export function updateStoredRequest(id, status) {
  const list = getStoredRequests();
  const updated = list.map((r) => (r.id === id ? { ...r, status } : r));
  save(REQUESTS_KEY, updated);
  return updated;
}

export function getStoredDeliveries() {
  return loadOrInit(DELIVERIES_KEY, MOCK_VOLUNTEER_TASKS);
}

export function updateStoredDelivery(id, updates) {
  const list = getStoredDeliveries();
  const updated = list.map((t) => (t.id === id ? { ...t, ...updates } : t));
  save(DELIVERIES_KEY, updated);
  return updated;
}

export function getStoredVerifications() {
  return loadOrInit(VERIFICATIONS_KEY, MOCK_ADMIN_VERIFICATIONS);
}

export function updateStoredVerification(id, status) {
  const list = getStoredVerifications();
  const updated = list.map((v) => (v.id === id ? { ...v, status } : v));
  save(VERIFICATIONS_KEY, updated);
  return updated;
}

export function getStoredAuditLogs() {
  return loadOrInit(AUDIT_LOGS_KEY, MOCK_AUDIT_LOGS);
}

export function addStoredAuditLog(action, target, admin = 'System Administrator') {
  const list = getStoredAuditLogs();
  const newEntry = {
    id: `aud-${Date.now()}`,
    action,
    target,
    admin,
    timestamp: 'Just now',
  };
  const updated = [newEntry, ...list];
  save(AUDIT_LOGS_KEY, updated);
  return updated;
}
