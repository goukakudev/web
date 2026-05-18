import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuestionBody } from "@/components/play/QuestionBody";

describe("QuestionBody", () => {
  it("renders the body text", () => {
    render(<QuestionBody body="サンプル本文" />);
    expect(screen.getByText("サンプル本文")).toBeInTheDocument();
  });

  it("renders figures when provided", () => {
    render(
      <QuestionBody
        body="次の流れ図は..."
        figures={[
          {
            id: "fig1",
            r2_key: "figures/foo/Q01/page.png",
            url: "https://r2.example.com/figures/foo/Q01/page.png",
            alt: "サンプル流れ図",
            source_page: 3,
          },
        ]}
      />,
    );
    const img = screen.getByAltText("サンプル流れ図") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://r2.example.com/figures/foo/Q01/page.png");
  });

  it("renders multiple figures in order", () => {
    render(
      <QuestionBody
        body="図1と図2を参照"
        figures={[
          {
            id: "fig1",
            r2_key: "k1",
            url: "https://r2.example.com/a.png",
            alt: "図1",
            source_page: 1,
          },
          {
            id: "fig2",
            r2_key: "k2",
            url: "https://r2.example.com/b.png",
            alt: "図2",
            source_page: 1,
          },
        ]}
      />,
    );
    expect(screen.getByAltText("図1")).toBeInTheDocument();
    expect(screen.getByAltText("図2")).toBeInTheDocument();
  });

  it("does not render image area when figures is empty or missing", () => {
    const { container } = render(<QuestionBody body="図のない問題" />);
    expect(container.querySelectorAll("img").length).toBe(0);
  });

  it("uses empty alt string when alt is undefined", () => {
    const { container } = render(
      <QuestionBody
        body="..."
        figures={[
          {
            id: "fig1",
            r2_key: "k1",
            url: "https://r2.example.com/a.png",
            source_page: 1,
          },
        ]}
      />,
    );
    const img = container.querySelector("img") as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img!.alt).toBe("");
  });
});
