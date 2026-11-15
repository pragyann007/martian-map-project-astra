"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);

  const enableAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.35;
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setNeedsPermission(false);
      })
      .catch((err) => {
        console.warn("Audio playback failed on gesture:", err);
      });
  }, []);

  useEffect(() => {
    // Initialize audio instance client-side to prevent SSR issues
    if (!audioRef.current) {
      const audio = new Audio("/music/music.mp3");
      audio.loop = true;
      audio.volume = 0.35;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    // 1. Attempt immediate autoplay
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setNeedsPermission(false);
        })
        .catch(() => {
          // Browser autoplay policy blocked unmuted sound; wait for first interaction
          setNeedsPermission(true);

          const handleFirstInteraction = () => {
            enableAudio();
            document.removeEventListener("click", handleFirstInteraction, { capture: true });
            document.removeEventListener("touchstart", handleFirstInteraction, { capture: true });
            document.removeEventListener("keydown", handleFirstInteraction, { capture: true });
          };

          document.addEventListener("click", handleFirstInteraction, { capture: true, once: true });
          document.addEventListener("touchstart", handleFirstInteraction, { capture: true, once: true });
          document.addEventListener("keydown", handleFirstInteraction, { capture: true, once: true });
        });
    }

    return () => {
      // Keep playing across client-side page transitions
    };
  }, [enableAudio]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      enableAudio();
    } else if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <>
      {/* Autoplay blocked prompt banner (disappears as soon as audio plays) */}
      {needsPermission && !isPlaying && (
        <div
          onClick={enableAudio}
          role="button"
          tabIndex={0}
          title="Click to enable Mars ambient background music"
          className="fixed top-4 left-50 -translate-x-1/2 z-[9999] cursor-pointer select-none transition-all hover:scale-105 active:scale-95"
        >
          <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#090A0C]/95 border border-[#C66B3D] text-[#E8E5DF] text-xs font-mono shadow-2xl backdrop-blur-md ring-2 ring-[#C66B3D]/30 animate-pulse">
            <Volume2 className="w-4 h-4 text-[#E9A16A]" />
            <span className="font-semibold tracking-wider text-[#E9A16A]">
              CLICK ANYWHERE TO ENABLE MARS AUDIO
            </span>
          </div>
        </div>
      )}

      {/* Floating Mute/Unmute Pill in Bottom Left */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted || !isPlaying ? "Unmute Mars Audio" : "Mute Mars Audio"}
          title={isMuted || !isPlaying ? "Unmute Mars Audio" : "Mute Mars Audio"}
          className="flex items-center space-x-2 py-1.5 px-3 rounded-full bg-[#090A0C]/90 backdrop-blur-md border border-[#292F32] hover:border-[#C66B3D] text-xs font-mono text-[#E8E5DF] shadow-xl transition-all cursor-pointer group"
        >
          <span className="w-5 h-5 rounded-full bg-[#17191D] flex items-center justify-center text-[#E9A16A] group-hover:bg-[#C66B3D] group-hover:text-white transition-colors">
            {isMuted || !isPlaying ? (
              <VolumeX className="w-3 h-3" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </span>
          <span className="text-[10px] text-[#A3A8B0] uppercase tracking-wider hidden sm:inline">
            {isPlaying && !isMuted ? "BGM ACTIVE" : "BGM MUTED"}
          </span>
        </button>
      </div>
    </>
  );
}
