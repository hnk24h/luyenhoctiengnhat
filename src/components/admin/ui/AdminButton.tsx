'use client';

import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary:   'admin-btn--primary',
  secondary: 'admin-btn--secondary',
  ghost:     'admin-btn--ghost',
  danger:    'admin-btn--danger',
};

const SIZE: Record<Size, string> = {
  sm: 'py-1 px-2 text-xs gap-1',
  md: 'py-1.5 px-3 text-sm gap-1.5',
  lg: 'py-2.5 px-5 text-sm gap-2',
};

export default function AdminButton({
  variant = 'primary', size = 'md', loading, icon, children,
  className = '', disabled, ...rest
}: AdminButtonProps) {
  return (
    <button
      className={`admin-btn ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
  );
}
