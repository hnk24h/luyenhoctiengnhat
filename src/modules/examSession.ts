// Module làm bài thi 4 kỹ năng
import { PracticeContent, Question } from './practiceContent';

export interface UserAnswer {
  questionId: string;
  answer: string | string[];
}

export interface ExamSession {
  contentId: string;
  userId: string;
  answers: UserAnswer[];
  startedAt: Date;
  finishedAt?: Date;
  score?: number;
}

export function startExam(content: PracticeContent, userId: string): ExamSession {
  return {
    contentId: content.id,
    userId,
    answers: [],
    startedAt: new Date(),
  };
}

export function submitExam(session: ExamSession, correctAnswers: Record<string, string | string[]>): ExamSession {
  // Chấm điểm đơn giản: so sánh từng đáp án
  let score = 0;
  session.answers.forEach(ans => {
    const correct = correctAnswers[ans.questionId];
    if (Array.isArray(ans.answer) && Array.isArray(correct)) {
      if (ans.answer.join() === correct.join()) score++;
    } else if (ans.answer === correct) {
      score++;
    }
  });
  session.finishedAt = new Date();
  session.score = score;
  return session;
}
