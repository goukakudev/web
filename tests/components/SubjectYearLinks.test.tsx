import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { SubjectYearLinks } from "@/components/home/SubjectYearLinks"

const exams = [
  { exam_id: "fe-2025r07-a", exam: "fe", year: "2025r07", section: "a", title: "FE 令和7", question_count: 20 },
  { exam_id: "fe-2024r06-a", exam: "fe", year: "2024r06", section: "a", title: "FE 令和6", question_count: 30 },
]

describe("SubjectYearLinks", () => {
  it("links each year to /{subject}/year/{yearKey} with a meaningful label", () => {
    render(<SubjectYearLinks subject="fe" exams={exams} />)

    const link = screen.getByRole("link", { name: /2025年/ })
    expect(link).toHaveAttribute("href", "/fe/year/2025r07")
    expect(screen.getByRole("link", { name: /2024年/ })).toHaveAttribute(
      "href",
      "/fe/year/2024r06",
    )
  })

  it("renders nothing when there are no real years", () => {
    const { container } = render(<SubjectYearLinks subject="ip" exams={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
