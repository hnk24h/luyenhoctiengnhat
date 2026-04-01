// Shared vocab types for VocabClient, FlashcardsTab, etc.

export type VocabRefContentMeaning = {
  id: string;
  language: string;
  meaning: string;
};

export type VocabRefContentExample = {
  id: string;
  exampleText: string;
  translation: string | null;
  language: string;
  translationLanguage: string | null;
};

export type VocabRefItem = {
  id: string;
  term: string;
  pronunciation: string | null;
  meanings: VocabRefContentMeaning[];
  examples?: VocabRefContentExample[];
};
