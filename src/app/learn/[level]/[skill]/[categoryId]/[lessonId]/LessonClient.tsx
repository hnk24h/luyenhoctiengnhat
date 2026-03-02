'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  vocab:   { label: '単語',   color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200' },
  kanji:   { label: '漢字',   color: 'text-red-700',   bg: 'bg-red-50 border-red-200' },
  grammar: { label: '文法',   color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  example: { label: '例文',   color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  phrase:  { label: '表現',   color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
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
        <div className="card mb-6 prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wide">
            {lessonType === 'vocab' ? '📝 Từ vựng' :
             lessonType === 'grammar' ? '📐 Ngữ pháp' : '📋 Nội dung'}
            <span className="ml-2 text-gray-400 font-normal normal-case">({items.length} mục)</span>
          </h2>
          <div className="space-y-3">
            {items.map(item => {
              const ti = TYPE_LABELS[item.type] ?? { label: item.type, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' };
              const isFlipped = flipped[item.id];
              return (
                <div key={item.id}
                  className={`rounded-xl border p-4 transition ${ti.bg} cursor-pointer select-none`}
                  onClick={() => setFlipped(f => ({ ...f, [item.id]: !f[item.id] }))}>
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${ti.color} border border-current bg-white shrink-0`}>
                      {ti.label}
                    </span>
                    <div className="flex-1">
                      {/* Japanese + reading */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-gray-900 font-japanese">{item.japanese}</span>
                        {item.reading && (
                          <span className="text-sm text-gray-500">【{item.reading}】</span>
                        )}
                        <button
                          className={`text-sm px-1.5 py-0.5 rounded transition ${speaking === item.id ? 'text-white bg-blue-500' : 'text-blue-500 hover:bg-blue-50'}`}
                          title="Nghe phát âm tiếng Nhật"
                          onClick={e => {
                            e.stopPropagation();
                            if (item.audioUrl) {
                              new Audio(item.audioUrl).play();
                            } else {
                              speak(item.japanese, item.id);
                            }
                          }}>
                          {speaking === item.id ? '⏹' : '🔊'}
                        </button>
                      </div>

                      {/* Meaning (click to reveal) */}
                      <div className={`mt-1 transition-all ${isFlipped ? '' : 'blur-sm select-none'}`}>
                        <span className="text-base font-semibold text-gray-700">{item.meaning}</span>
                      </div>
                      {!isFlipped && (
                        <div className="text-xs text-gray-400 mt-0.5">👆 Nhấn để xem nghĩa</div>
                      )}

                      {/* Example */}
                      {isFlipped && item.example && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-800 font-japanese">{item.example}</p>
                            <button
                              className={`text-xs px-1 py-0.5 rounded transition ${speaking === item.id + '_ex' ? 'text-white bg-green-500' : 'text-green-500 hover:bg-green-50'}`}
                              title="Nghe câu ví dụ"
                              onClick={e => { e.stopPropagation(); speak(item.example!, item.id + '_ex'); }}>
                              {speaking === item.id + '_ex' ? '⏹' : '🔊'}
                            </button>
                          </div>
                          {item.exampleReading && (
                            <p className="text-xs text-gray-500">{item.exampleReading}</p>
                          )}
                          {item.exampleMeaning && (
                            <p className="text-xs text-gray-600 italic">{item.exampleMeaning}</p>
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
          <p className="text-xs text-gray-400 mt-3 text-center">💡 Nhấn 🔊 để nghe phát âm · Nhấn vào từng mục để xem nghĩa và ví dụ</p>
        </div>
      )}

      {/* Complete + Navigation */}
      <div className="card flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3">
          {prevLesson ? (
            <Link href={navUrl(prevLesson)} className="btn-secondary text-sm">← {prevLesson.title}</Link>
          ) : (
            <div />
          )}
        </div>

        <button onClick={markComplete} disabled={completed || marking || !isLoggedIn}
          className={`btn-primary px-6 ${completed ? 'bg-green-600 hover:bg-green-700' : ''}`}>
          {completed ? '✓ Đã học xong' : marking ? 'Đang lưu...' : isLoggedIn ? '✅ Đánh dấu hoàn thành' : '🔒 Đăng nhập để lưu tiến trình'}
        </button>

        <div>
          {nextLesson ? (
            <Link href={navUrl(nextLesson)} className="btn-primary text-sm">Bài tiếp → {nextLesson.title}</Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
