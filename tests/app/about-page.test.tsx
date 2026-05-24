import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import AboutPage, { metadata } from "@/app/about/page"

vi.mock("@/lib/api-client", () => ({
  listExams: vi.fn(async () => [
    { exam_id: "fe-2025r07-a", exam: "fe", year: "2025", section: "午前", question_count: 80 },
  ]),
  listIpExams: vi.fn(async () => [
    { exam_id: "ip-2025r07", exam: "ip", year: "2025", section: "公開", question_count: 100 },
  ]),
}))

describe("about page", () => {
  it("explains the goukaku.dev mission", async () => {
    render(await AboutPage())

    expect(screen.getByText("独学でも、合格できる。")).toBeTruthy()
    expect(screen.getByText("合格から、人生を変えられる。")).toBeTruthy()
    expect(screen.getByText(/人生の選択肢を広げられる社会/)).toBeTruthy()
  })

  it("covers every supported qualification", async () => {
    render(await AboutPage())

    expect(screen.getAllByText(/ITパスポート/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/基本情報技術者/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/宅地建物取引士|宅建/).length).toBeGreaterThan(0)
  })

  it("uses mission-focused metadata", () => {
    expect(metadata.description).toContain("独学でも合格できる")
  })
})
