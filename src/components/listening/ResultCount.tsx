import React from 'react';

interface ResultCountProps {
  count: number;
  label?: string;
  filter?: string;
  search?: string;
  loading?: boolean;
}

export const ResultCount: React.FC<ResultCountProps> = ({ count, label, filter, search, loading }) => (
  <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
    {loading
      ? 'Đang tải...'
      : `${count} ${label || 'kết quả'}${filter ? ` (${filter})` : ''}${search ? ` — "${search}"` : ''}`}
  </div>
);
