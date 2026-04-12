'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  FaCheck, FaShield, FaUser, FaStar, FaGem, FaFacebook,
  FaGoogle, FaGithub, FaApple, FaCrown, FaCircleCheck,
  FaHouse, FaChevronRight, FaUserPlus,
} from 'react-icons/fa6';
import { useUsers } from '@/hooks/admin/useUsers';
import type { UserRow } from '@/types/admin/user';
import {
  AdminTable, AdminToolbar, ConfirmDialog,
  type ColumnDef,
} from '@/components/admin/ui';
import { UserDetailDrawer }  from './_components/UserDetailDrawer';
import UserCreateModal        from './_components/UserCreateModal';
import UserEditModal          from './_components/UserEditModal';
import UserAccessModal        from './_components/UserAccessModal';
import { deleteUser as apiDeleteUser } from '@/services/admin/userService';

// ─── Small cell helpers ────────────────────────────────────────────────────────

function UserAvatar({ user }: { user: UserRow }) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt=""
        className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-[var(--border)]"
      />
    );
  }
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();
  return (
    <span className="w-7 h-7 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-[10px] font-bold flex-shrink-0 select-none ring-1 ring-[var(--border)]">
      {initials}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    free:    { label: 'Miễn phí', icon: <FaUser    size={9} />, cls: 'bg-gray-100 text-gray-600' },
    basic:   { label: 'Cơ bản',   icon: <FaStar    size={9} />, cls: 'bg-blue-100 text-blue-700' },
    premium: { label: 'Premium',  icon: <FaCrown   size={9} />, cls: 'bg-amber-100 text-amber-700' },
  };
  const { label, icon, cls } = map[tier] ?? { label: tier, icon: null, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {icon}{label}
    </span>
  );
}

function SSOPills({ accounts }: { accounts: { id: string; provider: string }[] }) {
  if (!accounts.length) {
    return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>;
  }

  const PROVIDER_ICON: Record<string, React.ReactNode> = {
    google:   <FaGoogle   size={10} />,
    github:   <FaGithub  size={10} />,
    facebook: <FaFacebook size={10} />,
    apple:    <FaApple   size={10} />,
  };
  const PROVIDER_STYLE: Record<string, { bg: string; color: string }> = {
    google:   { bg: '#FEE2E2', color: '#DC2626' },
    github:   { bg: '#1F2937', color: '#FFFFFF' },
    facebook: { bg: '#1D4ED8', color: '#FFFFFF' },
    apple:    { bg: '#111827', color: '#FFFFFF' },
  };

  return (
    <div className="flex gap-1 flex-wrap">
      {accounts.map(a => {
        const style = PROVIDER_STYLE[a.provider] ?? { bg: '#E5E7EB', color: '#374151' };
        return (
          <span
            key={a.id}
            title={a.provider}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold"
            style={{ background: style.bg, color: style.color }}
          >
            {PROVIDER_ICON[a.provider] ?? a.provider.slice(0, 2).toUpperCase()}
          </span>
        );
      })}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        background: isAdmin ? 'var(--primary-light)' : 'var(--bg-muted)',
        color:      isAdmin ? 'var(--primary)' : 'var(--text-muted)',
        border:     `1px solid ${isAdmin ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--border)'}`,
      }}
    >
      {isAdmin ? <FaShield size={9} /> : <FaUser size={9} />}
      {isAdmin ? 'Admin' : 'User'}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// ─── Row action links (shown in UserCell on hover via CSS group) ──────────────

function RowActions({
  user, isSelf, onEdit, onDelete, onAccess,
}: {
  user: UserRow; isSelf: boolean;
  onEdit: () => void; onDelete: () => void; onAccess: () => void;
}) {
  return (
    <div className="hidden group-hover:flex items-center gap-1 mt-0.5 text-[11px]">
      <button onClick={e => { e.stopPropagation(); onEdit(); }} className="hover:underline" style={{ color: 'var(--primary)' }}>
        Sửa
      </button>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        disabled={isSelf}
        className="hover:underline text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Xóa
      </button>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <button onClick={e => { e.stopPropagation(); onAccess(); }} className="hover:underline" style={{ color: 'var(--text-muted)' }}>
        Truy cập
      </button>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type Summary = { byRole: Record<string, number>; byTier: Record<string, number>; total: number };

interface FilterTabsProps {
  summary: Summary;
  roleFilter: string;
  tierFilter: string;
  onRole: (r: string) => void;
  onTier: (t: string) => void;
}

function FilterTabs({ summary, roleFilter, tierFilter, onRole, onTier }: FilterTabsProps) {
  const tabs: { label: string; count: number; active: boolean; onClick: () => void }[] = [
    { label: 'Tất cả',    count: summary.total,                   active: !roleFilter && !tierFilter, onClick: () => { onRole(''); onTier(''); } },
    { label: 'Admin',     count: summary.byRole['admin'] ?? 0,    active: roleFilter === 'admin',     onClick: () => onRole('admin') },
    { label: 'Người dùng',count: summary.byRole['user']  ?? 0,    active: roleFilter === 'user',      onClick: () => onRole('user') },
    { label: 'Miễn phí',  count: summary.byTier['free']    ?? 0,  active: tierFilter === 'free',      onClick: () => onTier('free') },
    { label: 'Cơ bản',    count: summary.byTier['basic']   ?? 0,  active: tierFilter === 'basic',     onClick: () => onTier('basic') },
    { label: 'Premium',   count: summary.byTier['premium'] ?? 0,  active: tierFilter === 'premium',   onClick: () => onTier('premium') },
  ];

  return (
    <div className="flex items-center gap-0.5 flex-wrap text-sm overflow-x-auto">
      {tabs.map((t, i) => (
        <React.Fragment key={t.label}>
          {i === 3 && (
            <span className="mx-1.5 h-4 w-px bg-[var(--border)] inline-block self-center" aria-hidden />
          )}
          <button
            onClick={t.onClick}
            className={[
              'px-2.5 py-1.5 rounded transition-colors whitespace-nowrap',
              t.active
                ? 'font-semibold bg-[var(--primary-light)] text-[var(--primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]',
            ].join(' ')}
          >
            {t.label}
            {' '}
            <span className={`text-[11px] font-mono ${t.active ? 'opacity-80' : 'opacity-60'}`}>({t.count})</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const hook = useUsers();

  /* Bulk selection */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction]   = useState('');
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkConfirm, setBulkConfirm]   = useState(false);

  const handleBulkApply = () => {
    if (bulkAction === 'delete' && selectedIds.size > 0) setBulkConfirm(true);
  };

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true);
    setBulkConfirm(false);
    try {
      await Promise.all([...selectedIds].map(id => apiDeleteUser(id)));
      setSelectedIds(new Set());
      await hook.loadUsers();
    } finally {
      setBulkDeleting(false);
    }
  }, [selectedIds, hook]);

  /* Column definitions — memoized to avoid re-creating on every render */
  const columns = useMemo<ColumnDef<UserRow>[]>(() => [
    {
      key: 'user',
      header: 'Người dùng',
      render: (user) => (
        <div className="flex items-center gap-2 min-w-0">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <button
              onClick={e => { e.stopPropagation(); hook.openDetail(user); }}
              className="font-medium text-sm leading-tight hover:text-[var(--primary)] truncate max-w-[200px] block text-left"
              style={{ color: 'var(--text-primary)' }}
            >
              {user.name}
              {session?.user?.email === user.email && (
                <span className="ml-1 font-normal text-[10px]" style={{ color: 'var(--text-muted)' }}>— Bạn</span>
              )}
            </button>
            <div className="text-[11px] truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
              {user.email}
            </div>
            <RowActions
              user={user}
              isSelf={session?.user?.email === user.email}
              onEdit={() => hook.openEdit(user)}
              onDelete={() => hook.setDeleteTarget(user)}
              onAccess={() => hook.setAccessUser(user)}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Quyền',
      width: '90px',
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: 'tier',
      header: 'Gói',
      width: '100px',
      render: (user) => <TierBadge tier={user.subscriptionTier} />,
    },
    {
      key: 'sso',
      header: 'SSO',
      width: '80px',
      render: (user) => <SSOPills accounts={user.accounts} />,
    },
    {
      key: 'sessions',
      header: 'Thi',
      width: '52px',
      align: 'center',
      render: (user) => (
        <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {user._count?.sessions ?? 0}
        </span>
      ),
    },
    {
      key: 'joined',
      header: 'Tham gia',
      width: '84px',
      render: (user) => (
        <span className="text-xs whitespace-nowrap tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {formatDate(user.createdAt)}
        </span>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [session?.user?.email]);

  return (
    <div className="flex flex-col gap-2" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Người dùng</span>
      </nav>

      {/* ── Filters + toolbar card ──────────────────────────────────── */}
      <div className="admin-card p-0 overflow-hidden">

        {/* Filter tabs + Add button */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <FilterTabs
            summary={hook.summary}
            roleFilter={hook.roleFilter}
            tierFilter={hook.tierFilter}
            onRole={hook.handleRoleFilter}
            onTier={hook.handleTierFilter}
          />
          <button
            onClick={hook.openCreate}
            className="admin-btn admin-btn--primary text-xs px-3 py-1.5 gap-1.5 whitespace-nowrap shrink-0"
          >
            <FaUserPlus size={11} />
            Thêm người dùng
          </button>
        </div>

        {/* Toolbar: bulk actions + error + search */}
        <div className="px-4 py-2 flex items-center gap-3 flex-wrap">
          {/* Bulk actions */}
          <div className="flex items-center gap-1.5">
            <select
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value)}
              disabled={selectedIds.size === 0}
              className="input text-xs disabled:opacity-40"
              style={{ minWidth: 170, paddingTop: '0.3rem', paddingBottom: '0.3rem' }}
            >
              <option value="">Hành động hàng loạt</option>
              <option value="delete">Xóa</option>
            </select>
            <button
              onClick={handleBulkApply}
              disabled={!bulkAction || selectedIds.size === 0 || bulkDeleting}
              className="admin-btn admin-btn--primary text-xs px-3 gap-1.5 whitespace-nowrap disabled:opacity-40"
              style={{ paddingTop: '0.3rem', paddingBottom: '0.3rem' }}
            >
              <FaCircleCheck size={11} />
              {bulkDeleting ? 'Đang xóa…' : 'Áp dụng'}
            </button>
            {selectedIds.size > 0 && (
              <span className="text-xs tabular-nums whitespace-nowrap" style={{ color: 'var(--primary)' }}>
                {selectedIds.size}/{hook.total} đã chọn
              </span>
            )}
          </div>

          {hook.listError && (
            <span className="text-xs text-red-600">⚠ {hook.listError}</span>
          )}

          <div className="flex-1" />

          <AdminToolbar
            search={hook.search}
            onSearchChange={hook.handleSearch}
            searchPlaceholder="Tìm tên hoặc email…"
            className="m-0 p-0"
          />
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <AdminTable<UserRow>
          columns={columns}
          data={hook.users}
          rowKey={u => u.id}
          loading={hook.listLoading}
          skeletonRows={8}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={hook.openDetail}
          activeRowId={hook.detail?.id}
          serverPagination={{
            page: hook.page,
            totalPages: hook.totalPages,
            total: hook.total,
            onPageChange: hook.setPage,
          }}
          pageSize={10}
          emptyTitle="Không có người dùng"
          emptyDescription={hook.search ? `Không tìm thấy kết quả cho "${hook.search}"` : 'Chưa có người dùng nào trong hệ thống.'}
          emptyAction={
            hook.search ? (
              <button onClick={() => hook.handleSearch('')} className="admin-btn admin-btn--secondary text-sm px-4 py-1.5">
                Xóa tìm kiếm
              </button>
            ) : (
              <button onClick={hook.openCreate} className="admin-btn admin-btn--primary text-sm px-4 py-1.5">
                + Thêm người dùng
              </button>
            )
          }
        />

      {/* ── Drawer ───────────────────────────────────────────────────── */}
      <UserDetailDrawer
        detail={hook.detail}
        loading={hook.detailLoading}
        onClose={hook.closeDetail}
        onEdit={() =>
          hook.detail &&
          hook.openEdit({
            ...hook.detail,
            accounts: hook.detail.accounts.map(a => ({ id: a.id, provider: a.provider })),
          })
        }
        onRefresh={() =>
          hook.detail && hook.openDetail(hook.detail as unknown as UserRow)
        }
      />

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {hook.createOpen && (
        <UserCreateModal
          form={hook.createForm}
          setForm={hook.setCreateForm}
          error={hook.createErr}
          loading={hook.creating}
          onSave={hook.saveCreate}
          onClose={hook.closeCreate}
        />
      )}

      {hook.editUser && (
        <UserEditModal
          user={hook.editUser}
          form={hook.editForm}
          setForm={hook.setEditForm}
          error={hook.editErr}
          loading={hook.saving}
          onSave={hook.saveEdit}
          onClose={hook.closeEdit}
        />
      )}

      {hook.accessUser && (
        <UserAccessModal
          user={hook.accessUser}
          onClose={() => hook.setAccessUser(null)}
        />
      )}

      {/* ── Confirms ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!hook.deleteTarget}
        title="Xóa người dùng"
        message={`Bạn có chắc muốn xóa "${hook.deleteTarget?.name ?? hook.deleteTarget?.email}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        loading={hook.deleting}
        onConfirm={hook.confirmDelete}
        onCancel={() => hook.setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkConfirm}
        title="Xóa hàng loạt"
        message={`Xóa ${selectedIds.size} người dùng đã chọn? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa tất cả"
        variant="danger"
        loading={bulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkConfirm(false)}
      />
    </div>
  );
}
