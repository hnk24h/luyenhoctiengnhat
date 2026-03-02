// Quản lý nội dung học/luyện thi theo từng cấp độ
import { Level } from './level';

export type Skill = 'nghe' | 'noi' | 'doc' | 'viet';

export interface PracticeContent {
  id: string;
  level: Level;
  skill: Skill;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'tracnghiem' | 'dien_tu' | 'ghi_am' | 'upload_file' | 'nghe_audio';
  content: string;
  options?: string[];
  answer?: string | string[];
  audioUrl?: string;
  imageUrl?: string;
}

// Dummy data example
export const practiceContents: PracticeContent[] = [];
