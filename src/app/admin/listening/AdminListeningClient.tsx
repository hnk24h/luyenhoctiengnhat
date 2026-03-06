'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FaDownload,
  FaFileImport,
  FaHeadphones,
  FaMagnifyingGlass,
  FaPenToSquare,
  FaPlus,
  FaRotateLeft,
  FaTrashCan,
  FaUpload,
  FaVolumeHigh,
  FaXmark,
} from 'react-icons/fa6';
import { LISTENING_PRACTICES, type ListeningMondai, type ListeningPractice } from '@/modules/listeningContent';

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
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setDialogOpen(true);
  }

  function openEditDialog(item: AdminListeningItem) {
    setForm(practiceToForm(item));
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
    closeDialog();
    setMessage(wasEdit ? 'Đã cập nhật bài nghe.' : 'Đã tạo bài nghe mới.');
    await loadItems();
    setSaving(false);
  }

  async function deleteItem(id: string) {
    if (!confirm('Xóa bài nghe này?')) return;

    const res = await fetch(`/api/admin/listening/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'Không xóa được bài nghe.');
      return;
    }

    if (form.id === id) closeDialog();
    setMessage('Đã xóa bài nghe.');
    await loadItems();
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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            <Link href="/admin" className="hover:underline">Admin</Link> / Luyện nghe
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Quản lý bài nghe JLPT</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Thêm bài nghe theo level và mondai, gắn `audioUrl` nếu có. Nếu để trống thì page public sẽ fallback sang Web Speech.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/listening" className="btn-secondary">
            <FaHeadphones size={12} /> Xem page nghe
          </Link>
          <a href="/samples/jlpt-listening-sample.json" download className="btn-secondary">
            <FaDownload size={12} /> JSON mẫu
          </a>
          <button onClick={openCreateDialog} className="btn-primary">
            <FaPlus size={12} /> Bài nghe mới
          </button>
        </div>
      </div>

      {(message || error) && (
        <div className="rounded-2xl px-4 py-3 mb-6 text-sm font-medium"
          style={error
            ? { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid #f8c4bb' }
            : { background: '#ecfdf5', color: '#166534', border: '1px solid #a7f3d0' }}>
          {error ?? message}
        </div>
      )}

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Danh sách bài nghe</h2>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{filteredItems.length}/{items.length} bài</div>
          </div>

          <div className="grid lg:grid-cols-[1.6fr,1fr,1fr,1fr,auto] gap-3 mb-5">
            <div className="relative">
              <input
                className="input pl-9"
                placeholder="Search tiêu đề, câu hỏi, transcript..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <select className="input" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="ALL">Tất cả category</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select className="input" value={selectedLevelFilter} onChange={(event) => setSelectedLevelFilter(event.target.value)}>
              <option value="ALL">Tất cả cấp độ</option>
              {LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
            <select className="input" value={selectedMondaiFilter} onChange={(event) => setSelectedMondaiFilter(event.target.value as 'ALL' | ListeningMondai)}>
              <option value="ALL">Tất cả mondai</option>
              {MONDAI.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button onClick={resetFilters} className="btn-secondary whitespace-nowrap">
              <FaRotateLeft size={12} /> Reset
            </button>
          </div>

          {loading ? (
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu...</div>
          ) : (
            <div className="space-y-5">
              {grouped.map((group) => (
                <div key={group.level}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--primary)' }}>{group.level}</div>
                  {group.items.length === 0 ? (
                    <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
                      Chưa có bài nghe cho {group.level}.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.lessonId} className="rounded-2xl border px-5 py-5"
                          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-[280px]">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>{item.categoryName}</span>
                                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{item.mondai}</span>
                                {item.audioUrl && (
                                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                                    <FaVolumeHigh size={10} className="inline mr-1" /> audioUrl
                                  </span>
                                )}
                              </div>
                              <div className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{item.summary}</div>
                              <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{item.question}</div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => openEditDialog(item)} className="btn-secondary text-xs py-2 px-3">
                                <FaPenToSquare size={12} /> Sửa
                              </button>
                              <button onClick={() => deleteItem(item.lessonId)} className="btn-secondary text-xs py-2 px-3">
                                <FaTrashCan size={12} /> Xóa
                              </button>
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

        <div className="card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Import JSON</h2>
            <div className="flex gap-2">
              <button onClick={() => setImportJson(sampleImportJson())} className="btn-secondary text-xs py-2 px-3">
                <FaDownload size={12} /> Nạp mẫu
              </button>
              <button onClick={importItems} disabled={importing || !importJson.trim()} className="btn-primary text-xs py-2 px-3">
                <FaFileImport size={12} /> {importing ? 'Đang import...' : 'Import'}
              </button>
            </div>
          </div>
          <textarea
            className="input w-full font-mono text-xs"
            rows={14}
            value={importJson}
            onChange={(event) => setImportJson(event.target.value)}
            placeholder={'{\n  "items": [\n    {\n      "levelCode": "N5",\n      "mondai": "Mondai 1",\n      "title": "...",\n      "audioUrl": "https://...mp3",\n      "transcript": [{ "speaker": "A", "text": "..." }]\n    }\n  ]\n}'}
            style={{ resize: 'vertical', fontFamily: 'monospace' }}
          />
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 sm:py-10">
          <div className="absolute inset-0 bg-black/40" onClick={closeDialog} />
          <div className="relative w-full max-w-4xl max-h-[calc(100vh-3rem)] overflow-hidden rounded-[28px] border flex flex-col"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 sm:px-7 border-b"
              style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg-surface) 94%, transparent)' }}>
              <div>
                <h2 className="font-semibold text-xl" style={{ color: 'var(--text-primary)' }}>
                  {form.id ? 'Cập nhật bài nghe' : 'Tạo bài nghe mới'}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Nhập nội dung bài nghe, transcript và audio URL nếu có.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={saveItem} disabled={saving} className="btn-primary">
                  <FaUpload size={12} /> {saving ? 'Đang lưu...' : form.id ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button onClick={closeDialog} className="btn-secondary">
                  Hủy
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Level</label>
                  <select className="input" value={form.levelCode} onChange={(event) => updateField('levelCode', event.target.value)}>
                    {LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Mondai</label>
                  <select className="input" value={form.mondai} onChange={(event) => updateField('mondai', event.target.value as ListeningMondai)}>
                    {MONDAI.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Tiêu đề</label>
                <input className="input" value={form.title} onChange={(event) => updateField('title', event.target.value)} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Tóm tắt</label>
                  <input className="input" value={form.summary} onChange={(event) => updateField('summary', event.target.value)} />
                </div>
                <div>
                  <label className="label">Tình huống</label>
                  <input className="input" value={form.situation} onChange={(event) => updateField('situation', event.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Thời lượng (giây)</label>
                  <input className="input" type="number" min="10" value={form.durationSec} onChange={(event) => updateField('durationSec', event.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Audio URL</label>
                  <input className="input" value={form.audioUrl} onChange={(event) => updateField('audioUrl', event.target.value)} placeholder="https://...mp3" />
                </div>
              </div>

              <div>
                <label className="label">Trọng tâm</label>
                <input className="input" value={form.focus} onChange={(event) => updateField('focus', event.target.value)} />
              </div>

              <div>
                <label className="label">Câu hỏi</label>
                <textarea className="input min-h-[90px]" value={form.question} onChange={(event) => updateField('question', event.target.value)} />
              </div>

              <div className="grid lg:grid-cols-2 gap-3">
                <div>
                  <label className="label">Options, mỗi dòng một đáp án</label>
                  <textarea className="input min-h-[140px]" value={form.optionsText} onChange={(event) => updateField('optionsText', event.target.value)} />
                </div>
                <div>
                  <label className="label">Đáp án đúng</label>
                  <input className="input mb-3" value={form.answer} onChange={(event) => updateField('answer', event.target.value)} />
                  <label className="label">Giải thích</label>
                  <textarea className="input min-h-[100px]" value={form.explanation} onChange={(event) => updateField('explanation', event.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Transcript, mỗi dòng theo dạng `Speaker: nội dung`</label>
                <textarea className="input min-h-[220px] font-jp" value={form.transcriptText} onChange={(event) => updateField('transcriptText', event.target.value)} />
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}