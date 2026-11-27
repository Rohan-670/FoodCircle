import React, { useState } from 'react';
import {
  PageContainer,
  Card,
  Input,
  Select,
  Button,
  Badge,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function SignupPage({ onNavigate }) {
  const { register } = useAuth();
  const [role, setRole] = useState('DONOR');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    organizationName: '',
    contactPerson: '',
    address: '',
    serviceArea: '',
    availability: 'AVAILABLE',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
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

    setLoading(true);
    try {
      const user = await register({ ...form, role });
      const targetRole = user?.role || role;
      if (targetRole === 'NGO') onNavigate('ngo-dashboard');
      else if (targetRole === 'VOLUNTEER') onNavigate('volunteer-dashboard');
      else onNavigate('donor-dashboard');
    } catch (err) {
      setErrors({ email: err.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      eyebrow="Registration"
      title="Create Your Account"
      subtitle="Join FoodCircle as a food donor, community NGO, or volunteer courier."
    >
      <div className="auth-shell auth-shell-wide">
        <Card
          title="Account Details"
          badge={<Badge tone="sage">{role}</Badge>}
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
            >
              <option value="DONOR">Food Donor (Restaurant, Hotel, Grocer)</option>
              <option value="NGO">NGO / Community Kitchen</option>
              <option value="VOLUNTEER">Volunteer Courier</option>
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
                required
              />
            ) : (
              <div className="form-grid-2">
                <Input
                  id="signup-org"
                  name="organizationName"
                  label="Organization Name"
                  value={form.organizationName}
                  onChange={handleChange}
                  error={errors.organizationName}
                  placeholder="e.g. Mercy Community Kitchen"
                  required
                />
                <Input
                  id="signup-contact"
                  name="contactPerson"
                  label="Contact Person"
                  value={form.contactPerson}
                  onChange={handleChange}
                  error={errors.contactPerson}
                  placeholder="e.g. Rohan Mehta"
                  required
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
                placeholder="name@example.com"
                required
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
                required
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
              hint="Minimum 8 characters."
              placeholder="••••••••"
              required
            />

            {role === 'DONOR' && (
              <>
                <Input
                  id="donor-org"
                  name="organizationName"
                  label="Business / Kitchen Name"
                  value={form.organizationName}
                  onChange={handleChange}
                  error={errors.organizationName}
                  placeholder="e.g. Saffron Courtyard Kitchen"
                  required
                />
                <Input
                  id="donor-address"
                  name="address"
                  label="Pickup Address"
                  value={form.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="42 Residency Road, Central Ward"
                  required
                />
              </>
            )}

            {role === 'NGO' && (
              <>
                <Input
                  id="ngo-area"
                  name="serviceArea"
                  label="Service Area"
                  value={form.serviceArea}
                  onChange={handleChange}
                  error={errors.serviceArea}
                  placeholder="Central & South Wards"
                  required
                />
                <Input
                  id="ngo-address"
                  name="address"
                  label="Distribution Center Address"
                  value={form.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="15 Hope Shelter Lane, Central Ward"
                  required
                />
              </>
            )}

            {role === 'VOLUNTEER' && (
              <div className="form-grid-2">
                <Input
                  id="vol-area"
                  name="serviceArea"
                  label="Preferred Service Area"
                  value={form.serviceArea}
                  onChange={handleChange}
                  error={errors.serviceArea}
                  placeholder="Central Ward"
                  required
                />
                <Select
                  id="vol-avail"
                  name="availability"
                  label="Availability"
                  value={form.availability}
                  onChange={handleChange}
                >
                  <option value="AVAILABLE">Available for Pickups</option>
                  <option value="PAUSED">Paused</option>
                </Select>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('login')}
              >
                Already have an account? Sign In
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
}

export default SignupPage;
