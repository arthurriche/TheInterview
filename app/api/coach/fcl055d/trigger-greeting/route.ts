import { NextResponse } from "next/server";
import { getFcl055dSession } from "@/lib/coach/session-registry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { sessionId } = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
  };

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
  }

  try {
    const entry = getFcl055dSession(sessionId);
    if (!entry) {
      return NextResponse.json({ error: "Session inconnue" }, { status: 404 });
    }

    // Trigger the greeting now that avatar is ready
    entry.service.triggerGreeting();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("FCL055d trigger-greeting error", error);
    return NextResponse.json(
      { error: "Impossible de déclencher le greeting." },
      { status: 500 }
    );
  }
}
