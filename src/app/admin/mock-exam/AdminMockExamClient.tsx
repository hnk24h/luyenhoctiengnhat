'use client';
import { useState, useMemo, useRef } from 'react';
import {
  FaPlus, FaPen, FaTrash, FaClock, FaFileImport,
  FaChevronDown, FaChevronRight, FaEye, FaEyeSlash,
  FaHeadphones, FaBookOpen, FaBook, FaBriefcase, FaXmark,
  FaFloppyDisk, FaCircleCheck,
} from 'react-icons/fa6';
import { getExamTemplate } from '@/lib/mock-exam-config';
import {
  AdminButton, AdminFormField, ConfirmDialog,
} from '@/components/admin/ui';

/* ─── Types ─────────────────────────────────────────────────── */
interface SectionData {
  id: string;
  title: string;
  titleVi: string | null;
  skill: string;
  timeLimit: number;
  order: number;
  _count: { questions: number };
}
interface MockExam {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  levelCode: string;
  year: number | null;
  totalTime: number;
  published: boolean;
  sections: SectionData[];
  _count: { sessions: number };
}

/* ─── Constants ─────────────────────────────────────────────── */
const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const BJT_LEVELS = ['J1+', 'J1', 'J2', 'J3', 'J4', 'J5'];

const SKILL_ICON: Record<string, React.ReactNode> = {
  vocab: <FaBook size={13} />,
  grammar_reading: <FaBookOpen size={13} />,
  listening: <FaHeadphones size={13} />,
  reading: <FaBookOpen size={13} />,
  integrated: <FaBriefcase size={13} />,
};
const SKILL_LABEL: Record<string, string> = {
  vocab: 'Từ vựng', grammar_reading: 'Ngữ pháp & Đọc',
  listening: 'Nghe', reading: 'Đọc hiểu', integrated: 'Tổng hợp',
};

const BLANK_FORM = { title: '', description: '', subject: 'JLPT', levelCode: 'N5', year: '', totalTime: '' };

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
      {children}
    </div>
  );
}

function formatTime(sec: number) {
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}p` : ''}` : `${m}p`;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminMockExamClient({ exams: initial }: { exams: MockExam[] }) {
  const [exams, setExams] = useState<MockExam[]>(initial);

  /* Drawer */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing]       = useState<MockExam | null>(null);

  /* Form */
  const [form, setForm]       = useState(BLANK_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);
  const [showImport, setShowImport]       = useState(false);
  const [importJson, setImportJson]       = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError]     = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Filters */
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLevel, setFilterLevel]     = useState('');
  const [search, setSearch]               = useState('');

  /* Expand */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* Delete */
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting]         = useState(false);

  /* ── helpers ── */
  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  // Auto-fill from template when subject/level changes
  function applyTemplate(subject: string, levelCode: string) {
    const tpl = getExamTemplate(subject as any, levelCode);
    if (tpl) {
      setForm(f => ({
        ...f,
        subject,
        levelCode,
        totalTime: String(Math.round(tpl.totalTime / 60)),
        title: f.title || `Đề thi thử ${subject} ${levelCode}${f.year ? ` — ${f.year}` : ''}`,
      }));
    } else {
      setForm(f => ({ ...f, subject, levelCode }));
    }
  }

  function openCreate() {
    setEditing(null); setForm(BLANK_FORM);
    setError(''); setSaved(false);
    setShowImport(false); setImportJson(''); setImportError('');
    setDrawerOpen(true);
  }
  function openEdit(exam: MockExam) {
    setEditing(exam);
    setForm({
      title: exam.title,
      description: exam.description ?? '',
      subject: exam.subject,
      levelCode: exam.levelCode,
      year: exam.year ? String(exam.year) : '',
      totalTime: exam.totalTime ? String(Math.round(exam.totalTime / 60)) : '',
    });
    setError(''); setSaved(false);
    setShowImport(false); setImportJson(''); setImportError('');
    setDrawerOpen(true);
  }
  function closeDrawer() { setDrawerOpen(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const tpl = getExamTemplate(form.subject as any, form.levelCode);
    const totalTimeSec = form.totalTime ? parseInt(form.totalTime) * 60 : (tpl?.totalTime ?? 0);

    if (editing) {
      const res = await fetch(`/api/admin/mock-exam/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          year: form.year ? parseInt(form.year) : null,
          totalTime: totalTimeSec,
        }),
      });
      if (res.ok) {
        const updated: MockExam = await res.json();
        setExams(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
        setEditing(updated); setSaved(true);
      } else {
        setError((await res.json()).error ?? 'Lỗi khi lưu');
      }
    } else {
      const sections = tpl?.sections.map(s => ({
        title: s.title, titleVi: s.titleVi, skill: s.skill, timeLimit: s.timeLimit,
      })) ?? [];
      const res = await fetch('/api/admin/mock-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title, description: form.description,
          subject: form.subject, levelCode: form.levelCode,
          year: form.year ? parseInt(form.year) : null,
          totalTime: totalTimeSec, sections,
        }),
      });
      if (res.ok) {
        const created: MockExam = await res.json();
        setExams(prev => [created, ...prev]);
        setEditing(created); setSaved(true);
      } else {
        setError((await res.json()).error ?? 'Lỗi khi tạo');
      }
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    const res = await fetch(`/api/admin/mock-exam/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExams(prev => prev.filter(e => e.id !== id));
      if (editing?.id === id) closeDrawer();
    }
    setDeleteTarget(null);
    setDeleting(false);
  }

  async function handleTogglePublish(exam: MockExam) {
    const res = await fetch(`/api/admin/mock-exam/${exam.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !exam.published }),
    });
    if (res.ok) {
      const updated: MockExam = await res.json();
      setExams(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
      if (editing?.id === exam.id) setEditing(updated);
    }
  }

  async function handleImport() {
    setImportLoading(true); setImportError('');
    try {
      const data = JSON.parse(importJson);
      const res = await fetch('/api/admin/mock-exam/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created: MockExam = await res.json();
        setExams(prev => [created, ...prev]);
        closeDrawer();
      } else {
        setImportError((await res.json()).error ?? 'Lỗi import');
      }
    } catch {
      setImportError('JSON không hợp lệ. Kiểm tra lại định dạng.');
    }
    setImportLoading(false);
  }

  const formLevels = form.subject === 'BJT' ? BJT_LEVELS : JLPT_LEVELS;

  const levelOptions = useMemo(() => {
    const src = filterSubject ? exams.filter(e => e.subject === filterSubject) : exams;
    return [...new Set(src.map(e => e.levelCode))];
  }, [exams, filterSubject]);

  const filtered = useMemo(() => exams.filter(e => {
    if (filterSubject && e.subject !== filterSubject) return false;
    if (filterLevel && e.levelCode !== filterLevel) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [exams, filterSubject, filterLevel, search]);

  return (
    <>
      {/* ── Card 1: filters ── */}
      <div className="admin-card p-0 overflow-hidden">
        {/* Row 1: subject tabs + add button */}
        <div className="flex items-center gap-1 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { value: '', label: 'Tất cả' },
            { value: 'JLPT', label: '🇯🇵 JLPT' },
            { value: 'BJT', label: '💼 BJT' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilterSubject(tab.value); setFilterLevel(''); }}
              className="px-3 py-1 rounded text-sm font-medium transition-colors"
              style={filterSubject === tab.value
                ? { background: 'var(--primary)', color: '#fff' }
                : { color: 'var(--text-secondary)', background: 'transparent' }}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <FaPlus size={11} /> Thêm đề thi
          </button>
        </div>
        {/* Row 2: level select + search */}
        <div className="flex items-center gap-3 px-4 py-2">
          <select
            className="input"
            style={{ width: 'auto', minWidth: 130 }}
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
          >
            <option value="">Tất cả cấp độ</option>
            {levelOptions.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="flex-1" />
          <input
            className="input"
            style={{ width: 240 }}
            placeholder="Tìm kiếm đề thi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Card 2: exam accordion list ── */}
      <div className="admin-card overflow-hidden">
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map(exam => {
            const totalQ = exam.sections.reduce((s, sec) => s + sec._count.questions, 0);
            const isOpen = expandedId === exam.id;
            const isActive = editing?.id === exam.id && drawerOpen;
            return (
              <div key={exam.id} style={isActive ? { borderLeft: '3px solid var(--primary)' } : { borderLeft: '3px solid transparent' }}>
                {/* Main row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => setExpandedId(isOpen ? null : exam.id)}
                >
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {exam.title}
                      </span>
                      {exam.published ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(22,163,74,.15)', color: '#16a34a' }}>Đã xuất bản</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>Nháp</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                      <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-muted)' }}>{exam.subject}</span>
                      <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-muted)' }}>{exam.levelCode}</span>
                      {exam.year && <span>Năm {exam.year}</span>}
                      <span>{exam.sections.length} phần · {totalQ} câu</span>
                      <span className="flex items-center gap-1"><FaClock size={9} />{formatTime(exam.totalTime)}</span>
                      {exam._count.sessions > 0 && <span>{exam._count.sessions} lượt thi</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      title={exam.published ? 'Ẩn' : 'Xuất bản'}
                      className="p-1.5 rounded transition-colors"
                      style={{ color: exam.published ? '#16a34a' : 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => handleTogglePublish(exam)}
                    >
                      {exam.published ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
                    </button>
                    <button
                      title="Sửa"
                      className="p-1.5 rounded transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => openEdit(exam)}
                    >
                      <FaPen size={12} />
                    </button>
                    <button
                      title="Xóa"
                      className="p-1.5 rounded transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => setDeleteTarget({ id: exam.id, title: exam.title })}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
                {/* Expanded: sections */}
                {isOpen && (
                  <div className="px-4 pb-3 pt-2" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                      Các phần thi
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {exam.sections.length === 0 ? (
                        <div className="text-sm text-center py-3" style={{ color: 'var(--text-muted)' }}>
                          Chưa có phần thi nào.
                        </div>
                      ) : exam.sections.map(sec => (
                        <div key={sec.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'var(--bg-muted)' }}>
                              {SKILL_ICON[sec.skill] ?? <FaBookOpen size={13} />}
                            </span>
                            <div>
                              <div className="text-sm font-semibold">{sec.titleVi || sec.title}</div>
                              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <span>{SKILL_LABEL[sec.skill] || sec.skill}</span>
                                <span className="flex items-center gap-1"><FaClock size={9} />{formatTime(sec.timeLimit)}</span>
                                <span>{sec._count.questions} câu</span>
                              </div>
                            </div>
                          </div>
                          <a
                            href={`/admin/mock-exam/${exam.id}/sections/${sec.id}`}
                            className="text-xs px-3 py-1.5 rounded font-medium"
                            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                          >
                            Câu hỏi →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              Chưa có đề thi nào.
            </div>
          )}
        </div>
      </div>

      {/* ── Right drawer ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={closeDrawer}
        >
          <div
            className="h-full w-full max-w-lg flex flex-col shadow-2xl"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--primary)', color: '#fff' }}>
                {editing ? <FaPen size={13} /> : <FaPlus size={13} />}
              </span>
              <span className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Sửa đề thi' : 'Thêm đề thi'}
              </span>
              <div className="flex-1" />
              <button
                title="Import JSON"
                className="p-2 rounded transition-colors"
                style={{ color: showImport ? 'var(--primary)' : 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => setShowImport(v => !v)}
              >
                <FaFileImport size={14} />
              </button>
              <button
                className="p-2 rounded transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={closeDrawer}
              >
                <FaXmark size={16} />
              </button>
            </div>

            {/* Body + Footer wrapped in form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                {/* Import panel */}
                {showImport && (
                  <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#FFFBEB', border: '1px solid #FCD34D' }}>
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: '#92400E' }}>Import từ JSON</div>
                    <p className="text-xs" style={{ color: '#78350F' }}>
                      Tải lên file JSON hoặc dán nội dung JSON bên dưới.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-xs px-3 py-1.5 rounded font-medium"
                        style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Chọn file .json
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const reader = new FileReader();
                          reader.onload = ev => setImportJson(String(ev.target?.result ?? ''));
                          reader.readAsText(f);
                        }}
                      />
                    </div>
                    <textarea
                      className="input font-mono text-xs"
                      rows={6}
                      value={importJson}
                      onChange={e => setImportJson(e.target.value)}
                      placeholder='{"title":"...","subject":"JLPT","levelCode":"N3","totalTime":8400,"sections":[...]}'
                    />
                    {importError && <p className="text-xs" style={{ color: '#dc2626' }}>{importError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50"
                        style={{ background: 'var(--primary)', color: '#fff' }}
                        disabled={importLoading || !importJson.trim()}
                        onClick={handleImport}
                      >
                        {importLoading ? 'Đang import...' : 'Import'}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded text-sm"
                        style={{ color: 'var(--text-secondary)', background: 'var(--bg-muted)' }}
                        onClick={() => { setShowImport(false); setImportJson(''); setImportError(''); }}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Cài đặt */}
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-muted)' }}>
                  <SLabel>Cài đặt</SLabel>
                  <div className="grid grid-cols-3 gap-3">
                    <AdminFormField label="Môn thi">
                      <select
                        className="input"
                        value={form.subject}
                        onChange={e => applyTemplate(e.target.value, e.target.value === form.subject ? form.levelCode : (e.target.value === 'BJT' ? 'J1+' : 'N5'))}
                        disabled={!!editing}
                      >
                        <option value="JLPT">JLPT</option>
                        <option value="BJT">BJT</option>
                      </select>
                    </AdminFormField>
                    <AdminFormField label="Cấp độ">
                      <select
                        className="input"
                        value={form.levelCode}
                        onChange={e => applyTemplate(form.subject, e.target.value)}
                        disabled={!!editing}
                      >
                        {formLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </AdminFormField>
                    <AdminFormField label="Năm (tuỳ chọn)">
                      <input
                        className="input"
                        type="number"
                        value={form.year}
                        onChange={e => setField('year', e.target.value)}
                        placeholder="2024"
                        min={2000}
                        max={2099}
                      />
                    </AdminFormField>
                  </div>
                  <div className="mt-3">
                    <AdminFormField label="Tổng thời gian (phút)">
                      <input
                        className="input"
                        type="number"
                        value={form.totalTime}
                        onChange={e => setField('totalTime', e.target.value)}
                        placeholder="Tự tính từ template"
                        min={1}
                      />
                    </AdminFormField>
                  </div>
                </div>

                {/* Nội dung */}
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <SLabel>Nội dung</SLabel>
                  <div className="flex flex-col gap-3">
                    <AdminFormField label="Tên đề thi" required>
                      <input
                        className="input"
                        value={form.title}
                        onChange={e => setField('title', e.target.value)}
                        placeholder="Ví dụ: Đề thi thử JLPT N3 — 2024"
                        required
                      />
                    </AdminFormField>
                    <AdminFormField label="Mô tả (tuỳ chọn)">
                      <input
                        className="input"
                        value={form.description}
                        onChange={e => setField('description', e.target.value)}
                        placeholder="Mô tả ngắn..."
                      />
                    </AdminFormField>
                  </div>
                </div>

                {/* Template preview — only when creating */}
                {!editing && (() => {
                  const tpl = getExamTemplate(form.subject as any, form.levelCode);
                  if (!tpl) return null;
                  return (
                    <div className="rounded-xl p-4" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                      <SLabel>Cấu trúc đề (sẽ tạo tự động)</SLabel>
                      <div className="flex flex-col gap-2">
                        {tpl.sections.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: '#EDE9FE' }}>
                              {SKILL_ICON[s.skill] ?? <FaBookOpen size={12} />}
                            </span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.titleVi || s.title}</span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— {formatTime(s.timeLimit)} · {s.parts.length} phần</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: '#16a34a' }}>
                    <FaCircleCheck size={14} /> Đã lưu
                  </span>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  className="px-4 py-2 rounded text-sm"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-muted)' }}
                  onClick={closeDrawer}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                  disabled={loading}
                >
                  <FaFloppyDisk size={13} />
                  {loading ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Tạo đề thi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa đề thi?"
        description={`Xóa "${deleteTarget?.title ?? ''}"? Tất cả phần thi, câu hỏi và kết quả sẽ bị xóa vĩnh viễn.`}
        confirmLabel="Xóa"
        danger
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
