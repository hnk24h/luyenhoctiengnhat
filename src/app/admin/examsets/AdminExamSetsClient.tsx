'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SKILLS } from '@/lib/utils';
import {
  FaHeadphones, FaMicrophone, FaBookOpen, FaPencil, FaFileLines,
  FaClock, FaPlus, FaBook, FaXmark, FaCircleExclamation, FaFloppyDisk,
} from 'react-icons/fa6';
import {
  AdminButton, AdminTable,
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ExamSet | null>(null);

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  /* ── Open drawer ── */
  function openCreate() {
    setEditing(null); setForm(BLANK_FORM); setError(''); setDrawerOpen(true);
  }
  function openEdit(s: ExamSet) {
    setEditing(s);
    setForm({ levelId: s.level.id, skill: s.skill, title: s.title, description: s.description ?? '', timeLimit: s.timeLimit ? String(s.timeLimit / 60) : '' });
    setError(''); setDrawerOpen(true);
  }
  function closeDrawer() { setDrawerOpen(false); }

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
          const lvl = levels.find(l => l.id === form.levelId) ?? editing.level;
          setExamSets(prev => prev.map(s => s.id === editing.id ? { ...updated, level: lvl, _count: s._count } : s));
          closeDrawer();
        } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
      } else {
        const res = await fetch('/api/admin/examsets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          const created: ExamSet = await res.json();
          const lvl = levels.find(l => l.id === form.levelId);
          if (lvl) setExamSets(prev => [...prev, { ...created, level: lvl, _count: { questions: 0 } }]);
          closeDrawer();
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
    if (filterSkill) result = result.filter(s => s.skill === filterSkill);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q) || s.skill.includes(q));
    }
    return result;
  }, [examSets, filterLevel, filterSkill, search]);

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
      key: 'questions', header: 'Câu hỏi', width: '64px',
      headerClassName: 'text-center', cellClassName: 'text-center',
      render: s => <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{s._count.questions}</span>,
    },
    {
      key: 'time', header: 'Thời gian', width: '72px',
      render: s => s.timeLimit ? (
        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <FaClock size={9} /> {s.timeLimit / 60}p
        </span>
      ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>,
    },
    {
      key: 'actions', header: '', width: '100px',
      cellClassName: 'text-right',
      render: s => (
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/admin/examsets/${s.id}/questions`} onClick={e => e.stopPropagation()}>
            <AdminButton variant="secondary" size="sm">Câu hỏi</AdminButton>
          </Link>
          <AdminButton variant="danger" size="sm" onClick={e => { e.stopPropagation(); setDeleteTarget(s); }}>Xóa</AdminButton>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Card 1: filter + add */}
      <div className="admin-card p-0 overflow-hidden">
        {/* Row 1: skill tabs + add button */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {([
              { value: '', label: 'Tất cả kỹ năng' },
              ...SKILLS.map(s => ({ value: s.key, label: `${s.icon} ${s.label}` })),
            ] as { value: string; label: string }[]).map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterSkill(tab.value)}
                className={[
                  'px-2.5 py-1.5 rounded text-sm transition-colors whitespace-nowrap',
                  filterSkill === tab.value
                    ? 'font-semibold bg-[var(--primary-light)] text-[var(--primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <AdminButton icon={<FaPlus size={11} />} onClick={openCreate} className="shrink-0">Thêm bộ đề</AdminButton>
        </div>

        {/* Row 2: level select (left) + search (right) */}
        <div className="px-4 py-2 flex items-center gap-3">
          <select
            className="input text-xs"
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            style={{ width: 'auto', minWidth: 160, paddingTop: '0.3rem', paddingBottom: '0.3rem' }}
          >
            <option value="">Tất cả cấp độ</option>
            {levels.map(l => <option key={l.id} value={l.id}>{l.code} – {l.name}</option>)}
          </select>
          <div className="flex-1" />
          <input
            className="input text-xs"
            placeholder="Tìm tên bộ đề..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 220, maxWidth: 320, paddingTop: '0.3rem', paddingBottom: '0.3rem' }}
          />
        </div>
      </div>

      {/* Card 2: danh sách */}
      <div className="admin-card overflow-hidden">
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
      </div>

      {/* ── Right-side Drawer ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={closeDrawer}
        >
          <div
            className="h-full w-full max-w-md flex flex-col shadow-2xl overflow-y-auto"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <FaBook size={13} style={{ color: 'var(--primary)' }} />
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {editing ? `Chỉnh sửa: ${editing.title}` : 'Thêm bộ đề mới'}
                </h2>
              </div>
              <button onClick={closeDrawer}
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-muted)]"
                style={{ border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <FaXmark size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 px-5 py-5 flex flex-col gap-4">
              {error && (
                <div className="px-3 py-2.5 rounded-lg text-sm flex items-center gap-2" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <FaCircleExclamation size={13} /> {error}
                </div>
              )}

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

              <AdminFormField label="Tên bộ đề" required>
                <input className="input w-full" value={form.title} onChange={e => setField('title', e.target.value)}
                  placeholder="Ví dụ: Đề số 1 — Nghe hiểu N5" required autoFocus />
              </AdminFormField>

              <AdminFormField label="Mô tả (tuỳ chọn)">
                <input className="input w-full" value={form.description} onChange={e => setField('description', e.target.value)}
                  placeholder="Mô tả ngắn..." />
              </AdminFormField>

              <AdminFormField label="Thời gian làm bài (phút — bỏ trống = không giới hạn)">
                <input className="input" style={{ width: 120 }} type="number" value={form.timeLimit}
                  onChange={e => setField('timeLimit', e.target.value)} placeholder="60" min={1} />
              </AdminFormField>

              {/* Link tới câu hỏi nếu đang edit */}
              {editing && (
                <div className="rounded-lg px-4 py-3 flex items-center justify-between"
                  style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Câu hỏi</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {editing._count.questions} câu hỏi trong bộ đề này
                    </div>
                  </div>
                  <Link href={`/admin/examsets/${editing.id}/questions`}>
                    <AdminButton variant="secondary" size="sm">Quản lý câu hỏi →</AdminButton>
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t shrink-0"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}>
              <AdminButton variant="ghost" onClick={closeDrawer}>Hủy</AdminButton>
              <AdminButton loading={loading} icon={<FaFloppyDisk size={12} />} onClick={handleSubmit}>
                {editing ? 'Lưu thay đổi' : 'Thêm bộ đề'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
