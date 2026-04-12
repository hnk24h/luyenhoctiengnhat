'use client';

import React, { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import AdminEmptyState from './AdminEmptyState';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Types                                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

export interface ColumnDef<T> {
  key: string;
  header: string;
  /** Fixed px, Tailwind class, or 'auto'/'1fr'. Default '1fr'. */
  width?: string;
  align?: 'left' | 'center' | 'right';
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, index: number) => React.ReactNode;
}

export interface ServerPagination {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface AdminTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T) => string;

  /* Row interaction */
  activeRowId?: string | null;
  onRowClick?: (row: T) => void;

  /* Pagination — client-side when no serverPagination */
  pageSize?: number;
  serverPagination?: ServerPagination;

  /* Loading / empty */
  loading?: boolean;
  skeletonRows?: number;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;

  /* Bulk selection */
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;

  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Skeleton row                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

const SKEL_WIDTHS = ['48%', '76%', '60%', '56%', '68%', '44%', '52%', '64%'];

function SkeletonRows({
  count, cols, gridCols, selectable,
}: {
  count: number; cols: number; gridCols: string; selectable: boolean;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, ri) => (
        <div
          key={ri}
          className="grid items-center px-3 py-2.5 border-b"
          style={{ gridTemplateColumns: gridCols, borderColor: 'var(--border)' }}
        >
          {selectable && (
            <div className="flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded bg-gray-200 animate-pulse" />
            </div>
          )}
          {Array.from({ length: cols }).map((_, ci) => (
            <div key={ci} className="px-2">
              {ci === 0 ? (
                /* First column: two lines (name + sub) */
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-gray-200 rounded animate-pulse" style={{ width: SKEL_WIDTHS[ri % SKEL_WIDTHS.length] }} />
                  <div className="h-2 bg-gray-100 rounded animate-pulse" style={{ width: '55%' }} />
                </div>
              ) : (
                <div className="h-2.5 bg-gray-200 rounded animate-pulse" style={{ width: SKEL_WIDTHS[(ri + ci) % SKEL_WIDTHS.length] }} />
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Smart pagination numbers  [1] … [4] [5] [6] … [12]                        */
/* ═══════════════════════════════════════════════════════════════════════════ */

function getPageNums(cur: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4)   return [1, 2, 3, 4, 5, '…', total];
  if (cur >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', cur - 1, cur, cur + 1, '…', total];
}

function Pagination({
  page, totalPages, total, pageSize, onPageChange,
}: {
  page: number; totalPages: number; total: number; pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);
  const nums = getPageNums(page, totalPages);

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 border-t text-xs select-none"
      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
    >
      <span>{from}–{to} trong <strong style={{ color: 'var(--text-secondary)' }}>{total}</strong></span>

      {totalPages > 1 && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="admin-btn admin-btn--ghost w-7 h-7 rounded disabled:opacity-30"
            aria-label="Trang trước"
          >
            <FaChevronLeft size={10} />
          </button>

          {nums.map((n, i) =>
            n === '…' ? (
              <span key={`ellipsis-${i}`} className="w-7 text-center" style={{ color: 'var(--text-muted)' }}>…</span>
            ) : (
              <button
                key={n}
                onClick={() => onPageChange(n as number)}
                className={`admin-btn w-7 h-7 rounded text-xs font-medium ${
                  n === page ? 'admin-btn--primary' : 'admin-btn--ghost'
                }`}
              >
                {n}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="admin-btn admin-btn--ghost w-7 h-7 rounded disabled:opacity-30"
            aria-label="Trang sau"
          >
            <FaChevronRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  AdminTable                                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminTable<T>({
  columns, data, rowKey,
  activeRowId, onRowClick,
  pageSize = 10,
  serverPagination,
  loading = false, skeletonRows = 8,
  emptyIcon, emptyTitle = 'Không có dữ liệu', emptyDescription, emptyAction,
  selectable, selectedIds, onSelectionChange,
  className = '',
}: AdminTableProps<T>) {
  const [clientPage, setClientPage] = useState(1);

  /* ── Pagination mode ── */
  const isServer = !!serverPagination;
  const page         = isServer ? serverPagination!.page         : clientPage;
  const totalPages   = isServer ? serverPagination!.totalPages   : Math.max(1, Math.ceil(data.length / pageSize));
  const total        = isServer ? serverPagination!.total        : data.length;
  const handlePageChange = isServer ? serverPagination!.onPageChange : setClientPage;

  /* Reset client page when data length changes */
  React.useEffect(() => { if (!isServer) setClientPage(1); }, [data.length, isServer]);

  /* ── Paged data (client-side only) ── */
  const pagedData = useMemo(() => {
    if (isServer) return data;
    return data.slice((clientPage - 1) * pageSize, clientPage * pageSize);
  }, [data, clientPage, pageSize, isServer]);

  /* ── Selection ── */
  const toggleOne = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
  };
  const toggleAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? new Set(pagedData.map(rowKey)) : new Set());
  };
  const allSelected = pagedData.length > 0 && pagedData.every(r => selectedIds?.has(rowKey(r)));
  const someSelected = !allSelected && pagedData.some(r => selectedIds?.has(rowKey(r)));

  /* ── Grid template columns ── */
  const gridCols = [
    selectable ? '36px' : '',
    ...columns.map(c => c.width || '1fr'),
  ].filter(Boolean).join(' ');

  /* ── Empty / Loading ── */
  if (!loading && data.length === 0) {
    return (
      <div className={`admin-card ${className}`}>
        <AdminEmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className={`admin-card p-0 overflow-hidden ${className}`}>
      {/* ── Header ── */}
      <div
        className="admin-table-header grid items-center px-3 py-2"
        style={{ gridTemplateColumns: gridCols }}
      >
        {selectable && (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              ref={el => { if (el) el.indeterminate = someSelected; }}
              className="w-3.5 h-3.5 cursor-pointer accent-[var(--primary)]"
              checked={allSelected}
              onChange={e => toggleAll(e.target.checked)}
              aria-label="Chọn tất cả"
            />
          </div>
        )}
        {columns.map(col => (
          <div
            key={col.key}
            className={`px-2 text-left ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.headerClassName ?? ''}`}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {loading ? (
          <SkeletonRows
            count={skeletonRows}
            cols={columns.length}
            gridCols={gridCols}
            selectable={!!selectable}
          />
        ) : (
          pagedData.map((row, idx) => {
            const id = rowKey(row);
            const isActive   = id === activeRowId;
            const isSelected = selectedIds?.has(id) ?? false;
            return (
              <div
                key={id}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={[
                  'grid items-center px-3 py-2 text-sm group transition-colors',
                  'admin-table-row',
                  isActive   ? 'admin-table-row--active' : '',
                  isSelected && !isActive ? 'bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]' : '',
                  onRowClick ? 'cursor-pointer' : '',
                ].join(' ')}
                style={{ gridTemplateColumns: gridCols }}
                onClick={() => onRowClick?.(row)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onRowClick?.(row); }}
              >
                {selectable && (
                  <div
                    className="flex items-center justify-center"
                    onClick={e => { e.stopPropagation(); toggleOne(id); }}
                  >
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 cursor-pointer accent-[var(--primary)]"
                      checked={isSelected}
                      onChange={() => toggleOne(id)}
                      aria-label={`Chọn dòng ${idx + 1}`}
                    />
                  </div>
                )}
                {columns.map(col => (
                  <div
                    key={col.key}
                    className={`px-2 min-w-0 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.cellClassName ?? ''}`}
                  >
                    {col.render(row, idx)}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && (isServer ? total > 0 : totalPages > 1) && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
