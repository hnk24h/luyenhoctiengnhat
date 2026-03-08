'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SKILLS, formatDuration } from '@/lib/utils';
import { SkillIcon } from '@/components/SkillIcon';
import { FaHeadphones, FaCircleCheck, FaClock } from 'react-icons/fa6';

interface Question {
  id: string;
  type: string;
  content: string;
  options: string[] | null;
  audioUrl: string | null;
  imageUrl: string | null;
  order: number;
}

interface Props {
  examSetId: string;
  title: string;
  skill: string;
  level: string;
  timeLimit: number | null;
  questions: Question[];
}

export default function ExamClient({ examSetId, title, skill, level, timeLimit, questions }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);

  const skillInfo = SKILLS.find(s => s.key === skill);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examSetId, answers }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/results/${data.sessionId}`);
    } else {
      alert(data.message || 'Có lỗi xảy ra, thử lại nhé!');
      setSubmitting(false);
    }
  }, [submitting, examSetId, answers, router]);

  useEffect(() => {
    if (!started || !timeLimit) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, timeLimit, handleSubmit]);

  function setAnswer(questionId: string, val: string) {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
  }

  if (!started) {
    return (
      <div className="card max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
          <SkillIcon skill={skill} size={28} />
        </div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-6">
          <span>Cấp độ {level}</span>
          <span>·</span>
          <span>Kỹ năng {skillInfo?.label ?? skill}</span>
          <span>·</span>
          <span>{questions.length} câu hỏi</span>
          {timeLimit && <><span>·</span><span>⏱ {Math.round(timeLimit / 60)} phút</span></>}
        </div>
        <button className="btn-primary px-10 py-3 text-base" onClick={() => setStarted(true)}>
          Bắt đầu làm bài
        </button>
      </div>
    );
  }

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      {/* Header bar */}
      <div className="card mb-4 flex items-center justify-between py-3 px-4">
        <div className="text-sm font-medium text-gray-700">{title}</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{answeredCount}/{questions.length} đã trả lời</span>
          {timeLimit ? (
            <span className={`font-mono font-bold flex items-center gap-1 ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
              <FaClock size={13}/> {formatDuration(timeLeft)}
            </span>
          ) : null}
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary text-xs py-1.5 px-4">
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Question nav panel */}
        <div className="hidden md:block w-48 shrink-0">
          <div className="card p-3">
            <div className="text-xs font-medium text-gray-500 mb-2">Danh sách câu</div>
            <div className="grid grid-cols-5 gap-1">
              {questions.map((qItem, idx) => (
                <button key={qItem.id}
                  onClick={() => setCurrent(idx)}
                  className={`h-7 w-7 text-xs rounded font-medium transition
                    ${current === idx ? 'bg-red-600 text-white' :
                      answers[qItem.id] ? 'bg-green-100 text-green-700 border border-green-300' :
                      'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main question area */}
        <div className="flex-1 card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Câu {current + 1} / {questions.length}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${skillInfo?.color ?? 'bg-gray-100'}`}>
              {q.type === 'tracnghiem' ? 'Trắc nghiệm' : q.type === 'dien_tu' ? 'Điền từ' : 'Nghe'}
            </span>
          </div>

          {/* Audio */}
          {q.audioUrl && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
              <FaHeadphones size={18} className="text-blue-500 shrink-0"/>
              <audio controls src={q.audioUrl} className="flex-1 h-8" />
            </div>
          )}

          {/* Image */}
          {q.imageUrl && (
            <div className="mb-4">
              <img src={q.imageUrl} alt="Hình câu hỏi" className="rounded-lg max-h-60 object-contain border" />
            </div>
          )}

          {/* Content */}
          <div className="text-base font-medium text-gray-900 mb-5 leading-relaxed whitespace-pre-wrap">{q.content}</div>

          {/* Trắc nghiệm */}
          {q.type === 'tracnghiem' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
                    ${answers[q.id] === opt ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <input type="radio" name={q.id} value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswer(q.id, opt)}
                    className="accent-red-600" />
                  <span className="text-gray-800">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* Điền từ */}
          {q.type === 'dien_tu' && (
            <input
              type="text"
              className="input max-w-sm"
              placeholder="Nhập câu trả lời..."
              value={answers[q.id] ?? ''}
              onChange={e => setAnswer(q.id, e.target.value)}
            />
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0} className="btn-secondary">← Câu trước</button>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)} className="btn-primary">Câu tiếp →</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-1.5">
                {submitting ? 'Đang nộp...' : <><FaCircleCheck size={14}/> Nộp bài</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
