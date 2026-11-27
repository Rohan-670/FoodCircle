import React from 'react';

export function Input({
  id,
  label,
  hint,
  error,
  className = '',
  ...props
}) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`field-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`field-control ${error ? 'has-error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {hint && !error && (
        <span id={`${id}-hint`} className="field-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function Select({ id, label, hint, error, children, className = '', ...props }) {
  return (
    <div className={`field-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`field-control ${error ? 'has-error' : ''}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function Textarea({ id, label, hint, error, className = '', ...props }) {
  return (
    <div className={`field-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={3}
        className={`field-control ${error ? 'has-error' : ''}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;
