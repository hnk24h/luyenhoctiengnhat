'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  FaDownload,
  FaFileImport,
  FaHeadphones,
  FaPenToSquare,
  FaPlus,
  FaRotateLeft,
  FaTrashCan,
  FaUpload,
  FaVolumeHigh,
  FaHouse,
  FaChevronRight,
  FaXmark,
  FaFloppyDisk,
  FaCircleCheck,
} from 'react-icons/fa6';
import { LISTENING_PRACTICES, type ListeningMondai, type ListeningPractice } from '@/modules/listeningContent';
import { MediaUploadField } from '@/components/MediaUploadField';
import { AdminButton, AdminFormField, AdminSearchInput, AdminSpinner, ConfirmDialog } from '@/components/admin/ui';

type AdminListeningItem = ListeningPractice & {
  lessonId: string;
  categoryId: string;
  categoryName: string;
  levelId: string;
  order: number;
};

type FormState = {
  id?: string;
  levelCode: string;
  mondai: ListeningMondai;
  title: string;
  summary: string;
  situation: string;
  durationSec: string;
  focus: string;
  question: string;
  optionsText: string;
  answer: string;
  explanation: string;
  audioUrl: string;
  transcriptText: string;
};

const EMPTY_FORM: FormState = {
  levelCode: 'N5',
  mondai: 'Mondai 1',
  title: '',
  summary: '',
  situation: '',
  durationSec: '',
  focus: '',
  question: '',
  optionsText: '',
  answer: '',
  explanation: '',
  audioUrl: '',
  transcriptText: '',
};

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
const MONDAI = ['Mondai 1', 'Mondai 2', 'Mondai 3', 'Mondai 4'] as const;

function practiceToForm(item: AdminListeningItem): FormState {
  return {
    id: item.lessonId,
    levelCode: item.level,
    mondai: item.mondai,
    title: item.title,
    summary: item.summary,
    situation: item.situation,
    durationSec: String(item.durationSec),
    focus: item.focus,
    question: item.question,
    optionsText: item.options.join('\n'),
    answer: item.answer,
    explanation: item.explanation,
    audioUrl: item.audioUrl ?? '',
    transcriptText: item.segments.map((segment) => `${segment.speaker}: ${segment.text}`).join('\n'),
  };
}

function sampleImportJson() {
  return JSON.stringify({
    items: LISTENING_PRACTICES.slice(0, 2).map((item) => ({
      levelCode: item.level,
      mondai: item.mondai,
      title: item.title,
      summary: item.summary,
      situation: item.situation,
      durationSec: item.durationSec,
      focus: item.focus,
      question: item.question,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
      audioUrl: item.audioUrl ?? null,
      transcript: item.segments,
    })),
  }, null, 2);
}

export default function AdminListeningClient() {
  const [items, setItems] = useState<AdminListeningItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('ALL');
  const [selectedMondaiFilter, setSelectedMondaiFilter] = useState<'ALL' | ListeningMondai>('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Track uploading state from MediaUploadField
  const [audioUploading, setAudioUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadItems() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/admin/listening', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'Không tải được danh sách bài nghe.');
      setLoading(false);
      return;
    }
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.categoryName))).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      if (selectedCategory !== 'ALL' && item.categoryName !== selectedCategory) return false;
      if (selectedLevelFilter !== 'ALL' && item.level !== selectedLevelFilter) return false;
      if (selectedMondaiFilter !== 'ALL' && item.mondai !== selectedMondaiFilter) return false;

      if (!keyword) return true;

      const haystack = [
        item.title,
        item.summary,
        item.situation,
        item.focus,
        item.question,
        item.answer,
        item.explanation,
        item.categoryName,
        ...item.options,
        ...item.segments.map((segment) => `${segment.speaker} ${segment.text}`),
      ].join(' ').toLowerCase();

      return haystack.includes(keyword);
    });
  }, [items, searchTerm, selectedCategory, selectedLevelFilter, selectedMondaiFilter]);

  const grouped = useMemo(() => {
    return LEVELS.map((level) => ({
      level,
      items: filteredItems.filter((item) => item.level === level),
    }));
  }, [filteredItems]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function openCreateDialog() {
    resetForm();
    setSaved(false);
    setDialogOpen(true);
  }

  function openEditDialog(item: AdminListeningItem) {
    setForm(practiceToForm(item));
    setSaved(false);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    resetForm();
  }

  function resetFilters() {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedLevelFilter('ALL');
    setSelectedMondaiFilter('ALL');
  }

  function buildPayload() {
    const transcript = form.transcriptText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const divider = line.indexOf(':');
        if (divider === -1) return { speaker: 'Speaker', text: line };
        return {
          speaker: line.slice(0, divider).trim() || 'Speaker',
          text: line.slice(divider + 1).trim(),
        };
      })
      .filter((segment) => segment.text);

    return {
      levelCode: form.levelCode,
      mondai: form.mondai,
      title: form.title,
      summary: form.summary,
      situation: form.situation,
      durationSec: form.durationSec ? Number(form.durationSec) : undefined,
      focus: form.focus,
      question: form.question,
      options: form.optionsText.split('\n').map((line) => line.trim()).filter(Boolean),
      answer: form.answer,
      explanation: form.explanation,
      audioUrl: form.audioUrl || null,
      transcript,
    };
  }

  async function saveItem() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = buildPayload();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/admin/listening/${form.id}` : '/api/admin/listening';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? 'Lưu bài nghe thất bại.');
      setSaving(false);
      return;
    }

    const wasEdit = Boolean(form.id);
    setSaved(true);
    await loadItems();
    setSaving(false);
    if (!wasEdit) { /* stay open for new items */ }
  }

  async function deleteItem(id: string) {
    setDeleting(true);
    const res = await fetch(`/api/admin/listening/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'Không xóa được bài nghe.');
      setDeleting(false);
      setDeleteTarget(null);
      return;
    }

    if (form.id === id) closeDialog();
    setMessage('Đã xóa bài nghe.');
    setDeleteTarget(null);
    setDeleting(false);
    await loadItems();
  }

  function confirmDelete(item: AdminListeningItem) {
    setDeleteTarget({ id: item.lessonId, title: item.title });
  }

  async function importItems() {
    setImporting(true);
    setError(null);
    setMessage(null);

    try {
      const parsed = JSON.parse(importJson || '{}');
      const res = await fetch('/api/admin/listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Import thất bại.');
        setImporting(false);
        return;
      }
      setMessage(`Đã import ${data.imported ?? 1} bài nghe.`);
      setImportJson('');
      await loadItems();
    } catch {
      setError('JSON import không hợp lệ.');
    }

    setImporting(false);
  }

  return (
    <>
      <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }}>
          <FaHouse size={10} />
          <FaChevronRight size={8} />
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Bài nghe</span>
        </nav>

        {/* Card 1: filters */}
        <div className="admin-card p-0 overflow-hidden">
          <div className="flex items-center gap-1 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
            {(['ALL', ...LEVELS] as const).map(lv => (
              <button
                key={lv}
                onClick={() => setSelectedLevelFilter(lv)}
                className="px-3 py-1 rounded text-sm font-medium transition-colors"
                style={selectedLevelFilter === lv
                  ? { background: 'var(--primary)', color: '#fff' }
                  : { color: 'var(--text-secondary)', background: 'transparent' }}
              >
                {lv === 'ALL' ? 'Tất cả' : lv}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={openCreateDialog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              <FaPlus size={11} /> Bài nghe mới
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 flex-wrap">
            <select className="input" style={{ width: 'auto', minWidth: 130 }} value={selectedMondaiFilter}
              onChange={e => setSelectedMondaiFilter(e.target.value as 'ALL' | ListeningMondai)}>
              <option value="ALL">Tất cả mondai</option>
              {MONDAI.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="input" style={{ width: 'auto', minWidth: 150 }} value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}>
              <option value="ALL">Tất cả category</option>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex-1" />
            <AdminSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Tìm bài nghe..." />
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
              onClick={resetFilters}
            >
              <FaRotateLeft size={12} /> Reset
            </button>
          </div>
        </div>

        {/* Card 2: grouped list */}
        <div className="admin-card overflow-hidden p-4">
          {(message || error) && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-medium"
              style={error
                ? { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid #f8c4bb' }
                : { background: '#ecfdf5', color: '#166534', border: '1px solid #a7f3d0' }}>
              {error ?? message}
            </div>
          )}
          {loading ? (
            <AdminSpinner label="Đang tải dữ liệu..." />
          ) : (
            <div className="space-y-5">
              {grouped.map((group) => (
                <div key={group.level}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--primary)' }}>{group.level}</div>
                  {group.items.length === 0 ? (
                    <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                      Chưa có bài nghe cho {group.level}.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <div key={item.lessonId} className="rounded-xl border px-4 py-3"
                          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex-1 min-w-[240px]">
                              <div className="flex flex-wrap gap-1.5 mb-1.5">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>{item.categoryName}</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{item.mondai}</span>
                                {item.audioUrl && (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(29,78,216,0.12)', color: '#1d4ed8' }}>
                                    <FaVolumeHigh size={9} className="inline mr-1" /> audio
                                  </span>
                                )}
                              </div>
                              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.question}</div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <AdminButton variant="secondary" size="sm" icon={<FaPenToSquare size={12} />}
                                onClick={() => openEditDialog(item)}>
                                Sửa
                              </AdminButton>
                              <AdminButton variant="danger" size="sm" icon={<FaTrashCan size={12} />}
                                onClick={() => confirmDelete(item)}>
                                Xóa
                              </AdminButton>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Import JSON card */}
        <div className="admin-card p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Import JSON</div>
            <div className="flex gap-2">
              <AdminButton variant="secondary" size="sm" icon={<FaDownload size={12} />}
                onClick={() => setImportJson(sampleImportJson())}>
                Nạp mẫu
              </AdminButton>
              <AdminButton variant="primary" size="sm" icon={<FaFileImport size={12} />}
                onClick={importItems} disabled={importing || !importJson.trim()} loading={importing}>
                {importing ? 'Đang import...' : 'Import'}
              </AdminButton>
            </div>
          </div>
          <textarea
            className="input w-full font-mono text-xs"
            rows={8}
            value={importJson}
            onChange={(event) => setImportJson(event.target.value)}
            placeholder={'{\n  "items": [\n    {\n      "levelCode": "N5",\n      "mondai": "Mondai 1",\n      "title": "...",\n      "audioUrl": "https://...mp3",\n      "transcript": [{ "speaker": "A", "text": "..." }]\n    }\n  ]\n}'}
            style={{ resize: 'vertical', fontFamily: 'monospace' }}
          />
        </div>
      </div>

      {/* ── Create/Edit Drawer ── */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={closeDialog}
        >
          <div
            className="h-full w-full max-w-xl flex flex-col shadow-2xl"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)', color: '#fff' }}>
                {form.id ? <FaPenToSquare size={13} /> : <FaPlus size={13} />}
              </span>
              <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                {form.id ? 'Cập nhật bài nghe' : 'Tạo bài nghe mới'}
              </span>
              <div className="flex-1" />
              <button
                className="p-2 rounded transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={closeDialog}
              >
                <FaXmark size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {error && (
                <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#991B1B' }}>{error}</div>
              )}

              <div className="rounded-xl p-4" style={{ background: 'var(--bg-muted)' }}>
                <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Cài đặt</div>
                <div className="grid grid-cols-2 gap-3">
                  <AdminFormField label="Level">
                    <select className="input" value={form.levelCode} onChange={e => updateField('levelCode', e.target.value)}>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </AdminFormField>
                  <AdminFormField label="Mondai">
                    <select className="input" value={form.mondai} onChange={e => updateField('mondai', e.target.value as ListeningMondai)}>
                      {MONDAI.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </AdminFormField>
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Nội dung</div>
                <div className="flex flex-col gap-3">
                  <AdminFormField label="Tiêu đề">
                    <input className="input" value={form.title} onChange={e => updateField('title', e.target.value)} />
                  </AdminFormField>
                  <div className="grid grid-cols-2 gap-3">
                    <AdminFormField label="Tóm tắt">
                      <input className="input" value={form.summary} onChange={e => updateField('summary', e.target.value)} />
                    </AdminFormField>
                    <AdminFormField label="Tình huống">
                      <input className="input" value={form.situation} onChange={e => updateField('situation', e.target.value)} />
                    </AdminFormField>
                  </div>
                  <AdminFormField label="Thời lượng (giây)">
                    <input className="input" type="number" min="10" value={form.durationSec} onChange={e => updateField('durationSec', e.target.value)} />
                  </AdminFormField>
                </div>
              </div>

              <MediaUploadField
                type="audio"
                value={form.audioUrl}
                onChange={url => updateField('audioUrl', url)}
                label="🎧 Audio"
                onUploading={setAudioUploading}
              />

              <div className="rounded-xl p-4" style={{ background: 'var(--bg-muted)' }}>
                <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Câu hỏi</div>
                <div className="flex flex-col gap-3">
                  <AdminFormField label="Trọng tâm">
                    <input className="input" value={form.focus} onChange={e => updateField('focus', e.target.value)} />
                  </AdminFormField>
                  <AdminFormField label="Câu hỏi">
                    <textarea className="input min-h-[80px]" value={form.question} onChange={e => updateField('question', e.target.value)} />
                  </AdminFormField>
                  <div className="grid grid-cols-2 gap-3">
                    <AdminFormField label="Options, mỗi dòng một đáp án">
                      <textarea className="input min-h-[110px]" value={form.optionsText} onChange={e => updateField('optionsText', e.target.value)} />
                    </AdminFormField>
                    <div className="flex flex-col gap-3">
                      <AdminFormField label="Đáp án đúng">
                        <input className="input" value={form.answer} onChange={e => updateField('answer', e.target.value)} />
                      </AdminFormField>
                      <AdminFormField label="Giải thích">
                        <textarea className="input min-h-[80px]" value={form.explanation} onChange={e => updateField('explanation', e.target.value)} />
                      </AdminFormField>
                    </div>
                  </div>
                </div>
              </div>

              <AdminFormField label="Transcript, mỗi dòng theo dạng Speaker: nội dung">
                <textarea className="input min-h-[180px] font-jp" value={form.transcriptText} onChange={e => updateField('transcriptText', e.target.value)} />
              </AdminFormField>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm" style={{ color: '#16a34a' }}>
                  <FaCircleCheck size={14} /> Đã lưu
                </span>
              )}
              <div className="flex-1" />
              <button
                className="px-4 py-2 rounded text-sm"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-muted)' }}
                onClick={closeDialog}
              >
                Hủy
              </button>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                style={{ background: 'var(--primary)', color: '#fff' }}
                disabled={saving || audioUploading}
                onClick={saveItem}
              >
                <FaFloppyDisk size={13} />
                {saving ? 'Đang lưu...' : form.id ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa bài nghe?"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.title ?? ''}"?`}
        confirmLabel="Xóa"
        danger
        loading={deleting}
        onConfirm={() => deleteTarget && deleteItem(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

