'use client';

import React from 'react';

interface AdminFormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function AdminFormField({
  label, htmlFor, error, required, className = '', children,
}: AdminFormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="admin-field-label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="admin-field-error">{error}</p>}
    </div>
  );
}
