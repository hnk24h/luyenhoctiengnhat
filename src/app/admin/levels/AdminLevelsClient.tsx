'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaLayerGroup, FaXmark, FaPencil, FaCircleExclamation, FaFloppyDisk } from 'react-icons/fa6';
import { AdminButton, AdminTable,
  AdminFormField, AdminBadge, AdminEmptyState, ConfirmDialog,
} from '@/components/admin/ui';
import type { ColumnDef } from '@/components/admin/ui/AdminTable';

interface Level { id: string; code: string; name: string; description: string | null; order: number }

const SKILL_META: { key: string; label: string; color: string; bg: string }[] = [
  { key: 'doc',     label: 'Đọc',      color: '#1D4ED8', bg: '#DBEAFE' },
  { key: 'nghe',    label: 'Nghe',     color: '#0F766E', bg: '#CCFBF1' },
  { key: 'vocab',   label: 'Từ vựng',  color: '#7C3AED', bg: '#EDE9FE' },
  { key: 'grammar', label: 'Ngữ pháp', color: '#B45309', bg: '#FEF3C7' },
  { key: 'viet',    label: 'Viết',     color: '#15803D', bg: '#DCFCE7' },
  { key: 'noi',     label: 'Nói',      color: '#B91C1C', bg: '#FEE2E2' },
];

const BLANK = { code: '', name: '', desc: '', order: 0 };

export default function AdminLevelsClient({
  levels: initial, skillMap, subject,
}: {
  levels: Level[];
  skillMap: Record<string, Record<string, number>>;
  subject: string;
}) {
  const [levels, setLevels]   = useState<Level[]>(initial);
  const [form, setForm]       = useState(BLANK);
  const [editing, setEditing] = useState<Level | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Level | null>(null);

  /* ── Open modal ── */
  function openCreate() {
    setEditing(null); setForm(BLANK); setError(''); setModalOpen(true);
  }
  function openEdit(l: Level) {
    setEditing(l); setForm({ code: l.code, name: l.name, desc: l.description ?? '', order: l.order });
    setError(''); setModalOpen(true);
  }

  /* ── Submit ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const body = { code: form.code.toUpperCase(), name: form.name, description: form.desc, order: form.order, subject };
    try {
      if (editing) {
        const res = await fetch(`/api/admin/levels/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          setLevels(prev => prev.map(l => l.id === editing.id ? { ...l, ...body } : l));
          setModalOpen(false);
        } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
      } else {
        const res = await fetch('/api/admin/levels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          const created: Level = await res.json();
          setLevels(prev => [...prev, created].sort((a, b) => a.order - b.order));
          setModalOpen(false);
        } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
      }
    } finally { setLoading(false); }
  }

  /* ── Delete ── */
  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/levels/${deleteTarget.id}`, { method: 'DELETE' });
    setLevels(prev => prev.filter(l => l.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  /* ── Filter ── */
  const filtered = search
    ? levels.filter(l => l.code.toLowerCase().includes(search.toLowerCase()) || l.name.toLowerCase().includes(search.toLowerCase()))
    : levels;

  /* ── Columns ── */
  const columns: ColumnDef<Level>[] = [
    {
      key: 'code', header: 'Mã', width: '64px',
      render: l => (
        <AdminBadge variant="danger">{l.code}</AdminBadge>
      ),
    },
    {
      key: 'name', header: 'Tên cấp độ', width: '1.5fr',
      render: l => (
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{l.name}</div>
          {l.description && <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{l.description}</div>}
        </div>
      ),
    },
    {
      key: 'skills', header: 'Bài thi theo kỹ năng', width: '2fr',
      render: l => {
        const counts = skillMap[l.id] ?? {};
        const hasAny = SKILL_META.some(s => (counts[s.key] ?? 0) > 0);
        if (!hasAny) return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {SKILL_META.filter(s => (counts[s.key] ?? 0) > 0).map(s => (
              <span
                key={s.key}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium"
                style={{ background: s.bg, color: s.color }}
              >
                {s.label} <span className="font-bold">{counts[s.key]}</span>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'order', header: 'Thứ tự', width: '60px',
      headerClassName: 'text-center', cellClassName: 'text-center',
      render: l => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.order}</span>,
    },
    {
      key: 'actions', header: '', width: '140px',
      cellClassName: 'text-right',
      render: l => (
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <AdminButton variant="secondary" size="sm" onClick={e => { e.stopPropagation(); openEdit(l); }}>Sửa</AdminButton>
          <Link href={`/admin/examsets?subject=${subject}&level=${l.code}`}>
            <AdminButton variant="secondary" size="sm">Xem đề</AdminButton>
          </Link>
          <AdminButton variant="danger" size="sm" onClick={e => { e.stopPropagation(); setDeleteTarget(l); }}>Xóa</AdminButton>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Card 1: tìm kiếm + thêm mới */}
      <div className="admin-card p-3 flex flex-wrap items-center gap-2">
        <input
          className="input text-sm flex-1 min-w-[180px]"
          placeholder="Tìm theo mã hoặc tên cấp độ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <AdminButton icon={<FaPlus size={11} />} onClick={openCreate}>Thêm cấp độ</AdminButton>
      </div>

      {/* Card 2: danh sách */}
      <div className="admin-card overflow-hidden">
        <AdminTable
          columns={columns}
          data={filtered}
          rowKey={l => l.id}
          onRowClick={openEdit}
          emptyIcon={<FaLayerGroup />}
          emptyTitle="Chưa có cấp độ nào"
          emptyDescription="Tạo cấp độ đầu tiên để bắt đầu."
          emptyAction={<AdminButton icon={<FaPlus size={11} />} onClick={openCreate}>Thêm cấp độ</AdminButton>}
        />
      </div>

      {/* ── Right-side Drawer ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="h-full w-full max-w-sm flex flex-col shadow-2xl overflow-y-auto"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b shrink-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2">
                {editing ? <FaPencil size={13} style={{ color: 'var(--primary)' }} /> : <FaLayerGroup size={13} style={{ color: 'var(--primary)' }} />}
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {editing ? `Chỉnh sửa: ${editing.code}` : 'Thêm cấp độ mới'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-muted)]"
                style={{ border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <FaXmark size={14} />
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 px-5 py-5 flex flex-col gap-4">
              {error && (
                <div
                  className="px-3 py-2.5 rounded-lg text-sm flex items-center gap-2"
                  style={{ background: '#FEE2E2', color: '#DC2626' }}
                >
                  <FaCircleExclamation size={13} />
                  {error}
                </div>
              )}

              <AdminFormField label="Mã cấp độ" required>
                <input
                  className="input w-full"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="N5"
                  autoFocus
                />
              </AdminFormField>

              <AdminFormField label="Tên cấp độ" required>
                <input
                  className="input w-full"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Sơ cấp"
                />
              </AdminFormField>

              <AdminFormField label="Thứ tự">
                <input
                  className="input w-full"
                  type="number"
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                />
              </AdminFormField>

              <AdminFormField label="Mô tả">
                <input
                  className="input w-full"
                  value={form.desc}
                  onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  placeholder="Mô tả ngắn..."
                />
              </AdminFormField>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-2 px-5 py-4 border-t shrink-0"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}
            >
              <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Hủy</AdminButton>
              <AdminButton loading={loading} icon={<FaFloppyDisk size={12} />} onClick={handleSubmit}>
                {editing ? 'Lưu thay đổi' : 'Thêm cấp độ'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Xóa cấp độ "${deleteTarget?.code}"?`}
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
