"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Rocket, Briefcase, Target, FileText, Sparkles, Link2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { FileDropzone } from "@/components/auth/FileDropzone";
import { BentoCard } from "@/components/ui/bento-card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { InterviewRound } from "@/lib/types/interview";

const preInterviewSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  position_round: z.enum(['screening', 'tech', 'final', 'case', 'fit']),
  company: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  role: z.string().min(2, "Le rôle doit contenir au moins 2 caractères"),
  focus_areas: z.array(z.string()).optional(),
  duration_minutes: z.number().min(15).max(120).default(30),
  cvFile: z.instanceof(File).optional().nullable(),
  jobOfferFile: z.instanceof(File).optional().nullable(),
});

type PreInterviewFormData = z.infer<typeof preInterviewSchema>;

const ROUNDS: { value: InterviewRound; label: string }[] = [
  { value: 'screening', label: 'Screening initial' },
  { value: 'tech', label: 'Entretien technique' },
  { value: 'case', label: 'Étude de cas' },
  { value: 'fit', label: 'Entretien fit culturel' },
  { value: 'final', label: 'Entretien final' },
];

const COMPANIES = [
  'Goldman Sachs',
  'Morgan Stanley',
  'JP Morgan',
  'Rothschild & Co',
  'Lazard',
  'BNP Paribas',
  'Société Générale',
  'Crédit Agricole CIB',
  'BlackRock',
  'KKR',
  'Bain Capital',
  'CVC Capital',
  'Autre',
];

const ROLES = [
  'Analyst',
  'Associate',
  'Vice President',
  'Director',
  'Managing Director',
  'Intern / Stagiaire',
  'Autre',
];

const FOCUS_AREAS_OPTIONS = [
  { value: "system-design", label: "Architecture & System Design" },
  { value: "backend-scale", label: "Backend & Scalability" },
  { value: "ml-ai", label: "ML / AI Engineering" },
  { value: "data-engineering", label: "Data Engineering & Analytics" },
  { value: "product-sense", label: "Product Sense & Strategy" },
  { value: "security", label: "Security & Reliability" },
  { value: "devxp", label: "Developer Experience & Tooling" }
];

interface PreInterviewFormProps {
  existingCvPath?: string | null;
  userId: string;
}

export function PreInterviewForm({ existingCvPath, userId }: PreInterviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useExistingCV, setUseExistingCV] = useState(!!existingCvPath);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSummary, setExtractedSummary] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PreInterviewFormData>({
    resolver: zodResolver(preInterviewSchema),
    defaultValues: {
      title: "",
      company: "",
      role: "",
      duration_minutes: 30,
      focus_areas: [],
    },
  });

  const handleLinkedInExtract = async () => {
    if (!linkedInUrl.trim()) {
      toast.error("Veuillez entrer une URL LinkedIn");
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch('/api/linkedin/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: linkedInUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'extraction");
      }

      if (result.success && result.data) {
        // Auto-fill form fields
        setValue('title', result.data.title);
        setValue('company', result.data.company);
        setValue('role', result.data.role);
        setValue('position_round', result.data.position_round);
        setValue('focus_areas', result.data.focus_areas);
        setValue('duration_minutes', result.data.duration_minutes);

        // Store summary
        setExtractedSummary(result.data.summary);

        toast.success("Informations extraites avec succès !");
      }
    } catch (error: any) {
      console.error('Error extracting LinkedIn data:', error);
      toast.error(error.message || "Erreur lors de l'extraction des données");
    } finally {
      setIsExtracting(false);
    }
  };

  const onSubmit = async (data: PreInterviewFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Créer la session en draft
      const { data: session, error: sessionError } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: userId,
          title: data.title,
          position_round: data.position_round,
          company: data.company,
          role: data.role,
          focus_areas: data.focus_areas || [],
          duration_minutes: data.duration_minutes,
          status: 'draft',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Upload CV si nouveau fichier
      let cvPath = null;
      if (data.cvFile) {
        const fileName = `${userId}/cv_${session.id}_${Date.now()}.pdf`;
        const { error: cvUploadError } = await supabase.storage
          .from('interviews')
          .upload(fileName, data.cvFile);

        if (cvUploadError) throw cvUploadError;
        cvPath = fileName;
      } else if (useExistingCV && existingCvPath) {
        cvPath = existingCvPath;
      }

      // 3. Upload job offer si présent
      let jobOfferPath = null;
      if (data.jobOfferFile) {
        const fileName = `${userId}/offer_${session.id}_${Date.now()}.pdf`;
        const { error: offerUploadError } = await supabase.storage
          .from('interviews')
          .upload(fileName, data.jobOfferFile);

        if (offerUploadError) throw offerUploadError;
        jobOfferPath = fileName;
      }

      // 4. Mettre à jour la session avec les paths
      if (cvPath || jobOfferPath) {
        const { error: updateError } = await supabase
          .from('interview_sessions')
          .update({
            cv_path: cvPath,
            job_offer_path: jobOfferPath,
          })
          .eq('id', session.id);

        if (updateError) throw updateError;
      }

      toast.success("Session créée ! Redirection vers l'interview...");
      router.push(`/interview/live/${session.id}`);
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(error.message || "Erreur lors de la création de la session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* LinkedIn Auto-fill */}
      <BentoCard padding="lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F46E5]/10">
            <Link2 className="h-5 w-5 text-[#4F46E5]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#1F2432]">Auto-remplissage LinkedIn</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Collez un lien d&apos;offre LinkedIn pour remplir automatiquement les champs
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="URL de l'offre LinkedIn"
              placeholder="https://www.linkedin.com/jobs/view/..."
              value={linkedInUrl}
              onChange={(e) => {
                setLinkedInUrl(e.target.value);
                setExtractedSummary(null); // Clear summary when URL changes
              }}
              disabled={isExtracting}
            />
          </div>
          <div className="pt-7">
            <Button
              type="button"
              onClick={handleLinkedInExtract}
              disabled={isExtracting || !linkedInUrl.trim()}
              className="min-w-[150px]"
            >
              {isExtracting ? (
                "Extraction..."
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Auto-remplir
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary Box */}
        {extractedSummary && (
          <div className="mt-4 rounded-2xl border border-[#4F46E5]/20 bg-[#4F46E5]/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4F46E5]" />
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-[#1F2432]">Analyse de l&apos;offre</h3>
                <p className="text-sm leading-relaxed text-[#4A4E5E]">{extractedSummary}</p>
              </div>
            </div>
          </div>
        )}
      </BentoCard>

      {/* Informations générales */}
      <BentoCard padding="lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F46E5]/10">
            <Briefcase className="h-5 w-5 text-[#4F46E5]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1F2432]">Informations générales</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Nom de l'interview"
              placeholder="Ex: Goldman Sachs - M&A Analyst Screening"
              error={errors.title?.message || undefined}
              required
              {...register('title')}
            />
          </div>

          <Select
            label="Type d'entretien"
            error={errors.position_round?.message || undefined}
            required
            {...register('position_round')}
          >
            <option value="">Sélectionner un type</option>
            {ROUNDS.map((round) => (
              <option key={round.value} value={round.value}>
                {round.label}
              </option>
            ))}
          </Select>

          <Input
            label="Durée (minutes)"
            type="number"
            min={15}
            max={120}
            error={errors.duration_minutes?.message || undefined}
            {...register('duration_minutes', { valueAsNumber: true })}
          />

          <Controller
            name="company"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#4A4E5E]">
                  Entreprise <span className="ml-1 text-rose-400">*</span>
                </label>
                <input
                  {...field}
                  value={field.value ?? ""}
                  list="companies"
                  placeholder="Sélectionner ou saisir"
                  className="w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-sm text-[#1F2432] placeholder:text-[#9CA3AF] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
                <datalist id="companies">
                  {COMPANIES.map((company) => (
                    <option key={company} value={company} />
                  ))}
                </datalist>
                {errors.company && <p className="text-xs text-rose-400">{errors.company.message}</p>}
              </div>
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#4A4E5E]">
                  Poste <span className="ml-1 text-rose-400">*</span>
                </label>
                <input
                  {...field}
                  value={field.value ?? ""}
                  list="roles"
                  placeholder="Sélectionner ou saisir"
                  className="w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-sm text-[#1F2432] placeholder:text-[#9CA3AF] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
                <datalist id="roles">
                  {ROLES.map((role) => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
                {errors.role && <p className="text-xs text-rose-400">{errors.role.message}</p>}
              </div>
            )}
          />
        </div>
      </BentoCard>

      {/* Focus areas */}
      <BentoCard padding="lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F46E5]/10">
            <Target className="h-5 w-5 text-[#4F46E5]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1F2432]">Axes de travail</h2>
        </div>

        <Controller
          name="focus_areas"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={FOCUS_AREAS_OPTIONS}
              value={field.value || []}
              onChange={field.onChange}
              placeholder="Sélectionnez les compétences que vous souhaitez travailler"
              helperText="Facultatif mais recommandé pour personnaliser les questions"
            />
          )}
        />
      </BentoCard>

      {/* Documents */}
      <BentoCard padding="lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F46E5]/10">
            <FileText className="h-5 w-5 text-[#4F46E5]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1F2432]">Documents</h2>
        </div>

        <div className="space-y-4">
          {/* CV */}
          <div>
            {existingCvPath && (
              <div className="mb-3 flex items-start justify-between rounded-2xl border border-[#4F46E5]/30 bg-[#4F46E5]/5 p-3">
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 text-[#4F46E5]" />
                  <div>
                    <p className="text-sm font-medium text-[#1F2432]">CV existant détecté</p>
                    <p className="text-xs text-[#4A4E5E]">Nous utiliserons votre CV de profil</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setUseExistingCV(!useExistingCV)}
                  className="text-xs"
                >
                  {useExistingCV ? "Remplacer" : "Utiliser"}
                </Button>
              </div>
            )}

            {(!existingCvPath || !useExistingCV) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#4A4E5E]">CV (optionnel)</label>
                <Controller
                  name="cvFile"
                  control={control}
                  render={({ field }) => (
                    <FileDropzone
                      file={field.value || null}
                      onFileSelect={field.onChange}
                      disabled={isSubmitting}
                      error={errors.cvFile?.message as string}
                    />
                  )}
                />
                <p className="text-xs text-[#6B7280]">Le CV permet de personnaliser les questions comportementales</p>
              </div>
            )}
          </div>

          {/* Job Offer */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#4A4E5E]">Offre d&apos;emploi (optionnel)</label>
            <Controller
              name="jobOfferFile"
              control={control}
              render={({ field }) => (
                <FileDropzone
                  file={field.value || null}
                  onFileSelect={field.onChange}
                  disabled={isSubmitting}
                  error={errors.jobOfferFile?.message as string}
                />
              )}
            />
            <p className="text-xs text-[#6B7280]">L&apos;offre permet d&apos;adapter les questions au contexte du poste</p>
          </div>
        </div>
      </BentoCard>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            "Préparation..."
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Lancer l'interview
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
