'use client';

import { useMemo, useState } from 'react';
import {
  FaBookOpen, FaChevronDown, FaChevronUp, FaMagnifyingGlass,
} from 'react-icons/fa6';
import {
  HSK_GRAMMAR, type HskGrammarLevel, type GrammarPattern,
} from '@/modules/chineseGrammarContent';

const HSK_LEVELS: HskGrammarLevel[] = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];

const LEVEL_COLORS: Record<HskGrammarLevel, { bg: string; text: string; border: string }> = {
  HSK1: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  HSK2: { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  HSK3: { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' },
  HSK4: { bg: '#FFEDD5', text: '#C2410C', border: '#FCA679' },
  HSK5: { bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE' },
  HSK6: { bg: '#FFE4E6', text: '#BE123C', border: '#FCA5A5' },
};

const LEVEL_DESCS: Record<HskGrammarLevel, string> = {
  HSK1: 'Câu cơ bản, cấu trúc đơn giản',
  HSK2: 'Cấu trúc thì, so sánh',
  HSK3: 'Câu điều kiện, nhượng bộ',
  HSK4: 'Câu bị động, nhân quả',
  HSK5: 'Cấu trúc phức tạp, trang trọng',
  HSK6: 'Học thuật, diễn đạt chuyên sâu',
};

function GrammarCard({ pattern }: { pattern: GrammarPattern }) {
  const [open, setOpen] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const colors = LEVEL_COLORS[pattern.level];

  return (
    <div className="rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: open ? colors.border : 'var(--border)', background: 'var(--bg-surface)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between px-4 py-4 text-left gap-3"
        style={{ background: open ? `${colors.bg}60` : 'transparent' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: colors.bg, color: colors.text }}>
              {pattern.level}
            </span>
            <code className="text-sm font-bold px-2 py-0.5 rounded-lg"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', fontFamily: '"Noto Sans SC", sans-serif' }}>
              {pattern.pattern}
            </code>
          </div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{pattern.nameVi}</div>
          <div className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{pattern.usage}</div>
        </div>
        <div className="shrink-0 mt-1" style={{ color: 'var(--text-muted)' }}>
          {open ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: colors.border }}>
          <div className="mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: colors.text }}>Cách dùng: </span>
            {pattern.usage}
          </div>
          <div className="mb-4 px-3 py-2 rounded-xl text-sm font-mono"
            style={{ background: colors.bg, color: colors.text }}>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Cấu trúc: </span>
            {pattern.structure}
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Ví dụ</span>
            <button
              onClick={() => setShowPinyin(p => !p)}
              className="text-xs px-2 py-1 rounded-lg font-semibold transition-all"
              style={showPinyin ? { background: '#e53e3e', color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
              拼音 Pinyin
            </button>
          </div>
          <div className="space-y-3">
            {pattern.examples.map((ex, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                <p className="font-semibold text-base" style={{ fontFamily: '"Noto Sans SC", sans-serif', color: 'var(--text-primary)' }}>
                  {ex.chinese}
                </p>
                {showPinyin && (
                  <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{ex.pinyin}</p>
                )}
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{ex.vietnamese}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GrammarCardExpanded({ pattern }: { pattern: GrammarPattern }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const colors = LEVEL_COLORS[pattern.level];
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: colors.border, background: 'var(--bg-surface)' }}>
      <div className="px-4 py-3" style={{ background: `${colors.bg}60` }}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.text }}>{pattern.level}</span>
          <code className="text-sm font-bold px-2 py-0.5 rounded-lg" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', fontFamily: '"Noto Sans SC", sans-serif' }}>{pattern.pattern}</code>
        </div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{pattern.nameVi}</div>
      </div>
      <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: colors.border }}>
        <div className="mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-semibold" style={{ color: colors.text }}>Cách dùng: </span>{pattern.usage}
        </div>
        <div className="mb-4 px-3 py-2 rounded-xl text-sm font-mono" style={{ background: colors.bg, color: colors.text }}>
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">Cấu trúc: </span>{pattern.structure}
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Ví dụ</span>
          <button onClick={() => setShowPinyin(p => !p)} className="text-xs px-2 py-1 rounded-lg font-semibold transition-all"
            style={showPinyin ? { background: '#e53e3e', color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>拼音</button>
        </div>
        <div className="space-y-2">
          {pattern.examples.map((ex, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
              <p className="font-semibold text-base" style={{ fontFamily: '"Noto Sans SC", sans-serif', color: 'var(--text-primary)' }}>{ex.chinese}</p>
              {showPinyin && <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{ex.pinyin}</p>}
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{ex.vietnamese}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GrammarPage() {
  const [selectedLevel, setSelectedLevel] = useState<HskGrammarLevel | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [expandAll, setExpandAll] = useState(false);

  const filtered = useMemo(() => {
    let list = HSK_GRAMMAR;
    if (selectedLevel !== 'ALL') list = list.filter(p => p.level === selectedLevel);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.pattern.toLowerCase().includes(q) || p.nameVi.toLowerCase().includes(q) ||
        p.usage.toLowerCase().includes(q) ||
        p.examples.some(e => e.chinese.includes(q) || e.vietnamese.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedLevel, search]);

  const byLevel = useMemo(() => {
    const map: Partial<Record<HskGrammarLevel, GrammarPattern[]>> = {};
    for (const p of filtered) { if (!map[p.level]) map[p.level] = []; map[p.level]!.push(p); }
    return map;
  }, [filtered]);

  const levelsWithResults = HSK_LEVELS.filter(l => (byLevel[l]?.length ?? 0) > 0);

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="border-b sticky top-16 z-30" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <FaBookOpen size={12} /> Ngữ pháp tiếng Trung
            </div>
            <h1 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>Ngữ pháp HSK theo cấp độ</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setSelectedLevel('ALL')} className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={selectedLevel === 'ALL' ? { background: '#e53e3e', color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                Tất cả
              </button>
              {HSK_LEVELS.map(lvl => {
                const c = LEVEL_COLORS[lvl];
                return (
                  <button key={lvl} onClick={() => setSelectedLevel(lvl)} className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={selectedLevel === lvl ? { background: c.text, color: '#fff', boxShadow: `0 2px 8px ${c.text}60` } : { background: c.bg, color: c.text }}>
                    {lvl}
                  </button>
                );
              })}
            </div>
            <div className="relative flex-1 max-w-xs">
              <FaMagnifyingGlass size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Tìm mẫu ngữ pháp..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border"
                style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <button onClick={() => setExpandAll(p => !p)} className="text-xs px-3 py-2 rounded-xl font-semibold border transition-all shrink-0"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'transparent' }}>
              {expandAll ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
            </button>
          </div>
          <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} mẫu ngữ pháp{selectedLevel !== 'ALL' ? ` (${selectedLevel})` : ''}{search && ` — kết quả cho "${search}"`}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3 opacity-30">📖</div>
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{search ? 'Không tìm thấy mẫu ngữ pháp phù hợp.' : 'Không có dữ liệu.'}</p>
            {search && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Thử từ khóa khác.</p>}
          </div>
        ) : selectedLevel !== 'ALL' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: LEVEL_COLORS[selectedLevel].bg, color: LEVEL_COLORS[selectedLevel].text }}>{selectedLevel}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{LEVEL_DESCS[selectedLevel]}</span>
            </div>
            {filtered.map(p => <div key={p.id}>{expandAll ? <GrammarCardExpanded pattern={p} /> : <GrammarCard pattern={p} />}</div>)}
          </div>
        ) : (
          <div className="space-y-8">
            {levelsWithResults.map(lvl => (
              <section key={lvl}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-base font-extrabold px-3 py-1 rounded-full" style={{ background: LEVEL_COLORS[lvl].bg, color: LEVEL_COLORS[lvl].text }}>{lvl}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{LEVEL_DESCS[lvl]}</span>
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{byLevel[lvl]?.length} mẫu</span>
                </div>
                <div className="space-y-2">
                  {byLevel[lvl]!.map(p => <div key={p.id}>{expandAll ? <GrammarCardExpanded pattern={p} /> : <GrammarCard pattern={p} />}</div>)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
