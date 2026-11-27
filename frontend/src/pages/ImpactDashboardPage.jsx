import React, { useState } from 'react';
import { PageContainer, Card, Badge, Button } from '../components/ui';

/**
 * Slide 7: Platform Modules & Impact Dashboard
 * "Built for every role. Insights that drive impact."
 * Features 5 core KPIs, Deliveries Overview chart, Location Activity map, and Recent Donations ledger.
 * Also includes Slide 8 (Technical Architecture) and Slide 9 (Expected Benefits & Future Enhancements).
 */
export function ImpactDashboardPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'listings' | 'deliveries' | 'architecture' | 'roadmap'
  const [selectedDay, setSelectedDay] = useState('Wed');

  const KPI_METRICS = [
    { label: 'Listings', value: '126', note: 'Active & catalogued batches' },
    { label: 'Delivered Donations', value: '87', note: 'Fully verified handoffs' },
    { label: 'Estimated Portions', value: '4,350', note: 'Wholesome meals served' },
    { label: 'Active NGOs', value: '32', note: 'Verified community kitchens' },
    { label: 'Completed Deliveries', value: '74', note: 'Zero transit loss' },
  ];

  const WEEKLY_DELIVERIES = [
    { day: 'Mon', count: 42, height: '52%' },
    { day: 'Tue', count: 68, height: '82%' },
    { day: 'Wed', count: 75, height: '94%' },
    { day: 'Thu', count: 52, height: '65%' },
    { day: 'Fri', count: 70, height: '88%' },
    { day: 'Sat', count: 35, height: '44%' },
    { day: 'Sun', count: 24, height: '30%' },
  ];

  const RECENT_DONATIONS = [
    {
      id: 'DN-1024',
      donor: 'Green Leaf Cafe',
      items: 'Rice, Vegetables, Fruits',
      quantity: '45 kg',
      ngo: 'Helping Hands',
      status: 'Delivered',
      tone: 'mint',
    },
    {
      id: 'DN-1023',
      donor: 'Fresh Mart',
      items: 'Fresh Dairy',
      quantity: '28 kg',
      ngo: 'Care for All',
      status: 'In Transit',
      tone: 'terracotta',
    },
    {
      id: 'DN-1022',
      donor: 'Sunrise Bakery',
      items: 'Bread, Pastries',
      quantity: '32 kg',
      ngo: 'Food for All',
      status: 'Picked Up',
      tone: 'forest',
    },
    {
      id: 'DN-1021',
      donor: 'City Supermarket',
      items: 'Vegetables, Fruits',
      quantity: '60 kg',
      ngo: 'Helping Hands',
      status: 'Delivered',
      tone: 'mint',
    },
  ];

  return (
    <PageContainer
      eyebrow="Platform Modules & Dashboard"
      title="System Insights & Impact Analytics"
      subtitle="Built for every role. Transparent metrics that drive real community impact."
      actions={
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            Impact Overview
          </Button>
          <Button
            variant={activeTab === 'architecture' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('architecture')}
          >
            System Architecture
          </Button>
          <Button
            variant={activeTab === 'roadmap' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('roadmap')}
          >
            Future Enhancements
          </Button>
        </div>
      }
    >
      {/* 5 KPI Metric Cards (Slide 7 Top Row) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {KPI_METRICS.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md, 12px)',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '2.1rem',
                fontWeight: 700,
                color: 'var(--color-forest)',
                lineHeight: 1.1,
              }}
            >
              {kpi.value}
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: '0.4rem',
              }}
            >
              {kpi.label}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {kpi.note}
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="form-stack">
          {/* Middle Row: Location Activity + Deliveries Overview Bar Chart */}
          <div className="grid-2" style={{ marginBottom: '0.5rem' }}>
            {/* Location Activity / Metro Corridor Hubs */}
            <Card
              title="Location Activity"
              subtitle="Active distribution hubs and verified surplus corridors"
              badge={<Badge tone="forest">Live Network</Badge>}
            >
              <div
                style={{
                  background: 'linear-gradient(145deg, #1A3027 0%, #203C32 100%)',
                  borderRadius: 'var(--radius-md, 10px)',
                  padding: '1.25rem',
                  color: '#ffffff',
                  minHeight: '220px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#B8D7C7', textTransform: 'uppercase' }}>
                    Central Logistics Clusters
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: '2px' }}>
                    Bengaluru Metropolitan Region
                  </div>
                </div>

                {/* SVG Visual Node Mesh */}
                <svg viewBox="0 0 400 120" style={{ width: '100%', height: '110px' }}>
                  {/* Corridors */}
                  <line x1="80" y1="60" x2="190" y2="40" stroke="rgba(184,215,199,0.4)" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="190" y1="40" x2="310" y2="70" stroke="rgba(184,215,199,0.4)" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="190" y1="40" x2="210" y2="95" stroke="rgba(184,215,199,0.4)" strokeWidth="2" strokeDasharray="3 3" />

                  {/* Hub 1: Koramangala */}
                  <circle cx="80" cy="60" r="18" fill="rgba(226,114,68,0.25)" />
                  <circle cx="80" cy="60" r="7" fill="#E27244" />
                  <text x="80" y="90" fill="#F6F2E8" fontSize="10" fontWeight="600" textAnchor="middle">
                    Koramangala (42 kg)
                  </text>

                  {/* Hub 2: Central CBD */}
                  <circle cx="190" cy="40" r="22" fill="rgba(111,155,138,0.3)" />
                  <circle cx="190" cy="40" r="8" fill="#6F9B8A" />
                  <text x="190" y="24" fill="#F6F2E8" fontSize="10" fontWeight="600" textAnchor="middle">
                    Central CBD (86 kg)
                  </text>

                  {/* Hub 3: Indiranagar */}
                  <circle cx="310" cy="70" r="18" fill="rgba(226,114,68,0.25)" />
                  <circle cx="310" cy="70" r="7" fill="#E27244" />
                  <text x="310" y="100" fill="#F6F2E8" fontSize="10" fontWeight="600" textAnchor="middle">
                    Indiranagar (54 kg)
                  </text>

                  {/* Hub 4: South Ward */}
                  <circle cx="210" cy="95" r="12" fill="rgba(184,215,199,0.3)" />
                  <circle cx="210" cy="95" r="5" fill="#B8D7C7" />
                </svg>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#B8D7C7' }}>
                  <span>● 8 Verified Commercial Kitchens</span>
                  <span>● 6 Distribution Centers</span>
                </div>
              </div>
            </Card>

            {/* Deliveries Overview Bar Chart (Mon-Sun) */}
            <Card
              title="Deliveries Overview"
              subtitle="Weekly verified handoff volumes across all wards"
              badge={<Badge tone="mint">Weekly Peak: Wed</Badge>}
            >
              <div style={{ padding: '0.5rem 0' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: '160px',
                    gap: '0.75rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  {WEEKLY_DELIVERIES.map((item) => {
                    const isSelected = selectedDay === item.day;
                    return (
                      <div
                        key={item.day}
                        onClick={() => setSelectedDay(item.day)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: isSelected ? 'var(--color-saffron)' : 'var(--text-secondary)',
                            marginBottom: '4px',
                          }}
                        >
                          {item.count}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            height: item.height,
                            backgroundColor: isSelected ? 'var(--color-saffron)' : 'var(--color-forest)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'all 0.2s ease',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Day Labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  {WEEKLY_DELIVERIES.map((item) => (
                    <div
                      key={item.day}
                      onClick={() => setSelectedDay(item.day)}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '0.76rem',
                        fontWeight: selectedDay === item.day ? 700 : 500,
                        color: selectedDay === item.day ? 'var(--color-forest)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {item.day}
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Selected <strong>{selectedDay}</strong>: {WEEKLY_DELIVERIES.find((d) => d.day === selectedDay)?.count} verified deliveries completed
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Donations Ledger Table (Slide 7 Bottom Table) */}
          <Card
            title="Recent Donations"
            subtitle="Live ledger of completed and in-transit surplus batches"
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Showing 4 of 126 recorded transactions
                </span>
                <Button variant="secondary" size="sm" onClick={() => onNavigate('listings')}>
                  Open Surplus Catalog →
                </Button>
              </div>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>ID</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Donor</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Items</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Quantity</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>NGO Recipient</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_DONATIONS.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{row.id}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{row.donor}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{row.items}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{row.quantity}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{row.ngo}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <Badge tone={row.tone}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Slide 8: Technical Architecture View */}
      {activeTab === 'architecture' && (
        <Card
          title="Technical Architecture"
          subtitle="Built on modern, open technologies for scale, security, and real-time impact."
          badge={<Badge tone="forest">Full Stack Spec</Badge>}
        >
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div className="grid-3">
              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.92rem', color: 'var(--color-forest)' }}>Frontend</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.35rem 0' }}>
                  React 19, responsive role dashboards, design token system, SVG live telemetry, and Leaflet/OSM mapping.
                </p>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>• Pure CSS variables • Light/Dark mode</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.92rem', color: 'var(--color-forest)' }}>Backend &amp; APIs</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.35rem 0' }}>
                  Node.js + Express, REST APIs, WebSocket / Socket.IO for real-time delivery telemetry, and Helmet security.
                </p>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>• RBAC boundaries • JWT Auth</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.92rem', color: 'var(--color-forest)' }}>Database &amp; Engine</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.35rem 0' }}>
                  PostgreSQL with Prisma ORM: Users, Donations, NGO Requirements, Deliveries, and Transparent Matching Engine.
                </p>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>• Multi-factor weighted score</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-mint)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-mint-border)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-forest)', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
                External Services &amp; Hardware Integration
              </div>
              <div className="grid-3" style={{ fontSize: '0.82rem', color: 'var(--color-forest)' }}>
                <div><strong>OpenStreetMap:</strong> Map tiles and spatial geometry</div>
                <div><strong>OSRM / OpenRouteService:</strong> Turn-by-turn routing and ETA calculations</div>
                <div><strong>Browser Geolocation API:</strong> Volunteer courier live telemetry</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Slide 9: Expected Benefits & Future Enhancements View */}
      {activeTab === 'roadmap' && (
        <Card
          title="Expected Impact &amp; Future Enhancements"
          subtitle="Measurable societal benefits today and strategic roadmap milestones for tomorrow."
          badge={<Badge tone="terracotta">Roadmap</Badge>}
        >
          <div className="grid-2">
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-forest)' }}>
                Expected Benefits
              </h4>
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {[
                  { num: '01', title: 'Redirect Surplus to Those in Need', desc: 'Eliminates landfill waste while providing nutritious meals to shelters.' },
                  { num: '02', title: 'Reduce Communication Delays', desc: 'Replaces disjointed phone calls with an automated matching engine.' },
                  { num: '03', title: 'Improve Collection Coordination', desc: 'Predictable dispatch and volunteer courier route verification.' },
                  { num: '04', title: 'Ensure Transparency and Traceability', desc: 'Single-use QR code chain of custody and immutable audit logs.' },
                ].map((item) => (
                  <div key={item.num} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-saffron)', fontSize: '1.05rem', minWidth: '26px' }}>{item.num}</div>
                    <div>
                      <strong style={{ fontSize: '0.86rem' }}>{item.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-forest)' }}>
                Future Possibilities
              </h4>
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {[
                  { icon: '🤖', title: 'AI-Assisted Food Quantity Estimation', desc: 'Computer vision estimation from donor kitchen photos.' },
                  { icon: '📊', title: 'NGO Demand Forecasting', desc: 'Predictive analytics based on shelter occupancy trends.' },
                  { icon: '🌐', title: 'Multi-City Network Expansion', desc: 'Inter-corridor logistics for regional food banks.' },
                  { icon: '🌡️', title: 'IoT Cold-Chain Temperature Monitoring', desc: 'Automated alerts for thermal storage boundary breaches.' },
                  { icon: '🗺️', title: 'Multi-Pickup Route Optimization', desc: 'Combined single-run pickups across adjacent donor kitchens.' },
                ].map((item) => (
                  <div key={item.title} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '1.2rem' }}>{item.icon}</div>
                    <div>
                      <strong style={{ fontSize: '0.86rem' }}>{item.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}

export default ImpactDashboardPage;
