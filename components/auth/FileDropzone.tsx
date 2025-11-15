'use client';

import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface FileDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
  maxSizeMb?: number;
}

const ACCEPTED_TYPES = ["application/pdf"];
const DEFAULT_MAX_SIZE_MB = 5;

export function FileDropzone({
  file,
  onFileSelect,
  disabled,
  error,
  maxSizeMb = DEFAULT_MAX_SIZE_MB
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const validateFile = useCallback(
    (candidate: File | null) => {
      if (!candidate) {
        return;
      }

      if (!ACCEPTED_TYPES.includes(candidate.type)) {
        setInternalError("Le CV doit être un PDF (.pdf).");
        onFileSelect(null);
        return;
      }

      if (candidate.size > maxSizeBytes) {
        setInternalError(`Fichier trop volumineux (max ${maxSizeMb} Mo).`);
        onFileSelect(null);
        return;
      }

      setInternalError(null);
      onFileSelect(candidate);
    },
    [maxSizeBytes, maxSizeMb, onFileSelect]
  );

  const handleFiles = useCallback(
    (files?: FileList | null) => {
      if (disabled || !files?.length) {
        return;
      }
      validateFile(files[0]);
    },
    [disabled, validateFile]
  );

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const hint = error ?? internalError;

  return (
    <div>
      <div
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#E3E6EC] bg-white px-6 py-10 text-center shadow-[inset_10px_10px_20px_#D1D4D9,inset_-10px_-10px_20px_#FFFFFF] transition hover:border-[#4F46E5]/50",
          dragging && "border-[#4F46E5] bg-[#4F46E5]/5",
          disabled && "cursor-not-allowed opacity-60",
          hint && "border-rose-400/70"
        )}
        onClick={handleClick}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragging(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled) {
            return;
          }
          handleFiles(event.dataTransfer?.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
        aria-disabled={disabled}
      >
        <Upload className="h-8 w-8 text-[#4F46E5]" aria-hidden="true" />
        {file ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#1F2432]">{file.name}</p>
            <p className="text-xs text-[#6B7280]">
              {(file.size / (1024 * 1024)).toFixed(2)} Mo · PDF
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40"
              onClick={(event) => {
                event.stopPropagation();
                setInternalError(null);
                onFileSelect(null);
              }}
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Retirer
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#1F2432]">
              Dépose ton CV (PDF, {maxSizeMb} Mo max)
            </p>
            <p className="text-xs text-[#6B7280]">
              Le CV est optionnel mais recommandé pour personnaliser les scénarios IA.
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
      />
      {hint ? <p className="mt-2 text-xs text-rose-400">{hint}</p> : null}
    </div>
  );
}
