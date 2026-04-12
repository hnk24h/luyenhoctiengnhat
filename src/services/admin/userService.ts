import type {
  UserRow, UserDetail,
  UserListParams, UserListResponse,
  UserCreateInput, UserUpdateInput,
  LevelOption, LessonRow,
} from '@/types/admin/user';

// ─── Error helper ──────────────────────────────────────────────────────────────

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.error?.message ?? body?.error ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

// ─── User CRUD ─────────────────────────────────────────────────────────────────

export async function listUsers(params: UserListParams = {}): Promise<UserListResponse> {
  const qs = new URLSearchParams();
  if (params.page)   qs.set('page',   String(params.page));
  if (params.limit)  qs.set('limit',  String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.role)   qs.set('role',   params.role);
  if (params.tier)   qs.set('tier',   params.tier);

  const res = await fetch(`/api/admin/users?${qs}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getUserDetail(id: string): Promise<UserDetail> {
  const res = await fetch(`/api/admin/users/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createUser(data: UserCreateInput): Promise<UserRow> {
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateUser(id: string, data: UserUpdateInput): Promise<UserRow> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseError(res));
}

// ─── SSO Management ────────────────────────────────────────────────────────────

export async function revokeSSO(userId: string, accountId: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${userId}/sso/${accountId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseError(res));
}

// ─── Lesson Access ─────────────────────────────────────────────────────────────

export async function listLevels(): Promise<LevelOption[]> {
  const res = await fetch('/api/admin/levels');
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function listLessonsForLevel(
  levelId: string,
  skill: string,
): Promise<LessonRow[]> {
  const catRes = await fetch(
    `/api/learning/categories?levelId=${levelId}${skill ? `&skill=${skill}` : ''}`,
  );
  const categories: { id: string }[] = catRes.ok ? await catRes.json() : [];

  const chunks = await Promise.all(
    categories.map(async (cat) => {
      const r = await fetch(`/api/learning/lessons?categoryId=${cat.id}`);
      return r.ok ? (r.json() as Promise<LessonRow[]>) : [];
    }),
  );

  return chunks.flat().map((l) => ({
    ...l,
    selected: false,
    selectedTier: l.requiredTier ?? 'free',
    granting: false,
  }));
}

export async function getUserAccess(userId: string): Promise<unknown[]> {
  const res = await fetch(`/api/learning/user-access?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function grantAccess(params: {
  userId: string;
  lessonId: string;
  tier: string;
  note?: string;
}): Promise<void> {
  const res = await fetch('/api/learning/user-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function revokeAccess(userId: string, lessonId: string): Promise<void> {
  const res = await fetch(
    `/api/learning/user-access?userId=${userId}&lessonId=${lessonId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error(await parseError(res));
}

