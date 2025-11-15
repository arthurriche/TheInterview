"use server";

import { randomUUID } from "crypto";
import {
  createLiveKitViewerAccess,
  dispatchAgentToRoom,
  isLiveKitConfigured
} from "@/lib/livekit.server";
import type {
  BeyondPresenceSessionRequest,
  BeyondPresenceSessionResponse
} from "./bey/types";

const DEFAULT_ROOM_PREFIX = process.env.BEYOND_PRESENCE_ROOM_PREFIX ?? "financebro-bey";
const DEFAULT_AGENT_NAME = process.env.LIVEKIT_AGENT_NAME ?? "finance-coach-avatar";
const BEY_KEYS = [
  process.env.BEY_API_KEY,
  process.env.BEYOND_PRESENCE_API_KEY,
  process.env.BEYOND_PRESENCE_API_KEY?.length ? process.env.BEYOND_PRESENCE_API_KEY : undefined
].filter(Boolean) as string[];

function resolveSessionId(candidate?: string): string {
  if (candidate && typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }
  return randomUUID();
}

export async function isBeyondPresenceReady(): Promise<boolean> {
  const hasApiKey = BEY_KEYS.length > 0;
  const livekitReady = await isLiveKitConfigured();
  return hasApiKey && livekitReady;
}

export async function createBeyondPresenceSession(
  payload: BeyondPresenceSessionRequest
): Promise<BeyondPresenceSessionResponse> {
  const ready = await isBeyondPresenceReady();
  const sessionId = resolveSessionId(payload.sessionId);
  const roomName = `${DEFAULT_ROOM_PREFIX}-${sessionId}`;

  if (!ready) {
    return {
      sessionId,
      roomName,
      stub: true,
      persona: payload.persona,
      locale: payload.locale,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      agentDispatched: false,
      agentName: DEFAULT_AGENT_NAME
    };
  }

  const metadataPayload = {
    sessionId,
    persona: payload.persona,
    locale: payload.locale
  };

  const metadata = JSON.stringify(metadataPayload);

  const livekit = await createLiveKitViewerAccess({
    roomName,
    name: "FinanceBro Candidate",
    metadata,
    ttlSeconds: 60 * 60
  });

  if (!livekit) {
    return {
      sessionId,
      roomName,
      stub: true,
      persona: payload.persona,
      locale: payload.locale,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      agentDispatched: false,
      agentName: DEFAULT_AGENT_NAME
    };
  }

  const dispatched = await dispatchAgentToRoom(roomName, DEFAULT_AGENT_NAME, metadata);

  return {
    sessionId,
    roomName,
    livekit,
    persona: payload.persona,
    locale: payload.locale,
    expiresAt: livekit.expiresAt,
    agentDispatched: dispatched,
    agentName: DEFAULT_AGENT_NAME
  };
}
