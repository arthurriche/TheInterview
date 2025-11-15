'use client';

import { m, useReducedMotion } from 'framer-motion';
import { NeuInput } from '@/components/neumorphic/NeuInput';
import { NeuTextarea } from '@/components/neumorphic/NeuTextarea';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuCard } from '@/components/neumorphic/NeuCard';

export function ContactSectionNeumorphic() {
  const shouldReduceMotion = useReducedMotion();
  const motionInitial = shouldReduceMotion ? undefined : { opacity: 0, y: 24 };
  const motionWhileInView = shouldReduceMotion ? undefined : { opacity: 1, y: 0 };
  const motionTransition = shouldReduceMotion
    ? undefined
    : { duration: 0.5, ease: 'easeOut' };

  return (
    <m.div
      initial={motionInitial}
      whileInView={motionWhileInView}
      viewport={{ once: true, amount: 0.3 }}
      transition={motionTransition}
    >
      <NeuCard shadowVariant="medium" radiusSize="lg" className="p-8 md:p-12">
        <form className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <NeuInput
              type="text"
              name="name"
              label="Nom complet"
              placeholder="Arthur Dupont"
            />
          </div>

          <div className="flex flex-col gap-2">
            <NeuInput
              type="email"
              name="email"
              label="Email professionnel"
              placeholder="prenom@banque.com"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <NeuTextarea
              name="message"
              label="Message"
              rows={4}
              placeholder="Dis-nous ton prochain entretien ou le programme que tu prépares."
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              name="demo"
              id="demo-checkbox"
              className="h-5 w-5 rounded-[8px] border-none bg-[#EEEFF3] shadow-[inset_3px_3px_6px_#D1D4D9,inset_-3px_-3px_6px_#FFFFFF] accent-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            />
            <label
              htmlFor="demo-checkbox"
              className="text-sm font-medium text-[#2A2D3A]"
            >
              Demander une démo live
            </label>
          </div>

          <div className="flex flex-col gap-3 md:col-span-2">
            <NeuButton
              type="submit"
              variant="accent"
              size="lg"
              className="w-full md:w-fit"
            >
              Envoyer
            </NeuButton>
            <p className="text-xs text-[#6B7280]">
              Réponse sous 24h ouvrées. Nous ne partageons jamais vos
              informations.
            </p>
          </div>
        </form>
      </NeuCard>
    </m.div>
  );
}
