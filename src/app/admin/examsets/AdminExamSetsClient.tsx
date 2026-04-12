'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SKILLS } from '@/lib/utils';
import {
  FaHeadphones, FaMicrophone, FaBookOpen, FaPencil, FaFileLines,
  FaClock, FaPlus, FaBook,
} from 'react-icons/fa6';
import {
  AdminButton, AdminTable, AdminToolbar, AdminModal,
  AdminFormField, AdminBadge, SkillBadge, ConfirmDialog,
} from '@/components/admin/ui';
import type { ColumnDef } from '@/components/admin/ui/AdminTable';
import type { ReactNode } from 'react';

interface Level { id: string; code: string; name: string }
interface ExamSet {
  id: string; title: string; description: string | null;
  skill: string; timeLimit: number | null;
  level: Level; _count: { questions: number };
}

const BLANK_FORM = { levelId: '', skill: 'nghe', title: '', description: '', timeLimit: '' };

const SKILL_ICONS: Record<string, ReactNode> = {
  nghe: <FaHeadphones size={13} />, noi: <FaMicrophone size={13} />,
  doc: <FaBookOpen size={13} />, viet: <FaPencil size={13} />,
};

export default function AdminExamSetsClient({
  levels, examSets: initial, subject: _subject,
}: {
  levels: Level[]; examSets: ExamSet[]; subject: string;
}) {
  const [examSets, setExamSets] = useState<ExamSet[]>(initial);
  const [form, setForm]         = useState(BLANK_FORM);
  const [editing, setEditing]   = useState<ExamSet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ExamSet | null>(null);

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  /* ── Open modal ── */
  function openCreate() {
    setEditing(null); setForm(BLANK_FORM); setError(''); setModalOpen(true);
  }
  function openEdit(s: ExamSet) {
    setEditing(s);
    setForm({ levelId: s.level.id, skill: s.skill, title: s.title, description: s.description ?? '', timeLimit: s.timeLimit ? String(s.timeLimit / 60) : '' });
    setError(''); setModalOpen(true);
  }

  /* ── Submit ── */
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true); setError('');
    const body = { ...form, timeLimit: form.timeLimit ? parseInt(form.timeLimit) * 60 : null };
    try {
      if (editing) {
        const res = await fetch(`/api/admin/examsets/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          const updated: ExamSet = await res.json();
          const lvl = levels.find(l => l.id === updated.level?.id || l.id === form.levelId) ?? editing.level;
          setExamSets(prev => prev.map(s => s.id === editing.id ? { ...updated, level: lvl } : s));
          setModalOpen(false);
        } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
      } else {
        const res = await fetch('/api/admin/examsets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          const created: ExamSet = await res.json();
          const lvl = levels.find(l => l.id === form.levelId);
          if (lvl) setExamSets(prev => [...prev, { ...created, level: lvl, _count: { questions: 0 } }]);
          setModalOpen(false);
        } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
      }
    } finally { setLoading(false); }
  }

  /* ── Delete ── */
  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/examsets/${deleteTarget.id}`, { method: 'DELETE' });
    setExamSets(prev => prev.filter(s => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  /* ── Filter ── */
  const filtered = useMemo(() => {
    let result = examSets;
    if (filterLevel) result = result.filter(s => s.level.id === filterLevel);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q) || s.skill.includes(q));
    }
    return result;
  }, [examSets, filterLevel, search]);

  /* ── Columns ── */
  const columns: ColumnDef<ExamSet>[] = [
    {
      key: 'icon', header: '', width: '40px',
      render: s => (
        <div className="admin-icon-box" style={{ width: 32, height: 32 }}>
          {SKILL_ICONS[s.skill] ?? <FaFileLines size={13} />}
        </div>
      ),
    },
    {
      key: 'title', header: 'Tên bộ đề', width: '2fr',
      render: s => (
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
          {s.description && <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{s.description}</div>}
        </div>
      ),
    },
    {
      key: 'level', header: 'Cấp', width: '56px',
      render: s => <AdminBadge variant="danger">{s.level.code}</AdminBadge>,
    },
    {
      key: 'skill', header: 'Kỹ năng', width: '80px',
      render: s => <SkillBadge skill={s.skill} />,
    },
    {
      key: 'questions', header: 'Câu hỏi', width: '60px',
      headerClassName: 'text-center', cellClassName: 'text-center',
      render: s => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s._count.questions}</span>,
    },
    {
      key: 'time', header: 'Thời gian', width: '70px',
      render: s => s.timeLimit ? (
        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <FaClock size={9} /> {s.timeLimit / 60}p
        </span>
      ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>,
    },
    {
      key: 'actions', header: '', width: '110px',
      cellClassName: 'text-right',
      render: s => (
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/admin/examsets/${s.id}/questions`}>
            <AdminButton variant="secondary" size="sm">Câu hỏi</AdminButton>
          </Link>
          <AdminButton variant="danger" size="sm" onClick={e => { e.stopPropagation(); setDeleteTarget(s); }}>Xóa</AdminButton>
        </div>
      ),
    },
  ];

  return (
    <div className="pb-10">
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm bộ đề..."
        filters={
          <select className="input text-sm py-1.5" style={{ width: 'auto' }} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
            <option value="">Tất cả cấp</option>
            {levels.map(l => <option key={l.id} value={l.id}>{l.code} – {l.name}</option>)}
          </select>
        }
        actions={
          <AdminButton icon={<FaPlus size={11} />} onClick={openCreate}>Thêm bộ đề</AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        data={filtered}
        rowKey={s => s.id}
        onRowClick={openEdit}
        emptyIcon={<FaBook />}
        emptyTitle="Chưa có bộ đề nào"
        emptyDescription="Tạo bộ đề đầu tiên để bắt đầu."
        emptyAction={<AdminButton icon={<FaPlus size={11} />} onClick={openCreate}>Thêm bộ đề</AdminButton>}
      />

      {/* ── Create/Edit Modal ── */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Chỉnh sửa: ${editing.title}` : 'Thêm bộ đề mới'}
        icon={<FaBook size={14} />}
        size="md"
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setModalOpen(false)}>Hủy</AdminButton>
            <AdminButton loading={loading} onClick={handleSubmit}>
              {editing ? 'Lưu thay đổi' : 'Thêm bộ đề'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <AdminFormField label="Cấp độ" required>
              <select className="input w-full" value={form.levelId} onChange={e => setField('levelId', e.target.value)} required>
                <option value="">Chọn cấp độ...</option>
                {levels.map(l => <option key={l.id} value={l.id}>{l.code} – {l.name}</option>)}
              </select>
            </AdminFormField>
            <AdminFormField label="Kỹ năng" required>
              <select className="input w-full" value={form.skill} onChange={e => setField('skill', e.target.value)} required>
                {SKILLS.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
              </select>
            </AdminFormField>
          </div>
          <AdminFormField label="Thời gian làm bài (phút — bỏ trống = không giới hạn)">
            <input className="input" style={{ width: 120 }} type="number" value={form.timeLimit} onChange={e => setField('timeLimit', e.target.value)} placeholder="60" min={1} />
          </AdminFormField>
          <AdminFormField label="Tên bộ đề" required>
            <input className="input w-full" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Ví dụ: Đề số 1 — Nghe hiểu N5" required />
          </AdminFormField>
          <AdminFormField label="Mô tả (tuỳ chọn)">
            <input className="input w-full" value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Mô tả ngắn..." />
          </AdminFormField>
          {error && <p className="admin-field-error">{error}</p>}
        </form>
      </AdminModal>

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Xóa bộ đề "${deleteTarget?.title}"?`}
        description="Tất cả câu hỏi bên trong sẽ bị xóa. Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
