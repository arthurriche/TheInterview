import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { WorkerOptions, cli, defineAgent, voice } from "@livekit/agents";
import * as bey from "@livekit/agents-plugin-bey";
import * as openai from "@livekit/agents-plugin-openai";

if (typeof process.loadEnvFile === "function") {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  if (existsSync(".env")) {
    process.loadEnvFile(".env");
  }
}

const beyAvatarId = process.env.BEY_AVATAR_ID;
const beyApiKey = process.env.BEY_API_KEY ?? process.env.BEYOND_PRESENCE_API_KEY;
const beyApiBase =
  process.env.BEY_API_URL ??
  process.env.BEYOND_PRESENCE_API_BASE ??
  process.env.BEYOND_PRESENCE_API_BASE_URL;
const agentName = process.env.LIVEKIT_AGENT_NAME ?? "finance-coach-avatar";

const normalizeBeyApiUrl = (url) => {
  if (!url) return undefined;
  const trimmed = url.trim().replace(/\/+$/, "");
  // SDK appends /v1/session, so strip any trailing /v1 in env to avoid double segments.
  return trimmed.endsWith("/v1") ? trimmed.slice(0, -3) : trimmed;
};

const beyApiUrl = normalizeBeyApiUrl(beyApiBase);

export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();
    console.log("🤖 LiveKit Agent connected to room:", ctx.room.name);

    // Instructions for the voice agent (will be sent to OpenAI Realtime)
    const instructions = `
You are "Atlas", a principal engineer & hiring manager who coaches senior software, AI, and data candidates
for interviews at cutting-edge companies (LLM platforms, autonomous systems, infrastructure scale-ups).

Session goals:
- Stress-test the candidate on system design, coding depth, AI/ML intuition, and product/impact thinking.
- Alternate between whiteboard scenarios, debugging drills, and "explain your architecture" conversations.
- Dig into implementation details: APIs, failure modes, observability, model validation, compute trade-offs.
- Challenge vague answers politely; ask for metrics, benchmarks, or concrete stories when needed.
- Surface technical rigor and collaborative behaviour in real time so the candidate can course-correct.
- Close with a concise recap (strengths + risks) and mention that a written breakdown will follow.

Constraints:
- Speak in English with an optimistic, tech-savvy tone.
- Keep answers concise (30–60 seconds) and return the floor with a targeted question or scenario.
- If audio is unclear, request a repeat instead of pretending to understand.
- After you ask something, pause and wait. Never answer your own prompts or speak on behalf of the candidate unless they explicitly ask for an example.
- If the candidate stays silent, wait ~15 seconds, acknowledge the silence, and politely prompt them again instead of filling the gap.
- Absolutely never invent or narrate the candidate's answers; only speak as the interviewer.
- Never end unless the candidate clearly requests it or the session budget is exhausted; otherwise keep probing.
`.trim();

    const voiceAgentSession = new voice.AgentSession({
      llm: new openai.realtime.RealtimeModel({
        instructions,
        voice: "alloy",
        temperature: 0.6,
        modalities: ["text", "audio"]
      })
    });

    const voiceAgent = new voice.Agent({
      instructions
    });

    if (!beyApiKey) {
      console.warn(
        "[agents/livekit-agent] BEY_API_KEY manquant. Le flux avatar restera en mode placeholder. " +
          "Ajoutez BEY_API_KEY ou BEYOND_PRESENCE_API_KEY à votre .env pour activer l'avatar Beyond Presence."
      );
    }

    const beyAvatarSession = beyApiKey
      ? new bey.AvatarSession({
          apiKey: beyApiKey,
          ...(beyAvatarId ? { avatarId: beyAvatarId } : {}),
          ...(beyApiUrl ? { apiUrl: beyApiUrl } : {})
        })
      : null;

    console.log("🎙️ Starting voice agent session with OpenAI Realtime...");
    await voiceAgentSession.start({ agent: voiceAgent, room: ctx.room });
    
    if (beyAvatarSession) {
      console.log("👤 Starting Beyond Presence avatar session...");
      await beyAvatarSession.start(voiceAgentSession, ctx.room);
      console.log("✅ Avatar session started - avatar should be visible and ready to speak");
    } else {
      console.log("⚠️ Running without Beyond Presence avatar (placeholder mode)");
    }

    // CRITICAL: Start the conversation automatically when a participant joins
    ctx.room.on('participantConnected', async (participant) => {
      console.log("👥 Participant joined:", participant.identity);
      
      // Wait a bit for tracks to be published
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if participant has audio track
      const hasAudio = Array.from(participant.trackPublications.values()).some(
        pub => pub.kind === 'audio' && pub.track
      );
      
      if (hasAudio) {
        console.log("🎤 Participant has audio track - initiating conversation");
        
        // Send initial greeting via the agent
        const greeting = "Let's jump into your tech background. Walk me through a recent system or AI product you shipped—highlight the architecture decisions, the toughest trade-offs, and how you measured success.";
        
        try {
          // Trigger the agent to speak the greeting
          await voiceAgent.say(greeting);
          console.log("✅ Greeting sent to avatar - should start speaking now");
        } catch (error) {
          console.error("❌ Failed to send greeting:", error);
        }
      } else {
        console.log("⏳ Waiting for participant to publish audio track...");
      }
    });

    console.log("🚀 LiveKit Agent fully initialized and ready");
  }
});

process.argv = [process.argv[0], process.argv[1], "dev"];
cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName
  })
);
