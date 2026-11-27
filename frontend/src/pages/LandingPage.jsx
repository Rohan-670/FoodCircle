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
      {/* Editorial Hero Banner with donatefood.in styling */}
      <section className="hero-banner-accent hero-dot-grid">
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge tone="forest">Digital Public Infrastructure</Badge>
              <Badge tone="mint">FSSAI 2019 Schedule I</Badge>
              <Badge tone="terracotta">Zero Commercial Waste</Badge>
            </div>

            <h1 className="hero-title-lead">
              Turning Surplus Food into{' '}
              <span className="hero-title-highlight">Community Nutrition</span>
            </h1>

            <p className="hero-lead">
              India wastes ~78 million tonnes of food annually while millions face nutritional insecurity.
              FoodCircle provides transparent algorithmic matching, responsible food safety compliance,
              and verified volunteer coordination to eliminate food waste across our neighborhoods.
            </p>

            <div className="hero-cta-pills">
              <Button
                size="lg"
                className="btn-pill"
                onClick={() => onNavigate('donor-dashboard')}
              >
                I Have Food (Log Surplus)
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="btn-pill"
                onClick={() => onNavigate('ngo-dashboard')}
              >
                I Need Food (NGO Portal)
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="btn-pill"
                onClick={() => onNavigate('volunteer-dashboard')}
              >
                Volunteer Dispatch
              </Button>
            </div>
          </div>

          {/* Featured Live Donation Card */}
          <Card
            title={featured.title}
            subtitle={`Live Batch • ${featured.donorName}`}
            badge={<Badge tone="terracotta">Urgent • {featured.hoursRemaining}h Remaining</Badge>}
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
                  Inspect Batch →
                </Button>
              </div>
            }
          >
            <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Volume / Quantity:</span>
                <strong>{featured.quantity} {featured.unit} ({featured.dietary})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>FSSAI Verification:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                  {featured.fssaiLicense}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Holding Temp:</span>
                <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>{featured.holdingTemp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Turnaround SLA:</span>
                <strong>{featured.slaMinutes} min dispatch</strong>
              </div>

              <div className="info-strip" style={{ marginTop: '0.4rem', fontSize: '0.82rem' }}>
                <strong>Statutory Notice:</strong> Prepared and packaged under FSSAI Schedule I.
                Protected under Good Samaritan guidelines. Photos do not certify food safety.
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Impact Metric KPIs modeled on donatefood.in */}
      <section className="impact-kpi-bar">
        <div className="impact-kpi-card">
          <div className="impact-kpi-num">{MOCK_IMPACT_METRICS.mealsRescued}</div>
          <div className="impact-kpi-sub">Meals Rescued</div>
          <div className="impact-kpi-detail">{MOCK_IMPACT_METRICS.mealsEstimated} delivered to verified shelters</div>
        </div>

        <div className="impact-kpi-card">
          <div className="impact-kpi-num">{MOCK_IMPACT_METRICS.verifiedNgos}</div>
          <div className="impact-kpi-sub">Verified NGO Partners</div>
          <div className="impact-kpi-detail">NITI Aayog DARPAN validated</div>
        </div>

        <div className="impact-kpi-card">
          <div className="impact-kpi-num">{MOCK_IMPACT_METRICS.activeVolunteers}</div>
          <div className="impact-kpi-sub">Active Logistics Couriers</div>
          <div className="impact-kpi-detail">Single-use QR chain of custody verified</div>
        </div>

        <div className="impact-kpi-card">
          <div className="impact-kpi-num">{MOCK_IMPACT_METRICS.avgDispatchSla}</div>
          <div className="impact-kpi-sub">Average Turnaround SLA</div>
          <div className="impact-kpi-detail">Preserving cooked food consumption window</div>
        </div>
      </section>

      {/* Purpose-Built Role Pathways modeled on donatefood.in */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="page-eyebrow">Four Purpose-Built Pathways</span>
          <h2 style={{ fontSize: '2rem' }}>Engineered for Accountability at Every Step</h2>
        </div>

        <div className="grid-4">
          {/* Pathway 1: Donor */}
          <div className="pathway-card">
            <div>
              <div className="pathway-icon-bubble">🍲</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Donor Workflow
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Banquets, cafeterias, cloud kitchens, and grocers. Log surplus batches with preparation time,
                safe holding temperatures (&lt;7°C / &gt;60°C), allergen notices, and FSSAI safety checklists.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('donor-dashboard')}
            >
              I Have Food (Donor Flow) →
            </Button>
          </div>

          {/* Pathway 2: NGO */}
          <div className="pathway-card pathway-saffron">
            <div>
              <div className="pathway-icon-bubble bubble-saffron">🤝</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                NGO &amp; Food Banks
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Verified community kitchens, shelters, and orphanages. Filter surplus with transparent 5-factor
                suitability scores (Distance 30%, Category 20%, Quantity 20%, Urgency 15%, Capacity 15%).
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('ngo-dashboard')}
            >
              I Need Food (NGO Portal) →
            </Button>
          </div>

          {/* Pathway 3: Volunteer */}
          <div className="pathway-card">
            <div>
              <div className="pathway-icon-bubble">🛵</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Citizen Logistics
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Accept open delivery tasks, preview turn-by-turn routes, share live GPS tracking with consent,
                and complete handoffs using single-use 256-bit QR tokens that prevent replay.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('volunteer-dashboard')}
            >
              Volunteer Task Board →
            </Button>
          </div>

          {/* Pathway 4: Admin */}
          <div className="pathway-card">
            <div>
              <div className="pathway-icon-bubble">🛡️</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Governance &amp; Trust
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                NITI Aayog DARPAN credential verification, 5-tier privileges, food safety incident reports,
                and immutable audit logs for total institutional compliance.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('admin-dashboard')}
            >
              Admin Governance Hub →
            </Button>
          </div>
        </div>
      </section>

      {/* Real-Time Proximity Geo-Locator modeled directly on donatefood.in */}
      <section className="geo-locator-shell">
        <div className="geo-locator-header">
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
              Algorithmic Proximity Radar
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff', margin: '0.25rem 0' }}>
              Real-Time Surplus Food &amp; Verified Hub Locator
            </h2>
            <p style={{ fontSize: '0.88rem', opacity: 0.9, maxWidth: '60ch' }}>
              Locate nearby active surplus batches and verified food banks with live SLA turnaround times,
              cold chain capacity, and direct allocation routing.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.85rem',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              {MOCK_METRO_HUBS.map((hub) => (
                <option key={hub.id} value={hub.id} style={{ color: '#0f172a' }}>
                  {hub.name} ({hub.state})
                </option>
              ))}
            </select>
            <Button
              size="sm"
              style={{ backgroundColor: 'var(--color-saffron)', color: '#ffffff', border: 'none' }}
              onClick={() => setSelectedRadius('5 km')}
            >
              📍 My Location
            </Button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="geo-controls-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
                  Within {r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
                  {cat === 'ALL' ? 'All Surplus' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Available Surplus Results */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Active Surplus Listings in Range ({filteredSurplus.length} available)
          </div>

          {filteredSurplus.map((item) => (
            <div key={item.id} className="geo-item-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <strong>{item.title}</strong>
                  <Badge tone={item.urgency === 'CRITICAL' ? 'terracotta' : 'mint'}>
                    {item.urgency}
                  </Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                    {item.donorTier}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  📍 {item.pickupAddress} • {item.donorName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Quantity &amp; Temp</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  {item.quantity} {item.unit}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-forest)' }}>{item.holdingTemp}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Distance &amp; SLA</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                  {item.distanceKm} km away
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  ~{item.slaMinutes} min dispatch
                </div>
              </div>

              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onNavigate('details', item.id)}
                >
                  Inspect &amp; Claim →
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Verified Food Banks in Area */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Verified Community Food Banks in Area (NITI Aayog DARPAN Validated)
          </div>

          <div className="grid-3">
            {MOCK_VERIFIED_FOOD_BANKS.map((fb) => (
              <Card
                key={fb.id}
                title={fb.name}
                subtitle={`DARPAN: ${fb.darpanId} • ${fb.distanceKm} km away`}
                badge={<Badge tone="forest">{fb.tier}</Badge>}
                footer={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('ngo-dashboard')}
                  >
                    Route to this Hub →
                  </Button>
                }
              >
                <div style={{ fontSize: '0.82rem', display: 'grid', gap: '0.35rem' }}>
                  <div><strong>Distribution SLA:</strong> {fb.turnaroundSla}</div>
                  <div><strong>Cold Chain:</strong> {fb.coldChain}</div>
                  <div><strong>Capacity:</strong> {fb.capacityKg} kg buffer ({fb.servingsDaily})</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>📍 {fb.address}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Food Safety & Statutory Good Samaritan Protection Callout */}
      <section className="statutory-shield-box">
        <div className="statutory-shield-title">
          <span>🛡️</span>
          <span>Food Safety Standards &amp; Good Samaritan Legal Shield</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: '0.75rem' }}>
          Under the landmark Supreme Court judgement (<em>Save Life Foundation v. Union of India</em>) and FSSAI 2019 guidelines, food donors, hoteliers, and volunteers who contribute edible surplus meals in good faith are protected from civil or criminal liabilities.
        </p>
        <div className="grid-3" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <strong>1. Temperature Integrity</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Cooked batches must maintain &gt;60°C hot holding or rapid chill &lt;7°C in insulated containers.
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <strong>2. Consumption Window</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Cooked meals must reach beneficiaries within 4 hours. Automated countdown timers prevent distribution of expired food.
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <strong>3. Responsible Verification</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Mandatory donor checklists track food safety responsibly. The platform does not claim AI or photos can certify safety.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion modeled on donatefood.in */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="page-eyebrow">Institutional Clarity</span>
          <h2 style={{ fontSize: '1.8rem' }}>Frequently Asked Questions</h2>
        </div>

        <div className="faq-accordion">
          {[
            {
              q: 'How does the transparent matching algorithm work without paid AI APIs?',
              a: 'The system uses an explainable multi-factor scoring model: Distance Suitability (30%), Food Category Match (20%), Quantity Match (20%), Urgency & Expiry (15%), and NGO Capacity (15%). Every recommendation shows a clear breakdown of why it was suggested, and decisions are never made automatically without human confirmation.',
            },
            {
              q: 'What legal protection do food donors and logistics volunteers have?',
              a: 'Donors and volunteers are protected under the Good Samaritan legal framework established by the Supreme Court of India and FSSAI surplus food regulations. Anyone donating wholesome, uncontaminated food in good faith is immune from civil and criminal prosecution.',
            },
            {
              q: 'How do single-use QR codes guarantee delivery security and chain of custody?',
              a: 'Pickup and delivery tokens are cryptographically generated 256-bit single-use keys validated by the backend. A QR code cannot be reused or guessed, and confirmation requires scanning at both the donor pickup location and the recipient NGO hub.',
            },
            {
              q: 'How are NGOs and community food banks verified before receiving food?',
              a: 'NGOs must provide their NITI Aayog DARPAN ID and undergo administrator verification. The platform assigns privilege tiers based on cold-chain infrastructure, daily meal capacity, and past distribution track records.',
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
                  <span style={{ fontSize: '1.2rem', color: 'var(--color-forest)', fontWeight: 700 }}>
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
