import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

interface ExtractLinkedInBody {
  url: string;
}

interface ExtractedData {
  title: string;
  company: string;
  role: string;
  position_round: 'screening' | 'tech' | 'final' | 'case' | 'fit';
  focus_areas: string[];
  duration_minutes: number;
  summary: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<ExtractLinkedInBody>;

    if (!body.url) {
      return NextResponse.json(
        { error: "URL LinkedIn requise" },
        { status: 400 }
      );
    }

    // Fetch the LinkedIn page content
    const response = await fetch(body.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer l'offre LinkedIn" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract text content from HTML (simple text extraction)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000); // Limit to avoid token limits

    const openai = await getOpenAIClient();

    if (!openai) {
      return NextResponse.json(
        { error: "Service d'IA non disponible (OPENAI_API_KEY manquant)" },
        { status: 503 }
      );
    }

    // Use OpenAI to extract structured information
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant qui extrait des informations d'offres d'emploi LinkedIn.
Analyse le contenu de la page et retourne un JSON avec les informations suivantes:
- title: un titre court pour l'interview (format: "Entreprise - Poste Type d'entretien")
- company: le nom de l'entreprise
- role: le poste/niveau (ex: "Analyst", "Associate", "Vice President", etc.)
- position_round: le type d'entretien le plus probable parmi: "screening", "tech", "final", "case", "fit"
- focus_areas: un tableau de domaines parmi: "valuation", "accounting", "markets", "fit", "technical", "case-study", "behavioral"
- duration_minutes: une durée estimée en minutes (entre 15 et 120)
- summary: un résumé très bref (2-3 phrases max) expliquant ce qui a été compris du poste et comment l'entretien sera orienté

Retourne UNIQUEMENT un objet JSON valide, sans texte supplémentaire.`
        },
        {
          role: "user",
          content: `Voici le contenu de l'offre LinkedIn:\n\n${textContent}`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      return NextResponse.json(
        { error: "Erreur lors de l'extraction des données" },
        { status: 500 }
      );
    }

    const extractedData = JSON.parse(result) as ExtractedData;

    return NextResponse.json({
      success: true,
      data: extractedData
    });

  } catch (error: any) {
    console.error('Error extracting LinkedIn data:', error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'extraction des données" },
      { status: 500 }
    );
  }
}
