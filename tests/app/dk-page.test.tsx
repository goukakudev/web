import { describe, expect, it, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import DkHomePage from "@/app/dk/page"

const { listDkExamsMock, usePathnameMock } = vi.hoisted(() => ({
  listDkExamsMock: vi.fn(),
  usePathnameMock: vi.fn(() => "/dk"),
}))

vi.mock("@/lib/api-client", () => ({
  listDkExams: listDkExamsMock,
}))

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}))

describe("dk home page", () => {
  beforeEach(() => {
    listDkExamsMock.mockResolvedValue([
      {
        exam_id: "ee2-2026-first",
        exam: "DK",
        year: "令和8年度",
        section: "上期",
        title: "令和8年度 上期",
        question_count: 50,
      },
      {
        exam_id: "ee2-2025-second",
        exam: "DK",
        year: "令和7年度",
        section: "下期",
        title: "令和7年度 下期",
        question_count: 50,
      },
    ])
  })

  it("renders a dedicated electrician dashboard with working study links", async () => {
    render(await DkHomePage())

    expect(
      screen.getByRole("heading", { name: /第二種電気工事士\s*過去問演/ }),
    ).toBeTruthy()

    expect(screen.getByRole("link", { name: "最新回を順番に解く" })).toHaveAttribute(
      "href",
      "/dk/play/ee2-2026-first/q/1",
    )
    expect(screen.getByRole("link", { name: "ランダム20問" })).toHaveAttribute(
      "href",
      "/dk/play/random",
    )
    expect(screen.getByText("本番ペース目安")).toBeInTheDocument()
    expect(screen.getByText("約2分24秒")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /最新回から開始/ })).toHaveAttribute(
      "href",
      "/dk/play/ee2-2026-first/q/1",
    )
    expect(screen.getByRole("link", { name: /進め方を見る/ })).toHaveAttribute(
      "href",
      "/dk/guide",
    )
    expect(screen.getByRole("link", { name: "令和8年度 上期を見る" })).toHaveAttribute(
      "href",
      "/dk/exam/ee2-2026-first",
    )
    expect(screen.getByText("2026")).toBeInTheDocument()
    expect(screen.getByText("2025")).toBeInTheDocument()
    expect(screen.queryByText("01")).toBeNull()
    expect(screen.getByRole("link", { name: "電気理論" })).toHaveAttribute(
      "href",
      "/dk/tag/%E9%9B%BB%E6%B0%97%E7%90%86%E8%AB%96",
    )
    expect(
      screen.getByLabelText("第二種電気工事士 過去問演をApp Storeで開く"),
    ).toHaveAttribute(
      "href",
      "https://apps.apple.com/jp/app/第二種電気工事士-過去問演/id6782514809",
    )
  })
})
