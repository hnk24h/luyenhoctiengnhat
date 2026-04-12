'use client';

import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  /** Remove default padding */
  noPadding?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdminCard({ children, noPadding, className = '', style }: AdminCardProps) {
  return (
    <div
      className={`admin-card ${noPadding ? '' : 'p-5'} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

interface AdminCardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminCardHeader({ icon, title, description, actions }: AdminCardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <div className="admin-icon-box">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          {description && (
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
