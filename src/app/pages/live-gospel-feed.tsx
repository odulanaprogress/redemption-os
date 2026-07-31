import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft, Radio, Bookmark, BookOpen, Volume2, Languages,
  Wifi, WifiOff, FileText, Save, Trash2, Clock, Signal, Layers,
  Tv, Download, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { liveSermonService, SermonSession, TranscriptChunk, LanguageCode, SUPPORTED_LANGUAGES } from "../../services/live-sermon.service";

interface BookmarkItem {
  id: string;
  content: string;
  reference?: string;
  timestamp: string;
}

const NOTE_KEY = "redemption_gospel_notes";
const BOOKMARK_KEY = "redemption_gospel_bookmarks";

export function LiveGospelFeed() {
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>("en");
  const [session, setSession] = useState<SermonSession | null>(liveSermonService.getActiveSession());
  const [pastSessions, setPastSessions] = useState<SermonSession[]>([]);
  const [viewingPastSession, setViewingPastSession] = useState<SermonSession | null>(null);

  const [tab, setTab] = useState<"feed" | "notes" | "bookmarks" | "archive">("feed");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ id: string; text: string; time: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(NOTE_KEY) ?? "[]"); } catch { return []; }
  });
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY) ?? "[]"); } catch { return []; }
  });

  const [elapsed, setElapsed] = useState(42 * 60 + 18);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to live sermon service updates
  useEffect(() => {
    const unsubSession = liveSermonService.subscribeToSession((s) => {
      setSession(s);
    });

    const unsubChunks = liveSermonService.subscribeToChunks(() => {
      setTimeout(() => feedEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    setPastSessions(liveSermonService.getPastSessions());

    const clockTimer = setInterval(() => setElapsed((e) => e + 1), 1000);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      unsubSession();
      unsubChunks();
      clearInterval(clockTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const saveNote = () => {
    if (!note.trim()) return;
    const newNotes = [{ id: Date.now().toString(), text: note.trim(), time: formatTime(elapsed) }, ...notes];
    setNotes(newNotes);
    localStorage.setItem(NOTE_KEY, JSON.stringify(newNotes));
    setNote("");
    toast.success("Personal note saved");
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(NOTE_KEY, JSON.stringify(updated));
  };

  const toggleBookmark = (chunk: TranscriptChunk) => {
    const text = chunk.translations[selectedLang] || chunk.originalText;
    const exists = bookmarks.some((b) => b.id === chunk.id);
    let updated: BookmarkItem[];
    if (exists) {
      updated = bookmarks.filter((b) => b.id !== chunk.id);
      toast("Bookmark removed");
    } else {
      updated = [{ id: chunk.id, content: text, reference: chunk.reference, timestamp: chunk.timestamp }, ...bookmarks];
      toast.success("Quote bookmarked!");
    }
    setBookmarks(updated);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(updated));
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  const activeChunks = (viewingPastSession || session)?.chunks || [];
  const currentTitle = viewingPastSession ? viewingPastSession.title : (session?.title || "Live Sermon Ministration");
  const currentPreacher = viewingPastSession ? viewingPastSession.preacher : (session?.preacher || "Main Speaker");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white backdrop-blur-lg border-b border-[#E5E7EB] p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-[#6B7280] hover:text-[#0D0D0D]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#0D0D0D]">{currentTitle}</h1>
                {isOffline ? (
                  <Badge className="bg-amber-400/10 text-amber-500 border-amber-400/30">
                    <WifiOff className="h-3 w-3 mr-1" /> Offline Mode
                  </Badge>
                ) : session?.status === "active" ? (
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/30">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1.5" />
                    Live Ministration
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Ready
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Preacher: <strong className="text-[#0D0D0D]">{currentPreacher}</strong> • {formatTime(elapsed)}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector & Media Console Link */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#F3F4F6] px-2.5 py-1.5 rounded-lg border border-[#E5E7EB]">
              <Languages className="h-4 w-4 text-[#5B4FE8]" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-semibold text-[#0D0D0D] focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/media-sermon-console")}
              className="hidden sm:flex border-[#5B4FE8]/30 text-[#5B4FE8] hover:bg-[#5B4FE8]/10 text-xs font-semibold"
            >
              <Tv className="h-3.5 w-3.5 mr-1" /> Media Console
            </Button>
          </div>
        </div>
      </div>

      {/* 2G/3G Low Bandwidth Telemetry Banner */}
      <div className="bg-emerald-900/10 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <Signal className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>
            <strong>Ultra-Low Bandwidth Mode:</strong> Active (~0.02 KB/s data consumption over 2G/3G networks)
          </span>
        </div>
        <span className="hidden sm:inline text-emerald-600 font-mono">
          On-Device STT + Real-Time Subtitles
        </span>
      </div>

      {/* Audio Visualizer Bar */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-emerald-500/20 px-4 py-2 flex items-center gap-4">
        <Volume2 className="h-4 w-4 text-emerald-600" />
        <div className="flex gap-0.5 items-end h-4">
          {[6, 10, 16, 12, 8, 14, 10, 16, 6, 12, 14, 8].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-emerald-500 rounded-full origin-bottom"
              style={{
                height: `${h}px`,
                animation: session?.status === "active" ? `bar-bounce ${0.6 + (i % 4) * 0.15}s ease-in-out infinite` : "none",
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-emerald-600 ml-auto">
          {session?.status === "active" ? "Broadcasting Live Audio Feed" : "Session Saved Offline"}
        </span>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-[#E5E7EB] bg-white">
        {[
          { key: "feed", label: `Live Feed (${activeChunks.length})`, icon: Radio },
          { key: "archive", label: `Sermon Archive (${pastSessions.length})`, icon: Layers },
          { key: "notes", label: `Notes (${notes.length})`, icon: FileText },
          { key: "bookmarks", label: `Saved (${bookmarks.length})`, icon: Bookmark },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setTab(key as typeof tab);
              if (key !== "archive") setViewingPastSession(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs sm:text-sm font-medium transition-colors ${
              tab === key ? "text-[#5B4FE8] border-b-2 border-[#5B4FE8]" : "text-[#6B7280] hover:text-[#4B5563]"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* FEED TAB */}
          {tab === "feed" && (
            <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {viewingPastSession && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between text-xs text-amber-800">
                  <span>Viewing Archived Sermon: <strong>{viewingPastSession.title}</strong></span>
                  <Button size="sm" variant="ghost" onClick={() => setViewingPastSession(null)} className="h-7 text-xs text-amber-900 font-bold">
                    Back to Live
                  </Button>
                </div>
              )}

              {activeChunks.length > 0 ? (
                activeChunks.map((chunk, i) => {
                  const translatedText = chunk.translations[selectedLang] || chunk.originalText;

                  return (
                    <motion.div
                      key={chunk.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {chunk.isVerse ? (
                        <Card className="bg-white border-emerald-500/30 p-5 relative shadow-sm hover:border-emerald-500/60 transition-colors">
                          <p className="text-[#0D0D0D] leading-relaxed text-sm font-serif italic">"{translatedText}"</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-emerald-600" />
                              <span className="text-xs font-bold text-emerald-600">{chunk.reference || "Scripture Verse"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#9CA3AF] font-mono">{chunk.timestamp}</span>
                              <button onClick={() => toggleBookmark(chunk)} className="p-1 hover:text-amber-400 transition-colors">
                                <Bookmark className={`h-4 w-4 ${isBookmarked(chunk.id) ? "fill-amber-400 text-amber-400" : "text-[#9CA3AF]"}`} />
                              </button>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <Card className="bg-white border-[#E5E7EB] p-5 relative shadow-sm hover:border-[#5B4FE8]/40 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#5B4FE8]">
                              <Radio className="h-3 w-3 text-red-500" />
                              <span>{chunk.speaker || "Minister"}</span>
                            </div>
                            <span className="text-xs text-[#9CA3AF] font-mono">{chunk.timestamp}</span>
                          </div>
                          <p className="text-[#374151] leading-relaxed text-sm font-medium">{translatedText}</p>
                          {selectedLang !== "en" && (
                            <p className="text-xs text-[#9CA3AF] mt-2 pt-2 border-t border-[#F3F4F6]">
                              Original: "{chunk.originalText}"
                            </p>
                          )}
                          <button onClick={() => toggleBookmark(chunk)} className="absolute top-3 right-3 p-1 hover:text-amber-400 transition-colors">
                            <Bookmark className={`h-4 w-4 ${isBookmarked(chunk.id) ? "fill-amber-400 text-amber-400" : "text-[#D1D5DB]"}`} />
                          </button>
                        </Card>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-16 space-y-3 text-[#9CA3AF]">
                  <Radio className="h-10 w-10 mx-auto text-[#5B4FE8]/40 animate-pulse" />
                  <p className="text-sm font-semibold text-[#374151]">Waiting for Live Sermon Broadcast...</p>
                  <p className="text-xs max-w-sm mx-auto text-[#6B7280]">
                    The Media Operations Team will broadcast clean speech-to-text here during the ministration.
                  </p>
                </div>
              )}

              <div ref={feedEndRef} />
            </motion.div>
          )}

          {/* SERMON ARCHIVE TAB */}
          {tab === "archive" && (
            <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="text-sm font-bold text-[#0D0D0D] flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#5B4FE8]" /> Archived Offline Sermons
              </h3>

              {pastSessions.length === 0 ? (
                <div className="text-center py-12 text-[#9CA3AF]">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No archived sermon sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastSessions.map((s) => (
                    <Card key={s.id} className="bg-white border-[#E5E7EB] p-4 space-y-3 shadow-sm hover:border-[#5B4FE8]/40 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-[#0D0D0D] text-base">{s.title}</h4>
                          <p className="text-xs text-[#6B7280]">Speaker: <strong>{s.preacher}</strong> • Topic: {s.topic}</p>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">
                          {s.chunks.length} Lines
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#9CA3AF] pt-2 border-t border-[#F3F4F6]">
                        <span>Date: {new Date(s.startTime).toLocaleDateString()}</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setViewingPastSession(s);
                            setTab("feed");
                          }}
                          className="h-8 text-xs bg-[#5B4FE8] hover:bg-[#4B3FE8] text-white"
                        >
                          Read Transcript
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* NOTES TAB */}
          {tab === "notes" && (
            <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card className="bg-white border-[#E5E7EB] p-4 shadow-sm">
                <p className="text-xs text-[#6B7280] mb-2 font-medium">Add sermon note — {formatTime(elapsed)}</p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Type your personal insights, quotes, or thoughts..."
                  className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF] min-h-[100px] text-sm"
                />
                <Button onClick={saveNote} disabled={!note.trim()} className="mt-3 w-full bg-[#5B4FE8] hover:bg-[#4B3FE8] text-white font-semibold">
                  <Save className="h-4 w-4 mr-2" /> Save Note
                </Button>
              </Card>

              {notes.length === 0 ? (
                <div className="text-center py-12 text-[#9CA3AF]">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notes written yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => (
                    <Card key={n.id} className="bg-white border-[#E5E7EB] p-4 flex items-start justify-between gap-3 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#5B4FE8] font-bold mb-1">@ {n.time}</p>
                        <p className="text-[#374151] text-sm whitespace-pre-wrap">{n.text}</p>
                      </div>
                      <button onClick={() => deleteNote(n.id)} className="shrink-0 text-[#9CA3AF] hover:text-red-500 transition-colors p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* BOOKMARKS TAB */}
          {tab === "bookmarks" && (
            <motion.div key="bookmarks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {bookmarks.length === 0 ? (
                <div className="text-center py-12 text-[#9CA3AF]">
                  <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No bookmarked quotes yet</p>
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <Card key={bm.id} className="bg-white border-amber-400/30 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#374151] text-sm italic font-serif leading-relaxed">"{bm.content}"</p>
                        {bm.reference && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-600">{bm.reference}</span>
                          </div>
                        )}
                        <p className="text-xs text-[#9CA3AF] mt-1 font-mono">@ {bm.timestamp}</p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = bookmarks.filter((b) => b.id !== bm.id);
                          setBookmarks(updated);
                          localStorage.setItem(BOOKMARK_KEY, JSON.stringify(updated));
                        }}
                        className="shrink-0 text-[#9CA3AF] hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
