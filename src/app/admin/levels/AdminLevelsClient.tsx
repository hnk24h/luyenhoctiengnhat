'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Level { id: string; code: string; name: string; description: string | null; order: number }

export default function AdminLevelsClient({ levels: initial }: { levels: Level[] }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/levels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase(), name, description: desc, order }),
    });
    if (res.ok) { router.refresh(); setCode(''); setName(''); setDesc(''); setOrder(0); }
    else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa cấp độ này?')) return;
    await fetch(`/api/admin/levels/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Thêm cấp độ mới</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="label">Mã cấp độ (N5, N4...)</label>
            <input className="input" value={code} onChange={e => setCode(e.target.value)} placeholder="N5" required />
          </div>
          <div>
            <label className="label">Tên cấp độ</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Sơ cấp" required />
          </div>
        </div>
        <div className="mb-3">
          <label className="label">Mô tả</label>
          <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả ngắn..." />
        </div>
        <div className="mb-4">
          <label className="label">Thứ tự</label>
          <input className="input w-24" type="number" value={order} onChange={e => setOrder(Number(e.target.value))} />
        </div>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Đang thêm...' : '+ Thêm cấp độ'}
        </button>
      </form>

      <div className="space-y-2">
        {initial.map(l => (
          <div key={l.id} className="card flex items-center justify-between py-3">
            <div>
              <span className="font-bold text-gray-900 mr-2">{l.code}</span>
              <span className="text-gray-600 text-sm">{l.name}</span>
              {l.description && <span className="text-gray-400 text-xs ml-2">· {l.description}</span>}
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/examsets?level=${l.code}`} className="btn-secondary text-xs py-1 px-2">
                Xem đề
              </Link>
              <button onClick={() => handleDelete(l.id)} className="text-xs text-red-500 hover:text-red-700 px-2">Xóa</button>
            </div>
          </div>
        ))}
        {initial.length === 0 && <div className="text-center text-gray-400 py-8">Chưa có cấp độ nào.</div>}
      </div>
    </div>
  );
}
