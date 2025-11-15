import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { SignUpWizard } from "@/components/auth/SignUpWizard";

export const metadata: Metadata = {
  title: "Inscription - FinanceBro",
  description: "Crée ton compte FinanceBro pour commencer tes simulations d'entretiens."
};

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EEEFF3] py-24 text-[#1F2432]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden w-px bg-gradient-to-b from-transparent via-[#4F46E5]/30 to-transparent md:block" />
      
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-4 md:px-6">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white px-4 py-2 text-xs uppercase tracking-[0.45em] text-[#4F46E5] shadow-[6px_6px_16px_rgba(209,212,217,0.6)]">
            FinanceBro
          </span>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Crée ton compte
          </h1>
          <p className="text-sm text-[#4A4E5E] md:text-base">
            Rejoins les candidats qui se préparent aux meilleurs entretiens en finance.
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white p-8 shadow-[20px_20px_50px_rgba(201,204,211,0.6)]">
          <SignUpWizard />
        </div>
      </div>
    </div>
  );
}
