import React from 'react';
import { FaRepeat, FaStar, FaRegStar, FaGraduationCap, FaArrowRotateLeft, FaTrophy, FaThumbsUp, FaDumbbell, FaBook, FaStopwatch } from 'react-icons/fa6';

interface Segment { speaker: string; text: string; pinyin?: string }
interface GrammarPoint {
  pattern: string;
  reading: string | null;
  meaning: string;
  example: string;
  exampleReading: string | null;
  exampleVi: string;
  searchIn: string;
  levelCode: string;
  order: number;
  foundInText: boolean;
}
interface ListeningPractice {
  id: string; lang: string; level: string; category: string;
  title: string; titleVi?: string | null;
  summary: string; situation: string; durationSec: number;
  focus: string; question: string; options: string[];
  answer: string; explanation: string; audioUrl?: string | null;
  segments: Segment[];
  grammarPoints: GrammarPoint[];
}
interface DictResult { score: number; tokens: { char: string; correct: boolean }[] }

interface ListeningTabsProps {
  activeTab: 'transcript' | 'quiz' | 'dictation' | 'grammar';
  setActiveTab: (tab: 'transcript' | 'quiz' | 'dictation' | 'grammar') => void;
  appMode: 'practice' | 'exam';
  selectedPractice: ListeningPractice;
  accent: string;
  cfg: any;
  showPinyin: boolean;
  setShowPinyin: (fn: (p: boolean) => boolean) => void;
  estimatedAudioSegIdx: number;
  speakingSegIdx: number;
  isSpeaking: boolean;
  getSegmentStartSec: (idx: number) => number;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  playDialogue: (fromIdx?: number) => void;
  synthRef: React.MutableRefObject<SpeechSynthesis | null>;
  playTokenRef: React.MutableRefObject<number>;
  dictationText: string;
  setDictationText: (v: string) => void;
  dictationResult: DictResult | null;
  setDictationResult: (v: DictResult | null) => void;
  scoreDictation: (input: string, reference: string) => DictResult;
  quizChecked: boolean;
  setQuizChecked: (v: boolean) => void;
  selectedAnswer: string | null;
  setSelectedAnswer: (v: string | null) => void;
  examFinished: boolean;
  examTimeLeft: number;
  formatExamTime: (secs: number) => string;
  grammarPoints: GrammarPoint[];
  favoriteGrammarKeys: Set<string>;
  toggleFavoriteGrammar: (pattern: string) => void;
  expandedGrammarIdxs: Set<number>;
  setExpandedGrammarIdxs: (fn: (prev: Set<number>) => Set<number>) => void;
}


const ListeningTabs: React.FC<ListeningTabsProps> = ({
  activeTab,
  setActiveTab,
  appMode,
  selectedPractice,
  accent,
  cfg,
  showPinyin,
  setShowPinyin,
  estimatedAudioSegIdx,
  speakingSegIdx,
  isSpeaking,
  getSegmentStartSec,
  audioRef,
  playDialogue,
  synthRef,
  playTokenRef,
  dictationText,
  setDictationText,
  dictationResult,
  setDictationResult,
  scoreDictation,
  quizChecked,
  setQuizChecked,
  selectedAnswer,
  setSelectedAnswer,
  examFinished,
  examTimeLeft,
  formatExamTime,
  grammarPoints,
  favoriteGrammarKeys,
  toggleFavoriteGrammar,
  expandedGrammarIdxs,
  setExpandedGrammarIdxs,
}) => {
  return (
    <div className="border-t" style={{ borderColor: 'var(--border)' }}>
      {/* Tab bar */}
      <div className="flex">
        {([
          { id: 'quiz', label: 'Câu hỏi' },
          ...(appMode === 'practice' ? [
            { id: 'dictation', label: '✏️ Nghe và viết' },
            { id: 'transcript', label: 'Hội thoại' },
            { id: 'grammar', label: '文法' },
          ] : []),
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex-1 py-2 text-[11px] font-semibold transition-all border-b-2"
            style={activeTab === tab.id
              ? { borderColor: appMode === 'exam' ? '#7C3AED' : accent, color: appMode === 'exam' ? '#7C3AED' : accent }
              : { borderColor: 'transparent', color: 'var(--text-muted)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Transcript */}
      {activeTab === 'transcript' && appMode === 'practice' && (
        <div className="px-4 py-3 space-y-1.5">
          {cfg.hasPinyin && (
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowPinyin(p => !p)}
                className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                style={showPinyin ? { background: accent, color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                拼音 Pinyin {showPinyin ? '✓' : ''}
              </button>
            </div>
          )}
          {selectedPractice.segments.map((seg, i) => {
            const activeIdx = selectedPractice.audioUrl ? estimatedAudioSegIdx : speakingSegIdx;
            const isActive = isSpeaking && i === activeIdx;
            return (
              <div key={i}
                className="flex gap-2 px-3 py-2 rounded-xl transition-all"
                style={{
                  background: isActive ? `color-mix(in srgb, ${accent} 10%, var(--bg-muted))` : 'transparent',
                  borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                }}>
                {/* Speaker badge + repeat button */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg h-fit"
                    style={{ background: cfg.heroBg, color: accent }}>
                    {seg.speaker}
                  </span>
                  <button
                    title="Nghe lại câu này"
                    onClick={() => {
                      if (selectedPractice.audioUrl) {
                        const startSec = getSegmentStartSec(i);
                        if (!audioRef.current || audioRef.current.src !== selectedPractice.audioUrl) {
                          const a = new Audio(selectedPractice.audioUrl);
                          a.addEventListener('loadedmetadata', () => {});
                          a.addEventListener('timeupdate', () => {});
                          audioRef.current = a;
                        }
                        audioRef.current.currentTime = startSec;
                        audioRef.current.play().catch(() => { });
                      } else {
                        if (isSpeaking) { playTokenRef.current += 1; synthRef.current?.cancel(); }
                        window.setTimeout(() => playDialogue(i), 60);
                      }
                    }}
                    className="w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: `${accent}20`, color: accent }}>
                    <FaRepeat size={7} />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-primary)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                    {seg.text.split('').map((char, ci) => (
                      /[\u3000-\u9FFF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(char) ? (
                        <span
                          key={ci}
                          className="cursor-pointer rounded px-px transition-colors hover:bg-yellow-100"
                        >
                          {char}
                        </span>
                      ) : <span key={ci}>{char}</span>
                    ))}
                  </p>
                  {showPinyin && seg.pinyin && (
                    <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{seg.pinyin}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Quiz */}
      {activeTab === 'quiz' && (
        <div className="px-4 py-3">
          {examFinished && appMode === 'exam' && (
            <div className="mb-3 p-3 rounded-2xl text-center"
              style={{ background: '#7C3AED15', color: '#7C3AED' }}>
              <p className="font-bold text-sm">⏰ Hết giờ thi!</p>
              {quizChecked && (
                <p className="text-xs mt-1">
                  {selectedAnswer === selectedPractice.answer ? '🎉 Bạn đã trả lời đúng!' : '😔 Chưa đúng — xem giải thích bên dưới'}
                </p>
              )}
            </div>
          )}
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            ❓ {selectedPractice.question}
          </p>
          <div className="space-y-2 mb-3">
            {selectedPractice.options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = quizChecked && opt === selectedPractice.answer;
              const isWrong = quizChecked && isSelected && opt !== selectedPractice.answer;
              return (
                <button
                  key={i}
                  disabled={quizChecked}
                  onClick={() => !quizChecked && setSelectedAnswer(opt)}
                  className="w-full px-4 py-3 rounded-2xl text-sm flex items-center gap-2.5 transition-all text-left"
                  style={{
                    background: isCorrect ? '#DCFCE7' : isWrong ? '#FEE2E2' : isSelected ? `color-mix(in srgb, ${accent} 12%, var(--bg-base))` : 'var(--bg-base)',
                    color: isCorrect ? '#15803D' : isWrong ? '#DC2626' : 'var(--text-secondary)',
                    border: `1.5px solid ${isCorrect ? '#86EFAC' : isWrong ? '#FCA5A5' : isSelected ? accent : 'var(--border)'}`,
                    fontWeight: isCorrect || isSelected ? 600 : 400,
                    cursor: quizChecked ? 'default' : 'pointer',
                  }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{
                        background: isCorrect ? '#86EFAC' : isWrong ? '#FCA5A5' : isSelected ? accent : 'var(--border)',
                        color: isCorrect ? '#15803D' : isWrong ? '#DC2626' : isSelected ? '#fff' : 'var(--text-muted)',
                      }}>
                      {isCorrect ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* CTA button: changes per quiz step */}
            {!quizChecked ? (
              <button
                disabled={!selectedAnswer}
                onClick={() => { if (selectedAnswer) setQuizChecked(true); }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: selectedAnswer ? (appMode === 'exam' ? '#7C3AED' : accent) : 'var(--bg-muted)', color: selectedAnswer ? '#fff' : 'var(--text-muted)' }}>
                Kiểm tra
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold`}
                  style={selectedAnswer === selectedPractice.answer
                    ? { background: '#DCFCE7', color: '#15803D' }
                    : { background: '#FEE2E2', color: '#DC2626' }}>
                  {selectedAnswer === selectedPractice.answer ? '✔ Đúng rồi!' : '✖ Chưa đúng'}
                </div>
                <button
                  onClick={() => { setSelectedAnswer(null); setQuizChecked(false); }}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                  <FaArrowRotateLeft size={10} /> Thử lại
                </button>
              </div>
            )}

            {/* Explanation — only show after check */}
            {quizChecked && (
              <div className="mt-3 px-4 py-3 rounded-2xl text-xs leading-relaxed"
                style={{ background: appMode === 'exam' ? '#7C3AED12' : 'var(--primary-light)', color: appMode === 'exam' ? '#7C3AED' : 'var(--primary)' }}>
                💡 {selectedPractice.explanation}
              </div>
            )}
          </div>
      )}

      {/* Tab: Dictation */}
      {activeTab === 'dictation' && (
        <div className="px-4 py-3">
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Nghe bài hội thoại rồi chép lại đúng những gì bạn nghe được:
          </p>
          {!dictationResult ? (
            <>
              <textarea
                value={dictationText}
                onChange={e => setDictationText(e.target.value)}
                rows={4}
                placeholder={cfg.hasPinyin ? '写出你听到的内容（汉字或拼音）…' : '聴こえた内容を書いてください…'}
                className="w-full text-sm rounded-2xl border px-4 py-3 resize-y outline-none"
                style={{
                  background: 'var(--bg-base)', borderColor: 'var(--border)',
                  color: 'var(--text-primary)', lineHeight: 2,
                  fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif',
                }}
              />
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  disabled={!dictationText.trim()}
                  onClick={() => {
                    const ref = selectedPractice.segments.map(s => s.text).join('');
                    setDictationResult(scoreDictation(dictationText, ref));
                  }}
                  className="px-5 py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-40 transition-all"
                  style={{ background: accent, color: '#fff' }}>
                  Chấm điểm
                </button>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dictationText.length} ký tự</span>
              </div>
            </>
          ) : (
            <>
              {/* Score ring */}
              <div className="flex items-center gap-4 mb-4 p-4 rounded-2xl"
                style={{ background: dictationResult.score >= 80 ? '#DCFCE7' : dictationResult.score >= 50 ? '#FEF9C3' : '#FFE4E6' }}>
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6"
                      style={{ color: dictationResult.score >= 80 ? '#86EFAC' : dictationResult.score >= 50 ? '#FDE68A' : '#FCA5A5' }} />
                    <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - dictationResult.score / 100)}`}
                      strokeLinecap="round"
                      style={{ color: dictationResult.score >= 80 ? '#15803D' : dictationResult.score >= 50 ? '#92400E' : '#BE123C', stroke: 'currentColor' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                    style={{ color: dictationResult.score >= 80 ? '#15803D' : dictationResult.score >= 50 ? '#92400E' : '#BE123C' }}>
                    {dictationResult.score}%
                  </div>
                </div>
                <div>
                  <div className="font-bold text-base mb-0.5"
                    style={{ color: dictationResult.score >= 80 ? '#15803D' : dictationResult.score >= 50 ? '#92400E' : '#BE123C' }}>
                    {dictationResult.score >= 90 ? <><FaTrophy size={14} color="#F59E0B" /> Xuất sắc!</> : dictationResult.score >= 70 ? <><FaThumbsUp size={14} color="#10B981" /> Khá tốt!</> : dictationResult.score >= 50 ? <><FaDumbbell size={14} color="#D97706" /> Cố gắng thêm</> : <><FaBook size={14} color="#6B7280" /> Cần luyện thêm</>}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {dictationResult.tokens.filter(t => t.correct).length}/{dictationResult.tokens.length} ký tự đúng
                  </div>
                </div>
              </div>
              {/* Char diff */}
              <div className="p-4 rounded-2xl mb-3 leading-loose text-sm"
                style={{ background: 'var(--bg-base)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  Nội dung chuẩn
                </div>
                {dictationResult.tokens.map((tok, i) => (
                  <span key={i} style={{
                    color: tok.correct ? '#15803D' : '#DC2626',
                    background: tok.correct ? '#DCFCE7' : '#FEE2E2',
                    borderRadius: 3, padding: '0 1px',
                  }}>{tok.char}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setDictationResult(null); setDictationText(''); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  Thử lại
                </button>
                <button onClick={() => setActiveTab('transcript')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  Xem hội thoại
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab: Grammar */}
      {activeTab === 'grammar' && appMode === 'practice' && (
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <FaGraduationCap size={12} style={{ color: accent }} />
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
              Ngữ pháp trong bài — {selectedPractice.level}
            </span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${accent}18`, color: accent }}>
              {grammarPoints.filter(g => g.foundInText).length} tìm thấy
            </span>
            <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
              ⭐ {favoriteGrammarKeys.size} đã lưu
            </span>
          </div>

          {grammarPoints.map((gp, i) => {
            const isFav = favoriteGrammarKeys.has(gp.pattern);
            const expanded = expandedGrammarIdxs.has(i);
            const levelMeta = cfg.levelMeta[gp.levelCode];
            // Show divider before first "not found in text" entry (if there are some found ones)
            const hasSomFound = grammarPoints.some(g => g.foundInText);
            const showDivider = hasSomFound && !gp.foundInText && (i === 0 || grammarPoints[i - 1].foundInText);
            return (
              <div key={i}>
                {showDivider && (
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    <span className="text-[10px] font-semibold px-2" style={{ color: 'var(--text-muted)' }}>Cũng hữu ích ở level này</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  </div>
                )}
                <div className="rounded-2xl border overflow-hidden transition-all"
                  style={{ borderColor: gp.foundInText ? `${accent}55` : isFav ? '#FDE68A' : 'var(--border)', background: gp.foundInText ? `color-mix(in srgb, ${accent} 4%, var(--bg-base))` : 'var(--bg-base)' }}>
                  {/* Header row */}
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                    onClick={() => setExpandedGrammarIdxs(prev => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i); else next.add(i);
                      return next;
                    })}>
                    {/* Found badge */}
                    {gp.foundInText && (
                      <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${accent}20`, color: accent }}>✦ BÀI</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm"
                        style={{ color: gp.foundInText ? accent : 'var(--text-primary)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                        {gp.pattern}
                      </span>
                      {gp.reading && !cfg.hasPinyin && (
                        <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>{gp.reading}</span>
                      )}
                      <span className="ml-2 text-xs" style={{ color: 'var(--text-secondary)' }}>— {gp.meaning}</span>
                    </div>
                    {/* Level badge when it differs from lesson level */}
                    {gp.levelCode !== selectedPractice.level && levelMeta && (
                      <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: levelMeta.badgeBg, color: levelMeta.badgeText }}>{gp.levelCode}</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavoriteGrammar(gp.pattern); }}
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={isFav
                        ? { background: '#FEF9C3', color: '#D97706' }
                        : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                      {isFav ? <FaStar size={11} /> : <FaRegStar size={11} />}
                    </button>
                    <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {expanded ? '▲' : '▼'}
                    </span>
                  </div>
                  {/* Expanded: example */}
                  {expanded && (
                    <div className="px-4 pb-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                            style={{ background: `${accent}18`, color: accent }}>例</span>
                          <p className="text-sm leading-relaxed"
                            style={{ color: 'var(--text-primary)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                            {gp.example}
                          </p>
                        </div>
                        {gp.exampleReading && (
                          <p className="text-xs italic pl-8" style={{ color: 'var(--text-muted)' }}>{gp.exampleReading}</p>
                        )}
                        <p className="text-xs pl-8" style={{ color: 'var(--text-secondary)' }}>→ {gp.exampleVi}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {grammarPoints.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
              Chưa có dữ liệu ngữ pháp cho bài này.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ListeningTabs;
