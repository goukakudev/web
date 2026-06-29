import { describe, expect, it, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import DenkiHomePage from "@/app/denki/page"
import { DenkiStudyFrame, DenkiTopNav } from "@/components/denki/DenkiFrame"

const { listDkExamsMock, usePathnameMock } = vi.hoisted(() => ({
  listDkExamsMock: vi.fn(),
  usePathnameMock: vi.fn(() => "/denki"),
}))

vi.mock("@/lib/api-client", () => ({
  listDkExams: listDkExamsMock,
}))

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}))

describe("denki home page", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/denki")
    listDkExamsMock.mockResolvedValue([
      {
        exam_id: "ee2-20260524",
        exam: "ee2",
        year: "令和8年度",
        section: "上期",
        title: "令和8年度上期 第二種電気工事士 学科試験",
        question_count: 50,
      },
      {
        exam_id: "ee2-20251026",
        exam: "ee2",
        year: "令和7年度",
        section: "下期",
        title: "令和7年度下期 第二種電気工事士 学科試験",
        question_count: 50,
      },
    ])
  })

  it("uses the dk API data while exposing denki URLs", async () => {
    render(await DenkiHomePage())

    expect(
      screen.getByRole("heading", { name: /第二種電気工事士\s*学科試験\s*過去問/ }),
    ).toBeTruthy()

    expect(screen.getByRole("link", { name: "最新回を順番に解く" })).toHaveAttribute(
      "href",
      "/denki/play/ee2-20260524/q/1",
    )
    expect(screen.getByRole("link", { name: "ランダム20問" })).toHaveAttribute(
      "href",
      "/denki/play/random",
    )
    expect(screen.getByText("本番ペース目安")).toBeInTheDocument()
    expect(screen.getByText("約2分24秒")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /最新回から開始/ })).toHaveAttribute(
      "href",
      "/denki/play/ee2-20260524/q/1",
    )
    expect(screen.getByRole("link", { name: /進め方を見る/ })).toHaveAttribute(
      "href",
      "/denki/guide",
    )
    expect(
      screen.getByRole("link", { name: "令和8年度上期 第二種電気工事士 学科試験を見る" }),
    ).toHaveAttribute("href", "/denki/exam/ee2-20260524")
    expect(screen.getByText("2026")).toBeInTheDocument()
    expect(screen.getByText("2025")).toBeInTheDocument()
    expect(screen.queryByText("01")).toBeNull()
    expect(screen.getByRole("link", { name: "配線図" })).toHaveAttribute(
      "href",
      "/denki/tag/%E9%85%8D%E7%B7%9A%E5%9B%B3",
    )
    expect(
      screen.getByLabelText("第二種電気工事士 過去問演をApp Storeで開く"),
    ).toHaveAttribute(
      "href",
      "https://apps.apple.com/jp/app/第二種電気工事士-過去問演/id6782514809",
    )
    expect(screen.queryByRole("link", { name: "トップ" })).toBeNull()
    expect(screen.getByText("トップ")).toHaveAttribute("aria-current", "page")
  })

  it("renders the current denki nav item as a colored non-link label", () => {
    usePathnameMock.mockReturnValue("/denki/history")

    render(<DenkiTopNav />)

    expect(screen.getByRole("link", { name: "トップ" })).toHaveAttribute("href", "/denki")
    expect(screen.queryByRole("link", { name: "履歴" })).toBeNull()
    expect(screen.getByText("履歴")).toHaveAttribute("aria-current", "page")
  })

  it("hides the denki menu links on study pages", () => {
    usePathnameMock.mockReturnValue("/denki/play/ee2-20260524/q/1")

    render(
      <DenkiStudyFrame>
        <div>問題本文</div>
      </DenkiStudyFrame>,
    )

    expect(screen.getByRole("link", { name: /goukaku\.dev/ })).toHaveAttribute("href", "/")
    expect(screen.queryByLabelText("第二種電気工事士メニュー")).toBeNull()
    expect(screen.queryByRole("link", { name: "トップ" })).toBeNull()
    expect(screen.queryByRole("link", { name: "ガイド" })).toBeNull()
    expect(screen.getByText("問題本文")).toBeInTheDocument()
  })
})
