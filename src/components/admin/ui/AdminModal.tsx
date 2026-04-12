'use client';

import React, { useEffect, useRef } from 'react';
import { FaXmark } from 'react-icons/fa6';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  size?: ModalSize;
  children: React.ReactNode;
  /** Footer actions (buttons). Rendered at the bottom of the modal. */
  footer?: React.ReactNode;
}

export default function AdminModal({
  open, onClose, title, description, icon, size = 'md',
  children, footer,
}: AdminModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Escape to close */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* Trap focus inside panel */
  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>('input,select,textarea,button:not([disabled])');
    first?.focus();
  }, [open]);

  /* Prevent body scroll */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="admin-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={panelRef} className={`admin-modal-panel admin-modal--${size} flex flex-col`}
        style={{ maxHeight: 'calc(100vh - 48px)' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <div className="admin-icon-box">{icon}</div>}
            <div className="min-w-0">
              <h2 id="admin-modal-title" className="text-base font-bold truncate"
                style={{ color: 'var(--text-primary)' }}>
                {title}
              </h2>
              {description && (
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="admin-btn admin-btn--ghost p-1.5 rounded-lg" aria-label="Đóng">
            <FaXmark size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* ── Footer ── */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t shrink-0"
            style={{ borderColor: 'var(--border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
