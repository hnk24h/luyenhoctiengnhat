'use client';
import { useState, useMemo } from 'react';
import {
  FaPlus, FaFloppyDisk, FaTrash, FaPen,
  FaHeadphones, FaImage, FaCircleCheck, FaXmark,
  FaMagnifyingGlass, FaLayerGroup,
} from 'react-icons/fa6';
import { ConfirmDialog } from '@/components/admin/ui';

interface Question {
  id: string;
  partLabel: string | null;
  partTitle: string | null;
  passageText: string | null;
  passageAudio: string | null;
  passageImage: string | null;
  content: string;
  options: unknown;
  answer: string;
  explain: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  order: number;
}

/* ─── Helpers ────────────────────────────────────────────────── */
function parseOpts(raw: unknown): string[] {
  if (!raw) return ['', '', '', ''];
  if (Array.isArray(raw)) {
    const arr = raw.map(String);
    while (arr.length < 4) arr.push('');
    return arr;
  }
  try {
    const p = JSON.parse(raw as string);
    if (Array.isArray(p)) { const arr = p.map(String); while (arr.length < 4) arr.push(''); return arr; }
  } catch { /* */ }
  return ['', '', '', ''];
}

const BLANK = {
  partLabel: '', partTitle: '', passageText: '',
  content: '', options: ['', '', '', ''],
  answer: '', explain: '', audioUrl: '', imageUrl: '',
};

const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

/* ─── Component ──────────────────────────────────────────────── */
export default function AdminMockExamQuestionsClient({
  examId, sectionId, questions: initial,
}: {
  examId: string; sectionId: string; questions: Question[];
}) {
  const [questions, setQuestions] = useState<Question[]>(initial);

  /* Drawer */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  /* Form */
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  /* Filters */
  const [filterPart, setFilterPart] = useState('');
  const [search, setSearch] = useState('');

  /* Delete */
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── part labels for filter tabs ── */
  const partLabels = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const q of questions) {
      const l = q.partLabel ?? '';
      if (l && !seen.has(l)) { seen.add(l); out.push(l); }
    }
    return out;
  }, [questions]);

  /* ── filtered list ── */
  const filtered = useMemo(() => questions.filter(q => {
    if (filterPart && (q.partLabel ?? '') !== filterPart) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!q.content.toLowerCase().includes(s) && !(q.partTitle ?? '').toLowerCase().includes(s)) return false;
    }
    return true;
  }), [questions, filterPart, search]);

  /* ── helpers ── */
  function setField(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  function openCreate() {
    setEditing(null); setForm(BLANK);
    setError(''); setSaved(false);
    setDrawerOpen(true);
  }

  function openEdit(q: Question) {
    setEditing(q);
    setForm({
      partLabel: q.partLabel ?? '',
      partTitle: q.partTitle ?? '',
      passageText: q.passageText ?? '',
      content: q.content,
      options: parseOpts(q.options),
      answer: q.answer,
      explain: q.explain ?? '',
      audioUrl: q.audioUrl ?? '',
      imageUrl: q.imageUrl ?? '',
    });
    setError(''); setSaved(false);
    setDrawerOpen(true);
  }

  function closeDrawer() { setDrawerOpen(false); }

  /* ── submit ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content.trim()) { setError('Nội dung câu hỏi không được trống.'); return; }
    setLoading(true); setError('');

    const body = {
      ...(editing && { questionId: editing.id }),
      partLabel: form.partLabel || null,
      partTitle: form.partTitle || null,
      passageText: form.passageText || null,
      content: form.content,
      options: (form.options as string[]).filter(o => o.trim()),
      answer: form.answer,
      explain: form.explain || null,
      audioUrl: form.audioUrl || null,
      imageUrl: form.imageUrl || null,
    };

    const url = `/api/admin/mock-exam/${examId}/sections/${sectionId}/questions`;
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data: Question = await res.json();
      if (editing) {
        setQuestions(prev => prev.map(q => q.id === editing.id ? data : q));
        setEditing(data); setSaved(true);
      } else {
        setQuestions(prev => [...prev, data]);
        setEditing(data); setSaved(true);
      }
    } else {
      const d = await res.json(); setError(d.message || 'Lỗi xảy ra');
    }
    setLoading(false);
  }

  /* ── delete ── */
  async function handleDelete(q: Question) {
    setDeleting(true);
    const res = await fetch(`/api/admin/mock-exam/${examId}/sections/${sectionId}/questions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: q.id }),
    });
    if (res.ok) {
      setQuestions(prev => prev.filter(x => x.id !== q.id));
      if (editing?.id === q.id) closeDrawer();
    }
    setDeleteTarget(null);
    setDeleting(false);
  }

  /* ── render ── */
  return (
    <>
      {/* ── Card 1: filters ── */}
      <div className="admin-card p-0 overflow-hidden">
        {/* Row 1: part tabs + add button */}
        <div className="flex items-center gap-1 px-4 py-2.5 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setFilterPart('')}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={filterPart === ''
              ? { background: 'var(--primary)', color: '#fff' }
              : { color: 'var(--text-secondary)', background: 'transparent' }}
          >
            Tất cả
          </button>
          {partLabels.map(label => (
            <button
              key={label}
              onClick={() => setFilterPart(label)}
              className="px-3 py-1 rounded text-sm font-medium transition-colors"
              style={filterPart === label
                ? { background: 'var(--primary)', color: '#fff' }
                : { color: 'var(--text-secondary)', background: 'transparent' }}
            >
              {label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <FaPlus size={11} /> Thêm câu hỏi
          </button>
        </div>

        {/* Row 2: count + search */}
        <div className="flex items-center gap-3 px-4 py-2">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <FaLayerGroup size={11} />
            {filtered.length}/{questions.length} câu
          </span>
          <div className="flex-1" />
          <div className="relative">
            <FaMagnifyingGlass
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              className="input pl-7"
              style={{ width: 240 }}
              placeholder="Tìm kiếm câu hỏi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Card 2: question list ── */}
      <div className="admin-card overflow-hidden">
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map((q) => {
            const globalIdx = questions.indexOf(q);
            const isActive = editing?.id === q.id && drawerOpen;
            return (
              <div
                key={q.id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                style={{
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  background: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => openEdit(q)}
              >
                {/* Index badge */}
                <span
                  className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    width: 28, height: 28,
                    background: q.answer ? 'rgba(22,163,74,.12)' : 'var(--bg-muted)',
                    color: q.answer ? '#16a34a' : 'var(--text-muted)',
                  }}
                >
                  {globalIdx + 1}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {q.partLabel && (
                    <div className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--primary)' }}>
                      {q.partLabel}{q.partTitle ? ` — ${q.partTitle}` : ''}
                    </div>
                  )}
                  <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {q.content || '(trống)'}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {q.answer && (
                      <span className="flex items-center gap-1">
                        <FaCircleCheck size={9} style={{ color: '#16a34a' }} /> Đáp án: {q.answer}
                      </span>
                    )}
                    {q.audioUrl && <span className="flex items-center gap-1"><FaHeadphones size={9} /> audio</span>}
                    {q.imageUrl && <span className="flex items-center gap-1"><FaImage size={9} /> ảnh</span>}
                    {q.passageText && <span className="flex items-center gap-1"><FaLayerGroup size={9} /> đoạn văn</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    title="Sửa"
                    className="p-1.5 rounded transition-colors"
                    style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => openEdit(q)}
                  >
                    <FaPen size={12} />
                  </button>
                  <button
                    title="Xóa"
                    className="p-1.5 rounded transition-colors"
                    style={{ color: '#ef4444', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setDeleteTarget(q)}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
              {questions.length === 0
                ? 'Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.'
                : 'Không tìm thấy câu hỏi phù hợp.'}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Drawer ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={closeDrawer}
        >
          <div
            className="relative h-full flex flex-col overflow-hidden"
            style={{
              width: '100%', maxWidth: 540,
              background: 'var(--bg-surface)',
              boxShadow: '-4px 0 24px rgba(0,0,0,.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {editing ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                </div>
                {editing?.partLabel && (
                  <div className="text-xs mt-0.5" style={{ color: 'var(--primary)' }}>
                    {editing.partLabel}{editing.partTitle ? ` — ${editing.partTitle}` : ''}
                  </div>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded transition-colors"
                style={{ color: 'var(--text-muted)', background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <FaXmark size={16} />
              </button>
            </div>

            {/* Drawer body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <div className="flex flex-col gap-4 px-5 py-4">

                {/* Part info */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Part label
                    </label>
                    <input
                      className="input w-full"
                      value={form.partLabel}
                      onChange={e => setField('partLabel', e.target.value)}
                      placeholder="問題1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Part title
                    </label>
                    <input
                      className="input w-full"
                      value={form.partTitle}
                      onChange={e => setField('partTitle', e.target.value)}
                      placeholder="漢字読み"
                    />
                  </div>
                </div>

                {/* Passage */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Đoạn văn / passage{' '}
                    <span className="font-normal opacity-60">(tuỳ chọn — dùng chung cho nhóm câu)</span>
                  </label>
                  <textarea
                    className="input w-full font-mono text-xs"
                    rows={4}
                    value={form.passageText}
                    onChange={e => setField('passageText', e.target.value)}
                    placeholder="Đoạn văn chung cho nhóm câu hỏi..."
                  />
                </div>

                {/* Question content */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Nội dung câu hỏi <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    className="input w-full"
                    rows={4}
                    value={form.content}
                    onChange={e => setField('content', e.target.value)}
                    placeholder="Nội dung câu hỏi..."
                    required
                  />
                </div>

                {/* Options + answer */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Đáp án — nhấn vào chữ cái để chọn đáp án đúng
                  </label>
                  <div className="flex flex-col gap-2">
                    {ANSWER_LABELS.map((label, i) => (
                      <div key={label} className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold transition-colors"
                          style={{
                            width: 28, height: 28,
                            background: form.answer === label ? 'var(--primary)' : 'var(--bg-muted)',
                            color: form.answer === label ? '#fff' : 'var(--text-muted)',
                            border: form.answer === label ? 'none' : '1.5px solid var(--border)',
                          }}
                          onClick={() => setField('answer', form.answer === label ? '' : label)}
                        >
                          {label}
                        </button>
                        <input
                          className="input flex-1"
                          value={(form.options as string[])[i] ?? ''}
                          onChange={e => {
                            const next = [...(form.options as string[])];
                            next[i] = e.target.value;
                            setField('options', next);
                          }}
                          placeholder={`Nội dung đáp án ${label}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explain */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Giải thích <span className="font-normal opacity-60">(tuỳ chọn)</span>
                  </label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    value={form.explain}
                    onChange={e => setField('explain', e.target.value)}
                    placeholder="Giải thích đáp án đúng..."
                  />
                </div>

                {/* Media */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <FaHeadphones className="inline mr-1" size={10} />Audio URL
                    </label>
                    <input
                      className="input w-full"
                      value={form.audioUrl}
                      onChange={e => setField('audioUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <FaImage className="inline mr-1" size={10} />Image URL
                    </label>
                    <input
                      className="input w-full"
                      value={form.imageUrl}
                      onChange={e => setField('imageUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}
              </div>

              {/* Drawer footer */}
              <div
                className="flex items-center gap-3 px-5 py-4 flex-shrink-0 mt-auto"
                style={{ borderTop: '1px solid var(--border)' }}
              >
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
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                  disabled={loading}
                >
                  <FaFloppyDisk size={13} />
                  {loading ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Thêm câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa câu hỏi?"
        description="Xóa câu hỏi này? Hành động không thể hoàn tác."
        confirmLabel="Xóa"
        danger
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
