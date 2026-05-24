/**
 * ブックマーク (★) の localStorage 永続化。iOS 版 AttemptRecord の bookmarks 相当。
 */

const KEY = "tk_bookmarks";

export function loadBookmarks(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function save(set: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* silent */
  }
}

export function isBookmarked(questionId: string): boolean {
  return loadBookmarks().has(questionId);
}

export function toggleBookmark(questionId: string): boolean {
  const set = loadBookmarks();
  const next = !set.has(questionId);
  if (next) {
    set.add(questionId);
  } else {
    set.delete(questionId);
  }
  save(set);
  return next;
}

export function listBookmarks(): string[] {
  return Array.from(loadBookmarks());
}
