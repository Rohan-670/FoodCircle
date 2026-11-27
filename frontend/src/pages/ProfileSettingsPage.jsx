import React, { useState } from 'react';
import {
  PageContainer,
  Card,
  Input,
  Select,
  Button,
  Badge,
} from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PROFILES = {
  DONOR: {
    fullName: 'Ananya Sharma',
    email: 'ananya@saffronkitchen.com',
    phone: '+91 98765 43210',
    organization: 'Saffron Courtyard Banquets',
    address: '42 Residency Road, Central Ward, Bengaluru',
    verification: 'VERIFIED',
  },
  NGO: {
    fullName: 'Rohan Mehta',
    email: 'contact@mercykitchen.org',
    phone: '+91 98111 22334',
    organization: 'Mercy Community Kitchen & Shelter',
    address: '15 Hope Shelter Lane, Central Ward, Bengaluru',
    verification: 'VERIFIED',
  },
  VOLUNTEER: {
    fullName: 'Charlie Verma',
    email: 'charlie.v@dispatch.com',
    phone: '+91 99000 11223',
    organization: 'Central Ward Volunteer Courier',
    address: 'Central Ward Logistics Zone, Bengaluru',
    verification: 'ACTIVE',
  },
  ADMIN: {
    fullName: 'System Administrator',
    email: 'admin@foodcircle.org',
    phone: '+91 80000 00001',
    organization: 'FoodCircle Platform Governance',
    address: 'Platform Operations Center',
    verification: 'ACTIVE',
  },
};

export function ProfileSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const currentRole = user?.role || 'DONOR';
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [feedback, setFeedback] = useState('');

  const [profile, setProfile] = useState(() => {
    return {
      fullName: user?.fullName || DEFAULT_PROFILES[currentRole].fullName,
      email: user?.email || DEFAULT_PROFILES[currentRole].email,
      phone: user?.phone || DEFAULT_PROFILES[currentRole].phone,
      organization: user?.organizationName || DEFAULT_PROFILES[currentRole].organization,
      address: user?.address || DEFAULT_PROFILES[currentRole].address,
      verification: 'VERIFIED',
    };
  });

  const [prefs, setPrefs] = useState({
    requestAlerts: true,
    deliveryAlerts: true,
    expiryAlerts: true,
    verificationAlerts: true,
  });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setProfile(DEFAULT_PROFILES[role]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFeedback('Settings and profile details saved successfully.');
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <PageContainer
      eyebrow="Account Settings"
      title="Profile &amp; Preferences"
      subtitle="Manage your contact details, organization address, and notification preferences."
    >
      {feedback && (
        <div style={{ backgroundColor: 'var(--color-mint)', border: '1px solid var(--color-mint-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--color-forest)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      <div className="grid-2">
        <Card
          title="Organization &amp; Contact Details"
          badge={<Badge tone="mint">{profile.verification}</Badge>}
        >
          <form onSubmit={handleSave} className="form-stack">
            <Select
              id="settings-role"
              label="Account Profile Role"
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="DONOR">Food Donor</option>
              <option value="NGO">NGO / Community Kitchen</option>
              <option value="VOLUNTEER">Volunteer Courier</option>
              <option value="ADMIN">Platform Administrator</option>
            </Select>

            <Input
              id="profile-name"
              label="Primary Contact Person"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />

            <Input
              id="profile-org"
              label="Organization / Kitchen Name"
              value={profile.organization}
              onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
            />

            <div className="form-grid-2">
              <Input
                id="profile-email"
                label="Email Address"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <Input
                id="profile-phone"
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <Input
              id="profile-addr"
              label="Physical Address / Facility Location"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>

        <div className="form-stack">
          <Card title="Interface Appearance">
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Switch between Light and Dark interface modes according to your preference.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>Active Theme</strong>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Currently using {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </div>
              </div>
              <Button variant="secondary" onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </Button>
            </div>
          </Card>

          <Card title="Notification Preferences">
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.88rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prefs.requestAlerts}
                  onChange={(e) => setPrefs({ ...prefs, requestAlerts: e.target.checked })}
                />
                <span>Instant alerts when an NGO requests a food batch</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prefs.deliveryAlerts}
                  onChange={(e) => setPrefs({ ...prefs, deliveryAlerts: e.target.checked })}
                />
                <span>Live dispatch and courier handover updates</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prefs.expiryAlerts}
                  onChange={(e) => setPrefs({ ...prefs, expiryAlerts: e.target.checked })}
                />
                <span>Urgent countdown alerts when food approaches expiry deadline</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prefs.verificationAlerts}
                  onChange={(e) => setPrefs({ ...prefs, verificationAlerts: e.target.checked })}
                />
                <span>Account verification status changes</span>
              </label>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

export default ProfileSettingsPage;
