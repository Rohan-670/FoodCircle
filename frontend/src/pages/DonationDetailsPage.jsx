import React, { useState } from 'react';
import { PageContainer, Card, Badge, Button, Modal } from '../components/ui';
import { MOCK_DONATIONS } from '../data/mockData';

export function DonationDetailsPage({ donationId, onNavigate }) {
  const donation =
    MOCK_DONATIONS.find((d) => d.id === donationId) || MOCK_DONATIONS[0];
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  return (
    <PageContainer
      eyebrow={`Civic Food Rescue • ${donation.category}`}
      title={donation.title}
      subtitle={`Posted by ${donation.donorName} • ${donation.pickupAddress}`}
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => onNavigate('listings')}>
            ← Back to Surplus Catalog
          </Button>
          <Button onClick={() => setRequestModalOpen(true)}>
            Claim / Request Allocation
          </Button>
        </div>
      }
    >
      {/* Statutory & FSSAI Top Notification */}
      <div className="statutory-shield-box" style={{ marginBottom: '1.5rem', padding: '1.1rem 1.35rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <strong style={{ color: 'var(--color-forest)' }}>FSSAI Schedule I Certified Batch</strong>
              <Badge tone="mint">{donation.dietary || 'Vegetarian'}</Badge>
              <Badge tone="forest">{donation.donorTier || 'Tier 5 Verified'}</Badge>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Protected by statutory Good Samaritan immunity (<em>Save Life Foundation v. UOI</em>). Single-use 256-bit QR token generated upon allocation.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>FSSAI Registration</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600 }}>
              {donation.fssaiLicense || 'FSSAI-11223344009182'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-stack">
          <Card
            title="Batch Specification & Logistics SLA"
            badge={
              <Badge tone={donation.urgency === 'CRITICAL' ? 'terracotta' : 'mint'}>
                {donation.status} • {donation.urgency}
              </Badge>
            }
          >
            <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Surplus Volume:</span>
                <strong>{donation.quantity} {donation.unit} ({donation.category})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Holding Temperature:</span>
                <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>{donation.holdingTemp || '64°C (Hot Holding)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Preparation Timestamp:</span>
                <strong>{donation.preparedAt}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Safe-Consumption Deadline:</span>
                <span style={{ color: donation.urgency === 'CRITICAL' ? 'var(--color-saffron)' : 'inherit', fontWeight: 600 }}>
                  {donation.expiresAt} ({donation.hoursRemaining}h remaining)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Target Dispatch SLA:</span>
                <strong>~{donation.slaMinutes || 35} minutes</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Pickup Location:</span>
                <div style={{ marginTop: '0.2rem', fontWeight: 600 }}>{donation.pickupAddress}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{donation.distanceKm} km from central logistics corridor</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <Button onClick={() => setRequestModalOpen(true)}>
                Claim This Batch (Request Allocation)
              </Button>
              <Button
                variant="secondary"
                onClick={() => onNavigate('ngo-dashboard')}
              >
                Inspect Suitability Match
              </Button>
            </div>
          </Card>

          <Card title="Packaging, Thermal Storage & Allergen Notice">
            <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.9rem' }}>
              <div>
                <strong>Packaging Condition:</strong>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{donation.packagingInfo}</div>
              </div>
              <div>
                <strong>Thermal &amp; Storage Requirements:</strong>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{donation.storageRequirements}</div>
              </div>
              <div>
                <strong>Mandatory Allergen Disclosures:</strong>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{donation.allergenInfo}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="form-stack">
          <Card
            title="Donor-Certified FSSAI Safety Checklist"
            subtitle="Verified by donor at handover declaration."
          >
            <ul style={{ listStyle: 'none', display: 'grid', gap: '0.55rem', fontSize: '0.9rem' }}>
              {donation.safetyChecklist.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge tone="mint">✓</Badge>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Statutory Warnings & Food Safety Notice"
            badge={<Badge tone="terracotta">Mandatory</Badge>}
          >
            <ul style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {donation.safetyWarnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </Card>

          <Card title="Chain-of-Custody Delivery Security">
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <p style={{ marginBottom: '0.65rem' }}>
                To prevent fraud or batch substitution, this transaction generates <strong>two cryptographically random 256-bit single-use QR tokens</strong>:
              </p>
              <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                <div>1. <strong>Pickup QR:</strong> Presented by donor at collection point.</div>
                <div>2. <strong>Delivery QR:</strong> Scanned by recipient NGO food bank upon physical handover.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Surplus Food Allocation Request"
        footer={
          <Button onClick={() => setRequestModalOpen(false)}>Acknowledge &amp; Close</Button>
        }
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          In the production system, claiming this batch generates a transactional <code>DonationRequest</code>,
          reserves the surplus volume, and routes an instant notification to <strong>{donation.donorName}</strong> for confirmation.
        </p>
      </Modal>
    </PageContainer>
  );
}

export default DonationDetailsPage;
