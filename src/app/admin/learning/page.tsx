'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/admin/learning/Header';
import CategoryPanel from '@/components/admin/learning/CategoryPanel';
import CategoryDetailCard from '@/components/admin/learning/CategoryDetailCard';
import LessonTable from '@/components/admin/learning/LessonTable';
import ItemPanel from '@/components/admin/learning/ItemPanel';
import { CategoryModal } from '@/components/admin/learning/Modals/CategoryModal';
import { LessonModal } from '@/components/admin/learning/Modals/LessonModal';
import { ItemModal } from '@/components/admin/learning/Modals/ItemModal';
import { ImportModal } from '@/components/admin/learning/Modals/ImportModal';
import type { Lesson, LearningItem, ContentMeaning, ContentExample } from '@/types/lesson';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Level { id: string; code: string; name: string; }

interface Category {
  id: string; levelId: string; skill: string; name: string;
  description: string | null; icon: string | null; order: number;
  level: { code: string; name: string };
  _count: { lessons: number };
}

// Lesson, LearningItem, ContentMeaning, ContentExample imported from @/types/lesson

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const SKILLS = [
  { value: 'doc', label: 'Đọc' },
  { value: 'nghe', label: 'Nghe' },
  { value: 'ngu_phap', label: 'Ngữ pháp' },
  { value: 'tu_vung', label: 'Từ vựng' },
  { value: 'vocab', label: 'Vocab' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'viet', label: 'Viết' },
  { value: 'noi', label: 'Nói' },
];
const LESSON_TYPES = ['text', 'vocab', 'grammar', 'audio'];
const ITEM_TYPES = ['vocab', 'character', 'grammar', 'example', 'phrase', 'tone', 'idiom'];

const CAT_BLANK = { levelCode: '', skill: 'tu_vung', name: '', description: '', icon: '', order: 0 };
const LES_BLANK = { title: '', description: '', type: 'vocab', order: 0, requiredTier: 'free' };
const ITEM_BLANK = {
  type: 'vocab', term: '', pronunciation: '', language: 'ja', meaning: '',
  example: '', exampleMeaning: '', order: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SkillBadge({ skill }: { skill: string }) {
  const colors: Record<string, string> = {
    doc: '#0EA5E9', nghe: '#10B981', ngu_phap: '#F59E0B', tu_vung: '#8B5CF6',
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

function AdminLearningPage() {
  // ── Modal/form state ──
  type Modal = 'cat-create' | 'cat-edit' | 'les-create' | 'les-edit' | 'item-create' | 'item-edit' | null;
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const [modalErr, setModalErr] = useState('');
  const [catForm, setCatForm] = useState({ ...CAT_BLANK });
  const [lesForm, setLesForm] = useState({ ...LES_BLANK });
  const [itemForm, setItemForm] = useState({ ...ITEM_BLANK });
  const [editId, setEditId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') ?? 'JLPT';

  // ── Data ──
  const [levels, setLevels] = useState<Level[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [items, setItems] = useState<LearningItem[]>([]);

  // ── Selection ──
  const [activeLevel, setActiveLevel] = useState('');
  const [activeSkill, setActiveSkill] = useState('');
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [activeLesId, setActiveLesId] = useState<string | null>(null);

  // ── Search ──
  const [catSearch, setCatSearch] = useState('');
  const [lesSearch, setLesSearch] = useState('');

  // ── Handler functions ──
  function openCatCreate() {
    setCatForm({ ...CAT_BLANK, levelCode: activeLevel, skill: activeSkill || 'tu_vung' });
    setEditId(null); setModalErr(''); setModal('cat-create');
  }
  function openCatEdit(cat: Category) {
    setCatForm({ levelCode: cat.level.code, skill: cat.skill, name: cat.name, description: cat.description ?? '', icon: cat.icon ?? '', order: cat.order });
    setEditId(cat.id); setModalErr(''); setModal('cat-edit');
  }
  async function deleteCat(id: string) {
    if (!confirm('Xóa chủ đề này? Tất cả bài học bên trong cũng sẽ bị xóa.')) return;
    await fetch(`/api/learning/categories/${id}`, { method: 'DELETE' });
    loadCategories();
  }
  function openLesCreate() {
    setLesForm({ ...LES_BLANK });
    setEditId(null); setModalErr(''); setModal('les-create');
  }
  function openLesEdit(les: Lesson) {
    setLesForm({ title: les.title, description: les.description ?? '', type: les.type, order: les.order, requiredTier: les.requiredTier ?? 'free' });
    setEditId(les.id); setModalErr(''); setModal('les-edit');
  }
  async function deleteLes(id: string) {
    if (!confirm('Xóa bài học này? Tất cả mục từ vựng/ngữ pháp bên trong cũng sẽ bị xóa.')) return;
    await fetch(`/api/learning/lessons/${id}`, { method: 'DELETE' });
    if (activeCatId) loadLessons(activeCatId);
    if (activeLesId === id) { setActiveLesId(null); setItems([]); }
  }
  async function bulkDeleteLes(ids: string[]) {
    await Promise.all(ids.map(id => fetch(`/api/learning/lessons/${id}`, { method: 'DELETE' })));
    if (activeCatId) loadLessons(activeCatId);
    if (activeLesId && ids.includes(activeLesId)) { setActiveLesId(null); setItems([]); }
  }
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
  async function deleteItem(id: string) {
    if (!confirm('Xóa mục này?')) return;
    await fetch(`/api/learning/items/${id}`, { method: 'DELETE' });
    if (activeLesId) loadItems(activeLesId);
  }
  // ── Data loading ──
  const loadCategories = useCallback(async () => {
    const level = levels.find(l => l.code === activeLevel);
    const params = new URLSearchParams();
    if (level) params.set('levelId', level.id);
    if (activeSkill) params.set('skill', activeSkill);
    params.set('subject', subject);
    const res = await fetch(`/api/learning/categories?${params}`);
    if (res.ok) setCategories(await res.json());
    setActiveCatId(null);
    setActiveLesId(null);
    setLessons([]);
    setItems([]);
  }, [activeLevel, activeSkill, levels, subject]);
  const loadLessons = useCallback(async (catId: string) => {
    const res = await fetch(`/api/learning/lessons?categoryId=${catId}`);
    if (res.ok) setLessons(await res.json());
    setActiveLesId(null);
    setItems([]);
  }, []);
  const loadItems = useCallback(async (lesId: string) => {
    const res = await fetch(`/api/learning/lessons/${lesId}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
    }
  }, []);
  // ── Import modal handlers ──
  const [importOpen, setImportOpen] = useState(false);
  const [importFmt, setImportFmt] = useState<'json' | 'csv'>('csv');
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErr, setImportErr] = useState('');
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
    if (!res.ok) { setImportErr(json.error?.message ?? 'Lỗi import'); return; }
    setImportResult(json);
    loadItems(activeLesId);
  }

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <>
      {/* <Header subject={subject} /> */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mb-2">
        <div className='sticky top-8 self-start w-full z-10'>
          <CategoryPanel
          levels={levels}
          categories={categories}
          activeLevel={activeLevel}
          setActiveLevel={setActiveLevel}
          activeSkill={activeSkill}
          setActiveSkill={setActiveSkill}
          catSearch={catSearch}
          setCatSearch={setCatSearch}
          activeCatId={activeCatId}
          setActiveCatId={setActiveCatId}
          loadLessons={loadLessons}
          openCatCreate={openCatCreate}
          openCatEdit={openCatEdit}
          deleteCat={deleteCat}
        />
        </div>
        <div>
          <CategoryDetailCard
            cat={categories.find(c => c.id === activeCatId)}
            onEdit={() => {
              const cat = categories.find(c => c.id === activeCatId);
              if (cat) openCatEdit(cat);
            }}
            onDelete={() => { if (activeCatId) deleteCat(activeCatId); }}
          />
          <LessonTable
            lessons={lessons}
            activeCatId={activeCatId}
            categories={categories}
            lesSearch={lesSearch}
            setLesSearch={setLesSearch}
            openLesCreate={openLesCreate}
            setActiveLesId={setActiveLesId}
            loadItems={loadItems}
            deleteLes={deleteLes}
            bulkDeleteLes={bulkDeleteLes}
          />
        </div>
        {/* <ItemPanel
          items={items}
          activeLesId={activeLesId}
          lessons={lessons}
          openItemCreate={openItemCreate}
          openItemEdit={openItemEdit}
          deleteItem={deleteItem}
          openImport={openImport}
        /> */}
      </div>
      <CategoryModal
        modal={modal}
        setModal={setModal}
        modalErr={modalErr}
        catForm={catForm}
        setCatForm={setCatForm}
        levels={levels}
        SKILLS={SKILLS}
        saving={saving}
        saveCat={() => { }} // TODO: Implement saveCat
      />
      <LessonModal
        modal={modal}
        setModal={setModal}
        modalErr={modalErr}
        lesForm={lesForm}
        setLesForm={setLesForm}
        LESSON_TYPES={LESSON_TYPES}
        saving={saving}
        saveLes={() => { }} // TODO: Implement saveLes
      />
      <ItemModal
        modal={modal}
        setModal={setModal}
        modalErr={modalErr}
        itemForm={itemForm}
        setItemForm={setItemForm}
        ITEM_TYPES={ITEM_TYPES}
        saving={saving}
        saveItem={() => { }} // TODO: Implement saveItem
      />
      <ImportModal
        importOpen={importOpen}
        setImportOpen={setImportOpen}
        importFmt={importFmt}
        setImportFmt={setImportFmt}
        importText={importText}
        setImportText={setImportText}
        importResult={importResult}
        importErr={importErr}
        importing={importing}
        runImport={runImport}
        lessons={lessons}
        activeLesId={activeLesId}
      />
    </>
  );
}
// ── Render ──────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLearningPage />
    </Suspense>
  );
}
