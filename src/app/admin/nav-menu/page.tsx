'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaPlus, FaSeedling, FaToggleOn, FaToggleOff,
  FaArrowUp, FaArrowDown, FaPencil, FaTrash, FaXmark, FaCheck,
  FaLayerGroup, FaChevronDown, FaMagnifyingGlass, FaFilter,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import { ICON_OPTIONS, ICON_REGISTRY } from '@/lib/nav-icons';

// --- Types ---

interface NavItem {
  id: string;
  lang: string;
  href: string;
  labelKey: string;
  label?: string | null;
  iconName: string;
  sortOrder: number;
  isPrimary: boolean;
  enabled: boolean;
  authRequired: boolean;
}

const LANGS = [
  { value: 'ja',  label: '🇯🇵 JLPT' },
  { value: 'zh',  label: '🇨🇳 HSK' },
  { value: 'pmp', label: '📊 PMP' },
];

const EMPTY: Omit<NavItem, 'id'> = {
  lang: 'ja', href: '', labelKey: '', iconName: 'FaBookOpen',
  sortOrder: 0, isPrimary: false, enabled: true, authRequired: false,
};

// --- Helpers ---

function IconPreview({ name, size = 14 }: { name: string; size?: number }) {
  const Icon = ICON_REGISTRY[name];
  return Icon ? <Icon size={size} /> : null;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="text-xl transition-colors"
      style={{ color: value ? 'var(--primary)' : 'var(--text-muted)' }}
    >
      {value ? <FaToggleOn /> : <FaToggleOff />}
    </button>
  );
}

// --- Confirm Delete Dialog ---

function ConfirmDialog({
  item,
  onConfirm,
  onCancel,
}: {
  item: NavItem;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: '#FEE2E2', color: '#DC2626' }}
          >
            <FaTriangleExclamation size={16} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Xoá menu item?
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Mục <strong>{item.labelKey}</strong> ({item.href}) sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:bg-[var(--bg-muted)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: '#DC2626', color: '#fff' }}
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Create / Edit Drawer ---

function EditDrawer({
  item,
  defaultLang,
  onSave,
  onClose,
}: {
  item: Partial<NavItem> | null;
  defaultLang: string;
  onSave: (data: Partial<NavItem>) => Promise<void>;
  onClose: () => void;
}) {
  const isNew = !item?.id;
  const [form, setForm] = useState<Partial<NavItem>>(() => ({
    ...EMPTY,
    lang: defaultLang,
    ...(item ?? {}),
  }));
  const [saving, setSaving] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof NavItem, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.href?.trim() || !form.labelKey?.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col shadow-2xl"
        style={{
          width: 420,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="admin-icon-box"><FaLayerGroup size={13} /></div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {isNew ? 'Thêm menu item' : 'Chỉnh sửa menu item'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {isNew ? 'Tạo mục điều hướng mới' : `Sửa: ${item?.href}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-[var(--bg-muted)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <FaXmark size={13} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Lang */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Ngôn ngữ / Subject
            </label>
            <select
              value={form.lang}
              onChange={e => set('lang', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            >
              {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          {/* Href */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Href (đường dẫn)
            </label>
            <input
              value={form.href ?? ''}
              onChange={e => set('href', e.target.value)}
              placeholder="/ja/vocab"
              className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Ví dụ: /ja/vocab, /zh/listening</p>
          </div>

          {/* Label key */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Label key (i18n)
            </label>
            <input
              value={form.labelKey ?? ''}
              onChange={e => set('labelKey', e.target.value)}
              placeholder="vocab"
              className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Key trong file i18n, ví dụ: vocab, listening, grammar</p>
          </div>

          {/* Label override */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Tên hiển thị (ghi đè)
            </label>
            <input
              value={form.label ?? ''}
              onChange={e => set('label', e.target.value || null)}
              placeholder="VD: Bài học, Từ vựng JLPT N3..."
              className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Nếu điền, tên này sẽ hiện trên navbar thay cho bản dịch i18n. Để trống = dùng bản dịch mặc định.
            </p>
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Icon
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIconOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm border"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                <span className="flex items-center gap-2">
                  <IconPreview name={form.iconName ?? 'FaBookOpen'} />
                  <span>{form.iconName}</span>
                </span>
                <FaChevronDown size={9} style={{ opacity: 0.5 }} />
              </button>
              {iconOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 rounded-2xl border p-2.5 z-10 max-h-44 overflow-y-auto"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                >
                  <div className="grid grid-cols-6 gap-1">
                    {ICON_OPTIONS.map(name => (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => { set('iconName', name); setIconOpen(false); }}
                        className="flex items-center justify-center p-2 rounded-lg transition-all hover:scale-110"
                        style={{
                          background: form.iconName === name
                            ? 'color-mix(in srgb, var(--primary) 15%, var(--bg-muted))'
                            : 'var(--bg-muted)',
                          color: form.iconName === name ? 'var(--primary)' : 'var(--text-secondary)',
                        }}
                      >
                        <IconPreview name={name} size={13} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sort order */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Thứ tự (sort order)
            </label>
            <input
              type="number"
              value={form.sortOrder ?? 0}
              onChange={e => set('sortOrder', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Tuỳ chọn
            </label>
            {([
              ['isPrimary',    'Hiển thị trên navbar (primary)',     'Mục sẽ nằm thẳng trên thanh điều hướng desktop'],
              ['enabled',      'Bật / Active',                        'Tắt để ẩn mục khỏi navbar mà không xoá'],
              ['authRequired', 'Yêu cầu đăng nhập',                  'Ẩn mục với người dùng chưa đăng nhập'],
            ] as const).map(([key, label, hint]) => (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
              >
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{hint}</p>
                </div>
                <Toggle value={!!(form as Record<string, unknown>)[key]} onChange={v => set(key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Drawer footer */}
        <div
          className="flex gap-2 px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-[var(--bg-muted)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.href?.trim() || !form.labelKey?.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            {saving
              ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              : <FaCheck size={11} />
            }
            {saving ? 'Đang lưu…' : (isNew ? 'Tạo mới' : 'Lưu thay đổi')}
          </button>
        </div>
      </div>
    </>
  );
}

// --- Main page ---

export default function NavMenuAdminPage() {
  const [lang, setLang] = useState('ja');
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [search, setSearch] = useState('');
  const [filterPrimary, setFilterPrimary] = useState<'all' | 'primary' | 'explore'>('all');

  // null = drawer closed; {} = new item; NavItem = edit
  const [drawerItem, setDrawerItem] = useState<Partial<NavItem> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NavItem | null>(null);

  const load = useCallback(async (l: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/nav-menu?lang=${l}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(lang); }, [lang, load]);

  // Seed
  async function handleSeed() {
    setSeeding(true);
    const res = await fetch('/api/admin/nav-menu/seed', { method: 'POST' });
    const data = await res.json();
    setSeeding(false);
    load(lang);
    alert(`Seed xong: +${data.created} mới, ${data.skipped} đã có`);
  }

  // Toggle helpers
  async function patchItem(id: string, patch: Partial<NavItem>) {
    await fetch(`/api/admin/nav-menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }

  // Move order
  async function moveItem(idx: number, dir: -1 | 1) {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    const updated = next.map((it, i) => ({ ...it, sortOrder: i }));
    setItems(updated);
    await Promise.all(
      updated.map(it =>
        fetch(`/api/admin/nav-menu/${it.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: it.sortOrder }),
        })
      )
    );
  }

  // Save from drawer
  async function handleSave(data: Partial<NavItem>) {
    // Normalize label: empty string → null so API receives it and can clear the override
    const payload = { ...data, label: data.label || null };
    if (payload.id) {
      await fetch(`/api/admin/nav-menu/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/nav-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, lang }),
      });
    }
    setDrawerItem(null);
    load(lang);
  }

  // Delete
  async function handleDelete(id: string) {
    await fetch(`/api/admin/nav-menu/${id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  // Filtered list
  const filtered = items.filter(item => {
    const matchSearch = !search
      || item.href.toLowerCase().includes(search.toLowerCase())
      || item.labelKey.toLowerCase().includes(search.toLowerCase());
    const matchPrimary = filterPrimary === 'all'
      || (filterPrimary === 'primary' && item.isPrimary)
      || (filterPrimary === 'explore' && !item.isPrimary);
    return matchSearch && matchPrimary;
  });

  return (
    <div className="min-h-full space-y-4" style={{ background: 'var(--admin-bg-base)' }}>

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="admin-icon-box w-10 h-10">
            <FaLayerGroup size={16} />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Quản lý Menu điều hướng
            </h1>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Thêm, xoá, bật/tắt, sắp xếp các mục trên navbar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="admin-btn admin-btn--ghost gap-1.5 px-3.5 py-2 text-[12px] rounded-xl"
          >
            <FaSeedling size={12} /> {seeding ? 'Đang seed…' : 'Seed mặc định'}
          </button>
          <button
            onClick={() => setDrawerItem({ lang })}
            className="admin-btn admin-btn--primary gap-1.5 px-3.5 py-2 text-[12px] rounded-xl"
          >
            <FaPlus size={11} /> Thêm mục
          </button>
        </div>
      </div>

      {/* Card 1: Filters */}
      <div className="admin-card p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Lang tabs */}
          <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--bg-muted)' }}>
            {LANGS.map(l => (
              <button
                key={l.value}
                onClick={() => setLang(l.value)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  background: lang === l.value ? 'var(--bg-surface)' : 'transparent',
                  color: lang === l.value ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: lang === l.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 h-9 rounded-xl flex-1 min-w-[180px]"
            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
          >
            <FaMagnifyingGlass size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo href, label key…"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}>
                <FaXmark size={10} />
              </button>
            )}
          </div>

          {/* Primary filter */}
          <div className="flex gap-1">
            {([
              ['all',     'Tất cả'],
              ['primary', '⬛ Primary'],
              ['explore', '☰ Explore'],
            ] as const).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setFilterPrimary(val)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all"
                style={{
                  background: filterPrimary === val
                    ? 'color-mix(in srgb, var(--primary) 12%, var(--bg-surface))'
                    : 'var(--bg-muted)',
                  color: filterPrimary === val ? 'var(--primary)' : 'var(--text-muted)',
                  borderColor: filterPrimary === val
                    ? 'color-mix(in srgb, var(--primary) 35%, transparent)'
                    : 'transparent',
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> / {items.length} mục
          </span>
          <span>•</span>
          <span><strong style={{ color: 'var(--primary)' }}>{items.filter(i => i.isPrimary).length}</strong> primary</span>
          <span>•</span>
          <span><strong style={{ color: '#10B981' }}>{items.filter(i => i.enabled).length}</strong> bật</span>
          <span>•</span>
          <span><strong style={{ color: 'var(--text-muted)' }}>{items.filter(i => !i.enabled).length}</strong> tắt</span>
        </div>
      </div>

      {/* Card 2: Items list */}
      <div className="admin-card overflow-hidden">

        {/* Table head */}
        <div
          className="grid gap-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider border-b"
          style={{
            gridTemplateColumns: '2rem 1fr 1fr 8rem 5rem 5rem 5rem 5.5rem',
            background: 'var(--bg-muted)',
            color: 'var(--text-muted)',
            borderColor: 'var(--border)',
          }}
        >
          <span>#</span>
          <span>Href</span>
          <span>Label key</span>
          <span>Icon</span>
          <span>Primary</span>
          <span>Bật</span>
          <span>Login</span>
          <span>Thao tác</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="animate-spin w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <FaFilter size={24} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {items.length === 0
                ? 'Chưa có dữ liệu. Nhấn Seed mặc định để tạo.'
                : 'Không tìm thấy mục nào phù hợp.'}
            </p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={item.id}
              className="grid gap-3 px-4 py-3 items-center text-[13px] transition-colors hover:bg-[var(--bg-muted)]"
              style={{
                gridTemplateColumns: '2rem 1fr 1fr 8rem 5rem 5rem 5rem 5.5rem',
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : undefined,
                opacity: item.enabled ? 1 : 0.5,
              }}
            >
              {/* Order arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveItem(items.indexOf(item), -1)}
                  disabled={items.indexOf(item) === 0}
                  className="hover:opacity-80 disabled:opacity-20"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <FaArrowUp size={9} />
                </button>
                <button
                  onClick={() => moveItem(items.indexOf(item), 1)}
                  disabled={items.indexOf(item) === items.length - 1}
                  className="hover:opacity-80 disabled:opacity-20"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <FaArrowDown size={9} />
                </button>
              </div>

              {/* Href */}
              <span className="font-mono text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                {item.href}
              </span>

              {/* Label key */}
              <span className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {item.labelKey}
              </span>

              {/* Icon */}
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <IconPreview name={item.iconName} />
                <span className="text-[11px] truncate">{item.iconName.replace('Fa', '')}</span>
              </span>

              {/* Primary */}
              <Toggle
                value={item.isPrimary}
                onChange={() => patchItem(item.id, { isPrimary: !item.isPrimary })}
              />

              {/* Enabled */}
              <Toggle
                value={item.enabled}
                onChange={() => patchItem(item.id, { enabled: !item.enabled })}
              />

              {/* Auth required */}
              <span
                className="text-[11px]"
                style={{ color: item.authRequired ? '#F59E0B' : 'var(--text-muted)' }}
              >
                {item.authRequired ? '🔒 Login' : '—'}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDrawerItem(item)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:scale-110"
                  style={{
                    background: 'color-mix(in srgb, var(--primary) 10%, var(--bg-muted))',
                    color: 'var(--primary)',
                  }}
                  title="Chỉnh sửa"
                >
                  <FaPencil size={11} />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:scale-110"
                  style={{ background: '#FEE2E2', color: '#DC2626' }}
                  title="Xoá"
                >
                  <FaTrash size={11} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <p className="text-[11px] pb-2" style={{ color: 'var(--text-muted)' }}>
        ✦ <strong>Primary</strong> = hiển thị thẳng trên navbar desktop.
        Items không primary sẽ nằm trong dropdown Khám phá.
        Thay đổi có hiệu lực sau tối đa 5 phút (cache) hoặc reload trang.
      </p>

      {/* Drawer */}
      {drawerItem !== null && (
        <EditDrawer
          key={drawerItem.id ?? 'new'}
          item={drawerItem}
          defaultLang={lang}
          onSave={handleSave}
          onClose={() => setDrawerItem(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          item={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
