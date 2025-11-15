import Link from "next/link";
import { ArrowRight, BarChart3, FileText, PlayCircle, Repeat } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-user";

const quickActions = [
  {
    title: "Lancer une interview",
    description: "Choisis ton template (M&A, ECM, PE, S&T) et démarre en 2 minutes.",
    href: "/interview",
    icon: PlayCircle
  },
  {
    title: "Continuer",
    description: "Reprends la session interrompue et récupère ton fil conducteur.",
    href: "/run",
    icon: Repeat
  },
  {
    title: "Accéder au dashboard",
    description: "Retrouve tes feedbacks, benchmarks et exports PDF.",
    href: "/dashboard",
    icon: BarChart3
  }
];

const feedbackCards = [
  {
    title: "Mock - Equity Research",
    highlight: "+12 pts sur l'analyse sectorielle",
    details: "Progression sur le cadrage macro et la structuration des drivers clé.",
    date: "Il y a 2 jours"
  },
  {
    title: "Mock - M&A Sell-Side",
    highlight: "Pitch story maîtrisé",
    details: "Storytelling solide, travailler la gestion des silences et la concision.",
    date: "Il y a 5 jours"
  },
  {
    title: "Mock - Private Equity",
    highlight: "Due diligence",
    details: "Renforcer la granularité sur les leviers opérationnels (opco / holdco).",
    date: "Il y a 1 semaine"
  }
];

const improvements = [
  {
    axis: "Clarté du pitch",
    suggestion:
      "Synthétiser en 90 secondes : contexte, mandat, rôle, résultat. Répéter 3 scénarios types.",
    resource: "Playbook Pitch IB.pdf"
  },
  {
    axis: "Story deal",
    suggestion: "Ajouter un angle d'apprentissage clef et un contre-pied (risk mitigation).",
    resource: "Coaching story /notes.md"
  },
  {
    axis: "Stress Q&A",
    suggestion: "S'entraîner à reformuler la question et à conclure par un call-to-action précis.",
    resource: "Module Focus Q&A"
  }
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const displayName =
    user?.firstName ??
    user?.email?.split("@")[0]?.split(".")?.[0]?.replace(/^\w/, (char) => char.toUpperCase()) ??
    "Membre";
  const isFreePlan = !user?.plan || user.plan?.toLowerCase() === "free";

  return (
    <main className="space-y-16 pb-12 pt-6">
      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-gradient-to-br from-white via-[#F4F5F9] to-[#E3E6EC] p-10 shadow-[30px_30px_60px_rgba(201,204,211,0.6)]">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#4F46E5]/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#A5B4FC]/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[#4F46E5]">
              Bienvenue de retour
            </p>
            <h1 className="text-3xl font-semibold text-[#1F2432] md:text-4xl">
              Prêt pour ta prochaine simulation, {displayName} ?
            </h1>
            <p className="max-w-xl text-base text-[#4A4E5E]">
              FinanceBro a préparé une nouvelle session sur mesure et consolidé les feedbacks de tes
              trois derniers entretiens mock. On t&apos;a aussi déniché des axes pour progresser cette
              semaine.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
              <span className="rounded-full border border-white/80 bg-white px-4 py-1 uppercase tracking-[0.35em] shadow-[inset_2px_2px_4px_rgba(209,212,217,0.5)]">
                programme {user?.plan ?? "free"}
              </span>
              <span className="rounded-full border border-white/80 bg-white px-4 py-1 uppercase tracking-[0.35em] shadow-[inset_2px_2px_4px_rgba(209,212,217,0.5)]">
                7 jours restants avant review
              </span>
            </div>
          </div>
          <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-[#4A4E5E] shadow-[12px_12px_30px_rgba(201,204,211,0.5)]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#4F46E5]">Score moyen</p>
              <p className="mt-2 text-3xl font-semibold text-[#1F2432]">74 / 100</p>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span>Technique</span>
                <span className="font-semibold text-[#4F46E5]">+6</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Comportemental</span>
                <span className="font-semibold text-[#4F46E5]">+4</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storytelling</span>
                <span className="font-semibold text-[#4F46E5]">+5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#1F2432]">Actions rapides</h2>
            <p className="text-sm text-[#6B7280]">
              En un clic, lance une nouvelle session ou reprends ton entraînement là où tu l&apos;as laissé.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex h-full flex-col gap-4 rounded-3xl border border-white/70 bg-white p-6 shadow-[15px_15px_40px_rgba(201,204,211,0.6)] transition hover:-translate-y-1"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F46E5]/10 text-[#4F46E5]">
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#1F2432]">{action.title}</h3>
                <p className="text-sm text-[#4A4E5E]">{action.description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#4F46E5] transition group-hover:translate-x-1">
                Ouvrir
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#1F2432]">Derniers feedbacks</h2>
            <p className="text-sm text-[#6B7280]">
              Synthèse automatisée de tes trois derniers entretiens mock.
            </p>
          </div>
          <Link
            href="/feedback/general"
            className="inline-flex items-center gap-2 rounded-full border border-[#4F46E5]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#4F46E5] transition hover:bg-[#4F46E5]/10"
          >
            Voir plus
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {feedbackCards.map((card) => (
            <article
              key={card.title}
              className="flex h-full flex-col gap-3 rounded-3xl border border-white/70 bg-white p-6 shadow-[12px_12px_32px_rgba(201,204,211,0.6)]"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-[#4F46E5]">{card.date}</p>
              <h3 className="text-lg font-semibold text-[#1F2432]">{card.title}</h3>
              <p className="text-sm font-semibold text-[#4F46E5]">{card.highlight}</p>
              <p className="text-sm text-[#4A4E5E]">{card.details}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#1F2432]">Progresser cette semaine</h2>
            <p className="text-sm text-[#6B7280]">
              Axes recommandés par l&apos;IA en fonction de ton dernier scoring.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {improvements.map((item) => (
            <div
              key={item.axis}
              className="flex h-full flex-col gap-4 rounded-3xl border border-white/70 bg-white p-6 shadow-[12px_12px_32px_rgba(201,204,211,0.6)]"
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-[#4F46E5]">{item.axis}</p>
                <p className="text-sm text-[#4A4E5E]">{item.suggestion}</p>
              </div>
              <div className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#4A4E5E]">
                <FileText className="h-4 w-4 text-[#4F46E5]" aria-hidden="true" />
                {item.resource}
              </div>
            </div>
          ))}
        </div>
      </section>

      {isFreePlan ? (
        <section className="rounded-[32px] border border-[#4F46E5]/20 bg-[#4F46E5]/5 p-10 text-center shadow-[20px_20px_50px_rgba(201,204,211,0.6)]">
          <div className="mx-auto max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[#4F46E5]">Plan gratuit</p>
            <h2 className="text-2xl font-semibold text-[#1F2432] md:text-3xl">
              Passe au plan Medium pour débloquer les sessions illimitées et le support coach
            </h2>
            <p className="text-base text-[#4A4E5E]">
              Débloque quatre simulations/mois, exports avancés et suivi coach. Résilie à tout moment.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#4F46E5] px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/50"
            >
              Découvrir les plans
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
