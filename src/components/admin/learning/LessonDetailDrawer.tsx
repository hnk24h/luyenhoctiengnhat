'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  FaXmark, FaPencil, FaTrash, FaCirclePlus, FaFileArrowUp,
  FaPlus, FaCheck, FaGripVertical, FaBookOpen, FaLayerGroup,
  FaHeadphones, FaBook, FaClipboardList, FaBoxArchive, FaCircleCheck,
} from 'react-icons/fa6';
import { AdminFormField, AdminButton, AdminModal } from '@/components/admin/ui';
import type { LearningItem } from '@/types/lesson';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DrawerLesson {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status?: string;
  order: number;
  requiredTier?: string;
  _count: { items: number };
  category: { name: string; skill: string; level: { code: string } };
  categoryId: string;
}

interface Props {
  lesson: DrawerLesson | null;
  loading: boolean;
  onClose: () => void;
  onEdit: (lesson: DrawerLesson) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  // Items
  items: LearningItem[];
  itemsLoading: boolean;
  onSaveItem: (form: ItemForm, lessonId: string, editId: string | null) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onQuickAdd: (data: { term: string; pronunciation: string; meaning: string; type: string }) => Promise<void>;
  onInlineEdit: (id: string, data: { term: string; pronunciation: string; meaning: string }) => Promise<void>;
  onImport: () => void;
}

export interface ItemForm {
  type: string; term: string; pronunciation: string; language: string;
  meaning: string; example: string; exampleMeaning: string; order: number;
}

const ITEM_BLANK: ItemForm = {
  type: 'vocab', term: '', pronunciation: '', language: 'ja',
  meaning: '', example: '', exampleMeaning: '', order: 0,
};

const ITEM_TYPES = ['vocab', 'character', 'grammar', 'example', 'phrase', 'tone', 'idiom'];

const SKILL_COLOR: Record<string, string> = {
  vocab: '#4F46E5', grammar: '#059669', grammar_reading: '#059669',
  listening: '#D97706', reading: '#0891B2', integrated: '#7C3AED', nghe: '#D97706',
};
const SKILL_ICON: Record<string, React.ReactNode> = {
  vocab: <FaBookOpen size={11} />, grammar: <FaBook size={11} />,
  grammar_reading: <FaBook size={11} />, listening: <FaHeadphones size={11} />,
  reading: <FaBook size={11} />, nghe: <FaHeadphones size={11} />,
  integrated: <FaLayerGroup size={11} />,
};
const SKILL_LABELS: Record<string, string> = {
  vocab: 'Từ vựng', grammar: 'Ngữ pháp', grammar_reading: 'Ngữ pháp & Đọc',
  listening: 'Nghe', reading: 'Đọc', nghe: 'Nghe', integrated: 'Tổng hợp',
};
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  published: { bg: '#DCFCE7', color: '#16A34A', label: 'Đã xuất bản' },
  draft:     { bg: '#FEF3C7', color: '#CA8A04', label: 'Nháp' },
  archived:  { bg: '#F3F4F6', color: '#6B7280', label: 'Lưu trữ' },
};
const TIER_LABELS: Record<string, string> = { free: 'Miễn phí', basic: 'Cơ bản', premium: 'Premium' };

// ─── Quick Add Row ─────────────────────────────────────────────────────────────

function QuickAddRow({ onAdd }: { onAdd: (d: { term: string; pronunciation: string; meaning: string; type: string }) => Promise<void> }) {
  const [term, setTerm] = useState('');
  const [pron, setPron] = useState('');
  const [meaning, setMeaning] = useState('');
  const [saving, setSaving] = useState(false);
  const termRef = useRef<HTMLInputElement>(null);

  async function submit() {
    if (!term.trim() || !meaning.trim()) return;
    setSaving(true);
    try {
      await onAdd({ term: term.trim(), pronunciation: pron.trim(), meaning: meaning.trim(), type: 'vocab' });
      setTerm(''); setPron(''); setMeaning('');
      termRef.current?.focus();
    } finally { setSaving(false); }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    if (e.key === 'Escape') { setTerm(''); setPron(''); setMeaning(''); }
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed" style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}>
      <input ref={termRef} value={term} onChange={e => setTerm(e.target.value)} onKeyDown={onKey}
        className="input text-xs py-1 px-2 flex-[2] min-w-0 font-bold" placeholder="漢字"
        style={{ fontFamily: '"Noto Sans JP", serif' }} />
      <input value={pron} onChange={e => setPron(e.target.value)} onKeyDown={onKey}
        className="input text-xs py-1 px-2 flex-[2] min-w-0" placeholder="よみかた"
        style={{ fontFamily: '"Noto Sans JP", serif' }} />
      <input value={meaning} onChange={e => setMeaning(e.target.value)} onKeyDown={onKey}
        className="input text-xs py-1 px-2 flex-[3] min-w-0" placeholder="Nghĩa..." />
      <button onClick={submit} disabled={saving || !term.trim() || !meaning.trim()}
        className="p-1.5 rounded bg-blue-500 text-white disabled:opacity-40 hover:bg-blue-600 transition shrink-0">
        {saving
          ? <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin block" />
          : <FaPlus size={10} />}
      </button>
    </div>
  );
}

// ─── Item Row ──────────────────────────────────────────────────────────────────

function ItemRow({ item, onEdit, onDeleteRequest }: {
  item: LearningItem;
  onEdit: (item: LearningItem) => void;
  onDeleteRequest: (item: LearningItem) => void;
}) {
  const meaning = item.meanings?.[0]?.meaning ?? '—';

  return (
    <div className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
      <FaGripVertical size={10} className="text-[var(--text-muted)] shrink-0 opacity-40" />
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="font-bold text-sm shrink-0" style={{ fontFamily: '"Noto Sans JP", serif', color: 'var(--text-primary)' }}>
          {item.term}
        </span>
        {item.pronunciation && (
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.pronunciation}</span>
        )}
        <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{meaning}</span>
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
        {item.type}
      </span>
      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
        <button onClick={() => onEdit(item)}
          className="p-1 rounded hover:bg-blue-100 text-blue-600 transition" title="Sửa">
          <FaPencil size={9} />
        </button>
        <button onClick={() => onDeleteRequest(item)}
          className="p-1 rounded hover:bg-red-100 text-red-500 transition" title="Xóa">
          <FaTrash size={9} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Drawer ───────────────────────────────────────────────────────────────

export function LessonDetailDrawer({
  lesson, loading, onClose, onEdit, onDelete, onStatusChange,
  items, itemsLoading, onSaveItem, onDeleteItem, onQuickAdd, onInlineEdit, onImport,
}: Props) {
  const [statusSaving, setStatusSaving] = useState(false);
  const [itemModal, setItemModal] = useState<'create' | 'edit' | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>({ ...ITEM_BLANK });
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [itemErr, setItemErr] = useState('');
  const [savingItem, setSavingItem] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LearningItem | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);

  if (!lesson && !loading) return null;

  function openItemCreate() {
    setItemForm({ ...ITEM_BLANK });
    setEditItemId(null); setItemErr(''); setItemModal('create');
  }
  function openItemEdit(item: LearningItem) {
    setItemForm({
      type: item.type, term: item.term, pronunciation: item.pronunciation ?? '',
      language: item.language, meaning: item.meanings?.[0]?.meaning ?? '',
      example: item.examples?.[0]?.exampleText ?? '',
      exampleMeaning: item.examples?.[0]?.translation ?? '', order: item.order,
    });
    setEditItemId(item.id); setItemErr(''); setItemModal('edit');
  }
  async function submitItem() {
    if (!lesson) return;
    setSavingItem(true); setItemErr('');
    try {
      await onSaveItem(itemForm, lesson.id, editItemId);
      setItemModal(null);
    } catch (e) {
      setItemErr(e instanceof Error ? e.message : 'Lỗi khi lưu');
    } finally { setSavingItem(false); }
  }
  async function handleDeleteItem(id: string) {
    await onDeleteItem(id);
  }
  async function confirmDeleteItem() {
    if (!deleteTarget) return;
    setDeletingItem(true);
    try { await onDeleteItem(deleteTarget.id); }
    finally {
      setDeletingItem(false);
      setDeleteTarget(null);
    }
  }
  async function handleStatusChange(status: string) {
    if (!lesson) return;
    setStatusSaving(true);
    try { await onStatusChange(lesson.id, status); }
    finally { setStatusSaving(false); }
  }

  const skill = lesson?.category?.skill ?? '';
  const skillColor = SKILL_COLOR[skill] ?? '#4F46E5';
  const statusStyle = STATUS_STYLES[lesson?.status ?? 'draft'] ?? STATUS_STYLES.draft;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={onClose} aria-hidden />

      {/* Drawer */}
      <aside
        role="dialog" aria-modal aria-label="Chi tiết bài học"
        className="fixed right-0 top-0 h-full w-[920px] max-w-full z-50 flex flex-col overflow-hidden"
        style={{ background: 'var(--bg-surface)', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Chi tiết bài học
          </h2>
          <div className="flex items-center gap-2">
            {lesson && (
              <>
                <button onClick={() => onEdit(lesson)}
                  className="admin-btn admin-btn--secondary text-xs py-1 px-2.5">
                  <FaPencil size={10} className="mr-1" /> Sửa
                </button>
                <button onClick={() => { if (confirm('Xóa bài học này?')) onDelete(lesson.id); }}
                  className="admin-btn text-xs py-1 px-2 text-red-600 hover:bg-red-50 border border-red-200">
                  <FaTrash size={10} />
                </button>
              </>
            )}
            <button onClick={onClose} className="px-1 text-xl leading-none hover:opacity-70"
              style={{ color: 'var(--text-muted)' }} aria-label="Đóng">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <span className="animate-spin text-2xl" style={{ color: 'var(--primary)' }}>⟳</span>
            </div>
          )}
          {lesson && !loading && (
            <div className="flex flex-col gap-0">
              {/* Lesson metadata */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                {/* Level + Skill + Category breadcrumb */}
                <div className="flex items-center gap-1.5 text-[10px] mb-2.5" style={{ color: 'var(--text-muted)' }}>
                  <span className="px-1.5 py-0.5 rounded font-bold"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {lesson.category.level.code}
                  </span>
                  <span>›</span>
                  <span className="flex items-center gap-1" style={{ color: skillColor }}>
                    {SKILL_ICON[skill] ?? <FaClipboardList size={10} />}
                    {SKILL_LABELS[skill] ?? skill}
                  </span>
                  <span>›</span>
                  <span className="truncate max-w-[140px]">{lesson.category.name}</span>
                </div>

                {/* Title */}
                <h3 className="font-bold leading-snug mb-2" style={{ fontSize: 16, color: 'var(--text-primary)' }}>
                  {lesson.title}
                </h3>
                {lesson.description && (
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {lesson.description}
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status selector */}
                  <div className="relative">
                    <select
                      value={lesson.status ?? 'draft'}
                      onChange={e => handleStatusChange(e.target.value)}
                      disabled={statusSaving}
                      className="text-[11px] font-semibold pl-2 pr-6 py-0.5 rounded-full border-0 appearance-none cursor-pointer"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      <option value="published">Đã xuất bản</option>
                      <option value="draft">Nháp</option>
                      <option value="archived">Lưu trữ</option>
                    </select>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    {lesson.type}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    {TIER_LABELS[lesson.requiredTier ?? 'free'] ?? lesson.requiredTier}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${skillColor}15`, color: skillColor }}>
                    {items.length} mục
                  </span>
                </div>
              </div>

              {/* Items section */}
              <div className="px-5 py-3">
                {/* Items header */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Danh sách mục ({itemsLoading ? '…' : items.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={onImport}
                      className="admin-btn admin-btn--secondary text-[11px] py-0.5 px-2 gap-1">
                      <FaFileArrowUp size={9} /> Import
                    </button>
                    <button onClick={openItemCreate}
                      className="admin-btn admin-btn--primary text-[11px] py-0.5 px-2 gap-1">
                      <FaCirclePlus size={9} /> Thêm
                    </button>
                  </div>
                </div>

                {/* Quick add */}
                <div className="mb-2.5">
                  <QuickAddRow onAdd={onQuickAdd} />
                </div>

                {/* Items list */}
                {itemsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="animate-spin text-xl" style={{ color: 'var(--primary)' }}>⟳</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <FaClipboardList size={24} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa có mục nào. Thêm qua form bên trên.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {items.map(item => (
                      <ItemRow key={item.id} item={item}
                        onEdit={openItemEdit}
                        onDeleteRequest={setDeleteTarget} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Item modal */}
      {itemModal && (
        <AdminModal
          open
          onClose={() => setItemModal(null)}
          title={itemModal === 'create' ? 'Thêm mục mới' : 'Sửa mục'}
          size="md"
          footer={
            <div className="flex gap-3">
              <AdminButton variant="secondary" className="flex-1" onClick={() => setItemModal(null)}>Hủy</AdminButton>
              <AdminButton variant="primary" className="flex-1" onClick={submitItem} disabled={savingItem} loading={savingItem} icon={<FaCheck size={12} />}>
                Lưu
              </AdminButton>
            </div>
          }
        >
          {itemErr && (
            <div className="mb-3 px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>{itemErr}</div>
          )}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <AdminFormField label="Loại mục">
                <select className="input w-full text-sm" value={itemForm.type} onChange={e => setItemForm(f => ({ ...f, type: e.target.value }))}>
                  {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </AdminFormField>
              <AdminFormField label="Ngôn ngữ">
                <select className="input w-full text-sm" value={itemForm.language} onChange={e => setItemForm(f => ({ ...f, language: e.target.value }))}>
                  <option value="ja">Japonese (ja)</option>
                  <option value="zh">Chinese (zh)</option>
                  <option value="ko">Korean (ko)</option>
                  <option value="vi">Vietnamese (vi)</option>
                </select>
              </AdminFormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AdminFormField label="Từ / Ký tự" required>
                <input className="input w-full" placeholder="VD: 家族" value={itemForm.term}
                  onChange={e => setItemForm(f => ({ ...f, term: e.target.value }))}
                  style={{ fontFamily: '"Noto Sans JP", serif' }} />
              </AdminFormField>
              <AdminFormField label="Phiên âm">
                <input className="input w-full" placeholder="VD: かぞく" value={itemForm.pronunciation}
                  onChange={e => setItemForm(f => ({ ...f, pronunciation: e.target.value }))}
                  style={{ fontFamily: '"Noto Sans JP", serif' }} />
              </AdminFormField>
            </div>
            <AdminFormField label="Nghĩa" required>
              <input className="input w-full" placeholder="VD: Gia đình" value={itemForm.meaning}
                onChange={e => setItemForm(f => ({ ...f, meaning: e.target.value }))} />
            </AdminFormField>
            <AdminFormField label="Ví dụ">
              <input className="input w-full" placeholder="VD: 家族と旅行する。" value={itemForm.example}
                onChange={e => setItemForm(f => ({ ...f, example: e.target.value }))}
                style={{ fontFamily: '"Noto Sans JP", serif' }} />
            </AdminFormField>
            <AdminFormField label="Dịch ví dụ">
              <input className="input w-full" placeholder="VD: Đi du lịch cùng gia đình." value={itemForm.exampleMeaning}
                onChange={e => setItemForm(f => ({ ...f, exampleMeaning: e.target.value }))} />
            </AdminFormField>
          </div>
        </AdminModal>
      )}

      {/* Delete item confirm dialog */}
      {deleteTarget && (
        <AdminModal
          open
          onClose={() => !deletingItem && setDeleteTarget(null)}
          title="Xác nhận xóa"
          size="sm"
          footer={
            <div className="flex gap-3">
              <AdminButton variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={deletingItem}>Hủy</AdminButton>
              <AdminButton variant="danger" className="flex-1" onClick={confirmDeleteItem} disabled={deletingItem} loading={deletingItem} icon={<FaTrash size={12} />}>
                Xóa
              </AdminButton>
            </div>
          }
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Bạn có chắc chắn muốn xóa mục này?
          </p>
          <div className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: 'var(--bg-muted)' }}>
            <span className="font-bold text-sm" style={{ fontFamily: '"Noto Sans JP", serif', color: 'var(--text-primary)' }}>{deleteTarget.term}</span>
            {deleteTarget.pronunciation && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{deleteTarget.pronunciation}</span>
            )}
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{deleteTarget.meanings?.[0]?.meaning ?? ''}</span>
          </div>
          <p className="mt-2 text-xs" style={{ color: '#DC2626' }}>Hành động này không thể hoàn tác.</p>
        </AdminModal>
      )}
    </>
  );
}
