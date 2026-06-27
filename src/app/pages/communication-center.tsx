import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft, MessageSquare, Bell, Radio, AlertTriangle, Users, MapPin,
  Clock, Send, Image, Video, X, Loader2, CheckCheck, Trash2, Hash,
  Upload, Play,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { messageService, Broadcast, Message } from "../../services/message.service";
import { cloudinaryService } from "../../services/cloudinary.service";
import { useAuthStore } from "../../store/auth.store";
import { formatDistanceToNow } from "date-fns";

const BROADCAST_TYPE_CONFIG = {
  operational: { label: "Operational", color: "text-[#5B4FE8]", bg: "bg-[#EDE9FE]", border: "border-[#5B4FE8]/30" },
  alert: { label: "Alert", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/30" },
  emergency: { label: "Emergency", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
  info: { label: "Info", color: "text-[#059669]", bg: "bg-emerald-50", border: "border-[#10b981]/30" },
};

// ─── Media Preview Helper ─────────────────────────────────────────────────────

function MediaPreview({ url, type }: { url: string; type?: string }) {
  if (!url) return null;
  const isVideo = type?.startsWith("video") || url.includes("/video/");
  if (isVideo) {
    return (
      <video
        src={url}
        controls
        className="rounded-lg max-h-48 w-full object-cover mt-2 border border-[#E5E7EB]"
      />
    );
  }
  return (
    <img
      src={url}
      alt="media"
      className="rounded-lg max-h-48 w-full object-cover mt-2 border border-[#E5E7EB]"
    />
  );
}

// ─── Broadcast Card ───────────────────────────────────────────────────────────

function BroadcastCard({
  broadcast,
  canDelete,
  onDelete,
}: {
  broadcast: Broadcast;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) {
  const cfg = BROADCAST_TYPE_CONFIG[broadcast.type] ?? BROADCAST_TYPE_CONFIG.info;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Radio className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-[#0D0D0D] text-sm font-semibold">{broadcast.title}</h3>
              <Badge className={`${cfg.bg} ${cfg.color} border ${cfg.border} text-xs`}>
                {broadcast.zone}
              </Badge>
              {broadcast.pinned && (
                <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-xs">
                  📌 Pinned
                </Badge>
              )}
            </div>
            <p className="text-sm text-[#4B5563] leading-relaxed">{broadcast.message}</p>
            {broadcast.mediaUrl && (
              <MediaPreview url={broadcast.mediaUrl} />
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-[#9CA3AF]">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(broadcast.createdAt, { addSuffix: true })}</span>
              <span>•</span>
              <span>{broadcast.createdByName}</span>
            </div>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(broadcast.id)}
            className="shrink-0 p-1.5 hover:bg-red-500/20 rounded-lg text-white/30 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isOwn,
  onDelete,
}: {
  msg: Message;
  isOwn: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#8B82F0] flex items-center justify-center text-[#0D0D0D] text-xs font-bold shrink-0 mt-1">
        {msg.senderName.slice(0, 1).toUpperCase()}
      </div>
      <div className={`max-w-[72%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        <span className="text-xs text-[#9CA3AF] px-1">
          {isOwn ? "You" : msg.senderName}
        </span>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isOwn
              ? "bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] text-[#0D0D0D] rounded-tr-sm"
              : "bg-white border border-[#E5E7EB] text-[#111827] rounded-tl-sm"
          }`}
        >
          {msg.text && <p className="leading-relaxed">{msg.text}</p>}
          {msg.mediaUrl && <MediaPreview url={msg.mediaUrl} type={msg.mediaType} />}
        </div>
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-white/30">
            {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
          </span>
          {isOwn && (
            <button
              onClick={() => onDelete(msg.id)}
              className="text-white/20 hover:text-red-400 transition-colors ml-1"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CommunicationCenter() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();
  const isAdmin = userProfile?.role === "admin" || userProfile?.role === "security";

  const [tab, setTab] = useState<"broadcasts" | "messages" | "emergency">("broadcasts");
  const [activeChannel, setActiveChannel] = useState("general");
  const channels = messageService.getChannels();

  // Broadcasts state
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(true);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [bForm, setBForm] = useState({ type: "operational" as Broadcast["type"], title: "", message: "", zone: "All Zones" });
  const [bUploading, setBUploading] = useState(false);
  const [bMediaUrl, setBMediaUrl] = useState<string | null>(null);
  const [bSubmitting, setBSubmitting] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgText, setMsgText] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [msgUploading, setMsgUploading] = useState(false);
  const [msgMediaUrl, setMsgMediaUrl] = useState<string | null>(null);
  const [msgMediaType, setMsgMediaType] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgFileRef = useRef<HTMLInputElement>(null);
  const bcFileRef = useRef<HTMLInputElement>(null);

  // Subscribe to broadcasts
  useEffect(() => {
    setBroadcastsLoading(true);
    const unsub = messageService.subscribeToBroadcasts(
      (data) => { setBroadcasts(data); setBroadcastsLoading(false); },
      (err) => { console.error(err); setBroadcastsLoading(false); }
    );
    return unsub;
  }, []);

  // Subscribe to channel messages
  useEffect(() => {
    const unsub = messageService.subscribeToChannel(
      activeChannel,
      (data) => { setMessages(data); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100); },
      (err) => console.error(err)
    );
    return unsub;
  }, [activeChannel]);

  // ── Broadcast handlers ──────────────────────────────────────────────────────

  const handleBroadcastMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBUploading(true);
    const result = await cloudinaryService.uploadFile(file, "redemption-os/broadcasts", { tags: ["broadcast"] });
    setBUploading(false);
    if (result.success && result.data) {
      setBMediaUrl(result.data.secureUrl);
      toast.success("Media uploaded");
    } else {
      toast.error(result.error ?? "Upload failed");
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bForm.title.trim() || !bForm.message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (!user?.uid) { toast.error("Please log in"); return; }
    setBSubmitting(true);
    const result = await messageService.createBroadcast({
      ...bForm,
      createdBy: user.uid,
      createdByName: userProfile?.displayName ?? "Admin",
      ...(bMediaUrl ? { mediaUrl: bMediaUrl } : {}),
    });
    setBSubmitting(false);
    if (result.success) {
      toast.success("Broadcast sent!");
      setBForm({ type: "operational", title: "", message: "", zone: "All Zones" });
      setBMediaUrl(null);
      setShowBroadcastForm(false);
    } else {
      toast.error("Failed to send broadcast");
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    await messageService.deleteBroadcast(id);
    toast.success("Broadcast removed");
  };

  // ── Message handlers ────────────────────────────────────────────────────────

  const handleMsgMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsgUploading(true);
    const isVideo = file.type.startsWith("video");
    const result = isVideo
      ? await cloudinaryService.uploadVideo(file, "redemption-os/messages")
      : await cloudinaryService.uploadImage(file, "redemption-os/messages");
    setMsgUploading(false);
    if (result.success && result.data) {
      setMsgMediaUrl(result.data.secureUrl);
      setMsgMediaType(file.type);
      toast.success("Media ready to send");
    } else {
      toast.error(result.error ?? "Upload failed");
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!msgText.trim() && !msgMediaUrl) return;
    if (!user?.uid) { toast.error("Please log in"); return; }
    setMsgSending(true);
    const result = await messageService.sendMessage({
      channelId: activeChannel,
      senderId: user.uid,
      senderName: userProfile?.displayName ?? "User",
      type: msgMediaUrl ? (msgMediaType?.startsWith("video") ? "video" : "image") : "text",
      text: msgText.trim(),
      ...(msgMediaUrl ? { mediaUrl: msgMediaUrl, mediaType: msgMediaType ?? undefined } : {}),
    });
    setMsgSending(false);
    if (result.success) {
      setMsgText("");
      setMsgMediaUrl(null);
      setMsgMediaType(null);
    } else {
      toast.error("Failed to send message");
    }
  }, [msgText, msgMediaUrl, msgMediaType, user, userProfile, activeChannel]);

  const handleDeleteMessage = async (id: string) => {
    await messageService.deleteMessage(id);
  };

  const emergencyBroadcasts = broadcasts.filter((b) => b.type === "emergency");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col">
      {/* Header */}
      <div className="bg-white backdrop-blur-lg border-b border-[#E5E7EB] p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-[#6B7280] hover:text-[#0D0D0D]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg text-[#0D0D0D]">Communication Center</h1>
            <p className="text-sm text-[#6B7280]">Real-time updates &amp; messaging</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs text-[#059669]">Live</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-3">
          {(["broadcasts", "messages", "emergency"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                tab === t
                  ? "bg-[#0ea5e9]/20 text-[#5B4FE8] border border-[#5B4FE8]/30"
                  : "text-[#6B7280] hover:text-[#4B5563]"
              }`}
            >
              {t === "emergency" ? `🚨 Emergency${emergencyBroadcasts.length > 0 ? ` (${emergencyBroadcasts.length})` : ""}` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── BROADCASTS TAB ─────────────────────────────────────────────────────── */}
      {tab === "broadcasts" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isAdmin && (
            <div>
              {!showBroadcastForm ? (
                <button
                  onClick={() => setShowBroadcastForm(true)}
                  className="w-full bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] text-[#0D0D0D] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Radio className="h-4 w-4" />
                  Create Broadcast
                </button>
              ) : (
                <Card className="bg-white border-[#E5E7EB] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#0D0D0D] font-semibold">New Broadcast</h3>
                    <button onClick={() => { setShowBroadcastForm(false); setBMediaUrl(null); }} className="text-[#9CA3AF] hover:text-[#0D0D0D]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateBroadcast} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={bForm.type}
                        onChange={(e) => setBForm({ ...bForm, type: e.target.value as any })}
                        className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#0D0D0D] text-sm focus:outline-none focus:border-[#0ea5e9]/50"
                      >
                        {(["operational", "alert", "emergency", "info"] as const).map((t) => (
                          <option key={t} value={t} className="bg-white">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                      <input
                        value={bForm.zone}
                        onChange={(e) => setBForm({ ...bForm, zone: e.target.value })}
                        placeholder="Zone (e.g. All Zones)"
                        className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#0D0D0D] text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                      />
                    </div>
                    <input
                      required
                      value={bForm.title}
                      onChange={(e) => setBForm({ ...bForm, title: e.target.value })}
                      placeholder="Broadcast title *"
                      className="w-full bg-[#F8F9FF] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#0D0D0D] text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                    />
                    <Textarea
                      required
                      value={bForm.message}
                      onChange={(e) => setBForm({ ...bForm, message: e.target.value })}
                      placeholder="Broadcast message *"
                      className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-white/30 text-sm min-h-[80px]"
                    />

                    {/* Media upload */}
                    <div className="flex items-center gap-2">
                      <input ref={bcFileRef} type="file" accept="image/*,video/*" onChange={handleBroadcastMedia} className="hidden" />
                      <button
                        type="button"
                        onClick={() => bcFileRef.current?.click()}
                        disabled={bUploading}
                        className="flex items-center gap-2 px-3 py-2 bg-[#F8F9FF] border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
                      >
                        {bUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {bUploading ? "Uploading..." : "Attach Media"}
                      </button>
                      {bMediaUrl && (
                        <div className="flex items-center gap-2 text-xs text-[#059669]">
                          <CheckCheck className="h-3.5 w-3.5" />
                          Media attached
                          <button type="button" onClick={() => setBMediaUrl(null)} className="text-white/30 hover:text-red-400">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    {bMediaUrl && <MediaPreview url={bMediaUrl} />}

                    <button
                      type="submit"
                      disabled={bSubmitting}
                      className="w-full bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] text-[#0D0D0D] py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {bSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {bSubmitting ? "Sending..." : "Send Broadcast"}
                    </button>
                  </form>
                </Card>
              )}
            </div>
          )}

          {broadcastsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-[#5B4FE8]" />
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-16 text-[#9CA3AF]">
              <Radio className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No broadcasts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <BroadcastCard key={b.id} broadcast={b} canDelete={isAdmin} onDelete={handleDeleteBroadcast} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MESSAGES TAB ───────────────────────────────────────────────────────── */}
      {tab === "messages" && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Channel selector */}
          <div className="flex gap-2 px-4 py-2 overflow-x-auto bg-white border-b border-[#E5E7EB] scrollbar-none">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeChannel === ch.id
                    ? "bg-[#0ea5e9]/20 text-[#5B4FE8] border border-[#5B4FE8]/30"
                    : "text-[#6B7280] hover:text-[#4B5563] bg-[#F8F9FF]"
                }`}
              >
                <span>{ch.icon}</span>
                <Hash className="h-2.5 w-2.5" />
                {ch.label}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-white/30">
                <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">No messages yet. Say something!</p>
              </div>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  isOwn={m.senderId === user?.uid}
                  onDelete={handleDeleteMessage}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="p-3 bg-white backdrop-blur-lg border-t border-[#E5E7EB]">
            {msgMediaUrl && (
              <div className="mb-2 relative">
                <MediaPreview url={msgMediaUrl} type={msgMediaType ?? undefined} />
                <button
                  onClick={() => { setMsgMediaUrl(null); setMsgMediaType(null); }}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-[#4B5563] hover:text-[#0D0D0D]"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input ref={msgFileRef} type="file" accept="image/*,video/*" onChange={handleMsgMedia} className="hidden" />
              <button
                onClick={() => msgFileRef.current?.click()}
                disabled={msgUploading}
                className="p-2.5 bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
                title="Attach photo or video"
              >
                {msgUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
              </button>
              <Textarea
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={`Message #${activeChannel}...`}
                className="flex-1 bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-white/30 text-sm min-h-[40px] max-h-[120px] resize-none"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={msgSending || (!msgText.trim() && !msgMediaUrl)}
                className="p-2.5 bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] rounded-xl text-[#0D0D0D] disabled:opacity-40 transition-opacity"
              >
                {msgSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EMERGENCY TAB ──────────────────────────────────────────────────────── */}
      {tab === "emergency" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-[#1a1f2e] border-red-500/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-[#0D0D0D] font-semibold">Active Emergency Alerts</h2>
            </div>
            {emergencyBroadcasts.length === 0 ? (
              <p className="text-[#6B7280] text-sm">No active emergency alerts — all clear ✅</p>
            ) : (
              <div className="space-y-3">
                {emergencyBroadcasts.map((b) => (
                  <BroadcastCard key={b.id} broadcast={b} canDelete={isAdmin} onDelete={handleDeleteBroadcast} />
                ))}
              </div>
            )}
          </Card>

          {isAdmin && (
            <Card className="bg-white border-[#E5E7EB] p-5">
              <h3 className="text-[#0D0D0D] font-semibold mb-3">Send Emergency Alert</h3>
              <button
                onClick={() => { setBForm({ type: "emergency", title: "", message: "", zone: "All Zones" }); setTab("broadcasts"); setShowBroadcastForm(true); }}
                className="w-full bg-red-500 hover:bg-red-600 text-[#0D0D0D] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Create Emergency Broadcast
              </button>
            </Card>
          )}

          <Card className="bg-white border-[#E5E7EB] p-5">
            <h3 className="text-[#0D0D0D] font-semibold mb-3">Zone Status</h3>
            <div className="space-y-2">
              {["Main Sanctuary", "North Wing", "Parking Area", "Children Zone A", "Children Zone B"].map((zone) => (
                <div key={zone} className="flex items-center justify-between p-2 bg-[#F8F9FF] rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#5B4FE8]" />
                    <span className="text-[#4B5563] text-sm">{zone}</span>
                  </div>
                  <Badge className="bg-emerald-50 text-[#059669] border-[#10b981]/30 text-xs">
                    Clear
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
