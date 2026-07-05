import glossaryData from "@/lib/glossary-data.json"

export interface GlossaryEntry {
  term: string
  reading: string
  category: string
  description: string
}

const ALL: GlossaryEntry[] = glossaryData as GlossaryEntry[]

export function listAllTerms(): GlossaryEntry[] {
  return ALL
}

// URL 予約文字・空白はハイフンに畳む。encodeURIComponent で %2F を残すだけだと
// Google や中間プロキシが %2F → / に正規化し、/glossary/S/MIME のような
// 2 セグメント URL として 404 になる (GSC で実測)。スラッシュを含む用語
// (S/MIME, JPCERT/CC 等) もハイフン化すれば正規化の影響を受けない。
const UNSAFE_URL_CHARS = /[/\\?#%&+\s]+/g

/** termToSlug の percent-encode 前の形。ルックアップのキーにも使う。 */
export function termToSafeSlug(term: string): string {
  return term
    .replace(UNSAFE_URL_CHARS, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function termToSlug(term: string): string {
  return encodeURIComponent(termToSafeSlug(term))
}

const BY_SLUG = new Map<string, GlossaryEntry>()
for (const e of ALL) {
  const slug = termToSafeSlug(e.term)
  const existing = BY_SLUG.get(slug)
  // 衝突時は無言で上書きしない。上書きされた側の用語は /glossary/{slug} が
  // 別の用語として解決され続けてしまうため、ビルド/起動時ログで即座に気づける
  // ようにする (テストの一意性チェックはデータ追加時にしか走らない安全網)。
  if (existing && existing.term !== e.term) {
    console.error(
      `[glossary] slug collision: "${existing.term}" と "${e.term}" が同じ slug "${slug}" になっています。後勝ちで "${e.term}" が使われます。`,
    )
  }
  BY_SLUG.set(slug, e)
}

export function findByTerm(term: string): GlossaryEntry | undefined {
  return ALL.find((e) => e.term === term)
}

export function findBySlug(slug: string): GlossaryEntry | undefined {
  return BY_SLUG.get(slug)
}

export interface ResolvedGlossarySlug {
  entry: GlossaryEntry
  /** percent-encoded canonical slug — URL は /glossary/${canonicalSlug} */
  canonicalSlug: string
  /** false のとき正規 URL へ 308 リダイレクトする */
  isCanonical: boolean
}

/**
 * 動的ルートの生セグメント (エンコード済み、レガシー URL では生スラッシュで
 * 複数セグメントに割れている) を用語エントリへ解決する。受け付ける形:
 *  - 正規スラッグ: /glossary/S-MIME, /glossary/機械学習
 *  - レガシー生用語: /glossary/S%2FMIME, /glossary/S/MIME, /glossary/USB%203.0
 *  - 連番サフィックス付き旧 URL: /glossary/CSIRT-2 (素の用語が実在する場合のみ)
 * 正規形以外は isCanonical=false で返し、呼び出し側で 308 させる。
 */
export function resolveGlossarySlug(
  segments: string[],
): ResolvedGlossarySlug | null {
  if (segments.length === 0) return null
  const decoded = segments.map(safeDecode).join("/")
  const direct = BY_SLUG.get(decoded)
  if (direct) {
    return {
      entry: direct,
      canonicalSlug: termToSlug(direct.term),
      isCanonical: segments.length === 1,
    }
  }
  const byTerm = findByTerm(decoded)
  if (byTerm) {
    return {
      entry: byTerm,
      canonicalSlug: termToSlug(byTerm.term),
      isCanonical: false,
    }
  }
  // SHA-256 のような正規用語は上で既にヒットするため、ここに来るのは
  // 外部被リンク/過去 URL 由来の連番サフィックスだけ。
  const stripped = decoded.replace(/-\d+$/, "")
  if (stripped !== decoded) {
    const base = BY_SLUG.get(stripped) ?? findByTerm(stripped)
    if (base) {
      return {
        entry: base,
        canonicalSlug: termToSlug(base.term),
        isCanonical: false,
      }
    }
  }
  return null
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export function listByCategory(): Map<string, GlossaryEntry[]> {
  const m = new Map<string, GlossaryEntry[]>()
  for (const e of ALL) {
    const list = m.get(e.category) ?? []
    list.push(e)
    m.set(e.category, list)
  }
  for (const [, list] of m) {
    list.sort((a, b) => a.reading.localeCompare(b.reading, "ja"))
  }
  return m
}

export function findRelated(entry: GlossaryEntry, limit = 5): GlossaryEntry[] {
  return ALL.filter(
    (e) => e.term !== entry.term && e.category === entry.category,
  )
    .sort((a, b) => a.reading.localeCompare(b.reading, "ja"))
    .slice(0, limit)
}
