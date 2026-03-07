'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight, FaCircleCheck, FaCircleXmark, FaRotate } from 'react-icons/fa6';

const KA_LIST = [
  { code: 'integration',    nameVi: 'Tích hợp',         color: '#6C5CE7' },
  { code: 'scope',          nameVi: 'Phạm vi',           color: '#0984E3' },
  { code: 'schedule',       nameVi: 'Lịch trình',        color: '#00B894' },
  { code: 'cost',           nameVi: 'Chi phí',           color: '#F6AD55' },
  { code: 'quality',        nameVi: 'Chất lượng',        color: '#E17055' },
  { code: 'resource',       nameVi: 'Nguồn lực',         color: '#A29BFE' },
  { code: 'communications', nameVi: 'Truyền thông',      color: '#74B9FF' },
  { code: 'risk',           nameVi: 'Rủi ro',            color: '#FF7675' },
  { code: 'procurement',    nameVi: 'Mua sắm',           color: '#55EFC4' },
  { code: 'stakeholder',    nameVi: 'Stakeholders',      color: '#FD79A8' },
];

type Question = {
  id: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  explain: string | null;
  difficulty: string;
  area: string | null;
};

type AnswerRecord = { questionId: string; selected: string; correct: boolean };

export default function PMPExamPage() {
  const [mode, setMode] = useState<'config' | 'quiz' | 'result'>('config');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [showExplain, setShowExplain] = useState(false);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedArea ? `/api/pmp/questions?area=${selectedArea}` : '/api/pmp/questions';
      const res = await fetch(url);
      const data: Question[] = await res.json();
      // Shuffle
      const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);
      setCurrent(0); setSelected(null); setAnswered(false); setAnswers([]);
      setMode('quiz');
    } catch { setQuestions([]); } finally { setLoading(false); }
  }, [selectedArea]);

  const q = questions[current];
  const options = q ? [
    { key: 'A', text: q.optionA },
    { key: 'B', text: q.optionB },
    { key: 'C', text: q.optionC },
    { key: 'D', text: q.optionD },
  ] : [];

  function handleSelect(key: string) {
    if (answered) return;
    setSelected(key);
    setAnswered(true);
    setAnswers(prev => [...prev, { questionId: q.id, selected: key, correct: key === q.answer }]);
  }

  function next() {
    setShowExplain(false);
    if (current + 1 >= questions.length) { setMode('result'); return; }
    setCurrent(c => c + 1); setSelected(null); setAnswered(false);
  }

  const score = answers.filter(a => a.correct).length;

  if (mode === 'config') {
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/pmp" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <FaArrowLeft size={12} /> PMP
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Luyện thi</span>
          </div>

          <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Luyện thi PMP</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Chọn Knowledge Area để luyện tập có trọng tâm, hoặc thi tổng hợp tất cả.</p>

          <div className="card border rounded-3xl p-6 mb-6" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Chọn Knowledge Area</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSelectedArea(null)}
                className="flex items-center gap-2 px-3 py-3 rounded-2xl text-sm font-semibold border-2 transition-all"
                style={!selectedArea
                  ? { borderColor: '#2b6cb0', background: '#2b6cb015', color: '#2b6cb0' }
                  : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                🎯 Tất cả (Mix)
              </button>
              {KA_LIST.map(ka => (
                <button
                  key={ka.code}
                  onClick={() => setSelectedArea(ka.code)}
                  className="flex items-center gap-2 px-3 py-3 rounded-2xl text-sm font-semibold border-2 transition-all"
                  style={selectedArea === ka.code
                    ? { borderColor: ka.color, background: `${ka.color}15`, color: ka.color }
                    : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {ka.nameVi}
                </button>
              ))}
            </div>

            <div className="rounded-2xl p-4 text-sm" style={{ background: 'var(--bg-muted)' }}>
              <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Về bài thi</div>
              <ul className="space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <li>• 10 câu hỏi ngẫu nhiên từ ngân hàng đề</li>
                <li>• Câu hỏi tình huống theo chuẩn PMP</li>
                <li>• Có giải thích chi tiết sau mỗi câu</li>
                <li>• Xem điểm và nhận xét ở cuối</li>
              </ul>
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: '#2b6cb0', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang tải câu hỏi...' : '🚀 Bắt đầu luyện thi'}
          </button>
        </div>
      </main>
    );
  }

  if (mode === 'result') {
    const pct = Math.round((score / questions.length) * 100);
    const pass = pct >= 70;
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="card border rounded-3xl p-8 text-center mb-6" style={{ borderColor: 'var(--border)' }}>
            <div className="text-5xl mb-4">{pass ? '🎉' : '📚'}</div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
              {pass ? 'Xuất sắc!' : 'Cần ôn thêm!'}
            </h2>
            <div className="text-5xl font-extrabold my-4" style={{ color: pass ? '#48BB78' : '#F56565' }}>{pct}%</div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Đúng {score}/{questions.length} câu
              {selectedArea ? ` — ${KA_LIST.find(k => k.code === selectedArea)?.nameVi}` : ' — Tổng hợp'}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={startQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
                style={{ background: '#2b6cb0' }}>
                <FaRotate size={13} /> Thi lại
              </button>
              <button onClick={() => setMode('config')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <FaArrowLeft size={12} /> Chọn lại
              </button>
            </div>
          </div>

          {/* Review answers */}
          <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Xem lại đáp án</h3>
          <div className="flex flex-col gap-3">
            {questions.map((q2, i) => {
              const rec = answers[i];
              const isCorrect = rec?.correct;
              return (
                <div key={q2.id} className="card border rounded-2xl p-4" style={{ borderColor: isCorrect ? '#48BB7840' : '#F5656540', background: isCorrect ? '#48BB7808' : '#F5656508' }}>
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? <FaCircleCheck size={14} style={{ color: '#48BB78', flexShrink: 0, marginTop: 2 }} /> : <FaCircleXmark size={14} style={{ color: '#F56565', flexShrink: 0, marginTop: 2 }} />}
                    <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{i + 1}. {q2.content}</p>
                  </div>
                  <p className="text-xs ml-5 mb-1" style={{ color: isCorrect ? '#48BB78' : '#F56565' }}>
                    Đáp án đúng: <strong>{q2.answer}</strong>
                    {rec && rec.selected !== q2.answer && <span style={{ color: '#F56565' }}> | Bạn chọn: {rec.selected}</span>}
                  </p>
                  {q2.explain && (
                    <p className="text-xs ml-5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{q2.explain}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // Quiz mode
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${(current / questions.length) * 100}%`, background: '#2b6cb0' }} />
          </div>
          <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>{current + 1} / {questions.length}</span>
        </div>

        {/* Difficulty badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-xl font-bold ${q.difficulty === 'easy' ? 'text-green-700' : q.difficulty === 'hard' ? 'text-red-600' : 'text-yellow-700'}`}
            style={{ background: q.difficulty === 'easy' ? '#48BB7820' : q.difficulty === 'hard' ? '#F5656520' : '#F6AD5520' }}>
            {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
          </span>
          {q.area && (
            <span className="text-xs px-2.5 py-1 rounded-xl font-semibold" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
              {KA_LIST.find(k => k.code === q.area)?.nameVi ?? q.area}
            </span>
          )}
        </div>

        {/* Question */}
        <div className="card border rounded-3xl p-6 mb-5" style={{ borderColor: 'var(--border)' }}>
          <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>{q.content}</p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 mb-5">
          {options.map(opt => {
            let bg = 'var(--bg-surface)', border = 'var(--border)', color = 'var(--text-primary)';
            if (answered) {
              if (opt.key === q.answer) { bg = '#48BB7818'; border = '#48BB78'; color = '#1a6b3a'; }
              else if (opt.key === selected) { bg = '#F5656518'; border = '#F56565'; color = '#9b1c1c'; }
            } else if (selected === opt.key) { bg = '#2b6cb015'; border = '#2b6cb0'; color = '#2b6cb0'; }
            return (
              <button key={opt.key}
                onClick={() => handleSelect(opt.key)}
                disabled={answered}
                className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all"
                style={{ background: bg, borderColor: border }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl text-xs font-bold mt-0.5"
                  style={{ background: border === 'var(--border)' ? 'var(--bg-muted)' : border, color: border === 'var(--border)' ? 'var(--text-muted)' : '#fff' }}>
                  {opt.key}
                </span>
                <span className="text-sm leading-snug" style={{ color }}>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Explain */}
        {answered && q.explain && (
          <div className="rounded-2xl p-4 mb-4 border" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
            <button onClick={() => setShowExplain(e => !e)} className="flex items-center gap-2 text-sm font-semibold w-full text-left" style={{ color: '#2b6cb0' }}>
              💡 Giải thích {showExplain ? '▲' : '▼'}
            </button>
            {showExplain && <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{q.explain}</p>}
          </div>
        )}

        {answered && (
          <button onClick={next}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background: '#2b6cb0' }}>
            {current + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp theo'} <FaArrowRight size={12} />
          </button>
        )}
      </div>
    </main>
  );
}
