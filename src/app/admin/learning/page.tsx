'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryPanel from '@/components/admin/learning/CategoryPanel';
import CategoryDetailCard from '@/components/admin/learning/CategoryDetailCard';
import LessonTable from '@/components/admin/learning/LessonTable';
import ItemPanel from '@/components/admin/learning/ItemPanel';
import { CategoryModal } from '@/components/admin/learning/Modals/CategoryModal';
import { LessonModal } from '@/components/admin/learning/Modals/LessonModal';
import { ItemModal } from '@/components/admin/learning/Modals/ItemModal';
import { ImportModal } from '@/components/admin/learning/Modals/ImportModal';
import {
  useAdminCMS,
  CAT_BLANK, LES_BLANK, ITEM_BLANK,
  type CatForm, type LesForm, type ItemForm,
  type Category, type LearningItem,
} from '@/app/admin/_components/cms/useAdminCMS';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Lesson } from '@/types/lesson';

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILLS = [
  { value: 'vocab', label: 'Từ vựng' },
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'doc', label: 'Đọc' },
  { value: 'nghe', label: 'Nghe' },
  { value: 'noi', label: 'Nói' },
  { value: 'viet', label: 'Viết' },
];
const LESSON_TYPES = ['text', 'vocab', 'grammar', 'audio'];
const ITEM_TYPES = ['vocab', 'character', 'grammar', 'example', 'phrase', 'tone', 'idiom'];


// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminLearningPage() {
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') ?? 'JLPT';

  // ── CMS hook (all data + CRUD) ──
  const cms = useAdminCMS(subject);

  // ── Modal state ──
  type Modal = 'cat-create' | 'cat-edit' | 'les-create' | 'les-edit' | 'item-create' | 'item-edit' | null;
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const [modalErr, setModalErr] = useState('');
  const [catForm, setCatForm] = useState({ ...CAT_BLANK });
  const [lesForm, setLesForm] = useState({ ...LES_BLANK });
  const [itemForm, setItemForm] = useState({ ...ITEM_BLANK });
  const [editId, setEditId] = useState<string | null>(null);

  // ── Search ──
  const [catSearch, setCatSearch] = useState('');
  const [lesSearch, setLesSearch] = useState('');

  // ── Keyboard shortcuts ──
  useKeyboardShortcuts({
    'n': () => { if (cms.activeCatId) openLesCreate(); },
    'i': () => { if (cms.activeLesId) openItemCreate(); },
    'ctrl+i': () => { if (cms.activeLesId) openImport(); },
    'escape': () => setModal(null),
  });

  // ── Quick add / inline edit item handlers ──
  const quickAddItem = useCallback(async (data: { term: string; pronunciation: string; meaning: string; type: string }) => {
    if (!cms.activeLesId) return;
    await cms.saveItem({
      type: data.type, term: data.term, pronunciation: data.pronunciation,
      language: 'ja', meaning: data.meaning, example: '', exampleMeaning: '',
      order: cms.items.length,
    } as ItemForm, cms.activeLesId, null);
  }, [cms]);

  const inlineEditItem = useCallback(async (id: string, data: { term: string; pronunciation: string; meaning: string }) => {
    if (!cms.activeLesId) return;
    await cms.saveItem({
      type: 'vocab', term: data.term, pronunciation: data.pronunciation,
      language: 'ja', meaning: data.meaning, example: '', exampleMeaning: '',
      order: 0,
    } as ItemForm, cms.activeLesId, id);
  }, [cms]);

  // ── Import modal ──
  const [importOpen, setImportOpen] = useState(false);
  const [importFmt, setImportFmt] = useState<'json' | 'csv'>('csv');
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErr, setImportErr] = useState('');

  // ── Category handlers ──
  function openCatCreate() {
    const level = cms.levels.find(l => l.code === cms.activeLevel);
    setCatForm({ ...CAT_BLANK, levelId: level?.id ?? '', skill: cms.activeSkill || 'vocab' });
    setEditId(null); setModalErr(''); setModal('cat-create');
  }
  function openCatEdit(cat: Category) {
    setCatForm({ levelId: cat.levelId, skill: cat.skill, name: cat.name, description: cat.description ?? '', icon: cat.icon ?? '', order: cat.order });
    setEditId(cat.id); setModalErr(''); setModal('cat-edit');
  }
  async function saveCat() {
    setSaving(true); setModalErr('');
    try {
      await cms.saveCategory(catForm as CatForm, editId);
      setModal(null);
    } catch (e: unknown) {
      setModalErr(e instanceof Error ? e.message : 'Lỗi khi lưu');
    } finally { setSaving(false); }
  }
  async function deleteCat(id: string) {
    if (!confirm('Xóa chủ đề này? Tất cả bài học bên trong cũng sẽ bị xóa.')) return;
    await cms.deleteCategory(id);
  }

  // ── Lesson handlers ──
  function openLesCreate() {
    setLesForm({ ...LES_BLANK });
    setEditId(null); setModalErr(''); setModal('les-create');
  }
  function openLesEdit(les: Lesson) {
    setLesForm({ title: les.title, description: les.description ?? '', type: les.type, order: les.order, requiredTier: les.requiredTier ?? 'free' });
    setEditId(les.id); setModalErr(''); setModal('les-edit');
  }
  async function saveLes() {
    if (!cms.activeCatId) { setModalErr('Chọn chủ đề trước'); return; }
    setSaving(true); setModalErr('');
    try {
      await cms.saveLesson(lesForm as LesForm, cms.activeCatId, editId);
      setModal(null);
    } catch (e: unknown) {
      setModalErr(e instanceof Error ? e.message : 'Lỗi khi lưu');
    } finally { setSaving(false); }
  }
  async function deleteLes(id: string) {
    if (!confirm('Xóa bài học này? Tất cả mục từ vựng/ngữ pháp bên trong cũng sẽ bị xóa.')) return;
    await cms.deleteLesson(id);
  }
  async function bulkDeleteLes(ids: string[]) {
    await Promise.all(ids.map(id => cms.deleteLesson(id)));
  }

  // ── Item handlers ──
  function openItemCreate() {
    setItemForm({ ...ITEM_BLANK });
    setEditId(null); setModalErr(''); setModal('item-create');
  }
  function openItemEdit(item: LearningItem) {
    setItemForm({
      type: item.type, term: item.term, pronunciation: item.pronunciation ?? '',
      language: item.language,
      meaning: item.meanings?.[0]?.meaning ?? '',
      example: item.examples?.[0]?.exampleText ?? '',
      exampleMeaning: item.examples?.[0]?.translation ?? '',
      order: item.order,
    });
    setEditId(item.id); setModalErr(''); setModal('item-edit');
  }
  async function saveItem() {
    if (!cms.activeLesId) { setModalErr('Chọn bài học trước'); return; }
    setSaving(true); setModalErr('');
    try {
      await cms.saveItem(itemForm as ItemForm, cms.activeLesId, editId);
      setModal(null);
    } catch (e: unknown) {
      setModalErr(e instanceof Error ? e.message : 'Lỗi khi lưu');
    } finally { setSaving(false); }
  }
  async function deleteItem(id: string) {
    if (!confirm('Xóa mục này?')) return;
    await cms.deleteItem(id);
  }

  // ── Import handlers ──
  function openImport() {
    setImportText(''); setImportResult(null); setImportErr(''); setImportOpen(true);
  }
  async function runImport() {
    if (!cms.activeLesId) return;
    if (!importText.trim()) { setImportErr('Dán dữ liệu vào ô bên dưới'); return; }
    setImporting(true); setImportErr(''); setImportResult(null);
    try {
      const result = await cms.importItems(cms.activeLesId, importFmt, importText);
      setImportResult(result);
    } catch (e: unknown) {
      setImportErr(e instanceof Error ? e.message : 'Lỗi import');
    } finally { setImporting(false); }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mb-2">
        {/* Left: Category sidebar */}
        <div className="sticky top-8 self-start w-full z-10">
          <CategoryPanel
            levels={cms.levels}
            categories={cms.categories}
            activeLevel={cms.activeLevel}
            setActiveLevel={cms.setActiveLevel}
            activeSkill={cms.activeSkill}
            setActiveSkill={cms.setActiveSkill}
            catSearch={catSearch}
            setCatSearch={setCatSearch}
            activeCatId={cms.activeCatId}
            setActiveCatId={(id: string) => { cms.setActiveCatId(id); cms.loadLessons(id); }}
            loadLessons={cms.loadLessons}
            openCatCreate={openCatCreate}
            openCatEdit={openCatEdit}
            deleteCat={deleteCat}
          />
        </div>

        {/* Right: Lessons and Items side by side */}
        <div className="flex flex-col gap-4">
          <CategoryDetailCard
            cat={cms.categories.find(c => c.id === cms.activeCatId) ?? null}
            onEdit={() => {
              const cat = cms.categories.find(c => c.id === cms.activeCatId);
              if (cat) openCatEdit(cat);
            }}
            onDelete={() => { if (cms.activeCatId) deleteCat(cms.activeCatId); }}
          />
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
            <LessonTable
              lessons={cms.lessons as Lesson[]}
              activeCatId={cms.activeCatId}
              activeLesId={cms.activeLesId}
              categories={cms.categories}
              lesSearch={lesSearch}
              setLesSearch={setLesSearch}
              openLesCreate={openLesCreate}
              openLesEdit={openLesEdit}
              setActiveLesId={(id: string) => { cms.setActiveLesId(id); cms.loadItems(id); }}
              loadItems={cms.loadItems}
              deleteLes={deleteLes}
              bulkDeleteLes={bulkDeleteLes}
              updateLessonStatus={cms.updateLessonStatus}
              bulkUpdateStatus={cms.bulkUpdateStatus}
              reorderLessons={cms.reorderLessons}
            />
            <ItemPanel
              items={cms.items as LearningItem[]}
              activeLesId={cms.activeLesId}
              lessons={cms.lessons as Lesson[]}
              openItemCreate={openItemCreate}
              openItemEdit={openItemEdit}
              deleteItem={deleteItem}
              openImport={openImport}
              quickAddItem={quickAddItem}
              inlineEditItem={inlineEditItem}
              reorderItems={cms.reorderItems}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CategoryModal
        modal={modal}
        setModal={setModal}
        modalErr={modalErr}
        catForm={catForm}
        setCatForm={setCatForm}
        levels={cms.levels}
        SKILLS={SKILLS}
        saving={saving}
        saveCat={saveCat}
      />
      <LessonModal
        modal={modal}
        setModal={setModal}
        modalErr={modalErr}
        lesForm={lesForm}
        setLesForm={setLesForm}
        LESSON_TYPES={LESSON_TYPES}
        saving={saving}
        saveLes={saveLes}
      />
      <ItemModal
        modal={modal}
        setModal={setModal}
        modalErr={modalErr}
        itemForm={itemForm}
        setItemForm={setItemForm}
        ITEM_TYPES={ITEM_TYPES}
        saving={saving}
        saveItem={saveItem}
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
        lessons={cms.lessons as Lesson[]}
        activeLesId={cms.activeLesId}
      />
    </>
  );
}

// ── Render ──────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>}>
      <AdminLearningPage />
    </Suspense>
  );
}
