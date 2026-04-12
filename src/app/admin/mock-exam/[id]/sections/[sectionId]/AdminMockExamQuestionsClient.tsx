'use client';
import { useState } from 'react';
import {
  FaPlus, FaFloppyDisk, FaTrash, FaPen, FaCheck,
  FaHeadphones, FaImage, FaCircleCheck,
} from 'react-icons/fa6';

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

const BLANK = { partLabel: '', partTitle: '', passageText: '', content: '', options: ['', '', '', ''], answer: '', explain: '', audioUrl: '', imageUrl: '' };

export default function AdminMockExamQuestionsClient({
  examId, sectionId, questions: initial,
}: {
  examId: string; sectionId: string; questions: Question[];
}) {
  const [questions, setQuestions] = useState<Question[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const isEditing = selectedId !== null;

  function loadQuestion(q: Question) {
    setSelectedId(q.id);
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
  }

  function resetForm() {
    setSelectedId(null);
    setForm(BLANK);
    setError(''); setSaved(false);
  }

  function setField(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content.trim()) { setError('Nội dung câu hỏi không được trống.'); return; }
    setLoading(true); setError('');

    const body = {
      ...(isEditing && { questionId: selectedId }),
      partLabel: form.partLabel || null,
      partTitle: form.partTitle || null,
      passageText: form.passageText || null,
      content: form.content,
      options: form.options.filter(o => o.trim()),
      answer: form.answer,
      explain: form.explain || null,
      audioUrl: form.audioUrl || null,
      imageUrl: form.imageUrl || null,
    };

    const url = `/api/admin/mock-exam/${examId}/sections/${sectionId}/questions`;
    const res = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      if (isEditing) {
        setQuestions(prev => prev.map(q => q.id === selectedId ? data : q));
      } else {
        setQuestions(prev => [...prev, data]);
      }
      setSaved(true);
      if (!isEditing) resetForm();
    } else {
      const d = await res.json(); setError(d.message || 'Lỗi xảy ra');
    }
    setLoading(false);
  }

  async function handleDelete(qId: string) {
    if (!confirm('Xóa câu hỏi này?')) return;
    const res = await fetch(`/api/admin/mock-exam/${examId}/sections/${sectionId}/questions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: qId }),
    });
    if (res.ok) {
      setQuestions(prev => prev.filter(q => q.id !== qId));
      if (selectedId === qId) resetForm();
    }
  }

  const fieldLabel = (text: string) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{text}</label>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20 }}>
      {/* Left: question list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{questions.length} câu hỏi</span>
          <button onClick={resetForm} className="btn-primary" style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaPlus size={10} /> Thêm câu
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {questions.map((q, i) => (
            <div key={q.id} className="card" style={{
              padding: '10px 14px', cursor: 'pointer',
              border: selectedId === q.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'border-color .15s',
            }} onClick={() => loadQuestion(q)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: q.answer ? 'rgba(22,163,74,.12)' : 'var(--bg-muted)',
                  color: q.answer ? '#16a34a' : 'var(--text-muted)',
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {q.partLabel && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>{q.partLabel}</div>}
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {q.content || '(trống)'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                    {q.audioUrl && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><FaHeadphones size={9} /> audio</span>}
                    {q.imageUrl && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><FaImage size={9} /> ảnh</span>}
                    {q.answer && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><FaCircleCheck size={9} /> {q.answer}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => loadQuestion(q)} title="Sửa" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <FaPen size={11} />
                  </button>
                  <button onClick={() => handleDelete(q.id)} title="Xóa" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>Chưa có câu hỏi nào.</div>}
        </div>
      </div>

      {/* Right: form */}
      <div style={{ position: 'sticky', top: 20, alignSelf: 'start' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            {isEditing ? <><FaPen size={12} /> Sửa câu hỏi</> : <><FaPlus size={12} /> Thêm câu hỏi</>}
          </div>
          <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>{fieldLabel('Part label')}<input className="input" value={form.partLabel} onChange={e => setField('partLabel', e.target.value)} placeholder="問題1" /></div>
              <div>{fieldLabel('Part title')}<input className="input" value={form.partTitle} onChange={e => setField('partTitle', e.target.value)} placeholder="漢字読み" /></div>
            </div>

            <div>
              {fieldLabel('Passage / đoạn văn (nếu có)')}
              <textarea className="input" rows={3} value={form.passageText} onChange={e => setField('passageText', e.target.value)} placeholder="Đoạn văn chung cho nhóm câu hỏi..." />
            </div>

            <div>
              {fieldLabel('Nội dung câu hỏi *')}
              <textarea className="input" rows={3} value={form.content} onChange={e => setField('content', e.target.value)} placeholder="Câu hỏi..." required />
            </div>

            <div>
              {fieldLabel('Đáp án (A/B/C/D)')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['A', 'B', 'C', 'D'].map((label, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: form.answer === label ? 'var(--primary)' : 'var(--bg-muted)',
                      color: form.answer === label ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }} onClick={() => setField('answer', form.answer === label ? '' : label)}>
                      {label}
                    </span>
                    <input className="input" style={{ flex: 1 }} value={(form.options as string[])[i] || ''} onChange={e => {
                      const next = [...(form.options as string[])];
                      next[i] = e.target.value;
                      setField('options', next);
                    }} placeholder={`Đáp án ${label}`} />
                  </div>
                ))}
              </div>
            </div>

            <div>{fieldLabel('Giải thích (tuỳ chọn)')}<textarea className="input" rows={2} value={form.explain} onChange={e => setField('explain', e.target.value)} placeholder="Giải thích đáp án..." /></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>{fieldLabel('Audio URL')}<input className="input" value={form.audioUrl} onChange={e => setField('audioUrl', e.target.value)} placeholder="https://..." /></div>
              <div>{fieldLabel('Image URL')}<input className="input" value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)} placeholder="https://..." /></div>
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}
            {saved && <p style={{ color: '#16a34a', fontSize: 13 }}>✓ Đã lưu</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <FaFloppyDisk size={12} /> {loading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm câu hỏi'}
              </button>
              {isEditing && <button type="button" onClick={resetForm} className="btn-secondary">Hủy</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
