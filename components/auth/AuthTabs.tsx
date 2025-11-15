'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpWizard } from "@/components/auth/SignUpWizard";

type AuthTabId = "sign-in" | "sign-up";

interface AuthTabsProps {
  initialTab?: AuthTabId;
}

const TABS: Array<{ id: AuthTabId; label: string }> = [
  { id: "sign-in", label: "Se connecter" },
  { id: "sign-up", label: "Créer un compte" }
];

export function AuthTabs({ initialTab = "sign-in" }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<AuthTabId>(initialTab);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const paramsString = searchParams?.toString();

  const handleTabChange = (tab: AuthTabId) => {
    setActiveTab(tab);
    if (!router || !pathname) {
      return;
    }

    const params = new URLSearchParams(paramsString ?? "");
    params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const tabIndicatorIndex = useMemo(() => TABS.findIndex((tab) => tab.id === activeTab), [activeTab]);

  return (
    <div className="flex w-full flex-col gap-8 rounded-[32px] border border-white/70 bg-white p-8 shadow-[30px_30px_60px_rgba(201,204,211,0.6)] md:p-12">
      <div className="grid gap-4">
        <div role="tablist" aria-label="Connexion ou création de compte" className="relative inline-flex w-full overflow-hidden rounded-full border border-[#E3E6EC] bg-[#F4F5F9] p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                className={cn(
                  "relative z-10 flex-1 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/30",
                  isActive ? "text-white" : "text-[#6B7280]"
                )}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
          <span
            className="pointer-events-none absolute inset-y-1 w-1/2 rounded-full bg-[#4F46E5] shadow-[8px_8px_16px_rgba(209,212,217,0.6)] transition-[transform]"
            style={{
              transform: `translateX(${tabIndicatorIndex * 100}%)`
            }}
            aria-hidden="true"
          />
        </div>
        <p className="text-sm text-[#4A4E5E]">
          Accède à ton espace FinanceBro : mock interviews IA, feedback détaillé et plan de progression.
        </p>
      </div>

      <div>
        {activeTab === "sign-in" ? (
          <SignInForm />
        ) : (
          <SignUpWizard onSwitchTab={(tab) => handleTabChange(tab)} />
        )}
      </div>
    </div>
  );
}
