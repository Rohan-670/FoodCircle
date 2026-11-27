import React, { useState } from 'react';
import { PageContainer, Card, Input, Button } from '../components/ui';

export function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!email.includes('@')) nextErrors.email = 'Please enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const lower = email.toLowerCase();
    if (lower.includes('ngo')) {
      onNavigate('ngo-dashboard');
    } else if (lower.includes('vol')) {
      onNavigate('volunteer-dashboard');
    } else if (lower.includes('admin')) {
      onNavigate('admin-dashboard');
    } else {
      onNavigate('donor-dashboard');
    }
  };

  const handleQuickLogin = (roleKey, emailVal) => {
    setEmail(emailVal);
    setPassword('Password123!');
    if (roleKey === 'ngo') onNavigate('ngo-dashboard');
    else if (roleKey === 'volunteer') onNavigate('volunteer-dashboard');
    else if (roleKey === 'admin') onNavigate('admin-dashboard');
    else onNavigate('donor-dashboard');
  };

  return (
    <PageContainer
      eyebrow="Authentication"
      title="Sign In to FoodCircle"
      subtitle="Access your Donor, NGO, Volunteer, or Administrator workspace."
    >
      <div className="auth-shell">
        <Card title="Account Credentials">
          <form onSubmit={handleSubmit} className="form-stack" noValidate>
            <Input
              id="login-email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: '' }));
              }}
              error={errors.email}
              placeholder="e.g. donor@saffroncourtyard.com"
            />
            <Input
              id="login-password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: '' }));
              }}
              error={errors.password}
              placeholder="Enter your password"
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="submit" size="lg">
                Sign In
              </Button>
              <Button variant="ghost" onClick={() => onNavigate('signup')}>
                Need an account? Register
              </Button>
            </div>
          </form>

          {/* Quick Demo Sign-In Switcher */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Quick Demo Access:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <Button size="sm" variant="secondary" onClick={() => handleQuickLogin('donor', 'donor@saffron.com')}>
                Donor Demo
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleQuickLogin('ngo', 'ngo@mercy.org')}>
                NGO Demo
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleQuickLogin('volunteer', 'volunteer@express.com')}>
                Volunteer Demo
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleQuickLogin('admin', 'admin@foodcircle.org')}>
                Admin Demo
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

export default LoginPage;
