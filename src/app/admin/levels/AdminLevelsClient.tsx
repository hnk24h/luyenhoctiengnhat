'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaPen, FaLayerGroup } from 'react-icons/fa6';

interface Level { id: string; code: string; name: string; description: string | null; order: number }

const BLANK = { code: '', name: '', desc: '', order: 0 };

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 12 }}>
      {children}
    </div>
  );
}

export default function AdminLevelsClient({ levels: initial, subject }: { levels: Level[]; subject: string }) {
  const [levels, setLevels]     = useState<Level[]>(initial);
  const [form, setForm]         = useState(BLANK);
  const [editing, setEditing]   = useState<Level | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [saved, setSaved]       = useState(false);
  const [selectedId, setSelectedId] = useState('');

  const isAdding = !editing;
  const fl = (t: string) => <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{t}</label>;

  function startEdit(l: Level) {
    setEditing(l);
    setForm({ code: l.code, name: l.name, desc: l.description ?? '', order: l.order });
    setSaved(false); setError('');
  }
  function startAdd() { setEditing(null); setForm(BLANK); setSaved(false); setError(''); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const body = { code: form.code.toUpperCase(), name: form.name, description: form.desc, order: form.order, subject };
    if (editing) {
      const res = await fetch(`/api/admin/levels/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        setLevels(prev => prev.map(l => l.id === editing.id ? { ...l, ...body } : l));
        setSaved(true);
      } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
    } else {
      const res = await fetch('/api/admin/levels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const created: Level = await res.json();
        setLevels(prev => [...prev, created].sort((a, b) => a.order - b.order));
        setForm(BLANK); setSaved(true);
      } else { const d = await res.json(); setError(d.message || 'Lỗi xảy ra'); }
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa cấp độ này?')) return;
    await fetch(`/api/admin/levels/${id}`, { method: 'DELETE' });
    setLevels(prev => prev.filter(l => l.id !== id));
    if (editing?.id === id) { setEditing(null); setForm(BLANK); }
  }

  const displayed = selectedId ? levels.filter(l => l.id === selectedId) : levels;

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Main ── */}
      <div style={{ minWidth: 0 }}>

        {/* Form card */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
              {isAdding ? <FaPlus size={14} /> : <FaPen size={14} />}
              {isAdding ? 'Thêm cấp độ mới' : `Chỉnh sửa: ${editing?.code}`}
            </div>
            {!isAdding && (
              <button onClick={startAdd} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaPlus size={10} /> Cấp độ mới
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} style={{ padding: 20 }}>
            <div style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <SLabel>Thông tin</SLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12, marginBottom: 12 }}>
                <div>{fl('Mã cấp độ')}<input className="input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="N5" required /></div>
                <div>{fl('Tên cấp độ')}<input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sơ cấp" required /></div>
                <div>{fl('Thứ tự')}<input className="input" type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} /></div>
              </div>
              <div>{fl('Mô tả')}<input className="input" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Mô tả ngắn..." /></div>
            </div>
            {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}
            {saved && <p style={{ color: '#16a34a', fontSize: 13, marginBottom: 10 }}>✓ Đã lưu</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : isAdding ? '+ Thêm cấp độ' : '✓ Lưu thay đổi'}</button>
              {!isAdding && <button type="button" onClick={startAdd} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer' }}>Hủy</button>}
            </div>
          </form>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayed.map(l => (
            <div key={l.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', border: editing?.id === l.id ? '2px solid #dc2626' : '2px solid transparent', transition: 'border-color 0.15s' }} onClick={() => startEdit(l)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#dc2626', flexShrink: 0 }}>{l.code}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{l.name}</div>
                  {l.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{l.description}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                <Link href={`/admin/examsets?subject=${subject}&level=${l.code}`} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Xem đề</Link>
                <button onClick={() => handleDelete(l.id)} style={{ fontSize: 12, color: '#ef4444', padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa</button>
              </div>
            </div>
          ))}
          {displayed.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>Chưa có cấp độ nào.</div>}
        </div>
      </div>
    </div>
  );
}
