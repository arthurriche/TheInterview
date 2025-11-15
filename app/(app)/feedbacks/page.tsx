import Link from "next/link";
import { FileText, Calendar, TrendingUp, Download } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";

// Mock data - à remplacer par de vraies données
const feedbacks = [
  {
    id: "1",
    date: "2024-01-15",
    sector: "M&A",
    role: "Analyst",
    score: 78,
    duration: "45 min",
    status: "completed"
  },
  {
    id: "2", 
    date: "2024-01-10",
    sector: "Private Equity",
    role: "Associate",
    score: 82,
    duration: "38 min",
    status: "completed"
  }
];

const hasData = feedbacks.length > 0;

export default function FeedbacksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes feedbacks"
        subtitle="Consultez tous vos rapports d'entretien et suivez votre progression."
      />

      {hasData ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <BentoCard padding="lg" className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wider text-[#4F46E5]">Total sessions</p>
              <p className="text-2xl font-semibold text-[#1F2432]">{feedbacks.length}</p>
            </BentoCard>

            <BentoCard padding="lg" className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wider text-[#4F46E5]">Score moyen</p>
              <p className="text-2xl font-semibold text-[#1F2432]">
                {Math.round(feedbacks.reduce((acc, f) => acc + f.score, 0) / feedbacks.length)}%
              </p>
            </BentoCard>

            <BentoCard padding="lg" className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wider text-[#4F46E5]">Progression</p>
              <p className="text-2xl font-semibold text-[#4F46E5] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                +12%
              </p>
            </BentoCard>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1F2432]">Historique des sessions</h2>
            {feedbacks.map((feedback) => (
              <BentoCard key={feedback.id} padding="lg" className="transition-all hover:-translate-y-1">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4F46E5]/10 text-[#4F46E5]">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-[#1F2432]">
                        {feedback.sector} - {feedback.role}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(feedback.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </span>
                        <span>Durée : {feedback.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-[#1F2432]">{feedback.score}%</p>
                      <p className="text-xs text-[#9CA3AF]">Score global</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/feedback/${feedback.id}`}>Voir le rapport</Link>
                      </Button>
                      <Button size="sm" variant="secondary" className="px-3">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      ) : (
        <BentoCard padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-16 w-16 text-[#A5B4FC]" />
            <h3 className="mb-2 text-lg font-semibold text-[#1F2432]">Aucun feedback pour le moment</h3>
            <p className="mb-6 max-w-md text-sm text-[#4A4E5E]">
              Passez votre première interview pour recevoir un rapport détaillé avec analyse de vos performances.
            </p>
            <Button asChild size="lg">
              <Link href="/interview/new">Lancer ma première interview</Link>
            </Button>
          </div>
        </BentoCard>
      )}
    </div>
  );
}
