import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QrCodeDisplay({ title, token }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!token) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(token, { width: 180, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [token]);

  if (!token) return null;

  return (
    <div className="profile-info-box" style={{ textAlign: 'center' }}>
      <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{title}</strong>
      {dataUrl && (
        <img
          src={dataUrl}
          alt={title}
          style={{
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            marginBottom: '0.5rem',
          }}
        />
      )}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
        Single-use Token: <code>{token}</code>
      </div>
    </div>
  );
}

export default QrCodeDisplay;
