import React, { useState } from 'react';
import { VocabRefItem } from './../app/[lang]/vocab/page';
import { FaVolumeHigh } from 'react-icons/fa6';

interface FlashcardsTabProps {
  items: VocabRefItem[];
  color: string;
  font: string;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({ items, color, font }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);
  const [displayMode, setDisplayMode] = useState<'flashcard' | 'grid'>('flashcard');
  const [page, setPage] = useState(1);
  // Hiệu ứng chọn đáp án
  const [answerEffect, setAnswerEffect] = useState<'none' | 'correct' | 'wrong'>('none');
  const pageSize = 5; // Giảm còn 5 từ mỗi trang
  const totalPages = Math.ceil(items.length / pageSize);

  const total = items.length;
  const current = items[index];

  // Ref for grid container and item
  const gridContainerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to current item when index changes
  React.useEffect(() => {
    if (itemRefs.current[index] && gridContainerRef.current) {
      itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [index]);

  // Khi chuyển index, tự động cập nhật page nếu cần
  React.useEffect(() => {
    const newPage = Math.floor(index / pageSize) + 1;
    if (newPage !== page) setPage(newPage);
    // eslint-disable-next-line
  }, [index]);

  function next() {
    if (index + 1 >= total) { setFinished(true); return; }
    setIndex(i => i + 1); setFlipped(false); setAnswerEffect('none');
  }
  function prev() {
    if (index > 0) { setIndex(i => i - 1); setFlipped(false); setAnswerEffect('none'); }
  }
  function markKnown() {
    setKnown(s => new Set([...s, current.id]));
    setAnswerEffect('correct');
    setTimeout(() => { setAnswerEffect('none'); next(); }, 400);
  }
  function markUnknown() {
    setUnknown(s => new Set([...s, current.id]));
    setAnswerEffect('wrong');
    setTimeout(() => { setAnswerEffect('none'); next(); }, 400);
  }
  function restart() {
    setIndex(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); setFinished(false); setAnswerEffect('none');
  }

  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  // Tính toán progress meaningful
  const masteredCount = known.size;
  const reviewCount = unknown.size;
  const percentMastered = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
  const percentDone = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;
  const wordsLeft = total - (index + 1);
  const avgSecPerWord = 6; // giả định trung bình 6s/từ
  const estTimeSec = wordsLeft * avgSecPerWord;
  const estTimeMin = Math.ceil(estTimeSec / 60);

  if (total === 0) return <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu từ vựng.</div>;
  if (finished) return (
    <div className="card rounded-3xl p-8 text-center">
      <div className="text-4xl mb-4">🎉</div>
      <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-base)' }}>Hoàn thành!</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Bạn đã ôn tập {total} từ vựng
      </p>
      <div className="flex gap-6 justify-center mb-6">
        <div className="text-center">
          <div className="text-3xl font-extrabold" style={{ color: '#48BB78' }}>{known.size}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Đã thuộc</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-extrabold" style={{ color: '#F56565' }}>{unknown.size}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cần ôn thêm</div>
        </div>
      </div>
      <button onClick={restart}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white"
        style={{ background: color }}>
        Làm lại
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl flex gap-4">
      <div className="flex-[3] p-4 md:p-6">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
            <div className="h-2 rounded-full transition-all"
              style={{ width: `${(index / total) * 100}%`, background: color }} />
          </div>
          <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>
            {index + 1} / {total}
          </span>
        </div>
        {/* Stats badges */}
        <div className="flex gap-4 mb-2">
          <span className="text-xs px-2 py-1 rounded-xl font-bold"
            style={{ background: '#48BB7820', color: '#48BB78' }}>{known.size} đã thuộc</span>
          <span className="text-xs px-2 py-1 rounded-xl font-bold"
            style={{ background: '#F5656520', color: '#F56565' }}>{unknown.size} cần ôn</span>
        </div>
        {/* Flip card với hiệu ứng lật và hiệu ứng chọn đáp án */}
        <div className={`relative w-full h-[240px] mb-2`}
          style={{ perspective: '1200px', minHeight: '220px' }}>
          <button
            onClick={() => setFlipped(f => !f)}
            className={`absolute inset-0 w-full h-full rounded-3xl border text-center transition-all duration-500 hover:shadow-lg cursor-pointer flex items-center justify-center ${flipped ? 'rotate-y-180' : ''}`}
            style={{
              background: flipped ? `${color}12` : 'var(--bg-surface)',
              borderColor: flipped ? color : 'var(--border)',
              fontFamily: font,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.5s',
              boxShadow: answerEffect === 'correct' ? '0 0 0 4px #48BB7855' : answerEffect === 'wrong' ? '0 0 0 4px #F5656555' : undefined,
              zIndex: 2,
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {!flipped ? (
              <div className="flex flex-col items-center justify-center gap-2" style={{ backfaceVisibility: 'hidden' }}>
                <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>{current.term}</span>
                {current.pronunciation && (
                  <span className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{current.pronunciation}</span>
                )}
                <span className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Nhấn để xem nghĩa</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <span className="text-2xl font-bold" style={{ color }}>{current.meanings?.[0]?.meaning ?? ''}</span>
                <span className="text-lg mt-1" style={{ color: 'var(--text-secondary)' }}>{current.term}</span>
                {current.pronunciation && (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{current.pronunciation}</span>
                )}
              </div>
            )}
          </button>
        </div>
        {/* Action buttons: chỉ hiện khi đã lật card */}
        {flipped && (
          <div className="flex gap-3 mt-4">
            <button onClick={markUnknown}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-200 ${answerEffect === 'wrong' ? 'ring-2 ring-red-400 border-red-400 bg-red-50' : ''}`}
              style={{ borderColor: '#F56565', color: '#F56565' }}>
              Cần ôn lại
            </button>
            <button onClick={markKnown}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-200 ${answerEffect === 'correct' ? 'ring-2 ring-green-400 bg-green-500' : ''}`}
              style={{ background: '#48BB78' }}>
              Đã thuộc
            </button>
          </div>
        )}
      </div>
      {/* Grid list of vocab without scroll, only display 5 items per page */}
      <div className="flex-[1]">
        {/* Pagination controls trên đầu */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-3">
            <button
              className="px-3 py-1 rounded-lg border text-sm"
              style={{ color: page === 1 ? '#ccc' : 'var(--primary)', borderColor: 'var(--border)' }}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </button>
            <span className="text-xs font-semibold">Trang {page} / {totalPages}</span>
            <button
              className="px-3 py-1 rounded-lg border text-sm"
              style={{ color: page === totalPages ? '#ccc' : 'var(--primary)', borderColor: 'var(--border)' }}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Tiếp
            </button>
          </div>
        )}
        {/* Danh sách vocab không scroll, chỉ hiển thị 5 từ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3 bg-gray-50 border border-gray-300 rounded-2xl p-4 shadow-md">
          {pagedItems.map((item, idx) => (
            <div
              key={item.id}
              ref={el => itemRefs.current[(page - 1) * pageSize + idx] = el}
              className={`rounded-xl border-2 p-3 bg-white flex flex-col transition-all duration-150 shadow-sm ${(page - 1) * pageSize + idx === index ? 'ring-2 ring-blue-400 border-blue-400 bg-blue-50' : 'border-gray-200'} hover:bg-gray-100`}
              style={{ borderColor: (page - 1) * pageSize + idx === index ? '#3B82F6' : 'var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base truncate" style={{ color: 'var(--primary)', fontFamily: font }}>{(page - 1) * pageSize + idx + 1}. {item.term}</span>
                <button
                  className="p-1 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Phát âm"
                  onClick={() => {
                    const utter = new window.SpeechSynthesisUtterance(item.term);
                    utter.lang = 'ja-JP';
                    window.speechSynthesis.speak(utter);
                  }}>
                  <FaVolumeHigh size={16} style={{ color: 'var(--primary)' }} />
                </button>
                {item.pronunciation && <span className="text-xs mb-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{item.pronunciation}</span>}
                <span className="text-xs mb-0.5 truncate" style={{ color: 'var(--text-base)' }}>{item.meanings?.[0]?.meaning ?? ''}</span>
              </div>
              {item.examples && item.examples[0] && (
                <div className="text-xs mt-1 italic truncate" style={{ color: 'var(--text-secondary)' }}>
                  {(() => {
                    const parts = item.examples[0].exampleText.split(item.term);
                    if (parts.length > 1) {
                      return <>{parts[0]}<span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.term}</span>{parts[1]}</>;
                    }
                    return item.examples[0].exampleText;
                  })()}
                  {item.examples[0].translation && (
                    <span className="ml-1 font-semibold text-blue-700" style={{ color: 'var(--primary)' }}>
                      {item.examples[0].translation}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};