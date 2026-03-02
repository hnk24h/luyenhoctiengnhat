// Quản lý user và tiến trình học
export interface User {
  id: string;
  name: string;
  email: string;
  level: string;
}

export interface UserProgress {
  userId: string;
  contentId: string;
  completed: boolean;
  score?: number;
  lastAttempt?: Date;
}

export const users: User[] = [];
export const userProgress: UserProgress[] = [];
