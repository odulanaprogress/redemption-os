import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft, Radio, Bookmark, BookOpen, Volume2, Languages,
  Wifi, WifiOff, FileText, Save, Trash2, Plus, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface FeedEntry {
  id: string;
  type: "verse" | "live" | "note";
  content: string;
  reference?: string;
  timestamp: string;
  isBookmarked?: boolean;
}

interface Bookmark {
  id: string;
  content: string;
  reference?: string;
  timestamp: string;
  note?: string;
}

const MOCK_FEED_ENTRIES: FeedEntry[] = [
  { id: "f1", type: "verse", content: '"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."', reference: "John 3:16", timestamp: "08:42" },
  { id: "f2", type: "live", content: "Today, we explore the depth of God's love and how it transforms our lives. This love is not just an emotion, but an active force that changes everything it touches.", timestamp: "12:15" },
  { id: "f3", type: "verse", content: '"Love is patient, love is kind. It does not envy, it does not boast, it is not proud."', reference: "1 Corinthians 13:4", timestamp: "22:15" },
  { id: "f4", type: "live", content: "The foundation of our faith is built on understanding that we are loved unconditionally. This transforms how we see ourselves and how we interact with others around us.", timestamp: "28:30" },
  { id: "f5", type: "verse", content: '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."', reference: "Proverbs 3:5-6", timestamp: "35:10" },
  { id: "f6", type: "live", content: "When we fully surrender to God's guidance, we discover that His plans are far greater than our own. The path of faith is not always the easiest, but it is always the most rewarding.", timestamp: "38:45" },
];

const TIMELINE = [
  { time: "00:00", label: "Opening Prayer", done: true },
  { time: "05:30", label: "Worship & Praise", done: true },
  { time: "12:15", label: "Scripture Reading", done: true },
  { time: "22:00", label: "Main Message", current: true },
  { time: "50:00", label: "Altar Call", done: false },
  { time: "58:00", label: "Closing Prayer", done: false },
];

const NOTE_KEY = "redemption_gospel_notes";
const BOOKMARK_KEY = "redemption_gospel_bookmarks";

export function LiveGospelFeed() {
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ id: string; text: string; time: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(NOTE_KEY) ?? "[]"); } catch { return []; }
  });
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY) ?? "[]"); } catch { return []; }
  });
  const [feed, setFeed] = useState<FeedEntry[]>(MOCK_FEED_ENTRIES.slice(0, 3));
  const [tab, setTab] = useState<"feed" | "notes" | "bookmarks">("feed");
  const [elapsed, setElapsed] = useState(42 * 60 + 18);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Simulate live feed updates
  useEffect(() => {
    let feedIdx = 3;
    const feedTimer = setInterval(() => {
      const next = MOCK_FEED_ENTRIES[feedIdx];
      if (feedIdx < MOCK_FEED_ENTRIES.length && next) {
        setFeed((prev) => [...prev, next]);
        feedIdx++;
        setTimeout(() => feedEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }, 15000);

    const clockTimer = setInterval(() => setElapsed((e) => e + 1), 1000);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(feedTimer);
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
    toast.success("Note saved");
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(NOTE_KEY, JSON.stringify(updated));
  };

  const toggleBookmark = (entry: FeedEntry) => {
    const exists = bookmarks.find((b) => b.id === entry.id);
    let updated: Bookmark[];
    if (exists) {
      updated = bookmarks.filter((b) => b.id !== entry.id);
      toast("Bookmark removed");
    } else {
      updated = [{ id: entry.id, content: entry.content, reference: entry.reference, timestamp: entry.timestamp }, ...bookmarks];
      toast.success("Bookmarked!");
    }
    setBookmarks(updated);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(updated));
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col">
      {/* Header */}
      <div className="bg-white backdrop-blur-lg border-b border-[#E5E7EB] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-[#6B7280] hover:text-[#0D0D0D]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg text-[#0D0D0D]">Live Gospel Feed</h1>
                {isOffline ? (
                  <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/30">
                    <WifiOff className="h-3 w-3 mr-1" /> Offline
                  </Badge>
                ) : (
                  <Badge className="bg-[#10b981]/20 text-[#059669] border-[#10b981]/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse mr-1.5" />
                    Live
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[#6B7280]">Sunday Service — {formatTime(elapsed)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOffline && <Wifi className="h-4 w-4 text-amber-400" />}
          </div>
        </div>
      </div>

      {/* Audio visualizer */}
      <div className="bg-gradient-to-r from-[#10b981]/10 to-transparent border-b border-[#10b981]/20 px-4 py-2 flex items-center gap-4">
        <Volume2 className="h-4 w-4 text-[#059669]" />
        <div className="flex gap-0.5 items-end h-5">
          {[6, 10, 16, 12, 8, 14, 10, 16, 6, 12, 14, 8].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-[#10b981] rounded-full origin-bottom"
              style={{
                height: `${h}px`,
                animation: `bar-bounce ${0.6 + (i % 4) * 0.15}s ease-in-out infinite`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
        <span className="text-sm text-[#059669] ml-auto">{isOffline ? "Cached content" : "Streaming Live"}</span>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-[#E5E7EB] bg-white">
        {[
          { key: "feed", label: "Live Feed", icon: Radio },
          { key: "notes", label: `Notes (${notes.length})`, icon: FileText },
          { key: "bookmarks", label: `Saved (${bookmarks.length})`, icon: Bookmark },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm transition-colors ${
              tab === key ? "text-[#5B4FE8] border-b-2 border-[#0ea5e9]" : "text-[#6B7280] hover:text-[#4B5563]"
            }`}>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* FEED TAB */}
          {tab === "feed" && (
            <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
              {/* Timeline */}
              <Card className="bg-white border-[#E5E7EB] p-4">
                <h3 className="text-[#0D0D0D] text-sm mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#5B4FE8]" /> Sermon Timeline
                </h3>
                <div className="space-y-2">
                  {TIMELINE.map((item) => (
                    <div key={item.time} className="flex items-center gap-3">
                      <span className={`text-xs w-12 shrink-0 ${item.current ? "text-[#059669]" : item.done ? "text-[#6B7280]" : "text-white/30"}`}>{item.time}</span>
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.current ? "bg-[#10b981] animate-pulse" : item.done ? "bg-white/40" : "bg-white/15"}`} />
                      <span className={`text-sm ${item.current ? "text-[#059669]" : item.done ? "text-[#4B5563]" : "text-white/30"}`}>{item.label}</span>
                      {item.current && <Badge className="ml-auto bg-emerald-50 text-[#059669] border-[#10b981]/30 text-xs">Now</Badge>}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Feed entries */}
              {feed.filter((e): e is FeedEntry => !!e).map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  {entry.type === "verse" ? (
                    <Card className="bg-white border-[#10b981]/20 p-5 relative">
                      <p className="text-white/85 leading-relaxed text-sm italic">{entry.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-[#059669]" />
                          <span className="text-sm text-[#059669]">{entry.reference}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/30">{entry.timestamp}</span>
                          <button onClick={() => toggleBookmark(entry)} className="p-1 hover:text-amber-400 transition-colors">
                            <Bookmark className={`h-4 w-4 ${isBookmarked(entry.id) ? "fill-amber-400 text-amber-400" : "text-white/30"}`} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="bg-gradient-to-br from-[#0ea5e9]/5 to-[#1a1f2e] border-[#0ea5e9]/20 p-5 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <Radio className="h-3 w-3 text-[#5B4FE8]" />
                        <span className="text-xs text-[#5B4FE8]">Live — {entry.timestamp}</span>
                      </div>
                      <p className="text-[#4B5563] leading-relaxed text-sm">{entry.content}</p>
                      <button onClick={() => toggleBookmark(entry)} className="absolute top-3 right-3 p-1 hover:text-amber-400 transition-colors">
                        <Bookmark className={`h-4 w-4 ${isBookmarked(entry.id) ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
                      </button>
                    </Card>
                  )}
                </motion.div>
              ))}

              <div ref={feedEndRef} />

              {feed.length < MOCK_FEED_ENTRIES.length && (
                <div className="flex items-center justify-center gap-2 py-4 text-[#9CA3AF]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9] animate-bounce" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9] animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9] animate-bounce" style={{ animationDelay: "0.4s" }} />
                  <span className="text-xs">More content incoming...</span>
                </div>
              )}
            </motion.div>
          )}

          {/* NOTES TAB */}
          {tab === "notes" && (
            <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
              <Card className="bg-white border-[#E5E7EB] p-4">
                <p className="text-xs text-[#6B7280] mb-2">Add a note — {formatTime(elapsed)}</p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write your notes here..."
                  className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-white/30 min-h-[100px] text-sm"
                />
                <Button onClick={saveNote} disabled={!note.trim()}
                  className="mt-3 w-full bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] text-[#0D0D0D] disabled:opacity-50">
                  <Save className="h-4 w-4 mr-2" /> Save Note
                </Button>
              </Card>

              {notes.length === 0 ? (
                <div className="text-center py-12 text-[#9CA3AF]">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notes yet — start writing!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => (
                    <Card key={n.id} className="bg-white border-[#E5E7EB] p-4 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#5B4FE8] mb-1">@ {n.time}</p>
                        <p className="text-[#4B5563] text-sm whitespace-pre-wrap">{n.text}</p>
                      </div>
                      <button onClick={() => deleteNote(n.id)} className="shrink-0 text-white/30 hover:text-red-400 transition-colors p-1">
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
            <motion.div key="bookmarks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-3">
              {bookmarks.length === 0 ? (
                <div className="text-center py-12 text-[#9CA3AF]">
                  <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No bookmarks yet</p>
                  <p className="text-xs mt-1">Tap the bookmark icon on any feed entry</p>
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <Card key={bm.id} className="bg-white border-amber-400/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#4B5563] text-sm italic leading-relaxed">{bm.content}</p>
                        {bm.reference && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <BookOpen className="h-3.5 w-3.5 text-[#059669]" />
                            <span className="text-sm text-[#059669]">{bm.reference}</span>
                          </div>
                        )}
                        <p className="text-xs text-white/30 mt-1">@ {bm.timestamp}</p>
                      </div>
                      <button onClick={() => {
                        const updated = bookmarks.filter((b) => b.id !== bm.id);
                        setBookmarks(updated);
                        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(updated));
                      }} className="shrink-0 text-white/30 hover:text-red-400 transition-colors p-1">
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
