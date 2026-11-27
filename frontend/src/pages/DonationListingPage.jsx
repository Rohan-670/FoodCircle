import React, { useState, useMemo, useEffect } from 'react';
import {
  PageContainer,
  Card,
  Badge,
  Button,
  Input,
  Select,
} from '../components/ui';
import { getStoredDonations } from '../data/store';

export function DonationListingPage({ onNavigate }) {
  const [donations, setDonations] = useState(getStoredDonations());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [dietary, setDietary] = useState('ALL');
  const [urgency, setUrgency] = useState('ALL');

  useEffect(() => {
    setDonations(getStoredDonations());
    const handleStorage = () => setDonations(getStoredDonations());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      if (category !== 'ALL' && d.category !== category) return false;
      if (dietary !== 'ALL' && d.dietary !== dietary) return false;
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
  }, [donations, search, category, dietary, urgency]);

  return (
    <PageContainer
      eyebrow="Catalog"
      title="Available Food Surplus"
      subtitle="Browse and filter active surplus food batches ready for collection."
    >
      <Card style={{ marginBottom: '1.5rem' }}>
        <div className="grid-4">
          <Input
            id="listing-search"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, donor..."
          />
          <Select
            id="listing-category"
            label="Category"
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
            id="listing-dietary"
            label="Dietary"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
          >
            <option value="ALL">All Dietary</option>
            <option value="Pure Veg">Pure Veg</option>
            <option value="Vegetarian">Vegetarian</option>
          </Select>
          <Select
            id="listing-urgency"
            label="Urgency"
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
        <Card title="No Batches Found">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            No surplus batches match your current filter selection.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch('');
              setCategory('ALL');
              setDietary('ALL');
              setUrgency('ALL');
            }}
          >
            Reset Filters
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
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <Badge tone={d.dietary === 'Pure Veg' ? 'mint' : 'neutral'}>
                    {d.dietary}
                  </Badge>
                  <Badge tone={d.urgency === 'CRITICAL' ? 'terracotta' : 'sage'}>
                    {d.urgency}
                  </Badge>
                </div>
              }
              footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Expires: <strong>{d.expiresAt}</strong> ({d.hoursRemaining}h left)
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onNavigate('details', d.id)}
                  >
                    View Details →
                  </Button>
                </div>
              }
            >
              <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                  <strong>{d.quantity} {d.unit}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Temperature:</span>
                  <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>{d.holdingTemp}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.35rem' }}>
                  📍 {d.pickupAddress}
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
