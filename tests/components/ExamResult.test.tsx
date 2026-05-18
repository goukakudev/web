import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExamResult } from "@/components/play/ExamResult";

describe("ExamResult", () => {
  it("renders percentage and counts", () => {
    render(
      <ExamResult correct={15} total={20} elapsedSeconds={3725} onRetry={() => {}} />,
    );
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("15 / 20 問正解 · 62:05")).toBeInTheDocument();
  });

  it("calls onRetry when button clicked", () => {
    const onRetry = vi.fn();
    render(
      <ExamResult correct={0} total={0} elapsedSeconds={0} onRetry={onRetry} />,
    );
    fireEvent.click(screen.getByText("もう一度"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
