"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  label,
  error,
  helperText,
  placeholder = "Sélectionner...",
}: MultiSelectProps) {
  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-[#4A4E5E]">{label}</label>
      )}
      
      <div className="rounded-[var(--radius)] border border-[#E3E6EC] bg-white p-3 shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF]">
        <p className="mb-2 text-xs text-[#6B7280]">{placeholder}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30",
                  isSelected
                    ? "border-[#4F46E5]/40 bg-[#4F46E5]/10 text-[#4F46E5]"
                    : "border-[#E3E6EC] bg-white text-[#4A4E5E] hover:border-[#4F46E5]/30"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {option.label}
              </button>
            );
          })}
        </div>
        {value.length > 0 && (
          <p className="mt-2 text-xs text-[#6B7280]">
            {value.length} sélectionné{value.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#6B7280]">{helperText}</p>}
    </div>
  );
}
