'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  UserRow, UserDetail, UserListSummary,
  UserCreateInput, UserUpdateInput,
} from '@/types/admin/user';
import {
  listUsers, getUserDetail,
  createUser, updateUser, deleteUser,
} from '@/services/admin/userService';

const PAGE_SIZE = 10;

const CREATE_BLANK: UserCreateInput = { name: '', email: '', password: '', role: 'user' };

const SUMMARY_BLANK: UserListSummary = { byRole: {}, byTier: {}, total: 0 };

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useUsers() {
  // ── List ──────────────────────────────────────────────────────────────────
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary]       = useState<UserListSummary>(SUMMARY_BLANK);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError]   = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Detail drawer ─────────────────────────────────────────────────────────
  const [detail, setDetail]               = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Create modal ──────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<UserCreateInput>(CREATE_BLANK);
  const [createErr, setCreateErr]   = useState('');
  const [creating, setCreating]     = useState(false);

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editUser, setEditUser]   = useState<UserRow | null>(null);
  const [editForm, setEditForm]   = useState<UserUpdateInput>({ name: '', role: '' });
  const [editErr, setEditErr]     = useState('');
  const [saving, setSaving]       = useState(false);

  // ── Delete confirm ────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Access modal ──────────────────────────────────────────────────────────
  const [accessUser, setAccessUser] = useState<UserRow | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // List operations
  // ─────────────────────────────────────────────────────────────────────────

  const loadUsers = useCallback(async (targetPage = page) => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await listUsers({
        page: targetPage,
        limit: PAGE_SIZE,
        search: search || undefined,
        role: roleFilter || undefined,
        tier: tierFilter || undefined,
      });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSummary(data.summary);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setListLoading(false);
    }
  }, [page, search, roleFilter, tierFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    clearTimeout(searchTimer.current);
    setSearch(value);
    setPage(1);
  }, []);

  const handleRoleFilter = useCallback((role: string) => {
    setRoleFilter(role);
    setTierFilter('');   // clear tier when switching role
    setPage(1);
  }, []);

  const handleTierFilter = useCallback((tier: string) => {
    setTierFilter(tier);
    setRoleFilter('');   // clear role when switching tier
    setPage(1);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Detail drawer
  // ─────────────────────────────────────────────────────────────────────────

  const openDetail = useCallback(async (user: UserRow) => {
    setDetail(null);
    setDetailLoading(true);
    try {
      setDetail(await getUserDetail(user.id));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetail(null);
    setDetailLoading(false);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Create
  // ─────────────────────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setCreateForm(CREATE_BLANK);
    setCreateErr('');
    setCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => { setCreateOpen(false); }, []);

  const saveCreate = useCallback(async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setCreateErr('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setCreating(true);
    setCreateErr('');
    try {
      await createUser(createForm);
      setCreateOpen(false);
      setPage(1);
      await loadUsers(1);
    } catch (e) {
      setCreateErr(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setCreating(false);
    }
  }, [createForm, loadUsers]);

  // ─────────────────────────────────────────────────────────────────────────
  // Edit
  // ─────────────────────────────────────────────────────────────────────────

  const openEdit = useCallback((user: UserRow) => {
    setEditUser(user);
    setEditForm({ name: user.name, role: user.role, subscriptionTier: user.subscriptionTier });
    setEditErr('');
  }, []);

  const closeEdit = useCallback(() => { setEditUser(null); }, []);

  const saveEdit = useCallback(async () => {
    if (!editUser) return;
    setSaving(true);
    setEditErr('');
    try {
      await updateUser(editUser.id, editForm);
      setEditUser(null);
      await loadUsers();
      // Refresh detail if open
      if (detail?.id === editUser.id) {
        setDetail(await getUserDetail(editUser.id));
      }
    } catch (e) {
      setEditErr(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setSaving(false);
    }
  }, [editUser, editForm, loadUsers, detail]);

  // ─────────────────────────────────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────────────────────────────────

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      if (detail?.id === deleteTarget.id) setDetail(null);
      setDeleteTarget(null);
      await loadUsers();
    } catch {
      // future: toast
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, detail, loadUsers]);

  // ─────────────────────────────────────────────────────────────────────────
  // Expose
  // ─────────────────────────────────────────────────────────────────────────

  return {
    // List
    users, total, totalPages, page, setPage, summary,
    search, roleFilter, tierFilter,
    listLoading, listError,
    loadUsers,
    handleSearch, handleRoleFilter, handleTierFilter,

    // Detail
    detail, detailLoading,
    openDetail, closeDetail,

    // Create
    createOpen, createForm, setCreateForm, createErr, creating,
    openCreate, closeCreate, saveCreate,

    // Edit
    editUser, editForm, setEditForm, editErr, saving,
    openEdit, closeEdit, saveEdit,

    // Delete
    deleteTarget, setDeleteTarget, deleting, confirmDelete,

    // Access
    accessUser, setAccessUser,
  };
}
