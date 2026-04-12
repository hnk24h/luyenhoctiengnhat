'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminPageHeader from '../_components/AdminPageHeader';
import {
  FaPlus, FaTrash, FaPencil, FaNewspaper, FaCheck,
  FaEye, FaEyeSlash, FaFileImport, FaFileExport,
  FaPrint, FaCircleCheck, FaCircleXmark, FaDownload, FaUpload,
  FaClipboard, FaFile,
} from 'react-icons/fa6';
import {
  AdminButton, AdminTable, AdminToolbar, AdminModal,
  AdminFormField, AdminBadge, AdminPageLoader, ConfirmDialog,
} from '@/components/admin/ui';
import type { ColumnDef } from '@/components/admin/ui/AdminTable';

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
  const [levelFilter,   setLevelFilter]   = useState('');
  const [formError,     setFormError]     = useState('');
  const [exporting,     setExporting]     = useState(false);
  const [showImport,    setShowImport]    = useState(false);
  const [importJson,    setImportJson]    = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult,  setImportResult]  = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [parseError,    setParseError]    = useState('');
  const [deleteTarget,  setDeleteTarget]  = useState<Passage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated') {
      const role = session?.user?.role;
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
  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/reading/${deleteTarget.id}`, { method: 'DELETE' });
    setPassages(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
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
    (!levelFilter || p.level === levelFilter) &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.titleVi?.toLowerCase().includes(search.toLowerCase())))
  );
  const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const LEVEL_COLOR: Record<string, string> = { N5: '#15803D', N4: '#1D4ED8', N3: '#92400E', N2: '#C2410C', N1: '#BE123C' };
  function set(k: keyof typeof BLANK, v: any) { setForm(prev => ({ ...prev, [k]: v })); }

  /* ── Table columns ── */
  const TYPES: Record<string, string> = { news: 'Tin tức', long: 'Bài dài', short: 'Đoạn ngắn' };
  const columns: ColumnDef<Passage>[] = [
    {
      key: 'title', header: 'Tiêu đề', width: '2fr',
      render: p => (
        <div>
          <div className="font-semibold truncate text-sm" style={{ color: 'var(--text-primary)', fontFamily: '"Noto Sans JP", serif' }}>{p.title}</div>
          {p.titleVi && <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{p.titleVi}</div>}
        </div>
      ),
    },
    {
      key: 'level', header: 'Cấp', width: '56px',
      render: p => <AdminBadge variant="danger">{p.level}</AdminBadge>,
    },
    {
      key: 'type', header: 'Loại', width: '80px',
      render: p => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{TYPES[p.type] ?? p.type}</span>,
    },
    {
      key: 'chars', header: 'Ký tự', width: '60px',
      headerClassName: 'text-center', cellClassName: 'text-center',
      render: p => <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{p.charCount}</span>,
    },
    {
      key: 'status', header: 'Trạng thái', width: '90px',
      render: p => (
        <button onClick={e => { e.stopPropagation(); togglePublish(p); }}
          className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full transition-all"
          style={p.published
            ? { background: 'rgba(22,163,74,0.12)', color: '#15803d' }
            : { background: 'var(--border)', color: 'var(--text-muted)' }}>
          {p.published ? <FaEye size={10} /> : <FaEyeSlash size={10} />}
          {p.published ? 'Công khai' : 'Ẩn'}
        </button>
      ),
    },
    {
      key: 'actions', header: '', width: '90px',
      cellClassName: 'text-right',
      render: p => (
        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <AdminButton variant="ghost" size="sm" onClick={e => { e.stopPropagation(); window.open(`/reading/${p.id}/print`, '_blank'); }} title="In bài đọc">
            <FaPrint size={12} />
          </AdminButton>
          <AdminButton variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openEdit(p.id); }} title="Sửa">
            <FaPencil size={12} />
          </AdminButton>
          <AdminButton variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setDeleteTarget(p); }} title="Xóa">
            <FaTrash size={12} style={{ color: '#EF4444' }} />
          </AdminButton>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <AdminPageHeader
        icon={<FaNewspaper size={18} />}
        title="Bài đọc"
        breadcrumb="Quản lý bài đọc"
        badge={`${passages.length} bài đọc`}
        actions={<>
          <AdminButton variant="secondary" size="sm" icon={<FaFileImport size={12} />} onClick={() => setShowImport(true)}>Import</AdminButton>
          <AdminButton variant="secondary" size="sm" icon={<FaFileExport size={12} />} onClick={handleExport} loading={exporting} disabled={passages.length === 0}>Export</AdminButton>
          <AdminButton icon={<FaPlus size={11} />} onClick={openCreate}>Thêm mới</AdminButton>
        </>}
      />

      <div className="pb-10">
        {loading ? <AdminPageLoader label="Đang tải bài đọc..." /> : (
          <>
            <AdminToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Tìm bài đọc..."
              filters={
                <select className="input text-sm py-1.5" style={{ width: 'auto' }} value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
                  <option value="">Tất cả cấp</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              }
              actions={
                <AdminButton icon={<FaPlus size={11} />} onClick={openCreate}>Thêm mới</AdminButton>
              }
            />

            <AdminTable
              columns={columns}
              data={filtered}
              rowKey={p => p.id}
              onRowClick={p => openEdit(p.id)}
              emptyIcon={<FaNewspaper />}
              emptyTitle="Chưa có bài đọc nào"
              emptyDescription="Tạo bài đọc đầu tiên hoặc import từ JSON."
              emptyAction={
                <div className="flex gap-2">
                  <AdminButton icon={<FaPlus size={11} />} onClick={openCreate}>Tạo thủ công</AdminButton>
                  <AdminButton variant="secondary" icon={<FaFileImport size={11} />} onClick={() => setShowImport(true)}>Import JSON</AdminButton>
                </div>
              }
            />
          </>
        )}
      </div>

      {/* ── Import Modal ── */}
      <AdminModal
        open={showImport}
        onClose={closeImport}
        title="Import bài đọc từ JSON"
        icon={<FaFileImport size={14} />}
        size="lg"
        footer={
          <>
            <AdminButton variant="secondary" onClick={closeImport}>Đóng</AdminButton>
            <AdminButton onClick={handleImport} disabled={!jsonValid} loading={importLoading}
              icon={<FaUpload size={12} />}>
              Import{parsedCount > 0 ? ` ${parsedCount} bài` : ''}
            </AdminButton>
          </>
        }
      >
        {/* Format guide */}
        <div className="rounded-lg p-3 mb-4 text-xs" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
          <strong>Định dạng:</strong> Mảng JSON — mỗi object cần{' '}
          <code className="font-mono bg-white/60 px-1 rounded">title</code>,{' '}
          <code className="font-mono bg-white/60 px-1 rounded">content</code>,{' '}
          <code className="font-mono bg-white/60 px-1 rounded">level</code> (N5–N1).{' '}
          Tùy chọn: <code className="font-mono bg-white/60 px-1 rounded">titleVi, summary, type, source, sourceUrl, tags[], published</code>
        </div>

        <div className="flex gap-2 mb-3 flex-wrap">
          <AdminButton variant="secondary" size="sm" icon={<FaFile size={10} />} onClick={() => fileRef.current?.click()}>Chọn file .json</AdminButton>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={loadFile} />
          <AdminButton variant="secondary" size="sm" icon={<FaClipboard size={10} />} onClick={loadSample}>Dán dữ liệu mẫu</AdminButton>
          <AdminButton variant="secondary" size="sm" icon={<FaDownload size={10} />} onClick={downloadSample}>Tải file mẫu</AdminButton>
        </div>

        <textarea
          className="input w-full font-mono text-xs"
          style={{ height: 220, resize: 'vertical' }}
          placeholder={'[\n  {\n    "title": "日本語タイトル",\n    "content": "本文...",\n    "level": "N5",\n    "type": "short"\n  }\n]'}
          value={importJson}
          onChange={e => { setImportJson(e.target.value); setParseError(''); setImportResult(null); }}
        />

        <div className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          {importJson.trim() ? (
            jsonValid
              ? <span className="flex items-center gap-1" style={{ color: '#15803D' }}><FaCircleCheck size={11} /> JSON hợp lệ — {parsedCount} bài đọc</span>
              : <span className="flex items-center gap-1 text-red-500"><FaCircleXmark size={11} /> JSON không hợp lệ</span>
          ) : 'Nhập JSON hoặc chọn file...'}
        </div>

        {parseError && <div className="mt-2 text-xs p-2 rounded" style={{ background: '#FEE2E2', color: '#991B1B' }}>{parseError}</div>}

        {importResult && (
          <div className="mt-3 rounded-lg p-3 text-sm"
            style={{ background: importResult.imported > 0 ? '#DCFCE7' : '#FEE2E2', color: importResult.imported > 0 ? '#15803D' : '#991B1B' }}>
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
      </AdminModal>

      {/* ── Create / Edit Modal ── */}
      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Sửa bài đọc' : 'Thêm bài đọc mới'}
        icon={<FaNewspaper size={14} />}
        size="lg"
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setShowModal(false)}>Hủy</AdminButton>
            <AdminButton loading={saving} onClick={save} icon={<FaCheck size={12} />}>
              {editId ? 'Cập nhật' : 'Tạo bài'}
            </AdminButton>
          </>
        }
      >
        {formError && <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#991B1B' }}>{formError}</div>}

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminFormField label="Tiêu đề (Nhật)" required>
              <input className="input w-full" style={{ fontFamily: '"Noto Sans JP", serif' }}
                placeholder="日本語タイトル" value={form.title} onChange={e => set('title', e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Tiêu đề (Việt)">
              <input className="input w-full" placeholder="Tiêu đề tiếng Việt"
                value={form.titleVi} onChange={e => set('titleVi', e.target.value)} />
            </AdminFormField>
          </div>

          <AdminFormField label={`Nội dung (Nhật) — ${form.content.length} ký tự`} required>
            <textarea rows={10} className="input w-full text-base"
              style={{ fontFamily: '"Noto Sans JP", serif', lineHeight: 2, resize: 'vertical' }}
              placeholder="日本語の本文..."
              value={form.content} onChange={e => set('content', e.target.value)} />
          </AdminFormField>

          <AdminFormField label="Tóm tắt (Việt)">
            <textarea rows={2} className="input w-full" placeholder="Mô tả ngắn bằng tiếng Việt..."
              value={form.summary} onChange={e => set('summary', e.target.value)} />
          </AdminFormField>

          <div className="grid sm:grid-cols-3 gap-4">
            <AdminFormField label="Cấp độ">
              <select className="input w-full" value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVELS.map(lv => <option key={lv}>{lv}</option>)}
              </select>
            </AdminFormField>
            <AdminFormField label="Loại">
              <select className="input w-full" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="short">Đoạn ngắn</option>
                <option value="long">Bài dài</option>
                <option value="news">Tin tức</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Trạng thái">
              <select className="input w-full" value={form.published ? 'true' : 'false'}
                onChange={e => set('published', e.target.value === 'true')}>
                <option value="true">Công khai</option>
                <option value="false">Ẩn</option>
              </select>
            </AdminFormField>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <AdminFormField label="Nguồn">
              <input className="input w-full" placeholder="VD: NHK Web Easy"
                value={form.source} onChange={e => set('source', e.target.value)} />
            </AdminFormField>
            <AdminFormField label="URL nguồn">
              <input className="input w-full" placeholder="https://..."
                value={form.sourceUrl} onChange={e => set('sourceUrl', e.target.value)} />
            </AdminFormField>
          </div>

          <AdminFormField label="Tags (cách nhau bởi dấu phẩy)">
            <input className="input w-full" placeholder="VD: gia đình, thức ăn, giao thông"
              value={form.tags} onChange={e => set('tags', e.target.value)} />
          </AdminFormField>
        </div>
      </AdminModal>

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Xóa bài đọc "${deleteTarget?.title}"?`}
        description="Bài đọc sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

