'use client';

import Link from 'next/link';
import { m, useReducedMotion } from 'framer-motion';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuCard } from '@/components/neumorphic/NeuCard';

interface FinalCTANeumorphicProps {
  ctaHref: string;
}

export function FinalCTANeumorphic({ ctaHref }: FinalCTANeumorphicProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionInitial = shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96 };
  const motionWhileInView = shouldReduceMotion ? undefined : { opacity: 1, scale: 1 };
  const motionTransition = shouldReduceMotion
    ? undefined
    : { duration: 0.5, ease: 'easeOut' };

  return (
    <m.div
      initial={motionInitial}
      whileInView={motionWhileInView}
      viewport={{ once: true, amount: 0.4 }}
      transition={motionTransition}
    >
      <NeuCard
        shadowVariant="strong"
        radiusSize="xl"
        className="p-12 text-center"
      >
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.45em] text-[#4F46E5]">
            Prêt pour l'offre ?
          </span>
          <h3 className="text-3xl font-bold text-[#2A2D3A] md:text-4xl">
            Lance ta prochaine simulation avec le coach IA préféré des candidats
            en finance
          </h3>
          <p className="text-base leading-relaxed text-[#6B7280] md:text-lg">
            Rejoins les candidats qui ont sécurisé offres et stages dans les
            meilleures banques, boutiques M&A et fonds. Accède immédiatement à
            la bibliothèque de scénarios finance.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={ctaHref}>
              <NeuButton variant="accent" size="lg">
                Commencer la session
              </NeuButton>
            </Link>
            <Link href="/pricing">
              <NeuButton variant="primary" size="lg">
                Voir les plans
              </NeuButton>
            </Link>
          </div>
        </div>
      </NeuCard>
    </m.div>
  );
}
