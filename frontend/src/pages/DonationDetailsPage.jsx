import React, { useState } from 'react';
import { PageContainer, Card, Badge, Button, Modal } from '../components/ui';
import { getStoredDonations, addStoredRequest } from '../data/store';

export function DonationDetailsPage({ donationId, onNavigate }) {
  const donations = getStoredDonations();
  const donation = donations.find((d) => d.id === donationId) || donations[0];
  const [isRequested, setIsRequested] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleClaim = () => {
    setIsRequested(true);
    addStoredRequest({
      donationId: donation.id,
      donationTitle: donation.title,
      ngoName: 'Local Relief Kitchen',
      servingsNeeded: donation.quantity || 50,
      urgency: donation.urgency || 'HIGH',
      status: 'PENDING',
    });
    setModalOpen(true);
  };

  return (
    <PageContainer
      eyebrow={`Surplus Batch • ${donation.category}`}
      title={donation.title}
      subtitle={`Posted by ${donation.donorName} • ${donation.pickupAddress}`}
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => onNavigate('listings')}>
            ← Back to Catalog
          </Button>
          <Button disabled={isRequested} onClick={handleClaim}>
            {isRequested ? '✓ Allocation Requested' : 'Claim Batch'}
          </Button>
        </div>
      }
    >
      <div className="grid-2">
        <div className="form-stack">
          <Card
            title="Batch Specification"
            badge={
              <Badge tone={donation.urgency === 'CRITICAL' ? 'terracotta' : 'mint'}>
                {donation.status} • {donation.urgency}
              </Badge>
            }
          >
            <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                <strong>{donation.quantity} {donation.unit} ({donation.dietary})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Holding Temperature:</span>
                <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>{donation.holdingTemp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Prepared At:</span>
                <strong>{donation.preparedAt}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Expires:</span>
                <span style={{ color: donation.urgency === 'CRITICAL' ? 'var(--color-saffron)' : 'inherit', fontWeight: 600 }}>
                  {donation.expiresAt} ({donation.hoursRemaining}h remaining)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Target Dispatch:</span>
                <strong>~{donation.slaMinutes} minutes</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Pickup Location:</span>
                <div style={{ marginTop: '0.2rem', fontWeight: 600 }}>{donation.pickupAddress}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{donation.distanceKm} km from central hub</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <Button disabled={isRequested} onClick={handleClaim}>
                {isRequested ? '✓ Allocation Requested' : 'Claim This Batch'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => onNavigate('ngo-dashboard')}
              >
                View Match Recommendations
              </Button>
            </div>
          </Card>

          <Card title="Packaging &amp; Storage">
            <div style={{ display: 'grid', gap: '0.55rem', fontSize: '0.9rem' }}>
              <div>
                <strong>Packaging:</strong>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{donation.packagingInfo}</div>
              </div>
              <div>
                <strong>Storage Requirements:</strong>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{donation.storageRequirements}</div>
              </div>
              {donation.allergenInfo && (
                <div>
                  <strong>Allergen Notice:</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{donation.allergenInfo}</div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="form-stack">
          <Card title="Chain-of-Custody Delivery Security">
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <p style={{ marginBottom: '0.75rem' }}>
                To ensure accountability and prevent fraud, this handover uses <strong>two single-use 256-bit QR tokens</strong>:
              </p>
              <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.84rem' }}>
                <div className="info-strip">
                  <strong>1. Pickup QR Token</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Presented by the donor kitchen and scanned by the volunteer at collection.
                  </div>
                </div>
                <div className="info-strip">
                  <strong>2. Delivery QR Token</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Scanned by the recipient NGO upon physical handover at the community center.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Allocation Request Submitted"
        footer={
          <Button onClick={() => setModalOpen(false)}>Done</Button>
        }
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Your request for <strong>{donation.title}</strong> has been placed.
          The donor and volunteer fleet will coordinate the pickup.
        </p>
      </Modal>
    </PageContainer>
  );
}

export default DonationDetailsPage;
