'use client';

import { useEffect, useMemo, useState } from "react";
import { Flame, CalendarDays } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface StreaksCardProps {
  userId: string;
}

const DAY = 24 * 60 * 60 * 1000;

const formatDayKey = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().split("T")[0];
};

const computeStreaks = (days: string[]) => {
  const uniqueDays = Array.from(new Set(days)).sort();
  if (uniqueDays.length === 0) {
    return { current: 0, longest: 0, lastDay: null as Date | null };
  }

  let current = 1;
  let longest = 1;

  for (let i = uniqueDays.length - 1; i > 0; i -= 1) {
    const currentDate = new Date(uniqueDays[i]);
    const previousDate = new Date(uniqueDays[i - 1]);
    const diff = Math.round((currentDate.getTime() - previousDate.getTime()) / DAY);
    if (diff === 1) {
      current += 1;
    } else {
      break;
    }
  }

  let chain = 1;
  for (let i = 1; i < uniqueDays.length; i += 1) {
    const date = new Date(uniqueDays[i]);
    const prev = new Date(uniqueDays[i - 1]);
    const diff = Math.round((date.getTime() - prev.getTime()) / DAY);
    if (diff === 1) {
      chain += 1;
    } else {
      chain = 1;
    }
    longest = Math.max(longest, chain);
  }

  const lastDay = new Date(uniqueDays[uniqueDays.length - 1]);
  return { current, longest, lastDay };
};

export function StreaksCard({ userId }: StreaksCardProps) {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    const fetchSessions = async () => {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("interview_sessions")
        .select("created_at, status")
        .eq("user_id", userId)
        .in("status", ["live", "completed"])
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (supabaseError) {
        setError("Impossible de récupérer ton historique.");
        setLoading(false);
        return;
      }

      const formatted = (data ?? [])
        .filter((session) => session.created_at)
        .map((session) => formatDayKey(session.created_at as string));

      setDays(formatted);
      setError(null);
      setLoading(false);
    };

    fetchSessions();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const stats = useMemo(() => computeStreaks(days), [days]);
  const daySet = useMemo(() => new Set(days), [days]);

  const previewDays = [...Array(7)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = formatDayKey(date);
    return {
      key,
      label: date.toLocaleDateString("fr-FR", { weekday: "short" }),
      active: daySet.has(key)
    };
  });

  const badgeUnlocked = stats.current >= 7;
  const lastLabel = stats.lastDay
    ? stats.lastDay.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : "Aucune session";

  return (
    <BentoCard padding="lg" className="bg-white/95">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-[#F3E8FF] p-2 text-[#7C3AED]">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">Streak</p>
              <h2 className="text-xl font-semibold text-[#1F2432]">
                {loading ? "Chargement..." : `${stats.current} jour${stats.current > 1 ? "s" : ""} d'affilée`}
              </h2>
            </div>
          </div>
          <p className="mt-2 text-sm text-[#4A4E5E]">
            {badgeUnlocked
              ? "🔥 Bravo ! Tu fais partie du club hebdo : garde ce rythme pour rester dans le top 1%."
              : "Objectif : 7 jours consécutifs pour débloquer le badge spécial challenges."}
          </p>
        </div>
        <div className="rounded-3xl border border-[#E3E6EC] px-5 py-3 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">Record</p>
          <p className="text-2xl font-semibold text-[#1F2432]">{stats.longest}</p>
          <p className="text-xs text-[#6B7280]">meilleure série</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {previewDays.map((day) => (
          <div
            key={day.key}
            className={`flex flex-col items-center rounded-2xl border px-3 py-2 text-xs font-semibold ${
              day.active
                ? "border-[#4F46E5]/30 bg-[#4F46E5]/10 text-[#4F46E5]"
                : "border-[#E3E6EC] bg-white text-[#9CA3AF]"
            }`}
          >
            <span>{day.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-3xl border border-[#E3E6EC] bg-white/90 px-4 py-3">
        <CalendarDays className="h-5 w-5 text-[#4F46E5]" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-[#1F2432]">Dernière session</p>
          <p className="text-xs text-[#6B7280]">{lastLabel}</p>
        </div>
      </div>

      {error ? <p className="mt-4 text-xs text-rose-500">{error}</p> : null}
    </BentoCard>
  );
}
