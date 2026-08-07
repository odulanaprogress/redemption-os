import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  Mic, MicOff, Play, Pause, Square, Tv, ArrowLeft, Radio,
  Languages, BookOpen, Clock, Activity, Signal, CheckCircle2,
  Edit2, Send, Save, RefreshCw, Layers, ShieldCheck, Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { liveSermonService, SermonSession, TranscriptChunk, SUPPORTED_LANGUAGES } from "../../services/live-sermon.service";
import { StageProjectorView } from "../components/stage-projector-view";

export function MediaSermonConsole() {
  const navigate = useNavigate();
  const [session, setSession] = useState<SermonSession | null>(liveSermonService.getActiveSession());
  const [showStageView, setShowStageView] = useState(false);
  const [title, setTitle] = useState("Sunday Service - Divine Grace & Power");
  const [preacher, setPreacher] = useState("Pastor Elijah");
  const [topic, setTopic] = useState("Unlocking Supernatural Favor");
  
  // Custom manual injection input
  const [manualText, setManualText] = useState("");
  const [manualVerse, setManualVerse] = useState("");

"  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [editText, setEditText] = useState(\"\");
  const [isMicActive, setIsMicActive] = useState(liveSermonService.isSpeechRecognitionActive());

  useEffect(() => {
    const unsubscribe = liveSermonService.subscribeToSession((s) => setSession(s));
    return () => unsubscribe();
  }, []);

  const handleToggleMic = async () => {
    if (isMicActive) {
      liveSermonService.stopListening();
      setIsMicActive(false);
      toast.info(\"Microphone Speech-to-Text Paused\");
    } else {
      toast.info(\"Starting Microphone Live Speech-to-Text...\");
      await liveSermonService.startListening((text) => {
        toast.success(`Speech Transcribed: \"${text.substring(0, 25)}...\"`);
      });
      setIsMicActive(true);
      toast.success(\"Microphone Active — Transcribing Live Sermon!\");
    }
  };

  const handleStartSession = async () => {
    if (!title.trim()) {
      toast.error(\"Please enter a sermon title\");
      return;
    }
    const newSession = liveSermonService.startSession(title, preacher, topic);
    await liveSermonService.startListening();
    setIsMicActive(true);
    toast.success(\"Live Sermon Session Started!\", {
      description: \"Speech recognition is active & broadcasting live mic feed.\",
    });
  };

  const handlePauseSession = () => {
    liveSermonService.pauseSession();
    setIsMicActive(false);
    toast.info(\"Session Paused\");
  };

  const handleResumeSession = async () => {
    liveSermonService.resumeSession();
    await liveSermonService.startListening();
    setIsMicActive(true);
    toast.success(\"Session Resumed\");
  };

  const handleEndSession = () => {
    const ended = liveSermonService.endSession();
    setIsMicActive(false);
    if (ended) {
      toast.success(\"Sermon Session Ended & Archived!\", {
        description: `Total chunks broadcast: ${ended.chunks.length}`,
      });
    }
  };

  const handleSendManualText = () => {
    if (!manualText.trim()) return;
    liveSermonService.addChunk(manualText.trim(), preacher, manualVerse.trim() || undefined, !!manualVerse.trim());
    setManualText(\"\");
    setManualVerse(\"\");
    toast.success(\"Broadcasted custom text line!\");
  };

  const handleSaveEdit = (chunkId: string) => {
    if (!session || !editText.trim()) return;
    const chunk = session.chunks.find((c) => c.id === chunkId);
    if (chunk) {
      chunk.originalText = editText.trim();
      chunk.translations = liveSermonService.translateText(editText.trim());
      toast.success(\"Updated transcript chunk\");
    }
    setEditingChunkId(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className=\"min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 font-sans\">
      {showStageView && <StageProjectorView onClose={() => setShowStageView(false)} />}

      {/* Top Bar Navigation */}
      <div className=\"max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800\">
        <div className=\"flex items-center gap-3\">
          <Button
            variant=\"outline\"
            size=\"icon\"
            onClick={() => navigate(\"/dashboard\")}
            className=\"border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800\"
            title=\"Return to Attendee Portal\"
          >
            <ArrowLeft className=\"w-5 h-5\" />
          </Button>
          <div>
            <div className=\"flex items-center gap-2\">
              <h1 className=\"text-2xl font-bold text-white tracking-tight\">Media Operation Console</h1>
              <Badge className=\"bg-purple-500/20 text-purple-300 border-purple-500/30\">
                Live STT & Translation
              </Badge>
            </div>
            <p className=\"text-slate-400 text-sm\">
              Capturing clean audio from sound mixer • Real-time broadcasting to attendees & stage screens
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className=\"flex items-center gap-3 w-full sm:w-auto\">
          <Button
            onClick={handleToggleMic}
            className={`font-semibold flex items-center gap-2 border ${
              isMicActive
                ? \"bg-red-600 hover:bg-red-500 text-white border-red-500 animate-pulse\"
                : \"bg-slate-900 border-slate-700 text-purple-400 hover:bg-slate-800\"
            }`}
          >
            {isMicActive ? <Mic className=\"w-4 h-4 animate-bounce\" /> : <MicOff className=\"w-4 h-4\" />}
            {isMicActive ? \"Mic STT Active\" : \"Enable Mic STT\"}
          </Button>

          <Button
            onClick={() => setShowStageView(true)}
            className=\"bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/50\"
          >
            <Tv className=\"w-5 h-5\" />
            Stage Projector Display
          </Button>

          <Button
            onClick={() => navigate(\"/dashboard\")}
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>Attendee View</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Session Controls & Setup */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Session Status Card */}
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className={`w-5 h-5 ${session?.status === "active" ? "text-red-500 animate-pulse" : "text-slate-500"}`} />
                <h2 className="text-lg font-bold text-white">Session Status</h2>
              </div>
              <Badge
                variant="outline"
                className={`px-3 py-1 font-semibold uppercase text-xs ${
                  session?.status === "active"
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : session?.status === "paused"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {session?.status === "active" ? "● BROADCASTING LIVE" : session?.status === "paused" ? "PAUSED" : "INACTIVE"}
              </Badge>
            </div>

            {session ? (
              <div className="space-y-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Title</div>
                  <div className="text-xl font-bold text-amber-400">{session.title}</div>
                  <div className="flex items-center justify-between text-sm text-slate-300 pt-2 border-t border-slate-800">
                    <span>Preacher: <strong className="text-white">{session.preacher}</strong></span>
                    <span>Topic: <strong className="text-white">{session.topic}</strong></span>
                  </div>
                </div>

                {/* Session Telemetry Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">Total Lines</div>
                    <div className="text-xl font-bold text-white mt-1">{session.chunks.length}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">Word Count</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{session.totalWords}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">2G Data Used</div>
                    <div className="text-xl font-bold text-cyan-400 mt-1">{formatBytes(session.dataTransferredBytes)}</div>
                  </div>
                </div>

                {/* Session Controls */}
                <div className="flex gap-3 pt-2">
                  {session.status === "active" ? (
                    <Button
                      onClick={handlePauseSession}
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <Pause className="w-5 h-5" /> Pause
                    </Button>
                  ) : (
                    <Button
                      onClick={handleResumeSession}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" /> Resume Live
                    </Button>
                  )}

                  <Button
                    onClick={handleEndSession}
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Square className="w-5 h-5" /> End Session
                  </Button>
                </div>
              </div>
            ) : (
              /* Setup New Session */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Sermon Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sunday Service - Power of Faith"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Main Speaker</label>
                    <input
                      type="text"
                      value={preacher}
                      onChange={(e) => setPreacher(e.target.value)}
                      placeholder="e.g. Pastor John"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Topic</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Grace"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleStartSession}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 text-base shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-3"
                >
                  <Mic className="w-6 h-6 animate-pulse" />
                  Start Live Sermon Session
                </Button>
              </div>
            )}
          </Card>

          {/* Clean Audio Stream Feed Status */}
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Sound Mixer Audio Feed Input
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Audio Output (Sound Desk Feed)</div>
                  <div className="text-xs text-slate-400">Microphone / Sound Desk Connected</div>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                ACTIVE • 48 kHz
              </Badge>
            </div>

            {/* Target Languages Indicator */}
            <div className="pt-2">
              <div className="text-xs text-slate-400 mb-2">Simultaneous Real-time Target Languages:</div>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <span key={l.code} className="bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Manual Text / Bible Verse Injector */}
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              Manual Sentence / Verse Broadcast
            </h3>
            <p className="text-xs text-slate-400">
              Type custom announcements or Bible scriptures to inject directly into the live broadcast stream.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={manualVerse}
                onChange={(e) => setManualVerse(e.target.value)}
                placeholder="Scripture reference (e.g. John 3:16) [Optional]"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-300 text-sm focus:outline-none focus:border-amber-500"
              />
              <Textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Type text line to broadcast to attendees..."
                className="bg-slate-950 border-slate-800 text-slate-100 text-sm focus:border-amber-500 min-h-[70px]"
              />
              <Button
                onClick={handleSendManualText}
                disabled={!session || session.status !== "active" || !manualText.trim()}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Broadcast Line
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Real-time Live Transcript Stream & Inline Editor */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col h-[680px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                  Live Transcript Stream (Media Admin View)
                </h2>
                <p className="text-xs text-slate-400">
                  Review and edit transcribed lines in real time before attendees view them.
                </p>
              </div>
              <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
                {session?.chunks.length || 0} Chunks
              </Badge>
            </div>

            {/* Transcript Chunk Stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {session && session.chunks.length > 0 ? (
                session.chunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-mono text-slate-300">{chunk.timestamp}</span>
                        <span>•</span>
                        <span className="font-semibold text-white">{chunk.speaker}</span>
                      </div>
                      {chunk.reference && (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                          {chunk.reference}
                        </Badge>
                      )}
                    </div>

                    {editingChunkId === chunk.id ? (
                      <div className="space-y-2 pt-1">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="bg-slate-900 border-amber-500 text-white text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingChunkId(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => handleSaveEdit(chunk.id)}>
                            <Save className="w-3.5 h-3.5 mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-white text-base leading-relaxed font-medium">
                          {chunk.originalText}
                        </div>

                        {/* Multi-language previews */}
                        <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-900">
                          <div className="text-amber-300/80">
                            <strong>Yo:</strong> {chunk.translations.yo}
                          </div>
                          <div className="text-cyan-300/80">
                            <strong>Fr:</strong> {chunk.translations.fr}
                          </div>
                        </div>

                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingChunkId(chunk.id);
                              setEditText(chunk.originalText);
                            }}
                            className="h-7 text-xs text-slate-400 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Line
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                  <Mic className="w-12 h-12 text-slate-700 animate-pulse" />
                  <p className="text-sm">No live transcript chunks generated yet.</p>
                  <p className="text-xs text-slate-600 max-w-sm">
                    Click "Start Live Sermon Session" on the left to begin listening to audio feed.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
