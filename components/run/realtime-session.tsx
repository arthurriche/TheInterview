"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRealtimeCoach } from "@/lib/coach/useRealtimeCoach";
import type { TranscriptEntry } from "@/lib/coach/useRealtimeCoach";
import type { BeyondPresenceSessionResponse } from "@/lib/bey/types";

type CoachFeedback = {
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
  score_overall?: number;
  criteria?: Record<string, number>;
  per_question?: Array<{
    question?: string;
    summary?: string;
    insight?: string;
    tips?: string[];
    score?: number;
  }>;
  raw?: string;
} | null;

export function RealtimeSession() {
  const [previewSessionId, setPreviewSessionId] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState<"idle" | "preparing" | "ready" | "error">(
    "idle"
  );

  const coachOptions = useMemo(
    () => ({
      sessionId: previewSessionId ?? undefined,
      // NOTE: Keep OpenAI frontend for greeting and transcript, but avatar handles audio
    }),
    [previewSessionId]
  );

  const {
    status,
    sessionId: coachSessionId,
    transcript,
    feedback: rawFeedback,
    elapsed,
    startSession: startCoachSession,
    finalizeSession: finalizeCoachSession,
    sendText
  } = useRealtimeCoach(coachOptions);

  const [beyondPresenceSession, setBeyondPresenceSession] =
    useState<BeyondPresenceSessionResponse | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<
    "idle" | "connecting" | "connected" | "stub" | "error"
  >("idle");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [composer, setComposer] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "requesting" | "ready" | "error">(
    "idle"
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micStatus, setMicStatus] = useState<"idle" | "requesting" | "ready" | "error">(
    "idle"
  );
  const [micError, setMicError] = useState<string | null>(null);
  const livekitRoomRef = useRef<any>(null);
  const livekitVideoTrackRef = useRef<any>(null);
  const avatarTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const micPreviewStreamRef = useRef<MediaStream | null>(null);
  const autoPreviewLockRef = useRef(false);
  const avatarStatusRef = useRef<
    "idle" | "connecting" | "connected" | "stub" | "error"
  >(avatarStatus);
  const beyondPresenceSessionRef = useRef<BeyondPresenceSessionResponse | null>(null);

  useEffect(() => {
    avatarStatusRef.current = avatarStatus;
  }, [avatarStatus]);

  useEffect(() => {
    beyondPresenceSessionRef.current = beyondPresenceSession;
  }, [beyondPresenceSession]);
  const syncCameraElement = useCallback((stream: MediaStream | null) => {
    const element = selfVideoRef.current;
    if (!element) return;

    if (!stream) {
      if (element.srcObject) {
        try {
          element.pause?.();
        } catch (error) {
          console.warn("Camera preview pause error", error);
        }
        element.srcObject = null;
      }
      return;
    }

    if (element.srcObject !== stream) {
      element.srcObject = stream;
    }

    const playPromise = element.play?.();
    if (playPromise instanceof Promise) {
      playPromise.catch((error) => {
        console.warn("Camera preview autoplay bloqué", error);
      });
    }
  }, []);

  const feedback = (rawFeedback ?? null) as CoachFeedback;

  const teardownLiveKit = useCallback(() => {
    try {
      const track = livekitVideoTrackRef.current;
      if (track && videoRef.current) {
        track.detach(videoRef.current);
      }
    } catch (error) {
      console.warn("LiveKit detach error", error);
    } finally {
      livekitVideoTrackRef.current = null;
    }

    const room = livekitRoomRef.current;
    if (room) {
      try {
        room.removeAllListeners?.();
        if (room.state === "connected") {
          room.disconnect?.().catch(() => {
            /* ignore */
          });
        }
      } catch (error) {
        console.warn("LiveKit disconnect error", error);
      } finally {
        livekitRoomRef.current = null;
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    cameraStreamRef.current = null;
    syncCameraElement(null);

    setCameraStatus("idle");
    setCameraError(null);
  }, [syncCameraElement]);

  const stopMicPreview = useCallback(() => {
    const stream = micPreviewStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    micPreviewStreamRef.current = null;
    setMicStatus("idle");
    setMicError(null);
  }, []);

  const ensureCameraAccess = useCallback(async (): Promise<boolean> => {
    if (cameraStreamRef.current && cameraStatus === "ready") {
      return true;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setCameraError("Caméra non supportée sur ce navigateur.");
      if (!micPreviewStreamRef.current) {
        setMicStatus("error");
        setMicError("Micro non supporté sur ce navigateur.");
      }
      return false;
    }

    if (typeof window !== "undefined" && !window.isSecureContext) {
      const description = "La caméra nécessite un contexte sécurisé (HTTPS ou http://localhost).";
      setCameraStatus("error");
      setCameraError(description);
      if (!micPreviewStreamRef.current) {
        setMicStatus("error");
        setMicError(description);
      }
      toast.error("Impossible d'activer la caméra.", { description });
      return false;
    }

    try {
      setCameraStatus("requesting");
      if (!micPreviewStreamRef.current) {
        setMicStatus("requesting");
        setMicError(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true
      });

      const videoTracks = stream.getVideoTracks();
      if (!videoTracks.length) {
        throw new Error("Aucune caméra détectée.");
      }

      const videoStream = new MediaStream(videoTracks);
      cameraStreamRef.current = videoStream;
      syncCameraElement(videoStream);
      setCameraStatus("ready");
      setCameraError(null);

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length) {
        stopMicPreview();
        const audioStream = new MediaStream(audioTracks);
        micPreviewStreamRef.current = audioStream;
        setMicStatus("ready");
        setMicError(null);
      }

      return true;
    } catch (error) {
      console.error("Camera access error", error);
      const description = error instanceof Error ? error.message : undefined;
      setCameraStatus("error");
      setCameraError(description ?? "Accès caméra refusé.");
      if (!micPreviewStreamRef.current) {
        setMicStatus("error");
        setMicError(description ?? "Accès micro refusé.");
      }
      toast.error("Impossible d'activer la caméra.", { description });
      return false;
    }
  }, [cameraStatus, stopMicPreview, syncCameraElement]);

  const ensureMicrophoneAccess = useCallback(async (): Promise<boolean> => {
    if (micPreviewStreamRef.current && micStatus === "ready") {
      return true;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus("error");
      setMicError("Micro non supporté sur ce navigateur.");
      return false;
    }

    try {
      setMicStatus("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stopMicPreview();
      micPreviewStreamRef.current = stream;
      setMicStatus("ready");
      setMicError(null);
      return true;
    } catch (error) {
      console.error("Microphone access error", error);
      const description = error instanceof Error ? error.message : undefined;
      setMicStatus("error");
      setMicError(description ?? "Accès micro refusé.");
      toast.error("Impossible d'activer le micro.", { description });
      return false;
    }
  }, [micStatus, stopMicPreview]);

  useEffect(() => {
    const permissions = (navigator as any)?.permissions;
    if (!permissions?.query) return;

    let mounted = true;

    permissions
      .query({ name: "camera" as PermissionName })
      .then((perm: PermissionStatus) => {
        if (!mounted) return;
        if (perm.state === "denied") {
          setCameraStatus("error");
          setCameraError("Caméra bloquée par le navigateur. Autorisez-la dans les réglages du site.");
        } else if (perm.state === "granted") {
          setCameraError(null);
          if (!cameraStreamRef.current) {
            setCameraStatus("idle");
          }
        }
        perm.onchange = () => {
          if (!mounted) return;
          if (perm.state === "granted") {
            setCameraError(null);
            if (!cameraStreamRef.current) {
              setCameraStatus("idle");
            }
          } else if (perm.state === "denied") {
            stopCamera();
            setCameraStatus("error");
            setCameraError("Caméra bloquée par le navigateur. Autorisez-la dans les réglages du site.");
          }
        };
      })
      .catch(() => {
        /* ignore permissions errors */
      });

    return () => {
      mounted = false;
    };
  }, [stopCamera]);

  useEffect(() => {
    const permissions = (navigator as any)?.permissions;
    if (!permissions?.query) return;

    let mounted = true;

    permissions
      .query({ name: "microphone" as PermissionName })
      .then((perm: PermissionStatus) => {
        if (!mounted) return;
        if (perm.state === "denied") {
          setMicStatus("error");
          setMicError("Micro bloqué par le navigateur. Autorisez-le dans les réglages du site.");
        } else if (perm.state === "granted") {
          setMicError(null);
          if (!micPreviewStreamRef.current) {
            setMicStatus("idle");
          }
        }
        perm.onchange = () => {
          if (!mounted) return;
          if (perm.state === "granted") {
            setMicError(null);
            if (!micPreviewStreamRef.current) {
              setMicStatus("idle");
            }
          } else if (perm.state === "denied") {
            stopMicPreview();
            setMicStatus("error");
            setMicError("Micro bloqué par le navigateur. Autorisez-le dans les réglages du site.");
          }
        };
      })
      .catch(() => {
        /* ignore */
      });

    return () => {
      mounted = false;
    };
  }, [stopMicPreview]);

  useEffect(() => {
    const stream = cameraStreamRef.current;
    if (stream && cameraStatus === "ready") {
      syncCameraElement(stream);
    }
    if (!stream) {
      syncCameraElement(null);
    }
  }, [cameraStatus, syncCameraElement]);

  useEffect(() => {
    return () => {
      stopCamera();
      stopMicPreview();
    };
  }, [stopCamera, stopMicPreview]);

  const startPreview = useCallback(async (): Promise<boolean> => {
    if (previewStatus === "preparing") {
      return false;
    }

    try {
      setPreviewStatus("preparing");
      setAvatarError(null);
      setAvatarStatus("idle");

      const cameraReady = await ensureCameraAccess();
      if (!cameraReady) {
        toast.warning("Caméra requise", {
          description: "Autorisez la caméra pour démarrer la prévisualisation."
        });
        setPreviewStatus("error");
        return false;
      }

      if (!micPreviewStreamRef.current) {
        const micReady = await ensureMicrophoneAccess();
        if (!micReady) {
          toast.warning("Prévisualisation incomplète", {
            description: "Autorisez le micro pour vérifier les flux."
          });
          setPreviewStatus("error");
          return false;
        }
      } else {
        setMicStatus("ready");
        setMicError(null);
      }

      const nextSessionId =
        previewSessionId ??
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2));

      teardownLiveKit();
      setBeyondPresenceSession(null);

      const beyResponse = await fetch("/api/bey/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: nextSessionId,
          persona: "ib_avatar_fr",
          locale: "fr-FR"
        })
      });

      if (!beyResponse.ok) {
        const payload = await beyResponse.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Échec de l'initialisation Beyond Presence.");
      }

      const payload = (await beyResponse.json()) as BeyondPresenceSessionResponse;

      setPreviewSessionId(nextSessionId);
      setBeyondPresenceSession(payload);

      if (payload.stub) {
        setAvatarStatus("stub");
        setAvatarError(
          "Configuration Beyond Presence/LiveKit incomplète. Flux avatar désactivé."
        );
        setPreviewStatus("ready");
        return true;
      }

      if (payload.agentDispatched === false) {
        setAvatarStatus("error");
        setAvatarError(
          `Agent Beyond Presence non démarré. Vérifiez le worker « ${payload.agentName ?? "finance-coach-avatar"} » dans LiveKit Cloud.`
        );
        setPreviewStatus("ready");
        return true;
      }

      setPreviewStatus("ready");
      toast.success("Prévisualisation prête", {
        description: "Vérifiez le flux vidéo avant de démarrer l'entretien."
      });
      return true;
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message) {
        toast.error(error.message);
        setAvatarError(error.message);
      } else {
        setAvatarError("Erreur inconnue");
      }
      setAvatarStatus("error");
      setPreviewStatus("error");
      setBeyondPresenceSession(null);
      stopMicPreview();
      return false;
    }
  }, [
    ensureCameraAccess,
    ensureMicrophoneAccess,
    previewSessionId,
    previewStatus,
    stopMicPreview,
    teardownLiveKit
  ]);

  useEffect(() => {
    if (status === "running" || status === "connecting") {
      return;
    }
    if (previewStatus !== "idle") {
      return;
    }
    if (autoPreviewLockRef.current) {
      return;
    }

    autoPreviewLockRef.current = true;
    startPreview()
      .catch(() => {
        /* erreurs déjà gérées dans startPreview */
      })
      .finally(() => {
        autoPreviewLockRef.current = false;
      });
  }, [previewStatus, startPreview, status]);

  const waitForAvatarReady = useCallback(async (timeoutMs = 20000) => {
    const currentSession = beyondPresenceSessionRef.current;
    if (!currentSession || currentSession.stub || !currentSession.livekit) {
      return true;
    }

    const currentStatus = avatarStatusRef.current;
    if (currentStatus === "connected") {
      return true;
    }
    if (currentStatus === "error") {
      return false;
    }

    return await new Promise<boolean>((resolve) => {
      const deadline = Date.now() + timeoutMs;
      const interval = setInterval(() => {
        const status = avatarStatusRef.current;
        if (status === "connected") {
          clearInterval(interval);
          resolve(true);
        } else if (status === "error" || Date.now() >= deadline) {
          clearInterval(interval);
          resolve(false);
        }
      }, 250);
    });
  }, []);

  const startInterview = useCallback(async () => {
    if (status === "connecting" || status === "running") {
      return;
    }

    const previewOk =
      previewStatus === "ready" &&
      previewSessionId !== null &&
      beyondPresenceSession !== null;

    let effectivePreview = previewOk;
    if (!previewOk) {
      effectivePreview = await startPreview();
      if (!effectivePreview) {
        return;
      }
    }

    try {
      setAvatarError(null);
      if (avatarStatus !== "connected") {
        setAvatarStatus("connecting");
      }

      const avatarReady = await waitForAvatarReady();
      if (!avatarReady) {
        const description =
          "Avatar Beyond Presence non connecté. Vérifiez que le worker est en ligne avant de démarrer.";
        toast.error("Avatar indisponible", { description });
        setAvatarStatus("error");
        setAvatarError(description);
        return;
      }

      const coachResult = await startCoachSession();

      if (!coachResult.ok) {
        throw new Error(coachResult.error);
      }

      if (!previewSessionId && coachResult.sessionId) {
        setPreviewSessionId(coachResult.sessionId);
      }

      // Trigger the greeting now that avatar is connected
      const triggerGreetingResponse = await fetch("/api/coach/fcl055d/trigger-greeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: coachResult.sessionId ?? previewSessionId })
      });

      if (!triggerGreetingResponse.ok) {
        console.warn("Failed to trigger greeting, but continuing anyway");
      } else {
        console.log("✅ Greeting triggered - OpenAI will generate audio, avatar should speak via LiveKit");
      }

      setMicStatus("ready");
      setMicError(null);
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message) {
        toast.error(error.message);
        setAvatarError(error.message);
      } else {
        setAvatarError("Erreur inconnue");
      }
      setAvatarStatus("error");
      setMicStatus("error");
    }
  }, [
    avatarStatus,
    beyondPresenceSession,
    previewSessionId,
    previewStatus,
    startCoachSession,
    startPreview,
    status,
    stopMicPreview,
    waitForAvatarReady
  ]);

  const finalizeSession = useCallback(async () => {
    const result = await finalizeCoachSession("manual");
    if (result.ok) {
      teardownLiveKit();
      stopCamera();
      stopMicPreview();
      setBeyondPresenceSession(null);
      setAvatarStatus("idle");
      setAvatarError(null);
      setPreviewSessionId(null);
      setPreviewStatus("idle");
    }
  }, [finalizeCoachSession, stopCamera, stopMicPreview, teardownLiveKit]);

  useEffect(() => {
    if (!beyondPresenceSession) {
      teardownLiveKit();
      setAvatarStatus("idle");
      setAvatarError(null);
      return;
    }

    if (beyondPresenceSession.stub || !beyondPresenceSession.livekit) {
      // configuration incomplete or stubbed; nothing to connect.
      return;
    }

    let cancelled = false;

    const connectLiveKit = async () => {
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
          if (currentTrack && videoRef.current) {
            currentTrack.detach(videoRef.current);
          }
          livekitVideoTrackRef.current = null;
        };

        const attachVideo = (track: any) => {
          if (!videoRef.current || track.kind !== livekit.Track.Kind.Video) {
            return;
          }
          try {
            detachVideo();
            track.attach(videoRef.current);
            livekitVideoTrackRef.current = track;
          } catch (error) {
            console.warn("Impossible d'attacher la vidéo LiveKit", error);
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

        await room.connect(
          beyondPresenceSession.livekit.url,
          beyondPresenceSession.livekit.token
        );

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

        // CRITICAL: Publish microphone audio to LiveKit so the agent can hear the candidate
        if (micPreviewStreamRef.current) {
          try {
            const audioTracks = micPreviewStreamRef.current.getAudioTracks();
            if (audioTracks.length > 0) {
              const audioTrack = audioTracks[0];
              if (audioTrack) {
                await room.localParticipant.publishTrack(audioTrack, {
                  name: "candidate-microphone",
                  source: livekit.Track.Source.Microphone
                });
                console.log("✅ Microphone audio published to LiveKit - agent can now hear candidate");
              }
            }
          } catch (error) {
            console.error("Failed to publish microphone to LiveKit:", error);
          }
        }

        if (!livekitVideoTrackRef.current) {
          setAvatarStatus("connecting");
        }
      } catch (error) {
        if (cancelled) return;
        console.error("LiveKit avatar connection error", error);
        setAvatarStatus("error");
        setAvatarError(
          error instanceof Error ? error.message : "Connexion LiveKit impossible."
        );
        teardownLiveKit();
      }
    };

    void connectLiveKit();

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
            "Flux avatar indisponible. Vérifiez que le worker Beyond Presence est connecté à la room."
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

  const sendUserMessage = useCallback(async () => {
    if (!composer.trim()) {
      return;
    }
    const result = await sendText(composer);
    if (result.ok) {
      setComposer("");
    }
  }, [composer, sendText]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4">
        <div className="bento-card relative aspect-video overflow-hidden p-0">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
          {shouldShowAvatarOverlay({
            session: beyondPresenceSession,
            status: avatarStatus,
            error: avatarError
          }) ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 text-center text-sm text-slate-200">
              <AvatarOverlay
                session={beyondPresenceSession}
                status={avatarStatus}
                error={avatarError}
              />
            </div>
          ) : null}
          <div className="absolute bottom-4 right-4 z-20 h-28 w-28 overflow-hidden rounded-xl border border-white/20 bg-black/70 shadow-xl">
            <video
              ref={selfVideoRef}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                cameraStatus === "ready" ? "opacity-100" : "opacity-30"
              }`}
              autoPlay
              playsInline
              muted
            />
            {cameraStatus !== "ready" ? (
              <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-200">
                {cameraStatus === "requesting"
                  ? "Autorisez la caméra"
                  : cameraStatus === "error"
                    ? "Caméra indisponible"
                    : "Caméra en attente"}
              </div>
            ) : null}
            {cameraError && cameraStatus === "error" ? (
              <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-rose-200">
                {cameraError}
              </div>
            ) : null}
            {micStatus === "error" && micError ? (
              <div className="absolute inset-x-0 top-0 bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-rose-200">
                {micError}
              </div>
            ) : null}
          </div>
        </div>
        <div className="bento-card flex items-center justify-between p-4">
          <div className="flex items-center gap-4 text-sm text-slate-200">
            <span
              className={`inline-flex h-3 w-3 rounded-full ${
                status === "running" ? "animate-pulse bg-emerald-400" : "bg-slate-500"
              }`}
            />
            <span>Statut : {status}</span>
            <span>Chrono : {elapsed}</span>
            <span>
              Micro :{" "}
              <span
                className={
                  micStatus === "ready"
                    ? "text-emerald-300"
                    : micStatus === "error"
                      ? "text-rose-300"
                      : "text-slate-300"
                }
              >
                {micStatus === "ready"
                  ? "actif"
                  : micStatus === "requesting"
                    ? "autorisation…"
                    : micStatus === "error"
                      ? "bloqué"
                      : "inactif"}
              </span>
            </span>
            <span>
              Caméra :{" "}
              <span
                className={
                  cameraStatus === "ready"
                    ? "text-emerald-300"
                    : cameraStatus === "error"
                      ? "text-rose-300"
                      : "text-slate-300"
                }
              >
                {cameraStatus === "ready"
                  ? "active"
                  : cameraStatus === "requesting"
                    ? "autorisation…"
                    : cameraStatus === "error"
                      ? "bloquée"
                      : "inactive"}
              </span>
            </span>
            <span>
              Avatar :{" "}
              <span
                className={
                  avatarStatus === "connected"
                    ? "text-emerald-300"
                    : avatarStatus === "error"
                      ? "text-rose-300"
                      : "text-slate-300"
                }
              >
                {avatarStatus}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                void ensureMicrophoneAccess();
              }}
              disabled={micStatus === "requesting"}
            >
              {micStatus === "ready" ? "Micro actif" : "Activer micro"}
            </Button>
            {status === "running" ? (
              <Button variant="outline" onClick={finalizeSession}>
                Terminer et générer feedback
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    void startPreview();
                  }}
                  disabled={previewStatus === "preparing"}
                >
                  {previewStatus === "preparing"
                    ? "Préparation du flux..."
                    : previewStatus === "ready"
                      ? "Flux prêt · Relancer"
                      : "Relancer la prévisualisation"}
                </Button>
                <Button
                  onClick={startInterview}
                  disabled={status === "connecting" || previewStatus !== "ready"}
                  title={
                    previewStatus !== "ready"
                      ? "Patientez pendant la préparation automatique des flux."
                      : undefined
                  }
                >
                  {status === "connecting" ? "Connexion..." : "Go !"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <TranscriptPanel transcript={transcript} />
        <ComposerPanel
          value={composer}
          disabled={status !== "running"}
          onChange={setComposer}
          onSend={sendUserMessage}
        />
        <NotesPanel />
        {feedback ? <FeedbackPanel feedback={feedback} /> : null}
      </div>
    </div>
  );
}

function TranscriptPanel({ transcript }: { transcript: TranscriptEntry[] }) {
  return (
    <div className="bento-card p-4">
      <h3 className="text-sm font-semibold text-slate-100">Transcript live</h3>
      <div className="mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto text-sm text-slate-200">
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

function ComposerPanel({
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
        className="h-28 rounded-[var(--radius)] border border-white/10 bg-white/5 p-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        placeholder={
          disabled
            ? "Démarrez une session pour envoyer des messages."
            : "Saisissez une question ou une précision à envoyer au coach."
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

function NotesPanel() {
  return (
    <div className="bento-card p-4">
      <h3 className="text-sm font-semibold text-slate-100">Notes personnelles</h3>
      <textarea
        className="h-40 rounded-[var(--radius)] border border-white/10 bg-white/5 p-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
        placeholder="Prenez vos notes, timestamp automatique."
      />
    </div>
  );
}

function FeedbackPanel({ feedback }: { feedback: CoachFeedback }) {
  if (!feedback) return null;

  let hydrated = feedback;
  if (!feedback.summary && feedback.raw) {
    try {
      hydrated = { ...feedback, ...JSON.parse(feedback.raw) };
    } catch {
      // ignore parse error
    }
  }

  const score = hydrated?.score_overall;
  const criteriaEntries = Object.entries(hydrated?.criteria ?? {});
  const perQuestion = hydrated?.per_question ?? [];

  return (
    <div className="bento-card space-y-5 p-5">
      <div className="rounded-3xl border border-[#E3E6EC] bg-white/70 p-4 text-[#1F2432]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">Overall score</p>
            {typeof score === "number" ? (
              <p className="text-3xl font-semibold">{Math.round(score)} / 100</p>
            ) : (
              <p className="text-sm text-[#6B7280]">En attente</p>
            )}
          </div>
        </div>
        {hydrated?.summary ? (
          <p className="mt-3 text-sm text-[#4A4E5E]">{hydrated.summary}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {hydrated?.strengths?.length ? (
          <div className="rounded-2xl border border-[#DCE0ED] bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-[#4F46E5]">Strengths</p>
            <ul className="mt-3 space-y-2 text-sm text-[#1F2432]">
              {hydrated.strengths.map((item, index) => (
                <li key={`strength-${index}`} className="flex gap-2">
                  <span className="text-[#4F46E5]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {hydrated?.improvements?.length ? (
          <div className="rounded-2xl border border-[#FFE4E6] bg-[#FFF7F8] p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-[#DB2777]">To improve</p>
            <ul className="mt-3 space-y-2 text-sm text-[#1F2432]">
              {hydrated.improvements.map((item, index) => (
                <li key={`improvement-${index}`} className="flex gap-2">
                  <span className="text-[#DB2777]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {criteriaEntries.length ? (
        <div className="rounded-2xl border border-[#E3E6EC] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">Criteria</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {criteriaEntries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-4 py-3">
                <span className="text-sm font-medium text-[#4A4E5E]">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-base font-semibold text-[#1F2432]">
                  {Math.round(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {perQuestion.length ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">Question drill-down</p>
          <div className="grid gap-3 md:grid-cols-2">
            {perQuestion.map((item, index) => (
              <div key={`${item.question ?? "q"}-${index}`} className="rounded-2xl border border-[#E3E6EC] bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#1F2432]">
                    {item.question ?? `Question ${index + 1}`}
                  </p>
                  {typeof item.score === "number" ? (
                    <span className="text-xs font-semibold text-[#4F46E5]">
                      {Math.round(item.score)} / 100
                    </span>
                  ) : null}
                </div>
                {item.summary || item.insight ? (
                  <p className="mt-2 text-sm text-[#4A4E5E]">{item.summary ?? item.insight}</p>
                ) : null}
                {item.tips?.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#4A4E5E]">
                    {item.tips.map((tip, tipIdx) => (
                      <li key={`tip-${index}-${tipIdx}`}>{tip}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hydrated?.recommendations?.length ? (
        <div className="rounded-2xl border border-[#E3E6EC] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-[#4F46E5]">Next steps</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#1F2432]">
            {hydrated.recommendations.map((item, index) => (
              <li key={`recommendation-${index}`}>{item}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

function shouldShowAvatarOverlay(params: {
  session: BeyondPresenceSessionResponse | null;
  status: "idle" | "connecting" | "connected" | "stub" | "error";
  error: string | null;
}): boolean {
  const { session, status, error } = params;
  if (!session) return true;
  if (session.stub) return true;
  if (session.agentDispatched === false) return true;
  if (status === "idle" || status === "connecting") return true;
  if (status === "error" && error) return true;
  return false;
}

function AvatarOverlay({
  session,
  status,
  error
}: {
  session: BeyondPresenceSessionResponse | null;
  status: "idle" | "connecting" | "connected" | "stub" | "error";
  error: string | null;
}) {
  if (!session) {
    return <p>Prêt à démarrer ? Cliquez sur « Démarrer » pour lancer la prévisualisation caméra/avatar.</p>;
  }

  if (session.stub) {
    return (
      <p>
        Configuration Beyond Presence/LiveKit absente. Ajoutez la variable <code>BEY_API_KEY</code>{" "}
        (ou <code>BEYOND_PRESENCE_API_KEY</code>) ainsi que <code>BEY_AVATAR_ID</code>, puis relancez le
        worker LiveKit pour activer l&apos;avatar.
      </p>
    );
  }

  if (session.agentDispatched === false) {
    return (
      <p>
        Agent Beyond Presence non démarré. Vérifiez que le worker est en ligne et que l&apos;agent
        « {session.agentName ?? "finance-coach-avatar"} » est dispatché sur la room.
      </p>
    );
  }

  if (status === "connecting") {
    return <p>Connexion de l&apos;avatar Beyond Presence...</p>;
  }

  if (status === "error") {
    return (
      <p>
        Erreur avatar : <span className="text-rose-200">{error ?? "inconnue"}</span>
      </p>
    );
  }

  return null;
}
