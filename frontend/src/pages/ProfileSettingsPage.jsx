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

const MOCK_PROFILES = {
  DONOR: {
    fullName: 'Ananya Sharma',
    email: 'ananya@saffronkitchen.org',
    phone: '+91 98765 43210',
    organization: 'Saffron Courtyard Kitchen',
    address: '42 Residency Road, Central Ward',
    verification: 'APPROVED',
  },
  NGO: {
    fullName: 'Rohan Mehta',
    email: 'contact@hopeshelter.org',
    phone: '+91 98111 22334',
    organization: 'Hope Shelter & Community Kitchen',
    address: '15 Hope Shelter Lane, Central Ward',
    verification: 'APPROVED',
  },
  VOLUNTEER: {
    fullName: 'Charlie Verma',
    email: 'charlie.v@dispatch.org',
    phone: '+91 99000 11223',
    organization: 'Central Ward Volunteer',
    address: 'Central Ward Zone',
    verification: 'ACTIVE',
  },
  ADMIN: {
    fullName: 'System Administrator',
    email: 'admin@foodcircle.local',
    phone: '+91 80000 00001',
    organization: 'FoodCircle Governance',
    address: 'Platform Operations',
    verification: 'SYSTEM_ADMIN',
  },
};

export function ProfileSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [previewRole, setPreviewRole] = useState('NGO');
  const [prefs, setPrefs] = useState({
    requestAlerts: true,
    deliveryAlerts: true,
    expiryAlerts: true,
    verificationAlerts: true,
  });

  const profile = MOCK_PROFILES[previewRole];

  return (
    <PageContainer
      eyebrow="Account & Preferences"
      title="Profile & Settings"
      subtitle="Preview profile details, theme appearance, and notification preferences."
    >
      <div className="grid-2">
        <Card
          title="Organization & Contact Details (Mock)"
          badge={<Badge tone="mint">{profile.verification}</Badge>}
        >
          <div className="form-stack">
            <Select
              id="settings-role-preview"
              label="Preview Profile as Role"
              value={previewRole}
              onChange={(e) => setPreviewRole(e.target.value)}
            >
              <option value="DONOR">DONOR</option>
              <option value="NGO">NGO</option>
              <option value="VOLUNTEER">VOLUNTEER</option>
              <option value="ADMIN">ADMIN</option>
            </Select>

            <Input
              id="settings-name"
              label="Full Name / Contact Person"
              value={profile.fullName}
              readOnly
            />
            <Input
              id="settings-email"
              label="Email Address"
              value={profile.email}
              readOnly
            />
            <Input
              id="settings-org"
              label="Organization / Area"
              value={profile.organization}
              readOnly
            />
            <Input
              id="settings-address"
              label="Address"
              value={profile.address}
              readOnly
            />

            <div>
              <Button disabled title="Profile saving is disabled in static UI preview">
                Save Profile Changes (Preview Only)
              </Button>
            </div>
          </div>
        </Card>

        <div className="form-stack">
          <Card
            title="Appearance & Theme"
            subtitle="Switch between Warm Ivory (Light) and Deep Forest (Dark) modes."
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <strong>Current Theme:</strong>{' '}
                <Badge tone="sage">{theme === 'light' ? 'Light (Warm Ivory)' : 'Dark (Deep Forest)'}</Badge>
              </div>
              <Button variant="secondary" onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </Button>
            </div>
          </Card>

          <Card
            title="Notification Preferences (Mock)"
            subtitle="Choose which real-time and persistent alerts to receive."
          >
            <div className="form-stack">
              {[
                ['requestAlerts', 'Donation requests & donor decisions'],
                ['deliveryAlerts', 'Volunteer assignment & QR delivery updates'],
                ['expiryAlerts', 'Approaching safe-consumption deadline warnings'],
                ['verificationAlerts', 'Administrator verification results'],
              ].map(([key, label]) => (
                <label
                  key={key}
                  style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={() =>
                      setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

export default ProfileSettingsPage;
