'use client';

import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/cn";

export interface StepOneValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dob: string;
}

interface StepOneIdentityProps {
  form: UseFormReturn<StepOneValues>;
  disabledFields?: {
    email?: boolean;
    password?: boolean;
  };
}

const inputClass =
  "w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-sm text-[#1F2432] placeholder:text-[#9CA3AF] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20";

export function StepOneIdentity({ form, disabledFields }: StepOneIdentityProps) {
  const {
    register,
    formState: { errors }
  } = form;

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          disabled={disabledFields?.email}
          {...register("email")}
          className={cn(
            inputClass,
            errors.email && "border-rose-400/70 focus:ring-rose-200",
            disabledFields?.email && "cursor-not-allowed opacity-70"
          )}
          placeholder="prenom@banque.com"
        />
        {errors.email ? <p className="text-xs text-rose-400">{errors.email.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="signup-password">
          Mot de passe
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          disabled={disabledFields?.password}
          {...register("password")}
          className={cn(
            inputClass,
            errors.password && "border-rose-400/70 focus:ring-rose-200",
            disabledFields?.password && "cursor-not-allowed opacity-70"
          )}
          placeholder="Au moins 8 caractères"
        />
        <p className="text-xs text-[#6B7280]">Minimum 8 caractères, idéalement une combinaison de lettres et chiffres.</p>
        {errors.password ? <p className="text-xs text-rose-400">{errors.password.message}</p> : null}
      </div>

      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="signup-firstname">
            Prénom
          </label>
          <input
            id="signup-firstname"
            type="text"
            autoComplete="given-name"
            {...register("firstName")}
            className={cn(inputClass, errors.firstName && "border-rose-400/70 focus:ring-rose-200")}
            placeholder="Arthur"
          />
          {errors.firstName ? (
            <p className="text-xs text-rose-400">{errors.firstName.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="signup-lastname">
            Nom
          </label>
          <input
            id="signup-lastname"
            type="text"
            autoComplete="family-name"
            {...register("lastName")}
            className={cn(inputClass, errors.lastName && "border-rose-400/70 focus:ring-rose-200")}
            placeholder="Dupont"
          />
          {errors.lastName ? <p className="text-xs text-rose-400">{errors.lastName.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#4A4E5E]" htmlFor="signup-dob">
          Date de naissance
        </label>
        <input
          id="signup-dob"
          type="date"
          autoComplete="bday"
          {...register("dob")}
          className={cn(inputClass, errors.dob && "border-rose-400/70 focus:ring-rose-200")}
          max={new Date().toISOString().slice(0, 10)}
        />
        {errors.dob ? <p className="text-xs text-rose-400">{errors.dob.message}</p> : null}
      </div>
    </div>
  );
}
