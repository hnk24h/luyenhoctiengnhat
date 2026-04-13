'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaPlus, FaFloppyDisk, FaTrash, FaPen,
  FaCheck, FaCircleCheck, FaHeadphones, FaImage, FaXmark,
} from 'react-icons/fa6';
import { MediaUploadField } from '@/components/MediaUploadField';
import { AdminTable, type ColumnDef } from '@/components/admin/ui';

interface Question {
  id: string; type: string; content: string;
  options: unknown; answer: string; explain: string | null;
  audioUrl: string | null; imageUrl: string | null; order: number;
}

function parseOpts(raw: unknown): string[] {
  if (!raw) return ['', '', '', ''];
  if (Array.isArray(raw)) {
    const arr = raw.map(String);
    while (arr.length < 4) arr.push('');
    return arr;
  }
  try {
    const p = JSON.parse(raw as string);
    if (Array.isArray(p)) {
      const arr = p.map(String);
      while (arr.length < 4) arr.push('');
      return arr;
    }
  } catch { /* ignore */ }
  return ['', '', '', ''];
}

const TYPE_LABEL: Record<string, string> = {
  tracnghiem: 'Trắc nghiệm',
  dien_tu: 'Điền từ',
  nghe_audio: '🎧 Nghe',
};

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  tracnghiem: { bg: '#EEF2FF', text: '#4338CA' },
  dien_tu:    { bg: '#F0FDF4', text: '#15803D' },
  nghe_audio: { bg: '#FFF7ED', text: '#C2410C' },
};

export default function AdminQuestionsClient({
  examSetId,
  questions: initial,
}: {
  examSetId: string;
  questions: Question[];
}) {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>(initial);

  // ── Drawer state ──
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);

  // ── Form state ──
  const [type, setType]       = useState('tracnghiem');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer]   = useState('');
  const [explain, setExplain] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);

  // ── Filter state ──
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('');

  const filtered = useMemo(() => {
    let list = questions;
    if (filterType) list = list.filter(q => q.type === filterType);
    if (search.trim()) list = list.filter(q =>
      q.content.toLowerCase().includes(search.toLowerCase()) ||
      q.answer.toLowerCase().includes(search.toLowerCase()),
    );
    return list;
  }, [questions, filterType, search]);

  function openCreate() {
    setEditingId(null);
    setType('tracnghiem'); setContent(''); setOptions(['', '', '', '']);
    setAnswer(''); setExplain(''); setAudioUrl(''); setImageUrl('');
    setOrder(questions.length + 1);
    setError(''); setSaved(false);
    setDrawerOpen(true);
  }

  function openEdit(q: Question) {
    setEditingId(q.id);
    setType(q.type); setContent(q.content); setOptions(parseOpts(q.options));
    setAnswer(q.answer); setExplain(q.explain ?? '');
    setAudioUrl(q.audioUrl ?? ''); setImageUrl(q.imageUrl ?? '');
    setOrder(q.order);
    setError(''); setSaved(false);
    setDrawerOpen(true);
  }

  function closeDrawer() { setDrawerOpen(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const isEditing = editingId !== null;
    const payload: Record<string, unknown> = {
      type, content, answer, explain: explain || null,
      audioUrl: audioUrl || null, imageUrl: imageUrl || null, order,
    };
    if (type === 'tracnghiem' || type === 'nghe_audio') {
      payload.options = JSON.stringify(options.filter(o => o.trim()));
    } else {
      payload.options = null;
    }

    const res = isEditing
      ? await fetch(`/api/admin/questions/${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
      : await fetch('/api/admin/questions', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, examSetId }),
        });

    if (res.ok) {
      const result: Question = await res.json();
      if (isEditing) {
        setQuestions(prev => prev.map(q => q.id === editingId ? result : q));
      } else {
        setQuestions(prev => [...prev, result]);
        setEditingId(result.id);
      }
      setSaved(true);
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.message || 'Lỗi xảy ra');
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa câu hỏi này?')) return;
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (editingId === id) closeDrawer();
    router.refresh();
  }

  const needsOptions  = type === 'tracnghiem' || type === 'nghe_audio';
  const filledOptions = options.filter(o => o.trim());

  // ── Table columns ──
  const columns = useMemo<ColumnDef<Question>[]>(() => [
    {
      key: 'order', header: '#', width: '48px', align: 'center',
      render: (q) => (
        <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
          #{q.order}
        </span>
      ),
    },
    {
      key: 'type', header: 'Loại', width: '120px',
      render: (q) => {
        const tc = TYPE_COLOR[q.type] ?? { bg: 'var(--bg-muted)', text: 'var(--text-muted)' };
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
            style={{ background: tc.bg, color: tc.text }}>
            {TYPE_LABEL[q.type] ?? q.type}
          </span>
        );
      },
    },
    {
      key: 'content', header: 'Nội dung câu hỏi',
      render: (q) => (
        <div className="min-w-0">
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {q.content}
          </p>
          <div className="flex gap-1 mt-0.5">
            {q.audioUrl && <FaHeadphones size={9} style={{ color: '#F59E0B' }} />}
            {q.imageUrl && <FaImage size={9} style={{ color: '#3B82F6' }} />}
          </div>
        </div>
      ),
    },
    {
      key: 'answer', header: 'Đáp án', width: '130px',
      render: (q) => (
        <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
          style={{ background: '#F0FDF4', color: '#16A34A' }}>
          {q.answer}
        </span>
      ),
    },
    {
      key: 'actions', header: '', width: '72px', align: 'center',
      render: (q) => (
        <div className="flex items-center gap-1.5 justify-center">
          <button onClick={e => { e.stopPropagation(); openEdit(q); }}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FaPen size={9} />
          </button>
          <button onClick={e => { e.stopPropagation(); void handleDelete(q.id); }}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <FaTrash size={9} />
          </button>
        </div>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [editingId, questions]);

  return (
    <>
      {/* ── Card 1: tabs + search + add button ── */}
      <div className="admin-card p-0 overflow-hidden">
        {/* Row 1: type tabs + add button */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {([
              { value: '',           label: 'Tất cả' },
              { value: 'tracnghiem', label: 'Trắc nghiệm' },
              { value: 'dien_tu',    label: 'Điền từ' },
              { value: 'nghe_audio', label: '🎧 Nghe' },
            ] as { value: string; label: string }[]).map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={[
                  'px-2.5 py-1.5 rounded text-sm transition-colors whitespace-nowrap',
                  filterType === tab.value
                    ? 'font-semibold bg-[var(--primary-light)] text-[var(--primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]',
                ].join(' ')}
              >
                {tab.label}
                {tab.value === '' && (
                  <span className={`ml-1 text-[11px] font-mono ${filterType === '' ? 'opacity-80' : 'opacity-60'}`}>
                    ({questions.length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
            style={{ background: 'var(--primary)' }}
          >
            <FaPlus size={10} /> Thêm câu hỏi
          </button>
        </div>

        {/* Row 2: search */}
        <div className="px-4 py-2 flex items-center gap-3">
          <div className="flex-1" />
          <input
            className="input text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm nội dung, đáp án..."
            style={{ minWidth: 220, maxWidth: 320, paddingTop: '0.3rem', paddingBottom: '0.3rem' }}
          />
        </div>
      </div>

      {/* ── Card 2: question table ── */}
      <AdminTable<Question>
        columns={columns}
        data={filtered}
        rowKey={q => q.id}
        onRowClick={openEdit}
        activeRowId={editingId}
        pageSize={20}
        emptyTitle="Chưa có câu hỏi"
        emptyDescription={
          search || filterType
            ? 'Không tìm thấy kết quả phù hợp.'
            : 'Bấm "Thêm câu hỏi" để bắt đầu.'
        }
        emptyAction={
          !search && !filterType ? (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold text-white hover:opacity-90"
              style={{ background: 'var(--primary)' }}
            >
              <FaPlus size={10} /> Thêm câu hỏi
            </button>
          ) : undefined
        }
      />

      {/* ── Right-side Drawer ── */}
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
            {/* Drawer header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: editingId ? '#EFF6FF' : 'var(--primary-light)',
                  color: editingId ? '#2563EB' : 'var(--primary)',
                }}>
                {editingId ? <FaPen size={12} /> : <FaPlus size={12} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {editingId
                    ? `Sửa câu hỏi #${questions.find(q => q.id === editingId)?.order ?? ''}`
                    : 'Thêm câu hỏi mới'}
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
              >
                <FaXmark size={13} />
              </button>
            </div>

            {/* Drawer body */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto">

                {/* Cài đặt */}
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-muted)' }}>
                  <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                    Cài đặt
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Loại câu hỏi</label>
                      <select className="input" value={type} onChange={e => { setType(e.target.value); setAnswer(''); }}>
                        <option value="tracnghiem">Trắc nghiệm</option>
                        <option value="dien_tu">Điền từ</option>
                        <option value="nghe_audio">🎧 Nghe + trắc nghiệm</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Thứ tự</label>
                      <input className="input" type="number" value={order}
                        onChange={e => setOrder(Number(e.target.value))} required min={1} />
                    </div>
                  </div>
                </div>

                {/* Media */}
                <div className="rounded-xl p-4" style={{ background: '#FFFBEB' }}>
                  <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: '#92400E' }}>
                    Media
                  </div>
                  <div className="flex flex-col gap-3">
                    <MediaUploadField
                      type="audio"
                      value={audioUrl}
                      onChange={setAudioUrl}
                      label={<>🎧 Audio{type === 'nghe_audio' && <span className="text-red-500 ml-0.5">*</span>}{type !== 'nghe_audio' && <span className="font-normal opacity-60 ml-1">(tùy chọn)</span>}</>}
                      required={type === 'nghe_audio'}
                    />
                    <MediaUploadField
                      type="image"
                      value={imageUrl}
                      onChange={setImageUrl}
                      label={<>🖼️ Hình ảnh <span className="font-normal opacity-60">(tùy chọn)</span></>}
                    />
                  </div>
                </div>

                {/* Nội dung */}
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', boxShadow: '0 0 0 1px var(--border)' }}>
                  <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                    Nội dung câu hỏi
                  </div>
                  <textarea className="input min-h-[90px] resize-y" value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Nhập nội dung câu hỏi..." required />
                </div>

                {/* Lựa chọn */}
                {needsOptions && (
                  <div className="rounded-xl p-4" style={{ background: '#F5F3FF' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: '#6D28D9' }}>
                      Các lựa chọn
                    </div>
                    <div className="flex flex-col gap-2">
                      {options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0"
                            style={opt === answer && opt.trim()
                              ? { background: '#16A34A', color: '#fff' }
                              : { background: '#EDE9FE', color: '#7C3AED' }}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <input className="input flex-1" value={opt}
                            onChange={e => {
                              const v = e.target.value;
                              setOptions(prev => prev.map((o, j) => j === i ? v : o));
                              if (answer === opt) setAnswer(v);
                            }}
                            placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`} />
                          {opt.trim() && (
                            <button type="button" onClick={() => setAnswer(opt)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                              title="Đặt làm đáp án đúng"
                              style={answer === opt
                                ? { background: '#16A34A', color: '#fff' }
                                : { background: '#EDE9FE', color: '#7C3AED' }}>
                              <FaCheck size={9} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Đáp án & giải thích */}
                <div className="rounded-xl p-4" style={{ background: '#F0FDF4' }}>
                  <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: '#166534' }}>
                    Đáp án & giải thích
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="label">Đáp án đúng</label>
                      {needsOptions ? (
                        <select className="input" value={answer} onChange={e => setAnswer(e.target.value)} required>
                          <option value="">Chọn đáp án...</option>
                          {filledOptions.map((opt, i) => (
                            <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input className="input" value={answer} onChange={e => setAnswer(e.target.value)}
                          placeholder="Nhập đáp án đúng..." required />
                      )}
                    </div>
                    <div>
                      <label className="label">Giải thích <span className="font-normal opacity-60">(tùy chọn)</span></label>
                      <input className="input" value={explain} onChange={e => setExplain(e.target.value)}
                        placeholder="Giải thích đáp án..." />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm rounded-xl px-4 py-2.5" style={{ background: '#FEE2E2', color: '#DC2626' }}>{error}</p>
                )}
              </div>

              {/* Drawer footer */}
              <div className="px-5 py-4 border-t flex items-center justify-between gap-2 shrink-0"
                style={{ borderColor: 'var(--border)' }}>
                <span>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#16A34A' }}>
                      <FaCircleCheck size={11} /> Đã lưu
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={closeDrawer}
                    className="text-xs px-4 py-1.5 rounded-lg font-semibold hover:opacity-80 transition-opacity"
                    style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    Hủy
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg font-semibold text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
                    style={{ background: editingId ? '#2563EB' : 'var(--primary)' }}>
                    {editingId ? <FaFloppyDisk size={10} /> : <FaPlus size={10} />}
                    {loading ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm câu hỏi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}