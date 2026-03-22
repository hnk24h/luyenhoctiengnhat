import React from 'react';

// Copied from ../page.tsx to avoid import issues in Next.js app directory
interface SavedWordContent {
  id: string;
  term: string;
  pronunciation: string | null;
  meanings: { language: string; meaning: string }[];
  examples: { exampleText: string; translation: string | null }[];
}

interface Word {
  id: string;
  contentId: string;
  content: SavedWordContent;
  context: string | null;
  createdAt: string;
  collections: { id: string; name: string; color: string }[];
}

interface ReviewMistakesTabProps {
  words: Word[];
  onRetry: (id: string) => void;
}

export const ReviewMistakesTab: React.FC<ReviewMistakesTabProps> = ({ words, onRetry }) => {
  return (
    <div>
      <h2 className="font-extrabold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Review mistakes</h2>
      {words.length === 0 ? (
        <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Không có từ nào cần ôn lại.</div>
      ) : (
        <div className="space-y-2">
          {words.map(w => (
            <div key={w.id} className="card flex items-center gap-3">
              <span className="font-bold text-base" style={{ color: 'var(--primary)' }}>{w.content.term}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{w.content.pronunciation}</span>
              <span className="text-sm" style={{ color: 'var(--text-base)' }}>{w.content.meanings?.[0]?.meaning ?? ''}</span>
              <button onClick={() => onRetry(w.id)} className="btn-primary p-1.5">Luyện lại</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};