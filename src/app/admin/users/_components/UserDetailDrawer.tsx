'use client';

import React, { useState } from 'react';
import type { UserDetail } from '@/types/admin/user';
import { updateUser, revokeSSO } from '@/services/admin/userService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROVIDER_INFO: Record<string, { label: string; color: string }> = {
  google:   { label: 'Google',   color: 'bg-red-100 text-red-700 border-red-200' },
  github:   { label: 'GitHub',   color: 'bg-gray-800 text-white border-gray-700' },
  facebook: { label: 'Facebook', color: 'bg-blue-600 text-white border-blue-500' },
  apple:    { label: 'Apple',    color: 'bg-gray-900 text-white border-gray-800' },
  discord:  { label: 'Discord',  color: 'bg-indigo-600 text-white border-indigo-500' },
};

const TIER_INFO: Record<string, { label: string; color: string }> = {
  free:    { label: 'Miễn phí', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  basic:   { label: 'Cơ bản',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
  premium: { label: 'Premium',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const TIERS = ['free', 'basic', 'premium'] as const;
const ROLES = ['user', 'admin'] as const;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ detail }: { detail: UserDetail }) {
  if (detail.image) {
    return (
      <img
        src={detail.image}
        alt={detail.name}
        className="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--border)] flex-shrink-0"
      />
    );
  }
  const initials = (detail.name ?? detail.email).slice(0, 2).toUpperCase();
  return (
    <span className="w-16 h-16 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xl font-bold flex items-center justify-center ring-2 ring-[var(--border)] flex-shrink-0 select-none">
      {initials}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--bg-muted)] rounded-lg px-3 py-2.5 text-center">
      <div className="text-xl font-bold text-[var(--text-primary)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
    </div>
  );
}

// ─── SSO row ──────────────────────────────────────────────────────────────────

function SSORow({
  account,
  isOnly,
  onRevoke,
}: {
  account: { id: string; provider: string; providerAccountId: string };
  isOnly: boolean;
  onRevoke: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const info = PROVIDER_INFO[account.provider] ?? {
    label: account.provider,
    color: 'bg-gray-200 text-gray-700 border-gray-300',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-2.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${info.color}`}>
          {info.label}
        </span>
        <span className="text-xs text-[var(--text-muted)] font-mono truncate max-w-[130px]">
          {account.providerAccountId}
        </span>
      </div>

      {confirming ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-red-600">Chắc chắn?</span>
          <button
            onClick={() => onRevoke(account.id)}
            className="text-xs text-white bg-red-600 hover:bg-red-700 rounded px-2 py-0.5"
          >
            Xóa
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded px-1.5 py-0.5 border border-[var(--border)]"
          >
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          disabled={isOnly}
          title={isOnly ? 'Không thể thu hồi kết nối duy nhất' : 'Thu hồi kết nối'}
          className="text-xs text-red-600 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Thu hồi
        </button>
      )}
    </div>
  );
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

interface Props {
  detail: UserDetail | null;
  loading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

export function UserDetailDrawer({ detail, loading, onClose, onEdit, onRefresh }: Props) {
  const [savingRole, setSavingRole] = useState(false);
  const [savingTier, setSavingTier] = useState(false);
  const [revoking,   setRevoking]   = useState<string | null>(null);
  const [ssoError,   setSsoError]   = useState('');

  if (!detail && !loading) return null;

  const handleRole = async (role: string) => {
    if (!detail || role === detail.role) return;
    setSavingRole(true);
    try {
      await updateUser(detail.id, { name: detail.name, role, subscriptionTier: detail.subscriptionTier });
      onRefresh();
    } finally {
      setSavingRole(false);
    }
  };

  const handleTier = async (tier: string) => {
    if (!detail || tier === detail.subscriptionTier) return;
    setSavingTier(true);
    try {
      await updateUser(detail.id, { name: detail.name, role: detail.role, subscriptionTier: tier as UserDetail['subscriptionTier'] });
      onRefresh();
    } finally {
      setSavingTier(false);
    }
  };

  const handleRevoke = async (accountId: string) => {
    if (!detail) return;
    setRevoking(accountId);
    setSsoError('');
    try {
      await revokeSSO(detail.id, accountId);
      onRefresh();
    } catch (e) {
      setSsoError(e instanceof Error ? e.message : 'Lỗi khi thu hồi');
    } finally {
      setRevoking(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal
        aria-label="Chi tiết người dùng"
        className="fixed right-0 top-0 h-full w-[400px] max-w-full bg-[var(--bg-surface)] shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] flex-shrink-0">
          <h2 className="font-semibold text-[var(--text-primary)]">Chi tiết người dùng</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="admin-btn admin-btn--secondary text-xs py-1 px-2.5"
            >
              Sửa thông tin
            </button>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none px-1"
              aria-label="Đóng"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <span className="animate-spin text-2xl text-[var(--primary)]">⟳</span>
            </div>
          )}

          {!loading && detail && (
            <div className="px-5 py-5 space-y-6">

              {/* ── Profile ─────────────────────────────────────────── */}
              <div className="flex items-start gap-4">
                <Avatar detail={detail} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text-primary)] text-base leading-tight">{detail.name}</h3>
                  <p className="text-[var(--text-muted)] text-sm mt-0.5 break-all">{detail.email}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1.5">
                    Tham gia: {fmtDate(detail.createdAt)}
                    {detail.updatedAt !== detail.createdAt && (
                      <> · Cập nhật: {fmtDate(detail.updatedAt)}</>
                    )}
                  </p>
                </div>
              </div>

              {/* ── Role + Tier ──────────────────────────────────────── */}
              <div className="space-y-3">
                {/* Role toggle */}
                <div>
                  <div className="admin-field-label mb-1.5">Quyền hạn</div>
                  <div className="flex gap-1.5">
                    {ROLES.map(r => (
                      <button
                        key={r}
                        onClick={() => handleRole(r)}
                        disabled={savingRole}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all disabled:opacity-60 ${
                          detail.role === r
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                            : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                        }`}
                      >
                        {r === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier selector */}
                <div>
                  <div className="admin-field-label mb-1.5">Gói đăng ký</div>
                  <div className="flex gap-1.5">
                    {TIERS.map(t => {
                      const info = TIER_INFO[t];
                      return (
                        <button
                          key={t}
                          onClick={() => handleTier(t)}
                          disabled={savingTier}
                          className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all disabled:opacity-60 ${
                            detail.subscriptionTier === t
                              ? `${info.color} border-current font-bold`
                              : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                          }`}
                        >
                          {info.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── SSO Accounts ─────────────────────────────────────── */}
              <div>
                <div className="admin-field-label mb-2">Tài khoản SSO / OAuth</div>

                {detail.accounts.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] italic">Chưa liên kết tài khoản OAuth nào.</p>
                ) : (
                  <div className="admin-card p-0 divide-y divide-[var(--border)]">
                    {detail.accounts.map(acc => (
                      <div key={acc.id} className="px-3">
                        {revoking === acc.id ? (
                          <div className="py-2.5 text-xs text-[var(--text-muted)] flex items-center gap-2">
                            <span className="animate-spin">⟳</span> Đang thu hồi…
                          </div>
                        ) : (
                          <SSORow
                            account={acc}
                            isOnly={detail.accounts.length === 1}
                            onRevoke={handleRevoke}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {detail.accounts.length === 1 && (
                  <p className="mt-2 text-[11px] text-amber-600 flex items-start gap-1">
                    <span>⚠</span>
                    <span>Đây là kết nối đăng nhập duy nhất — không thể thu hồi.</span>
                  </p>
                )}

                {ssoError && (
                  <p className="mt-2 text-xs text-red-600">{ssoError}</p>
                )}
              </div>

              {/* ── Stats ────────────────────────────────────────────── */}
              <div>
                <div className="admin-field-label mb-2">Thống kê</div>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="Phiên thi"       value={detail._count.sessions} />
                  <StatCard label="Từ đã lưu"        value={detail._count.savedWords} />
                  <StatCard label="Tiến độ bài học"  value={detail._count.lessonProgress ?? 0} />
                  <StatCard label="Bộ thẻ"           value={detail._count.flashcardDecks} />
                </div>
              </div>

              {/* ── Recent sessions ──────────────────────────────────── */}
              {detail.sessions && detail.sessions.length > 0 && (
                <div>
                  <div className="admin-field-label mb-2">Phiên gần đây</div>
                  <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                    {detail.sessions.slice(0, 10).map(s => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-[var(--bg-muted)] rounded-md"
                      >
                        <span className="text-[var(--text-primary)] font-mono truncate max-w-[180px]">{s.id.slice(-8)}</span>
                        <span className="text-[var(--text-muted)] whitespace-nowrap">{fmtDateTime(s.startedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
