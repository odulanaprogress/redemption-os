import { useNavigate, useSearchParams } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import {
  Users, Activity, AlertTriangle, Radio, Truck, MessageSquare,
  Shield, BarChart3, ShoppingBag, QrCode, TrendingUp, LogOut,
  Settings, Send, Download, Database, Search, RefreshCw, X,
  CheckCircle, Clock, MapPin, Bell, Eye, Zap, Loader2,
  FileSpreadsheet, Filter, ChevronDown, Megaphone, Globe,
  UserPlus, Link, Key
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { incidentService } from "../../services/incident.service";
import { notificationService } from "../../services/notification.service";
import { messageService, Broadcast } from "../../services/message.service";
import { userService } from "../../services/user.service";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";
import { useSessionStore } from "../../store/session.store";
import { NotificationBell } from "../components/NotificationBell";
import { Incident, UserProfile, FamilyMember } from "../../types";
import { familyService } from "../../services/family.service";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

// ─── Static chart data ────────────────────────────────────────────────────────

const crowdData = [
  { time: "6AM", count: 450 }, { time: "7AM", count: 1200 },
  { time: "8AM", count: 3500 }, { time: "9AM", count: 7200 },
  { time: "10AM", count: 9800 }, { time: "11AM", count: 11200 },
  { time: "12PM", count: 12847 }, { time: "1PM", count: 11500 },
  { time: "2PM", count: 10800 }, { time: "3PM", count: 9200 },
];

const zoneData = [
  { zone: "Main Hall", capacity: 85, attendees: 10850 },
  { zone: "North Wing", capacity: 62, attendees: 4960 },
  { zone: "South Wing", capacity: 48, attendees: 3840 },
  { zone: "Gate A", capacity: 78, attendees: 1560 },
  { zone: "Gate B", capacity: 45, attendees: 900 },
  { zone: "Parking", capacity: 92, attendees: 980 },
];

const incidentTrend = [
  { hour: "8AM", count: 1 }, { hour: "9AM", count: 3 }, { hour: "10AM", count: 2 },
  { hour: "11AM", count: 5 }, { hour: "12PM", count: 4 }, { hour: "1PM", count: 2 },
];

// ─── Color maps ───────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  critical: "bg-red-500 animate-pulse", high: "bg-orange-400",
  medium: "bg-amber-400", low: "bg-[#10b981]",
};
const STATUS_BADGE: Record<string, string> = {
  reported: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  acknowledged: "bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/30",
  in_progress: "bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/30",
  resolved: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30",
  closed: "bg-white/10 text-white/40 border-white/10",
};
const ZONE_BAR_COLOR = (cap: number) =>
  cap >= 90 ? "#ef4444" : cap >= 70 ? "#f59e0b" : "#10b981";

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone", icon: Globe, desc: "All registered users" },
  { value: "admin", label: "Admins", icon: Shield, desc: "Admin & security staff" },
  { value: "vendor", label: "Vendors", icon: ShoppingBag, desc: "All vendors" },
  { value: "parent", label: "Parents", icon: QrCode, desc: "Parents with children" },
  { value: "attendee", label: "Attendees", icon: Users, desc: "General attendees" },
  { value: "zone-main", label: "Zone: Main Hall", icon: MapPin, desc: "Main hall zone only" },
  { value: "zone-north", label: "Zone: North Wing", icon: MapPin, desc: "North wing zone" },
];

// ─── CSV Export helper ────────────────────────────────────────────────────────

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#10b981]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
      Live
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg, pulse }: {
  icon: any; label: string; value: string; sub: string;
  color: string; bg: string; pulse?: boolean;
}) {
  return (
    <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`rounded-xl ${bg} p-2.5`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <Badge className={`text-xs border ${pulse ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/5 text-white/50 border-white/10"}`}>
          {sub}
        </Badge>
      </div>
      <p className={`text-2xl font-bold ${pulse ? "text-red-400" : "text-white"}`}>{value}</p>
      <p className="text-xs text-white/50 mt-1">{label}</p>
    </Card>
  );
}

// ─── Tab: OVERVIEW ────────────────────────────────────────────────────────────

function OverviewTab({ incidents, loadingIncidents, onRefresh, navigate, broadcasts }: {
  incidents: Incident[];
  loadingIncidents: boolean;
  broadcasts: Broadcast[];
  onRefresh: () => void;
  navigate: (p: string) => void;
}) {
  const [liveCount, setLiveCount] = useState(12847);
  useEffect(() => {
    const t = setInterval(() => setLiveCount((c) => c + Math.floor(Math.random() * 5) - 2), 3000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { icon: Users, label: "Total Attendees", value: liveCount.toLocaleString(), sub: "+14.2%", color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/10" },
    { icon: AlertTriangle, label: "Active Incidents", value: String(incidents.length || "0"), sub: incidents.length > 0 ? "Needs Attention" : "All Clear", color: incidents.length > 0 ? "text-amber-400" : "text-[#10b981]", bg: incidents.length > 0 ? "bg-amber-400/10" : "bg-[#10b981]/10", pulse: incidents.length > 0 },
    { icon: Radio, label: "Broadcasts Sent", value: String(broadcasts.length), sub: "Today", color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
    { icon: TrendingUp, label: "Avg Response Time", value: "1.8 min", sub: "↓ 12%", color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Live Crowd Analytics</h3>
            <LiveBadge />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={crowdData}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fill="url(#cg)" name="Attendees" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Zone Capacity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={zoneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="zone" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 9 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                formatter={(v: any) => [`${v}%`, "Capacity"]} />
              <Bar dataKey="capacity" radius={[6, 6, 0, 0]} name="Capacity %">
                {zoneData.map((d, i) => <Cell key={i} fill={ZONE_BAR_COLOR(d.capacity)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Zone Board */}
      <Card className="bg-[#1a1f2e]/80 border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Zone Status Board</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {zoneData.map((z) => (
            <div key={z.zone} className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white">{z.zone}</span>
                <Badge className={`text-xs border ${z.capacity >= 90 ? "bg-red-500/20 text-red-400 border-red-500/30" : z.capacity >= 70 ? "bg-amber-400/20 text-amber-400 border-amber-400/30" : "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30"}`}>
                  {z.capacity}%
                </Badge>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${z.capacity}%`, background: ZONE_BAR_COLOR(z.capacity) }} />
              </div>
              <p className="text-xs text-white/40 mt-1.5">{z.attendees.toLocaleString()} attendees</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Active Incidents */}
      <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">Active Incidents</h3>
            {incidents.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{incidents.length}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <Button onClick={() => navigate("/community-signal")} variant="ghost" size="sm" className="text-[#0ea5e9]">View All</Button>
          </div>
        </div>
        {loadingIncidents ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#0ea5e9]" /></div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No active incidents — all clear ✅</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/8 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${PRIORITY_COLOR[inc.priority] ?? "bg-white/30"}`} />
                  <div>
                    <p className="text-sm text-white">{inc.title}</p>
                    <p className="text-xs text-white/50">{inc.location?.zone}{inc.location?.building ? ` — ${inc.location.building}` : ""}</p>
                    <p className="text-xs text-white/30 mt-0.5">{formatDistanceToNow(inc.createdAt, { addSuffix: true })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${STATUS_BADGE[inc.status] ?? STATUS_BADGE.reported} border text-xs`}>{inc.status.replace("_", " ")}</Badge>
                  <button
                    onClick={() => incidentService.updateIncident(inc.id, { status: "acknowledged" }).then(onRefresh)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-[#10b981] transition-colors text-xs"
                    title="Acknowledge"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Incident trend */}
      <Card className="bg-[#1a1f2e]/80 border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Incident Frequency Today</h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={incidentTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
            <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} name="Incidents" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: "Live Operations", sub: "Real-time center", color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/10", path: "/operations" },
          { icon: Shield, label: "Emergency", sub: "Coordination", color: "text-red-400", bg: "bg-red-400/10", path: "/emergency" },
          { icon: QrCode, label: "QR Identity", sub: "Child safety", color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10", path: "/qr-identity" },
          { icon: Truck, label: "Logistics", sub: "Deliveries", color: "text-[#10b981]", bg: "bg-[#10b981]/10", path: "/logistics" },
        ].map(({ icon: Icon, label, sub, color, bg, path }) => (
          <Card key={label} onClick={() => navigate(path)}
            className="cursor-pointer bg-[#1a1f2e]/80 border-white/10 p-5 hover:border-white/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div className={`rounded-lg ${bg} p-2.5 w-fit mb-3`}><Icon className={`h-5 w-5 ${color}`} /></div>
            <p className="text-sm text-white font-medium">{label}</p>
            <p className="text-xs text-white/50 mt-0.5">{sub}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: BROADCAST CENTER ────────────────────────────────────────────────────

function BroadcastTab({ currentUser, currentProfile }: { currentUser: any; currentProfile: any }) {
  const [audience, setAudience] = useState("all");
  const [bType, setBType] = useState<"operational" | "alert" | "emergency" | "info">("operational");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);

  useEffect(() => {
    const unsub = messageService.subscribeToBroadcasts((data) => setBroadcasts(data));
    return unsub;
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }
    if (!currentUser?.uid) { toast.error("Not authenticated"); return; }
    setSubmitting(true);
    const result = await messageService.createBroadcast({
      type: bType,
      title: title.trim(),
      message: message.trim(),
      zone: audience === "all" ? "All Zones" : AUDIENCE_OPTIONS.find(a => a.value === audience)?.label ?? audience,
      createdBy: currentUser.uid,
      createdByName: currentProfile?.displayName ?? "Admin",
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Broadcast sent to " + (AUDIENCE_OPTIONS.find(a => a.value === audience)?.label ?? "everyone") + "!");
      setTitle(""); setMessage("");
      // Also create a notification for all users
      await notificationService.createNotification(currentUser.uid, { type: bType === "emergency" ? "emergency" : "info", title, message });
    } else {
      toast.error("Failed to send broadcast");
    }
  };

  const typeCfg = {
    operational: "border-[#0ea5e9]/40 text-[#0ea5e9]",
    alert: "border-amber-400/40 text-amber-400",
    emergency: "border-red-500/40 text-red-400",
    info: "border-[#10b981]/40 text-[#10b981]",
  };

  return (
    <div className="space-y-6">
      {/* Composer */}
      <Card className="bg-[#1a1f2e]/80 border-white/10 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl bg-[#10b981]/10 p-2.5"><Megaphone className="h-5 w-5 text-[#10b981]" /></div>
          <div>
            <h3 className="text-white font-semibold">Broadcast Composer</h3>
            <p className="text-xs text-white/50">Send a message to any audience instantly</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          {/* Audience selector */}
          <div>
            <label className="text-xs text-white/60 block mb-2">Send To</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AUDIENCE_OPTIONS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAudience(a.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-sm ${
                    audience === a.value
                      ? "bg-[#0ea5e9]/20 border-[#0ea5e9]/50 text-[#0ea5e9]"
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <a.icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.label}</p>
                    <p className="text-[10px] text-white/40 truncate">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Type + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 block mb-2">Type</label>
              <select
                value={bType}
                onChange={(e) => setBType(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#0ea5e9]/50"
              >
                {(["operational", "info", "alert", "emergency"] as const).map((t) => (
                  <option key={t} value={t} className="bg-[#1a1f2e] capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-2">Title *</label>
              <Input
                required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Broadcast title..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 block mb-2">Message *</label>
            <Textarea
              required value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your broadcast message here..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]"
            />
          </div>

          {/* Preview */}
          {(title || message) && (
            <div className={`p-4 rounded-xl border ${typeCfg[bType]} bg-white/3`}>
              <p className="text-xs text-white/40 mb-1">Preview →</p>
              {title && <p className="text-white font-medium">{title}</p>}
              {message && <p className="text-white/70 text-sm mt-1">{message}</p>}
              <p className="text-[10px] text-white/30 mt-2">
                To: {AUDIENCE_OPTIONS.find((a) => a.value === audience)?.label ?? "Everyone"}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              bType === "emergency"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gradient-to-r from-[#0ea5e9] to-[#10b981] hover:opacity-90 text-white"
            } disabled:opacity-50`}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? "Sending..." : `Send Broadcast${bType === "emergency" ? " 🚨" : ""}`}
          </button>
        </form>
      </Card>

      {/* Broadcast History */}
      <Card className="bg-[#1a1f2e]/80 border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Broadcast History</h3>
          <Badge className="bg-white/5 text-white/50 border-white/10 text-xs">{broadcasts.length} sent</Badge>
        </div>
        {broadcasts.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-6">No broadcasts yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {broadcasts.map((b) => {
              const cfg = { operational: "text-[#0ea5e9] border-[#0ea5e9]/30", alert: "text-amber-400 border-amber-400/30", emergency: "text-red-400 border-red-500/30", info: "text-[#10b981] border-[#10b981]/30" }[b.type] ?? "text-white/50 border-white/10";
              return (
                <div key={b.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white text-sm font-medium">{b.title}</span>
                        <Badge className={`text-[10px] border ${cfg} bg-transparent capitalize`}>{b.type}</Badge>
                        <Badge className="text-[10px] bg-white/5 text-white/40 border-white/10">{b.zone}</Badge>
                      </div>
                      <p className="text-white/60 text-xs line-clamp-2">{b.message}</p>
                      <p className="text-white/30 text-[10px] mt-1.5">
                        {formatDistanceToNow(b.createdAt, { addSuffix: true })} by {b.createdByName}
                      </p>
                    </div>
                    <button
                      onClick={() => messageService.deleteBroadcast(b.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/20 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Tab: DATABASE MONITOR ────────────────────────────────────────────────────

function DatabaseTab({ incidents }: { incidents: Incident[] }) {
  const [activeTable, setActiveTable] = useState<"incidents" | "broadcasts" | "users" | "children">("incidents");
  const [search, setSearch] = useState("");
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const unsub = messageService.subscribeToBroadcasts((data) => setBroadcasts(data));
    return unsub;
  }, []);

  useEffect(() => {
    if (activeTable === "users" && users.length === 0) {
      setLoadingUsers(true);
      userService.getPaginatedUsers(50).then((r) => { setUsers(r.data); setLoadingUsers(false); });
    }
    if (activeTable === "children" && children.length === 0) {
      setChildren(familyService.getAllMockMembers());
    }
  }, [activeTable]);

  // ── Export handlers ─────────────────────────────────────────────────────────

  const exportIncidents = () => {
    const headers = ["ID", "Title", "Type", "Priority", "Status", "Zone", "Building", "Reported By", "Created At"];
    const rows = filteredIncidents.map((i) => [
      i.id, i.title, i.type, i.priority, i.status,
      i.location?.zone ?? "", i.location?.building ?? "",
      i.reportedBy, format(i.createdAt, "yyyy-MM-dd HH:mm"),
    ]);
    downloadCSV(`incidents_${format(new Date(), "yyyyMMdd_HHmm")}.csv`, headers, rows);
    toast.success("Incidents exported to CSV");
  };

  const exportBroadcasts = () => {
    const headers = ["ID", "Type", "Title", "Message", "Zone", "Sent By", "Created At"];
    const rows = filteredBroadcasts.map((b) => [
      b.id, b.type, b.title, b.message, b.zone, b.createdByName, format(b.createdAt, "yyyy-MM-dd HH:mm"),
    ]);
    downloadCSV(`broadcasts_${format(new Date(), "yyyyMMdd_HHmm")}.csv`, headers, rows);
    toast.success("Broadcasts exported to CSV");
  };

  const exportUsers = () => {
    const headers = ["UID", "Display Name", "Email", "Role", "Phone", "Active", "Created At"];
    const rows = filteredUsers.map((u) => [
      u.uid, u.displayName, u.email, u.role, u.phoneNumber ?? "", String(u.isActive),
      u.createdAt ? format(new Date(u.createdAt), "yyyy-MM-dd") : "",
    ]);
    downloadCSV(`users_${format(new Date(), "yyyyMMdd_HHmm")}.csv`, headers, rows);
    toast.success("Users exported to CSV (Excel-compatible)");
  };

  const exportChildren = () => {
    const headers = ["ID", "First Name", "Last Name", "Zone", "Parent/Guardian", "Phone", "Allergies", "Medical Notes"];
    const rows = filteredChildren.map((c) => [
      c.id, c.firstName, c.lastName, c.assignedZone ?? "",
      c.emergencyContact?.name ?? "", c.emergencyContact?.phoneNumber ?? "",
      c.allergies?.join(", ") ?? "", c.medicalNotes ?? ""
    ]);
    downloadCSV(`children_${format(new Date(), "yyyyMMdd_HHmm")}.csv`, headers, rows);
    toast.success("Children data exported to CSV (Excel-compatible)");
  };

  const filteredIncidents = incidents.filter((i) =>
    search ? i.title.toLowerCase().includes(search.toLowerCase()) || i.type.includes(search.toLowerCase()) : true
  );
  const filteredBroadcasts = broadcasts.filter((b) =>
    search ? b.title.toLowerCase().includes(search.toLowerCase()) || b.message.toLowerCase().includes(search.toLowerCase()) : true
  );
  const filteredUsers = users.filter((u) =>
    search ? (u.displayName + u.email + u.role).toLowerCase().includes(search.toLowerCase()) : true
  );
  const filteredChildren = children.filter((c) =>
    search ? (c.firstName + " " + c.lastName).toLowerCase().includes(search.toLowerCase()) : true
  );

  const tables = [
    { key: "incidents", label: "Incidents", count: incidents.length, icon: AlertTriangle },
    { key: "broadcasts", label: "Broadcasts", count: broadcasts.length, icon: Radio },
    { key: "users", label: "Users", count: users.length, icon: Users },
    { key: "children", label: "Children", count: children.length, icon: QrCode },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Table switcher + search + export */}
      <Card className="bg-[#1a1f2e]/80 border-white/10 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex gap-2">
            {tables.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTable(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTable === t.key
                    ? "bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30"
                    : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                <span className="bg-white/10 text-white/50 rounded-full px-1.5 py-0.5 text-[10px] ml-0.5">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/40"
            />
          </div>

          <button
            onClick={activeTable === "incidents" ? exportIncidents : activeTable === "broadcasts" ? exportBroadcasts : activeTable === "users" ? exportUsers : exportChildren}
            className="flex items-center gap-2 px-4 py-2 bg-[#10b981]/20 border border-[#10b981]/30 rounded-xl text-[#10b981] text-sm font-medium hover:bg-[#10b981]/30 transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV / Excel
          </button>
        </div>
      </Card>

      {/* Incidents Table */}
      {activeTable === "incidents" && (
        <Card className="bg-[#1a1f2e]/80 border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Priority</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Title</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Type</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Zone</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Status</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Reported</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-white/40 text-sm py-8">No incidents found</td></tr>
                ) : (
                  filteredIncidents.map((inc) => (
                    <tr key={inc.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${PRIORITY_COLOR[inc.priority] ?? "bg-white/30"}`} />
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{inc.title}</td>
                      <td className="px-4 py-3"><Badge className="bg-white/5 text-white/60 border-white/10 text-xs capitalize">{inc.type}</Badge></td>
                      <td className="px-4 py-3 text-xs text-white/60">{inc.location?.zone ?? "—"}</td>
                      <td className="px-4 py-3"><Badge className={`${STATUS_BADGE[inc.status] ?? STATUS_BADGE.reported} border text-xs`}>{inc.status.replace("_", " ")}</Badge></td>
                      <td className="px-4 py-3 text-xs text-white/40">{formatDistanceToNow(inc.createdAt, { addSuffix: true })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Broadcasts Table */}
      {activeTable === "broadcasts" && (
        <Card className="bg-[#1a1f2e]/80 border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Type</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Title</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Message</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Zone</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Sent By</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredBroadcasts.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-white/40 text-sm py-8">No broadcasts found</td></tr>
                ) : (
                  filteredBroadcasts.map((b) => (
                    <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3"><Badge className="text-xs capitalize bg-white/5 text-white/60 border-white/10">{b.type}</Badge></td>
                      <td className="px-4 py-3 text-sm text-white">{b.title}</td>
                      <td className="px-4 py-3 text-xs text-white/60 max-w-xs truncate">{b.message}</td>
                      <td className="px-4 py-3 text-xs text-white/60">{b.zone}</td>
                      <td className="px-4 py-3 text-xs text-white/60">{b.createdByName}</td>
                      <td className="px-4 py-3 text-xs text-white/40">{formatDistanceToNow(b.createdAt, { addSuffix: true })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Users Table */}
      {activeTable === "users" && (
        <Card className="bg-[#1a1f2e]/80 border-white/10 overflow-hidden">
          {loadingUsers ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#0ea5e9]" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/3">
                    <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Name</th>
                    <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Email</th>
                    <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Role</th>
                    <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Phone</th>
                    <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-white/40 text-sm py-8">
                      {users.length === 0 ? "No users in database (mock mode may be active)" : "No users match search"}
                    </td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {(u.displayName ?? "U").slice(0, 1)}
                            </div>
                            <span className="text-sm text-white">{u.displayName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/60">{u.email}</td>
                        <td className="px-4 py-3"><Badge className="text-xs bg-white/5 text-white/60 border-white/10 capitalize">{u.role}</Badge></td>
                        <td className="px-4 py-3 text-xs text-white/60">{u.phoneNumber ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Badge className={u.isActive ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 text-xs" : "bg-red-500/10 text-red-400 border-red-500/30 text-xs"}>
                            {u.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Children Table */}
      {activeTable === "children" && (
        <Card className="bg-[#1a1f2e]/80 border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Child Name</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Zone</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Parent/Guardian</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Phone</th>
                  <th className="text-left text-xs text-white/50 px-4 py-3 font-medium">Health Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredChildren.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-white/40 text-sm py-8">No children records found in this session</td></tr>
                ) : (
                  filteredChildren.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {c.firstName.slice(0, 1)}
                          </div>
                          <span className="text-sm text-white font-medium">{c.firstName} {c.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/60">{c.assignedZone ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-white/60">{c.emergencyContact.name}</td>
                      <td className="px-4 py-3 text-xs text-[#0ea5e9]">{c.emergencyContact.phoneNumber}</td>
                      <td className="px-4 py-3">
                        {c.allergies?.length ? (
                          <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/30 text-[10px]">
                            {c.allergies.join(", ")}
                          </Badge>
                        ) : (
                          <span className="text-xs text-white/30">None</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Tab: SYSTEM HEALTH ───────────────────────────────────────────────────────

function SystemHealthTab() {
  const [uptime] = useState("99.97%");
  const [lastSync] = useState(new Date());
  const hasSentry = !!(import.meta.env.VITE_SENTRY_DSN);

  const services = [
    { name: "Firebase Firestore", status: "operational", latency: "45ms", icon: Database, color: "text-[#10b981]" },
    { name: "Firebase Auth", status: "operational", latency: "32ms", icon: Shield, color: "text-[#10b981]" },
    { name: "Cloudinary Media CDN", status: "operational", latency: "78ms", icon: Activity, color: "text-[#10b981]" },
    { name: "Sentry Error Monitoring", status: hasSentry ? "operational" : "not configured", latency: hasSentry ? "12ms" : "—", icon: Eye, color: hasSentry ? "text-[#10b981]" : "text-amber-400" },
    { name: "Message Service", status: "operational", latency: "21ms", icon: MessageSquare, color: "text-[#10b981]" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "System Uptime", value: uptime, icon: TrendingUp, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
          { label: "Active Services", value: `${services.filter(s => s.status === "operational").length}/${services.length}`, icon: Zap, color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/10" },
          { label: "Last Data Sync", value: "Just now", icon: RefreshCw, color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10" },
          { label: "Error Rate", value: "0.03%", icon: AlertTriangle, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#1a1f2e]/80 border-white/10 p-5">
            <div className={`rounded-xl ${s.bg} p-2.5 w-fit mb-3`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/50 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Service health */}
      <Card className="bg-[#1a1f2e]/80 border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Service Status</h3>
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <svc.icon className={`h-4 w-4 ${svc.color}`} />
                <span className="text-sm text-white">{svc.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">{svc.latency}</span>
                <Badge className={svc.status === "operational" ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 text-xs" : "bg-amber-400/10 text-amber-400 border-amber-400/30 text-xs"}>
                  {svc.status === "operational" ? "● Operational" : "⚠ " + svc.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sentry setup guide */}
      {!hasSentry && (
        <Card className="bg-amber-400/5 border-amber-400/20 p-6">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">Connect Sentry Monitoring</h3>
              <p className="text-white/60 text-sm mb-4">Sentry is not yet configured. Follow the steps below to enable error tracking.</p>
              <div className="space-y-3">
                <div className="bg-[#0a0e1a] rounded-xl p-4 font-mono text-sm">
                  <p className="text-white/40 text-xs mb-2"># Step 1 — Install Sentry (already done if you followed setup)</p>
                  <p className="text-[#10b981]">npm install @sentry/react</p>
                </div>
                <div className="bg-[#0a0e1a] rounded-xl p-4 font-mono text-sm">
                  <p className="text-white/40 text-xs mb-2"># Step 2 — Add your DSN to .env</p>
                  <p className="text-amber-300">VITE_SENTRY_DSN=https://&lt;key&gt;@&lt;org&gt;.ingest.sentry.io/&lt;project-id&gt;</p>
                </div>
                <div className="bg-[#0a0e1a] rounded-xl p-4 font-mono text-sm">
                  <p className="text-white/40 text-xs mb-2"># Step 3 — Sentry is already initialized in main.tsx</p>
                  <p className="text-[#0ea5e9]">// src/config/sentry.config.ts is ready</p>
                </div>
                <p className="text-white/40 text-xs">Get your DSN from: <a href="https://sentry.io" target="_blank" rel="noreferrer" className="text-[#0ea5e9] underline">sentry.io</a> → New Project → React</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {hasSentry && (
        <Card className="bg-[#10b981]/5 border-[#10b981]/20 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-[#10b981]" />
            <div>
              <h3 className="text-white font-semibold">Sentry Active</h3>
              <p className="text-white/60 text-sm">Error monitoring is running. View errors at <a href="https://sentry.io" target="_blank" rel="noreferrer" className="text-[#0ea5e9] underline">sentry.io</a></p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent uptime chart */}
      <Card className="bg-[#1a1f2e]/80 border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Response Time (ms) — Last 10 Hours</h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={[
            { h: "8AM", ms: 42 }, { h: "9AM", ms: 48 }, { h: "10AM", ms: 55 },
            { h: "11AM", ms: 63 }, { h: "12PM", ms: 71 }, { h: "1PM", ms: 58 },
            { h: "2PM", ms: 45 }, { h: "3PM", ms: 52 }, { h: "4PM", ms: 48 }, { h: "Now", ms: 44 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
            <XAxis dataKey="h" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }}
              formatter={(v: any) => [`${v}ms`, "Latency"]} />
            <Line type="monotone" dataKey="ms" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ─── Main Admin Dashboard ──────────────────────────────────────────────────────

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "broadcast", label: "Broadcast", icon: Megaphone },
  { key: "database", label: "Database", icon: Database },
  { key: "onboarding", label: "Onboarding", icon: UserPlus },
  { key: "system", label: "System Health", icon: Activity },
] as const;

export function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser, userProfile, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const tabParam = searchParams.get("tab") as typeof TABS[number]["key"] | null;
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["key"]>(tabParam ?? "overview");

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);

  const loadIncidents = useCallback(() => {
    setLoadingIncidents(true);
    incidentService.getActiveIncidents().then((data) => {
      setIncidents(data);
      setLoadingIncidents(false);
    });
  }, []);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);

  useEffect(() => {
    const unsub = messageService.subscribeToBroadcasts((data) => setBroadcasts(data));
    return unsub;
  }, []);

  // Sync tab from URL param
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) setActiveTab(tabParam);
  }, [tabParam]);

  const handleTabChange = (t: typeof TABS[number]["key"]) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const alertLevel = incidents.some((i) => i.priority === "critical") ? "CRITICAL" :
    incidents.some((i) => i.priority === "high") ? "HIGH" : "NORMAL";
  const alertBg = alertLevel === "CRITICAL" ? "bg-red-500" : alertLevel === "HIGH" ? "bg-amber-400" : "bg-[#10b981]";

  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628]">

      {/* ── Command Header ──────────────────────────────────────────────────── */}
      <div className="bg-[#1a1f2e]/90 backdrop-blur-lg border-b border-white/10 sticky top-0 z-20">
        {/* Alert bar (only when CRITICAL or HIGH) */}
        {alertLevel !== "NORMAL" && (
          <div className={`${alertBg} px-4 py-1.5 flex items-center justify-center gap-2`}>
            <AlertTriangle className="h-3.5 w-3.5 text-white animate-pulse" />
            <span className="text-white text-xs font-semibold">
              ALERT LEVEL: {alertLevel} — {incidents.filter(i => ["critical","high"].includes(i.priority)).length} incident(s) require immediate attention
            </span>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#10b981] p-2.5">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-white font-bold">Admin Command Center</h1>
                  <Badge className={`${alertBg}/20 text-white border-transparent text-xs font-bold`}>
                    {alertLevel}
                  </Badge>
                </div>
                <p className="text-xs text-white/50">
                  {userProfile?.displayName ?? "Admin"} · {currentTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-xs text-[#10b981]">Live · 12,847 attendees</span>
              </div>
              <NotificationBell />
              <Button onClick={() => navigate("/settings")} variant="ghost" size="icon" className="text-white/60 hover:text-white">
                <Settings className="h-5 w-5" />
              </Button>
              <Button onClick={logout} variant="ghost" size="icon" className="text-white/40 hover:text-red-400">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 mt-3 overflow-x-auto scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === t.key
                    ? "bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.key === "broadcast" && broadcasts.length > 0 && (
                  <span className="bg-[#10b981]/20 text-[#10b981] text-[10px] px-1.5 py-0.5 rounded-full">{broadcasts.length}</span>
                )}
                {t.key === "database" && incidents.length > 0 && (
                  <span className="bg-amber-400/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full">{incidents.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "overview" && (
              <OverviewTab
                incidents={incidents}
                loadingIncidents={loadingIncidents}
                broadcasts={broadcasts}
                onRefresh={loadIncidents}
                navigate={navigate}
              />
            )}
            {activeTab === "broadcast" && (
              <BroadcastTab currentUser={currentUser} currentProfile={userProfile} />
            )}
            {activeTab === "database" && (
              <DatabaseTab incidents={incidents} />
            )}
            {activeTab === "onboarding" && (
              <OnboardingTab />
            )}
            {activeTab === "system" && (
              <SystemHealthTab />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tab: ONBOARDING & SETTINGS ───────────────────────────────────────────────

function OnboardingTab() {
  const { activeSessionId, activeSessionName, setSession } = useSessionStore();
  const [newSessionName, setNewSessionName] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "", displayName: "", role: "volunteer" });
  const [submittingLogin, setSubmittingLogin] = useState(false);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName) return;
    const newId = "session-" + Date.now();
    setSession(newId, newSessionName);
    setNewSessionName("");
    toast.success(`Started new session: ${newSessionName}`);
  };

  const handleGenerateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLogin(true);
    
    // In a real app, this calls Firebase Auth admin SDK.
    // For now we use the userService mock
    const uid = "user-" + Date.now();
    await userService.createUser(uid, {
      email: loginForm.email,
      displayName: loginForm.displayName,
      role: loginForm.role as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    toast.success(`Login generated for ${loginForm.displayName}!`);
    setLoginForm({ email: "", password: "", displayName: "", role: "volunteer" });
    setSubmittingLogin(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="bg-[#1a1f2e]/80 border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0ea5e9]/10 rounded-xl">
              <Key className="h-5 w-5 text-[#0ea5e9]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Generate Logins</h2>
              <p className="text-white/50 text-sm">Onboard staff, vendors, or parents</p>
            </div>
          </div>
          
          <form onSubmit={handleGenerateLogin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/60 block mb-1">Display Name</label>
                <Input required value={loginForm.displayName} onChange={e => setLoginForm({...loginForm, displayName: e.target.value})} className="bg-white/5 border-white/10 text-white" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Role</label>
                <select value={loginForm.role} onChange={e => setLoginForm({...loginForm, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="volunteer" className="bg-[#1a1f2e]">Volunteer</option>
                  <option value="vendor" className="bg-[#1a1f2e]">Vendor</option>
                  <option value="security" className="bg-[#1a1f2e]">Security</option>
                  <option value="delivery_personnel" className="bg-[#1a1f2e]">Delivery Rider</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Email Address</label>
              <Input required type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="bg-white/5 border-white/10 text-white" placeholder="staff@redemption.com" />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Temporary Password</label>
              <Input required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="bg-white/5 border-white/10 text-white" placeholder="P@ssw0rd123" />
            </div>
            <Button disabled={submittingLogin} className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white">
              {submittingLogin ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Generate & Email Login
            </Button>
          </form>
        </Card>

        <Card className="bg-gradient-to-br from-[#a78bfa]/10 to-transparent border-[#a78bfa]/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Link className="h-5 w-5 text-[#a78bfa]" />
            <h2 className="text-white font-semibold">Public Pre-Registration</h2>
          </div>
          <p className="text-white/60 text-sm mb-4">Share this link with parents so they can register their children and get QR tags before arriving at the event.</p>
          <div className="flex gap-2">
            <Input readOnly value={window.location.origin + "/pre-register"} className="bg-black/20 border-white/10 text-white font-mono text-xs" />
            <Button onClick={() => { navigator.clipboard.writeText(window.location.origin + "/pre-register"); toast.success("Link copied!"); }} variant="outline" className="text-white border-white/10">Copy</Button>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-[#1a1f2e]/80 border-white/10 p-6">
          <h2 className="text-white font-semibold text-lg mb-2">Event Session Management</h2>
          <p className="text-white/50 text-sm mb-6">Current active session tags all newly created data (users, children, incidents) to a specific event run.</p>
          
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
            <p className="text-xs text-white/40 mb-1">Currently Active Session</p>
            <p className="text-[#10b981] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              {activeSessionName}
            </p>
            <p className="text-xs text-white/30 font-mono mt-1">ID: {activeSessionId}</p>
          </div>

          <form onSubmit={handleCreateSession} className="space-y-4">
            <h3 className="text-white text-sm font-medium border-t border-white/10 pt-4">Start New Event Session</h3>
            <p className="text-xs text-amber-400/80 bg-amber-400/10 p-2 rounded border border-amber-400/20">
              Warning: Starting a new session will hide older data from the active dashboards until you switch back.
            </p>
            <div>
              <label className="text-xs text-white/60 block mb-1">New Event Name</label>
              <Input required value={newSessionName} onChange={e => setNewSessionName(e.target.value)} placeholder="e.g. Annual Convention 2026" className="bg-white/5 border-white/10 text-white" />
            </div>
            <Button className="w-full bg-white/10 text-white hover:bg-white/20">
              Set as Active Session
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
