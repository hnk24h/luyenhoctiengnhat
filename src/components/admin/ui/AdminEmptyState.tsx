'use client';

import React from 'react';

interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-3 opacity-30" style={{ fontSize: 48 }}>
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      {description && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)', maxWidth: 300 }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
