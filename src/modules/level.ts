// Quản lý cấp độ N5~N1
export type Level = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface LevelInfo {
  code: Level;
  name: string;
  description?: string;
}

export const LEVELS: LevelInfo[] = [
  { code: 'N5', name: 'N5 - Sơ cấp' },
  { code: 'N4', name: 'N4 - Sơ trung cấp' },
  { code: 'N3', name: 'N3 - Trung cấp' },
  { code: 'N2', name: 'N2 - Trung cao cấp' },
  { code: 'N1', name: 'N1 - Cao cấp' },
];
