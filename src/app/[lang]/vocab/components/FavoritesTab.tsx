import React from 'react';
import { Word } from '../page';

interface FavoritesTabProps {
  words: Word[];
  onRemove: (id: string) => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({ words, onRemove }) => {
  return (
    <div>
      <h2 className="font-extrabold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Favorites</h2>
      {words.length === 0 ? (
        <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có từ nào được đánh dấu.</div>
      ) : (
        <div className="space-y-2">
          {words.map(w => (
            <div key={w.id} className="card flex items-center gap-3">
              <span className="font-bold text-base" style={{ color: 'var(--primary)' }}>{w.content.term}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{w.content.pronunciation}</span>
              <span className="text-sm" style={{ color: 'var(--text-base)' }}>{w.content.meanings?.[0]?.meaning ?? ''}</span>
              <button onClick={() => onRemove(w.id)} className="btn-ghost p-1.5" style={{ color: '#EF4444' }}>Bỏ đánh dấu</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};