import React from 'react';
import { PageContainer, Card, Badge, Button } from '../components/ui';
import { MOCK_DONATIONS } from '../data/mockData';

export function LandingPage({ onNavigate }) {
  const featured = MOCK_DONATIONS[0];

  return (
    <PageContainer showMockBanner={false}>
      <section className="hero-editorial">
        <div>
          <Badge tone="mint">Food-Rescue Coordination Platform</Badge>
          <h1 style={{ marginTop: '0.85rem' }}>
            Redirecting surplus meals from kitchens to communities, safely and on time.
          </h1>
          <p className="hero-lead">
            A transparent coordination system uniting verified food donors, local NGOs,
            dispatch volunteers, and administrators with safety-first checklists,
            explainable matching, and single-use QR handoffs.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button size="lg" onClick={() => onNavigate('listings')}>
              Browse Surplus Listings
            </Button>
            <Button variant="secondary" size="lg" onClick={() => onNavigate('signup')}>
              Register Organization
            </Button>
            <Button variant="ghost" size="lg" onClick={() => onNavigate('login')}>
              Sign In
            </Button>
          </div>
        </div>

        <Card
          title={featured.title}
          subtitle={`Sample Preview • ${featured.donorName}`}
          badge={<Badge tone="terracotta">Mock Preview • {featured.urgency}</Badge>}
          footer={
            <>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {featured.pickupAddress}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('details', featured.id)}
              >
                Inspect Details
              </Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: '0.55rem', fontSize: '0.9rem' }}>
            <div>
              <strong>Quantity:</strong> {featured.quantity} {featured.unit} ({featured.category})
            </div>
            <div>
              <strong>Deadline:</strong> {featured.expiresAt} ({featured.hoursRemaining}h remaining)
            </div>
            <div className="info-strip" style={{ marginTop: '0.35rem' }}>
              <strong>Safety Notice:</strong> Donor-completed checklist &amp; storage
              requirements verified at posting. Photos do not certify food safety.
            </div>
          </div>
        </Card>
      </section>

      {/* Stakeholder Roles */}
      <section style={{ marginBottom: '2.75rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="page-eyebrow">Four Coordinated Roles</span>
          <h2>Built for accountability at every step</h2>
        </div>

        <div className="grid-4">
          <Card
            interactive
            title="Food Donors"
            badge={<Badge tone="mint">Kitchens &amp; Grocers</Badge>}
            footer={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('donor-dashboard')}
              >
                Preview Donor Layout →
              </Button>
            }
          >
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Log surplus batches with preparation times, storage conditions, allergens, and
              safety checklists. Review and approve NGO requests.
            </p>
          </Card>

          <Card
            interactive
            title="NGOs &amp; Charities"
            badge={<Badge tone="sage">Verified Partners</Badge>}
            footer={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('ngo-dashboard')}
              >
                Preview NGO Layout →
              </Button>
            }
          >
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Filter nearby surplus food, inspect transparent suitability scores, request
              allocations, and dispatch volunteers.
            </p>
          </Card>

          <Card
            interactive
            title="Volunteers"
            badge={<Badge tone="neutral">Logistics</Badge>}
            footer={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('volunteer-dashboard')}
              >
                Preview Volunteer Layout →
              </Button>
            }
          >
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Accept open pickup tasks, share live GPS with explicit consent, and confirm
              chain-of-custody using single-use QR tokens.
            </p>
          </Card>

          <Card
            interactive
            title="Administrators"
            badge={<Badge tone="forest">Governance</Badge>}
            footer={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-dashboard')}
              >
                Preview Admin Layout →
              </Button>
            }
          >
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Verify organization credentials, review food safety reports, manage account
              status, and inspect immutable audit logs.
            </p>
          </Card>
        </div>
      </section>

      {/* Design & Safety Principles */}
      <section className="grid-3">
        <Card title="1. Transparent Matching">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Heuristic suitability scores clearly break down distance, category, quantity,
            urgency, and NGO capacity—never hiding decisions behind opaque AI.
          </p>
        </Card>
        <Card title="2. Responsible Food Safety">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Every batch records preparation time, safe-consumption deadline, allergens, and
            storage requirements. Overdue listings automatically expire.
          </p>
        </Card>
        <Card title="3. Verified Handoffs">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Unpredictable, single-use QR tokens prevent replay attacks during pickup and
            delivery, while consent-based GPS sharing stops automatically on completion.
          </p>
        </Card>
      </section>
    </PageContainer>
  );
}

export default LandingPage;
