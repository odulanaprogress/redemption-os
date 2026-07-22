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

const PRIORITY_BADGE: Record<string, string> = {
  critical: "bg-red-50 text-red-600 border-red-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-emerald-50 text-emerald-600 border-emerald-200",
};
const STATUS_BADGE: Record<string, string> = {
  reported: "bg-amber-50 text-amber-700 border-amber-200",
  acknowledged: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-[#EDE9FE] text-[#5B4FE8] border-[#5B4FE8]/20",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-gray-50 text-gray-500 border-gray-200",
};
const ZONE_BAR_COLOR = (cap: number) => cap >= 90 ? "#DC2626" : cap >= 70 ? "#D97706" : "#059669";

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone", icon: Globe, desc: "All registered users" },
  { value: "admin", label: "Admins", icon: Shield, desc: "Admin & security staff" },
  { value: "vendor", label: "Vendors", icon: ShoppingBag, desc: "All vendors" },
  { value: "parent", label: "Parents", icon: QrCode, desc: "Parents with children" },
  { value: "attendee", label: "Attendees", icon: Users, desc: "General attendees" },
  { value: "zone-main", label: "Zone: Main Hall", icon: MapPin, desc: "Main hall zone only" },
  { value: "zone-north", label: "Zone: North Wing", icon: MapPin, desc: "North wing zone" },
];

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#059669] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />Live
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, accentColor, bgColor, pulse }: {
  icon: any; label: string; value: string; sub: string; accentColor: string; bgColor: string; pulse?: boolean;
}) {
  return (
    <Card className="bg-white border border-[#E5E7EB] shadow-sm p-5 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-lg ${bgColor} p-2.5`}><Icon className={`h-4 w-4 ${accentColor}`} /></div>
        <Badge className={`text-xs border font-normal ${pulse ? "bg-red-50 text-red-600 border-red-200" : "bg-[#F8F9FF] text-[#6B7280] border-[#E5E7EB]"}`}>{sub}</Badge>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${pulse ? "text-[#DC2626]" : "text-[#0D0D0D]"}`}>{value}</p>
      <p className="text-sm text-[#6B7280] mt-0.5">{label}</p>
    </Card>
  );
}

// ─── Tab: OVERVIEW ────────────────────────────────────────────────────────────
function OverviewTab({ incidents, loadingIncidents, onRefresh, navigate, broadcasts }: {
  incidents: Incident[]; loadingIncidents: boolean; broadcasts: Broadcast[]; onRefresh: () => void; navigate: (p: string) => void;
}) {
  const [liveCount, setLiveCount] = useState(12847);
  useEffect(() => { const t = setInterval(() => setLiveCount((c) => c + Math.floor(Math.random() * 5) - 2), 3000); return () => clearInterval(t); }, []);

  const stats = [
    { icon: Users, label: "Total Attendees", value: liveCount.toLocaleString(), sub: "+14.2%", accentColor: "text-[#5B4FE8]", bgColor: "bg-[#EDE9FE]" },
    { icon: AlertTriangle, label: "Active Incidents", value: String(incidents.length || "0"), sub: incidents.length > 0 ? "Needs Attention" : "All Clear", accentColor: incidents.length > 0 ? "text-[#DC2626]" : "text-[#059669]", bgColor: incidents.length > 0 ? "bg-red-50" : "bg-emerald-50", pulse: incidents.length > 0 },
    { icon: Radio, label: "Broadcasts Sent", value: String(broadcasts.length), sub: "Today", accentColor: "text-[#059669]", bgColor: "bg-emerald-50" },
    { icon: TrendingUp, label: "Avg Response Time", value: "1.8 min", sub: "↓ 12%", accentColor: "text-[#5B4FE8]", bgColor: "bg-[#EDE9FE]" },
  ];

  const tooltipStyle = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, color: "#0D0D0D", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map((s) => <StatCard key={s.label} {...s} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
          <div className="flex items-center justify-between mb-5"><h3 className="font-semibold text-[#0D0D0D]">Live Crowd Analytics</h3><LiveBadge /></div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={crowdData}>
              <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B4FE8" stopOpacity={0.15} /><stop offset="95%" stopColor="#5B4FE8" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#5B4FE8" strokeWidth={2} fill="url(#cg)" name="Attendees" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
          <h3 className="font-semibold text-[#0D0D0D] mb-5">Zone Capacity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={zoneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="zone" stroke="#9CA3AF" tick={{ fontSize: 9, fill: "#9CA3AF" }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Capacity"]} />
              <Bar dataKey="capacity" radius={[4, 4, 0, 0]} name="Capacity %">{zoneData.map((d, i) => <Cell key={i} fill={ZONE_BAR_COLOR(d.capacity)} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
        <h3 className="font-semibold text-[#0D0D0D] mb-4">Zone Status Board</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {zoneData.map((z) => (
            <div key={z.zone} className="p-4 bg-[#F8F9FF] rounded-lg border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#0D0D0D]">{z.zone}</span>
                <Badge className={`text-xs border font-medium ${z.capacity >= 90 ? "bg-red-50 text-[#DC2626] border-red-200" : z.capacity >= 70 ? "bg-amber-50 text-[#D97706] border-amber-200" : "bg-emerald-50 text-[#059669] border-emerald-200"}`}>{z.capacity}%</Badge>
              </div>
              <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${z.capacity}%`, background: ZONE_BAR_COLOR(z.capacity) }} /></div>
              <p className="text-xs text-[#6B7280] mt-1.5">{z.attendees.toLocaleString()} attendees</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#0D0D0D]">Active Incidents</h3>
            {incidents.length > 0 && <Badge className="bg-red-50 text-[#DC2626] border-red-200 text-xs">{incidents.length}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="p-1.5 hover:bg-[#F8F9FF] rounded-md text-[#6B7280] hover:text-[#0D0D0D] transition-colors"><RefreshCw className="h-4 w-4" /></button>
            <Button onClick={() => navigate("/community-signal")} variant="ghost" size="sm" className="text-[#5B4FE8] hover:text-[#4840C8] hover:bg-[#EDE9FE]">View All</Button>
          </div>
        </div>
        {loadingIncidents ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[#5B4FE8]" /></div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280]"><Shield className="h-7 w-7 mx-auto mb-2 text-[#D1D5DB]" /><p className="text-sm">No active incidents — all clear</p></div>
        ) : (
          <div className="space-y-2">
            {incidents.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between p-4 bg-[#F8F9FF] rounded-lg border border-[#E5E7EB] hover:border-[#5B4FE8]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${inc.priority === "critical" ? "bg-[#DC2626] animate-pulse" : inc.priority === "high" ? "bg-orange-400" : inc.priority === "medium" ? "bg-[#D97706]" : "bg-[#059669]"}`} />
                  <div>
                    <p className="text-sm font-medium text-[#0D0D0D]">{inc.title}</p>
                    <p className="text-xs text-[#6B7280]">{inc.location?.zone}{inc.location?.building ? ` · ${inc.location.building}` : ""}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{formatDistanceToNow(inc.createdAt, { addSuffix: true })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${STATUS_BADGE[inc.status] ?? STATUS_BADGE.reported} border text-xs`}>{inc.status.replace("_", " ")}</Badge>
                  <button onClick={() => incidentService.updateIncident(inc.id, { status: "acknowledged" }).then(onRefresh)} className="p-1.5 hover:bg-emerald-50 rounded-md text-[#9CA3AF] hover:text-[#059669] transition-colors" title="Acknowledge">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
        <h3 className="font-semibold text-[#0D0D0D] mb-4">Incident Frequency Today</h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={incidentTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="hour" stroke="#9CA3AF" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, color: "#0D0D0D", fontSize: 12 }} />
            <Line type="monotone" dataKey="count" stroke="#D97706" strokeWidth={2} dot={{ fill: "#D97706", r: 3 }} name="Incidents" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: "Live Operations", sub: "Real-time center", accentColor: "text-[#5B4FE8]", bgColor: "bg-[#EDE9FE]", path: "/operations" },
          { icon: Shield, label: "Emergency", sub: "Coordination", accentColor: "text-[#DC2626]", bgColor: "bg-red-50", path: "/emergency" },
          { icon: QrCode, label: "QR Identity", sub: "Child safety", accentColor: "text-[#5B4FE8]", bgColor: "bg-[#EDE9FE]", path: "/qr-identity" },
          { icon: Truck, label: "Logistics", sub: "Deliveries", accentColor: "text-[#059669]", bgColor: "bg-emerald-50", path: "/logistics" },
        ].map(({ icon: Icon, label, sub, accentColor, bgColor, path }) => (
          <Card key={label} onClick={() => navigate(path)} className="cursor-pointer bg-white border border-[#E5E7EB] shadow-sm p-5 rounded-lg hover:border-[#5B4FE8]/30 hover:shadow-md transition-all">
            <div className={`rounded-lg ${bgColor} p-2.5 w-fit mb-3`}><Icon className={`h-4 w-4 ${accentColor}`} /></div>
            <p className="text-sm font-semibold text-[#0D0D0D]">{label}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>
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

  useEffect(() => { const unsub = messageService.subscribeToBroadcasts((data) => setBroadcasts(data)); return unsub; }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }
    if (!currentUser?.uid) { toast.error("Not authenticated"); return; }
    setSubmitting(true);
    const result = await messageService.createBroadcast({
      type: bType, title: title.trim(), message: message.trim(),
      zone: audience === "all" ? "All Zones" : AUDIENCE_OPTIONS.find(a => a.value === audience)?.label ?? audience,
      createdBy: currentUser.uid, createdByName: currentProfile?.displayName ?? "Admin",
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Broadcast sent to " + (AUDIENCE_OPTIONS.find(a => a.value === audience)?.label ?? "everyone") + "!");
      setTitle(""); setMessage("");
      await notificationService.createNotification(currentUser.uid, { type: bType === "emergency" ? "emergency" : "info", title, message });
    } else { toast.error("Failed to send broadcast"); }
  };

  const typeCfg: Record<string, string> = {
    operational: "border-[#5B4FE8]/30 bg-[#EDE9FE] text-[#5B4FE8]", alert: "border-amber-200 bg-amber-50 text-[#D97706]",
    emergency: "border-red-200 bg-red-50 text-[#DC2626]", info: "border-emerald-200 bg-emerald-50 text-[#059669]",
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-[#EDE9FE] p-2.5"><Megaphone className="h-4 w-4 text-[#5B4FE8]" /></div>
          <div><h3 className="font-semibold text-[#0D0D0D]">Broadcast Composer</h3><p className="text-xs text-[#6B7280]">Send a message to any audience instantly</p></div>
        </div>
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-[#6B7280] block mb-2">Send To</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AUDIENCE_OPTIONS.map((a) => (
                <button key={a.value} type="button" onClick={() => setAudience(a.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all text-sm ${audience === a.value ? "bg-[#EDE9FE] border-[#5B4FE8]/30 text-[#5B4FE8]" : "bg-[#F8F9FF] border-[#E5E7EB] text-[#6B7280] hover:text-[#0D0D0D] hover:bg-white hover:border-[#5B4FE8]/20"}`}>
                  <a.icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0"><p className="font-medium truncate">{a.label}</p><p className="text-[10px] text-[#9CA3AF] truncate">{a.desc}</p></div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#6B7280] block mb-1.5">Type</label>
              <select value={bType} onChange={(e) => setBType(e.target.value as any)} className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#5B4FE8]">
                {(["operational", "info", "alert", "emergency"] as const).map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B7280] block mb-1.5">Title *</label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Broadcast title..." className="border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF] focus:border-[#5B4FE8] h-9 rounded-md" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B7280] block mb-1.5">Message *</label>
            <Textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your broadcast message here..." className="border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF] focus:border-[#5B4FE8] min-h-[100px] rounded-md" />
          </div>
          {(title || message) && (
            <div className={`p-4 rounded-lg border ${typeCfg[bType]}`}>
              <p className="text-xs text-[#6B7280] mb-1">Preview →</p>
              {title && <p className="font-semibold text-[#0D0D0D]">{title}</p>}
              {message && <p className="text-sm text-[#6B7280] mt-1">{message}</p>}
              <p className="text-[10px] text-[#9CA3AF] mt-2">To: {AUDIENCE_OPTIONS.find(a => a.value === audience)?.label ?? "Everyone"}</p>
            </div>
          )}
          <button type="submit" disabled={submitting} className={`w-full py-2.5 rounded-md font-semibold flex items-center justify-center gap-2 transition-colors text-sm ${bType === "emergency" ? "bg-[#DC2626] hover:bg-red-700 text-white" : "bg-[#5B4FE8] hover:bg-[#4840C8] text-white"} disabled:opacity-50`}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? "Sending..." : `Send Broadcast${bType === "emergency" ? " 🚨" : ""}`}
          </button>
        </form>
      </Card>
      <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0D0D0D]">Broadcast History</h3>
          <Badge className="bg-[#F8F9FF] text-[#6B7280] border-[#E5E7EB] text-xs">{broadcasts.length} sent</Badge>
        </div>
        {broadcasts.length === 0 ? (
          <p className="text-[#9CA3AF] text-sm text-center py-6">No broadcasts yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {broadcasts.map((b) => {
              const cfg: Record<string, string> = { operational: "text-[#5B4FE8] border-[#5B4FE8]/20 bg-[#EDE9FE]", alert: "text-[#D97706] border-amber-200 bg-amber-50", emergency: "text-[#DC2626] border-red-200 bg-red-50", info: "text-[#059669] border-emerald-200 bg-emerald-50" };
              return (
                <div key={b.id} className="p-4 bg-[#F8F9FF] rounded-lg border border-[#E5E7EB]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-[#0D0D0D]">{b.title}</span>
                        <Badge className={`text-[10px] border capitalize ${cfg[b.type] ?? "bg-[#F8F9FF] text-[#6B7280] border-[#E5E7EB]"}`}>{b.type}</Badge>
                        <Badge className="text-[10px] bg-[#F8F9FF] text-[#6B7280] border-[#E5E7EB]">{b.zone}</Badge>
                      </div>
                      <p className="text-[#6B7280] text-xs line-clamp-2">{b.message}</p>
                      <p className="text-[#9CA3AF] text-[10px] mt-1.5">{formatDistanceToNow(b.createdAt, { addSuffix: true })} by {b.createdByName}</p>
                    </div>
                    <button onClick={() => messageService.deleteBroadcast(b.id)} className="p-1.5 hover:bg-red-50 rounded-md text-[#9CA3AF] hover:text-[#DC2626] transition-colors shrink-0">
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

  useEffect(() => { const unsub = messageService.subscribeToBroadcasts((data) => setBroadcasts(data)); return unsub; }, []);

  useEffect(() => {
    if (activeTable === "users" && users.length === 0) { setLoadingUsers(true); userService.getPaginatedUsers(50).then((r) => { setUsers(r.data); setLoadingUsers(false); }); }
    if (activeTable === "children" && children.length === 0) { setChildren(familyService.getAllMockMembers()); }
  }, [activeTable]);

  const exportIncidents = () => {
    const headers = ["ID", "Title", "Type", "Priority", "Status", "Zone", "Building", "Reported By", "Created At"];
    const rows = filteredIncidents.map((i) => [i.id, i.title, i.type, i.priority, i.status, i.location?.zone ?? "", i.location?.building ?? "", i.reportedBy, format(i.createdAt, "yyyy-MM-dd HH:mm")]);
    downloadCSV(`incidents_${format(new Date(), "yyyyMMdd_HHmm")}.csv`, headers, rows);
    toast.success("Incidents exported to CSV");
  };
  const exportBroadcasts = () => {
    const headers = ["ID", "Type", "Title", "Message", "Zone", "Sent By", "Created At"];
    const rows = filteredBroadcasts.map((b) => [b.id, b.type, b.title, b.message, b.zone, b.createdByName, format(b.createdAt, "yyyy-MM-dd HH:mm")]);
    downloadCSV(`broadcasts_${format(new Date(), "yyyyMMdd_HHmm")}.csv`, headers, rows);
    toast.success("Broadcasts exported to CSV");
  };
  const exportUsers = () => {
    const headers = ["UID", "Display Name", "Email", "Role", "Phone", "Active", "Created At"];
    const rows = filteredUsers.map((u) => [u.uid, u.displayName, u.email, u.role, u.phoneNumber ?? "", String(u.isActive), u.createdAt ? format(new Date(u.createdAt), "yyyy-MM-dd") : ""]);
    downloadCSV(`users_${format(new Date(), "yyyyMMdd_HHmm")}.csv`, headers, rows);
    toast.success("Users exported");
  };
  const exportChildren = () => {
    const headers = ["ID", "First Name", "Last Name", "Zone", "Parent/Guardian", "Phone", "Allergies"];
    const rows = filteredChildren.map((c) => [c.id, c.firstName, c.lastName, c.assignedZone ?? "", c.emergencyContact?.name ?? "", c.emergencyContact?.phoneNumber ?? "", c.allergies?.join(", ") ?? ""]);
    downloadCSV(`children_${format(new Date(), "yyyyMMdd_HHmm")}.csv`, headers, rows);
    toast.success("Children data exported");
  };

  const filteredIncidents = incidents.filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase()));
  const filteredBroadcasts = broadcasts.filter((b) => !search || b.title.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers = users.filter((u) => !search || (u.displayName + u.email + u.role).toLowerCase().includes(search.toLowerCase()));
  const filteredChildren = children.filter((c) => !search || (c.firstName + " " + c.lastName).toLowerCase().includes(search.toLowerCase()));

  const tables = [
    { key: "incidents", label: "Incidents", count: incidents.length, icon: AlertTriangle },
    { key: "broadcasts", label: "Broadcasts", count: broadcasts.length, icon: Radio },
    { key: "users", label: "Users", count: users.length, icon: Users },
    { key: "children", label: "Children", count: children.length, icon: QrCode },
  ] as const;

  const thCls = "text-left text-xs font-semibold text-[#5B4FE8] px-4 py-3";
  const tdCls = "px-4 py-3 text-sm text-[#0D0D0D]";
  const tdMutedCls = "px-4 py-3 text-xs text-[#6B7280]";

  return (
    <div className="space-y-5">
      <Card className="bg-white border border-[#E5E7EB] shadow-sm p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            {tables.map((t) => (
              <button key={t.key} onClick={() => setActiveTable(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${activeTable === t.key ? "bg-[#EDE9FE] text-[#5B4FE8] border-[#5B4FE8]/20" : "bg-[#F8F9FF] text-[#6B7280] hover:text-[#0D0D0D] border-[#E5E7EB]"}`}>
                <t.icon className="h-3.5 w-3.5" />{t.label}
                <span className="bg-[#E5E7EB] text-[#6B7280] rounded-full px-1.5 py-0.5 text-[10px] ml-0.5">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records..." className="w-full bg-white border border-[#E5E7EB] rounded-md pl-9 pr-4 py-2 text-sm text-[#0D0D0D] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5B4FE8]" />
          </div>
          <button onClick={activeTable === "incidents" ? exportIncidents : activeTable === "broadcasts" ? exportBroadcasts : activeTable === "users" ? exportUsers : exportChildren}
            className="flex items-center gap-2 px-4 py-2 bg-[#EDE9FE] border border-[#5B4FE8]/20 rounded-md text-[#5B4FE8] text-sm font-medium hover:bg-[#5B4FE8] hover:text-white transition-colors whitespace-nowrap">
            <FileSpreadsheet className="h-4 w-4" />Export CSV
          </button>
        </div>
      </Card>

      {activeTable === "incidents" && (
        <Card className="bg-white border border-[#E5E7EB] shadow-sm overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#E5E7EB] bg-[#F8F9FF]"><th className={thCls}>Priority</th><th className={thCls}>Title</th><th className={thCls}>Type</th><th className={thCls}>Zone</th><th className={thCls}>Status</th><th className={thCls}>Reported</th></tr></thead>
              <tbody>
                {filteredIncidents.length === 0 ? (<tr><td colSpan={6} className="text-center text-[#9CA3AF] text-sm py-8">No incidents found</td></tr>) :
                  filteredIncidents.map((inc) => (
                    <tr key={inc.id} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF] transition-colors">
                      <td className="px-4 py-3"><Badge className={`${PRIORITY_BADGE[inc.priority] ?? PRIORITY_BADGE.low} border text-xs capitalize`}>{inc.priority}</Badge></td>
                      <td className={tdCls}>{inc.title}</td>
                      <td className="px-4 py-3"><Badge className="bg-[#F8F9FF] text-[#6B7280] border-[#E5E7EB] text-xs capitalize">{inc.type}</Badge></td>
                      <td className={tdMutedCls}>{inc.location?.zone ?? "—"}</td>
                      <td className="px-4 py-3"><Badge className={`${STATUS_BADGE[inc.status] ?? STATUS_BADGE.reported} border text-xs`}>{inc.status.replace("_", " ")}</Badge></td>
                      <td className={tdMutedCls}>{formatDistanceToNow(inc.createdAt, { addSuffix: true })}</td>
                    </tr>))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTable === "broadcasts" && (
        <Card className="bg-white border border-[#E5E7EB] shadow-sm overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#E5E7EB] bg-[#F8F9FF]"><th className={thCls}>Type</th><th className={thCls}>Title</th><th className={thCls}>Message</th><th className={thCls}>Zone</th><th className={thCls}>Sent By</th><th className={thCls}>Time</th></tr></thead>
              <tbody>
                {filteredBroadcasts.length === 0 ? (<tr><td colSpan={6} className="text-center text-[#9CA3AF] text-sm py-8">No broadcasts found</td></tr>) :
                  filteredBroadcasts.map((b) => (
                    <tr key={b.id} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF] transition-colors">
                      <td className="px-4 py-3"><Badge className="bg-[#F8F9FF] text-[#6B7280] border-[#E5E7EB] text-xs capitalize">{b.type}</Badge></td>
                      <td className={tdCls}>{b.title}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280] max-w-xs truncate">{b.message}</td>
                      <td className={tdMutedCls}>{b.zone}</td>
                      <td className={tdMutedCls}>{b.createdByName}</td>
                      <td className={tdMutedCls}>{formatDistanceToNow(b.createdAt, { addSuffix: true })}</td>
                    </tr>))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTable === "users" && (
        <Card className="bg-white border border-[#E5E7EB] shadow-sm overflow-hidden rounded-lg">
          {loadingUsers ? (<div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-[#5B4FE8]" /></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[#E5E7EB] bg-[#F8F9FF]"><th className={thCls}>Name</th><th className={thCls}>Email</th><th className={thCls}>Role</th><th className={thCls}>Phone</th><th className={thCls}>Status</th></tr></thead>
                <tbody>
                  {filteredUsers.length === 0 ? (<tr><td colSpan={5} className="text-center text-[#9CA3AF] text-sm py-8">{users.length === 0 ? "No users in database" : "No users match search"}</td></tr>) :
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#5B4FE8] text-[10px] font-bold shrink-0">{(u.displayName ?? "U").slice(0, 1)}</div>
                            <span className="text-sm font-medium text-[#0D0D0D]">{u.displayName}</span>
                          </div>
                        </td>
                        <td className={tdMutedCls}>{u.email}</td>
                        <td className="px-4 py-3"><Badge className="bg-[#EDE9FE] text-[#5B4FE8] border-[#5B4FE8]/20 text-xs capitalize">{u.role}</Badge></td>
                        <td className={tdMutedCls}>{u.phoneNumber ?? "—"}</td>
                        <td className="px-4 py-3"><Badge className={u.isActive ? "bg-emerald-50 text-[#059669] border-emerald-200 text-xs" : "bg-red-50 text-[#DC2626] border-red-200 text-xs"}>{u.isActive ? "Active" : "Inactive"}</Badge></td>
                      </tr>))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTable === "children" && (
        <Card className="bg-white border border-[#E5E7EB] shadow-sm overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#E5E7EB] bg-[#F8F9FF]"><th className={thCls}>Child Name</th><th className={thCls}>Zone</th><th className={thCls}>Parent/Guardian</th><th className={thCls}>Phone</th><th className={thCls}>Health Notes</th></tr></thead>
              <tbody>
                {filteredChildren.length === 0 ? (<tr><td colSpan={5} className="text-center text-[#9CA3AF] text-sm py-8">No children records found</td></tr>) :
                  filteredChildren.map((c) => (
                    <tr key={c.id} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#5B4FE8] text-[10px] font-bold shrink-0">{c.firstName.slice(0, 1)}</div>
                          <span className="text-sm font-medium text-[#0D0D0D]">{c.firstName} {c.lastName}</span>
                        </div>
                      </td>
                      <td className={tdMutedCls}>{c.assignedZone ?? "—"}</td>
                      <td className={tdMutedCls}>{c.emergencyContact.name}</td>
                      <td className="px-4 py-3 text-xs text-[#5B4FE8]">{c.emergencyContact.phoneNumber}</td>
                      <td className="px-4 py-3">{c.allergies?.length ? (<Badge className="bg-amber-50 text-[#D97706] border-amber-200 text-[10px]">{c.allergies.join(", ")}</Badge>) : (<span className="text-xs text-[#9CA3AF]">None</span>)}</td>
                    </tr>))}
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
  const hasSentry = !!(import.meta.env.VITE_SENTRY_DSN);
  const services = [
    { name: "Firebase Firestore", status: "operational", latency: "45ms", icon: Database },
    { name: "Firebase Auth", status: "operational", latency: "32ms", icon: Shield },
    { name: "Cloudinary Media CDN", status: "operational", latency: "78ms", icon: Activity },
    { name: "Sentry Error Monitoring", status: hasSentry ? "operational" : "not configured", latency: hasSentry ? "12ms" : "—", icon: Eye },
    { name: "Message Service", status: "operational", latency: "21ms", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "System Uptime", value: "99.97%", icon: TrendingUp, accentColor: "text-[#059669]", bgColor: "bg-emerald-50" },
          { label: "Active Services", value: `${services.filter(s => s.status === "operational").length}/${services.length}`, icon: Zap, accentColor: "text-[#5B4FE8]", bgColor: "bg-[#EDE9FE]" },
          { label: "Last Data Sync", value: "Just now", icon: RefreshCw, accentColor: "text-[#5B4FE8]", bgColor: "bg-[#EDE9FE]" },
          { label: "Error Rate", value: "0.03%", icon: AlertTriangle, accentColor: "text-[#059669]", bgColor: "bg-emerald-50" },
        ].map((s) => (
          <Card key={s.label} className="bg-white border border-[#E5E7EB] shadow-sm p-5 rounded-lg">
            <div className={`rounded-lg ${s.bgColor} p-2.5 w-fit mb-3`}><s.icon className={`h-4 w-4 ${s.accentColor}`} /></div>
            <p className="text-xl font-bold text-[#0D0D0D] tracking-tight">{s.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
        <h3 className="font-semibold text-[#0D0D0D] mb-4">Service Status</h3>
        <div className="space-y-2">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between p-3.5 bg-[#F8F9FF] rounded-lg border border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <svc.icon className={`h-4 w-4 ${svc.status === "operational" ? "text-[#059669]" : "text-[#D97706]"}`} />
                <span className="text-sm font-medium text-[#0D0D0D]">{svc.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#9CA3AF]">{svc.latency}</span>
                <Badge className={svc.status === "operational" ? "bg-emerald-50 text-[#059669] border-emerald-200 text-xs" : "bg-amber-50 text-[#D97706] border-amber-200 text-xs"}>{svc.status === "operational" ? "Operational" : "⚠ " + svc.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {!hasSentry && (
        <Card className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#0D0D0D] mb-2">Connect Sentry Monitoring</h3>
              <p className="text-[#6B7280] text-sm mb-4">Sentry is not yet configured. Follow the steps below to enable error tracking.</p>
              <div className="space-y-3">
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 font-mono text-sm">
                  <p className="text-[#9CA3AF] text-xs mb-2"># Step 1 — Install Sentry (already done)</p>
                  <p className="text-[#059669]">npm install @sentry/react</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 font-mono text-sm">
                  <p className="text-[#9CA3AF] text-xs mb-2"># Step 2 — Add your DSN to .env</p>
                  <p className="text-[#D97706]">VITE_SENTRY_DSN=https://&lt;key&gt;@&lt;org&gt;.ingest.sentry.io/&lt;project-id&gt;</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 font-mono text-sm">
                  <p className="text-[#9CA3AF] text-xs mb-2"># Step 3 — Already initialized in main.tsx</p>
                  <p className="text-[#5B4FE8]">// src/config/sentry.config.ts is ready</p>
                </div>
                <p className="text-[#6B7280] text-xs">Get your DSN from: <a href="https://sentry.io" target="_blank" rel="noreferrer" className="text-[#5B4FE8] underline">sentry.io</a> → New Project → React</p>
              </div>
            </div>
          </div>
        </Card>
      )}
      {hasSentry && (
        <Card className="bg-emerald-50 border border-emerald-200 p-5 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-[#059669]" />
            <div><h3 className="font-semibold text-[#0D0D0D]">Sentry Active</h3><p className="text-[#6B7280] text-sm">Error monitoring is running. View errors at <a href="https://sentry.io" target="_blank" rel="noreferrer" className="text-[#5B4FE8] underline">sentry.io</a></p></div>
          </div>
        </Card>
      )}

      <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
        <h3 className="font-semibold text-[#0D0D0D] mb-4">Response Time (ms) — Last 10 Hours</h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={[{ h: "8AM", ms: 42 }, { h: "9AM", ms: 48 }, { h: "10AM", ms: 55 }, { h: "11AM", ms: 63 }, { h: "12PM", ms: 71 }, { h: "1PM", ms: 58 }, { h: "2PM", ms: 45 }, { h: "3PM", ms: 52 }, { h: "4PM", ms: 48 }, { h: "Now", ms: 44 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="h" stroke="#9CA3AF" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, color: "#0D0D0D", fontSize: 12 }} formatter={(v: any) => [`${v}ms`, "Latency"]} />
            <Line type="monotone" dataKey="ms" stroke="#8B82F0" strokeWidth={2} dot={{ fill: "#8B82F0", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ─── Tab: ONBOARDING ──────────────────────────────────────────────────────────
function OnboardingTab() {
  const { activeSessionId, activeSessionName, setSession } = useSessionStore();
  const [newSessionName, setNewSessionName] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "", displayName: "", role: "volunteer" });
  const [submittingLogin, setSubmittingLogin] = useState(false);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName) return;
    setSession("session-" + Date.now(), newSessionName); setNewSessionName(""); toast.success(`Started new session: ${newSessionName}`);
  };

  const handleGenerateLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmittingLogin(true);
    await userService.createUser("user-" + Date.now(), { email: loginForm.email, displayName: loginForm.displayName, role: loginForm.role as any, isActive: true, createdAt: new Date(), updatedAt: new Date() });
    toast.success(`Login generated for ${loginForm.displayName}!`);
    setLoginForm({ email: "", password: "", displayName: "", role: "volunteer" }); setSubmittingLogin(false);
  };

  const inputCls = "border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF] focus:border-[#5B4FE8] h-9 rounded-md";
  const labelCls = "text-xs font-medium text-[#6B7280] block mb-1";
  const selectCls = "w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#5B4FE8]";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-[#EDE9FE] rounded-lg"><Key className="h-4 w-4 text-[#5B4FE8]" /></div>
            <div><h2 className="font-semibold text-[#0D0D0D]">Generate Logins</h2><p className="text-[#6B7280] text-sm">Onboard staff, vendors, or parents</p></div>
          </div>
          <form onSubmit={handleGenerateLogin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Display Name</label><Input required value={loginForm.displayName} onChange={e => setLoginForm({...loginForm, displayName: e.target.value})} className={inputCls} placeholder="John Doe" /></div>
              <div>
                <label className={labelCls}>Role</label>
                <select value={loginForm.role} onChange={e => setLoginForm({...loginForm, role: e.target.value})} className={selectCls}>
                  <option value="volunteer">Volunteer</option><option value="vendor">Vendor</option><option value="security">Security</option><option value="delivery_personnel">Delivery Rider</option>
                </select>
              </div>
            </div>
            <div><label className={labelCls}>Email Address</label><Input required type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className={inputCls} placeholder="staff@redemption.com" /></div>
            <div><label className={labelCls}>Temporary Password</label><Input required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className={inputCls} placeholder="P@ssw0rd123" /></div>
            <Button disabled={submittingLogin} className="w-full bg-[#5B4FE8] hover:bg-[#4840C8] text-white rounded-md h-9 font-medium">{submittingLogin ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}Generate & Email Login</Button>
          </form>
        </Card>
        <Card className="bg-[#F8F9FF] border border-[#5B4FE8]/20 p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <Link className="h-5 w-5 text-[#5B4FE8]" />
            <div>
              <h2 className="font-semibold text-[#0D0D0D]">Registration Invite Links</h2>
              <p className="text-[#6B7280] text-xs">Share custom registration links to onboard vendors, volunteers, security, & attendees live.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "🏪 Market Vendor Invite", role: "vendor", path: "/register?role=vendor" },
              { label: "🤝 Volunteer Invite", role: "volunteer", path: "/register?role=volunteer" },
              { label: "🛡️ Security Staff Invite", role: "security", path: "/register?role=security" },
              { label: "🚚 Delivery Rider Invite", role: "delivery_personnel", path: "/register?role=delivery_personnel" },
              { label: "👨‍👩‍👧 Parent & Child Safety", role: "parent", path: "/register?role=parent" },
            ].map((item) => {
              const fullUrl = window.location.origin + item.path;
              return (
                <div key={item.role} className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-md border border-[#E5E7EB]">
                  <div>
                    <p className="text-xs font-medium text-[#0D0D0D]">{item.label}</p>
                    <p className="text-[10px] text-[#9CA3AF] font-mono">{fullUrl}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(fullUrl);
                      toast.success(`Copied ${item.label} to clipboard!`);
                    }}
                    variant="outline"
                    className="border-[#5B4FE8]/30 text-[#5B4FE8] hover:bg-[#EDE9FE] h-7 text-xs px-2.5 shrink-0"
                  >
                    Copy Link
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-lg">
          <h2 className="font-semibold text-[#0D0D0D] mb-1">Event Session Management</h2>
          <p className="text-[#6B7280] text-sm mb-5">Tags all newly created data to a specific event run.</p>
          <div className="p-4 bg-[#F8F9FF] border border-[#E5E7EB] rounded-lg mb-5">
            <p className="text-xs text-[#6B7280] mb-1">Currently Active Session</p>
            <p className="text-[#059669] font-semibold flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />{activeSessionName}</p>
            <p className="text-xs text-[#9CA3AF] font-mono mt-1">ID: {activeSessionId}</p>
          </div>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <h3 className="text-sm font-medium text-[#0D0D0D] border-t border-[#E5E7EB] pt-4">Start New Event Session</h3>
            <p className="text-xs text-[#D97706] bg-amber-50 p-2.5 rounded-md border border-amber-200">Warning: Starting a new session will hide older data from active dashboards until you switch back.</p>
            <div><label className={labelCls}>New Event Name</label><Input required value={newSessionName} onChange={e => setNewSessionName(e.target.value)} placeholder="e.g. Annual Convention 2026" className={inputCls} /></div>
            <Button className="w-full bg-[#F8F9FF] border border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#EDE9FE] hover:text-[#5B4FE8] hover:border-[#5B4FE8]/30 rounded-md h-9">Set as Active Session</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ──────────────────────────────────────────────────────
const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 }, { key: "broadcast", label: "Broadcast", icon: Megaphone },
  { key: "database", label: "Database", icon: Database }, { key: "onboarding", label: "Onboarding", icon: UserPlus },
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

  const loadIncidents = useCallback(() => { setLoadingIncidents(true); incidentService.getActiveIncidents().then((data) => { setIncidents(data); setLoadingIncidents(false); }); }, []);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);
  useEffect(() => { const unsub = messageService.subscribeToBroadcasts((data) => setBroadcasts(data)); return unsub; }, []);
  useEffect(() => { if (tabParam && tabParam !== activeTab) setActiveTab(tabParam); }, [tabParam]);

  const handleTabChange = (t: typeof TABS[number]["key"]) => { setActiveTab(t); setSearchParams({ tab: t }); };

  const alertLevel = incidents.some((i) => i.priority === "critical") ? "CRITICAL" : incidents.some((i) => i.priority === "high") ? "HIGH" : "NORMAL";
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-20">
        {alertLevel !== "NORMAL" && (
          <div className={`${alertLevel === "CRITICAL" ? "bg-red-50 border-b border-red-200" : "bg-amber-50 border-b border-amber-200"} px-4 py-2 flex items-center justify-center gap-2`}>
            <AlertTriangle className={`h-3.5 w-3.5 ${alertLevel === "CRITICAL" ? "text-[#DC2626]" : "text-[#D97706]"} animate-pulse`} />
            <span className={`text-xs font-semibold ${alertLevel === "CRITICAL" ? "text-[#DC2626]" : "text-[#D97706]"}`}>
              ALERT: {alertLevel} — {incidents.filter(i => ["critical","high"].includes(i.priority)).length} incident(s) require immediate attention
            </span>
          </div>
        )}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#5B4FE8] flex items-center justify-center"><Shield className="h-5 w-5 text-white" /></div>
              <div>
                <div className="flex items-center gap-2"><h1 className="text-base font-bold text-[#0D0D0D]">Admin Command Center</h1>{alertLevel !== "NORMAL" && (<Badge className={`text-xs font-semibold ${alertLevel === "CRITICAL" ? "bg-red-50 text-[#DC2626] border-red-200" : "bg-amber-50 text-[#D97706] border-amber-200"}`}>{alertLevel}</Badge>)}</div>
                <p className="text-xs text-[#6B7280]">{userProfile?.displayName ?? "Admin"} · {currentTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                <span className="text-xs text-[#059669] font-medium">Live · 12,847 attendees</span>
              </div>
              <NotificationBell />
              <Button onClick={() => navigate("/settings")} variant="ghost" size="icon" className="text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#F8F9FF]"><Settings className="h-5 w-5" /></Button>
              <Button onClick={logout} variant="ghost" size="icon" className="text-[#6B7280] hover:text-[#DC2626] hover:bg-red-50"><LogOut className="h-5 w-5" /></Button>
            </div>
          </div>
          <div className="flex gap-1 mt-3 overflow-x-auto scrollbar-none">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => handleTabChange(t.key)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === t.key ? "bg-[#EDE9FE] text-[#5B4FE8]" : "text-[#6B7280] hover:text-[#0D0D0D] hover:bg-[#F8F9FF]"}`}>
                <t.icon className="h-4 w-4" />{t.label}
                {t.key === "broadcast" && broadcasts.length > 0 && (<span className="bg-[#EDE9FE] text-[#5B4FE8] text-[10px] px-1.5 py-0.5 rounded-full">{broadcasts.length}</span>)}
                {t.key === "database" && incidents.length > 0 && (<span className="bg-amber-50 text-[#D97706] text-[10px] px-1.5 py-0.5 rounded-full">{incidents.length}</span>)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            {activeTab === "overview" && <OverviewTab incidents={incidents} loadingIncidents={loadingIncidents} broadcasts={broadcasts} onRefresh={loadIncidents} navigate={navigate} />}
            {activeTab === "broadcast" && <BroadcastTab currentUser={currentUser} currentProfile={userProfile} />}
            {activeTab === "database" && <DatabaseTab incidents={incidents} />}
            {activeTab === "onboarding" && <OnboardingTab />}
            {activeTab === "system" && <SystemHealthTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
