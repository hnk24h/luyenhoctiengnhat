'use client';

import {
  FaUserPlus, FaShield, FaUser, FaFloppyDisk,
  FaCircleExclamation, FaXmark, FaLock, FaEnvelope,
} from 'react-icons/fa6';
import { AdminButton, AdminFormField } from '@/components/admin/ui';
import type { UserCreateInput } from '@/types/admin/user';

interface Props {
  form: UserCreateInput;
  setForm: (form: UserCreateInput) => void;
  error: string;
  loading: boolean;
  onSave: () => void;
  onClose: () => void;
}

export default function UserCreateModal({
  form, setForm, error, loading, onSave, onClose,
}: Props) {
  const set = <K extends keyof UserCreateInput>(k: K, v: UserCreateInput[K]) =>
    setForm({ ...form, [k]: v });

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
            <FaUserPlus size={13} style={{ color: 'var(--primary)' }} />
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Thêm người dùng mới
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

        {/* ── Avatar placeholder ── */}
        <div
          className="px-5 py-5 border-b shrink-0 flex items-center gap-4"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <FaUser size={22} />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {form.name || 'Tên người dùng'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {form.email || 'email@example.com'}
            </div>
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
          <AdminFormField label="Tên hiển thị" required>
            <input
              className="input w-full"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </AdminFormField>

          {/* Email */}
          <AdminFormField label="Email" required>
            <div className="relative">
              <FaEnvelope
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                className="input w-full"
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                style={{ paddingLeft: '1.9rem' }}
              />
            </div>
          </AdminFormField>

          {/* Password */}
          <AdminFormField label="Mật khẩu" required>
            <div className="relative">
              <FaLock
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                className="input w-full"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                style={{ paddingLeft: '1.9rem' }}
              />
            </div>
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
            Tạo tài khoản
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
