'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHeadphones, FaLightbulb } from 'react-icons/fa6';

interface Question {
  id: string; type: string; content: string;
  options: string | null; answer: string; explain: string | null;
  audioUrl: string | null; imageUrl: string | null; order: number;
}

export default function AdminQuestionsClient({ examSetId, questions: initial }: { examSetId: string; questions: Question[] }) {
  const router = useRouter();
  const [type, setType] = useState('tracnghiem');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [explain, setExplain] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState(initial.length + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const payload: any = {
      examSetId, type, content, answer, explain: explain || null,
      audioUrl: audioUrl || null, imageUrl: imageUrl || null, order,
    };
    if (type === 'tracnghiem') {
      payload.options = JSON.stringify(options.filter(o => o.trim()));
    }
    const res = await fetch('/api/admin/questions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.refresh();
      setContent(''); setAnswer(''); setExplain(''); setAudioUrl(''); setImageUrl('');
      setOptions(['', '', '', '']); setOrder(prev => prev + 1);
    } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa câu hỏi này?')) return;
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Thêm câu hỏi mới</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="label">Loại câu hỏi</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)}>
              <option value="tracnghiem">Trắc nghiệm</option>
              <option value="dien_tu">Điền từ</option>
              <option value="nghe_audio">Nghe + trắc nghiệm</option>
            </select>
          </div>
          <div>
            <label className="label">Thứ tự</label>
            <input className="input" type="number" value={order} onChange={e => setOrder(Number(e.target.value))} required min={1} />
          </div>
        </div>

        {(type === 'nghe_audio') && (
          <div className="mb-3">
            <label className="label">URL Audio</label>
            <input className="input" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} placeholder="https://..." />
          </div>
        )}
        <div className="mb-3">
          <label className="label">URL Hình ảnh (tuỳ chọn)</label>
          <input className="input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div className="mb-3">
          <label className="label">Nội dung câu hỏi</label>
          <textarea className="input min-h-[80px]" value={content} onChange={e => setContent(e.target.value)}
            placeholder="Nhập nội dung câu hỏi..." required />
        </div>

        {(type === 'tracnghiem' || type === 'nghe_audio') && (
          <div className="mb-3">
            <label className="label">Các lựa chọn (A, B, C, D)</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500 w-6">{String.fromCharCode(65 + i)}.</span>
                  <input className="input flex-1" value={opt}
                    onChange={e => setOptions(prev => prev.map((o, j) => j === i ? e.target.value : o))}
                    placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="label">Đáp án đúng</label>
            {(type === 'tracnghiem' || type === 'nghe_audio') ? (
              <select className="input" value={answer} onChange={e => setAnswer(e.target.value)} required>
                <option value="">Chọn đáp án...</option>
                {options.filter(o => o.trim()).map((opt, i) => (
                  <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>
                ))}
              </select>
            ) : (
              <input className="input" value={answer} onChange={e => setAnswer(e.target.value)}
                placeholder="Nhập đáp án đúng..." required />
            )}
          </div>
          <div>
            <label className="label">Giải thích (tuỳ chọn)</label>
            <input className="input" value={explain} onChange={e => setExplain(e.target.value)} placeholder="Giải thích đáp án..." />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Đang thêm...' : '+ Thêm câu hỏi'}
        </button>
      </form>

      {/* Question list */}
      <h3 className="font-semibold text-gray-700 mb-3">Danh sách câu hỏi ({initial.length})</h3>
      <div className="space-y-3">
        {initial.map((q, idx) => {
          const opts = q.options ? JSON.parse(q.options) as string[] : null;
          return (
            <div key={q.id} className="card border-l-4 border-l-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-500">Câu {q.order}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{q.type}</span>
                  </div>
                  {q.audioUrl && <div className="text-xs text-blue-500 mb-1 flex items-center gap-1"><FaHeadphones size={12}/> {q.audioUrl}</div>}
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.content}</p>
                  {opts && (
                    <div className="mt-2 space-y-0.5">
                      {opts.map((o, i) => (
                        <div key={i} className={`text-xs flex gap-1 ${o === q.answer ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                          <span>{String.fromCharCode(65 + i)}.</span><span>{o}</span>
                          {o === q.answer && <span>✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'dien_tu' && (
                    <div className="text-xs text-green-700 mt-1">✓ Đáp án: {q.answer}</div>
                  )}
                  {q.explain && <div className="text-xs text-yellow-700 mt-1 flex items-center gap-1"><FaLightbulb size={12}/> {q.explain}</div>}
                </div>
                <button onClick={() => handleDelete(q.id)} className="text-xs text-red-400 hover:text-red-600 ml-2 shrink-0">Xóa</button>
              </div>
            </div>
          );
        })}
        {initial.length === 0 && <div className="text-gray-400 text-center py-8">Chưa có câu hỏi nào.</div>}
      </div>
    </div>
  );
}
