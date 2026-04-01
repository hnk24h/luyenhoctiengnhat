// Canonical lesson/curriculum domain types — shared across admin, learn, and API layers.

export interface ContentMeaning {
  id: string;
  language: string;
  meaning: string;
}

export interface ContentExample {
  id: string;
  exampleText: string;
  translation: string | null;
  language: string;
  translationLanguage: string | null;
}

export interface LearningItem {
  id: string;
  lessonId: string;
  type: string;
  language: string;
  term: string;
  pronunciation: string | null;
  meanings: ContentMeaning[];
  examples: ContentExample[];
  audioUrl: string | null;
  imageUrl: string | null;
  order: number;
}

export interface Lesson {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  content: string | null;
  type: string;
  order: number;
  requiredTier?: string;
  _count: { items: number };
  category: { name: string; skill: string; level: { code: string } };
}
