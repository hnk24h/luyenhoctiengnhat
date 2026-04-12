'use client';

import React from 'react';
import AdminSearchInput from './AdminSearchInput';

interface AdminToolbarProps {
  /** Search value (controlled) */
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** Filter elements rendered between search and actions */
  filters?: React.ReactNode;
  /** Action buttons rendered on the right side */
  actions?: React.ReactNode;
  /** Bulk action bar (shown when items are selected) */
  bulkActions?: React.ReactNode;
  /** Number of selected items (shows bulk bar if > 0) */
  selectedCount?: number;
  className?: string;
}

export default function AdminToolbar({
  search, onSearchChange, searchPlaceholder,
  filters, actions, bulkActions, selectedCount = 0,
  className = '',
}: AdminToolbarProps) {
  return (
    <div className={`admin-toolbar ${className}`}>
      {/* Search */}
      {onSearchChange !== undefined && (
        <AdminSearchInput
          value={search ?? ''}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-56"
        />
      )}

      {/* Filters */}
      {filters}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bulk actions or normal actions */}
      {selectedCount > 0 && bulkActions ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: 'color-mix(in srgb, var(--primary) 8%, transparent)' }}>
          <span style={{ color: 'var(--primary)' }}>{selectedCount} đã chọn</span>
          {bulkActions}
        </div>
      ) : actions}
    </div>
  );
}
