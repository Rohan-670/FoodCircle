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
  const [dietary, setDietary] = useState('ALL');
  const [urgency, setUrgency] = useState('ALL');

  const filtered = useMemo(() => {
    return MOCK_DONATIONS.filter((d) => {
      if (category !== 'ALL' && d.category !== category) return false;
      if (dietary !== 'ALL' && d.dietary !== dietary) return false;
      if (urgency !== 'ALL' && d.urgency !== urgency) return false;
      if (
        search.trim() &&
        !`${d.title} ${d.pickupAddress} ${d.donorName} ${d.fssaiLicense || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [search, category, dietary, urgency]);

  return (
    <PageContainer
      eyebrow="Civic Surplus Directory"
      title="Available Food Surplus Catalog"
      subtitle="Browse verified donor-reported food batches, filter by category, dietary classification, or urgency, and inspect full FSSAI compliance details."
    >
      {/* Statutory Guidance Strip */}
      <div className="statutory-shield-box" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong style={{ color: 'var(--color-forest)' }}>FSSAI Schedule I &amp; Good Samaritan Protected</strong>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              All cooked meals require &gt;60°C or &lt;7°C holding. Replay-proof single-use QR tokens are generated upon reservation.
            </div>
          </div>
          <Badge tone="forest">Verified Donor Network</Badge>
        </div>
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
        <div className="grid-4">
          <Input
            id="listing-search"
            label="Search Batch, Donor, FSSAI"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Pulao, Residency, FSSAI..."
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
            id="listing-dietary"
            label="Dietary Classification"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
          >
            <option value="ALL">All Dietary Types</option>
            <option value="Pure Veg">Pure Veg</option>
            <option value="Vegetarian">Vegetarian</option>
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
        <Card title="No Matching Surplus Batches">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            No surplus batches match your current filter parameters.
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
              subtitle={`${d.donorName} • ${d.distanceKm} km away • SLA ~${d.slaMinutes}m`}
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
                    Inspect Batch Details →
                  </Button>
                </div>
              }
            >
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                  <strong>{d.quantity} {d.unit} ({d.category})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Holding Temp:</span>
                  <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>{d.holdingTemp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>FSSAI License:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{d.fssaiLicense}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
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
