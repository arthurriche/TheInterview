import { RealtimeAPIService } from "./realtime-api.service";
import { BaseFeedbackService, type FeedbackStrategy } from "./feedback/base-feedback.service";

export type Turn = {
  role: "coach" | "user";
  text: string;
  timestamp: Date;
  sequence?: number;
};

export interface CoachConfig {
  role: string;
  systemPrompt: string;
  greeting?: string;
  model?: string;
  voice?: "alloy" | "echo" | "shimmer";
  temperature?: number;
  audioProcessing?: {
    commitIntervalFrames?: number;
    silenceFlushFrames?: number;
    silenceDelayMs?: number;
  };
}

export interface CoachHooks {
  shouldEnd?(ctx: SessionContext): boolean | Promise<boolean>;
  onUserText?(text: string, ctx: SessionContext): void | Promise<void>;
  onOAIRawEvent?(evt: any, ctx: SessionContext): void | Promise<void>;
}

export interface SessionContext {
  id: string;
  transcript: Turn[];
  awaitingUserTurn?: boolean;
}

export class BaseCoachService {
  protected readonly realtime: RealtimeAPIService;
  protected readonly cfg: CoachConfig;
  protected readonly hooks: CoachHooks;
  protected readonly ctx: SessionContext;
  protected readonly feedback: FeedbackStrategy;
  protected isResponseInProgress = false;
  protected hasPendingResponseRequest = false;

  constructor(
    apiKey: string,
    sessionId: string,
    cfg: CoachConfig,
    hooks: CoachHooks,
    feedbackStrategy?: FeedbackStrategy
  ) {
    this.cfg = cfg;
    this.hooks = hooks;
    this.ctx = { id: sessionId, transcript: [], awaitingUserTurn: false };
    this.feedback = feedbackStrategy ?? new BaseFeedbackService();

    this.realtime = new RealtimeAPIService(apiKey, {
      model: cfg.model ?? "gpt-4o-realtime-preview-2024-10-01",
      voice: cfg.voice ?? "alloy",
      instructions: cfg.systemPrompt,
      modalities: ["text", "audio"],
      temperature: cfg.temperature ?? 0.8
    });
  }

  protected getLastUserTurn(): Turn | undefined {
    for (let i = this.ctx.transcript.length - 1; i >= 0; i -= 1) {
      if (this.ctx.transcript[i].role === "user") {
        return this.ctx.transcript[i];
      }
    }
    return undefined;
  }

  protected buildResponseInstructions(): string {
    const lastUser = this.getLastUserTurn();

    if (!lastUser) {
      return (
        this.cfg.greeting ??
        "Greet the candidate, state that this is a mock interview, and ask the very first question. Ask only one question and end your response with a prompt inviting them to answer."
      );
    }

    const sanitizedAnswer = lastUser.text.replace(/\s+/g, " ").trim().slice(0, 600);

    return [
      `You are still the interviewer 'Atlas'. The candidate just answered: "${sanitizedAnswer}".`,
      "Acknowledge or challenge their answer in at most two sentences, then ask exactly one new follow-up question.",
      "Do not offer sample answers or continue speaking after the question. Explicitly say you're waiting for their response."
    ].join(" ");
  }

  protected requestResponseCreation(force = false): void {
    if (!force && this.ctx.awaitingUserTurn) {
      return;
    }

    if (this.isResponseInProgress) {
      this.hasPendingResponseRequest = true;
      return;
    }

    this.hasPendingResponseRequest = false;
    this.ctx.awaitingUserTurn = true;

    const instructions = this.buildResponseInstructions();

    try {
      this.realtime.send({
        type: "response.create",
        response: {
          instructions
        }
      });
    } catch (err) {
      console.error("BaseCoachService response.create error:", err);
    }
  }

  getAudioProcessingConfig() {
    return {
      commitIntervalFrames: this.cfg.audioProcessing?.commitIntervalFrames ?? 999999,
      silenceFlushFrames: this.cfg.audioProcessing?.silenceFlushFrames ?? 8,
      silenceDelayMs: this.cfg.audioProcessing?.silenceDelayMs ?? 1000
    };
  }

  async start(options?: { delayGreeting?: boolean }): Promise<void> {
    await this.realtime.connect();

    this.realtime.onMessage(async (message) => {
      try {
        console.log("📨 BaseCoachService received message:", message.type, message);

        if (message.type === "response.created") {
          this.isResponseInProgress = true;
        } else if (message.type === "response.done") {
          this.isResponseInProgress = false;
          if (this.hasPendingResponseRequest) {
            this.requestResponseCreation();
          }
        }

        if (this.hooks.onOAIRawEvent) {
          await this.hooks.onOAIRawEvent(message, this.ctx);
        }
      } catch (err) {
        console.error("BaseCoachService onMessage error:", err);
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Only send greeting immediately if not delayed
    if (!options?.delayGreeting) {
      this.requestResponseCreation(true);
    } else {
      console.log("⏸️ Greeting delayed - waiting for avatar connection");
    }
  }

  // Method to trigger greeting manually after avatar is ready
  triggerGreeting(): void {
    console.log("▶️ Triggering greeting now that avatar is ready");
    this.requestResponseCreation(true);
  }

  protected async ensureRealtimeConnection(): Promise<void> {
    try {
      await this.realtime.ensureConnected();
    } catch (err) {
      console.error("BaseCoachService ensureRealtimeConnection error:", err);
      throw err;
    }
  }

  async sendAudio(audioBase64: string): Promise<void> {
    if (!audioBase64) return;

    try {
      this.ctx.awaitingUserTurn = false;
      await this.ensureRealtimeConnection();
      this.realtime.sendAudio(audioBase64);
    } catch (err) {
      console.error("BaseCoachService sendAudio error:", err);
      throw err;
    }
  }

  async commitAudio(): Promise<void> {
    try {
      await this.ensureRealtimeConnection();
      this.realtime.commitAudio();
    } catch (err) {
      console.error("BaseCoachService commitAudio error:", err);
      throw err;
    }
    this.requestResponseCreation();
  }

  async sendUserText(text: string): Promise<void> {
    this.pushUser(text);
    this.ctx.awaitingUserTurn = false;
    await this.hooks.onUserText?.(text, this.ctx);
    try {
      await this.ensureRealtimeConnection();
      await this.realtime.sendText(text);
      this.requestResponseCreation();
    } catch (err) {
      console.error("BaseCoachService sendUserText error:", err);
      throw err;
    }
  }

  async shouldEnd(): Promise<boolean> {
    if (!this.hooks.shouldEnd) return false;
    return Boolean(await this.hooks.shouldEnd(this.ctx));
  }

  async end(): Promise<{ transcript: Turn[]; feedback?: unknown }> {
    this.realtime.disconnect();
    const transcript = [...this.ctx.transcript];

    try {
      const feedback = await this.feedback.generate({
        transcript,
        session: this.ctx,
        config: this.cfg
      });

      return feedback ? { transcript, feedback } : { transcript };
    } catch (err) {
      console.error("BaseCoachService feedback generation error:", err);
      return { transcript };
    }
  }

  disconnect(): void {
    this.realtime.disconnect();
  }

  protected pushUser(text: string) {
    this.ctx.awaitingUserTurn = false;
    this.ctx.transcript.push({
      role: "user",
      text,
      timestamp: new Date()
    });
  }

  protected pushCoach(text: string) {
    this.ctx.awaitingUserTurn = true;
    this.ctx.transcript.push({
      role: "coach",
      text,
      timestamp: new Date()
    });
  }

  protected extractFirstText(item: any): string | null {
    const content = item?.content;
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part?.type === "output_text" && typeof part.text === "string") {
          return part.text;
        }
      }
    }
    return null;
  }
}
