import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { interviewAnalystPrompt } from "@/lib/coach/config/prompts/interview-analyst";

export const runtime = "nodejs";

interface TranscriptTurn {
  speaker: "candidate" | "avatar" | "coach";
  text: string;
  latency_ms?: number;
  tags?: Record<string, unknown>;
}

interface FeedbackRequest {
  sessionId: string;
  transcript: TranscriptTurn[];
  metrics?: Record<string, unknown>;
}

interface QuestionFeedback {
  question: string;
  summary: string;
  score: number;
  tips: string[];
}

interface CriteriaScores {
  architecture: number;
  ai_engineering: number;
  problem_solving: number;
  communication: number;
}

interface FeedbackAnalysis {
  score_overall: number;
  general: string;
  went_well: string[];
  to_improve: string[];
  per_question: QuestionFeedback[];
  criteria_scores: CriteriaScores;
  recommendations: string[];
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as FeedbackRequest;
    const { sessionId, transcript = [], metrics = {} } = payload;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
    }

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: "Transcript vide, impossible de générer un feedback" },
        { status: 400 }
      );
    }

    const openai = await getOpenAIClient();
    const supabase = await getSupabaseAdminClient();

    // Récupérer les informations de la session pour le contexte
    const { data: sessionData } = await supabase
      .from("interview_sessions")
      .select("position_round, company, role, focus_areas")
      .eq("id", sessionId)
      .single();

    // Formater le transcript de manière plus lisible
    const transcriptText = transcript
      .map((turn, idx) => {
        const speaker = turn.speaker === "candidate" ? "CANDIDAT" : "COACH";
        return `[${idx + 1}] ${speaker}: ${turn.text}`;
      })
      .join("\n\n");

    // Contexte de la session pour enrichir l'analyse
    const contextInfo = sessionData
      ? `\n\nCONTEXTE DE L'ENTRETIEN:
- Type: ${sessionData.position_round}
- Entreprise: ${sessionData.company}
- Poste: ${sessionData.role}
- Focus: ${sessionData.focus_areas?.join(", ") || "Non spécifié"}`
      : "";

    let feedbackAnalysis: FeedbackAnalysis;

    if (!openai) {
      // Fallback si OpenAI n'est pas disponible
      feedbackAnalysis = {
        score_overall: 50,
        general:
          "Feedback automatisé indisponible (clé OpenAI manquante). Veuillez configurer OPENAI_API_KEY pour activer l'analyse détaillée.",
        went_well: ["Session complétée avec succès"],
        to_improve: ["Configuration requise pour l'analyse détaillée"],
        per_question: [],
        criteria_scores: {
          architecture: 50,
          ai_engineering: 50,
          problem_solving: 50,
          communication: 50
        },
        recommendations: ["Configurer la clé OpenAI pour obtenir un feedback détaillé"]
      };
    } else {
      // Génération du feedback avec l'agent spécialisé
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: interviewAnalystPrompt
          },
          {
            role: "user",
            content: `Analyse cet entretien et fournis ton évaluation détaillée.${contextInfo}

TRANSCRIPT DE L'ENTRETIEN:
${transcriptText}

MÉTRIQUES ADDITIONNELLES:
${JSON.stringify(metrics, null, 2)}

Retourne ton analyse au format JSON tel que spécifié dans les instructions.`
          }
        ]
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Aucun contenu retourné par OpenAI");
      }

      try {
        feedbackAnalysis = JSON.parse(content) as FeedbackAnalysis;
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);
        console.error("Contenu reçu:", content);
        throw new Error("Format de réponse invalide de l'IA");
      }
    }

    // Stocker dans la base de données (table interview_feedback)
    if (supabase) {
      await supabase
        .from("interview_feedback")
        .upsert(
          {
            session_id: sessionId,
            general: feedbackAnalysis.general,
            went_well: feedbackAnalysis.went_well,
            to_improve: feedbackAnalysis.to_improve,
            per_question: feedbackAnalysis.per_question,
            score_overall: feedbackAnalysis.score_overall,
            created_at: new Date().toISOString()
          },
          { onConflict: "session_id" }
        )
        .throwOnError();
    }

    return NextResponse.json(
      {
        success: true,
        feedback: feedbackAnalysis
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erreur lors de la génération du feedback:", error);
    return NextResponse.json(
      {
        error: error.message || "Erreur lors de la génération du feedback"
      },
      { status: 500 }
    );
  }
}
