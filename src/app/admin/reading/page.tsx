'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FaPlus, FaTrash, FaPencil, FaNewspaper, FaCheck, FaXmark,
  FaMagnifyingGlass, FaEye, FaEyeSlash, FaFileImport, FaFileExport,
  FaPrint, FaCircleCheck, FaCircleXmark, FaDownload, FaUpload,
  FaClipboard, FaFile,
} from 'react-icons/fa6';

interface Passage {
  id: string; title: string; titleVi: string | null; level: string;
  type: string; published: boolean; charCount: number; createdAt: string;
}

const BLANK = {
  title: '', titleVi: '', content: '', summary: '',
  level: 'N5', type: 'short', source: '', sourceUrl: '', tags: '', published: true,
};

const SAMPLE_IMPORT = [
  {
    title: '日本の四季',
    titleVi: 'Bốn mùa ở Nhật Bản',
    content: '日本には春、夏、秋、冬の四つの季節があります。春は桜の花が咲いて、とてもきれいです。夏は暑くて、海やプールで泳ぎます。秋は紅葉が美しいです。冬は雪が降る地方もあります。',
    summary: 'Bài giới thiệu về bốn mùa đặc trưng của Nhật Bản.',
    level: 'N5',
    type: 'short',
    source: 'Mẫu',
    tags: ['thiên nhiên', 'bốn mùa'],
    published: true,
  },
  {
    title: '東京の交通',
    titleVi: 'Giao thông ở Tokyo',
    content: '東京の電車はとても便利です。地下鉄や山手線など、たくさんの路線があります。毎日、何百万人もの人が電車を使って通勤や通学をしています。電車は時間通りに来ることで有名です。',
    summary: 'Hệ thống giao thông công cộng tiện lợi tại Tokyo.',
    level: 'N4',
    type: 'short',
    source: 'Mẫu',
    tags: ['giao thông', 'Tokyo'],
    published: true,
  },
];

export default function AdminReadingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [passages,      setPassages]      = useState<Passage[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [editId,        setEditId]        = useState<string | null>(null);
  const [form,          setForm]          = useState({ ...BLANK });
  const [saving,        setSaving]        = useState(false);
  const [search,        setSearch]        = useState('');
  const [formError,     setFormError]     = useState('');
  const [exporting,     setExporting]     = useState(false);
  const [showImport,    setShowImport]    = useState(false);
  const [importJson,    setImportJson]    = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult,  setImportResult]  = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [parseError,    setParseError]    = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'admin' && role !== 'ADMIN') router.push('/');
    }
  }, [status, session, router]);

  const load = useCallback(async () => {
    const res = await fetch('/api/reading?admin=1');
    if (res.ok) setPassages(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /*──────────── Create / Edit ────────────*/
  function openCreate() {
    setForm({ ...BLANK }); setEditId(null); setFormError(''); setShowModal(true);
  }
  async function openEdit(id: string) {
    const res = await fetch(`/api/reading/${id}`);
    if (!res.ok) return;
    const p = await res.json();
    setForm({
      title:     p.title     ?? '',
      titleVi:   p.titleVi   ?? '',
      content:   p.content   ?? '',
      summary:   p.summary   ?? '',
      level:     p.level     ?? 'N5',
      type:      p.type      ?? 'short',
      source:    p.source    ?? '',
      sourceUrl: p.sourceUrl ?? '',
      tags:      p.tags ? (p.tags as string[]).join(', ') : '',
      published: p.published !== false,
    });
    setEditId(id); setFormError(''); setShowModal(true);
  }
  async function save() {
    if (!form.title.trim() || !form.content.trim()) { setFormError('Tiêu đề và nội dung bắt buộc.'); return; }
    setSaving(true); setFormError('');
    const body = { ...form, tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [] };
    const res = editId
      ? await fetch(`/api/reading/${editId}`,  { method: 'PUT',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/reading',             { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { setShowModal(false); load(); }
    else        { setFormError('Lỗi lưu dữ liệu.'); }
    setSaving(false);
  }
  async function remove(id: string) {
    if (!confirm('Xóa bài đọc này?')) return;
    await fetch(`/api/reading/${id}`, { method: 'DELETE' });
    setPassages(prev => prev.filter(p => p.id !== id));
  }
  async function togglePublish(p: Passage) {
    await fetch(`/api/reading/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !p.published }),
    });
    setPassages(prev => prev.map(x => x.id === p.id ? { ...x, published: !x.published } : x));
  }

  /*──────────── Export ────────────*/
  async function handleExport() {
    setExporting(true);
    const res = await fetch('/api/reading?export=1&admin=1');
    if (!res.ok) { setExporting(false); return; }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `reading-passages-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setExporting(false);
  }

  /*──────────── Import ────────────*/
  function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setImportJson(ev.target?.result as string ?? ''); setParseError(''); setImportResult(null); };
    reader.readAsText(file);
    e.target.value = '';
  }
  function loadSample() { setImportJson(JSON.stringify(SAMPLE_IMPORT, null, 2)); setParseError(''); setImportResult(null); }
  function downloadSample() {
    const blob = new Blob([JSON.stringify(SAMPLE_IMPORT, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'reading-sample.json'; a.click(); URL.revokeObjectURL(url);
  }

  let parsedCount = 0; let jsonValid = false;
  if (importJson.trim()) {
    try { const arr = JSON.parse(importJson); jsonValid = Array.isArray(arr); parsedCount = jsonValid ? arr.length : 0; }
    catch {}
  }

  async function handleImport() {
    if (!jsonValid) { setParseError('JSON không hợp lệ hoặc không phải mảng.'); return; }
    setImportLoading(true); setImportResult(null); setParseError('');
    const res = await fetch('/api/reading/import', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: importJson,
    });
    const data = await res.json();
    setImportResult(data);
    setImportLoading(false);
    if (data.imported > 0) load();
  }

  function closeImport() { setShowImport(false); setImportJson(''); setImportResult(null); setParseError(''); }

  /*──────────── Helpers ────────────*/
  const filtered = passages.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.titleVi?.toLowerCase().includes(search.toLowerCase()))
  );
  const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const LEVEL_COLOR: Record<string, string> = { N5: '#15803D', N4: '#1D4ED8', N3: '#92400E', N2: '#C2410C', N1: '#BE123C' };
  function set(k: keyof typeof BLANK, v: any) { setForm(prev => ({ ...prev, [k]: v })); }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>ADMIN</div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-base)' }}>
            <FaNewspaper size={20} style={{ color: 'var(--primary)' }} /> Quản lý bài đọc
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{passages.length} bài đọc</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowImport(true)}
            className="btn-secondary flex items-center gap-2 text-sm">
            <FaFileImport size={13} /> Import JSON
          </button>
          <button onClick={handleExport} disabled={exporting || passages.length === 0}
            className="btn-secondary flex items-center gap-2 text-sm">
            {exporting
              ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <FaFileExport size={13} />}
            Export JSON
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <FaPlus size={12} /> Thêm mới
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-4">
        <FaMagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }} />
        <input className="input w-full sm:w-72 pl-9" placeholder="Tìm bài đọc..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="card animate-pulse" style={{ height: 200 }} />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-14">
          <div className="text-5xl opacity-20 mb-3">📖</div>
          <p style={{ color: 'var(--text-muted)' }}>Chưa có bài đọc nào.</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-1.5">
              <FaPlus size={11} /> Tạo thủ công
            </button>
            <button onClick={() => setShowImport(true)} className="btn-secondary text-sm flex items-center gap-1.5">
              <FaFileImport size={11} /> Import JSON
            </button>
          </div>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Tiêu đề', 'Cấp', 'Loại', 'Ký tự', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b hover:bg-white/40 transition-colors"
                  style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-semibold truncate"
                      style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif' }}>{p.title}</div>
                    {p.titleVi && <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{p.titleVi}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${LEVEL_COLOR[p.level]}20`, color: LEVEL_COLOR[p.level] }}>{p.level}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {p.type === 'news' ? 'Tin tức' : p.type === 'long' ? 'Bài dài' : 'Đoạn ngắn'}
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{p.charCount}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(p)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full transition-all"
                      style={p.published
                        ? { background: '#DCFCE7', color: '#15803D' }
                        : { background: 'var(--border)', color: 'var(--text-muted)' }}>
                      {p.published ? <FaEye size={10} /> : <FaEyeSlash size={10} />}
                      {p.published ? 'Công khai' : 'Ẩn'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => window.open(`/reading/${p.id}/print`, '_blank')}
                        className="btn-ghost p-1.5" title="In bài đọc"
                        style={{ color: 'var(--text-muted)' }}>
                        <FaPrint size={13} />
                      </button>
                      <button onClick={() => openEdit(p.id)} className="btn-ghost p-1.5" title="Sửa"
                        style={{ color: 'var(--primary)' }}>
                        <FaPencil size={13} />
                      </button>
                      <button onClick={() => remove(p.id)} className="btn-ghost p-1.5" title="Xóa"
                        style={{ color: '#EF4444' }}>
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════
          IMPORT MODAL
      ══════════════════════════ */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-base)' }}>
                <FaFileImport size={16} style={{ color: 'var(--primary)' }} /> Import bài đọc từ JSON
              </h2>
              <button onClick={closeImport} className="btn-ghost p-1.5"><FaXmark size={16} /></button>
            </div>

            {/* Format guide */}
            <div className="rounded-lg p-3 mb-4 text-xs" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <strong>Định dạng:</strong> Mảng JSON — mỗi object cần{' '}
              <code className="font-mono bg-white/60 px-1 rounded">title</code>,{' '}
              <code className="font-mono bg-white/60 px-1 rounded">content</code>,{' '}
              <code className="font-mono bg-white/60 px-1 rounded">level</code> (N5–N1).{' '}
              Tùy chọn: <code className="font-mono bg-white/60 px-1 rounded">titleVi, summary, type, source, sourceUrl, tags[], published</code>
            </div>

            {/* Toolbar */}
            <div className="flex gap-2 mb-3 flex-wrap">
              <button onClick={() => fileRef.current?.click()}
                className="btn-secondary text-xs flex items-center gap-1.5">
                <FaFile size={11} /> Chọn file .json
              </button>
              <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={loadFile} />
              <button onClick={loadSample}
                className="btn-secondary text-xs flex items-center gap-1.5">
                <FaClipboard size={11} /> Dán dữ liệu mẫu
              </button>
              <button onClick={downloadSample}
                className="btn-secondary text-xs flex items-center gap-1.5">
                <FaDownload size={11} /> Tải file mẫu
              </button>
            </div>

            {/* Textarea */}
            <textarea
              className="input w-full font-mono text-xs"
              style={{ height: 220, resize: 'vertical' }}
              placeholder={'[\n  {\n    "title": "日本語タイトル",\n    "content": "本文...",\n    "level": "N5",\n    "type": "short"\n  }\n]'}
              value={importJson}
              onChange={e => { setImportJson(e.target.value); setParseError(''); setImportResult(null); }}
            />

            {/* Validation status */}
            <div className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              {importJson.trim() ? (
                jsonValid
                  ? <span className="flex items-center gap-1" style={{ color: '#15803D' }}>
                      <FaCircleCheck size={11} /> JSON hợp lệ — {parsedCount} bài đọc
                    </span>
                  : <span className="flex items-center gap-1 text-red-500">
                      <FaCircleXmark size={11} /> JSON không hợp lệ
                    </span>
              ) : 'Nhập JSON hoặc chọn file...'}
            </div>

            {parseError && (
              <div className="mt-2 text-xs p-2 rounded" style={{ background: '#FEE2E2', color: '#991B1B' }}>{parseError}</div>
            )}

            {/* Result */}
            {importResult && (
              <div className="mt-3 rounded-lg p-3 text-sm"
                style={{ background: importResult.imported > 0 ? '#DCFCE7' : '#FEE2E2',
                         color:      importResult.imported > 0 ? '#15803D' : '#991B1B' }}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {importResult.imported > 0 ? <FaCircleCheck /> : <FaCircleXmark />}
                  Đã import <strong>{importResult.imported}</strong> bài
                  {importResult.skipped > 0 && <> — bỏ qua <strong>{importResult.skipped}</strong></>}
                </div>
                {importResult.errors.length > 0 && (
                  <ul className="text-xs space-y-0.5 mt-1 font-mono" style={{ color: '#991B1B' }}>
                    {importResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={closeImport} className="btn-secondary">Đóng</button>
              <button onClick={handleImport} disabled={!jsonValid || importLoading}
                className="btn-primary flex items-center gap-2"
                style={{ opacity: !jsonValid ? 0.5 : 1 }}>
                {importLoading
                  ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang import...</>
                  : <><FaUpload size={12} /> Import{parsedCount > 0 ? ` ${parsedCount} bài` : ''}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════
          CREATE / EDIT MODAL
      ══════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>
                {editId ? 'Sửa bài đọc' : 'Thêm bài đọc mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><FaXmark size={16} /></button>
            </div>

            {formError && (
              <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#991B1B' }}>{formError}</div>
            )}

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tiêu đề (Nhật) *</label>
                  <input className="input w-full" style={{ fontFamily: '"Noto Sans JP", serif' }}
                    placeholder="日本語タイトル" value={form.title} onChange={e => set('title', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tiêu đề (Việt)</label>
                  <input className="input w-full" placeholder="Tiêu đề tiếng Việt"
                    value={form.titleVi} onChange={e => set('titleVi', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Nội dung (Nhật) * — <span className="font-normal">{form.content.length} ký tự</span>
                </label>
                <textarea rows={10} className="input w-full text-base"
                  style={{ fontFamily: '"Noto Sans JP", serif', lineHeight: 2, resize: 'vertical' }}
                  placeholder="日本語の本文..."
                  value={form.content} onChange={e => set('content', e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tóm tắt (Việt)</label>
                <textarea rows={2} className="input w-full" placeholder="Mô tả ngắn bằng tiếng Việt..."
                  value={form.summary} onChange={e => set('summary', e.target.value)} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Cấp độ</label>
                  <select className="input w-full" value={form.level} onChange={e => set('level', e.target.value)}>
                    {LEVELS.map(lv => <option key={lv}>{lv}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Loại</label>
                  <select className="input w-full" value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="short">Đoạn ngắn</option>
                    <option value="long">Bài dài</option>
                    <option value="news">Tin tức</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Trạng thái</label>
                  <select className="input w-full" value={form.published ? 'true' : 'false'}
                    onChange={e => set('published', e.target.value === 'true')}>
                    <option value="true">Công khai</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Nguồn</label>
                  <input className="input w-full" placeholder="VD: NHK Web Easy"
                    value={form.source} onChange={e => set('source', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>URL nguồn</label>
                  <input className="input w-full" placeholder="https://..."
                    value={form.sourceUrl} onChange={e => set('sourceUrl', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Tags <span className="font-normal">(cách nhau bởi dấu phẩy)</span>
                </label>
                <input className="input w-full" placeholder="VD: gia đình, thức ăn, giao thông"
                  value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving
                  ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang lưu...</>
                  : <><FaCheck size={12} /> {editId ? 'Cập nhật' : 'Tạo bài'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

