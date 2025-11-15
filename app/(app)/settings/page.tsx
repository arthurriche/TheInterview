'use client';

import { PageHeader } from "@/components/app/PageHeader";
import { BentoCard } from "@/components/ui/bento-card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes réglages"
        subtitle="Personnalisez votre expérience FinanceBro."
      />

      <div className="grid gap-4">
        <BentoCard padding="lg">
          <h2 className="mb-4 text-lg font-semibold text-[#1F2432]">Préférences</h2>
          <div className="space-y-4 text-sm">
            <div>
              <label className="mb-2 block text-[#4A4E5E]">Langue</label>
              <select className="w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-[#1F2432] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[#4A4E5E]">Thème</label>
              <select className="w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-[#1F2432] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20">
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Automatique</option>
              </select>
            </div>
          </div>
        </BentoCard>

        <BentoCard padding="lg">
          <h2 className="mb-4 text-lg font-semibold text-[#1F2432]">Notifications</h2>
          <div className="space-y-3 text-sm">
            {[
              "Recevoir les emails de feedbacks",
              "Recevoir les conseils hebdomadaires",
              "Recevoir les actualités produit"
            ].map((label, index) => (
              <label key={label} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-md border border-[#E3E6EC] text-[#4F46E5] focus:ring-[#4F46E5]"
                  defaultChecked={index < 2}
                />
                <span className="text-[#4A4E5E]">{label}</span>
              </label>
            ))}
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
