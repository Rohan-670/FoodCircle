import React, { useState } from 'react';
import { PageContainer, Card, Input, Button, Modal } from '../components/ui';

export function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!email.includes('@')) nextErrors.email = 'Please enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setPreviewOpen(true);
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
              placeholder="you@organization.org"
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
                Preview Sign In
              </Button>
              <Button variant="ghost" onClick={() => onNavigate('signup')}>
                Create an account
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Static UI Preview — Login Not Connected"
        footer={
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        }
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Client-side validation succeeded for <strong>{email}</strong>. Backend authentication
          is not wired in this static layout phase. Use the top navigation bar to preview any
          role dashboard directly.
        </p>
      </Modal>
    </PageContainer>
  );
}

export default LoginPage;
