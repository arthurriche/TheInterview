'use client';

import { Sparkles, Workflow, Timer, BarChart3 } from 'lucide-react';
import { m, useReducedMotion } from 'framer-motion';
import { HeroNeumorphic } from '@/components/neumorphic-marketing/HeroNeumorphic';
import { NeuSection } from '@/components/neumorphic/NeuSection';
import { NeuIconCard } from '@/components/neumorphic/NeuIconCard';
import { ContactSectionNeumorphic } from '@/components/neumorphic-marketing/ContactSectionNeumorphic';
import { FinalCTANeumorphic } from '@/components/neumorphic-marketing/FinalCTANeumorphic';
import { NeuCard } from '@/components/neumorphic/NeuCard';

const STORY_STEPS = [
  {
    title: "1. Se connecter",
    description:
      "Choisis ton secteur, rôle et niveau. FinanceBro récupère ton historique pour calibrer la simulation.",
    icon: Workflow,
  },
  {
    title: "2. Passer l'entretien IA",
    description:
      "Avatar vidéo Beyond Presence, questions adaptatives, relances, analyse non verbale. Tout est capturé en temps réel.",
    icon: Timer,
  },
  {
    title: "3. Recevoir le rapport",
    description:
      "Rapport structuré avec scoring multi-axes, plan d'entraînement priorisé et benchmarks candidats IB/PE.",
    icon: BarChart3,
  },
];

const VALUE_PROPS = [
  {
    title: "Simulation haut-fidélité",
    description:
      "Scénarios calibrés sur les trames bancaires, tempo réaliste, signaux non verbaux analysés en direct.",
    icon: Sparkles,
  },
  {
    title: "Feedback actionnable",
    description:
      "9 axes scorés, recommandations lisibles, plan d'entraînement 7 jours, exports PDF et partage coach.",
    icon: BarChart3,
  },
  {
    title: "Benchmarks finance",
    description:
      "Comparaison vs analystes et associates, grille de réponses attendues par banque ou fonds.",
    icon: Workflow,
  },
  {
    title: "Analyse instantanée",
    description:
      "Transcription, filler words, latence, tonalité : chaque session est disséquée pour accélérer tes progrès.",
    icon: Timer,
  },
];

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "29€",
    period: "/mois",
    description: "Pour tester et démarrer ta préparation",
    features: [
      "3 sessions d'interview par mois",
      "Rapport détaillé après chaque session",
      "Accès aux scénarios finance de base",
      "Support email sous 48h",
    ],
  },
  {
    name: "Pro",
    price: "79€",
    period: "/mois",
    description: "Pour une préparation intensive",
    features: [
      "10 sessions d'interview par mois",
      "Rapports détaillés + plan d'entraînement",
      "Accès à tous les scénarios (IB, PE, M&A)",
      "Benchmarks candidats par banque",
      "Support prioritaire sous 24h",
      "Partage avec coach externe",
    ],
    highlighted: true,
  },
  {
    name: "Elite",
    price: "149€",
    period: "/mois",
    description: "Pour maximiser tes chances d'offre",
    features: [
      "Sessions illimitées",
      "Coaching IA personnalisé",
      "Tous scénarios + scénarios sur-mesure",
      "Benchmarks détaillés par rôle/banque",
      "Support dédié 7j/7",
      "Partage illimité",
      "Appel avec un ex-financier (1h/mois)",
    ],
  },
];

export default function NeumorphicLandingPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen bg-[#EEEFF3]">
      <HeroNeumorphic ctaHref="/auth/sign-in" />

      <NeuSection
        id="story"
        eyebrow="Comment ça marche"
        title="Ton parcours de préparation, de la connexion au rapport détaillé"
        description="FinanceBro chorégraphie ton entraînement avec un pipeline IA complet : onboarding, simulation, analyse et recommandations personnalisées."
        centered
        maxWidth="xl"
      >
        <div className="grid gap-8 md:grid-cols-3">
          {STORY_STEPS.map((step, index) => (
            <m.div
              key={step.title}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 0.5, delay: index * 0.1, ease: "easeOut" }
              }
            >
              <NeuIconCard
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            </m.div>
          ))}
        </div>
      </NeuSection>

      <NeuSection
        id="value"
        eyebrow="Pourquoi FinanceBro"
        title="Une orchestration complète pour dominer tes entretiens finance"
        description="Nous combinons avatar vidéo, IA en temps réel et benchmarks métiers pour transformer chaque répétition en avantage compétitif."
        centered
        maxWidth="xl"
        className="bg-gradient-to-b from-[#EEEFF3] to-[#E3E6EC]"
      >
        <div className="grid gap-8 md:grid-cols-2">
          {VALUE_PROPS.map((item, index) => (
            <m.div
              key={item.title}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 0.5, delay: index * 0.1, ease: "easeOut" }
              }
            >
              <NeuIconCard
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            </m.div>
          ))}
        </div>
      </NeuSection>

      <NeuSection
        id="pricing"
        eyebrow="Plans"
        title="Choisis un plan aligné sur ton objectif recrutement"
        description="Sans engagement. Pause possible entre deux saisons. Upgrade instantané pour débloquer plus de sessions et coaching."
        centered
        maxWidth="xl"
        className="bg-gradient-to-b from-[#E3E6EC] to-[#EEEFF3]"
      >
        <div className="grid gap-8 md:grid-cols-3">
          {PRICING_PLANS.map((plan, index) => (
            <m.div
              key={plan.name}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 0.5, delay: index * 0.1, ease: "easeOut" }
              }
              className="relative"
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#4F46E5] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_8px_#D1D4D9,-4px_-4px_8px_#FFFFFF]">
                    Populaire
                  </span>
                </div>
              )}
              <NeuCard
                shadowVariant={plan.highlighted ? "strong" : "medium"}
                radiusSize="lg"
                hoverEffect
                className={`p-8 ${plan.highlighted ? "ring-2 ring-[#4F46E5]/20" : ""}`}
              >
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-[#2A2D3A]">
                    {plan.name}
                  </h3>
                  <div className="mb-2 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-[#2A2D3A]">
                      {plan.price}
                    </span>
                    <span className="text-sm text-[#6B7280]">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7280]">{plan.description}</p>
                </div>

                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-[#2A2D3A]"
                    >
                      <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#4F46E5]/10 text-[#4F46E5]">
                        ✓
                      </span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </NeuCard>
            </m.div>
          ))}
        </div>
      </NeuSection>

      <NeuSection
        id="contact"
        eyebrow="Contact"
        title="Besoin d'une démo pour ton équipe carrière ou ton asso finance ?"
        description="Raconte-nous ton contexte : stage, full-time, M&A, marchés, buy-side. On répond sous 24h avec un plan de déploiement."
        centered
        maxWidth="lg"
      >
        <ContactSectionNeumorphic />
      </NeuSection>

      <NeuSection
        id="cta"
        centered
        maxWidth="lg"
        className="bg-gradient-to-b from-[#EEEFF3] to-[#E3E6EC]"
      >
        <FinalCTANeumorphic ctaHref="/auth/sign-in" />
      </NeuSection>
    </main>
  );
}
