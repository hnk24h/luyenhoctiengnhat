import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getSkillLabel, SKILLS } from '@/lib/utils';

interface Props { params: { id: string } }

async function getSession(id: string) {
  return prisma.examSession.findUnique({
    where: { id },
    include: {
      examSet: { include: { level: true, questions: { orderBy: { order: 'asc' } } } },
      user: { select: { name: true } },
    },
  });
}

export default async function ResultsPage({ params }: Props) {
  const session = await getSession(params.id);
  if (!session) notFound();

  const answers: Record<string, string> = JSON.parse(session.answers || '{}');
  const questions = session.examSet.questions;
  const skillInfo = SKILLS.find(s => s.key === session.examSet.skill);

  const correctMap: Record<string, string | string[]> = {};
  questions.forEach(q => {
    try { correctMap[q.id] = JSON.parse(q.answer); } catch { correctMap[q.id] = q.answer; }
  });

  const scorePercent = session.totalQ > 0 ? Math.round((session.correctQ / session.totalQ) * 100) : 0;
  const passed = scorePercent >= 60;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Result summary */}
      <div className={`card mb-8 text-center py-10 border-2 ${passed ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}`}>
        <div className="text-5xl mb-3">{passed ? '🎉' : '📚'}</div>
        <h1 className="text-3xl font-bold mb-1">{passed ? 'Xuất sắc!' : 'Hãy ôn luyện thêm!'}</h1>
        <p className="text-gray-600 mb-4">{session.examSet.title} · {session.examSet.level.code} · {skillInfo?.label}</p>
        <div className="text-6xl font-bold mb-2" style={{ color: passed ? '#16a34a' : '#dc2626' }}>
          {scorePercent}%
        </div>
        <div className="text-gray-600 text-sm">
          Đúng {session.correctQ} / {session.totalQ} câu
        </div>
        {session.finishedAt && session.startedAt && (
          <div className="text-xs text-gray-400 mt-2">
            Thời gian: {Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 1000 / 60)} phút
          </div>
        )}
        <div className="flex justify-center gap-3 mt-6">
          <Link href={`/exam/${session.examSetId}`} className="btn-secondary">Làm lại</Link>
          <Link href={`/levels/${session.examSet.level.code}`} className="btn-primary">Bài học khác</Link>
        </div>
      </div>

      {/* Chi tiết từng câu */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Chi tiết kết quả</h2>
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const userAns = answers[q.id] ?? '(Bỏ trống)';
          const correct = correctMap[q.id];
          const isCorrect = Array.isArray(correct)
            ? correct.includes(userAns)
            : userAns === correct;
          return (
            <div key={q.id} className={`card border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-400'}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Câu {idx + 1}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isCorrect ? '✓ Đúng' : '✗ Sai'}
                </span>
              </div>

              {q.audioUrl && (
                <div className="mb-2 p-2 bg-blue-50 rounded flex items-center gap-2">
                  <span>🎧</span>
                  <audio controls src={q.audioUrl} className="h-7 flex-1" />
                </div>
              )}
              {q.imageUrl && (
                <img src={q.imageUrl} alt="" className="mb-2 rounded max-h-40 object-contain border" />
              )}

              <p className="text-gray-900 font-medium mb-2 whitespace-pre-wrap">{q.content}</p>

              <div className="flex flex-col gap-1 text-sm">
                <div>
                  <span className="text-gray-500">Câu trả lời của bạn: </span>
                  <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>{userAns}</span>
                </div>
                {!isCorrect && (
                  <div>
                    <span className="text-gray-500">Đáp án đúng: </span>
                    <span className="font-medium text-green-700">
                      {Array.isArray(correct) ? correct.join(', ') : correct}
                    </span>
                  </div>
                )}
                {q.explain && (
                  <div className="mt-1 p-2 bg-yellow-50 rounded text-yellow-800 text-xs border border-yellow-200">
                    💡 {q.explain}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
