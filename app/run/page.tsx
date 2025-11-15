import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { RealtimeSession } from "@/components/run/realtime-session";
import { getQuestions } from "@/lib/questions";

export default function RunInterviewPage() {
  const prepQuestions = getQuestions("market_finance", "sales_trading", "analyst").slice(0, 5);

  return (
    <Section
      eyebrow="Session"
      title="Run Interview"
      subtitle="Avatar Beyond Presence, OpenAI Realtime et scoring live orchestrent votre mock interview."
      className="gap-10"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <BentoCard padding="lg">
            <h3 className="text-sm font-semibold text-[#1F2432]">Brief sectoriel</h3>
            <p className="mt-2 text-sm text-[#4A4E5E]">
              Focus Market Finance — Sales &amp; Trading. Expect questions sur les flux Fixed Income,
              stress tests intraday, volatilité implicite et régulation MIFID II.
            </p>
          </BentoCard>
          <BentoCard padding="lg">
            <h3 className="text-sm font-semibold text-[#1F2432]">Fiches mnémotechniques</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#4A4E5E]">
              {prepQuestions.map((question) => (
                <li key={question.id} className="rounded-[var(--radius)] border border-[#E3E6EC] bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#4F46E5]">
                    {question.type} - {question.difficulty}
                  </p>
                  <p className="mt-1 text-sm text-[#1F2432]">{question.prompt}</p>
                </li>
              ))}
            </ul>
          </BentoCard>
        </div>
        <RealtimeSession />
      </div>
    </Section>
  );
}
