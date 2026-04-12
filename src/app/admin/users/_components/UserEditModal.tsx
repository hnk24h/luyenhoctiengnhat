'use client';

import {
  FaPencil, FaShield, FaUser, FaCheck, FaXmark,
  FaCircleExclamation, FaStar, FaCrown, FaCalendar,
  FaBookOpen, FaLayerGroup, FaFloppyDisk,
} from 'react-icons/fa6';
import { AdminButton, AdminFormField } from '@/components/admin/ui';
import type { UserRow, UserUpdateInput, SubscriptionTier } from '@/types/admin/user';

interface Props {
  user: UserRow | null;
  form: UserUpdateInput;
  setForm: (form: UserUpdateInput) => void;
  error: string;
  loading: boolean;
  onSave: () => void;
  onClose: () => void;
}

const TIER_OPTIONS: { value: SubscriptionTier; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { value: 'free',    label: 'Miễn phí', icon: <FaUser    size={11} />, color: '#4B5563', bg: '#F3F4F6' },
  { value: 'basic',   label: 'Cơ bản',   icon: <FaStar    size={11} />, color: '#1D4ED8', bg: '#DBEAFE' },
  { value: 'premium', label: 'Premium',  icon: <FaCrown   size={11} />, color: '#B45309', bg: '#FEF3C7' },
];

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <span className="text-base font-bold tabular-nums" style={{ color: 'var(--primary)' }}>{value}</span>
      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

export default function UserEditModal({
  user, form, setForm, error, loading, onSave, onClose,
}: Props) {
  if (!user) return null;

  const set = <K extends keyof UserUpdateInput>(k: K, v: UserUpdateInput[K]) =>
    setForm({ ...form, [k]: v });

  const joined = new Date(user.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-md flex flex-col shadow-2xl overflow-y-auto"
        style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <FaPencil size={13} style={{ color: 'var(--primary)' }} />
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Chỉnh sửa tài khoản
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-muted)]"
            style={{ border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <FaXmark size={14} />
          </button>
        </div>

        {/* ── Avatar + stats ── */}
        <div
          className="px-5 py-5 border-b shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
            >
              {user.image
                ? <img src={user.image} alt="" className="w-full h-full object-cover" />
                : user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </div>
              <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {user.email}
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <FaCalendar size={9} />
                Tham gia {joined}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="flex items-center justify-around px-3 py-3 rounded-xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <Stat label="Bài thi" value={user._count?.sessions ?? 0} />
            <div className="w-px h-8" style={{ background: 'var(--border)' }} />
            <Stat label="Tiến độ" value={user._count?.progress ?? 0} />
            <div className="w-px h-8" style={{ background: 'var(--border)' }} />
            <Stat label="Từ vựng" value={user._count?.savedWords ?? 0} />
            <div className="w-px h-8" style={{ background: 'var(--border)' }} />
            <Stat label="Bộ thẻ" value={user._count?.flashcardDecks ?? 0} />
          </div>
        </div>

        {/* ── Form ── */}
        <div className="flex-1 px-5 py-5 space-y-5">
          {error && (
            <div
              className="px-3 py-2.5 rounded-lg text-sm flex items-center gap-2"
              style={{ background: '#FEE2E2', color: '#DC2626' }}
            >
              <FaCircleExclamation size={13} />
              {error}
            </div>
          )}

          {/* Name */}
          <AdminFormField label="Tên hiển thị">
            <input
              className="input w-full"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Nhập tên hiển thị..."
            />
          </AdminFormField>

          {/* Role */}
          <AdminFormField label="Phân quyền">
            <div className="flex gap-2">
              {(['user', 'admin'] as const).map(r => {
                const active = form.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => set('role', r)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                      background: active ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: active ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {r === 'admin' ? <FaShield size={12} /> : <FaUser size={12} />}
                    {r === 'admin' ? 'Admin' : 'User'}
                  </button>
                );
              })}
            </div>
          </AdminFormField>

          {/* Tier */}
          <AdminFormField label="Gói đăng ký">
            <div className="flex gap-2">
              {TIER_OPTIONS.map(t => {
                const active = form.subscriptionTier === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => set('subscriptionTier', t.value)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      border: `1.5px solid ${active ? t.color : 'var(--border)'}`,
                      background: active ? t.bg : 'var(--bg-surface)',
                      color: active ? t.color : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </AdminFormField>

          {/* SSO info (read-only) */}
          {user.accounts.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                Tài khoản liên kết
              </div>
              <div className="flex flex-wrap gap-2">
                {user.accounts.map(a => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  >
                    {a.provider.charAt(0).toUpperCase() + a.provider.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-4 border-t shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}
        >
          <AdminButton variant="ghost" onClick={onClose}>Hủy</AdminButton>
          <AdminButton
            loading={loading}
            onClick={onSave}
            icon={<FaFloppyDisk size={12} />}
          >
            Lưu thay đổi
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
