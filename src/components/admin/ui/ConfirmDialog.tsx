'use client';

import { useEffect, useRef } from 'react';
import { FaTriangleExclamation } from 'react-icons/fa6';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, description,
  confirmLabel = 'Xác nhận', cancelLabel = 'Huỷ',
  danger = false, loading = false,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 16,
        padding: '28px 28px 24px', maxWidth: 440, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <span style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
            background: danger ? '#fee2e2' : '#fef9c3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaTriangleExclamation size={16} style={{ color: danger ? '#dc2626' : '#ca8a04' }} />
          </span>
          <div>
            <div id="confirm-title" style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
              {title}
            </div>
            {description && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {description}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: 'var(--bg-muted)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)', cursor: 'pointer', transition: 'opacity .15s',
            }}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: danger ? '#dc2626' : 'var(--primary)',
              color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer',
              transition: 'opacity .15s', opacity: loading ? 0.7 : 1,
            }}>
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
