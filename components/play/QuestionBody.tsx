import { MathText } from "./MathText";

export function QuestionBody({ body }: { body: string }) {
  return (
    <div className="bg-goukaku-surface rounded-[22px] p-[18px] border border-goukaku-divider mb-4 text-[14px] leading-[1.7] font-semibold">
      <MathText text={body} />
    </div>
  );
}
