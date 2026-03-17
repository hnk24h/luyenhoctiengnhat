'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SKILLS } from '@/lib/utils';
import {
  FaHeadphones, FaMicrophone, FaBookOpen, FaPencil, FaFileLines,
  FaClock, FaPlus, FaPen, FaListUl,
} from 'react-icons/fa6';
import type { ReactNode } from 'react';

interface Level { id: string; code: string; name: string }
interface ExamSet {
  id: string; title: string; description: string | null;
  skill: string; timeLimit: number | null;
  level: Level; _count: { questions: number };
}

const BLANK_FORM = { levelId: '', skill: 'nghe', title: '', description: '', timeLimit: '' };

const SKILL_COLORS: Record<string, string> = {
  nghe: 'bg-blue-100 text-blue-700', noi: 'bg-green-100 text-green-700',
  doc: 'bg-yellow-100 text-yellow-700', viet: 'bg-purple-100 text-purple-700',
};
const SKILL_ICONS: Record<string, ReactNode> = {
  nghe: <FaHeadphones size={16} />,
  noi:  <FaMicrophone size={16} />,
  doc:  <FaBookOpen   size={16} />,
  viet: <FaPencil     size={16} />,
};

function SLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 12 }}>
      {children}
    </div>
  );
}

export default function AdminExamSetsClient({
  levels, examSets: initial, subject: _subject,
}: {
  levels: Level[]; examSets: ExamSet[]; subject: string;
}) {
  const [examSets, setExamSets]             = useState<ExamSet[]>(initial);
  const [form, setForm]                     = useState(BLANK_FORM);
  const [editing, setEditing]               = useState<ExamSet | null>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [saved, setSaved]                   = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState('');

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function startEdit(s: ExamSet) {
    setEditing(s);
    setForm({ levelId: s.level.id, skill: s.skill, title: s.title, description: s.description ?? '', timeLimit: s.timeLimit ? String(s.timeLimit / 60) : '' });
    setSaved(false); setError('');
  }
  function startAdd() { setEditing(null); setForm(BLANK_FORM); setSaved(false); setError(''); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const body = { ...form, timeLimit: form.timeLimit ? parseInt(form.timeLimit) * 60 : null };
    if (editing) {
      const res = await fetch(`/api/admin/examsets/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const updated: ExamSet = await res.json();
        const lvl = levels.find(l => l.id === updated.level?.id || l.id === form.levelId) ?? editing.level;
        setExamSets(prev => prev.map(s => s.id === editing.id ? { ...updated, level: lvl } : s));
        setSaved(true);
      } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
    } else {
      const res = await fetch('/api/admin/examsets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const created: ExamSet = await res.json();
        const lvl = levels.find(l => l.id === form.levelId);
        if (lvl) setExamSets(prev => [...prev, { ...created, level: lvl, _count: { questions: 0 } }]);
        setForm(BLANK_FORM); setSaved(true);
      } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa bộ đề này? Tất cả câu hỏi sẽ bị xóa.')) return;
    await fetch(`/api/admin/examsets/${id}`, { method: 'DELETE' });
    setExamSets(prev => prev.filter(s => s.id !== id));
    if (editing?.id === id) { setEditing(null); setForm(BLANK_FORM); }
  }

  const filtered = useMemo(
    () => selectedLevelId ? examSets.filter(s => s.level.id === selectedLevelId) : examSets,
    [examSets, selectedLevelId],
  );
  const countByLevel = useMemo(() => {
    const m: Record<string, number> = {};
    examSets.forEach(s => { m[s.level.id] = (m[s.level.id] ?? 0) + 1; });
    return m;
  }, [examSets]);

  const isAdding = !editing;
  const fieldLabel = (text: string) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{text}</label>
  );

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* Form card */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', background: isAdding ? 'var(--primary)' : '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
              {isAdding ? <FaPlus size={14} /> : <FaPen size={14} />}
              {isAdding ? 'Thêm bộ đề mới' : `Chỉnh sửa: ${editing?.title}`}
            </div>
            {!isAdding && (
              <button onClick={startAdd} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaPlus size={10} /> Bộ đề mới
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} style={{ padding: 20 }}>
            {/* Cài đặt */}
            <div style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <SLabel>Cài đặt</SLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>{fieldLabel('Cấp độ')}<select className="input" value={form.levelId} onChange={e => setField('levelId', e.target.value)} required><option value="">Chọn cấp độ...</option>{levels.map(l => <option key={l.id} value={l.id}>{l.code} – {l.name}</option>)}</select></div>
                <div>{fieldLabel('Kỹ năng')}<select className="input" value={form.skill} onChange={e => setField('skill', e.target.value)} required>{SKILLS.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}</select></div>
              </div>
              <div style={{ marginTop: 12 }}>
                {fieldLabel('Thời gian làm bài (phút — bỏ trống = không giới hạn)')}
                <input className="input" style={{ width: 120 }} type="number" value={form.timeLimit} onChange={e => setField('timeLimit', e.target.value)} placeholder="60" min={1} />
              </div>
            </div>
            {/* Nội dung */}
            <div style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <SLabel>Nội dung</SLabel>
              <div style={{ marginBottom: 12 }}>{fieldLabel('Tên bộ đề')}<input className="input" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Ví dụ: Đề số 1 — Nghe hiểu N5" required /></div>
              <div>{fieldLabel('Mô tả (tuỳ chọn)')}<input className="input" value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Mô tả ngắn..." /></div>
            </div>
            {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}
            {saved && <p style={{ color: '#16a34a', fontSize: 13, marginBottom: 10 }}>✓ Đã lưu</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : isAdding ? '+ Thêm bộ đề' : '✓ Lưu thay đổi'}</button>
              {!isAdding && <button type="button" onClick={startAdd} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer' }}>Hủy</button>}
            </div>
          </form>
        </div>

        {/* List */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <FaListUl size={12} />
            {filtered.length} bộ đề
          </div>
          <select className="input" style={{ width: 'auto' }} value={selectedLevelId} onChange={e => setSelectedLevelId(e.target.value)}>
            <option value="">Tất cả cấp</option>
            {levels.map(l => <option key={l.id} value={l.id}>{l.code} – {l.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => (
            <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', border: editing?.id === s.id ? '2px solid var(--primary)' : '2px solid transparent', transition: 'border-color 0.15s' }} onClick={() => startEdit(s)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-muted)', flexShrink: 0 }}>
                  {SKILL_ICONS[s.skill] ?? <FaFileLines size={16} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{s.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 4 }}>{s.level.code}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${SKILL_COLORS[s.skill] ?? 'bg-gray-100 text-gray-600'}`}>{s.skill}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s._count.questions} câu</span>
                    {s.timeLimit && <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}><FaClock size={9} /> {s.timeLimit / 60}p</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                <Link href={`/admin/examsets/${s.id}/questions`} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Câu hỏi</Link>
                <button onClick={() => handleDelete(s.id)} style={{ fontSize: 12, color: '#ef4444', padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>Chưa có bộ đề nào.</div>}
        </div>
    </div>
  );
}
