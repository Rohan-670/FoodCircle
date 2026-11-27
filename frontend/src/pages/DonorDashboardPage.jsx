import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button, Input, Select, Modal } from '../components/ui';
import {
  getStoredDonations,
  addStoredDonation,
  getStoredRequests,
  updateStoredRequest,
  updateStoredDonationStatus,
} from '../data/store';

export function DonorDashboardPage({ onNavigate }) {
  const [section, setSection] = useState('overview');
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [newBatch, setNewBatch] = useState({
    title: '',
    category: 'Cooked Meals',
    dietary: 'Pure Veg',
    quantity: '',
    unit: 'servings',
    hoursRemaining: '4',
    pickupAddress: '42 Residency Road, Central Ward, Bengaluru',
    holdingTemp: '65°C Hot Holding',
    storageRequirements: 'Store in insulated containers',
  });

  useEffect(() => {
    setDonations(getStoredDonations());
    setRequests(getStoredRequests());
  }, []);

  const sidebarItems = [
    { id: 'overview', label: 'Active Listings', count: donations.length },
    { id: 'requests', label: 'Incoming Requests', count: requests.filter((r) => r.status === 'PENDING').length },
    { id: 'history', label: 'Completed Deliveries', count: 14 },
  ];

  const metrics = [
    { label: 'Active Listings', value: String(donations.length), note: 'Available or requested' },
    { label: 'Pending Requests', value: String(requests.filter((r) => r.status === 'PENDING').length), note: 'Awaiting your decision' },
    { label: 'Accepted Batches', value: String(donations.filter((d) => d.status === 'ACCEPTED').length), note: 'Ready for courier' },
    { label: 'Meals Donated', value: '820', note: 'Cumulative to date' },
  ];

  const handleCreateDonation = (e) => {
    e.preventDefault();
    if (!newBatch.title.trim() || !newBatch.quantity) return;

    const created = {
      id: `don-${Date.now()}`,
      title: newBatch.title,
      category: newBatch.category,
      dietary: newBatch.dietary,
      quantity: Number(newBatch.quantity),
      unit: newBatch.unit,
      hoursRemaining: Number(newBatch.hoursRemaining),
      expiresAt: `In ${newBatch.hoursRemaining} hours`,
      pickupAddress: newBatch.pickupAddress,
      holdingTemp: newBatch.holdingTemp,
      donorName: 'Saffron Courtyard Banquets',
      status: 'AVAILABLE',
      distanceKm: 1.5,
      slaMinutes: 30,
      packagingInfo: 'Sealed containers',
      storageRequirements: newBatch.storageRequirements,
      urgency: Number(newBatch.hoursRemaining) <= 4 ? 'CRITICAL' : 'HIGH',
    };

    const updated = addStoredDonation(created);
    setDonations(updated);
    setShowModal(false);
    setFeedback(`Batch "${created.title}" successfully published to active surplus network.`);
    setTimeout(() => setFeedback(''), 4000);
    setNewBatch({
      title: '',
      category: 'Cooked Meals',
      dietary: 'Pure Veg',
      quantity: '',
      unit: 'servings',
      hoursRemaining: '4',
      pickupAddress: '42 Residency Road, Central Ward, Bengaluru',
      holdingTemp: '65°C Hot Holding',
      storageRequirements: 'Store in insulated containers',
    });
  };

  const handleAcceptRequest = (requestId, batchTitle) => {
    const updatedRequests = updateStoredRequest(requestId, 'ACCEPTED');
    setRequests(updatedRequests);

    const matched = donations.find((d) => d.title.includes(batchTitle) || batchTitle.includes(d.title));
    if (matched) {
      const updatedDonations = updateStoredDonationStatus(matched.id, 'ACCEPTED');
      setDonations(updatedDonations);
    }

    setFeedback('Request accepted. Volunteer dispatch has been notified for pickup.');
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleDeclineRequest = (requestId) => {
    const updated = updateStoredRequest(requestId, 'REJECTED');
    setRequests(updated);
    setFeedback('Request declined.');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <DashboardLayout
      roleLabel="Donor"
      title="Saffron Courtyard Banquets"
      subtitle="Manage your active food batches and respond to partner NGO requests."
      sidebarItems={sidebarItems}
      activeSection={section}
      onSectionChange={setSection}
      metrics={metrics}
      actions={
        <Button onClick={() => setShowModal(true)}>
          + New Food Batch
        </Button>
      }
    >
      {feedback && (
        <div style={{ backgroundColor: 'var(--color-mint)', border: '1px solid var(--color-mint-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--color-forest)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {section === 'overview' && (
        <Card
          title="Active Food Batches"
          subtitle="Batches available for immediate charity claim or dispatch."
        >
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Food Batch</th>
                  <th>Quantity</th>
                  <th>Temperature</th>
                  <th>Expires In</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {d.category} • {d.dietary}
                      </div>
                    </td>
                    <td>
                      <strong>{d.quantity} {d.unit}</strong>
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>{d.holdingTemp}</td>
                    <td>
                      <span style={{ color: d.urgency === 'CRITICAL' ? 'var(--color-saffron)' : 'inherit', fontWeight: 600 }}>
                        {d.hoursRemaining}h
                      </span>
                    </td>
                    <td>
                      <Badge
                        tone={
                          d.urgency === 'CRITICAL'
                            ? 'terracotta'
                            : d.status === 'ACCEPTED'
                            ? 'forest'
                            : 'mint'
                        }
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('details', d.id)}
                      >
                        Details →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {section === 'requests' && (
        <Card
          title="Incoming Allocation Requests"
          subtitle="Verified charities requesting surplus allocations."
        >
          {requests.filter((r) => r.status === 'PENDING').length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No pending requests at this time.</p>
          ) : (
            <div className="table-wrap">
              <table className="editorial-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Requesting Charity</th>
                    <th>Servings</th>
                    <th>ETA</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.filter((r) => r.status === 'PENDING').map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.batch}</strong></td>
                      <td>{r.ngoName}</td>
                      <td>{r.servings}</td>
                      <td>{r.sla}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Button size="sm" onClick={() => handleAcceptRequest(r.id, r.batch)}>
                            Accept
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeclineRequest(r.id)}>
                            Decline
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {section === 'history' && (
        <Card title="Completed Deliveries" badge={<Badge tone="forest">14 Completed</Badge>}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            14 surplus food batches successfully delivered and verified with single-use QR tokens.
          </p>
        </Card>
      )}

      {/* Modal to Post New Surplus Batch */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Post New Surplus Batch"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDonation}>Publish Batch</Button>
          </div>
        }
      >
        <form onSubmit={handleCreateDonation} className="form-stack">
          <Input
            id="batch-title"
            label="Food Title / Description"
            value={newBatch.title}
            onChange={(e) => setNewBatch({ ...newBatch, title: e.target.value })}
            placeholder="e.g. Fresh Steamed Rice & Dal Trays"
            required
          />

          <div className="form-grid-2">
            <Select
              id="batch-cat"
              label="Category"
              value={newBatch.category}
              onChange={(e) => setNewBatch({ ...newBatch, category: e.target.value })}
            >
              <option value="Cooked Meals">Cooked Meals</option>
              <option value="Bakery & Bread">Bakery &amp; Bread</option>
              <option value="Fresh Produce">Fresh Produce</option>
              <option value="Dairy & Beverages">Dairy &amp; Beverages</option>
            </Select>

            <Select
              id="batch-dietary"
              label="Dietary"
              value={newBatch.dietary}
              onChange={(e) => setNewBatch({ ...newBatch, dietary: e.target.value })}
            >
              <option value="Pure Veg">Pure Veg</option>
              <option value="Vegetarian">Vegetarian</option>
            </Select>
          </div>

          <div className="form-grid-2">
            <Input
              id="batch-qty"
              label="Quantity"
              type="number"
              min="1"
              value={newBatch.quantity}
              onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
              placeholder="e.g. 50"
              required
            />
            <Input
              id="batch-unit"
              label="Unit"
              value={newBatch.unit}
              onChange={(e) => setNewBatch({ ...newBatch, unit: e.target.value })}
              placeholder="servings, kg, loaves"
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              id="batch-hours"
              label="Expiry In (Hours)"
              type="number"
              min="1"
              max="72"
              value={newBatch.hoursRemaining}
              onChange={(e) => setNewBatch({ ...newBatch, hoursRemaining: e.target.value })}
              required
            />
            <Input
              id="batch-temp"
              label="Holding Temperature"
              value={newBatch.holdingTemp}
              onChange={(e) => setNewBatch({ ...newBatch, holdingTemp: e.target.value })}
              placeholder="e.g. >60°C Hot Holding or <5°C Chilled"
            />
          </div>

          <Input
            id="batch-address"
            label="Pickup Address"
            value={newBatch.pickupAddress}
            onChange={(e) => setNewBatch({ ...newBatch, pickupAddress: e.target.value })}
            required
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default DonorDashboardPage;
