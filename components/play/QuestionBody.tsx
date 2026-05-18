import { MathText } from "./MathText";
import type { FigureRef } from "@/lib/types";

export function QuestionBody({
  body,
  figures,
}: {
  body: string;
  figures?: FigureRef[];
}) {
  return (
    <div className="bg-goukaku-surface rounded-[22px] p-[18px] border border-goukaku-divider mb-4 text-[14px] leading-[1.7] font-semibold">
      <MathText text={body} />
      {figures && figures.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {figures.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element -- figures are user-content with unknown dimensions; plain <img> avoids next/image config burden
            <img
              key={f.id}
              src={f.url}
              alt={f.alt ?? ""}
              loading="lazy"
              className="max-w-full h-auto rounded-md border border-goukaku-divider bg-white"
            />
          ))}
        </div>
      )}
    </div>
  );
}
