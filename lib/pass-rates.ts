import feData from "./pass-rates/fe.json"
import ipData from "./pass-rates/ip.json"
import tkData from "./pass-rates/tk.json"
import apData from "./pass-rates/ap.json"
import sgData from "./pass-rates/sg.json"
import scData from "./pass-rates/sc.json"

export type ExamKey = "fe" | "ip" | "tk" | "ap" | "sg" | "sc"

type Session = {
  year: number
  era: string
  eraYear: number
  half?: string
  // SG は IPA 統計が合格率のみグラフ提供で実人数が取れないため、applicants/
  // examinees/passers は任意。これらが無い試験は passRate を直接平均する。
  applicants?: number
  examinees?: number
  passers?: number
  passRate: number
  source: string
  note?: string
}

type PassRatesFile = {
  schemaVersion: number
  exam: string
  lastUpdated: string
  sessions: Session[]
}

const FILES: Record<ExamKey, PassRatesFile> = {
  fe: feData as PassRatesFile,
  ip: ipData as PassRatesFile,
  tk: tkData as PassRatesFile,
  ap: apData as PassRatesFile,
  sg: sgData as PassRatesFile,
  sc: scData as PassRatesFile,
}

export type YearAggregate = {
  year: number
  displayYear: string
  passRate: number
  examineeCount: number
}

const yearCache: Record<ExamKey, YearAggregate[] | undefined> = {
  fe: undefined,
  ip: undefined,
  tk: undefined,
  ap: undefined,
  sg: undefined,
  sc: undefined,
}

function aggregateByYear(file: PassRatesFile): YearAggregate[] {
  const grouped = new Map<number, Session[]>()
  for (const s of file.sessions) {
    const list = grouped.get(s.year) ?? []
    list.push(s)
    grouped.set(s.year, list)
  }
  const out: YearAggregate[] = []
  for (const [year, sessions] of grouped) {
    const examinees = sessions.reduce((a, s) => a + (s.examinees ?? 0), 0)
    const passers = sessions.reduce((a, s) => a + (s.passers ?? 0), 0)
    const first = sessions[0]
    let passRate: number
    let examineeCount: number
    if (examinees > 0) {
      // 実人数があれば受験者数で加重した年間合格率
      passRate = passers / examinees
      examineeCount = examinees
    } else {
      // 実人数が無い (SG): 同一年の各回 passRate を単純平均
      passRate = sessions.reduce((a, s) => a + s.passRate, 0) / sessions.length
      examineeCount = 0
    }
    out.push({
      year,
      displayYear: `${first.era}${first.eraYear}年`,
      passRate,
      examineeCount,
    })
  }
  out.sort((a, b) => b.year - a.year)
  return out
}

export function yearsDescending(exam: ExamKey): YearAggregate[] {
  if (!yearCache[exam]) {
    yearCache[exam] = aggregateByYear(FILES[exam])
  }
  return yearCache[exam] ?? []
}

export function latestPassRate(exam: ExamKey): YearAggregate | null {
  const years = yearsDescending(exam)
  return years[0] ?? null
}
