/**
 * 学習統計の集計 (localStorage の tk_attempts を入力に取る)。
 * iOS 版 StatsView 相当。
 */
import { getTkLocalAttempts, type TkAttemptLog } from "./device";

export type TkStats = {
  total: number;
  correct: number;
  wrong: number;
  accuracy: number; // 0..1
  recentDays: { date: string; total: number; correct: number }[]; // 直近7日
  byCategory: Record<string, { total: number; correct: number }>;
  uniqueQuestions: number;
};

/**
 * 解答ログから統計を集計。同じ問題に複数回解答した場合の正誤は「最新の試行」で評価。
 */
export function aggregateStats(
  attempts: TkAttemptLog[] = getTkLocalAttempts(),
  categoryByQuestion?: Map<string, string>,
): TkStats {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.isCorrect && !a.skipped).length;
  const wrong = attempts.filter((a) => !a.isCorrect && !a.skipped).length;
  const accuracy = total > 0 ? correct / total : 0;

  // 直近7日
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const days: { date: string; total: number; correct: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * dayMs);
    days.push({ date: dateKey(d), total: 0, correct: 0 });
  }
  const byDay = new Map(days.map((d) => [d.date, d]));
  for (const a of attempts) {
    const k = dateKey(new Date(a.ts));
    const row = byDay.get(k);
    if (row) {
      row.total++;
      if (a.isCorrect) row.correct++;
    }
  }

  // 分野別 (categoryByQuestion が必要)
  const byCategory: TkStats["byCategory"] = {};
  if (categoryByQuestion) {
    for (const a of attempts) {
      const cat = categoryByQuestion.get(a.questionId);
      if (!cat) continue;
      if (!byCategory[cat]) byCategory[cat] = { total: 0, correct: 0 };
      byCategory[cat].total++;
      if (a.isCorrect) byCategory[cat].correct++;
    }
  }

  const uniqueQuestions = new Set(attempts.map((a) => a.questionId)).size;

  return {
    total,
    correct,
    wrong,
    accuracy,
    recentDays: days,
    byCategory,
    uniqueQuestions,
  };
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * 直近で誤答した問題 ID の一覧 (重複なし、最新誤答日時の降順)。
 * 同じ問題に正解→誤答 / 誤答→正解 と試行した場合、最新が誤答のもののみ。
 */
export function recentWrongQuestionIds(
  attempts: TkAttemptLog[] = getTkLocalAttempts(),
  limit = 50,
): string[] {
  const latest = new Map<string, TkAttemptLog>();
  for (const a of attempts) {
    const prev = latest.get(a.questionId);
    if (!prev || a.ts > prev.ts) latest.set(a.questionId, a);
  }
  return Array.from(latest.values())
    .filter((a) => !a.isCorrect && !a.skipped)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map((a) => a.questionId);
}
