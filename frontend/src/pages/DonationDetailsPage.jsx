import React, { useState } from 'react';
import { PageContainer, Card, Badge, Button, Modal } from '../components/ui';
import { MOCK_DONATIONS } from '../data/mockData';

export function DonationDetailsPage({ donationId, onNavigate }) {
  const donation =
    MOCK_DONATIONS.find((d) => d.id === donationId) || MOCK_DONATIONS[0];
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  return (
    <PageContainer
      eyebrow={`Donation Batch • ${donation.category}`}
      title={donation.title}
      subtitle={`Posted by ${donation.donorName} • ${donation.pickupAddress}`}
      actions={
        <Button variant="secondary" onClick={() => onNavigate('listings')}>
          ← Back to Listings
        </Button>
      }
    >
      <div className="grid-2">
        <div className="form-stack">
          <Card
            title="Batch & Logistics Summary"
            badge={
              <Badge tone={donation.urgency === 'CRITICAL' ? 'terracotta' : 'mint'}>
                {donation.status} • {donation.urgency}
              </Badge>
            }
          >
            <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.92rem' }}>
              <div>
                <strong>Quantity:</strong> {donation.quantity} {donation.unit}
              </div>
              <div>
                <strong>Preparation / Collection Time:</strong> {donation.preparedAt}
              </div>
              <div>
                <strong>Safe-Consumption Deadline:</strong> {donation.expiresAt} (
                {donation.hoursRemaining}h remaining)
              </div>
              <div>
                <strong>Pickup Address:</strong> {donation.pickupAddress} (
                {donation.distanceKm} km from sample hub)
              </div>
              <div>
                <strong>Donor Verification:</strong>{' '}
                {donation.donorVerified ? (
                  <Badge tone="mint">Verified Donor ✓</Badge>
                ) : (
                  <Badge tone="neutral">Pending Verification</Badge>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <Button onClick={() => setRequestModalOpen(true)}>
                Request This Batch (Preview)
              </Button>
              <Button
                variant="secondary"
                disabled
                title="Safety reporting requires live backend connection"
              >
                Report Concern
              </Button>
            </div>
          </Card>

          <Card title="Packaging, Storage & Allergens">
            <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div>
                <strong>Packaging Condition:</strong> {donation.packagingInfo}
              </div>
              <div>
                <strong>Storage Requirements:</strong> {donation.storageRequirements}
              </div>
              <div>
                <strong>Allergen Information:</strong> {donation.allergenInfo}
              </div>
            </div>
          </Card>
        </div>

        <div className="form-stack">
          <Card
            title="Donor-Provided Food Safety Checklist"
            subtitle="Self-reported by donor at time of posting."
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
            title="Food Safety Warnings & Responsibility Notice"
            badge={<Badge tone="terracotta">Important</Badge>}
          >
            <ul style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {donation.safetyWarnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Static UI Preview — Request Not Sent"
        footer={
          <Button onClick={() => setRequestModalOpen(false)}>Close</Button>
        }
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          In the connected application, submitting this request creates a transactional{' '}
          <code>PENDING</code> <code>DonationRequest</code> for{' '}
          <strong>{donation.title}</strong> and notifies the donor in real time.
        </p>
      </Modal>
    </PageContainer>
  );
}

export default DonationDetailsPage;
