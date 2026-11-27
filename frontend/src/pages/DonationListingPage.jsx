import React, { useState, useMemo } from 'react';
import {
  PageContainer,
  Card,
  Badge,
  Button,
  Input,
  Select,
} from '../components/ui';
import { MOCK_DONATIONS } from '../data/mockData';

export function DonationListingPage({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [urgency, setUrgency] = useState('ALL');

  const filtered = useMemo(() => {
    return MOCK_DONATIONS.filter((d) => {
      if (category !== 'ALL' && d.category !== category) return false;
      if (urgency !== 'ALL' && d.urgency !== urgency) return false;
      if (
        search.trim() &&
        !`${d.title} ${d.pickupAddress} ${d.donorName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [search, category, urgency]);

  return (
    <PageContainer
      eyebrow="Surplus Catalog"
      title="Available Surplus Food Donations"
      subtitle="Browse donor-reported food batches, filter by category or urgency, and inspect full safety details."
    >
      <Card style={{ marginBottom: '1.5rem' }}>
        <div className="grid-3">
          <Input
            id="listing-search"
            label="Search Title, Donor, or Address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Pulao, Residency Road..."
          />
          <Select
            id="listing-category"
            label="Food Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Cooked Meals">Cooked Meals</option>
            <option value="Bakery & Bread">Bakery &amp; Bread</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Dairy & Beverages">Dairy &amp; Beverages</option>
          </Select>
          <Select
            id="listing-urgency"
            label="Expiry Urgency"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical (≤ 4 hours)</option>
            <option value="HIGH">High (≤ 12 hours)</option>
            <option value="MEDIUM">Medium (≤ 24 hours)</option>
            <option value="LOW">Low (&gt; 24 hours)</option>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card title="No Matching Donations">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            No sample donations match your current filter criteria.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch('');
              setCategory('ALL');
              setUrgency('ALL');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid-2">
          {filtered.map((d) => (
            <Card
              key={d.id}
              interactive
              title={d.title}
              subtitle={`${d.donorName} • ${d.distanceKm} km away`}
              badge={
                <Badge tone={d.urgency === 'CRITICAL' ? 'terracotta' : 'mint'}>
                  {d.urgency} • {d.status}
                </Badge>
              }
              footer={
                <>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Expires: {d.expiresAt}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onNavigate('details', d.id)}
                  >
                    View Details
                  </Button>
                </>
              }
            >
              <div style={{ display: 'grid', gap: '0.45rem', fontSize: '0.9rem' }}>
                <div>
                  <strong>Quantity:</strong> {d.quantity} {d.unit} ({d.category})
                </div>
                <div>
                  <strong>Pickup:</strong> {d.pickupAddress}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  <strong>Storage:</strong> {d.storageRequirements}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

export default DonationListingPage;
