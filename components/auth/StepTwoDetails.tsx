'use client';

import { Controller, type UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/auth/FileDropzone";

interface StepTwoValues {
  cvFile?: File;
  linkedin?: string;
  school?: string;
  sector?: string;
  referral?: string;
}

interface StepTwoDetailsProps {
  form: UseFormReturn<StepTwoValues>;
  isSubmitting: boolean;
  onBack: () => void;
  onSkip: () => void;
}

const inputClassDark =
  "w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-sm text-[#1F2432] placeholder:text-[#9CA3AF] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20";

const selectClass =
  "w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-sm text-[#1F2432] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20";

const sectors = [
  "finance de marché",
  "m&a",
  "private equity",
  "conseil",
  "risk",
  "data",
  "autre"
] as const;

const referrals = ["ami", "linkedin", "google", "université", "événement", "autre"] as const;

export function StepTwoDetails({ form, isSubmitting, onBack, onSkip }: StepTwoDetailsProps) {
  const {
    control,
    register,
    formState: { errors }
  } = form;

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name="cvFile"
        render={({ field: { value, onChange } }) => (
          <FileDropzone
            file={value ?? null}
            onFileSelect={onChange}
            disabled={isSubmitting}
            error={errors.cvFile?.message}
          />
        )}
      />

      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="signup-linkedin">
          Profil LinkedIn (optionnel)
        </label>
        <input
          id="signup-linkedin"
          type="url"
          placeholder="https://www.linkedin.com/in/..."
          autoComplete="url"
          {...register("linkedin")}
          className={cn(
            inputClassDark,
            errors.linkedin && "border-rose-400/70 focus:ring-rose-200"
          )}
        />
        {errors.linkedin ? (
          <p className="text-xs text-rose-400">{errors.linkedin.message}</p>
        ) : (
          <p className="text-xs text-[#6B7280]">
            Utilisé pour personnaliser tes questions de fit et recommandations networking.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="signup-school">
          École / université (optionnel)
        </label>
        <input
          id="signup-school"
          type="text"
          placeholder="HEC, ESCP, Centrale..."
          {...register("school")}
          className={cn(inputClassDark, errors.school && "border-rose-400/70 focus:ring-rose-200")}
        />
        {errors.school ? <p className="text-xs text-rose-400">{errors.school.message}</p> : null}
      </div>

      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="signup-sector">
            Secteur d&apos;intérêt
          </label>
          <select
            id="signup-sector"
            {...register("sector")}
            className={cn(selectClass, errors.sector && "border-rose-400/70 focus:ring-rose-200")}
            defaultValue={form.getValues("sector") ?? ""}
          >
            <option value="">Sélectionner</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          {errors.sector ? <p className="text-xs text-rose-400">{errors.sector.message}</p> : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="signup-referral">
            Comment as-tu entendu parler de nous ?
          </label>
          <select
            id="signup-referral"
            {...register("referral")}
            className={cn(selectClass, errors.referral && "border-rose-400/70 focus:ring-rose-200")}
            defaultValue={form.getValues("referral") ?? ""}
          >
            <option value="">Sélectionner</option>
            {referrals.map((ref) => (
              <option key={ref} value={ref}>
                {ref}
              </option>
            ))}
          </select>
          {errors.referral ? (
            <p className="text-xs text-rose-400">{errors.referral.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="text-xs uppercase tracking-[0.35em]"
            disabled={isSubmitting}
          >
            Revenir
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onSkip}
            className="text-xs uppercase tracking-[0.35em]"
            disabled={isSubmitting}
          >
            Terminer plus tard
          </Button>
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting} className="md:ml-auto md:w-auto">
          {isSubmitting ? "Enregistrement..." : "Terminer"}
        </Button>
      </div>
    </div>
  );
}
