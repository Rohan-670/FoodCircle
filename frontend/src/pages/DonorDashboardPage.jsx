import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, Badge, Button, Input, Select, Modal } from '../components/ui';
import { MOCK_DONATIONS } from '../data/mockData';

export function DonorDashboardPage({ onNavigate }) {
  const [section, setSection] = useState('overview');
  const [donations, setDonations] = useState(MOCK_DONATIONS.slice(0, 3));
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      batch: 'Vegetable Pulao & Lentil Curry',
      ngoName: 'Mercy Community Kitchen',
      servings: 65,
      sla: '~25 mins',
      status: 'PENDING',
    },
    {
      id: 'req-2',
      batch: 'Artisan Loaves',
      ngoName: 'Annapurna Relief Food Bank',
      servings: 40,
      sla: '~35 mins',
      status: 'PENDING',
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [newBatch, setNewBatch] = useState({
    title: '',
    category: 'Cooked Meals',
    dietary: 'Pure Veg',
    quantity: '',
    unit: 'servings',
    hoursRemaining: '4',
    pickupAddress: '42 Residency Road, Central Ward',
    holdingTemp: '65°C Hot Holding',
    storageRequirements: 'Store in insulated carriers',
  });

  const sidebarItems = [
    { id: 'overview', label: 'Active Listings', count: donations.length },
    { id: 'requests', label: 'Incoming Requests', count: requests.filter((r) => r.status === 'PENDING').length },
    { id: 'history', label: 'Completed Deliveries', count: 14 },
  ];

  const metrics = [
    { label: 'Active Listings', value: String(donations.length), note: 'Available or requested' },
    { label: 'Pending Requests', value: String(requests.filter((r) => r.status === 'PENDING').length), note: 'Awaiting your approval' },
    { label: 'Accepted Batches', value: String(donations.filter((d) => d.status === 'ACCEPTED').length + 1), note: 'Ready for courier' },
    { label: 'Meals Rescued', value: '820', note: 'Cumulative to date' },
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
      status: 'AVAILABLE',
      urgency: Number(newBatch.hoursRemaining) <= 4 ? 'CRITICAL' : 'HIGH',
    };

    setDonations([created, ...donations]);
    setShowModal(false);
    setFeedback(`Batch "${created.title}" published successfully!`);
    setTimeout(() => setFeedback(''), 4000);
    setNewBatch({
      title: '',
      category: 'Cooked Meals',
      dietary: 'Pure Veg',
      quantity: '',
      unit: 'servings',
      hoursRemaining: '4',
      pickupAddress: '42 Residency Road, Central Ward',
      holdingTemp: '65°C Hot Holding',
      storageRequirements: 'Store in insulated carriers',
    });
  };

  const handleAcceptRequest = (requestId) => {
    setRequests(
      requests.map((r) => (r.id === requestId ? { ...r, status: 'ACCEPTED' } : r))
    );
    setFeedback('Request accepted! Volunteer courier notification triggered.');
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleDeclineRequest = (requestId) => {
    setRequests(requests.filter((r) => r.id !== requestId));
    setFeedback('Request declined.');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <DashboardLayout
      roleLabel="Donor"
      title="Saffron Courtyard Kitchen"
      subtitle="Manage your surplus food batches and respond to NGO requests."
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
          subtitle="Surplus batches currently available or awaiting pickup."
        >
          <div className="table-wrap">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Batch</th>
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
          subtitle="NGOs requesting to claim your available batches."
        >
          {requests.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No pending requests.</p>
          ) : (
            <div className="table-wrap">
              <table className="editorial-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Requesting NGO</th>
                    <th>Servings</th>
                    <th>ETA</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.batch}</strong></td>
                      <td>{r.ngoName}</td>
                      <td>{r.servings}</td>
                      <td>{r.sla}</td>
                      <td>
                        <Badge tone={r.status === 'ACCEPTED' ? 'forest' : 'sage'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td>
                        {r.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <Button size="sm" onClick={() => handleAcceptRequest(r.id)}>
                              Accept
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeclineRequest(r.id)}>
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                            Assigned to courier
                          </span>
                        )}
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
            14 surplus batches successfully delivered to partner shelters via verified QR handoffs.
          </p>
        </Card>
      )}

      {/* Reactive Post New Donation Modal */}
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
            label="Food Title"
            value={newBatch.title}
            onChange={(e) => setNewBatch({ ...newBatch, title: e.target.value })}
            placeholder="e.g. Steamed Rice & Dal Trays"
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
