'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaPlus, FaTrash, FaPencil, FaBookOpen, FaXmark, FaCheck,
  FaChevronRight, FaChevronDown, FaArrowLeft, FaLayerGroup,
  FaListUl, FaMagnifyingGlass, FaCirclePlus,
  FaFileArrowUp, FaDownload, FaCircleCheck, FaTriangleExclamation,
} from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Level { id: string; code: string; name: string; }

interface Category {
  id: string; levelId: string; skill: string; name: string;
  description: string | null; icon: string | null; order: number;
  level: { code: string; name: string };
  _count: { lessons: number };
}

interface Lesson {
  id: string; categoryId: string; title: string; description: string | null;
  content: string | null; type: string; order: number;
  _count: { items: number };
  category: { name: string; skill: string; level: { code: string } };
}

interface ContentMeaning { id: string; language: string; meaning: string }
interface ContentExample { id: string; exampleText: string; translation: string | null; language: string; translationLanguage: string | null }
interface LearningItem {
  id: string; lessonId: string; type: string; language: string; term: string;
  pronunciation: string | null; meanings: ContentMeaning[]; examples: ContentExample[];
  audioUrl: string | null; imageUrl: string | null; order: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const SKILLS = [
  { value: 'doc',   label: 'Đọc' },
  { value: 'nghe',  label: 'Nghe' },
  { value: 'ngu_phap', label: 'Ngữ pháp' },
  { value: 'tu_vung',  label: 'Từ vựng' },
];
const LESSON_TYPES = ['text', 'vocab', 'grammar', 'audio'];
const ITEM_TYPES   = ['vocab', 'character', 'grammar', 'example', 'phrase', 'tone', 'idiom'];

const CAT_BLANK = { levelCode: 'N5', skill: 'tu_vung', name: '', description: '', icon: '', order: 0 };
const LES_BLANK = { title: '', description: '', type: 'vocab', order: 0 };
const ITEM_BLANK = {
  type: 'vocab', term: '', pronunciation: '', language: 'ja', meaning: '',
  example: '', exampleMeaning: '', order: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SkillBadge({ skill }: { skill: string }) {
  const colors: Record<string, string> = {
    doc:      '#0EA5E9', nghe: '#10B981', ngu_phap: '#F59E0B', tu_vung: '#8B5CF6',
  };
  const labels: Record<string, string> = {
    doc: 'Đọc', nghe: 'Nghe', ngu_phap: 'Ngữ pháp', tu_vung: 'Từ vựng',
  };
  const c = colors[skill] ?? '#6B7280';
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${c}22`, color: c }}>
      {labels[skill] ?? skill}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminLearningPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ── Data ──
  const [levels,     setLevels]     = useState<Level[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons,    setLessons]    = useState<Lesson[]>([]);
  const [items,      setItems]      = useState<LearningItem[]>([]);

  // ── Selection ──
  const [activeLevel, setActiveLevel] = useState('N5');
  const [activeSkill, setActiveSkill] = useState('');   // '' = all
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [activeLesId, setActiveLesId] = useState<string | null>(null);

  // ── Search ──
  const [catSearch, setCatSearch] = useState('');
  const [lesSearch, setLesSearch] = useState('');

  // ── Modals ──
  type Modal = 'cat-create' | 'cat-edit' | 'les-create' | 'les-edit' | 'item-create' | 'item-edit' | null;
  const [modal,    setModal]    = useState<Modal>(null);

  // ── Import ──
  const [importOpen,   setImportOpen]   = useState(false);
  const [importFmt,    setImportFmt]    = useState<'json' | 'csv'>('csv');
  const [importText,   setImportText]   = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [importing,    setImporting]    = useState(false);
  const [importErr,    setImportErr]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [modalErr, setModalErr] = useState('');

  // ── Forms ──
  const [catForm,  setCatForm]  = useState({ ...CAT_BLANK });
  const [lesForm,  setLesForm]  = useState({ ...LES_BLANK });
  const [itemForm, setItemForm] = useState({ ...ITEM_BLANK });
  const [editId,   setEditId]   = useState<string | null>(null);

  // ── Auth guard ──
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'admin' && role !== 'ADMIN') router.push('/');
    }
  }, [status, session, router]);

  // ── Load levels ──
  useEffect(() => {
    fetch('/api/admin/levels?subject=JLPT').then(r => r.json()).then(setLevels).catch(() => {
      // fallback: use static list
      setLevels(LEVELS.map((c, i) => ({ id: c, code: c, name: c })));
    });
  }, []);

  // ── Load categories when level/skill changes ──
  const loadCategories = useCallback(async () => {
    // Find levelId from levels
    const level = levels.find(l => l.code === activeLevel);
    const params = new URLSearchParams();
    if (level) params.set('levelId', level.id);
    if (activeSkill) params.set('skill', activeSkill);
    params.set('subject', 'JLPT');
    const res = await fetch(`/api/learning/categories?${params}`);
    if (res.ok) setCategories(await res.json());
    setActiveCatId(null);
    setActiveLesId(null);
    setLessons([]);
    setItems([]);
  }, [activeLevel, activeSkill, levels]);

  useEffect(() => {
    if (levels.length) loadCategories();
  }, [loadCategories, levels]);

  // ── Load lessons when category changes ──
  const loadLessons = useCallback(async (catId: string) => {
    const res = await fetch(`/api/learning/lessons?categoryId=${catId}`);
    if (res.ok) setLessons(await res.json());
    setActiveLesId(null);
    setItems([]);
  }, []);

  // ── Load items when lesson changes ──
  const loadItems = useCallback(async (lesId: string) => {
    const res = await fetch(`/api/learning/lessons/${lesId}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
    }
  }, []);

  // ── Category CRUD ──────────────────────────────────────────────────────────

  function openCatCreate() {
    const level = levels.find(l => l.code === activeLevel);
    setCatForm({ ...CAT_BLANK, levelCode: activeLevel, skill: activeSkill || 'tu_vung' });
    setEditId(null); setModalErr(''); setModal('cat-create');
  }

  function openCatEdit(cat: Category) {
    setCatForm({ levelCode: cat.level.code, skill: cat.skill, name: cat.name, description: cat.description ?? '', icon: cat.icon ?? '', order: cat.order });
    setEditId(cat.id); setModalErr(''); setModal('cat-edit');
  }

  async function saveCat() {
    if (!catForm.name.trim()) { setModalErr('Tên chủ đề là bắt buộc'); return; }
    setSaving(true); setModalErr('');
    const level = levels.find(l => l.code === catForm.levelCode);
    if (!level) { setModalErr('Không tìm thấy level'); setSaving(false); return; }
    try {
      let res: Response;
      if (modal === 'cat-create') {
        res = await fetch('/api/learning/categories', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...catForm, levelId: level.id }),
        });
      } else {
        res = await fetch(`/api/learning/categories/${editId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catForm),
        });
      }
      if (!res.ok) { const e = await res.json(); setModalErr(e.error ?? 'Lỗi'); setSaving(false); return; }
      setModal(null);
      loadCategories();
    } finally { setSaving(false); }
  }

  async function deleteCat(id: string) {
    if (!confirm('Xóa chủ đề này? Tất cả bài học bên trong cũng sẽ bị xóa.')) return;
    await fetch(`/api/learning/categories/${id}`, { method: 'DELETE' });
    loadCategories();
  }

  // ── Lesson CRUD ────────────────────────────────────────────────────────────

  function openLesCreate() {
    setLesForm({ ...LES_BLANK });
    setEditId(null); setModalErr(''); setModal('les-create');
  }

  function openLesEdit(les: Lesson) {
    setLesForm({ title: les.title, description: les.description ?? '', type: les.type, order: les.order });
    setEditId(les.id); setModalErr(''); setModal('les-edit');
  }

  async function saveLes() {
    if (!lesForm.title.trim()) { setModalErr('Tên bài học là bắt buộc'); return; }
    if (!activeCatId) { setModalErr('Chọn chủ đề trước'); return; }
    setSaving(true); setModalErr('');
    try {
      let res: Response;
      if (modal === 'les-create') {
        res = await fetch('/api/learning/lessons', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...lesForm, categoryId: activeCatId }),
        });
      } else {
        res = await fetch(`/api/learning/lessons/${editId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lesForm),
        });
      }
      if (!res.ok) { const e = await res.json(); setModalErr(e.error ?? 'Lỗi'); setSaving(false); return; }
      setModal(null);
      loadLessons(activeCatId);
    } finally { setSaving(false); }
  }

  async function deleteLes(id: string) {
    if (!confirm('Xóa bài học này? Tất cả mục từ vựng/ngữ pháp bên trong cũng sẽ bị xóa.')) return;
    await fetch(`/api/learning/lessons/${id}`, { method: 'DELETE' });
    if (activeCatId) loadLessons(activeCatId);
    if (activeLesId === id) { setActiveLesId(null); setItems([]); }
  }

  // ── Item CRUD ──────────────────────────────────────────────────────────────

  function openItemCreate() {
    setItemForm({ ...ITEM_BLANK });
    setEditId(null); setModalErr(''); setModal('item-create');
  }

  function openItemEdit(item: LearningItem) {
    setItemForm({
      type: item.type, term: item.term, pronunciation: item.pronunciation ?? '',
      language: item.language,
      meaning: item.meanings?.[0]?.meaning ?? '', example: item.examples?.[0]?.exampleText ?? '',
      exampleMeaning: item.examples?.[0]?.translation ?? '',
      order: item.order,
    });
    setEditId(item.id); setModalErr(''); setModal('item-edit');
  }

  async function saveItem() {
    if (!itemForm.term.trim() || !itemForm.meaning.trim()) {
      setModalErr('Term và nghĩa là bắt buộc'); return;
    }
    if (!activeLesId) { setModalErr('Chọn bài học trước'); return; }
    setSaving(true); setModalErr('');
    try {
      let res: Response;
      if (modal === 'item-create') {
        res = await fetch(`/api/learning/lessons/${activeLesId}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemForm),
        });
      } else {
        res = await fetch(`/api/learning/items/${editId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemForm),
        });
      }
      if (!res.ok) { const e = await res.json(); setModalErr(e.error ?? 'Lỗi'); setSaving(false); return; }
      setModal(null);
      loadItems(activeLesId);
    } finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    if (!confirm('Xóa mục này?')) return;
    await fetch(`/api/learning/items/${id}`, { method: 'DELETE' });
    if (activeLesId) loadItems(activeLesId);
  }

  // ── Bulk import ──────────────────────────────────────────────────────────────

  function openImport() {
    setImportText(''); setImportResult(null); setImportErr(''); setImportOpen(true);
  }

  async function runImport() {
    if (!activeLesId) return;
    if (!importText.trim()) { setImportErr('Dán dữ liệu vào ô bên dưới'); return; }
    setImporting(true); setImportErr(''); setImportResult(null);
    const res = await fetch(`/api/learning/lessons/${activeLesId}/import`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: importFmt, data: importText }),
    });
    const json = await res.json();
    setImporting(false);
    if (!res.ok) { setImportErr(json.error ?? 'Lỗi import'); return; }
    setImportResult(json);
    loadItems(activeLesId);
  }

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const filteredCats = categories.filter(c =>
    !catSearch || c.name.toLowerCase().includes(catSearch.toLowerCase())
  );
  const filteredLes = lessons.filter(l =>
    !lesSearch || l.title.toLowerCase().includes(lesSearch.toLowerCase())
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin" className="btn-ghost p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <FaArrowLeft size={14} />
        </Link>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
          <FaBookOpen size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-base)' }}>Quản lý bài học</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chủ đề → Bài học → Từ vựng / Ngữ pháp</p>
        </div>
      </div>

      {/* Level tabs */}
      <div className="flex items-center gap-2 mt-6 mb-2 flex-wrap">
        {LEVELS.map(lv => (
          <button key={lv} onClick={() => setActiveLevel(lv)}
            className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all"
            style={activeLevel === lv
              ? { background: 'var(--primary)', color: 'white' }
              : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {lv}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          <button onClick={() => setActiveSkill('')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
            style={activeSkill === ''
              ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }
              : { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            Tất cả
          </button>
          {SKILLS.map(s => (
            <button key={s.value} onClick={() => setActiveSkill(s.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
              style={activeSkill === s.value
                ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }
                : { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">

        {/* ── Column 1: Categories ── */}
        <div className="card flex flex-col gap-3" style={{ minHeight: 500 }}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-base)' }}>
              <FaLayerGroup className="inline mr-2" size={13} style={{ color: 'var(--primary)' }} />
              Chủ đề ({filteredCats.length})
            </h2>
            <button onClick={openCatCreate}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold btn-primary">
              <FaPlus size={10} /> Thêm
            </button>
          </div>

          <div className="relative">
            <input className="input w-full pl-7 text-sm py-1.5" placeholder="Tìm chủ đề..."
              value={catSearch} onChange={e => setCatSearch(e.target.value)} />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1" style={{ maxHeight: 480 }}>
            {filteredCats.length === 0 ? (
              <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                Chưa có chủ đề nào
              </div>
            ) : filteredCats.map(cat => (
              <div key={cat.id}
                onClick={() => { setActiveCatId(cat.id); loadLessons(cat.id); }}
                className="flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer group transition-all"
                style={activeCatId === cat.id
                  ? { background: 'var(--primary)', color: 'white' }
                  : { background: 'transparent' }}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate"
                    style={{ color: activeCatId === cat.id ? 'white' : 'var(--text-base)' }}>
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs opacity-70"
                      style={{ color: activeCatId === cat.id ? 'white' : 'var(--text-muted)' }}>
                      {cat._count.lessons} bài học
                    </span>
                    {activeCatId !== cat.id && <SkillBadge skill={cat.skill} />}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={e => { e.stopPropagation(); openCatEdit(cat); }}
                    className="p-1 rounded hover:bg-black/10">
                    <FaPencil size={10} style={{ color: activeCatId === cat.id ? 'white' : 'var(--text-muted)' }} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteCat(cat.id); }}
                    className="p-1 rounded hover:bg-red-100">
                    <FaTrash size={10} style={{ color: activeCatId === cat.id ? 'white' : '#EF4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Column 2: Lessons ── */}
        <div className="card flex flex-col gap-3" style={{ minHeight: 500 }}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-base)' }}>
              <FaListUl className="inline mr-2" size={13} style={{ color: 'var(--primary)' }} />
              Bài học ({filteredLes.length})
              {activeCatId && (
                <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                  — {categories.find(c => c.id === activeCatId)?.name}
                </span>
              )}
            </h2>
            {activeCatId && (
              <button onClick={openLesCreate}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold btn-primary">
                <FaPlus size={10} /> Thêm
              </button>
            )}
          </div>

          {activeCatId && (
            <div className="relative">
              <FaMagnifyingGlass size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input w-full pl-7 text-sm py-1.5" placeholder="Tìm bài học..."
                value={lesSearch} onChange={e => setLesSearch(e.target.value)} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1" style={{ maxHeight: 480 }}>
            {!activeCatId ? (
              <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                ← Chọn chủ đề để xem bài học
              </div>
            ) : filteredLes.length === 0 ? (
              <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                Chưa có bài học nào
              </div>
            ) : filteredLes.map(les => (
              <div key={les.id}
                onClick={() => { setActiveLesId(les.id); loadItems(les.id); }}
                className="flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer group transition-all"
                style={activeLesId === les.id
                  ? { background: 'var(--primary-light)', borderLeft: '3px solid var(--primary)' }
                  : { borderLeft: '3px solid transparent' }}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-base)' }}>
                    {les.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{les._count.items} mục</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                      {les.type}
                    </span>
                  </div>
                  {les.description && (
                    <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {les.description}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={e => { e.stopPropagation(); openLesEdit(les); }}
                    className="p-1 rounded hover:bg-black/10">
                    <FaPencil size={10} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteLes(les.id); }}
                    className="p-1 rounded hover:bg-red-100">
                    <FaTrash size={10} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Column 3: Items ── */}
        <div className="card flex flex-col gap-3" style={{ minHeight: 500 }}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-base)' }}>
              <FaCirclePlus className="inline mr-2" size={13} style={{ color: 'var(--primary)' }} />
              Mục từ vựng / ngữ pháp ({items.length})
              {activeLesId && (
                <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                  — {lessons.find(l => l.id === activeLesId)?.title}
                </span>
              )}
            </h2>
            {activeLesId && (
              <div className="flex gap-1">
                <button onClick={openImport}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <FaFileArrowUp size={10} /> Import
                </button>
                <button onClick={openItemCreate}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold btn-primary">
                  <FaPlus size={10} /> Thêm
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2" style={{ maxHeight: 500 }}>
            {!activeLesId ? (
              <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                ← Chọn bài học để xem các mục
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                Chưa có mục nào
              </div>
            ) : items.map(item => (
              <div key={item.id} className="group rounded-xl px-3 py-2.5 border transition-all hover:border-primary"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold" style={{ fontFamily: '"Noto Sans JP", serif', color: 'var(--primary)' }}>
                        {item.term}
                      </span>
                      {item.pronunciation && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif' }}>
                          ({item.pronunciation})
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {item.type}
                      </span>
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: 'var(--text-base)' }}>{item.meanings?.[0]?.meaning ?? ''}</div>
                    {item.examples?.[0] && (
                      <div className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif' }}>
                        {item.examples[0].exampleText}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openItemEdit(item)} className="p-1 rounded hover:bg-black/10">
                      <FaPencil size={10} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-1 rounded hover:bg-red-100">
                      <FaTrash size={10} style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}

      {/* Category Modal */}
      {(modal === 'cat-create' || modal === 'cat-edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModal(null)}>
          <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>
                {modal === 'cat-create' ? 'Thêm chủ đề mới' : 'Sửa chủ đề'}
              </h2>
              <button onClick={() => setModal(null)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
            </div>

            {modalErr && (
              <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                {modalErr}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Cấp độ *</label>
                  <select className="input w-full text-sm" value={catForm.levelCode}
                    onChange={e => setCatForm(f => ({ ...f, levelCode: e.target.value }))}>
                    {LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Kỹ năng *</label>
                  <select className="input w-full text-sm" value={catForm.skill}
                    onChange={e => setCatForm(f => ({ ...f, skill: e.target.value }))}>
                    {SKILLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Tên chủ đề *</label>
                <input className="input w-full" placeholder="VD: Từ vựng chủ đề Gia đình"
                  value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Icon (emoji)</label>
                  <input className="input w-full" placeholder="👨‍👩‍👧"
                    value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Thứ tự</label>
                  <input type="number" className="input w-full" min={0}
                    value={catForm.order} onChange={e => setCatForm(f => ({ ...f, order: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Mô tả</label>
                <textarea className="input w-full resize-none" rows={2} placeholder="Mô tả ngắn về chủ đề..."
                  value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={saveCat} disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FaCheck size={12} />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {(modal === 'les-create' || modal === 'les-edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModal(null)}>
          <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>
                {modal === 'les-create' ? 'Thêm bài học mới' : 'Sửa bài học'}
              </h2>
              <button onClick={() => setModal(null)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
            </div>

            {modalErr && (
              <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                {modalErr}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Tên bài học *</label>
                  <input className="input w-full" placeholder="VD: Bài 1 - Gia đình"
                    value={lesForm.title} onChange={e => setLesForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Loại</label>
                  <select className="input w-full text-sm" value={lesForm.type}
                    onChange={e => setLesForm(f => ({ ...f, type: e.target.value }))}>
                    {LESSON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Mô tả</label>
                <input className="input w-full" placeholder="Mô tả ngắn về bài học..."
                  value={lesForm.description} onChange={e => setLesForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Thứ tự</label>
                <input type="number" className="input w-24" min={0}
                  value={lesForm.order} onChange={e => setLesForm(f => ({ ...f, order: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={saveLes} disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FaCheck size={12} />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {(modal === 'item-create' || modal === 'item-edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModal(null)}>
          <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>
                {modal === 'item-create' ? 'Thêm mục mới' : 'Sửa mục'}
              </h2>
              <button onClick={() => setModal(null)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
            </div>

            {modalErr && (
              <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                {modalErr}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>
                    Term *
                    <span className="ml-1 font-normal opacity-60" style={{ fontFamily: '"Noto Sans JP"' }}>（単語 / 漢字 / 内容）</span>
                  </label>
                  <input className="input w-full" placeholder="食べる" style={{ fontFamily: '"Noto Sans JP"' }}
                    value={itemForm.term} onChange={e => setItemForm(f => ({ ...f, term: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>
                    Phát âm
                    <span className="ml-1 font-normal opacity-60" style={{ fontFamily: '"Noto Sans JP"' }}>（よみかた / pīnyīn）</span>
                  </label>
                  <input className="input w-full" placeholder="たべる" style={{ fontFamily: '"Noto Sans JP"' }}
                    value={itemForm.pronunciation} onChange={e => setItemForm(f => ({ ...f, pronunciation: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Nghĩa *</label>
                  <input className="input w-full" placeholder="ăn (động từ nhóm 2)"
                    value={itemForm.meaning} onChange={e => setItemForm(f => ({ ...f, meaning: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Loại</label>
                  <select className="input w-full text-sm" value={itemForm.type}
                    onChange={e => setItemForm(f => ({ ...f, type: e.target.value }))}>
                    {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>
                  Câu ví dụ
                  <span className="ml-1 font-normal opacity-60" style={{ fontFamily: '"Noto Sans JP"' }}>（例文）</span>
                </label>
                <input className="input w-full" placeholder="毎日ご飯を食べます。" style={{ fontFamily: '"Noto Sans JP"' }}
                  value={itemForm.example} onChange={e => setItemForm(f => ({ ...f, example: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Nghĩa ví dụ</label>
                <input className="input w-full text-sm" placeholder="Tôi ăn cơm mỗi ngày."
                  value={itemForm.exampleMeaning} onChange={e => setItemForm(f => ({ ...f, exampleMeaning: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Thứ tự</label>
                <input type="number" className="input w-24" min={0}
                  value={itemForm.order} onChange={e => setItemForm(f => ({ ...f, order: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={saveItem} disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FaCheck size={12} />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import Modal ───────────────────────────────────────────────────────── */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setImportOpen(false)}>
          <div className="card w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#dcfce7', color: '#15803d' }}>
                  <FaFileArrowUp size={15} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>Import từ vựng / ngữ pháp</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Bài học: <strong>{lessons.find(l => l.id === activeLesId)?.title}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setImportOpen(false)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
            </div>

            {/* Format tabs */}
            <div className="flex gap-2 mb-3 shrink-0">
              {(['csv', 'json'] as const).map(f => (
                <button key={f} onClick={() => { setImportFmt(f); setImportText(''); setImportResult(null); setImportErr(''); }}
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all"
                  style={importFmt === f
                    ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }
                    : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Format hint */}
            <div className="mb-3 px-3 py-2.5 rounded-xl text-xs shrink-0" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {importFmt === 'csv' ? (
                <>
                  <div className="font-semibold mb-1" style={{ color: 'var(--text-base)', fontFamily: 'inherit' }}>📋 Định dạng CSV (cột phân cách bằng dấu phẩy):</div>
                  <div>term,pronunciation,meaning,type,example,exampleReading,exampleMeaning</div>
                  <div className="mt-1">食べる,たべる,ăn,vocab,毎日食べます,まいにちたべます,Tôi ăn mỗi ngày</div>
                  <div>家族,かぞく,gia đình,vocab,,,</div>
                  <div className="mt-1" style={{ color: '#059669' }}>• type: vocab | character | grammar | example | phrase | tone | idiom</div>
                  <div style={{ color: '#059669' }}>• pronunciation/example/... có thể để trống</div>
                </>
              ) : (
                <>
                  <div className="font-semibold mb-1" style={{ color: 'var(--text-base)', fontFamily: 'inherit' }}>📋 Định dạng JSON (mảng object):</div>
                  <div>{'['}{'{'}&quot;term&quot;:&quot;食べる&quot;,&quot;pronunciation&quot;:&quot;たべる&quot;,&quot;meaning&quot;:&quot;ăn&quot;,&quot;type&quot;:&quot;vocab&quot;{'}'},{'{'}...{'}'}]</div>
                  <div className="mt-1" style={{ color: '#059669' }}>• Các field: term*, meaning*, pronunciation, type, example, exampleReading, exampleMeaning</div>
                  <div style={{ color: '#059669' }}>• (*) bắt buộc</div>
                </>
              )}
            </div>

            {/* Template download */}
            <div className="mb-3 shrink-0">
              <button onClick={() => {
                const content = importFmt === 'csv'
                  ? 'term,pronunciation,meaning,type,example,exampleReading,exampleMeaning\n食べる,たべる,ăn,vocab,毎日食べます,まいにちたべます,Tôi ăn mỗi ngày\n家族,かぞく,gia đình,vocab,,,'
                  : JSON.stringify([{ term: '食べる', pronunciation: 'たべる', meaning: 'ăn', type: 'vocab', example: '毎日食べます', exampleReading: 'まいにちたべます', exampleMeaning: 'Tôi ăn mỗi ngày' }], null, 2);
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                a.download = `template.${importFmt}`; a.click();
              }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <FaDownload size={10} /> Tải template {importFmt.toUpperCase()}
              </button>
            </div>

            {/* Textarea */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <label className="block text-xs font-semibold mb-1 shrink-0" style={{ color: 'var(--text-base)' }}>
                Dán dữ liệu {importFmt.toUpperCase()} vào đây *
              </label>
              <textarea
                className="input flex-1 resize-none font-mono text-xs w-full min-h-[160px]"
                placeholder={importFmt === 'csv'
                  ? 'term,pronunciation,meaning,type,...\n食べる,たべる,ăn,vocab,...'
                  : '[{"term":"食べる","pronunciation":"たべる","meaning":"ăn","type":"vocab"}]'}
                value={importText}
                onChange={e => { setImportText(e.target.value); setImportResult(null); setImportErr(''); }}
              />
            </div>

            {/* Error */}
            {importErr && (
              <div className="mt-3 px-3 py-2 rounded-lg text-sm flex items-start gap-2 shrink-0"
                style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <FaTriangleExclamation size={13} className="mt-0.5 shrink-0" />
                <span>{importErr}</span>
              </div>
            )}

            {/* Result */}
            {importResult && (
              <div className="mt-3 rounded-xl px-3 py-2.5 shrink-0"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: '#15803d' }}>
                  <FaCircleCheck size={14} />
                  Import thành công {importResult.imported} mục{importResult.skipped > 0 && `, bỏ qua ${importResult.skipped} dòng lỗi`}
                </div>
                {importResult.errors.length > 0 && (
                  <details className="mt-1">
                    <summary className="text-xs cursor-pointer" style={{ color: '#92400e' }}>Xem {importResult.errors.length} lỗi chi tiết</summary>
                    <ul className="mt-1 space-y-0.5">
                      {importResult.errors.map((e, i) => (
                        <li key={i} className="text-xs" style={{ color: '#b45309' }}>{e}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-4 shrink-0">
              <button onClick={() => setImportOpen(false)} className="btn-secondary flex-1">
                {importResult ? 'Đóng' : 'Hủy'}
              </button>
              {!importResult && (
                <button onClick={runImport} disabled={importing}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {importing
                    ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <FaFileArrowUp size={12} />}
                  Import {importFmt.toUpperCase()}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
