import { getOpenAIClient } from "@/lib/openai";
import { BaseFeedbackService, type FeedbackContext } from "./base-feedback.service";

interface TechCriteria {
  architecture: number;
  ai_engineering: number;
  problem_solving: number;
  communication: number;
}

interface QuestionInsight {
  question: string;
  insight: string;
  score: number;
  tips: string[];
}

interface Fcl055dFeedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  score_overall: number;
  criteria?: TechCriteria;
  per_question?: QuestionInsight[];
  raw?: string;
}

const clampScore = (value: number | undefined | null, fallback = 0) =>
  Math.min(100, Math.max(0, typeof value === "number" && Number.isFinite(value) ? value : fallback));

export class Fcl055dFeedbackService extends BaseFeedbackService {
  async generate(context: FeedbackContext): Promise<Fcl055dFeedback | null> {
    const openai = await getOpenAIClient();

    if (!openai) {
      return {
        summary:
          "Aucun feedback automatisé disponible (clé OpenAI manquante). Pensez à renseigner OPENAI_API_KEY pour activer l'analyse.",
        strengths: [],
        improvements: [],
        recommendations: [],
        score_overall: 0,
        criteria: {
          architecture: 0,
          ai_engineering: 0,
          problem_solving: 0,
          communication: 0
        },
        per_question: []
      };
    }

    if (!context.transcript.length) {
      return {
        summary: "La session n'a pas produit de transcript. Impossible de générer un feedback.",
        strengths: [],
        improvements: [],
        recommendations: [],
        score_overall: 0,
        criteria: {
          architecture: 0,
          ai_engineering: 0,
          problem_solving: 0,
          communication: 0
        },
        per_question: []
      };
    }

    const transcriptText = context.transcript
      .map((turn) => {
        const rawTimestamp =
          turn.timestamp instanceof Date ? turn.timestamp : new Date(turn.timestamp);
        const timestamp = rawTimestamp.toISOString();
        const speaker = turn.role === "coach" ? "COACH" : "CANDIDATE";
        return `[${timestamp}] ${speaker}: ${turn.text}`;
      })
      .join("\n");

    const prompt = [
      {
        role: "system" as const,
        content:
          "You are Atlas, a staff-level interviewer for software, AI and data roles. Analyse the transcript and produce JSON feedback with keys: summary, strengths[], improvements[], recommendations[], score_overall (0-100), criteria {architecture, ai_engineering, problem_solving, communication}, per_question[{question, insight, score, tips[]}]. Be concise, concrete and reference observable behaviours."
      },
      {
        role: "user" as const,
        content: `Analyse the following mock interview transcript and provide feedback for a candidate preparing technical interviews (system design, AI/ML, data, software engineering).

Transcript:
${transcriptText}

Return JSON respecting the schema described earlier.`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: prompt
    });

    const content = completion.choices[0]?.message?.content ?? "";

    try {
      const parsed = JSON.parse(content) as Fcl055dFeedback;

      const safeScore = clampScore(parsed.score_overall, 70);
      const safeCriteria: TechCriteria = {
        architecture: clampScore(parsed.criteria?.architecture, safeScore),
        ai_engineering: clampScore(parsed.criteria?.ai_engineering, safeScore),
        problem_solving: clampScore(parsed.criteria?.problem_solving, safeScore),
        communication: clampScore(parsed.criteria?.communication, safeScore)
      };

      return {
        summary: parsed.summary,
        strengths: parsed.strengths ?? [],
        improvements: parsed.improvements ?? [],
        recommendations: parsed.recommendations ?? [],
        score_overall: safeScore,
        criteria: safeCriteria,
        per_question: parsed.per_question ?? [],
        raw: content
      };
    } catch {
      return {
        summary: content || "Feedback généré, mais impossible de parser la sortie en JSON.",
        strengths: [],
        improvements: [],
        recommendations: [],
        score_overall: 70,
        raw: content
      };
    }
  }
}
