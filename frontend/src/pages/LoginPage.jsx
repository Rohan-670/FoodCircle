import React, { useState } from 'react';
import { PageContainer, Card, Input, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!email.includes('@')) nextErrors.email = 'Please enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password });
      const role = user?.role || 'DONOR';
      if (role === 'NGO') onNavigate('ngo-dashboard');
      else if (role === 'VOLUNTEER') onNavigate('volunteer-dashboard');
      else if (role === 'ADMIN') onNavigate('admin-dashboard');
      else onNavigate('donor-dashboard');
    } catch (err) {
      setErrors({ email: err.message || 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      eyebrow="Authentication"
      title="Sign In to FoodCircle"
      subtitle="Access your active organization or volunteer dispatch account."
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
              placeholder="e.g. ananya@saffronkitchen.com"
              required
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
              placeholder="Enter your account password"
              required
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button variant="ghost" onClick={() => onNavigate('signup')}>
                Need an account? Register
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
}

export default LoginPage;
