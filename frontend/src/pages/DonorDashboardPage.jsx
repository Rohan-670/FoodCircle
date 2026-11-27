import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as donationService from '../services/donationService';

const EDITABLE_STATUSES = ['AVAILABLE', 'REQUESTED'];

const INITIAL_FORM = {
  title: '',
  description: '',
  foodCategory: 'Cooked Meals',
  quantity: '',
  unit: 'servings',
  preparedAt: '',
  expiresAt: '',
  pickupAddress: '',
  latitude: '',
  longitude: '',
  packagingInfo: '',
  allergenInfo: '',
  storageRequirements: 'Refrigerated (below 5°C)',
  safetyChecklist: {
    properlyPackaged: false,
    storedAtSafeTemp: false,
    withinSafeConsumptionWindow: false,
    noSpoilageSigns: false,
  },
};

export function DonorDashboardPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    pickupAddress: user?.donorProfile?.address || '',
  });

  const loadDonations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await donationService.getDonorDonations();
      setDonations(data.donations || []);
    } catch (err) {
      setError(err.message || 'Failed to load donation history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChecklistChange = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      safetyChecklist: {
        ...prev.safetyChecklist,
        [name]: checked,
      },
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setImageFile(null);
    setForm({
      ...INITIAL_FORM,
      pickupAddress: user?.donorProfile?.address || '',
    });
  };

  const handleStartEdit = (donation) => {
    setError('');
    setSuccessMsg('');
    setEditingId(donation.id);
    setImageFile(null);
    setForm({
      title: donation.title || '',
      description: donation.description || '',
      foodCategory: donation.foodCategory || 'Cooked Meals',
      quantity: String(donation.quantity || ''),
      unit: donation.unit || 'servings',
      preparedAt: donation.preparedAt
        ? new Date(donation.preparedAt).toISOString().slice(0, 16)
        : '',
      expiresAt: donation.expiresAt
        ? new Date(donation.expiresAt).toISOString().slice(0, 16)
        : '',
      pickupAddress: donation.pickupAddress || '',
      latitude: donation.latitude ?? '',
      longitude: donation.longitude ?? '',
      packagingInfo: donation.packagingInfo || '',
      allergenInfo: donation.allergenInfo || '',
      storageRequirements: donation.storageRequirements || '',
      safetyChecklist: donation.safetyChecklist || {
        properlyPackaged: true,
        storedAtSafeTemp: true,
        withinSafeConsumptionWindow: true,
        noSpoilageSigns: true,
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      if (form.description) formData.append('description', form.description);
      formData.append('foodCategory', form.foodCategory);
      formData.append('quantity', form.quantity);
      formData.append('unit', form.unit);
      if (form.preparedAt) {
        formData.append('preparedAt', new Date(form.preparedAt).toISOString());
      }
      formData.append('expiresAt', new Date(form.expiresAt).toISOString());
      formData.append('pickupAddress', form.pickupAddress);
      if (form.latitude !== '') formData.append('latitude', form.latitude);
      if (form.longitude !== '') formData.append('longitude', form.longitude);
      formData.append('packagingInfo', form.packagingInfo);
      if (form.allergenInfo) formData.append('allergenInfo', form.allergenInfo);
      formData.append('storageRequirements', form.storageRequirements);
      formData.append('safetyChecklist', JSON.stringify(form.safetyChecklist));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingId) {
        await donationService.updateDonation(editingId, formData);
        setSuccessMsg('Donation updated successfully.');
      } else {
        await donationService.createDonation(formData);
        setSuccessMsg('Surplus food donation posted successfully.');
      }

      resetForm();
      await loadDonations();
    } catch (err) {
      const details = Array.isArray(err.errors)
        ? err.errors.map((eItem) => `${eItem.field}: ${eItem.message}`).join(' | ')
        : '';
      setError(details ? `${err.message} (${details})` : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDonation = async (donationId) => {
    setError('');
    setSuccessMsg('');
    try {
      await donationService.cancelDonation(donationId);
      setSuccessMsg('Donation cancelled.');
      await loadDonations();
    } catch (err) {
      setError(err.message || 'Failed to cancel donation.');
    }
  };

  const handleRespondToRequest = async (requestId, action) => {
    setError('');
    setSuccessMsg('');
    try {
      await donationService.respondToRequest(requestId, action);
      setSuccessMsg(
        action === 'ACCEPT'
          ? 'NGO request accepted! Other pending requests were closed.'
          : 'NGO request rejected.'
      );
      await loadDonations();
    } catch (err) {
      setError(err.message || 'Failed to respond to request.');
    }
  };

  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Donor Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Post surplus food donations, complete the food safety checklist, and manage NGO requests.
        </p>
      </section>

      {error && <div className="auth-error">{error}</div>}
      {successMsg && <div className="auth-success">{successMsg}</div>}

      {/* Create / Edit Form */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>
          {editingId ? 'Edit Eligible Donation' : 'Post New Surplus Food Donation'}
        </h3>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="don-title">Food Name / Title</label>
              <input
                id="don-title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleFieldChange}
                placeholder="e.g. Vegetable Biryani Trays"
              />
            </div>

            <div className="form-group">
              <label htmlFor="don-category">Food Category</label>
              <select
                id="don-category"
                name="foodCategory"
                value={form.foodCategory}
                onChange={handleFieldChange}
              >
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Packaged Food">Packaged Food</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Bakery & Bread">Bakery &amp; Bread</option>
                <option value="Dairy & Beverages">Dairy &amp; Beverages</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="don-desc">Description</label>
            <input
              id="don-desc"
              name="description"
              type="text"
              value={form.description}
              onChange={handleFieldChange}
              placeholder="Brief details about the food batch"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="don-qty">Quantity</label>
              <input
                id="don-qty"
                name="quantity"
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={handleFieldChange}
                placeholder="e.g. 50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="don-unit">Quantity Unit</label>
              <input
                id="don-unit"
                name="unit"
                type="text"
                required
                value={form.unit}
                onChange={handleFieldChange}
                placeholder="servings, kg, boxes"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="don-prepared">Preparation / Availability Time</label>
              <input
                id="don-prepared"
                name="preparedAt"
                type="datetime-local"
                value={form.preparedAt}
                onChange={handleFieldChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="don-expires">Safe-Consumption / Expiry Deadline *</label>
              <input
                id="don-expires"
                name="expiresAt"
                type="datetime-local"
                required
                value={form.expiresAt}
                onChange={handleFieldChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="don-address">Pickup Address</label>
            <input
              id="don-address"
              name="pickupAddress"
              type="text"
              required
              value={form.pickupAddress}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="don-lat">Latitude (Optional)</label>
              <input
                id="don-lat"
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleFieldChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="don-lng">Longitude (Optional)</label>
              <input
                id="don-lng"
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleFieldChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="don-packaging">Packaging Information</label>
              <input
                id="don-packaging"
                name="packagingInfo"
                type="text"
                required
                value={form.packagingInfo}
                onChange={handleFieldChange}
                placeholder="e.g. Sealed food-grade aluminum trays"
              />
            </div>

            <div className="form-group">
              <label htmlFor="don-storage">Storage Requirements</label>
              <input
                id="don-storage"
                name="storageRequirements"
                type="text"
                required
                value={form.storageRequirements}
                onChange={handleFieldChange}
                placeholder="e.g. Keep refrigerated below 5°C"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="don-allergen">Allergen Information (if known)</label>
              <input
                id="don-allergen"
                name="allergenInfo"
                type="text"
                value={form.allergenInfo}
                onChange={handleFieldChange}
                placeholder="e.g. Contains nuts, dairy"
              />
            </div>

            <div className="form-group">
              <label htmlFor="don-image">Food Image (JPEG, PNG, WebP, max 5MB)</label>
              <input
                id="don-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="profile-info-box" style={{ marginBottom: 0 }}>
            <strong>Food Safety Checklist (All items must be confirmed):</strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0.75rem' }}>
              Note: Uploading a food image is for visual reference only and does not verify or certify food safety.
            </p>
            <div style={{ display: 'grid', gap: '0.45rem' }}>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="properlyPackaged"
                  checked={form.safetyChecklist.properlyPackaged}
                  onChange={handleChecklistChange}
                />
                <span>Food is sealed in clean, food-grade packaging</span>
              </label>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="storedAtSafeTemp"
                  checked={form.safetyChecklist.storedAtSafeTemp}
                  onChange={handleChecklistChange}
                />
                <span>Food has been stored at a safe temperature</span>
              </label>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="withinSafeConsumptionWindow"
                  checked={form.safetyChecklist.withinSafeConsumptionWindow}
                  onChange={handleChecklistChange}
                />
                <span>Food is within its safe consumption window</span>
              </label>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="noSpoilageSigns"
                  checked={form.safetyChecklist.noSpoilageSigns}
                  onChange={handleChecklistChange}
                />
                <span>No signs of spoilage, odor, or contamination</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : editingId
                ? 'Update Donation'
                : 'Post Donation'}
            </button>
            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Donation History */}
      <section>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
          Your Donation History
        </h3>

        {loading ? (
          <p>Loading donation history...</p>
        ) : donations.length === 0 ? (
          <div className="card">
            <p>You have not posted any surplus food donations yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {donations.map((donation) => {
              const isEditable = EDITABLE_STATUSES.includes(donation.status);
              return (
                <div key={donation.id} className="card">
                  <div className="profile-header">
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                        {donation.title}
                      </h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {donation.foodCategory} • {donation.quantity} {donation.unit}
                      </span>
                    </div>
                    <span className="header-badge">{donation.status}</span>
                  </div>

                  {donation.imageUrl && (
                    <img
                      src={donation.imageUrl}
                      alt={donation.title}
                      style={{
                        maxWidth: '220px',
                        maxHeight: '140px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '0.75rem',
                      }}
                    />
                  )}

                  <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>Pickup:</strong> {donation.pickupAddress} |{' '}
                    <strong>Expires:</strong>{' '}
                    {new Date(donation.expiresAt).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <strong>Packaging:</strong> {donation.packagingInfo || 'N/A'} |{' '}
                    <strong>Storage:</strong> {donation.storageRequirements || 'N/A'}
                    {donation.allergenInfo ? ` | Allergens: ${donation.allergenInfo}` : ''}
                  </p>

                  {isEditable && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleStartEdit(donation)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ color: '#b91c1c', borderColor: '#fecaca' }}
                        onClick={() => handleCancelDonation(donation.id)}
                      >
                        Cancel Donation
                      </button>
                    </div>
                  )}

                  {/* Incoming NGO Requests */}
                  {donation.requests && donation.requests.length > 0 && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <strong style={{ fontSize: '0.92rem' }}>NGO Requests:</strong>
                      <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.6rem' }}>
                        {donation.requests.map((reqItem) => (
                          <div
                            key={reqItem.id}
                            className="profile-info-box"
                            style={{
                              marginBottom: 0,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.75rem',
                            }}
                          >
                            <div>
                              <strong>{reqItem.ngo?.organizationName}</strong> (
                              {reqItem.ngo?.serviceArea}) —{' '}
                              <span>Status: {reqItem.status}</span>
                              {reqItem.notes && (
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                  Notes: {reqItem.notes}
                                </div>
                              )}
                            </div>
                            {reqItem.status === 'PENDING' && isEditable && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  className="primary-button"
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                  onClick={() =>
                                    handleRespondToRequest(reqItem.id, 'ACCEPT')
                                  }
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                  onClick={() =>
                                    handleRespondToRequest(reqItem.id, 'REJECT')
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default DonorDashboardPage;
