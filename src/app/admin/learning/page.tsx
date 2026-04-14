'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FaPlus, FaHouse, FaChevronRight, FaCircleCheck, FaCirclePlus,
  FaBookOpen, FaLayerGroup, FaHeadphones, FaBook,
  FaClipboardList, FaBoxArchive, FaGraduationCap,
} from 'react-icons/fa6';
import {
  AdminTable, AdminToolbar, ConfirmDialog,
  type ColumnDef,
} from '@/components/admin/ui';
import { LessonDetailDrawer, type DrawerLesson, type ItemForm } from '@/components/admin/learning/LessonDetailDrawer';
import { CategoryModal } from '@/components/admin/learning/Modals/CategoryModal';
import { LessonModal } from '@/components/admin/learning/Modals/LessonModal';
import { ImportModal } from '@/components/admin/learning/Modals/ImportModal';
import {
  useAdminCMS,
  CAT_BLANK, LES_BLANK, ITEM_BLANK,
  type CatForm, type LesForm, type ItemForm as CmsItemForm,
  type Category,
} from '@/app/admin/_components/cms/useAdminCMS';
import type { Lesson } from '@/types/lesson';

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILLS = [
  { value: '', label: 'Tất cả' },
  { value: 'vocab', label: 'Từ vựng' },
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'grammar_reading', label: 'Ngữ pháp & Đọc' },
  { value: 'listening', label: 'Nghe' },
  { value: 'reading', label: 'Đọc' },
  { value: 'integrated', label: 'Tổng hợp' },
];

const CAT_SKILLS = SKILLS.filter(s => s.value); // for CategoryModal (no "Tất cả")

const LESSON_TYPES = ['text', 'vocab', 'grammar', 'audio'];

const SKILL_COLOR: Record<string, string> = {
  vocab: '#4F46E5', grammar: '#059669', grammar_reading: '#059669',
  listening: '#D97706', reading: '#0891B2', integrated: '#7C3AED',
};
const SKILL_ICON: Record<string, React.ReactNode> = {
  vocab: <FaBookOpen size={11} />, grammar: <FaBook size={11} />,
  grammar_reading: <FaBook size={11} />, listening: <FaHeadphones size={11} />,
  reading: <FaBook size={11} />, integrated: <FaLayerGroup size={11} />,
};
const STATUS_CHIP: Record<string, { bg: string; color: string; label: string }> = {
  published: { bg: '#DCFCE7', color: '#16A34A', label: 'Xuất bản' },
  draft:     { bg: '#FEF3C7', color: '#CA8A04', label: 'Nháp' },
  archived:  { bg: '#F3F4F6', color: '#6B7280', label: 'Lưu trữ' },
};
const TIER_CHIP: Record<string, { bg: string; color: string }> = {
  free:    { bg: '#F3F4F6', color: '#6B7280' },
  basic:   { bg: '#DBEAFE', color: '#2563EB' },
  premium: { bg: '#FEF3C7', color: '#D97706' },
};

// ─── Cell helpers ─────────────────────────────────────────────────────────────

function SkillBadge({ skill }: { skill: string }) {
  const color = SKILL_COLOR[skill] ?? '#6B7280';
  const icon = SKILL_ICON[skill] ?? <FaClipboardList size={11} />;
  const label = SKILLS.find(s => s.value === skill)?.label ?? skill;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: `${color}15`, color }}>
      {icon}{label}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = STATUS_CHIP[status ?? 'draft'] ?? STATUS_CHIP.draft;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  );
}

function TierBadge({ tier }: { tier?: string }) {
  const s = TIER_CHIP[tier ?? 'free'] ?? TIER_CHIP.free;
  const labels: Record<string, string> = { free: 'Miễn phí', basic: 'Cơ bản', premium: 'Premium' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: s.bg, color: s.color }}>{labels[tier ?? 'free'] ?? tier}</span>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

function FilterTabs<T extends string>({
  value, onChange, tabs, className,
}: {
  value: T;
  onChange: (v: T) => void;
  tabs: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-0.5 flex-wrap overflow-x-auto ${className ?? ''}`}>
      {tabs.map(t => (
        <button key={String(t.value)} onClick={() => onChange(t.value)}
          className={[
            'px-2.5 py-1.5 rounded text-xs transition-colors whitespace-nowrap',
            t.value === value
              ? 'font-semibold bg-[var(--primary-light)] text-[var(--primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]',
          ].join(' ')}>
          {t.label}
          {t.count !== undefined && (
            <span className={`ml-1 text-[11px] font-mono ${t.value === value ? 'opacity-80' : 'opacity-50'}`}>
              ({t.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="hidden group-hover:flex items-center gap-1 mt-0.5 text-[11px]">
      <button onClick={e => { e.stopPropagation(); onEdit(); }}
        className="hover:underline" style={{ color: 'var(--primary)' }}>Sửa</button>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <button onClick={e => { e.stopPropagation(); onDelete(); }}
        className="hover:underline text-red-600">Xóa</button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function AdminLearningPage() {
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') ?? 'JLPT';

  const cms = useAdminCMS(subject);

  // ── Search / filters ──
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── All lessons flat: load when level/skill changes ──
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const loadAllLessons = useCallback(async () => {
    setLessonsLoading(true);
    const params = new URLSearchParams({ subject });
    const res = await fetch(`/api/learning/lessons?${params}`);
    if (res.ok) setAllLessons(await res.json());
    setLessonsLoading(false);
  }, [subject]);

  useEffect(() => { loadAllLessons(); }, [loadAllLessons]);

  // ── Filtered lessons ──
  const filtered = useMemo(() => {
    let list = allLessons;
    if (levelFilter) list = list.filter(l => l.category?.level?.code === levelFilter);
    if (skillFilter) list = list.filter(l => l.category?.skill === skillFilter);
    if (statusFilter) list = list.filter(l => (l.status ?? 'draft') === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.category?.name?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allLessons, levelFilter, skillFilter, statusFilter, search]);

  // ── Counts for filter tabs ──
  const counts = useMemo((): { total: number; published: number; draft: number; archived: number } => {
    let published = 0, draft = 0, archived = 0;
    allLessons.forEach(l => {
      const s = l.status ?? 'draft';
      if (s === 'published') published++;
      else if (s === 'archived') archived++;
      else draft++;
    });
    return { total: allLessons.length, published, draft, archived };
  }, [allLessons]);

  // ── Modal state ──
  type Modal = 'cat-create' | 'cat-edit' | 'les-create' | 'les-edit' | null;
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const [modalErr, setModalErr] = useState('');
  const [catForm, setCatForm] = useState({ ...CAT_BLANK });
  const [lesForm, setLesForm] = useState({ ...LES_BLANK });
  const [editId, setEditId] = useState<string | null>(null);

  // ── Delete confirm ──
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Drawer state ──
  const [drawerLesson, setDrawerLesson] = useState<DrawerLesson | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // When opening a row → set as drawer lesson, load items
  function openDrawer(lesson: Lesson) {
    setDrawerLesson(lesson as unknown as DrawerLesson);
    if (lesson.id !== cms.activeLesId) {
      cms.loadItems(lesson.id);
    }
  }
  function closeDrawer() { setDrawerLesson(null); }

  // ── Import modal ──
  const [importOpen, setImportOpen] = useState(false);
  const [importFmt, setImportFmt] = useState<'json' | 'csv'>('csv');
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErr, setImportErr] = useState('');

  // ── Category handlers ──
  function openCatCreate() {
    const level = cms.levels.find(l => l.code === (levelFilter || cms.activeLevel));
    setCatForm({ ...CAT_BLANK, levelId: level?.id ?? '', skill: skillFilter || 'vocab' });
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
    } catch (e) { setModalErr(e instanceof Error ? e.message : 'Lỗi khi lưu'); }
    finally { setSaving(false); }
  }

  // ── Lesson handlers ──
  function openLesCreate() {
    const level = cms.levels.find(l => l.code === levelFilter);
    const cat = cms.categories.find(c =>
      c.skill === skillFilter && c.level?.code === levelFilter
    );
    setLesForm({ ...LES_BLANK });
    // Pre-select activeCatId from filter if available
    if (cat) cms.setActiveCatId(cat.id);
    else if (level) cms.setActiveLevel(level.code);
    setEditId(null); setModalErr(''); setModal('les-create');
  }
  function openLesEdit(les: Lesson) {
    setLesForm({ title: les.title, description: les.description ?? '', type: les.type, order: les.order, requiredTier: les.requiredTier ?? 'free' });
    // Ensure activeCatId is set for save
    cms.setActiveCatId(les.categoryId);
    setEditId(les.id); setModalErr(''); setModal('les-edit');
  }
  async function saveLes() {
    if (!cms.activeCatId) { setModalErr('Chọn chủ đề trước'); return; }
    setSaving(true); setModalErr('');
    try {
      await cms.saveLesson(lesForm as LesForm, cms.activeCatId, editId);
      setModal(null);
      await loadAllLessons();
    } catch (e) { setModalErr(e instanceof Error ? e.message : 'Lỗi khi lưu'); }
    finally { setSaving(false); }
  }
  async function deleteLes(id: string) {
    setDeleting(true);
    try {
      await cms.deleteLesson(id);
      if (drawerLesson?.id === id) closeDrawer();
      await loadAllLessons();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // ── Drawer: item handlers wiring ──
  const drawerQuickAdd = useCallback(async (data: { term: string; pronunciation: string; meaning: string; type: string }) => {
    if (!drawerLesson) return;
    await cms.saveItem({
      type: data.type, term: data.term, pronunciation: data.pronunciation,
      language: 'ja', meaning: data.meaning, example: '', exampleMeaning: '', order: cms.items.length,
    } as CmsItemForm, drawerLesson.id, null);
  }, [cms, drawerLesson]);

  const drawerSaveItem = useCallback(async (form: ItemForm, lessonId: string, editItemId: string | null) => {
    await cms.saveItem(form as CmsItemForm, lessonId, editItemId);
  }, [cms]);

  const drawerDeleteItem = useCallback(async (id: string) => {
    await cms.deleteItem(id);
  }, [cms]);

  const drawerStatusChange = useCallback(async (id: string, status: string) => {
    await cms.updateLessonStatus(id, status as 'draft' | 'published' | 'archived');
    setDrawerLesson(prev => prev ? { ...prev, status } : null);
    setAllLessons(prev => prev.map(l => l.id === id ? { ...l, status: status as 'draft' | 'published' | 'archived' } : l));
  }, [cms]);

  // ── Import handlers ──
  function openImport() { setImportText(''); setImportResult(null); setImportErr(''); setImportOpen(true); }
  async function runImport() {
    if (!cms.activeLesId) return;
    if (!importText.trim()) { setImportErr('Dán dữ liệu vào ô bên dưới'); return; }
    setImporting(true); setImportErr(''); setImportResult(null);
    try {
      const result = await cms.importItems(cms.activeLesId, importFmt, importText);
      setImportResult(result);
    } catch (e) { setImportErr(e instanceof Error ? e.message : 'Lỗi import'); }
    finally { setImporting(false); }
  }

  // ── Table columns ──
  const columns = useMemo<ColumnDef<Lesson>[]>(() => [
    {
      key: 'title',
      header: 'Bài học',
      render: (les) => (
        <div className="min-w-0">
          <div className="font-medium text-sm leading-tight truncate max-w-[260px]" style={{ color: 'var(--text-primary)' }}>
            {les.title}
          </div>
          <div className="text-[11px] mt-0.5 truncate max-w-[260px]" style={{ color: 'var(--text-muted)' }}>
            {les.category?.name}
          </div>
          <RowActions
            onEdit={() => openDrawer(les)}
            onDelete={() => setDeleteTarget({ id: les.id, title: les.title })} />
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Cấp',
      width: '56px',
      align: 'center',
      render: (les) => (
        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
          {les.category?.level?.code}
        </span>
      ),
    },
    {
      key: 'skill',
      header: 'Kỹ năng',
      width: '130px',
      render: (les) => <SkillBadge skill={les.category?.skill ?? ''} />,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '96px',
      render: (les) => <StatusBadge status={les.status} />,
    },
    {
      key: 'tier',
      header: 'Gói',
      width: '88px',
      render: (les) => <TierBadge tier={les.requiredTier} />,
    },
    {
      key: 'items',
      header: 'Mục',
      width: '52px',
      align: 'center',
      render: (les) => (
        <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {les._count?.items ?? 0}
        </span>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  // ── Level tabs ──
  const levelTabs = useMemo(() => [
    { value: '', label: 'Tất cả', count: allLessons.length },
    ...cms.levels.map(lv => ({
      value: lv.code,
      label: lv.code,
      count: allLessons.filter(l => l.category?.level?.code === lv.code).length,
    })),
  ], [cms.levels, allLessons]);

  // ── Status tabs ──
  const statusTabs = [
    { value: '', label: 'Tất cả', count: counts.total },
    { value: 'published', label: 'Xuất bản', count: counts.published ?? 0 },
    { value: 'draft', label: 'Nháp', count: counts.draft ?? 0 },
    { value: 'archived', label: 'Lưu trữ', count: counts.archived ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-2" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }}>
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Nội dung học tập</span>
      </nav>

      {/* ── Card 1: Filters + Toolbar ────────────────────────────────── */}
      <div className="admin-card p-0 overflow-hidden">
        {/* Row 1: Level tabs + action buttons */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <FilterTabs
            value={levelFilter}
            onChange={setLevelFilter}
            tabs={levelTabs} />
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={openCatCreate}
              className="admin-btn admin-btn--secondary text-xs px-3 py-1.5 gap-1.5 whitespace-nowrap">
              <FaPlus size={10} /> Thêm chủ đề
            </button>
            <button onClick={openLesCreate}
              className="admin-btn admin-btn--primary text-xs px-3 py-1.5 gap-1.5 whitespace-nowrap">
              <FaCirclePlus size={10} /> Thêm bài học
            </button>
          </div>
        </div>

        {/* Row 2: Skill pills + Status tabs + Search */}
        <div className="px-4 py-2 flex items-center gap-3 flex-wrap">
          {/* Skill filter */}
          <div className="flex items-center gap-0.5 flex-wrap">
            {SKILLS.map(s => (
              <button key={s.value} onClick={() => setSkillFilter(s.value)}
                className={[
                  'px-2 py-1 rounded text-[11px] transition-colors whitespace-nowrap',
                  skillFilter === s.value
                    ? 'font-semibold bg-[var(--primary-light)] text-[var(--primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]',
                ].join(' ')}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--border)' }} />

          {/* Status filter */}
          <FilterTabs
            value={statusFilter}
            onChange={setStatusFilter}
            tabs={statusTabs} />

          <div className="flex-1" />

          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm bài học, chủ đề…"
            className="m-0 p-0" />
        </div>
      </div>

      {/* ── Card 2: Table ────────────────────────────────────────────── */}
      <AdminTable<Lesson>
        columns={columns}
        data={filtered}
        rowKey={l => l.id}
        loading={lessonsLoading}
        skeletonRows={8}
        activeRowId={drawerLesson?.id}
        onRowClick={openDrawer}
        emptyTitle="Chưa có bài học nào"
        emptyDescription="Thêm bài học mới hoặc thay đổi bộ lọc để xem danh sách." />

      {/* ── Drawer ───────────────────────────────────────────────────── */}
      <LessonDetailDrawer
        lesson={drawerLesson}
        loading={drawerLoading}
        onClose={closeDrawer}
        onEdit={(les) => openLesEdit(les as unknown as Lesson)}
        onDelete={deleteLes}
        onStatusChange={drawerStatusChange}
        items={cms.items}
        itemsLoading={cms.loading.items}
        onSaveItem={drawerSaveItem}
        onDeleteItem={drawerDeleteItem}
        onQuickAdd={drawerQuickAdd}
        onInlineEdit={async (id, data) => {
          await cms.saveItem({ type: 'vocab', ...data, language: 'ja', example: '', exampleMeaning: '', order: 0 } as CmsItemForm, drawerLesson?.id ?? '', id);
        }}
        onImport={openImport}
      />

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <CategoryModal
        modal={modal as 'cat-create' | 'cat-edit' | null}
        setModal={setModal as React.Dispatch<React.SetStateAction<'cat-create' | 'cat-edit' | 'les-create' | 'les-edit' | 'item-create' | 'item-edit' | null>>}
        modalErr={modalErr}
        catForm={catForm}
        setCatForm={setCatForm}
        levels={cms.levels}
        SKILLS={CAT_SKILLS}
        saving={saving}
        saveCat={saveCat}
      />
      <LessonModal
        modal={modal as 'les-create' | 'les-edit' | null}
        setModal={setModal as React.Dispatch<React.SetStateAction<'cat-create' | 'cat-edit' | 'les-create' | 'les-edit' | 'item-create' | 'item-edit' | null>>}
        modalErr={modalErr}
        lesForm={lesForm}
        setLesForm={setLesForm}
        LESSON_TYPES={LESSON_TYPES}
        saving={saving}
        saveLes={saveLes}
        // LessonModal needs activeCatId to pick category — pass via categories list
        categories={cms.categories}
        activeCatId={cms.activeCatId}
        setActiveCatId={cms.setActiveCatId}
        levels={cms.levels}
        activeLevel={levelFilter || cms.activeLevel}
        setActiveLevel={(code: string) => {
          cms.setActiveLevel(code);
          cms.loadCategories?.();
        }}
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
        lessons={cms.lessons}
        activeLesId={cms.activeLesId}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa bài học"
        description={deleteTarget ? `Bạn có chắc muốn xóa "${deleteTarget.title}"? Hành động này không thể hoàn tác.` : ''}
        confirmLabel="Xóa"
        danger
        loading={deleting}
        onConfirm={() => deleteTarget && deleteLes(deleteTarget.id)}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20 text-sm" style={{ color: 'var(--text-muted)' }}>
        Đang tải...
      </div>
    }>
      <AdminLearningPage />
    </Suspense>
  );
}
