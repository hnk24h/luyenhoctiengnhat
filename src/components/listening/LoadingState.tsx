import React from 'react';

interface LoadingStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Đang tải...', icon }) => (
  <div className="text-center py-20">
    {icon && <div className="mb-3 opacity-50">{icon}</div>}
    <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{message}</p>
  </div>
);

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  subMessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message = 'Không có dữ liệu.', icon, subMessage }) => (
  <div className="text-center py-20">
    {icon && <div className="mb-3 opacity-50">{icon}</div>}
    <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    {subMessage && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{subMessage}</p>}
  </div>
);
