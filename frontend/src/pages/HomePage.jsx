import React from 'react';
import useHealthCheck from '../hooks/useHealthCheck';
import StatusCard from '../components/StatusCard';

export function HomePage() {
  const { status, data, error, refetch } = useHealthCheck();

  const userRoles = [
    {
      icon: '🏢',
      title: 'Food Donors',
      description: 'Restaurants, caterers, grocery stores, and event halls can post surplus food batches before expiry.',
      bullets: ['Post food listings with quantity & expiry', 'Real-time claim notifications', 'Tax and donation analytics'],
    },
    {
      icon: '🤝',
      title: 'NGOs & Charities',
      description: 'Verified non-profits can browse available surplus listings, request allocations, and feed communities.',
      bullets: ['Browse surplus listings nearby', 'Reserve donations instantly', 'Track delivery status in real-time'],
    },
    {
      icon: '🚴',
      title: 'Volunteers',
      description: 'Local dispatchers and delivery champions assist in transporting surplus food safely and swiftly.',
      bullets: ['Accept pickup tasks in your area', 'Optimized Leaflet map navigation', 'Proof-of-handover verification'],
    },
    {
      icon: '🛡️',
      title: 'Administrators',
      description: 'Platform managers verify NGO credentials, monitor safety compliance, and audit platform activities.',
      bullets: ['Verify organization certificates', 'Safety & dispute management', 'System-wide impact analytics'],
    },
  ];

  const techStack = [
    { label: 'Frontend', value: 'React 18 + Vite (JavaScript)' },
    { label: 'Backend', value: 'Node.js + Express.js' },
    { label: 'Database & ORM', value: 'PostgreSQL + Prisma' },
    { label: 'Authentication', value: 'JWT + bcrypt password hashing' },
    { label: 'Real-Time Updates', value: 'Socket.IO' },
    { label: 'Mapping & Geolocation', value: 'Leaflet & OpenStreetMap' },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <span className="hero-tag">Student Project Architecture</span>
        <h1>Surplus Food Donation &amp; NGO Coordination System</h1>
        <p className="hero-subtitle">
          Bridging the gap between food businesses with surplus edible food and local NGOs serving
          families in need, powered by volunteer logistics and real-time coordination.
        </p>
      </section>

      {/* Backend API Live Status */}
      <StatusCard
        status={status}
        data={data}
        error={error}
        onRefresh={refetch}
      />

      {/* Roles Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Platform Stakeholders
        </h2>
        <div className="grid-cards">
          {userRoles.map((role) => (
            <div key={role.title} className="card">
              <div className="card-header">
                <span className="card-icon">{role.icon}</span>
                <h3>{role.title}</h3>
              </div>
              <p>{role.description}</p>
              <ul className="card-role-list">
                {role.bullets.map((bullet, idx) => (
                  <li key={idx} className="card-role-item">
                    <span className="card-role-bullet">✓</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & Tech Stack Card */}
      <section>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Production Tech Stack
        </h2>
        <div className="grid-cards">
          {techStack.map((tech) => (
            <div key={tech.label} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {tech.label}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                {tech.value}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
