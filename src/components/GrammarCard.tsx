import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import { GrammarPattern } from '@/modules/chineseGrammarContent';

interface GrammarCardProps {
  pattern: GrammarPattern;
  expand?: boolean;
}

export const GrammarCard: React.FC<GrammarCardProps> = ({ pattern, expand }) => {
  const [open, setOpen] = useState(expand || false);
  React.useEffect(() => { setOpen(!!expand); }, [expand]);
  return (
    <div className="rounded-2xl border overflow-hidden transition-all" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between px-4 py-4 text-left gap-3"
        style={{ background: open ? 'var(--bg-muted)' : 'transparent' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary">
              {pattern.level}
            </span>
            <code className="text-sm font-bold px-2 py-0.5 rounded-lg bg-muted text-ink-primary font-mono">
              {pattern.pattern}
            </code>
          </div>
          <div className="text-sm font-semibold text-ink-primary">{pattern.nameVi}</div>
          <div className="text-xs mt-0.5 line-clamp-1 text-ink-muted">{pattern.usage}</div>
        </div>
        <div className="shrink-0 mt-1 text-ink-muted">
          {open ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-3 text-sm text-ink-secondary">
            <span className="font-semibold text-primary">Cách dùng: </span>
            {pattern.usage}
          </div>
          <div className="mb-4 px-3 py-2 rounded-xl text-sm font-mono bg-primary-light text-primary">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Cấu trúc: </span>
            {pattern.structure}
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">Ví dụ</span>
          </div>
          <div className="space-y-3">
            {pattern.examples.map((ex, i) => (
              <div key={i} className="rounded-xl p-3 bg-base border border-border">
                <p className="font-semibold text-base font-mono text-ink-primary">{ex.chinese}</p>
                <p className="text-xs mt-0.5 italic text-ink-muted">{ex.pinyin}</p>
                <p className="text-sm mt-1 text-ink-secondary">{ex.vietnamese}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
