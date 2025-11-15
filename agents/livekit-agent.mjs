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
const agentName = process.env.LIVEKIT_AGENT_NAME ?? "finance-coach-avatar";

export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();

    const voiceAgentSession = new voice.AgentSession({
      llm: new openai.realtime.RealtimeModel()
    });

    const voiceAgent = new voice.Agent({
      instructions: "You are a friendly AI with a visual avatar"
    });

    const beyAvatarSession = new bey.AvatarSession({ beyAvatarId });

    await voiceAgentSession.start({ agent: voiceAgent, room: ctx.room });
    await beyAvatarSession.start(voiceAgentSession, ctx.room);
  }
});

process.argv = [process.argv[0], process.argv[1], "dev"];
cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName
  })
);
