'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaLightbulb, FaPlus, FaFloppyDisk,
  FaTrash, FaPen, FaCheck, FaCircleCheck,
  FaHeadphones, FaImage,
} from 'react-icons/fa6';
import { MediaUploadField } from '@/components/MediaUploadField';

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

  // ── local questions list (optimistic) ──
  const [questions, setQuestions] = useState<Question[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null); // null = add new

  // ── form state ──
  const [type, setType]       = useState('tracnghiem');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer]   = useState('');
  const [explain, setExplain] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder]     = useState(initial.length + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);

  const isEditing = selectedId !== null;

  // ── load question into form when selected ──
  function loadQuestion(q: Question) {
    setSelectedId(q.id);
    setType(q.type);
    setContent(q.content);
    setOptions(parseOpts(q.options));
    setAnswer(q.answer);
    setExplain(q.explain ?? '');
    setAudioUrl(q.audioUrl ?? '');
    setImageUrl(q.imageUrl ?? '');
    setOrder(q.order);
    setError('');
    setSaved(false);
  }

  function resetForm() {
    setSelectedId(null);
    setType('tracnghiem');
    setContent('');
    setOptions(['', '', '', '']);
    setAnswer('');
    setExplain('');
    setAudioUrl('');
    setImageUrl('');
    setOrder(questions.length + 1);
    setError('');
    setSaved(false);
  }

  // ── add ──
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const payload: Record<string, unknown> = {
      examSetId, type, content, answer, explain: explain || null,
      audioUrl: audioUrl || null, imageUrl: imageUrl || null, order,
    };
    if (type === 'tracnghiem' || type === 'nghe_audio') {
      payload.options = JSON.stringify(options.filter(o => o.trim()));
    }
    const res = await fetch('/api/admin/questions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) {
      const newQ: Question = await res.json();
      setQuestions(prev => [...prev, newQ]);
      loadQuestion(newQ);
      setSaved(true);
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.message || 'Lỗi xảy ra');
    }
    setLoading(false);
  }

  // ── update ──
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true); setError('');
    const payload: Record<string, unknown> = {
      type, content, answer, explain: explain || null,
      audioUrl: audioUrl || null, imageUrl: imageUrl || null, order,
    };
    if (type === 'tracnghiem' || type === 'nghe_audio') {
      payload.options = JSON.stringify(options.filter(o => o.trim()));
    } else {
      payload.options = null;
    }
    const res = await fetch(`/api/admin/questions/${selectedId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated: Question = await res.json();
      setQuestions(prev => prev.map(q => q.id === selectedId ? updated : q));
      setSaved(true);
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.message || 'Lỗi xảy ra');
    }
    setLoading(false);
  }

  // ── delete ──
  async function handleDelete(id: string) {
    if (!confirm('Xóa câu hỏi này?')) return;
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (selectedId === id) resetForm();
    router.refresh();
  }

  const needsOptions = type === 'tracnghiem' || type === 'nghe_audio';
  const filledOptions = options.filter(o => o.trim());

  return (
    <div className="flex gap-5 items-start">
      {/* ── MAIN FORM PANEL ── */}
      <div className="flex-1 min-w-0 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px var(--border)', background: 'var(--bg-surface)' }}>

        {/* Mode header strip */}
        <div className="px-6 py-4 flex items-center gap-3 border-b"
          style={isEditing
            ? { background: 'linear-gradient(to right, #EFF6FF, #F8FAFC)', borderColor: '#BFDBFE' }
            : { background: 'linear-gradient(to right, var(--primary-light), #F8FAFC)', borderColor: 'var(--border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: isEditing ? '#2563EB' : 'var(--primary)', color: '#fff' }}>
            {isEditing ? <FaPen size={13}/> : <FaPlus size={13}/>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold" style={{ color: isEditing ? '#1D4ED8' : 'var(--primary)' }}>
              {isEditing ? `Sửa câu hỏi #${questions.find(q => q.id === selectedId)?.order ?? ''}` : 'Thêm câu hỏi mới'}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isEditing ? 'Chỉnh sửa nội dung rồi bấm Lưu' : 'Điền form rồi bấm Thêm'}
            </div>
          </div>
          {isEditing && (
            <button onClick={resetForm}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold hover:opacity-80 transition-opacity"
              style={{ background: 'white', color: '#2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <FaPlus size={9}/> Câu mới
            </button>
          )}
        </div>

        {/* Form body */}
        <div className="px-6 py-5">
          <form onSubmit={isEditing ? handleUpdate : handleAdd} className="flex flex-col gap-4">

            {/* Section 1: Cài đặt */}
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

            {/* Section 2: Media */}
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

            {/* Section 3: Nội dung */}
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', boxShadow: '0 0 0 1px var(--border)' }}>
              <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                Nội dung câu hỏi
              </div>
              <textarea className="input min-h-[90px] resize-y" value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Nhập nội dung câu hỏi..." required />
            </div>

            {/* Section 4: Lựa chọn */}
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

            {/* Section 5: Đáp án & giải thích */}
            <div className="rounded-xl p-4" style={{ background: '#F0FDF4' }}>
              <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: '#166534' }}>
                Đáp án & giải thích
              </div>
              <div className="grid grid-cols-2 gap-3">
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

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
                style={{ background: isEditing ? '#2563EB' : 'var(--primary)' }}>
                {isEditing ? <FaFloppyDisk size={12}/> : <FaPlus size={12}/>}
                {loading ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm câu hỏi'}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#16A34A' }}>
                  <FaCircleCheck size={13}/> Đã lưu
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="w-64 shrink-0 rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#1E293B', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>

        {/* Sidebar header */}
        <div className="px-4 py-3.5 flex items-center justify-between border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Danh sách câu
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {questions.length} câu hỏi
            </div>
          </div>
          <button onClick={resetForm}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all hover:opacity-90"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            <FaPlus size={9}/> Mới
          </button>
        </div>

        {questions.length === 0 && (
          <div className="text-xs text-center py-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Chưa có câu hỏi nào
          </div>
        )}

        <div className="flex flex-col gap-1 p-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ maxHeight: 'calc(100vh - 260px)' }}>
          {questions.map(q => {
            const tc = TYPE_COLOR[q.type] ?? { bg: 'var(--bg-muted)', text: 'var(--text-muted)' };
            const opts = Array.isArray(q.options) ? q.options as string[] : [];
            const isSelected = selectedId === q.id;
            return (
              <div key={q.id}
                onClick={() => loadQuestion(q)}
                className="rounded-xl px-3 py-2.5 cursor-pointer transition-all group"
                style={isSelected
                  ? { background: 'var(--primary)', boxShadow: '0 2px 8px rgba(61,58,140,0.4)' }
                  : { background: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold shrink-0"
                    style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                    #{q.order}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                    style={{ background: tc.bg, color: tc.text }}>
                    {TYPE_LABEL[q.type] ?? q.type}
                  </span>
                  {q.audioUrl && <FaHeadphones size={9} style={{ color: '#FDBA74', flexShrink: 0 }} />}
                  {q.imageUrl && <FaImage size={9} style={{ color: '#93C5FD', flexShrink: 0 }} />}
                  <button
                    onClick={e => { e.stopPropagation(); void handleDelete(q.id); }}
                    className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#F87171' }}>
                    <FaTrash size={9}/>
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed line-clamp-2"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)' }}>
                  {q.content}
                </p>
                {opts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {opts.slice(0, 4).map((o, i) => (
                      <span key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                        style={o === q.answer
                          ? { background: '#16A34A', color: '#fff' }
                          : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}