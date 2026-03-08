'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { FaFileLines, FaRuler, FaListUl, FaVolumeHigh, FaStop, FaLightbulb, FaCircleCheck, FaLock, FaHandPointer } from 'react-icons/fa6';
import { useTheme } from '@/context/ThemeContext';

interface ContentMeaning { id: string; language: string; meaning: string }
interface ContentExample { id: string; exampleText: string; translation: string | null; language: string; translationLanguage: string | null }
interface LearningItem {
  id: string; type: string; language: string; term: string; pronunciation: string | null;
  meanings: ContentMeaning[]; examples: ContentExample[]; audioUrl: string | null; imageUrl: string | null; order: number;
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

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string; border: string; badgeBg: string }> = {
  vocab:     { label: '単語',   color: '#1D4ED8',  bg: '#EFF6FF', border: '#BFDBFE', badgeBg: '#FFFFFF' },
  character: { label: '文字',   color: '#B91C1C',  bg: '#FEF2F2', border: '#FECACA', badgeBg: '#FFFFFF' },
  grammar:   { label: '文法',   color: '#6D28D9',  bg: '#F5F3FF', border: '#DDD6FE', badgeBg: '#FFFFFF' },
  example:   { label: '例文',   color: '#065F46',  bg: '#F0FDF4', border: '#A7F3D0', badgeBg: '#FFFFFF' },
  phrase:    { label: '表現',   color: '#C2410C',  bg: '#FFF7ED', border: '#FED7AA', badgeBg: '#FFFFFF' },
  tone:      { label: '声調',   color: '#0891B2',  bg: '#F0FDFA', border: '#99F6E4', badgeBg: '#FFFFFF' },
  idiom:     { label: '慣用句', color: '#7C3AED',  bg: '#FAF5FF', border: '#E9D5FF', badgeBg: '#FFFFFF' },
};

const TYPE_LABELS_DARK: Record<string, { label: string; color: string; bg: string; border: string; badgeBg: string }> = {
  vocab:     { label: '単語',   color: '#93C5FD', bg: '#1B2B46', border: '#29456E', badgeBg: '#16243B' },
  character: { label: '文字',   color: '#FDA4AF', bg: '#3A1E28', border: '#5B2B38', badgeBg: '#321924' },
  grammar:   { label: '文法',   color: '#C4B5FD', bg: '#2C2145', border: '#463068', badgeBg: '#241B39' },
  example:   { label: '例文',   color: '#86EFAC', bg: '#1D352A', border: '#2E533F', badgeBg: '#172B22' },
  phrase:    { label: '表現',   color: '#FDBA74', bg: '#3B281B', border: '#5A3C28', badgeBg: '#322216' },
  tone:      { label: '声調',   color: '#67E8F9', bg: '#0C2A30', border: '#164E63', badgeBg: '#0A2029' },
  idiom:     { label: '慣用句', color: '#C4B5FD', bg: '#2A1A40', border: '#4A2E7A', badgeBg: '#1E1332' },
};

export default function LessonClient({ lessonId, lessonType, content, items, isCompleted: initCompleted, isLoggedIn, prevLesson, nextLesson }: Props) {
  const router = useRouter();
  const routeParams = useParams();
  const currentLang = (routeParams?.lang as string) ?? 'ja';
  const { resolvedAppearance } = useTheme();
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
    return `/${currentLang}/learn/${l.level}/${l.skill}/${l.categoryId}/${l.id}`;
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

  const typePalette = resolvedAppearance === 'dark' ? TYPE_LABELS_DARK : TYPE_LABELS;

  return (
    <div>
      {/* Markdown/text content */}
      {content && (
        <div className="card mb-6 prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}>
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
            <span className="ml-2 font-normal normal-case" style={{ color: 'var(--text-secondary)' }}>({items.length} mục)</span>
          </h2>
          <div className="space-y-3">
            {items.map(item => {
              const ti = typePalette[item.type] ?? {
                label: item.type,
                color: 'var(--text-secondary)',
                bg: 'var(--bg-muted)',
                border: 'var(--border)',
                badgeBg: 'var(--bg-surface)',
              };
              const isFlipped = flipped[item.id];
              return (
                <div key={item.id}
                  className="rounded-2xl border p-4 transition-all hover:shadow-md"
                  style={{ background: ti.bg, borderColor: ti.border }}>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded border shrink-0" style={{ color: ti.color, borderColor: ti.color, background: ti.badgeBg }}>
                      {ti.label}
                    </span>
                    <div className="flex-1">
                      {/* Japanese + reading */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold font-japanese" style={{ color: 'var(--text-primary)' }}>{item.term}</span>
                        {item.pronunciation && (
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>【{item.pronunciation}】</span>
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
                              speak(item.term, item.id);
                            }
                          }}>
                          {speaking === item.id ? <FaStop size={12}/> : <FaVolumeHigh size={12}/>}
                        </button>
                        <button
                          type="button"
                          className="text-xs px-2.5 py-1 rounded-md font-semibold transition"
                          style={isFlipped
                            ? { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }
                            : { background: 'var(--primary-light)', color: 'var(--primary)' }}
                          onClick={() => setFlipped(f => ({ ...f, [item.id]: !f[item.id] }))}>
                          {isFlipped ? 'Ẩn nghĩa' : 'Xem nghĩa'}
                        </button>
                      </div>

                      {/* Meaning */}
                      {isFlipped ? (
                        <div className="mt-2">
                          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{item.meanings?.[0]?.meaning ?? ''}</span>
                        </div>
                      ) : (
                        <div className="mt-2 rounded-xl border border-dashed px-3 py-3 text-sm"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}>
                          <div className="flex items-center gap-1.5"><FaHandPointer size={10}/> Nghĩa đang được ẩn để bạn tự nhớ lại trước khi mở.</div>
                        </div>
                      )}

                      {/* Example */}
                      {isFlipped && item.examples?.[0] && (
                        <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium font-japanese" style={{ color: 'var(--text-primary)' }}>{item.examples[0].exampleText}</p>
                            <button
                              className="text-xs px-1 py-0.5 rounded transition"
                              style={speaking === item.id + '_ex'
                                ? { background: '#059669', color: '#fff' }
                                : { color: '#059669', background: '#D1FAE5' }}
                              title="Nghe câu ví dụ"
                              onClick={e => { e.stopPropagation(); speak(item.examples![0].exampleText, item.id + '_ex'); }}>
                            {speaking === item.id + '_ex' ? <FaStop size={10}/> : <FaVolumeHigh size={10}/>}
                            </button>
                          </div>
                          {item.examples[0].translation && (
                            <p className="text-xs italic mt-1" style={{ color: 'var(--text-primary)' }}>{item.examples[0].translation}</p>
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
          <p className="text-xs mt-3 text-center flex items-center justify-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <FaLightbulb size={12}/> Nhấn <FaVolumeHigh size={12}/> để nghe phát âm · Nhấn vào từng mục để xem nghĩa và ví dụ
          </p>
        </div>
      )}

      {/* Complete + Navigation */}
      <div className="card flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3">
          {prevLesson ? (
            <Link href={navUrl(prevLesson)} className="btn-secondary text-sm max-w-[240px] truncate">← {prevLesson.title}</Link>
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
            <Link href={navUrl(nextLesson)} className="btn-primary text-sm max-w-[240px] truncate">Bài tiếp → {nextLesson.title}</Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
