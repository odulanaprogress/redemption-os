import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2, Wifi, WifiOff, AlertTriangle, RefreshCw, Radio } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { useBitChatStore } from "../../../services/bitchat/bitchat.store";
import { BitChatMessage } from "../../../services/bitchat/nostr.service";
import { formatDistanceToNow } from "date-fns";

// ── RCCG Zones ────────────────────────────────────────────────────────────────
const ZONES = [
  "All Zones",
  "Main Sanctuary",
  "Hall B",
  "Overflow Arena",
  "Prayer Garden",
];

// ── Relay status pill ─────────────────────────────────────────────────────────
function RelayStatusPill({ status }: { status: string }) {
  const config = {
    idle:       { icon: WifiOff,    color: "text-[#9CA3AF]",  bg: "bg-[#F3F4F6]",       label: "Not connected" },
    connecting: { icon: Loader2,    color: "text-amber-400",  bg: "bg-amber-400/10",     label: "Connecting to relays…" },
    connected:  { icon: Wifi,       color: "text-[#059669]",  bg: "bg-[#10b981]/10",     label: "Relay connected" },
    error:      { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10",       label: "Relay unreachable" },
  }[status] ?? { icon: WifiOff, color: "text-[#9CA3AF]", bg: "bg-[#F3F4F6]", label: "Unknown" };

  const Icon = config.icon;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
      <Icon className={`h-3 w-3 ${config.color} ${status === "connecting" ? "animate-spin" : ""}`} />
      <span className={`text-[10px] font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}

// ── Single message bubble ─────────────────────────────────────────────────────
function MeshBubble({ msg, isOwn }: { msg: BitChatMessage; isOwn: boolean }) {
  const initial = msg.senderName.slice(0, 1).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#a78bfa] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1">
        {initial}
      </div>

      {/* Bubble */}
      <div className={`max-w-[72%] flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] text-[#9CA3AF]">{isOwn ? "You" : msg.senderName}</span>
          {msg.zone && msg.zone !== "All Zones" && (
            <Badge className="bg-[#5B4FE8]/10 text-[#5B4FE8] border-[#5B4FE8]/20 text-[9px] px-1.5 py-0">
              {msg.zone}
            </Badge>
          )}
          {/* Nostr indicator */}
          <span title="Sent via Nostr relay (BitChat)" className="text-[#a78bfa] text-[8px] font-bold">⚡</span>
        </div>
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
            isOwn
              ? "bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] text-white rounded-tr-sm"
              : "bg-white border border-[#f0edff] text-[#111827] rounded-tl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[9px] text-[#9CA3AF] px-1">
          {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main MeshChatPanel ────────────────────────────────────────────────────────
interface MeshChatPanelProps {
  displayName: string;
  userId: string;
  userPubkey?: string; // optional — used to detect own messages if pk passed down
}

export function MeshChatPanel({ displayName }: MeshChatPanelProps) {
  const { messages, status, error, service, init, send, destroy, clearError } =
    useBitChatStore();

  const [text, setText] = useState("");
  const [zone, setZone] = useState("All Zones");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Init on mount, destroy on unmount
  useEffect(() => {
    init(displayName);
    return () => destroy();
  }, [displayName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to latest
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await send(trimmed, zone);
      setText("");
    } catch {
      // Error is surfaced via store
    } finally {
      setSending(false);
    }
  }, [text, zone, sending, send]);

  const ownPk = service?.pk;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Info banner ── */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-[#5B4FE8]/5 to-[#a78bfa]/5 border-b border-[#f0edff] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-[#5B4FE8]" />
          <span className="text-xs text-[#4B5563] font-medium">Decentralized Mesh — HGC 2024</span>
          <Badge className="bg-[#5B4FE8]/10 text-[#5B4FE8] border-[#5B4FE8]/20 text-[9px] px-1.5">Nostr</Badge>
        </div>
        <div className="flex items-center gap-2">
          <RelayStatusPill status={status} />
          {status === "error" && (
            <button
              onClick={() => { clearError(); destroy(); init(displayName); }}
              className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#5B4FE8] transition-colors"
              title="Retry connection"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Error notice ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <p className="text-xs text-red-600 flex-1">{error}</p>
              <button onClick={clearError} className="text-red-300 hover:text-red-500 text-xs">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {status === "connecting" && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#9CA3AF]">
            <Loader2 className="h-8 w-8 animate-spin text-[#5B4FE8]" />
            <p className="text-sm">Connecting to Nostr relays…</p>
            <p className="text-xs text-center max-w-[200px]">
              Fetching messages from the decentralized mesh network
            </p>
          </div>
        )}

        {status !== "connecting" && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#9CA3AF]">
            <Radio className="h-10 w-10 opacity-20" />
            <p className="text-sm">No messages yet on the mesh</p>
            <p className="text-xs text-center max-w-[220px]">
              Be the first to send a message! It will reach all attendees connected to the Nostr relay.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MeshBubble key={msg.id} msg={msg} isOwn={msg.pubkey === ownPk} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Composer ── */}
      <div className="p-3 bg-white border-t border-[#f0edff]">
        {/* Zone selector */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
          {ZONES.map((z) => (
            <button
              key={z}
              onClick={() => setZone(z)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                zone === z
                  ? "bg-[#5B4FE8] text-white"
                  : "bg-[#f0edff] text-[#5B4FE8] hover:bg-[#5B4FE8]/20"
              }`}
            >
              {z}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex items-end gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={status === "connected" ? "Send to mesh network…" : "Waiting for relay connection…"}
            disabled={status !== "connected"}
            className="flex-1 bg-[#F8F9FF] border-[#f0edff] text-[#0D0D0D] placeholder:text-[#9CA3AF] text-sm min-h-[40px] max-h-[100px] resize-none disabled:opacity-50"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending || status !== "connected"}
            className="p-2.5 bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] rounded-xl text-white disabled:opacity-40 transition-opacity hover:opacity-90 shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[9px] text-[#9CA3AF] mt-1.5 text-center">
          Messages are published to the Nostr public relay network · End-to-end encrypted DMs coming soon
        </p>
      </div>
    </div>
  );
}
