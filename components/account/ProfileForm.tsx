'use client';

import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  type ProfileRow,
  SECTOR_OPTIONS,
  REFERRAL_OPTIONS,
  updateProfile
} from "@/lib/supabase/profile";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(120, "Le prénom est trop long."),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(120, "Le nom est trop long."),
  dob: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => value === "" || !Number.isNaN(Date.parse(value)),
      "Date de naissance invalide."
    ),
  school: z
    .string()
    .max(160, "L'établissement est trop long.")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => value === "" || value.startsWith("https://"),
      "Le lien doit commencer par https://"
    )
    .refine((value) => {
      if (value === "") return true;
      try {
        const url = new URL(value);
        return url.hostname.includes("linkedin.");
      } catch {
        return false;
      }
    }, "Le lien doit pointer vers LinkedIn."),
  sector: z
    .enum(SECTOR_OPTIONS)
    .optional()
    .or(z.literal("")),
  referral: z
    .enum(REFERRAL_OPTIONS)
    .optional()
    .or(z.literal(""))
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  userId: string;
  profile: ProfileRow;
  onProfileChange?: (profile: ProfileRow) => void;
}

const inputClass =
  "w-full rounded-[var(--radius)] border border-[#E0E4EE] bg-white px-4 py-3 text-sm text-[#2A2D3A] placeholder:text-[#9CA3AF] shadow-[inset_4px_4px_12px_rgba(209,212,217,0.6)] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20";

const selectClass =
  "w-full rounded-[var(--radius)] border border-[#E0E4EE] bg-white px-4 py-3 text-sm text-[#2A2D3A] shadow-[inset_4px_4px_12px_rgba(209,212,217,0.6)] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20";

export function ProfileForm({ userId, profile, onProfileChange }: ProfileFormProps) {
  const supabase = createSupabaseBrowserClient();
  const formId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      dob: profile.dob ?? "",
      school: profile.school ?? "",
      linkedinUrl: profile.linkedin_url ?? "",
      sector: profile.sector ?? "",
      referral: profile.referral ?? ""
    }
  });

  useEffect(() => {
    reset({
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      dob: profile.dob ?? "",
      school: profile.school ?? "",
      linkedinUrl: profile.linkedin_url ?? "",
      sector: profile.sector ?? "",
      referral: profile.referral ?? ""
    });
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const updated = await updateProfile(supabase, userId, {
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        dob: values.dob ? values.dob : null,
        school: values.school ? values.school.trim() : null,
        linkedin_url: values.linkedinUrl ? values.linkedinUrl.trim() : null,
        sector: values.sector ? (values.sector as ProfileRow["sector"]) : null,
        referral: values.referral ? (values.referral as ProfileRow["referral"]) : null
      }, profile);

      toast.success("Profil mis à jour avec succès.");
      onProfileChange?.(updated);
      reset({
        firstName: updated.first_name ?? "",
        lastName: updated.last_name ?? "",
        dob: updated.dob ?? "",
        school: updated.school ?? "",
        linkedinUrl: updated.linkedin_url ?? "",
        sector: updated.sector ?? "",
        referral: updated.referral ?? ""
      });
    } catch (error) {
      console.error("[FinanceBro] Impossible de mettre à jour le profil", error);
      toast.error("Impossible d'enregistrer les modifications.");
    }
  });

  return (
    <BentoCard padding="lg" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2A2D3A]">Informations personnelles</h2>
          <p className="text-sm text-[#6B7280]">
            Mets à jour ton identité et tes informations de contact.
          </p>
        </div>
        <Button
          type="submit"
          size="sm"
          form={formId}
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <form id={formId} className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="account-first-name">
            Prénom *
          </label>
          <input
            id="account-first-name"
            type="text"
            autoComplete="given-name"
            className={cn(inputClass, errors.firstName && "border-rose-300 focus:ring-rose-200")}
            {...register("firstName")}
          />
          {errors.firstName ? (
            <p className="text-xs text-rose-400">{errors.firstName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="account-last-name">
            Nom *
          </label>
          <input
            id="account-last-name"
            type="text"
            autoComplete="family-name"
            className={cn(inputClass, errors.lastName && "border-rose-300 focus:ring-rose-200")}
            {...register("lastName")}
          />
          {errors.lastName ? <p className="text-xs text-rose-400">{errors.lastName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="account-dob">
            Date de naissance
          </label>
          <input
            id="account-dob"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            className={cn(inputClass, errors.dob && "border-rose-300 focus:ring-rose-200")}
            {...register("dob")}
          />
          {errors.dob ? <p className="text-xs text-rose-400">{errors.dob.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="account-school">
            École / Université
          </label>
          <input
            id="account-school"
            type="text"
            placeholder="HEC, ESCP, Centrale..."
            className={cn(inputClass, errors.school && "border-rose-300 focus:ring-rose-200")}
            {...register("school")}
          />
          {errors.school ? <p className="text-xs text-rose-400">{errors.school.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="account-sector">
            Secteur d&apos;intérêt
          </label>
          <select
            id="account-sector"
            className={cn(selectClass, errors.sector && "border-rose-300 focus:ring-rose-200")}
            {...register("sector")}
          >
            <option value="">Sélectionner</option>
            {SECTOR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.sector ? <p className="text-xs text-rose-400">{errors.sector.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="account-referral">
            Comment as-tu entendu parler de nous ?
          </label>
          <select
            id="account-referral"
            className={cn(selectClass, errors.referral && "border-rose-300 focus:ring-rose-200")}
            {...register("referral")}
          >
            <option value="">Sélectionner</option>
            {REFERRAL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.referral ? <p className="text-xs text-rose-400">{errors.referral.message}</p> : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="account-linkedin">
            Profil LinkedIn
          </label>
          <input
            id="account-linkedin"
            type="url"
            placeholder="https://www.linkedin.com/in/..."
            className={cn(inputClass, errors.linkedinUrl && "border-rose-300 focus:ring-rose-200")}
            {...register("linkedinUrl")}
          />
          {errors.linkedinUrl ? (
            <p className="text-xs text-rose-400">{errors.linkedinUrl.message}</p>
          ) : (
            <p className="text-xs text-[#6B7280]">
              Utilisé pour personnaliser tes sessions de fit et te recommander du contenu pertinent.
            </p>
          )}
        </div>
      </form>
    </BentoCard>
  );
}
