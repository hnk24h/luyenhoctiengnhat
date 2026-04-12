'use client';
import { useState, useMemo, useRef } from 'react';
import {
  FaPlus, FaPen, FaListUl, FaTrash, FaClock, FaFileImport,
  FaChevronDown, FaChevronRight, FaCheck, FaEye, FaEyeSlash,
  FaHeadphones, FaBookOpen, FaBook, FaBriefcase,
} from 'react-icons/fa6';
import { JLPT_TEMPLATES, BJT_TEMPLATE, getExamTemplate } from '@/lib/mock-exam-config';
import type { ExamTemplate } from '@/lib/mock-exam-config';
import { AdminButton, AdminFormField, AdminBadge, ConfirmDialog } from '@/components/admin/ui';

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
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 12 }}>
      {children}
    </div>
  );
}

function formatTime(sec: number) {
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}p` : ''}` : `${m}p`;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminMockExamClient({
  exams: initial, subject: _subject,
}: {
  exams: MockExam[]; subject: string;
}) {
  const [exams, setExams] = useState<MockExam[]>(initial);
  const [form, setForm] = useState(BLANK_FORM);
  const [editing, setEditing] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  function startEdit(exam: MockExam) {
    setEditing(exam);
    setForm({
      title: exam.title,
      description: exam.description ?? '',
      subject: exam.subject,
      levelCode: exam.levelCode,
      year: exam.year ? String(exam.year) : '',
      totalTime: exam.totalTime ? String(Math.round(exam.totalTime / 60)) : '',
    });
    setSaved(false); setError('');
  }
  function startAdd() { setEditing(null); setForm(BLANK_FORM); setSaved(false); setError(''); }

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
          subject: form.subject,
          levelCode: form.levelCode,
          totalTime: totalTimeSec,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setExams(prev => prev.map(e => e.id === editing.id ? updated : e));
        setSaved(true);
      } else {
        const d = await res.json(); setError(d.message || 'Lỗi xảy ra');
      }
    } else {
      // Create with sections from template
      const sections = tpl?.sections.map(s => ({
        title: s.title,
        titleVi: s.titleVi,
        skill: s.skill,
        timeLimit: s.timeLimit,
      })) ?? [];

      const res = await fetch('/api/admin/mock-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          subject: form.subject,
          levelCode: form.levelCode,
          totalTime: totalTimeSec,
          sections,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setExams(prev => [created, ...prev]);
        setForm(BLANK_FORM); setSaved(true);
      } else {
        const d = await res.json(); setError(d.message || 'Lỗi xảy ra');
      }
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    const res = await fetch(`/api/admin/mock-exam/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExams(prev => prev.filter(e => e.id !== id));
      if (editing?.id === id) startAdd();
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
      const updated = await res.json();
      setExams(prev => prev.map(e => e.id === exam.id ? updated : e));
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
        const created = await res.json();
        setExams(prev => [created, ...prev]);
        setShowImport(false); setImportJson('');
      } else {
        const d = await res.json(); setImportError(d.message || 'Lỗi import');
      }
    } catch {
      setImportError('JSON không hợp lệ. Kiểm tra lại định dạng.');
    }
    setImportLoading(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setImportJson(ev.target?.result as string ?? ''); };
    reader.readAsText(file);
  }

  const levels = form.subject === 'BJT' ? BJT_LEVELS : JLPT_LEVELS;

  const filtered = useMemo(
    () => filterLevel ? exams.filter(e => e.levelCode === filterLevel) : exams,
    [exams, filterLevel],
  );

  const isAdding = !editing;

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Create / Edit form ── */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
            {isAdding ? <FaPlus size={14} /> : <FaPen size={14} />}
            {isAdding ? 'Tạo đề thi thử mới' : `Chỉnh sửa: ${editing?.title}`}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {!isAdding && (
              <button onClick={startAdd} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaPlus size={10} /> Đề mới
              </button>
            )}
            <button onClick={() => setShowImport(!showImport)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FaFileImport size={10} /> Import JSON
            </button>
          </div>
        </div>

        {/* Import panel */}
        {showImport && (
          <div style={{ padding: 20, borderBottom: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
            <SLabel>Import đề thi từ JSON</SLabel>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Tải lên file JSON hoặc dán nội dung JSON bên dưới. Xem cấu trúc tại API docs.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <AdminButton variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                Chọn file .json
              </AdminButton>
              <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>
            <textarea
              className="input"
              rows={8}
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              placeholder='{"title":"...","subject":"JLPT","levelCode":"N3","totalTime":8400,"sections":[...]}'
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
            {importError && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{importError}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <AdminButton variant="primary" onClick={handleImport} disabled={importLoading || !importJson.trim()} loading={importLoading}>
                {importLoading ? 'Đang import...' : 'Import'}
              </AdminButton>
              <AdminButton variant="secondary" onClick={() => { setShowImport(false); setImportJson(''); setImportError(''); }}>Hủy</AdminButton>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          {/* Settings */}
          <div style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <SLabel>Cài đặt</SLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <AdminFormField label="Môn thi">
                <select className="input" value={form.subject} onChange={e => applyTemplate(e.target.value, form.subject === e.target.value ? form.levelCode : (e.target.value === 'BJT' ? 'J1+' : 'N5'))}>
                  <option value="JLPT">JLPT</option>
                  <option value="BJT">BJT</option>
                </select>
              </AdminFormField>
              <AdminFormField label="Cấp độ">
                <select className="input" value={form.levelCode} onChange={e => applyTemplate(form.subject, e.target.value)}>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </AdminFormField>
              <AdminFormField label="Năm đề (tuỳ chọn)">
                <input className="input" type="number" value={form.year} onChange={e => setField('year', e.target.value)} placeholder="2024" min={2000} max={2099} />
              </AdminFormField>
            </div>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 160px', gap: 12 }}>
              <AdminFormField label="Tổng thời gian (phút)">
                <input className="input" type="number" value={form.totalTime} onChange={e => setField('totalTime', e.target.value)} placeholder="Tự tính từ template" min={1} />
              </AdminFormField>
            </div>
          </div>

          {/* Content */}
          <div style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <SLabel>Nội dung</SLabel>
            <div style={{ marginBottom: 12 }}>
              <AdminFormField label="Tên đề thi" required>
                <input className="input" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Ví dụ: Đề thi thử JLPT N3 — 2024" required />
              </AdminFormField>
            </div>
            <AdminFormField label="Mô tả (tuỳ chọn)">
              <input className="input" value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Mô tả ngắn..." />
            </AdminFormField>
          </div>

          {/* Template preview */}
          {isAdding && (() => {
            const tpl = getExamTemplate(form.subject as any, form.levelCode);
            if (!tpl) return null;
            return (
              <div style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
                <SLabel>Cấu trúc đề (sẽ tạo tự động)</SLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tpl.sections.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {SKILL_ICON[s.skill] ?? <FaBookOpen size={13} />}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.titleVi || s.title}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>— {formatTime(s.timeLimit)}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({s.parts.length} phần)</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}
          {saved && <p style={{ color: '#16a34a', fontSize: 13, marginBottom: 10 }}>✓ Đã lưu</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <AdminButton type="submit" variant="primary" disabled={loading} loading={loading}>
              {isAdding ? '+ Tạo đề thi' : '✓ Lưu thay đổi'}
            </AdminButton>
            {!isAdding && (
              <AdminButton variant="secondary" onClick={startAdd}>
                Hủy
              </AdminButton>
            )}
          </div>
        </form>
      </div>

      {/* ── Exam list ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <FaListUl size={12} />
          {filtered.length} đề thi
        </div>
        <select className="input" style={{ width: 'auto' }} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value="">Tất cả cấp</option>
          {(exams.some(e => e.subject === 'JLPT') ? JLPT_LEVELS : []).map(l => <option key={l} value={l}>{l}</option>)}
          {(exams.some(e => e.subject === 'BJT') ? BJT_LEVELS : []).map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(exam => {
          const totalQ = exam.sections.reduce((s, sec) => s + sec._count.questions, 0);
          const isOpen = expandedExam === exam.id;
          return (
            <div key={exam.id} className="card" style={{ overflow: 'hidden', border: editing?.id === exam.id ? '2px solid var(--primary)' : '2px solid transparent', transition: 'border-color .15s' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer' }} onClick={() => setExpandedExam(isOpen ? null : exam.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: exam.published ? 'rgba(22,163,74,.12)' : 'var(--bg-muted)', color: exam.published ? '#16a34a' : 'var(--text-muted)', flexShrink: 0 }}>
                    {isOpen ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {exam.title}
                      {exam.published ? (
                        <span style={{ fontSize: 10, background: 'rgba(22,163,74,.15)', color: '#16a34a', padding: '1px 6px', borderRadius: 4 }}>Đã xuất bản</span>
                      ) : (
                        <span style={{ fontSize: 10, background: 'var(--bg-muted)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: 4 }}>Nháp</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 4 }}>{exam.subject}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 4 }}>{exam.levelCode}</span>
                      {exam.year && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Năm {exam.year}</span>}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exam.sections.length} phần</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{totalQ} câu</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}><FaClock size={9} /> {formatTime(exam.totalTime)}</span>
                      {exam._count.sessions > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exam._count.sessions} lượt thi</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <AdminButton variant="ghost" size="sm" title={exam.published ? 'Ẩn' : 'Xuất bản'}
                    icon={exam.published ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                    onClick={() => handleTogglePublish(exam)}
                    style={{ color: exam.published ? '#16a34a' : 'var(--text-muted)' }} />
                  <AdminButton variant="ghost" size="sm" title="Sửa"
                    icon={<FaPen size={12} />}
                    onClick={() => startEdit(exam)} />
                  <AdminButton variant="ghost" size="sm" title="Xóa"
                    icon={<FaTrash size={12} />}
                    onClick={() => setDeleteTarget({ id: exam.id, title: exam.title })}
                    style={{ color: '#ef4444' }} />
                </div>
              </div>

              {/* Expanded sections */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', background: 'var(--bg-muted)' }}>
                  <SLabel>Các phần thi</SLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {exam.sections.map(sec => (
                      <div key={sec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {SKILL_ICON[sec.skill] ?? <FaBookOpen size={13} />}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{sec.titleVi || sec.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                              <span>{SKILL_LABEL[sec.skill] || sec.skill}</span>
                              <span><FaClock size={9} /> {formatTime(sec.timeLimit)}</span>
                              <span>{sec._count.questions} câu</span>
                            </div>
                          </div>
                        </div>
                        <AdminButton variant="secondary" size="sm"
                          onClick={() => window.location.href = `/admin/mock-exam/${exam.id}/sections/${sec.id}`}>
                          Câu hỏi
                        </AdminButton>
                      </div>
                    ))}
                    {exam.sections.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px 0', fontSize: 13 }}>
                        Chưa có phần thi nào.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
            Chưa có đề thi nào.
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa đề thi?"
        description={`Xóa "${deleteTarget?.title ?? ''}"`+ '? Tất cả phần thi, câu hỏi, và kết quả sẽ bị xóa.'}
        confirmLabel="Xóa"
        danger
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
