
import React, { useState, useEffect } from 'react';
import { FaBookOpen } from 'react-icons/fa6';
import { LearnLayout } from './LearnLayout';
import { LearnHeader } from './LearnHeader';
import { LearnCardList } from './LearnCardList';
import { GrammarCard } from '../GrammarCard';
import { HSK_GRAMMAR, type HskGrammarLevel, type GrammarPattern } from '@/modules/chineseGrammarContent';
import { useParams } from 'next/navigation';

const HSK_LEVELS_OBJ = [
  { code: 'HSK1', label: 'HSK1', desc: 'Cơ bản, cấu trúc đơn giản' },
  { code: 'HSK2', label: 'HSK2', desc: 'Cấu trúc thì, so sánh' },
  { code: 'HSK3', label: 'HSK3', desc: 'Câu điều kiện, nhượng bộ' },
  { code: 'HSK4', label: 'HSK4', desc: 'Câu bị động, nhân quả' },
  { code: 'HSK5', label: 'HSK5', desc: 'Cấu trúc phức tạp, trang trọng' },
  { code: 'HSK6', label: 'HSK6', desc: 'Học thuật, diễn đạt chuyên sâu' },
];
const ZH_SKILLS = [
  { key: 'grammar', label: 'Ngữ pháp', icon: <FaBookOpen /> },
];
const JA_LEVELS_OBJ = [
  { code: 'N5', label: 'N5', desc: 'Sơ cấp' },
  { code: 'N4', label: 'N4', desc: 'Sơ trung cấp' },
  { code: 'N3', label: 'N3', desc: 'Trung cấp' },
  { code: 'N2', label: 'N2', desc: 'Trung cao cấp' },
  { code: 'N1', label: 'N1', desc: 'Cao cấp' },
];
const JA_SKILLS = [
  { key: 'vocab', label: 'Từ vựng', icon: <FaBookOpen /> },
  { key: 'grammar', label: 'Ngữ pháp', icon: <FaBookOpen /> },
  { key: 'listening', label: 'Luyện nghe', icon: <FaBookOpen /> },
  { key: 'reading', label: 'Luyện đọc', icon: <FaBookOpen /> },
];

export const GrammarPageContent: React.FC = () => {
  const params = useParams();
  const lang = (params?.lang as string) || 'zh';

  // Shared state
  const [sidebarMode, setSidebarMode] = useState<'level' | 'skill'>('level');
  const [selectedLevel, setSelectedLevel] = useState<string>('HSK1');
  const [selectedSkill, setSelectedSkill] = useState<string>('grammar');
  const [search, setSearch] = useState('');
  const [expandAll, setExpandAll] = useState(false);

  // JLPT state
  const [jaPatterns, setJaPatterns] = useState<any[]>([]);
  const [jaLoading, setJaLoading] = useState(false);

  useEffect(() => {
    if (lang === 'ja') {
      setJaLoading(true);
      fetch(`/api/grammar?lang=ja`)
        .then(r => r.json())
        .then((data) => { setJaPatterns(data); setJaLoading(false); })
        .catch(() => setJaLoading(false));
    }
  }, [lang]);

  // Render JLPT
  if (lang === 'ja') {
    const filteredJa = jaPatterns.filter(p => {
      if (selectedLevel && selectedLevel !== 'ALL' && p.levelCode !== selectedLevel) return false;
      if (selectedSkill && selectedSkill !== 'grammar') return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.pattern.toLowerCase().includes(q) || p.meaning.toLowerCase().includes(q) ||
          p.example.toLowerCase().includes(q) || p.exampleVi.toLowerCase().includes(q);
      }
      return true;
    });
    return (
      <LearnLayout
        sidebarProps={{
          mode: sidebarMode,
          setMode: setSidebarMode,
          selectedLevel,
          setSelectedLevel,
          selectedSkill,
          setSelectedSkill,
          levels: JA_LEVELS_OBJ,
          skills: JA_SKILLS,
          title: 'Học JLPT',
        }}
        bottomBarProps={{
          levels: JA_LEVELS_OBJ,
          selectedLevel,
          setSelectedLevel,
          skills: JA_SKILLS,
          selectedSkill,
          setSelectedSkill,
        }}
      >
        <LearnHeader icon={<FaBookOpen />} title="Ngữ pháp tiếng Nhật" subtitle="Ngữ pháp JLPT theo cấp độ" />
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
          <div className="relative flex-1 max-w-xs">
            <FaBookOpen size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input type="text" placeholder="Tìm mẫu ngữ pháp..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <button onClick={() => setExpandAll(p => !p)} className="text-xs px-3 py-2 rounded-xl font-semibold border transition-all shrink-0"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'transparent' }}>
            {expandAll ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
          </button>
        </div>
        <div className="mt-3 text-xs text-ink-muted">
          {jaLoading ? 'Đang tải...' : `${filteredJa.length} mẫu ngữ pháp${selectedLevel !== 'ALL' ? ` (${selectedLevel})` : ''}${search ? ` — kết quả cho "${search}"` : ''}`}
        </div>
        <LearnCardList>
          {jaLoading ? (
            <div className="text-center py-20"><p className="text-ink-muted">Đang tải dữ liệu ngữ pháp...</p></div>
          ) : filteredJa.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-3 opacity-50"><FaBookOpen size={52} className="mx-auto text-ink-muted" /></div>
              <p className="font-semibold text-ink-secondary">{search ? 'Không tìm thấy ngữ pháp phù hợp.' : 'Không có dữ liệu.'}</p>
              {search && <p className="text-sm mt-1 text-ink-muted">Thử từ khóa khác.</p>}
            </div>
          ) : (
            filteredJa.map(p => <GrammarCard key={p.id} pattern={{
              ...p,
              examples: [{ chinese: p.example, pinyin: p.exampleReading, vietnamese: p.exampleVi }],
              nameVi: p.meaning,
              level: p.levelCode,
              usage: '',
              structure: '',
            }} expand={expandAll} />)
          )}
        </LearnCardList>
      </LearnLayout>
    );
  }

  // Default: HSK (Chinese)
  const filtered = HSK_GRAMMAR.filter(p => {
    if (selectedLevel && selectedLevel !== 'ALL' && p.level !== selectedLevel) return false;
    if (selectedSkill && selectedSkill !== 'grammar') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.pattern.toLowerCase().includes(q) || p.nameVi.toLowerCase().includes(q) ||
        p.usage.toLowerCase().includes(q) ||
        p.examples.some(e => e.chinese.includes(q) || e.vietnamese.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <LearnLayout
      sidebarProps={{
        mode: sidebarMode,
        setMode: setSidebarMode,
        selectedLevel,
        setSelectedLevel,
        selectedSkill,
        setSelectedSkill,
        levels: HSK_LEVELS_OBJ,
        skills: ZH_SKILLS,
        title: 'Học HSK',
      }}
      bottomBarProps={{
        levels: HSK_LEVELS_OBJ,
        selectedLevel,
        setSelectedLevel,
        skills: ZH_SKILLS,
        selectedSkill,
        setSelectedSkill,
      }}
    >
      <LearnHeader icon={<FaBookOpen />} title="Ngữ pháp tiếng Trung" subtitle="Ngữ pháp HSK theo cấp độ" />
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
        <div className="relative flex-1 max-w-xs">
          <FaBookOpen size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Tìm mẫu ngữ pháp..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
        </div>
        <button onClick={() => setExpandAll(p => !p)} className="text-xs px-3 py-2 rounded-xl font-semibold border transition-all shrink-0"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'transparent' }}>
          {expandAll ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
        </button>
      </div>
      <div className="mt-3 text-xs text-ink-muted">
        {filtered.length} mẫu ngữ pháp{selectedLevel !== 'ALL' ? ` (${selectedLevel})` : ''}{search && ` — kết quả cho "${search}"`}
      </div>
      <LearnCardList>
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-3 opacity-50"><FaBookOpen size={52} className="mx-auto text-ink-muted" /></div>
            <p className="font-semibold text-ink-secondary">{search ? 'Không tìm thấy mẫu ngữ pháp phù hợp.' : 'Không có dữ liệu.'}</p>
            {search && <p className="text-sm mt-1 text-ink-muted">Thử từ khóa khác.</p>}
          </div>
        ) : (
          filtered.map(p => <GrammarCard key={p.id} pattern={p} expand={expandAll} />)
        )}
      </LearnCardList>
    </LearnLayout>
  );
};
