import React from 'react';
import { LevelBadge } from './LevelBadge';

interface SectionGroupByLevelProps<T> {
  levels: string[];
  byLevel: Partial<Record<string, T[]>>;
  levelMeta: Record<string, { bg: string; color: string; desc?: string }>;
  renderItem: (item: T) => React.ReactNode;
  getCount?: (items: T[]) => number;
}

export function SectionGroupByLevel<T>({ levels, byLevel, levelMeta, renderItem, getCount }: SectionGroupByLevelProps<T>) {
  return (
    <div className="space-y-8">
      {levels.map(lvl => (
        byLevel[lvl]?.length ? (
          <section key={lvl}>
            <div className="flex items-center gap-3 mb-3">
              <LevelBadge text={lvl} bg={levelMeta[lvl].bg} color={levelMeta[lvl].color} className="text-base font-extrabold" />
              {levelMeta[lvl].desc && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{levelMeta[lvl].desc}</span>}
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{getCount ? getCount(byLevel[lvl]!) : byLevel[lvl]!.length} mục</span>
            </div>
            <div className="space-y-2">
              {byLevel[lvl]!.map(renderItem)}
            </div>
          </section>
        ) : null
      ))}
    </div>
  );
}
