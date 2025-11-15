import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/get-current-user";

interface Challenge {
  id: string;
  company: string;
  role: string;
  description: string;
  logo: string;
  accent: [string, string];
  totalParticipants: number;
  yourBest: number;
  yourRank: number;
  leaderboard: Array<{ name: string; score: number; org: string }>;
}

interface DailyBrainteaser {
  id: string;
  dateLabel: string;
  title: string;
  prompt: string;
  question: string;
  difficulty: string;
  timeRemaining: string;
  streakReward: string;
  userStats: {
    currentStreak: number;
    bestStreak: number;
    lastSolvedAt: string;
    rank: number;
    totalPlayers: number;
  };
}

interface StreakLeaderboardEntry {
  name: string;
  streak: number;
  org: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: "mistral",
    company: "Mistral AI",
    role: "Forward Deployed Engineer",
    description:
      "Les 1% des meilleurs candidats reçoivent une recommandation directe pour une interview FDE chez Mistral. L'entretien simule une mission client live, avec diagnostic produit, implémentation rapide et restitution C-level.",
    logo: "/logos/mistral.svg",
    accent: ["#7DD3FC", "#2563EB"],
    totalParticipants: 428,
    yourBest: 93,
    yourRank: 6,
    leaderboard: [
      { name: "Sofia L.", score: 98, org: "Polytechnique" },
      { name: "Tim B.", score: 97, org: "HEC Paris" },
      { name: "Maya R.", score: 96, org: "MIT" },
      { name: "Jonas P.", score: 95, org: "Télécom Paris" },
      { name: "You ?", score: 93, org: "FinanceBro" }
    ]
  },
  {
    id: "deepmind",
    company: "Google DeepMind",
    role: "AI Scientist",
    description:
      "Challenge recherche appliquée : formulation d'une approche RLHF et défense scientifique. Les 1% supérieurs rejoignent un board d'entretiens techniques DeepMind.",
    logo: "/logos/deepmind.svg",
    accent: ["#FDE68A", "#DB2777"],
    totalParticipants: 612,
    yourBest: 88,
    yourRank: 24,
    leaderboard: [
      { name: "Ibrahim O.", score: 99, org: "Deep Learning Indaba" },
      { name: "Lucie A.", score: 97, org: "ENS Ulm" },
      { name: "Kai W.", score: 95, org: "TUM" },
      { name: "Rania H.", score: 94, org: "Stanford" },
      { name: "You ?", score: 88, org: "FinanceBro" }
    ]
  },
  {
    id: "meta",
    company: "Meta",
    role: "Data Scientist - Reality Labs",
    description:
      "Sprint data storytelling + experimentation. Les profils top 1% sont shortlistés pour un process accéléré chez Meta sur les équipes Reality Labs.",
    logo: "/logos/meta.svg",
    accent: ["#BFDBFE", "#2563EB"],
    totalParticipants: 512,
    yourBest: 90,
    yourRank: 11,
    leaderboard: [
      { name: "Carla P.", score: 97, org: "INSEAD" },
      { name: "Noah L.", score: 95, org: "Wharton" },
      { name: "Amine K.", score: 94, org: "ESSEC" },
      { name: "Ivy Z.", score: 92, org: "Imperial" },
      { name: "You ?", score: 90, org: "FinanceBro" }
    ]
  }
];

const formatPercentile = (rank: number, total: number) => {
  const ratio = Math.max(1, Math.round((rank / total) * 100));
  return `Top ${ratio}%`;
};

const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

const DAILY_BRAINTEASER: DailyBrainteaser = {
  id: "2024-06-11",
  dateLabel: "Mardi 11 juin",
  title: "Suite compressée",
  prompt:
    "On observe une suite binaire compressée par run-length encoding : (3,1,2,2,1,4) signifie 000 1 00 11 0 1111. Chaque paire représente la longueur d'une série de zéros puis de uns.",
  question:
    "On souhaite que la suite complète contienne un nombre total de bits égal à un carré parfait. Quelle est la plus petite paire supplémentaire à ajouter à la fin pour y parvenir ?",
  difficulty: "Maths & logique",
  timeRemaining: "12h 14m",
  streakReward: "Résous l'énigme avant 23h59 pour prolonger ta série et gagne +5 XP à partir de 7 jours consécutifs.",
  userStats: {
    currentStreak: 4,
    bestStreak: 19,
    lastSolvedAt: "Hier • 21h12",
    rank: 128,
    totalPlayers: 1204
  }
};

const STREAK_LEADERBOARD: StreakLeaderboardEntry[] = [
  { name: "Mia R.", streak: 51, org: "ENS Ulm" },
  { name: "Hugo T.", streak: 47, org: "Mines Paris" },
  { name: "Sofia L.", streak: 45, org: "Polytechnique" },
  { name: "Nora G.", streak: 42, org: "HEC Paris" },
  { name: "Lina P.", streak: 39, org: "ESCP" }
];

export default async function ChallengesPage() {
  const user = await getCurrentUser();
  const firstName = user?.firstName ?? "toi";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Challenges partenaires"
        subtitle="Accède aux programmes fast-track réservés aux 1% des meilleurs candidats. Entraîne-toi, compare-toi et décroche ton entretien."
      />

      <BentoCard padding="lg" className="space-y-6 border border-[#E3E6EC] bg-white/95">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.45em] text-[#9CA3AF]">Challenge quotidien</p>
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl font-semibold text-[#1F2432]">
              {DAILY_BRAINTEASER.title} · {DAILY_BRAINTEASER.dateLabel}
            </h2>
            <span className="rounded-full border border-[#E3E6EC] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#4A4E5E]">
              {DAILY_BRAINTEASER.difficulty}
            </span>
            <span className="text-xs font-semibold text-[#EF4444]">⏳ {DAILY_BRAINTEASER.timeRemaining} restantes</span>
          </div>
          <p className="text-sm text-[#4A4E5E]">{DAILY_BRAINTEASER.streakReward}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4 rounded-[28px] border border-[#E3E6EC] bg-gradient-to-br from-[#F9FAFB] to-white p-6">
            <p className="text-sm font-semibold text-[#1F2432]">
              Enigme du jour pour {firstName === "toi" ? "toi" : firstName}
            </p>
            <div className="space-y-3 rounded-3xl border border-dashed border-[#D1D5DB] bg-white/90 p-4">
              <p className="text-sm text-[#4A4E5E]">{DAILY_BRAINTEASER.prompt}</p>
              <p className="text-sm font-semibold text-[#1F2432]">{DAILY_BRAINTEASER.question}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-grow rounded-2xl border border-[#E3E6EC] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">Streak actuel</p>
                <p className="text-xl font-semibold text-[#1F2432]">{DAILY_BRAINTEASER.userStats.currentStreak} jours</p>
                <p className="text-xs text-[#6B7280]">Meilleur : {DAILY_BRAINTEASER.userStats.bestStreak} jours</p>
              </div>
              <div className="rounded-2xl border border-[#E3E6EC] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">Dernière résolution</p>
                <p className="text-xl font-semibold text-[#1F2432]">{DAILY_BRAINTEASER.userStats.lastSolvedAt}</p>
                <p className="text-xs text-[#6B7280]">Soumets ta réponse avant minuit</p>
              </div>
            </div>
            <Button size="sm">Soumettre ta solution</Button>
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] border border-[#E3E6EC] bg-white/90 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">Classement personnel</p>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-[#1F2432]">#{DAILY_BRAINTEASER.userStats.rank}</p>
                <p className="text-sm text-[#6B7280]">sur {formatNumber(DAILY_BRAINTEASER.userStats.totalPlayers)} joueurs</p>
              </div>
              <p className="mt-2 text-sm text-[#4A4E5E]">
                Chaque énigme résolue te fait grimper dans le classement général des streaks.
              </p>
            </div>

            <div className="rounded-[26px] border border-[#E3E6EC] bg-white/90 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1F2432]">Top streaks</h3>
                <span className="text-xs text-[#6B7280]">meilleures séries</span>
              </div>
              <ul className="mt-4 space-y-3">
                {STREAK_LEADERBOARD.map((entry, index) => (
                  <li
                    key={`${entry.name}-${entry.streak}`}
                    className="flex items-center justify-between rounded-2xl border border-[#EEF0F6] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5F9] text-sm font-semibold text-[#4F46E5]">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F2432]">{entry.name}</p>
                        <p className="text-xs text-[#6B7280]">{entry.org}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-[#1F2432]">{entry.streak} j</p>
                      <p className="text-xs text-[#6B7280]">streak</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </BentoCard>

      <div className="grid gap-6">
        {CHALLENGES.map((challenge) => (
          <BentoCard key={challenge.id} padding="lg" className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-2xl bg-[#F8FAFC] p-3 shadow-inner">
                  <Image
                    src={challenge.logo}
                    alt={`${challenge.company} logo`}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">Partenariat</p>
                  <h2 className="text-2xl font-semibold text-[#1F2432]">{challenge.company}</h2>
                  <p className="text-sm text-[#4A4E5E]">{challenge.role}</p>
                </div>
              </div>
              <Button asChild size="sm">
                <Link href={`/interview/new?challenge=${challenge.id}`}>Tenter le challenge</Link>
              </Button>
            </div>

            <p className="text-sm text-[#4A4E5E]">{challenge.description}</p>

            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div
                className="rounded-[26px] border border-[#E3E6EC] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                style={{ backgroundImage: `linear-gradient(125deg, ${challenge.accent[0]}, ${challenge.accent[1]})` }}
              >
                <div
                  className="mb-6 rounded-3xl p-6 text-white"
                  style={{ backgroundImage: `linear-gradient(120deg, ${challenge.accent[0]}, ${challenge.accent[1]})` }}
                >
                  <p className="text-xs uppercase tracking-[0.4em] opacity-80">Ton score</p>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-4xl font-semibold">{challenge.yourBest}</span>
                    <span className="text-sm font-medium opacity-90">/100</span>
                  </div>
                  <p className="text-sm opacity-90">
                    {formatPercentile(challenge.yourRank, challenge.totalParticipants)} — rang #{challenge.yourRank} sur {challenge.totalParticipants}
                  </p>
                </div>
                <p className="text-sm text-white/80">
                  Continue à pousser {firstName} : deux points supplémentaires te placent dans le top 1%.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#E3E6EC] bg-white/90 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1F2432]">Leaderboard</h3>
                  <span className="text-xs text-[#6B7280]">meilleurs scores</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {challenge.leaderboard.map((entry, index) => (
                    <li
                      key={`${challenge.id}-${entry.name}`}
                      className="flex items-center justify-between rounded-2xl border border-[#EEF0F6] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5F9] text-sm font-semibold text-[#4F46E5]">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1F2432]">{entry.name}</p>
                          <p className="text-xs text-[#6B7280]">{entry.org}</p>
                        </div>
                      </div>
                      <span className="text-base font-semibold text-[#1F2432]">{entry.score}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </BentoCard>
        ))}
      </div>
    </div>
  );
}
