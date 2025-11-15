'use client';

import { m, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NeuButton } from '@/components/neumorphic/NeuButton';

interface HeroNeumorphicProps {
  ctaHref: string;
}

export function HeroNeumorphic({ ctaHref }: HeroNeumorphicProps) {
  const shouldReduceMotion = useReducedMotion();

  const motionInitial = shouldReduceMotion ? undefined : { opacity: 0, y: 24 };
  const motionAnimate = shouldReduceMotion ? undefined : { opacity: 1, y: 0 };
  const motionTransition = shouldReduceMotion
    ? undefined
    : { duration: 0.6, ease: 'easeOut' };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#EEEFF3] px-6 py-24 md:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Contenu texte */}
          <div className="flex flex-col gap-8">
            <m.span
              initial={motionInitial}
              animate={motionAnimate}
              transition={motionTransition}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-[#4F46E5]"
            >
              Coach IA vidéo
            </m.span>

            <m.h1
              initial={motionInitial}
              animate={motionAnimate}
              transition={{ ...motionTransition, delay: 0.1 }}
              className="text-4xl font-bold leading-tight text-[#2A2D3A] md:text-5xl lg:text-6xl"
            >
              Stop vibing Get a job.
            </m.h1>

            <m.p
              initial={motionInitial}
              animate={motionAnimate}
              transition={{ ...motionTransition, delay: 0.2 }}
              className="max-w-2xl text-base leading-relaxed text-[#6B7280] md:text-lg"
            >
              Passe des interviews simulées et reçois un rapport précis et
              actionnable. Chaque session est adaptée à ton poste cible et
              calibrée pour les standards des banques et fonds.
            </m.p>

            <m.div
              initial={motionInitial}
              animate={motionAnimate}
              transition={{ ...motionTransition, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href={ctaHref}>
                <NeuButton variant="accent" size="lg" className="group">
                  <span className="flex items-center gap-3">
                    Commencer la session
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </NeuButton>
              </Link>
              <Link href="#value">
                <NeuButton variant="ghost" size="lg" className="group">
                  <span className="flex items-center gap-2">
                    Découvrir les bénéfices
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </NeuButton>
              </Link>
            </m.div>
          </div>

          {/* Image abstraite neumorphique */}
          <m.div
            initial={motionInitial}
            animate={motionAnimate}
            transition={{ ...motionTransition, delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] bg-[#EEEFF3] shadow-[12px_12px_24px_#D1D4D9,-12px_-12px_24px_#FFFFFF]">
              <img
                src="/hero-abstract.png"
                alt="FinanceBro AI Coach"
                className="h-full w-full object-cover"
              />
            </div>
          </m.div>
        </div>
      </div>
    </div>
  );
}
