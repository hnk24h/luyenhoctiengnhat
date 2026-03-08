'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FaBookmark, FaRegBookmark, FaXmark, FaSpinner, FaVolumeHigh, FaFolder, FaCheck, FaPlus } from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Meaning {
  pos:  string;
  defs: string[];
  tags: string[];
}

type Lang = 'en' | 'vi';

interface DictResult {
  found:      boolean;
  word?:      string;
  reading?:   string;
  meanings?:  Meaning[];
  jlpt?:      string[];
  is_common?: boolean;
  lang?:      Lang;
  error?:     string;
}

interface TooltipState {
  word:    string;
  context: string;
  rect:    DOMRect;
  data:    DictResult | null;
  loading: boolean;
}

interface Props {
  content:    string;       // plain Japanese text (newlines = paragraphs)
  passageId?: string;
  savedWords?: string[];    // already-saved term strings (to highlight)
  onWordSaved?: (w: { term: string; contentId: string }) => void;
}

interface ColItem {
  id:        string;
  name:      string;
  color:     string;
  wordCount: number;
}

// ─── Tokenizer ───────────────────────────────────────────────────────────────
// Splits text into word-level tokens by Japanese character type:
//   1. Kanji sequence + optional trailing hiragana (okurigana)  e.g. 食べ、勉強し
//   2. Katakana sequence                                         e.g. テレビ
//   3. Hiragana sequence (particles, aux. verbs)                 e.g. です、は
//   4. Everything else (ASCII, punctuation, numbers)             — not clickable
//
// This prevents entire sentences from being grouped as one token.

const TOKEN_RE = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u31F0-\u31FF]+[\u3041-\u309F]*|[\u30A1-\u30FF\uFF66-\uFF9F]+|[\u3041-\u309F]+|[^\u3041-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u31F0-\u31FF]+/g;
const IS_JAPANESE = /[\u3041-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u31F0-\u31FF]/;

function tokenize(text: string) {
  const tokens: { text: string; isCJK: boolean }[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(text)) !== null) {
    tokens.push({ text: m[0], isCJK: IS_JAPANESE.test(m[0]) });
  }
  return tokens;
}

// Extract surrounding sentence for context
function extractSentence(content: string, word: string): string {
  const boundaries = /[。！？…\n]/;
  const idx = content.indexOf(word);
  if (idx === -1) return '';
  let start = idx;
  let end = idx + word.length;
  while (start > 0 && !boundaries.test(content[start - 1])) start--;
  while (end < content.length && !boundaries.test(content[end])) end++;
  return content.slice(start, end).trim();
}

// ─── JLPT badge colour ────────────────────────────────────────────────────────
const JLPT_COLOR: Record<string, { bg: string; color: string }> = {
  'jlpt-n1': { bg: '#FFE4E6', color: '#BE123C' },
  'jlpt-n2': { bg: '#FFEDD5', color: '#C2410C' },
  'jlpt-n3': { bg: '#FEF9C3', color: '#92400E' },
  'jlpt-n4': { bg: '#DBEAFE', color: '#1D4ED8' },
  'jlpt-n5': { bg: '#DCFCE7', color: '#15803D' },
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({
  tip, onClose, onSave, isSaved, saving, lang, onLangChange, savedWordId,
}: {
  tip:          TooltipState;
  onClose:      () => void;
  onSave:       () => void;
  isSaved:      boolean;
  saving:       boolean;
  lang:         Lang;
  onLangChange: (l: Lang) => void;
  savedWordId:  string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // ── Collection picker state ──
  const [colPickerOpen, setColPickerOpen] = useState(false);
  const [colList,       setColList]       = useState<ColItem[]>([]);
  const [colsOfWord,    setColsOfWord]    = useState<Set<string>>(new Set());
  const [colsLoading,   setColsLoading]   = useState(false);
  const [newColName,    setNewColName]    = useState('');
  const [creatingCol,   setCreatingCol]   = useState(false);
  // resolvedId: from prop (just saved) or looked up lazily (pre-existing word)
  const resolvedId = useRef<string | null>(savedWordId);
  useEffect(() => { resolvedId.current = savedWordId; }, [savedWordId]);

  const openColPicker = useCallback(async () => {
    if (colPickerOpen) { setColPickerOpen(false); return; }
    setColPickerOpen(true);
    if (colList.length > 0 && resolvedId.current) return;
    setColsLoading(true);
    try {
      const [colsRes, wordsRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/words'),
      ]);
      const cols: ColItem[] = await colsRes.json();
      const words: any[]    = await wordsRes.json();
      // find by id (just saved) or by japanese text (pre-existing)
      const thisWord = resolvedId.current
        ? words.find(w => w.id === resolvedId.current)
        : words.find(w => w.japanese === tip.data?.word || w.japanese === tip.word);
      if (thisWord && !resolvedId.current) resolvedId.current = thisWord.id;
      setColList(cols);
      setColsOfWord(new Set((thisWord?.collections ?? []).map((c: any) => c.id) as string[]));
    } finally {
      setColsLoading(false);
    }
  }, [colPickerOpen, colList.length, tip.word, tip.data?.word]);

  const toggleCollection = useCallback(async (colId: string) => {
    if (!resolvedId.current) return;
    const isIn = colsOfWord.has(colId);
    setColsOfWord(prev => {
      const s = new Set(prev);
      isIn ? s.delete(colId) : s.add(colId);
      return s;
    });
    await fetch(`/api/collections/${colId}/words`, {
      method: isIn ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId: resolvedId.current }),
    });
    setColList(prev => prev.map(c =>
      c.id === colId ? { ...c, wordCount: c.wordCount + (isIn ? -1 : 1) } : c
    ));
  }, [colsOfWord]);

  const createCollection = useCallback(async () => {
    if (!newColName.trim() || !resolvedId.current) return;
    setCreatingCol(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newColName.trim() }),
      });
      if (!res.ok) { setCreatingCol(false); return; }
      const col: ColItem = await res.json();
      if (resolvedId.current) {
        await fetch(`/api/collections/${col.id}/words`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wordId: resolvedId.current }),
        });
      }
      setColList(prev => [...prev, { ...col, wordCount: resolvedId.current ? 1 : 0 }]);
      if (resolvedId.current) setColsOfWord(prev => new Set([...prev, col.id]));
      setNewColName('');
    } finally {
      setCreatingCol(false);
    }
  }, [newColName]);

  // Compute position: try above word, fall back to below
  const vw    = typeof window !== 'undefined' ? window.innerWidth  : 800;
  const vh    = typeof window !== 'undefined' ? window.innerHeight : 600;
  const TIP_W = 300;
  const TIP_MAX_H = 340;

  let left = tip.rect.left + tip.rect.width / 2 - TIP_W / 2;
  left     = Math.max(8, Math.min(left, vw - TIP_W - 8));

  const spaceAbove = tip.rect.top;
  const spaceBelow = vh - tip.rect.bottom;
  const placeAbove = spaceAbove > TIP_MAX_H || spaceAbove >= spaceBelow;
  const top = placeAbove
    ? tip.rect.top - 8   // will use transform to push up
    : tip.rect.bottom + 8;

  // Click-outside to close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Escape to close
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const jlpt = tip.data?.jlpt?.[0];
  const jlptStyle = jlpt ? (JLPT_COLOR[jlpt] ?? null) : null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Tra từ"
      style={{
        position:   'fixed',
        left,
        top:        placeAbove ? undefined : top,
        bottom:     placeAbove ? vh - tip.rect.top + 8 : undefined,
        width:      TIP_W,
        zIndex:     9999,
        background: 'white',
        border:     '1px solid var(--border)',
        borderRadius: 14,
        boxShadow:  '0 8px 32px rgba(0,0,0,0.16)',
        overflow:   'hidden',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2"
        style={{ background: 'var(--primary-light)' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold" style={{ color: 'var(--primary)', fontFamily: '"Noto Sans JP", serif' }}>
              {tip.data?.word || tip.word}
            </span>
            {jlptStyle && jlpt && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                style={{ background: jlptStyle.bg, color: jlptStyle.color }}>
                {jlpt.toUpperCase().replace('JLPT-', '')}
              </span>
            )}
            {tip.data?.is_common && (
              <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                style={{ background: '#DCFCE7', color: '#15803D' }}>common</span>
            )}
          </div>
          {tip.data?.reading && (
            <div className="text-sm mt-0.5" style={{ color: 'var(--primary)', fontFamily: '"Noto Sans JP", serif', opacity: 0.8 }}>
              {tip.data.reading}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {/* Language toggle */}
          <div className="flex rounded-lg overflow-hidden border text-xs font-bold" style={{ borderColor: 'var(--border)' }}>
            {(['en', 'vi'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                className="px-2 py-0.5 transition-colors"
                style={lang === l
                  ? { background: 'var(--primary)', color: 'white' }
                  : { background: 'white', color: 'var(--text-muted)' }
                }>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="btn-ghost p-1" aria-label="Đóng">
            <FaXmark size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 max-h-52 overflow-y-auto">
        {tip.loading ? (
          <div className="flex items-center gap-2 py-2" style={{ color: 'var(--text-muted)' }}>
            <FaSpinner size={13} className="animate-spin" /> Đang tra từ...
          </div>
        ) : !tip.data?.found ? (
          <p className="text-sm py-1" style={{ color: 'var(--text-muted)' }}>
            Không tìm thấy từ này trong từ điển.
          </p>
        ) : (
          <div className="space-y-2">
            {(tip.data.meanings ?? []).map((m, i) => (
              <div key={i}>
                {m.pos && (
                  <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--primary)', opacity: 0.7 }}>
                    {m.pos}
                  </div>
                )}
                <ol className="space-y-0.5 pl-4 list-decimal">
                  {m.defs.map((d, j) => (
                    <li key={j} className="text-sm" style={{ color: 'var(--text-base)' }}>{d}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

        {/* Context sentence */}
        {tip.context && (
          <div className="mt-3 p-2 rounded-lg text-xs italic"
            style={{ background: 'var(--bg-base)', color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif', lineHeight: 1.7 }}>
            {tip.context}
          </div>
        )}
      </div>

      {/* Footer — save button + collection picker */}
      <div className="px-4 pb-3 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={onSave}
          disabled={saving || (!tip.data?.found && !tip.loading)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all"
          style={
            isSaved
              ? { background: '#DCFCE7', color: '#15803D' }
              : { background: 'var(--primary)', color: 'white', opacity: saving ? 0.7 : 1 }
          }>
          {isSaved
            ? <><FaBookmark size={12} /> Đã lưu vào bộ sưu tập</>
            : saving
              ? <><FaSpinner size={12} className="animate-spin" /> Đang lưu...</>
              : <><FaRegBookmark size={12} /> Lưu vào bộ sưu tập</>
          }
        </button>

        {/* Collection classifier */}
        {isSaved && savedWordId && (
          <div className="mt-2">
            <button
              onClick={openColPicker}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'transparent' }}>
              <FaFolder size={11} />
              {colPickerOpen ? 'Thu gọn' : 'Phân loại vào chủ đề'}
            </button>

            {colPickerOpen && (
              <div className="mt-2">
                {colsLoading ? (
                  <div className="flex items-center gap-2 text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                    <FaSpinner size={10} className="animate-spin" /> Đang tải chủ đề...
                  </div>
                ) : (
                  <>
                    {colList.length === 0 && !newColName && (
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Chưa có chủ đề nào. Tạo mới bên dưới!</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {colList.map(col => {
                        const inCol = colsOfWord.has(col.id);
                        return (
                          <button
                            key={col.id}
                            onClick={() => toggleCollection(col.id)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-all"
                            style={inCol
                              ? { background: col.color, color: 'white' }
                              : { background: `${col.color}22`, color: col.color, border: `1px solid ${col.color}55` }
                            }>
                            {inCol ? <FaCheck size={9} /> : <FaPlus size={9} />}
                            {col.name}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-1">
                      <input
                        value={newColName}
                        onChange={e => setNewColName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') createCollection(); }}
                        placeholder="Tạo chủ đề mới..."
                        className="flex-1 text-xs px-2 py-1 rounded-lg border outline-none"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-base)', background: 'white' }}
                      />
                      <button
                        onClick={createCollection}
                        disabled={creatingCol || !newColName.trim()}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                        style={{ background: 'var(--primary)', color: 'white', opacity: (!newColName.trim() || creatingCol) ? 0.4 : 1 }}>
                        {creatingCol ? <FaSpinner size={10} className="animate-spin" /> : <FaPlus size={10} />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function JapaneseText({ content, passageId, savedWords = [], onWordSaved }: Props) {
  const { data: session } = useSession();
  const [tooltip,     setTooltip]     = useState<TooltipState | null>(null);
  const [savedSet,    setSavedSet]    = useState<Set<string>>(new Set(savedWords));
  const [saving,      setSaving]      = useState(false);
  const [justSaved,   setJustSaved]   = useState<string | null>(null);
  const [lang,        setLang]        = useState<Lang>('vi');
  const [savedWordId, setSavedWordId] = useState<string | null>(null); // DB id after save

  // Update savedSet when prop changes
  useEffect(() => { setSavedSet(new Set(savedWords)); }, [savedWords]);

  const fetchWord = useCallback(async (word: string, rect: DOMRect, context: string, currentLang: Lang) => {
    setTooltip({ word, context, rect, data: null, loading: true });
    setSavedWordId(null); // reset for new word
    try {
      const res = await fetch(`/api/dictionary?q=${encodeURIComponent(word)}&lang=${currentLang}`);
      const data: DictResult = await res.json();
      setTooltip(prev => prev ? { ...prev, data, loading: false } : prev);
    } catch {
      setTooltip(prev => prev ? { ...prev, data: { found: false }, loading: false } : prev);
    }
  }, []);

  const openWord = useCallback(async (word: string, rect: DOMRect, paragraphText: string) => {
    const context = extractSentence(paragraphText, word);
    await fetchWord(word, rect, context, lang);
  }, [fetchWord, lang]);

  // Re-fetch when user switches language while tooltip is open
  const handleLangChange = useCallback((newLang: Lang) => {
    setLang(newLang);
    if (tooltip && !tooltip.loading) {
      fetchWord(tooltip.word, tooltip.rect, tooltip.context, newLang);
    }
  }, [tooltip, fetchWord]);

  const handleSave = useCallback(async () => {
    if (!tooltip || !session) return;
    setSaving(true);
    const term = tooltip.data?.word || tooltip.word;

    const res = await fetch('/api/words', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        term,
        context: tooltip.context || null,
      }),
    });

    if (!res.ok) {
      // Word not in learning system — show a brief message but don't crash
      setSaving(false);
      return;
    }

    const wordData = await res.json();
    setSavedWordId(wordData.id ?? null);

    setSavedSet(prev => new Set([...prev, term]));
    setJustSaved(term);
    setTimeout(() => setJustSaved(null), 2500);
    onWordSaved?.({ term, contentId: wordData.contentId });
    setSaving(false);
  }, [tooltip, session, passageId, onWordSaved]);

  // Render paragraphs
  const paragraphs = content.split(/\n+/);

  return (
    <div>
      {paragraphs.map((para, pi) => {
        if (!para.trim()) return <div key={pi} className="h-4" />;
        const tokens = tokenize(para);
        return (
          <p key={pi} className="mb-5 leading-8 text-base" style={{ color: 'var(--text-base)' }}>
            {tokens.map((tok, ti) => {
              if (!tok.isCJK) {
                return <span key={ti}>{tok.text}</span>;
              }
              const isSaved = savedSet.has(tok.text);
              const isActive = tooltip?.word === tok.text;
              return (
                <span
                  key={ti}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isActive) { setTooltip(null); return; }
                    openWord(tok.text, (e.target as HTMLElement).getBoundingClientRect(), para);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLElement).click(); }}
                  style={{
                    cursor:       'pointer',
                    borderBottom: isSaved
                      ? '2px solid #4F46E5'
                      : isActive
                        ? '2px solid var(--primary)'
                        : '1px dashed rgba(61,58,140,0.3)',
                    background:   isActive
                      ? 'var(--primary-light)'
                      : isSaved
                        ? 'rgba(79,70,229,0.07)'
                        : 'transparent',
                    borderRadius: 2,
                    padding:      '0 1px',
                    transition:   'background 0.15s',
                    fontFamily:   '"Noto Sans JP", serif',
                    color:        isSaved ? 'var(--primary)' : 'inherit',
                  }}>
                  {tok.text}
                </span>
              );
            })}
          </p>
        );
      })}

      {/* Tooltip portal */}
      {tooltip && (
        <Tooltip
          tip={tooltip}
          onClose={() => setTooltip(null)}
          onSave={handleSave}
          isSaved={savedSet.has(tooltip.data?.word || tooltip.word)}
          saving={saving}
          lang={lang}
          onLangChange={handleLangChange}
          savedWordId={savedWordId}
        />
      )}

      {/* "Saved" flash toast */}
      {justSaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold"
          style={{ background: 'var(--primary)', color: 'white' }}>
          <FaBookmark size={12} />「{justSaved}」đã lưu vào bộ sưu tập
        </div>
      )}
    </div>
  );
}
