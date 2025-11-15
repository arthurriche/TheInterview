"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import { User, Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { cn } from "@/lib/cn";
import type { BeyondPresenceSessionResponse } from "@/lib/bey/types";

interface InterviewPlayerProps {
  userName: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  avatarVideoRef?: RefObject<HTMLVideoElement>;
  avatarStatus?: "idle" | "connecting" | "connected" | "stub" | "error";
  avatarError?: string | null;
  beyondPresenceSession?: BeyondPresenceSessionResponse | null;
}

export function InterviewPlayer({
  userName,
  isMuted = false,
  isVideoOff = false,
  avatarVideoRef,
  avatarStatus = "idle",
  avatarError = null,
  beyondPresenceSession = null
}: InterviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackAvatarVideoRef = useRef<HTMLVideoElement>(null);
  const resolvedAvatarVideoRef = avatarVideoRef ?? fallbackAvatarVideoRef;
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    // Demander les permissions
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermissions(true);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setHasPermissions(false);
      }
    };

    requestPermissions();

    return () => {
      // Cleanup: arrêter le stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Vignette interviewer (IA) */}
      <BentoCard padding="none" className="relative aspect-video lg:aspect-auto overflow-hidden">
        <video
          ref={resolvedAvatarVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover bg-slate-900"
        />
        {shouldShowAvatarOverlay({
          session: beyondPresenceSession ?? null,
          status: avatarStatus,
          error: avatarError
        }) ? (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-900/40 to-slate-900/80 p-4 text-center text-sm text-emerald-50">
            <AvatarOverlay
              session={beyondPresenceSession ?? null}
              status={avatarStatus}
              error={avatarError}
            />
          </div>
        ) : null}

        {/* Indicateur statut */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              avatarStatus === "connected"
                ? "bg-emerald-400 animate-pulse"
                : avatarStatus === "error"
                  ? "bg-rose-400"
                  : "bg-amber-300"
            )}
          />
          <span className="text-xs text-white font-medium capitalize">
            {avatarStatus === "stub" ? "stub" : avatarStatus}
          </span>
        </div>
      </BentoCard>

      {/* Vignette utilisateur */}
      <BentoCard padding="none" className="relative aspect-video lg:aspect-auto overflow-hidden">
        {isVideoOff ? (
          <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-100">{userName}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-slate-400">
                <VideoOff className="h-4 w-4" />
                <span className="text-xs">Caméra désactivée</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Version fake: placeholder vidéo */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover bg-slate-900"
            />
            
            {/* Placeholder si pas de stream */}
            {!hasPermissions && (
              <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    <VideoIcon className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400">En attente de la caméra...</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Badge nom */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
          <span className="text-xs text-white font-medium">{userName}</span>
        </div>

        {/* Indicateurs */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center",
            isMuted ? "bg-rose-500/80" : "bg-emerald-500/80"
          )}>
            {isMuted ? (
              <MicOff className="h-4 w-4 text-white" />
            ) : (
              <Mic className="h-4 w-4 text-white" />
            )}
          </div>
          
          {isVideoOff && (
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-rose-500/80">
              <VideoOff className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </BentoCard>
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
    return <p>Connexion à l&apos;avatar Beyond Presence en cours...</p>;
  }

  if (session.stub) {
    return (
      <p>
        Configuration Beyond Presence/LiveKit absente. Ajoutez vos clés API pour activer
        l&apos;avatar.
      </p>
    );
  }

  if (session.agentDispatched === false) {
    return (
      <p>
        Agent Beyond Presence non démarré. Vérifiez le worker « {session.agentName ?? "finance-coach-avatar"} ».
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
