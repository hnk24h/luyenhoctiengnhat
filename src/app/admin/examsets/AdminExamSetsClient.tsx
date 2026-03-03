'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SKILLS } from '@/lib/utils';
import { FaHeadphones, FaMicrophone, FaBookOpen, FaPencil, FaFileLines, FaClock } from 'react-icons/fa6';
import type { ReactNode } from 'react';

interface Level { id: string; code: string; name: string }
interface ExamSet {
  id: string; title: string; description: string | null;
  skill: string; timeLimit: number | null;
  level: Level; _count: { questions: number };
}

export default function AdminExamSetsClient({ levels, examSets: initial }: { levels: Level[]; examSets: ExamSet[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ levelId: '', skill: 'nghe', title: '', description: '', timeLimit: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const body = { ...form, timeLimit: form.timeLimit ? parseInt(form.timeLimit) * 60 : null };
    const res = await fetch('/api/admin/examsets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) { router.refresh(); setForm({ levelId: '', skill: 'nghe', title: '', description: '', timeLimit: '' }); }
    else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa bộ đề này? Tất cả câu hỏi sẽ bị xóa.')) return;
    await fetch(`/api/admin/examsets/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  const skillColors: Record<string, string> = {
    nghe: 'bg-blue-100 text-blue-700', noi: 'bg-green-100 text-green-700',
    doc: 'bg-yellow-100 text-yellow-700', viet: 'bg-purple-100 text-purple-700',
  };
  const skillIcons: Record<string, ReactNode> = {
    nghe: <FaHeadphones size={18}/>,
    noi:  <FaMicrophone size={18}/>,
    doc:  <FaBookOpen   size={18}/>,
    viet: <FaPencil     size={18}/>,
  };

  return (
    <div>
      {/* Add form */}
      <form onSubmit={handleAdd} className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Thêm bộ đề mới</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="label">Cấp độ</label>
            <select className="input" value={form.levelId} onChange={e => setField('levelId', e.target.value)} required>
              <option value="">Chọn cấp độ...</option>
              {levels.map(l => <option key={l.id} value={l.id}>{l.code} - {l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Kỹ năng</label>
            <select className="input" value={form.skill} onChange={e => setField('skill', e.target.value)} required>
              {SKILLS.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="label">Tên bộ đề</label>
          <input className="input" value={form.title} onChange={e => setField('title', e.target.value)}
            placeholder="Ví dụ: Đề số 1 - Nghe hiểu N5" required />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label">Mô tả (tuỳ chọn)</label>
            <input className="input" value={form.description} onChange={e => setField('description', e.target.value)}
              placeholder="Mô tả ngắn..." />
          </div>
          <div>
            <label className="label">Thời gian làm bài (phút, bỏ trống = không giới hạn)</label>
            <input className="input" type="number" value={form.timeLimit} onChange={e => setField('timeLimit', e.target.value)}
              placeholder="60" min={1} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Đang thêm...' : '+ Thêm bộ đề'}
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {initial.map(s => (
          <div key={s.id} className="card flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--bg-muted)' }}>
                {skillIcons[s.skill] ?? <FaFileLines size={18}/>}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{s.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{s.level.code}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${skillColors[s.skill] ?? 'bg-gray-100'}`}>{s.skill}</span>
                  <span className="text-xs text-gray-400">{s._count.questions} câu hỏi</span>
                  {s.timeLimit && <span className="text-xs text-gray-400 flex items-center gap-0.5"><FaClock size={10}/> {s.timeLimit / 60}p</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/examsets/${s.id}/questions`} className="btn-secondary text-xs py-1 px-2">
                Câu hỏi
              </Link>
              <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:text-red-700 px-2">Xóa</button>
            </div>
          </div>
        ))}
        {initial.length === 0 && <div className="text-center text-gray-400 py-8">Chưa có bộ đề nào.</div>}
      </div>
    </div>
  );
}
