import React, { useState } from 'react';
import {
  PageContainer,
  Card,
  Input,
  Select,
  Button,
  Badge,
  Modal,
} from '../components/ui';

export function SignupPage({ onNavigate }) {
  const [role, setRole] = useState('DONOR');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    organizationName: '',
    contactPerson: '',
    darpanId: '',
    fssaiLicense: '',
    address: '',
    serviceArea: '',
    coordinates: '',
    availability: 'AVAILABLE',
    goodSamaritanConsent: true,
  });
  const [errors, setErrors] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 8)
      nextErrors.password = 'Password must be at least 8 characters.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (role !== 'NGO' && !form.fullName.trim())
      nextErrors.fullName = 'Full name is required.';
    if ((role === 'DONOR' || role === 'NGO') && !form.organizationName.trim())
      nextErrors.organizationName = 'Organization name is required.';
    if (role === 'NGO' && !form.contactPerson.trim())
      nextErrors.contactPerson = 'Contact person is required.';
    if (!form.address.trim() && role !== 'VOLUNTEER')
      nextErrors.address = 'Address is required.';
    if ((role === 'NGO' || role === 'VOLUNTEER') && !form.serviceArea.trim())
      nextErrors.serviceArea = 'Service area is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setPreviewOpen(true);
  };

  return (
    <PageContainer
      eyebrow="Civic Account Registration"
      title="Create Organization or Volunteer Account"
      subtitle="Select your coordination role to provide FSSAI or NITI Aayog DARPAN compliance credentials. All participants are protected under statutory Good Samaritan guidelines."
    >
      <div className="auth-shell auth-shell-wide">
        <Card
          title="Institutional Registration Form"
          badge={<Badge tone="sage">Role: {role}</Badge>}
        >
          <form onSubmit={handleSubmit} className="form-stack" noValidate>
            <Select
              id="signup-role"
              label="Account Role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setErrors({});
              }}
              hint="Public registration supports Food Donors, NGOs, and Logistics Volunteers."
            >
              <option value="DONOR">Food Donor (Restaurant, Hotel, Banquet, Grocer)</option>
              <option value="NGO">NGO / Community Kitchen / Food Bank</option>
              <option value="VOLUNTEER">Citizen Logistics Courier</option>
            </Select>

            {role !== 'NGO' ? (
              <Input
                id="signup-fullname"
                name="fullName"
                label="Full Name"
                value={form.fullName}
                onChange={handleChange}
                error={errors.fullName}
                placeholder="e.g. Ananya Sharma"
              />
            ) : (
              <div className="form-grid-2">
                <Input
                  id="signup-org"
                  name="organizationName"
                  label="NGO Organization Name"
                  value={form.organizationName}
                  onChange={handleChange}
                  error={errors.organizationName}
                  placeholder="e.g. Mercy Community Kitchen"
                />
                <Input
                  id="signup-contact"
                  name="contactPerson"
                  label="Primary Contact Person"
                  value={form.contactPerson}
                  onChange={handleChange}
                  error={errors.contactPerson}
                  placeholder="e.g. Rohan Mehta"
                />
              </div>
            )}

            <div className="form-grid-2">
              <Input
                id="signup-email"
                name="email"
                type="email"
                label="Email Address"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="name@organization.org"
              />
              <Input
                id="signup-phone"
                name="phone"
                type="tel"
                label="Phone Number"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+91 98765 43210"
              />
            </div>

            <Input
              id="signup-password"
              name="password"
              type="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              hint="Minimum 8 characters with letters and numbers."
              placeholder="••••••••"
            />

            {role === 'DONOR' && (
              <>
                <div className="form-grid-2">
                  <Input
                    id="donor-org"
                    name="organizationName"
                    label="Business / Banquet / Kitchen Name"
                    value={form.organizationName}
                    onChange={handleChange}
                    error={errors.organizationName}
                    placeholder="e.g. Saffron Courtyard Kitchen"
                  />
                  <Input
                    id="donor-fssai"
                    name="fssaiLicense"
                    label="FSSAI License / Registration No."
                    value={form.fssaiLicense}
                    onChange={handleChange}
                    placeholder="e.g. FSSAI-11223344009182"
                  />
                </div>
                <Input
                  id="donor-address"
                  name="address"
                  label="Kitchen / Pickup Address"
                  value={form.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="42 Residency Road, Central Ward"
                />
              </>
            )}

            {role === 'NGO' && (
              <>
                <div className="form-grid-2">
                  <Input
                    id="ngo-darpan"
                    name="darpanId"
                    label="NITI Aayog DARPAN ID"
                    value={form.darpanId}
                    onChange={handleChange}
                    placeholder="e.g. KA/2021/0149921"
                    hint="Required for Tier 4 & Tier 5 verification."
                  />
                  <Input
                    id="ngo-area"
                    name="serviceArea"
                    label="Service Corridor / District"
                    value={form.serviceArea}
                    onChange={handleChange}
                    error={errors.serviceArea}
                    placeholder="Central & South Wards"
                  />
                </div>
                <Input
                  id="ngo-address"
                  name="address"
                  label="Distribution Center / Kitchen Address"
                  value={form.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="15 Hope Shelter Lane, Central Ward"
                />
              </>
            )}

            {role === 'VOLUNTEER' && (
              <div className="form-grid-2">
                <Input
                  id="vol-area"
                  name="serviceArea"
                  label="Preferred Logistics Corridor"
                  value={form.serviceArea}
                  onChange={handleChange}
                  error={errors.serviceArea}
                  placeholder="Central Ward & Residency Road"
                />
                <Select
                  id="vol-avail"
                  name="availability"
                  label="Initial Availability"
                  value={form.availability}
                  onChange={handleChange}
                >
                  <option value="AVAILABLE">Available for Active Pickups</option>
                  <option value="PAUSED">Paused (Onboarding Only)</option>
                </Select>
              </div>
            )}

            {/* Good Samaritan Checkbox */}
            <div style={{ backgroundColor: 'var(--bg-muted)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.84rem' }}>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="goodSamaritanConsent"
                  checked={form.goodSamaritanConsent}
                  onChange={handleChange}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>
                  <strong>Statutory Declaration:</strong> I affirm that our operations comply with FSSAI Schedule I safety principles and act in good faith under the Supreme Court Good Samaritan guidelines.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="submit" size="lg">
                Preview Registration Payload
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('login')}
              >
                Already registered? Sign In
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Registration Payload Preview"
        footer={
          <Button onClick={() => setPreviewOpen(false)}>Close Preview</Button>
        }
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
          Form validation passed. Backend registration is disabled in this static design-system
          phase, so no database transaction was committed.
        </p>
        <div className="info-strip">
          <strong>Selected Role:</strong> {role}
          <br />
          <strong>Email:</strong> {form.email}
          <br />
          <strong>Entity:</strong> {form.organizationName || form.fullName}
        </div>
      </Modal>
    </PageContainer>
  );
}

export default SignupPage;
