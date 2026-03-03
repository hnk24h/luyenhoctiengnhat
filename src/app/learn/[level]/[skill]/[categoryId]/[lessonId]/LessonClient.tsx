'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaFileLines, FaRuler, FaListUl, FaVolumeHigh, FaStop, FaLightbulb, FaCircleCheck, FaLock, FaHandPointer } from 'react-icons/fa6';

interface LearningItem {
  id: string; type: string; japanese: string; reading: string | null;
  meaning: string; example: string | null; exampleReading: string | null;
  exampleMeaning: string | null; audioUrl: string | null; imageUrl: string | null; order: number;
}

interface NavLesson { id: string; title: string; categoryId: string; level: string; skill: string }

interface Props {
  lessonId: string;
  lessonType: string;
  content: string | null;
  items: LearningItem[];
  isCompleted: boolean;
  isLoggedIn: boolean;
  prevLesson: NavLesson | null;
  nextLesson: NavLesson | null;
}

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  vocab:   { label: '単語',   color: '#1D4ED8',  bg: '#EFF6FF', border: '#BFDBFE' },
  kanji:   { label: '漢字',   color: '#B91C1C',  bg: '#FEF2F2', border: '#FECACA' },
  grammar: { label: '文法',   color: '#6D28D9',  bg: '#F5F3FF', border: '#DDD6FE' },
  example: { label: '例文',   color: '#065F46',  bg: '#F0FDF4', border: '#A7F3D0' },
  phrase:  { label: '表現',   color: '#C2410C',  bg: '#FFF7ED', border: '#FED7AA' },
};

export default function LessonClient({ lessonId, lessonType, content, items, isCompleted: initCompleted, isLoggedIn, prevLesson, nextLesson }: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initCompleted);
  const [marking, setMarking] = useState(false);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [speaking, setSpeaking] = useState<string | null>(null);

  const speak = useCallback((text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (speaking === id) { setSpeaking(null); return; }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ja-JP';
    utter.rate = 0.85;
    // Prefer a Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.startsWith('ja'));
    if (jaVoice) utter.voice = jaVoice;
    utter.onstart = () => setSpeaking(id);
    utter.onend = () => setSpeaking(null);
    utter.onerror = () => setSpeaking(null);
    window.speechSynthesis.speak(utter);
  }, [speaking]);

  function navUrl(l: NavLesson) {
    return `/learn/${l.level}/${l.skill}/${l.categoryId}/${l.id}`;
  }

  async function markComplete() {
    if (!isLoggedIn) { router.push('/login'); return; }
    setMarking(true);
    const res = await fetch('/api/learn/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, completed: true }),
    });
    if (res.ok) { setCompleted(true); router.refresh(); }
    setMarking(false);
  }

  return (
    <div>
      {/* Markdown/text content */}
      {content && (
        <div className="card mb-6 prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {content}
        </div>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-sm mb-3 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            {lessonType === 'vocab'   ? <><FaFileLines size={13}/> Từ vựng</> :
             lessonType === 'grammar' ? <><FaRuler     size={13}/> Ngữ pháp</> :
             <><FaListUl size={13}/> Nội dung</>}
            <span className="ml-2 font-normal normal-case" style={{ color: 'var(--text-muted)' }}>({items.length} mục)</span>
          </h2>
          <div className="space-y-3">
            {items.map(item => {
              const ti = TYPE_LABELS[item.type] ?? { label: item.type, color: 'var(--text-secondary)', bg: 'var(--bg-muted)', border: 'var(--border)' };
              const isFlipped = flipped[item.id];
              return (
                <div key={item.id}
                  className="rounded-xl border p-4 transition-all cursor-pointer select-none hover:shadow-md"
                  style={{ background: ti.bg, borderColor: ti.border }}
                  onClick={() => setFlipped(f => ({ ...f, [item.id]: !f[item.id] }))}>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded border bg-white shrink-0" style={{ color: ti.color, borderColor: ti.color }}>
                      {ti.label}
                    </span>
                    <div className="flex-1">
                      {/* Japanese + reading */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold font-japanese" style={{ color: 'var(--text-primary)' }}>{item.japanese}</span>
                        {item.reading && (
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>【{item.reading}】</span>
                        )}
                        <button
                          className="text-sm px-1.5 py-0.5 rounded-md transition"
                          style={speaking === item.id
                            ? { background: 'var(--primary)', color: '#fff' }
                            : { color: 'var(--primary)', background: 'var(--primary-light)' }}
                          title="Nghe phát âm tiếng Nhật"
                          onClick={e => {
                            e.stopPropagation();
                            if (item.audioUrl) {
                              new Audio(item.audioUrl).play();
                            } else {
                              speak(item.japanese, item.id);
                            }
                          }}>
                          {speaking === item.id ? <FaStop size={12}/> : <FaVolumeHigh size={12}/>}
                        </button>
                      </div>

                      {/* Meaning (click to reveal) */}
                      <div className={`mt-1 transition-all ${isFlipped ? '' : 'blur-sm select-none'}`}>
                        <span className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.meaning}</span>
                      </div>
                      {!isFlipped && (
                        <div className="text-xs mt-0.5 flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}><FaHandPointer size={10}/> Nhấn để xem nghĩa</div>
                      )}

                      {/* Example */}
                      {isFlipped && item.example && (
                        <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium font-japanese" style={{ color: 'var(--text-primary)' }}>{item.example}</p>
                            <button
                              className="text-xs px-1 py-0.5 rounded transition"
                              style={speaking === item.id + '_ex'
                                ? { background: '#059669', color: '#fff' }
                                : { color: '#059669', background: '#D1FAE5' }}
                              title="Nghe câu ví dụ"
                              onClick={e => { e.stopPropagation(); speak(item.example!, item.id + '_ex'); }}>
                            {speaking === item.id + '_ex' ? <FaStop size={10}/> : <FaVolumeHigh size={10}/>}
                            </button>
                          </div>
                          {item.exampleReading && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.exampleReading}</p>
                          )}
                          {item.exampleMeaning && (
                            <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>{item.exampleMeaning}</p>
                          )}
                        </div>
                      )}

                      {/* Image */}
                      {isFlipped && item.imageUrl && (
                        <img src={item.imageUrl} alt="" className="mt-2 rounded max-h-32 object-contain" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs mt-3 text-center flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <FaLightbulb size={12}/> Nhấn <FaVolumeHigh size={12}/> để nghe phát âm · Nhấn vào từng mục để xem nghĩa và ví dụ
          </p>
        </div>
      )}

      {/* Complete + Navigation */}
      <div className="card flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3">
          {prevLesson ? (
            <Link href={navUrl(prevLesson)} className="btn-secondary text-sm">← {prevLesson.title}</Link>
          ) : <div />}
        </div>

        <button onClick={markComplete} disabled={completed || marking || !isLoggedIn}
          className="btn-primary px-6"
          style={completed ? { background: '#059669', boxShadow: '0 2px 12px rgba(5,150,105,.3)' } : {}}>
          {completed
            ? <><FaCircleCheck size={14}/> Đã học xong</>
            : marking ? 'Đang lưu...'
            : isLoggedIn
              ? <><FaCircleCheck size={14}/> Đánh dấu hoàn thành</>
              : <><FaLock size={14}/> Đăng nhập để lưu tiến trình</>}
        </button>

        <div>
          {nextLesson ? (
            <Link href={navUrl(nextLesson)} className="btn-primary text-sm">Bài tiếp → {nextLesson.title}</Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
