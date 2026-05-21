/**
 * 宅建 Good/Bad の vote 状態を device-id ベースで localStorage に永続化。
 * 状態は 'good' | 'bad' | null (未投票)。
 * Good→Bad のように切替えると排他的に上書き。Good→Good で取消。
 */

const VOTES_KEY = "tk_votes";

type VoteValue = "good" | "bad";

type VoteMap = Record<string, VoteValue>;

function readMap(): VoteMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    return raw ? (JSON.parse(raw) as VoteMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: VoteMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(map));
  } catch {
    /* quota exceeded etc. silent */
  }
}

export function getTkVote(questionId: string): VoteValue | null {
  const map = readMap();
  return map[questionId] ?? null;
}

export function setTkVote(
  questionId: string,
  vote: VoteValue | null,
): void {
  const map = readMap();
  if (vote === null) {
    delete map[questionId];
  } else {
    map[questionId] = vote;
  }
  writeMap(map);
}

/**
 * Good / Bad ボタン押下時のトグル計算。
 * - 現在と同じ vote → 取消 (null)
 * - 現在と違う vote → 上書き
 *
 * @returns 新しい vote 状態 (null = 取消)
 */
export function toggleTkVote(
  questionId: string,
  pressed: VoteValue,
): VoteValue | null {
  const current = getTkVote(questionId);
  const next = current === pressed ? null : pressed;
  setTkVote(questionId, next);
  return next;
}

/**
 * /api/tk/feedback proxy へ rating だけ送信 (comment なし)。
 * keepalive: true で離脱時の送信を保証。
 */
export async function postTkVote(input: {
  questionId: string;
  examId: string;
  deviceId: string;
  rating: VoteValue | null;
}): Promise<void> {
  try {
    await fetch("/api/tk/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: input.deviceId,
        question_id: input.questionId,
        exam_id: input.examId,
        rating: input.rating,
        comment: null,
        client_ts: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    /* silent */
  }
}

export async function postTkReport(input: {
  questionId: string;
  examId: string;
  deviceId: string;
  message: string;
}): Promise<{ ok: boolean }> {
  try {
    const res = await fetch("/api/tk/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: input.deviceId,
        question_id: input.questionId,
        exam_id: input.examId,
        rating: null,
        comment: input.message,
        client_ts: new Date().toISOString(),
      }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

/**
 * 解説データから 20字程度のヒント文を派生する。
 * 優先順位:
 *  1. explanation.key_law[0] の括弧内 (例: "民法96条3項(詐欺取消しと第三者)" → "詐欺取消しと第三者")
 *  2. explanation.commentary の冒頭 1 文 (max 30字)
 *  3. null
 */
export function deriveTkHint(
  explanation:
    | {
        key_law?: string[];
        commentary?: string | null;
      }
    | null
    | undefined,
): string | null {
  if (!explanation) return null;
  const laws = explanation.key_law;
  if (laws && laws.length > 0) {
    for (const law of laws) {
      const m = law.match(/[（(]([^）)]+)[）)]/);
      if (m) {
        const desc = m[1].trim();
        if (desc.length >= 3) return desc.length > 30 ? desc.slice(0, 30) : desc;
      }
    }
  }
  const c = explanation.commentary;
  if (c) {
    const trimmed = c.trim();
    if (trimmed) {
      const firstSentence = trimmed.split(/[。．]/)[0];
      if (firstSentence) {
        return firstSentence.length > 30
          ? firstSentence.slice(0, 30)
          : firstSentence;
      }
    }
  }
  return null;
}
