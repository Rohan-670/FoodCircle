import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const INITIAL_FORM = {
  role: 'DONOR',
  fullName: '',
  email: '',
  password: '',
  phone: '',
  organizationName: '',
  businessType: 'Restaurant',
  contactPerson: '',
  registrationNumber: '',
  address: '',
  serviceArea: '',
  latitude: '',
  longitude: '',
  vehicleType: '',
  isAvailable: true,
};

export function SignupPage({ onNavigate }) {
  const { register } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const buildPayload = () => {
    const base = {
      role: form.role,
      email: form.email,
      password: form.password,
      phone: form.phone,
    };

    if (form.role === 'DONOR') {
      return {
        ...base,
        fullName: form.fullName,
        organizationName: form.organizationName,
        businessType: form.businessType || 'General',
        address: form.address,
        latitude: form.latitude !== '' ? Number(form.latitude) : undefined,
        longitude: form.longitude !== '' ? Number(form.longitude) : undefined,
      };
    }

    if (form.role === 'NGO') {
      return {
        ...base,
        organizationName: form.organizationName,
        contactPerson: form.contactPerson,
        registrationNumber: form.registrationNumber || undefined,
        address: form.address,
        serviceArea: form.serviceArea,
      };
    }

    return {
      ...base,
      fullName: form.fullName,
      address: form.address || undefined,
      serviceArea: form.serviceArea || undefined,
      vehicleType: form.vehicleType || undefined,
      isAvailable: form.isAvailable,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setSubmitting(true);

    try {
      await register(buildPayload());
      onNavigate('profile');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      if (Array.isArray(err.errors)) {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <h2>Create Account</h2>
        <p className="auth-subtitle">
          Join as a Food Donor, NGO Partner, or Delivery Volunteer.
        </p>

        {error && (
          <div className="auth-error">
            <div>{error}</div>
            {fieldErrors.length > 0 && (
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                {fieldErrors.map((fe, idx) => (
                  <li key={idx}>
                    <strong>{fe.field}:</strong> {fe.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="role-select">Account Role</label>
            <select
              id="role-select"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="DONOR">Food Donor (Restaurant / Caterer / Store)</option>
              <option value="NGO">NGO / Charity Organization</option>
              <option value="VOLUNTEER">Volunteer (Pickup &amp; Delivery)</option>
            </select>
          </div>

          {form.role !== 'NGO' && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
            </div>
          )}

          {form.role === 'NGO' && (
            <>
              <div className="form-group">
                <label htmlFor="organizationName">NGO Organization Name</label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  required
                  value={form.organizationName}
                  onChange={handleChange}
                  placeholder="Helping Hands Foundation"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person Name</label>
                <input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  required
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="John Smith"
                />
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 123 4567"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (min 8 chars, letters + numbers)</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              placeholder="Create a strong password"
            />
          </div>

          {form.role === 'DONOR' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="donor-org">Organization / Business Name</label>
                  <input
                    id="donor-org"
                    name="organizationName"
                    type="text"
                    required
                    value={form.organizationName}
                    onChange={handleChange}
                    placeholder="Green Valley Bistro"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="businessType">Business Type</label>
                  <input
                    id="businessType"
                    name="businessType"
                    type="text"
                    value={form.businessType}
                    onChange={handleChange}
                    placeholder="Restaurant, Bakery, Supermarket..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="donor-address">Pickup Address</label>
                <input
                  id="donor-address"
                  name="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Main Street, City"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude (Optional)</label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 12.9716"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">Longitude (Optional)</label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 77.5946"
                  />
                </div>
              </div>
            </>
          )}

          {form.role === 'NGO' && (
            <>
              <div className="form-group">
                <label htmlFor="ngo-address">Organization Address</label>
                <input
                  id="ngo-address"
                  name="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={handleChange}
                  placeholder="45 Community Lane, City"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ngo-service-area">Service Area</label>
                  <input
                    id="ngo-service-area"
                    name="serviceArea"
                    type="text"
                    required
                    value={form.serviceArea}
                    onChange={handleChange}
                    placeholder="Downtown & North District"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="registrationNumber">Registration Number (Optional)</label>
                  <input
                    id="registrationNumber"
                    name="registrationNumber"
                    type="text"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    placeholder="NGO-REG-2026"
                  />
                </div>
              </div>
            </>
          )}

          {form.role === 'VOLUNTEER' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vol-address">Address</label>
                  <input
                    id="vol-address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="78 Oak Street"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="vol-service-area">Preferred Service Area</label>
                  <input
                    id="vol-service-area"
                    name="serviceArea"
                    type="text"
                    value={form.serviceArea}
                    onChange={handleChange}
                    placeholder="Central Zone"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vehicleType">Vehicle Type (Optional)</label>
                  <input
                    id="vehicleType"
                    name="vehicleType"
                    type="text"
                    value={form.vehicleType}
                    onChange={handleChange}
                    placeholder="Bike, Car, Van..."
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      name="isAvailable"
                      type="checkbox"
                      checked={form.isAvailable}
                      onChange={handleChange}
                    />
                    <span>Currently available for pickups</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => onNavigate('login')}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
