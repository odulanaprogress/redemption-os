import React, { useState, useEffect, useRef } from "react";
import { X, Maximize2, Minimize2, Languages, Volume2, Sparkles, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { liveSermonService, SermonSession, TranscriptChunk, LanguageCode, SUPPORTED_LANGUAGES } from "../../services/live-sermon.service";

interface StageProjectorViewProps {
  onClose: () => void;
}

export function StageProjectorView({ onClose }: StageProjectorViewProps) {
  const [session, setSession] = useState<SermonSession | null>(liveSermonService.getActiveSession());
  const [primaryLang, setPrimaryLang] = useState<LanguageCode>("en");
  const [secondaryLang, setSecondaryLang] = useState<LanguageCode>("yo");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = liveSermonService.subscribeToSession((s) => setSession(s));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.chunks.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeChunks = session?.chunks || [];
  const latestChunk = activeChunks[activeChunks.length - 1];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none font-sans"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/20 pb-4 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 text-sm px-3 py-1 uppercase tracking-wider font-semibold">
            LIVE STAGE DISPLAY
          </Badge>
          <span className="text-xl sm:text-2xl font-bold text-amber-400">
            {session?.title || "Live Sermon Ministration"}
          </span>
          <span className="hidden md:inline text-gray-400 text-lg">
            — {session?.preacher || "Main Speaker"}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
            <Languages className="w-4 h-4 text-amber-400" />
            <select
              value={primaryLang}
              onChange={(e) => setPrimaryLang(e.target.value as LanguageCode)}
              className="bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-gray-900 text-white">
                  Main: {l.flag} {l.name}
                </option>
              ))}
            </select>
            <span className="text-gray-500">|</span>
            <select
              value={secondaryLang}
              onChange={(e) => setSecondaryLang(e.target.value as LanguageCode)}
              className="bg-transparent text-amber-300 font-medium text-sm focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-gray-900 text-white">
                  Sub: {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-gray-300 hover:text-white hover:bg-white/10"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
            title="Close Stage Display"
          >
            <X className="w-7 h-7" />
          </Button>
        </div>
      </div>

      {/* Main Subtitle Display Area */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-4 py-8 overflow-y-auto max-h-[calc(100vh-160px)]">
        {latestChunk ? (
          <div className="max-w-5xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {latestChunk.isVerse && latestChunk.reference && (
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-5 py-2 rounded-full text-xl sm:text-2xl font-bold tracking-wide">
                <BookOpen className="w-6 h-6" />
                {latestChunk.reference}
              </div>
            )}

            {/* Primary Language Subtitle */}
            <div className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
              "{latestChunk.translations[primaryLang] || latestChunk.originalText}"
            </div>

            {/* Secondary Language Subtitle */}
            {secondaryLang !== primaryLang && (
              <div className="text-2xl sm:text-4xl md:text-5xl font-semibold leading-relaxed text-amber-300 drop-shadow">
                "{latestChunk.translations[secondaryLang]}"
              </div>
            )}

            <div className="text-gray-400 text-lg sm:text-xl font-mono pt-4">
              [{latestChunk.timestamp}] — {latestChunk.speaker}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Sparkles className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-300">
              Stage Subtitle View Ready
            </h2>
            <p className="text-xl text-gray-500 max-w-lg">
              Waiting for live ministration speech. Speak into the sound feed to display captions here.
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="flex items-center justify-between border-t border-white/20 pt-4 text-gray-400 text-sm sm:text-base">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Audio Feed Connected
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Total Chunks: {activeChunks.length}
          </span>
        </div>
        <div className="font-mono text-amber-400">
          Redemption OS — Stage Subtitle Projection Engine
        </div>
      </div>
    </div>
  );
}
