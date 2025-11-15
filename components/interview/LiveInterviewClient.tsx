"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle } from "lucide-react";
import { InterviewPlayer } from "@/components/interview/InterviewPlayer";
import { LiveControls } from "@/components/interview/LiveControls";
import { LiveSidebar } from "@/components/interview/LiveSidebar";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { InterviewSession } from "@/lib/types/interview";
import { useRealtimeCoach } from "@/lib/coach/useRealtimeCoach";
import type { CoachSessionResult, TranscriptEntry } from "@/lib/coach/useRealtimeCoach";
import type { BeyondPresenceSessionResponse } from "@/lib/bey/types";

interface LiveInterviewClientProps {
  session: InterviewSession;
  userName: string;
}

// Questions mock pour la démo
const MOCK_QUESTIONS = [
  {
    id: "1",
    text: "Pouvez-vous vous présenter brièvement et nous parler de votre parcours ?",
    asked: false,
  },
  {
    id: "2",
    text: "Pourquoi souhaitez-vous rejoindre notre entreprise ?",
    asked: false,
  },
  {
    id: "3",
    text: "Parlez-moi d'une situation où vous avez dû gérer un conflit en équipe.",
    asked: false,
  },
  {
    id: "4",
    text: "Quelles sont vos plus grandes forces et faiblesses ?",
    asked: false,
  },
  {
    id: "5",
    text: "Où vous voyez-vous dans 5 ans ?",
    asked: false,
  },
];

export function LiveInterviewClient({ session, userName }: LiveInterviewClientProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  
  const [timeRemaining, setTimeRemaining] = useState(session.duration_minutes * 60); // en secondes
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [isEnding, setIsEnding] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [coachComposer, setCoachComposer] = useState("");
  const completionRef = useRef(false);

  const completeInterview = useCallback(
    async (origin: "manual" | "auto", result?: CoachSessionResult) => {
      if (completionRef.current) {
        return;
      }
      completionRef.current = true;

      try {
        const { error: updateError } = await supabase
          .from("interview_sessions")
          .update({
            status: "completed",
            ended_at: new Date().toISOString()
          })
          .eq("id", session.id);

        if (updateError) throw updateError;

        const structuredFeedback = (result?.feedback ?? null) as {
          summary?: string;
          strengths?: string[];
          improvements?: string[];
          recommendations?: string[];
        } | null;

        const generalSummary =
          structuredFeedback?.summary ??
          "Bonne performance globale. Vous avez montré de bonnes compétences en communication et une compréhension claire du poste.";
        const strengths =
          structuredFeedback?.strengths && structuredFeedback.strengths.length > 0
            ? structuredFeedback.strengths
            : [
                "Excellente présentation personnelle",
                "Réponses structurées et claires",
                "Bonne connaissance de l'entreprise"
              ];
        const improvements =
          structuredFeedback?.improvements && structuredFeedback.improvements.length > 0
            ? structuredFeedback.improvements
            : [
                "Développer davantage les exemples concrets",
                "Travailler la confiance en soi",
                "Préparer des questions plus approfondies"
              ];

        const { error: feedbackError } = await supabase
          .from("interview_feedback")
          .insert({
            session_id: session.id,
            general: generalSummary,
            went_well: strengths,
            to_improve: improvements,
            per_question: questions
              .filter((q) => q.asked)
              .map((q) => ({
                question: q.text,
                summary: "Réponse complète et pertinente.",
                tips: ["Ajouter plus de détails quantifiés", "Utiliser la méthode STAR"],
                score: 70 + Math.random() * 20
              })),
            score_overall: 78
          });

        if (feedbackError) throw feedbackError;

        toast.success(
          origin === "manual"
            ? "Interview terminée ! Redirection vers l'analyse..."
            : "Session terminée automatiquement. Redirection..."
        );
        router.push(`/interview/feedback/${session.id}`);
      } catch (error) {
        console.error("Error ending interview:", error);
        toast.error("Erreur lors de la fin de l'interview");
        completionRef.current = false;
        setIsEnding(false);
      }
    },
    [questions, router, session.id, supabase, setIsEnding]
  );

  const [beyondPresenceSession, setBeyondPresenceSession] =
    useState<BeyondPresenceSessionResponse | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<
    "idle" | "connecting" | "connected" | "stub" | "error"
  >("idle");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const livekitRoomRef = useRef<any>(null);
  const livekitVideoTrackRef = useRef<any>(null);
  const avatarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    status: coachStatus,
    transcript: coachTranscript,
    elapsed: coachElapsed,
    isMuted,
    setMuted,
    finalizeSession: finalizeCoachSession,
    sendText: coachSendText
  } = useRealtimeCoach({
    sessionId: `coach-${session.id}`,
    autoStart: true,
    onSessionEnd: async (result) => {
      await completeInterview("auto", result);
    }
  });

  const teardownLiveKit = useCallback(() => {
    try {
      const currentTrack = livekitVideoTrackRef.current;
      if (currentTrack && avatarVideoRef.current) {
        currentTrack.detach(avatarVideoRef.current);
      }
    } catch (error) {
      console.warn("Impossible de détacher la vidéo LiveKit", error);
    } finally {
      livekitVideoTrackRef.current = null;
    }

    const room = livekitRoomRef.current;
    if (!room) {
      return;
    }

    try {
      room.removeAllListeners?.();
      if (room.state === "connected") {
        room.disconnect?.().catch(() => {
          /* ignore */
        });
      }
    } catch (error) {
      console.warn("Impossible de fermer la room LiveKit", error);
    } finally {
      livekitRoomRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const createAvatarSession = async () => {
      setAvatarError(null);
      setAvatarStatus("connecting");

      try {
        const response = await fetch("/api/bey/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sessionId: session.id,
            persona: session.role,
            locale: "fr-FR"
          })
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error ?? "Impossible de créer la session Beyond Presence.");
        }

        const payload = (await response.json()) as BeyondPresenceSessionResponse;
        if (cancelled) return;

        setBeyondPresenceSession(payload);

        if (payload.stub) {
          setAvatarStatus("stub");
          return;
        }

        if (payload.agentDispatched === false) {
          setAvatarStatus("error");
          setAvatarError(
            `Agent Beyond Presence non démarré. Vérifiez le worker « ${payload.agentName ?? "finance-coach-avatar"} ».`
          );
          return;
        }

        setAvatarStatus("connecting");
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Erreur inconnue lors du démarrage de l'avatar.";
        setAvatarStatus("error");
        setAvatarError(message);
        toast.error("Impossible de lancer l'avatar Beyond Presence", {
          description: message
        });
      }
    };

    void createAvatarSession();

    return () => {
      cancelled = true;
      setBeyondPresenceSession(null);
      setAvatarStatus("idle");
      setAvatarError(null);
      teardownLiveKit();
    };
  }, [session.id, session.role, teardownLiveKit]);

  const handleEndInterview = useCallback(async () => {
    if (isEnding || completionRef.current) {
      return;
    }
    setIsEnding(true);

    const result = await finalizeCoachSession("manual");
    if (!result.ok) {
      setIsEnding(false);
      return;
    }

    if (!completionRef.current) {
      await completeInterview("manual", result as CoachSessionResult);
    }
  }, [completeInterview, finalizeCoachSession, isEnding]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleEndInterview]);

  useEffect(() => {
    if (!beyondPresenceSession) {
      setAvatarStatus("idle");
      setAvatarError(null);
      teardownLiveKit();
      return;
    }

    if (beyondPresenceSession.stub || !beyondPresenceSession.livekit) {
      setAvatarStatus(beyondPresenceSession.stub ? "stub" : "idle");
      return;
    }

    let cancelled = false;

    const connect = async () => {
      setAvatarStatus("connecting");

      try {
        const livekit = await import("livekit-client");
        if (cancelled) return;

        const room = new livekit.Room({
          adaptiveStream: true,
          dynacast: true
        });

        const detachVideo = () => {
          const currentTrack = livekitVideoTrackRef.current;
          if (currentTrack && avatarVideoRef.current) {
            currentTrack.detach(avatarVideoRef.current);
          }
          livekitVideoTrackRef.current = null;
        };

        const attachVideo = (track: any) => {
          if (!avatarVideoRef.current || track.kind !== livekit.Track.Kind.Video) {
            return;
          }
          try {
            detachVideo();
            track.attach(avatarVideoRef.current);
            livekitVideoTrackRef.current = track;
          } catch (error) {
            console.warn("Impossible d'attacher la vidéo Beyond Presence", error);
          }
        };

        room
          .on(livekit.RoomEvent.TrackSubscribed, (track: any) => {
            attachVideo(track);
            if (track.kind === livekit.Track.Kind.Video) {
              setAvatarStatus("connected");
            }
          })
          .on(livekit.RoomEvent.TrackUnsubscribed, (track: any) => {
            if (track === livekitVideoTrackRef.current) {
              detachVideo();
              setAvatarStatus("connecting");
            }
          })
          .on(livekit.RoomEvent.Disconnected, () => {
            detachVideo();
            setAvatarStatus("idle");
          });

        await room.connect(beyondPresenceSession.livekit.url, beyondPresenceSession.livekit.token);

        if (cancelled) {
          await room.disconnect().catch(() => {
            /* ignore */
          });
          return;
        }

        livekitRoomRef.current = room;

        room.remoteParticipants.forEach((participant: any) => {
          participant.trackPublications.forEach((publication: any) => {
            if (publication?.isSubscribed) {
              const track = publication.track;
              if (track) {
                attachVideo(track);
              }
            }
          });
        });

        if (!livekitVideoTrackRef.current) {
          setAvatarStatus("connecting");
        }
      } catch (error) {
        if (cancelled) return;
        console.error("LiveKit avatar connection error", error);
        setAvatarStatus("error");
        setAvatarError(
          error instanceof Error ? error.message : "Connexion LiveKit impossible pour l'avatar."
        );
        teardownLiveKit();
      }
    };

    void connect();

    return () => {
      cancelled = true;
      teardownLiveKit();
    };
  }, [beyondPresenceSession, teardownLiveKit]);

  useEffect(() => {
    if (avatarStatus === "connecting") {
      if (avatarTimeoutRef.current) {
        clearTimeout(avatarTimeoutRef.current);
      }
      avatarTimeoutRef.current = setTimeout(() => {
        if (avatarStatus === "connecting") {
          setAvatarStatus("error");
          setAvatarError(
            "Flux avatar indisponible. Vérifiez la configuration Beyond Presence / LiveKit."
          );
        }
      }, 15000);
    } else if (avatarTimeoutRef.current) {
      clearTimeout(avatarTimeoutRef.current);
      avatarTimeoutRef.current = null;
    }

    return () => {
      if (avatarTimeoutRef.current) {
        clearTimeout(avatarTimeoutRef.current);
        avatarTimeoutRef.current = null;
      }
    };
  }, [avatarStatus]);

  // Simuler la progression des questions
  useEffect(() => {
    const questionInterval = setInterval(() => {
      setQuestions((prevQuestions) => {
        const updated = [...prevQuestions];
        if (currentQuestionIndex < updated.length && updated[currentQuestionIndex]) {
          updated[currentQuestionIndex] = { 
            id: updated[currentQuestionIndex].id,
            text: updated[currentQuestionIndex].text,
            asked: true 
          };
        }
        return updated;
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 30000); // Nouvelle question toutes les 30 secondes (pour la démo)

    return () => clearInterval(questionInterval);
  }, [currentQuestionIndex, questions.length]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercentage = (timeRemaining / (session.duration_minutes * 60)) * 100;
  const isLowTime = timeRemaining < 300; // Moins de 5 minutes

  return (
    <div className="space-y-6">
      {/* Header avec timer */}
      <BentoCard padding="md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-100">{session.title}</h1>
            <p className="text-sm text-slate-400">
              {session.company} · {session.role}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${isLowTime ? 'text-rose-400' : 'text-emerald-400'}`} />
              <div className="text-right">
                <p className={`text-2xl font-bold tabular-nums ${isLowTime ? 'text-rose-400' : 'text-slate-100'}`}>
                  {formatTime(timeRemaining)}
                </p>
                <p className="text-xs text-slate-400">restant</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  isLowTime ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${timePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {isLowTime && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-400/30">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <p className="text-xs text-rose-300">
              Temps bientôt écoulé ! Préparez votre conclusion.
            </p>
          </div>
        )}
      </BentoCard>

      {/* Main content: Video + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Video player */}
        <div className="space-y-4">
          <InterviewPlayer
            userName={userName}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            avatarVideoRef={avatarVideoRef}
            avatarStatus={avatarStatus}
            avatarError={avatarError}
            beyondPresenceSession={beyondPresenceSession}
          />
          
          {/* Controls */}
          <div className="flex justify-center">
            <LiveControls
              onEndInterview={handleEndInterview}
              onHelpRequest={() => toast.info("L'aide arrive bientôt !")}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              onToggleMute={(next) => setMuted(next)}
              onToggleVideo={(next) => setIsVideoOff(next)}
            />
          </div>

          <CoachTranscriptPanel
            status={coachStatus}
            elapsed={coachElapsed}
            transcript={coachTranscript}
          />

          <CoachComposerPanel
            value={coachComposer}
            onChange={setCoachComposer}
            disabled={coachStatus !== "running"}
            onSend={async () => {
              if (!coachComposer.trim()) return;
              const result = await coachSendText(coachComposer);
              if (result.ok) {
                setCoachComposer("");
              }
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] overflow-y-auto">
          <LiveSidebar
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
          />
        </div>
      </div>
    </div>
  );
}

function CoachTranscriptPanel({
  status,
  elapsed,
  transcript
}: {
  status: string;
  elapsed: string;
  transcript: TranscriptEntry[];
}) {
  return (
    <div className="bento-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Coach IA</h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${
              status === "running" ? "animate-pulse bg-emerald-400" : "bg-slate-500"
            }`}
          />
          <span className="capitalize">{status}</span>
          <span className="ml-2 tabular-nums text-slate-500">{elapsed}</span>
        </div>
      </div>
      <div className="mt-3 flex max-h-64 flex-col gap-3 overflow-y-auto text-sm text-slate-200">
        {transcript.map((entry, index) => (
          <div key={`${entry.timestamp}-${index}`} className="rounded-lg bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
              {entry.speaker === "candidate" ? "Vous" : "Coach"}
              <span className="ml-2 text-slate-500">
                {new Date(entry.timestamp).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-100">{entry.text}</p>
          </div>
        ))}
        {transcript.length === 0 ? (
          <p className="text-xs text-slate-400">Transcript en attente...</p>
        ) : null}
      </div>
    </div>
  );
}

function CoachComposerPanel({
  value,
  disabled,
  onChange,
  onSend
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="bento-card p-4">
      <h3 className="text-sm font-semibold text-slate-100">Envoyer une consigne</h3>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-24 rounded-[var(--radius)] border border-white/10 bg-white/5 p-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        placeholder={
          disabled
            ? "Le coach prépare la session..."
            : "Saisissez une question ou un contexte à transmettre."
        }
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={onSend} disabled={disabled || !value.trim()}>
          Envoyer
        </Button>
      </div>
    </div>
  );
}
