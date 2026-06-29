import { MathText } from "./MathText";
import type { FigureRef } from "@/lib/types";

export function QuestionBody({
  body,
  figures,
  onGlossaryClick,
  variant = "default",
}: {
  body: string;
  figures?: FigureRef[];
  onGlossaryClick?: (term: string) => void;
  variant?: "default" | "denki";
}) {
  const containerCls =
    variant === "denki"
      ? "bg-[#fffdf6] rounded-lg p-[18px] border-2 border-[#191815] shadow-[4px_4px_0_#191815] mb-4 text-[14px] leading-[1.7] font-semibold"
      : "bg-goukaku-surface rounded-[22px] p-[18px] border border-goukaku-divider mb-4 text-[14px] leading-[1.7] font-semibold"
  const figureCls =
    variant === "denki"
      ? "max-w-full h-auto rounded-lg border-2 border-[#191815] bg-white shadow-[3px_3px_0_#d8d1bc]"
      : "max-w-full h-auto rounded-md border border-goukaku-divider bg-white"

  return (
    <div className={containerCls}>
      <MathText text={body} onGlossaryClick={onGlossaryClick} />
      {figures && figures.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {figures.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element -- figures are user-content with unknown dimensions; plain <img> avoids next/image config burden
            <img
              key={f.id}
              src={f.url}
              alt={f.alt ?? ""}
              loading="lazy"
              className={figureCls}
            />
          ))}
        </div>
      )}
    </div>
  );
}
