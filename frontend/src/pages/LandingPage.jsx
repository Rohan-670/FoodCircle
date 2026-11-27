import React, { useState, useEffect } from 'react';
import { PageContainer, Card, Badge, Button } from '../components/ui';
import {
  MOCK_METRO_HUBS,
  MOCK_VERIFIED_FOOD_BANKS,
  MOCK_IMPACT_METRICS,
} from '../data/mockData';
import { getStoredDonations } from '../data/store';

export function LandingPage({ onNavigate }) {
  const [donations, setDonations] = useState(getStoredDonations());
  const [selectedHub, setSelectedHub] = useState('blr-central');
  const [selectedRadius, setSelectedRadius] = useState('5 km');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    setDonations(getStoredDonations());
    const handleStorage = () => setDonations(getStoredDonations());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const featured = donations[0] || {
    id: 'd-fallback',
    title: 'Surplus Prepared Meals',
    donorName: 'Central Kitchen',
    pickupAddress: 'Koramangala, Bengaluru',
    quantity: 100,
    unit: 'meals',
    dietary: 'Pure Veg',
    urgency: 'HIGH',
    hoursRemaining: 4,
    holdingTemp: '68°C',
    slaMinutes: 45,
  };

  const filteredSurplus = donations.filter((d) => {
    if (selectedCategory !== 'ALL' && d.category !== selectedCategory) return false;
    if (selectedRadius === '5 km' && (d.distanceKm || 0) > 5) return false;
    if (selectedRadius === '10 km' && (d.distanceKm || 0) > 10) return false;
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
              <Badge tone="terracotta">Live Telematics</Badge>
            </div>

            <h1 className="hero-title-lead" style={{ fontSize: '2.6rem', margin: '0.5rem 0 0.85rem' }}>
              Connecting surplus food with <span className="hero-title-highlight">those who need it</span>.
            </h1>

            <p className="hero-lead" style={{ fontSize: '1.02rem', maxWidth: '54ch', marginBottom: '1.25rem' }}>
              A smart platform for coordinating food donations, NGO requirements, volunteers, and delivery tracking.
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
              <Button
                variant="ghost"
                size="lg"
                className="btn-pill"
                onClick={() => onNavigate('impact-dashboard')}
              >
                Impact Dashboard
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

      {/* Slide 2: The Real-World Problem & Our Solution */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="page-eyebrow">Problem &amp; Solution</span>
          <h2 style={{ fontSize: '1.85rem' }}>The Real-World Challenge &amp; Our System</h2>
        </div>

        <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* The Challenge */}
          <div
            style={{
              backgroundColor: '#1E362D',
              color: '#ffffff',
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg, 16px)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B8D7C7', fontWeight: 700 }}>
              The Challenge
            </span>
            <h3 style={{ fontSize: '1.5rem', color: '#F6F2E8', margin: '0.4rem 0 1rem', lineHeight: 1.25 }}>
              Good food goes to waste while people go hungry.
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.65rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#E27244' }}>✕</span> Disjointed calls and messages between parties
              </li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#E27244' }}>✕</span> Delays and difficulty coordinating transport
              </li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#E27244' }}>✕</span> Low visibility and uncertain delivery
              </li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#E27244' }}>✕</span> Mismatched dietary needs and storage requirements
              </li>
            </ul>
          </div>

          {/* Our Solution */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg, 16px)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-forest)', fontWeight: 700 }}>
              Our Solution
            </span>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0.4rem 0 1rem', lineHeight: 1.25 }}>
              One platform to connect, coordinate, and deliver.
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 'bold' }}>✓</span> Smart matching of donors with verified NGOs
              </li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 'bold' }}>✓</span> End-to-end collection and delivery coordination
              </li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 'bold' }}>✓</span> Volunteer assignment and live route tracking
              </li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 'bold' }}>✓</span> Safety compliance and audit-ready chain of custody
              </li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 'bold' }}>✓</span> Real-time donation monitoring and updates
              </li>
            </ul>
          </div>
        </div>

        {/* The Old Way vs The New Way Visual Flow Comparison */}
        <div className="grid-2" style={{ gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
            <strong style={{ fontSize: '0.86rem', color: 'var(--color-saffron)', textTransform: 'uppercase' }}>The Old Way</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.86rem' }}>
              <span className="badge">Donor</span>
              <span>→</span>
              <span className="badge">Phone Calls</span>
              <span>→</span>
              <span className="badge">Delays &amp; Confusion</span>
              <span>→</span>
              <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>Uncertain Delivery</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-mint)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-mint-border)' }}>
            <strong style={{ fontSize: '0.86rem', color: 'var(--color-forest)', textTransform: 'uppercase' }}>The New Way</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.86rem' }}>
              <span className="badge" style={{ backgroundColor: '#ffffff' }}>Donor</span>
              <span>→</span>
              <span className="badge" style={{ backgroundColor: 'var(--color-forest)', color: '#ffffff' }}>Platform</span>
              <span>→</span>
              <span className="badge" style={{ backgroundColor: '#ffffff' }}>NGO Match</span>
              <span>→</span>
              <span className="badge" style={{ backgroundColor: '#ffffff' }}>Volunteer Assigned</span>
              <span>→</span>
              <span className="badge" style={{ backgroundColor: 'var(--color-forest)', color: '#ffffff' }}>Confirmed Delivery ✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 3: 8-Step End-to-End Workflow */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="page-eyebrow">Lifecycle</span>
          <h2 style={{ fontSize: '1.85rem' }}>8-Step End-to-End Workflow</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            From commercial kitchen listing to verified shelter distribution and impact recording.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {[
            { step: '1', title: 'Donor Lists Food', desc: 'Shares batch details and constraints' },
            { step: '2', title: 'Platform Matches', desc: 'Nearby verified NGOs are identified' },
            { step: '3', title: 'NGO Accepts', desc: 'Reviews and confirms allocation' },
            { step: '4', title: 'Volunteer Assigned', desc: 'Courier accepts route for pickup' },
            { step: '5', title: 'QR Pickup Verified', desc: 'Scans code at donor location' },
            { step: '6', title: 'Live Telematics', desc: 'Real-time GPS route tracking' },
            { step: '7', title: 'NGO Receipt Scanned', desc: 'Final QR verification on arrival' },
            { step: '8', title: 'Impact Recorded', desc: 'Logged in public audit ledger' },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 0.75rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-forest)',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                }}
              >
                {item.step}
              </div>
              <strong style={{ display: 'block', fontSize: '0.84rem', lineHeight: 1.25, marginBottom: '0.3rem' }}>
                {item.title}
              </strong>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                {item.desc}
              </div>
            </div>
          ))}
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

      {/* Slide 6: Food Safety & Trust */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="page-eyebrow">Safety &amp; Compliance</span>
          <h2 style={{ fontSize: '1.85rem' }}>Food Safety &amp; Trust</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Rigorous traceability, complete preparation logs, and physical inspection standards.
          </p>
        </div>

        <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.25rem' }}>
          <Card title="Complete Food Information" subtitle="Mandatory specifications logged for every batch">
            <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>•</span>
                <span><strong>Record Food Type &amp; Quantity:</strong> Precise item breakdown and portion count</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>•</span>
                <span><strong>Preparation &amp; Packing Time:</strong> Timestamped kitchen cooking records</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>•</span>
                <span><strong>Storage &amp; Handling Details:</strong> Thermal holding temp (e.g. &gt;65°C hot, &lt;4°C cold)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>•</span>
                <span><strong>Collection Deadline:</strong> Strict safe consumption expiry window</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>•</span>
                <span><strong>Donor Details:</strong> Contact, kitchen location, and verified establishment id</span>
              </div>
            </div>
          </Card>

          <Card title="Trusted Verification Chain" subtitle="Accountability through every handover stage">
            <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-saffron)', fontWeight: 700 }}>1.</span>
                <span><strong>Verified Donor &amp; NGO Accounts:</strong> KYC and premise validation</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-saffron)', fontWeight: 700 }}>2.</span>
                <span><strong>Food Information Before Acceptance:</strong> Transparent review before claiming</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-saffron)', fontWeight: 700 }}>3.</span>
                <span><strong>Pickup &amp; Delivery Confirmation:</strong> Single-use cryptographic QR scans</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-saffron)', fontWeight: 700 }}>4.</span>
                <span><strong>Traceable History of Each Donation:</strong> Immutable governance audit logs</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-saffron)', fontWeight: 700 }}>5.</span>
                <span><strong>Human Visual Inspection:</strong> Mandatory packaging seal check upon arrival</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Slide 6 Important Reminder Callout */}
        <div
          style={{
            backgroundColor: 'rgba(200, 121, 74, 0.12)',
            border: '1px solid rgba(200, 121, 74, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-saffron)',
              color: '#ffffff',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Important Reminder
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', flex: 1 }}>
            <strong>AI organizes information but cannot certify food safety.</strong> Proper thermal handling, hygiene standards, and physical human inspection remain essential at every collection and distribution point.
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
              a: 'The system calculates an explainable score based on Distance (30%), Food Category (20%), Quantity (20%), Urgency (15%), and NGO Capacity (15%). Matches are never accepted automatically without confirmation.',
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
