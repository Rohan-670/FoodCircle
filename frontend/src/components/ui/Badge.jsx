import React from 'react';

export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`badge badge-${tone} ${className}`.trim()}>
      {children}
    </span>
  );
}

export default Badge;
