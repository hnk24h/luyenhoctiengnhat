'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaUsers, FaArrowLeft, FaMagnifyingGlass, FaTrash, FaPencil,
  FaCheck, FaXmark, FaChevronLeft, FaChevronRight, FaShield,
  FaUser, FaEye, FaCircleExclamation, FaArrowsRotate, FaUserPlus, FaLock,
} from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { sessions: number; progress: number; savedWords: number; flashcardDecks: number };
}

interface UserDetail extends UserRow {
  _count: { sessions: number; progress: number; savedWords: number; flashcardDecks: number; lessonProgress: number };
  sessions: {
    id: string; score: number | null; totalQ: number; correctQ: number;
    startedAt: string; finishedAt: string | null;
    examSet: { title: string; skill: string; level: { code: string } };
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin' || role === 'ADMIN';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={isAdmin
        ? { background: '#dbeafe', color: '#1d4ed8' }
        : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
      {isAdmin ? <FaShield size={9} /> : <FaUser size={9} />}
      {isAdmin ? 'Admin' : 'User'}
    </span>
  );
}

function fmt(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDatetime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ── List state ──
  const [users, setUsers]         = useState<UserRow[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Detail drawer ──
  const [detail, setDetail]       = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Edit modal ──
  const [editUser, setEditUser]   = useState<UserRow | null>(null);
  const [editName, setEditName]   = useState('');
  const [editRole, setEditRole]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [editErr, setEditErr]     = useState('');

  // ── Create modal ──
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [createErr, setCreateErr]   = useState('');
  const [creating, setCreating]     = useState(false);

  // ── Delete confirm ──
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting]   = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'admin' && role !== 'ADMIN') router.push('/');
    }
  }, [status, session, router]);

  // ── Load users ──
  const loadUsers = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Search debounce ──
  const handleSearch = (v: string) => {
    setSearch(v); setPage(1);
    clearTimeout(searchTimer.current);
  };

  // ── Load detail ──
  const openDetail = async (user: UserRow) => {
    setDetail(null); setDetailLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`);
    if (res.ok) setDetail(await res.json());
    setDetailLoading(false);
  };

  // ── Save edit ──
  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true); setEditErr('');
    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, role: editRole }),
    });
    if (!res.ok) {
      const e = await res.json(); setEditErr(e.error ?? 'Lỗi'); setSaving(false); return;
    }
    setSaving(false); setEditUser(null);
    loadUsers();
  };

  // ── Create ──
  const saveCreate = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setCreateErr('Vui lòng điền đầy đủ thông tin'); return;
    }
    setCreating(true); setCreateErr('');
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    });
    if (!res.ok) {
      const e = await res.json(); setCreateErr(e.error ?? 'Lỗi'); setCreating(false); return;
    }
    setCreating(false); setCreateOpen(false);
    setCreateForm({ name: '', email: '', password: '', role: 'user' });
    setPage(1); loadUsers(1);
  };

  // ── Delete ──
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false); setDeleteTarget(null);
    if (res.ok) {
      if (detail?.id === deleteTarget.id) setDetail(null);
      loadUsers();
    }
  };

  const selfId = (session?.user as any)?.id;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="btn-ghost p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <FaArrowLeft size={14} />
        </Link>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ede9fe', color: '#7c3aed' }}>
          <FaUsers size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-base)' }}>Quản lý người dùng</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tổng cộng {total} tài khoản</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FaMagnifyingGlass size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input w-full pl-8 text-sm" placeholder="Tìm theo tên hoặc email..."
            value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['', 'user', 'admin'] as const).map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
              style={roleFilter === r
                ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }
                : { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
              {r === '' ? 'Tất cả' : r === 'admin' ? 'Admin' : 'User'}
            </button>
          ))}
          <button onClick={() => loadUsers()} className="btn-ghost p-2 rounded-xl" title="Làm mới">
            <FaArrowsRotate size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
          <button onClick={() => { setCreateOpen(true); setCreateErr(''); setCreateForm({ name: '', email: '', password: '', role: 'user' }); }}
            className="btn-primary flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <FaUserPlus size={12} /> Thêm người dùng
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>Người dùng</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>Quyền</th>
                <th className="px-4 py-3 text-center font-semibold hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Lượt thi</th>
                <th className="px-4 py-3 text-center font-semibold hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Đã lưu</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>Ngày tạo</th>
                <th className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                  <span className="inline-block w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                  Không tìm thấy người dùng nào
                </td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-t transition-colors hover:bg-gray-50/60 group"
                  style={{ borderColor: 'var(--border)' }}>

                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate max-w-[160px]" style={{ color: 'var(--text-base)' }}>{u.name}</div>
                        <div className="text-xs truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>

                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="font-semibold" style={{ color: 'var(--text-base)' }}>{u._count.sessions}</span>
                  </td>

                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u._count.savedWords} từ</span>
                  </td>

                  <td className="px-4 py-3 hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>
                    {fmt(u.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openDetail(u)} title="Xem chi tiết"
                        className="btn-ghost p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaEye size={13} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <button onClick={() => { setEditUser(u); setEditName(u.name); setEditRole(u.role); setEditErr(''); }}
                        title="Chỉnh sửa"
                        className="btn-ghost p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaPencil size={13} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <button
                        disabled={u.id === selfId}
                        onClick={() => setDeleteTarget(u)}
                        title={u.id === selfId ? 'Không thể xóa chính mình' : 'Xóa'}
                        className="btn-ghost p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ opacity: u.id === selfId ? 0.3 : undefined }}>
                        <FaTrash size={13} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Trang {page} / {totalPages} — {total} người dùng
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-ghost p-1.5 rounded-lg disabled:opacity-30">
                <FaChevronLeft size={12} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className="min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-all"
                    style={pg === page
                      ? { background: 'var(--primary)', color: 'white' }
                      : { color: 'var(--text-muted)' }}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-ghost p-1.5 rounded-lg disabled:opacity-30">
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Modal ──────────────────────────────────────────────────────── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setCreateOpen(false)}>
          <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                  <FaUserPlus size={15} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>Thêm người dùng mới</h2>
              </div>
              <button onClick={() => setCreateOpen(false)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
            </div>

            {createErr && (
              <div className="mb-4 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <FaCircleExclamation size={13} />{createErr}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Tên hiển thị *</label>
                <input className="input w-full" placeholder="Nguyễn Văn A"
                  value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Email *</label>
                <input className="input w-full" type="email" placeholder="user@example.com"
                  value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>
                  <FaLock size={10} /> Mật khẩu *
                </label>
                <input className="input w-full" type="password" placeholder="Tối thiểu 6 ký tự"
                  value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Quyền hạn</label>
                <div className="flex gap-2">
                  {['user', 'admin'].map(r => (
                    <button key={r} onClick={() => setCreateForm(f => ({ ...f, role: r }))}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2"
                      style={createForm.role === r
                        ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }
                        : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      {r === 'admin' ? <FaShield size={12} /> : <FaUser size={12} />}
                      {r === 'admin' ? 'Admin' : 'User'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setCreateOpen(false)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={saveCreate} disabled={creating}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {creating
                  ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <FaCheck size={12} />}
                Tạo tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setEditUser(null)}>
          <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>Chỉnh sửa tài khoản</h2>
              <button onClick={() => setEditUser(null)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
            </div>
            <div className="flex items-center gap-3 mb-5 px-3 py-3 rounded-xl" style={{ background: 'var(--bg-muted)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {editUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--text-base)' }}>{editUser.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{editUser.email}</div>
              </div>
            </div>

            {editErr && (
              <div className="mb-4 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <FaCircleExclamation size={13} />{editErr}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Tên hiển thị</label>
                <input className="input w-full" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Quyền hạn</label>
                {editUser.id === selfId ? (
                  <div className="px-3 py-2 rounded-xl text-sm" style={{ background: '#FEF3C7', color: '#92400E' }}>
                    Không thể thay đổi quyền của chính mình
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {['user', 'admin'].map(r => (
                      <button key={r} onClick={() => setEditRole(r)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2"
                        style={editRole === r
                          ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }
                          : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        {r === 'admin' ? <FaShield size={12} /> : <FaUser size={12} />}
                        {r === 'admin' ? 'Admin' : 'User'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditUser(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={saveEdit} disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving
                  ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <FaCheck size={12} />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setDeleteTarget(null)}>
          <div className="card w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#FEE2E2' }}>
              <FaTrash size={22} style={{ color: '#DC2626' }} />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-base)' }}>Xóa tài khoản?</h2>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              Tài khoản <strong>{deleteTarget.name}</strong> sẽ bị xóa vĩnh viễn.
            </p>
            <p className="text-xs mb-5" style={{ color: '#DC2626' }}>
              Toàn bộ lịch sử thi, tiến độ học và từ đã lưu sẽ mất.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: '#DC2626' }}>
                {deleting
                  ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <FaTrash size={12} />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Drawer ─────────────────────────────────────────────────────── */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-40 flex justify-end"
          style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => { setDetail(null); }}>
          <div className="h-full w-full max-w-md overflow-y-auto card rounded-none shadow-2xl"
            style={{ borderRadius: 0 }} onClick={e => e.stopPropagation()}>

            <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b z-10"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h2 className="font-bold" style={{ color: 'var(--text-base)' }}>Chi tiết người dùng</h2>
              <button onClick={() => setDetail(null)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center h-64">
                <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : detail && (
              <div className="p-5 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {detail.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-lg" style={{ color: 'var(--text-base)' }}>{detail.name}</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{detail.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <RoleBadge role={detail.role} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tham gia {fmt(detail.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Lượt thi', value: detail._count.sessions },
                    { label: 'Từ đã lưu', value: detail._count.savedWords },
                    { label: 'Bài học', value: detail._count.lessonProgress },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-muted)' }}>
                      <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{s.value}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDetail(null); setEditUser(detail); setEditName(detail.name); setEditRole(detail.role); setEditErr(''); }}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                    <FaPencil size={12} /> Chỉnh sửa
                  </button>
                  {detail.id !== selfId && (
                    <button
                      onClick={() => { setDetail(null); setDeleteTarget(detail); }}
                      className="flex-1 flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-xl font-semibold"
                      style={{ background: '#FEE2E2', color: '#DC2626' }}>
                      <FaTrash size={12} /> Xóa
                    </button>
                  )}
                </div>

                {/* Recent sessions */}
                {detail.sessions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-base)' }}>
                      Lịch sử thi gần đây
                    </h3>
                    <div className="space-y-2">
                      {detail.sessions.map(s => (
                        <div key={s.id} className="rounded-xl px-3 py-2.5 border" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-base)' }}>
                                [{s.examSet.level.code}] {s.examSet.title}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {fmtDatetime(s.startedAt)}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold text-sm" style={{ color: s.score !== null && s.score >= 70 ? '#16a34a' : '#DC2626' }}>
                                {s.score !== null ? `${Math.round(s.score)}%` : '—'}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {s.correctQ}/{s.totalQ}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
