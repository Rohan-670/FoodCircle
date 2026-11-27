import React, { useState } from 'react';
import { PageContainer, Card, Badge, Button } from '../components/ui';
import {
  MOCK_DONATIONS,
  MOCK_METRO_HUBS,
  MOCK_VERIFIED_FOOD_BANKS,
  MOCK_IMPACT_METRICS,
} from '../data/mockData';

export function LandingPage({ onNavigate }) {
  const [selectedHub, setSelectedHub] = useState('blr-central');
  const [selectedRadius, setSelectedRadius] = useState('5 km');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const featured = MOCK_DONATIONS[0];

  const filteredSurplus = MOCK_DONATIONS.filter((d) => {
    if (selectedCategory !== 'ALL' && d.category !== selectedCategory) return false;
    if (selectedRadius === '5 km' && d.distanceKm > 5) return false;
    if (selectedRadius === '10 km' && d.distanceKm > 10) return false;
    return true;
  });

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <PageContainer showMockBanner={false}>
      {/* Hero Section */}
      <section className="hero-banner-accent hero-dot-grid">
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
              <Badge tone="forest">Food Rescue</Badge>
              <Badge tone="mint">Verified Network</Badge>
            </div>

            <h1 className="hero-title-lead" style={{ fontSize: '2.75rem', margin: '0.5rem 0 0.85rem' }}>
              Fresh food rescue, <span className="hero-title-highlight">made simple</span>.
            </h1>

            <p className="hero-lead" style={{ fontSize: '1.02rem', maxWidth: '52ch', marginBottom: '1.25rem' }}>
              Connect commercial kitchens and grocery donors directly with local charities
              and volunteer couriers. Less waste, faster delivery.
            </p>

            <div className="hero-cta-pills">
              <Button
                size="lg"
                className="btn-pill"
                onClick={() => onNavigate('donor-dashboard')}
              >
                Donate Surplus
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="btn-pill"
                onClick={() => onNavigate('ngo-dashboard')}
              >
                Find Food
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="btn-pill"
                onClick={() => onNavigate('volunteer-dashboard')}
              >
                Volunteer
              </Button>
            </div>
          </div>

          {/* Featured Live Batch */}
          <Card
            title={featured.title}
            subtitle={featured.donorName}
            badge={<Badge tone="terracotta">{featured.hoursRemaining}h left</Badge>}
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {featured.pickupAddress}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('details', featured.id)}
                >
                  View Details →
                </Button>
              </div>
            }
          >
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                <strong>{featured.quantity} {featured.unit} ({featured.dietary})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Temperature:</span>
                <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>{featured.holdingTemp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dispatch SLA:</span>
                <strong>~{featured.slaMinutes} mins</strong>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Impact Metric KPIs */}
      <section className="impact-kpi-bar">
        <div className="impact-kpi-card">
          <div className="impact-kpi-num">{MOCK_IMPACT_METRICS.mealsRescued}</div>
          <div className="impact-kpi-sub">Food Rescued</div>
          <div className="impact-kpi-detail">{MOCK_IMPACT_METRICS.mealsEstimated} delivered to shelters</div>
        </div>

        <div className="impact-kpi-card">
          <div className="impact-kpi-num">{MOCK_IMPACT_METRICS.verifiedNgos}</div>
          <div className="impact-kpi-sub">Verified NGOs</div>
          <div className="impact-kpi-detail">Active community kitchens</div>
        </div>

        <div className="impact-kpi-card">
          <div className="impact-kpi-num">{MOCK_IMPACT_METRICS.activeVolunteers}</div>
          <div className="impact-kpi-sub">Active Couriers</div>
          <div className="impact-kpi-detail">GPS &amp; QR verified handoffs</div>
        </div>

        <div className="impact-kpi-card">
          <div className="impact-kpi-num">{MOCK_IMPACT_METRICS.avgDispatchSla}</div>
          <div className="impact-kpi-sub">Average Delivery</div>
          <div className="impact-kpi-detail">From kitchen to distribution</div>
        </div>
      </section>

      {/* 4 Clean Role Pathways */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="page-eyebrow">Workflows</span>
          <h2 style={{ fontSize: '1.75rem' }}>Built for each role in the chain</h2>
        </div>

        <div className="grid-4">
          <div className="pathway-card">
            <div>
              <div className="pathway-icon-bubble">🍲</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Donors</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                Post surplus batches in seconds with pickup time, storage conditions, and volume.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('donor-dashboard')}
            >
              Donor Hub →
            </Button>
          </div>

          <div className="pathway-card pathway-saffron">
            <div>
              <div className="pathway-icon-bubble bubble-saffron">🤝</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>NGOs</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                Browse nearby donations matched transparently by distance, category, and capacity.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('ngo-dashboard')}
            >
              NGO Portal →
            </Button>
          </div>

          <div className="pathway-card">
            <div>
              <div className="pathway-icon-bubble">🛵</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Volunteers</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                Accept delivery tasks, follow live routes, and complete handoffs via single-use QR codes.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('volunteer-dashboard')}
            >
              Task Board →
            </Button>
          </div>

          <div className="pathway-card">
            <div>
              <div className="pathway-icon-bubble">🛡️</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Admins</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                Verify organization accounts, manage permissions, and review real-time audit logs.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('admin-dashboard')}
            >
              Admin Hub →
            </Button>
          </div>
        </div>
      </section>

      {/* Reactive Surplus Locator */}
      <section className="geo-locator-shell">
        <div className="geo-locator-header">
          <div>
            <h2 style={{ fontSize: '1.45rem', color: '#ffffff', margin: 0 }}>
              Live Surplus &amp; Partner Locator
            </h2>
            <p style={{ fontSize: '0.84rem', opacity: 0.9, marginTop: '0.2rem' }}>
              Nearby surplus batches available for immediate pickup.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.75rem',
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              {MOCK_METRO_HUBS.map((hub) => (
                <option key={hub.id} value={hub.id} style={{ color: '#0f172a' }}>
                  {hub.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              style={{ backgroundColor: 'var(--color-saffron)', color: '#ffffff', border: 'none' }}
              onClick={() => setSelectedRadius('5 km')}
            >
              Near Me
            </Button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="geo-controls-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Radius:
            </span>
            <div className="geo-pills">
              {['5 km', '10 km', '25 km'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`geo-filter-pill ${selectedRadius === r ? 'is-active' : ''}`}
                  onClick={() => setSelectedRadius(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Category:
            </span>
            <div className="geo-pills">
              {['ALL', 'Cooked Meals', 'Bakery & Bread', 'Fresh Produce', 'Dairy & Beverages'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`geo-filter-pill ${selectedCategory === cat ? 'is-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'ALL' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Available Surplus Results */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            Available Batches ({filteredSurplus.length})
          </div>

          {filteredSurplus.map((item) => (
            <div key={item.id} className="geo-item-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                  <strong>{item.title}</strong>
                  <Badge tone={item.urgency === 'CRITICAL' ? 'terracotta' : 'mint'}>
                    {item.urgency}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {item.pickupAddress} • {item.donorName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Quantity</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                  {item.quantity} {item.unit}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Distance</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                  {item.distanceKm} km
                </div>
              </div>

              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onNavigate('details', item.id)}
                >
                  View Details →
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Verified Community Hubs */}
        <div>
          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            Verified Community Kitchens Nearby
          </div>

          <div className="grid-3">
            {MOCK_VERIFIED_FOOD_BANKS.map((fb) => (
              <Card
                key={fb.id}
                title={fb.name}
                subtitle={`${fb.distanceKm} km away • ${fb.turnaroundSla} delivery`}
                badge={<Badge tone="forest">Active</Badge>}
                footer={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('ngo-dashboard')}
                  >
                    View Hub →
                  </Button>
                }
              >
                <div style={{ fontSize: '0.82rem', display: 'grid', gap: '0.3rem' }}>
                  <div><strong>Capacity:</strong> {fb.capacityKg} kg buffer</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{fb.address}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clean, Minimal FAQ */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span className="page-eyebrow">FAQ</span>
          <h2 style={{ fontSize: '1.65rem' }}>Common Questions</h2>
        </div>

        <div className="faq-accordion">
          {[
            {
              q: 'How does the transparent matching score work?',
              a: 'FoodCircle calculates an explainable score based on Distance (30%), Food Category (20%), Quantity (20%), Urgency (15%), and NGO Capacity (15%). Matches are never accepted automatically without confirmation.',
            },
            {
              q: 'How do single-use QR codes verify pickup and delivery?',
              a: 'Every delivery generates two unique, single-use 256-bit cryptographic tokens. The volunteer confirms pickup at the donor location, and the recipient NGO confirms delivery upon arrival. Replaying tokens is strictly prevented.',
            },
            {
              q: 'How are organizations verified on the platform?',
              a: 'NGOs and donors submit their registration documents during onboarding. Platform administrators verify records before authorizing distribution privileges.',
            },
          ].map((item, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={item.q} className="faq-row">
                <button
                  type="button"
                  className="faq-trigger"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--color-forest)', fontWeight: 700 }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && <div className="faq-content">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </PageContainer>
  );
}

export default LandingPage;
