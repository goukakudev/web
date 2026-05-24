import feData from "./pass-rates/fe.json"
import ipData from "./pass-rates/ip.json"
import tkData from "./pass-rates/tk.json"

export type ExamKey = "fe" | "ip" | "tk"

type Session = {
  year: number
  era: string
  eraYear: number
  half?: string
  applicants: number
  examinees: number
  passers: number
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
    const examinees = sessions.reduce((a, s) => a + s.examinees, 0)
    const passers = sessions.reduce((a, s) => a + s.passers, 0)
    if (examinees === 0) continue
    const first = sessions[0]
    out.push({
      year,
      displayYear: `${first.era}${first.eraYear}年`,
      passRate: passers / examinees,
      examineeCount: examinees,
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
