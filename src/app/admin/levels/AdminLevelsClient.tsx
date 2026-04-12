'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaLayerGroup } from 'react-icons/fa6';
import {
  AdminButton, AdminTable, AdminToolbar, AdminModal,
  AdminFormField, AdminBadge, AdminEmptyState, ConfirmDialog,
} from '@/components/admin/ui';
import type { ColumnDef } from '@/components/admin/ui/AdminTable';

interface Level { id: string; code: string; name: string; description: string | null; order: number }

const BLANK = { code: '', name: '', desc: '', order: 0 };

export default function AdminLevelsClient({ levels: initial, subject }: { levels: Level[]; subject: string }) {
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
    <div className="pb-10">
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm cấp độ..."
        actions={
          <AdminButton icon={<FaPlus size={11} />} onClick={openCreate}>Thêm cấp độ</AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        data={filtered}
        rowKey={l => l.id}
        onRowClick={openEdit}
        emptyIcon={<FaLayerGroup />}
        emptyTitle="Chưa có cấp độ nào"
        emptyDescription="Tạo cấp độ đầu tiên để bắt đầu."
        emptyAction={<AdminButton icon={<FaPlus size={11} />} onClick={openCreate}>Thêm cấp độ</AdminButton>}
        pageSize={0}
      />

      {/* ── Create/Edit Modal ── */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Chỉnh sửa: ${editing.code}` : 'Thêm cấp độ mới'}
        icon={<FaLayerGroup size={14} />}
        size="sm"
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setModalOpen(false)}>Hủy</AdminButton>
            <AdminButton loading={loading} onClick={handleSubmit}>
              {editing ? 'Lưu thay đổi' : 'Thêm cấp độ'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_1fr_80px] gap-3">
            <AdminFormField label="Mã cấp độ" required>
              <input className="input w-full" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="N5" required />
            </AdminFormField>
            <AdminFormField label="Tên cấp độ" required>
              <input className="input w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sơ cấp" required />
            </AdminFormField>
            <AdminFormField label="Thứ tự">
              <input className="input w-full" type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </AdminFormField>
          </div>
          <AdminFormField label="Mô tả">
            <input className="input w-full" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Mô tả ngắn..." />
          </AdminFormField>
          {error && <p className="admin-field-error">{error}</p>}
        </form>
      </AdminModal>

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
    </div>
  );
}
