// ─── Admin User Types ──────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'basic' | 'premium';
export type UserRole = 'user' | 'admin';

export interface SSOAccount {
  id: string;
  provider: string;
  providerAccountId: string;
}

/** Summary counts for filter tabs */
export interface UserListSummary {
  byRole: Record<string, number>;
  byTier: Record<string, number>;
  total: number;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  image: string | null;
  createdAt: string;
  /** SSO providers linked to this user (for list display) */
  accounts: { id: string; provider: string }[];
  _count: {
    sessions: number;
    progress: number;
    savedWords: number;
    flashcardDecks: number;
  };
}

export interface UserSession {
  id: string;
  score: number | null;
  totalQ: number;
  correctQ: number;
  startedAt: string;
  finishedAt: string | null;
  examSet: {
    title: string;
    skill: string;
    level: { code: string };
  };
}

export interface UserDetail extends UserRow {
  updatedAt: string;
  _count: {
    sessions: number;
    progress: number;
    savedWords: number;
    flashcardDecks: number;
    lessonProgress: number;
  };
  sessions: UserSession[];
  /** Full SSO account list for detail view */
  accounts: SSOAccount[];
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  tier?: string;
}

export interface UserListResponse {
  users: UserRow[];
  total: number;
  totalPages: number;
  summary: UserListSummary;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UserUpdateInput {
  name: string;
  role: string;
  subscriptionTier?: SubscriptionTier;
}

// ─── Lesson Access Types ───────────────────────────────────────────────────────

export interface LessonRow {
  id: string;
  title: string;
  description?: string;
  type?: string;
  requiredTier?: string;
  selected?: boolean;
  selectedTier?: string;
  granting?: boolean;
}

export interface LevelOption {
  id: string;
  code: string;
  name: string;
}

export type AccessTier = 'free' | 'basic' | 'premium';
