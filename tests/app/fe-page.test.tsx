import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import FeHomePage from "@/app/fe/page"

vi.mock("@/lib/api-client", () => ({
  listExams: vi.fn(async () => [
    { exam_id: "fe-2025r07-a", exam: "fe", year: "2025", section: "a", title: "基本情報 令和7年度 科目A", question_count: 20 },
    { exam_id: "ap-2025r07h-a", exam: "ap", year: "2025", section: "a", title: "応用情報 令和7年度 午前", question_count: 80 },
  ]),
  listFeExams: vi.fn(async () => [
    { exam_id: "fe-2025r07-a", exam: "fe", year: "2025", section: "a", title: "基本情報 令和7年度 科目A", question_count: 20 },
  ]),
  listPopularTags: vi.fn(async () => []),
}))

describe("FE home page", () => {
  it("does not render AP exams in the FE exam list", async () => {
    render(await FeHomePage())

    expect(screen.getByText("基本情報 令和7年度 科目A")).toBeTruthy()
    expect(screen.queryByText("応用情報 令和7年度 午前")).toBeNull()
  })
})
