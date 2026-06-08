import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Users, Activity, AlertTriangle, Radio, Truck, MessageSquare,
  Shield, Brain, Settings, BarChart3, ShoppingBag, QrCode,
  TrendingUp, LogOut, Bell,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { incidentService } from "../../services/incident.service";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";
import { NotificationBell } from "../components/NotificationBell";
import { Incident } from "../../types";
import { formatDistanceToNow } from "date-fns";

const crowdData = [
  { time: "8AM", count: 1200 }, { time: "9AM", count: 3500 },
  { time: "10AM", count: 7800 }, { time: "11AM", count: 11200 },
  { time: "12PM", count: 12847 }, { time: "1PM", count: 11500 },
];
const zoneData = [
  { zone: "Main Hall", capacity: 85 }, { zone: "North Wing", capacity: 62 },
  { zone: "South Wing", capacity: 48 }, { zone: "Gate A", capacity: 78 },
  { zone: "Gate B", capacity: 45 },
];

const priorityColor = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-amber-400",
  low: "bg-[#10b981]",
};
const statusBadge = {
  reported: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  acknowledged: "bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/30",
  in_progress: "bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/30",
  resolved: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30",
  closed: "bg-white/10 text-white/40 border-white/10",
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  useEffect(() => {
    setLoadingIncidents(true);
    incidentService.getActiveIncidents().then((data) => {
      setActiveIncidents(data);
      setLoadingIncidents(false);
    });
  }, []);

  const stats = [
    { label: "Total Attendees", value: "12,847", change: "+14.2%", icon: Users, color: "text-[#0ea5e9]", bgColor: "bg-[#0ea5e9]/10" },
    { label: "Active Events", value: "3", change: "Live Now", icon: Radio, color: "text-[#10b981]", bgColor: "bg-[#10b981]/10" },
    { label: "Active Incidents", value: String(activeIncidents.length || "—"), change: activeIncidents.length > 0 ? "Needs Attention" : "All Clear", icon: AlertTriangle, color: activeIncidents.length > 0 ? "text-amber-400" : "text-[#10b981]", bgColor: activeIncidents.length > 0 ? "bg-amber-400/10" : "bg-[#10b981]/10" },
    { label: "Notifications", value: String(unreadCount || "0"), change: "Unread", icon: Bell, color: "text-[#a78bfa]", bgColor: "bg-[#a78bfa]/10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628]">
      {/* Header */}
      <div className="bg-[#1a1f2e]/80 backdrop-blur-lg border-b border-white/10 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-white">Admin Command Center</h1>
            <p className="text-sm text-white/60">
              Welcome, {userProfile?.displayName ?? "Admin"} — Real-time Overview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/marketplace/admin")} variant="outline" size="sm"
              className="border-[#10b981]/50 text-[#10b981] hover:bg-[#10b981]/10 hidden md:flex">
              <ShoppingBag className="h-4 w-4 mr-1.5" /> Marketplace
            </Button>
            <Button onClick={() => navigate("/operations")} variant="outline" size="sm"
              className="border-[#0ea5e9]/50 text-[#0ea5e9] hover:bg-[#0ea5e9]/10 hidden md:flex">
              <BarChart3 className="h-4 w-4 mr-1.5" /> Operations
            </Button>
            <NotificationBell />
            <Button onClick={() => navigate("/settings")} variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <Settings className="h-5 w-5" />
            </Button>
            <Button onClick={logout} variant="ghost" size="icon" className="text-white/40 hover:text-red-400">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`rounded-xl ${stat.bgColor} p-2.5`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge className="bg-white/5 text-white/50 border-white/10 text-xs">{stat.change}</Badge>
              </div>
              <p className="text-2xl text-white">{stat.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Live Crowd Analytics</h3>
              <Badge className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse mr-1.5" />
                Live
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={crowdData}>
                <defs>
                  <linearGradient id="adminCrowdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Area key="crowd-area" type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fill="url(#adminCrowdGrad)" name="Attendees" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
            <h3 className="text-white mb-4">Zone Capacity (%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={zoneData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis dataKey="zone" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Bar key="zone-bar" dataKey="capacity" radius={[6, 6, 0, 0]} name="Capacity %">
                  {zoneData.map((_, index) => (
                    <Cell key={`zone-cell-${index}`} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Live Incident Feed */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="text-white">Active Incidents</h3>
              {activeIncidents.length > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{activeIncidents.length}</Badge>
              )}
            </div>
            <Button onClick={() => navigate("/community-signal")} variant="ghost" size="sm" className="text-[#0ea5e9]">
              View All
            </Button>
          </div>

          {loadingIncidents ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" /></div>
          ) : activeIncidents.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active incidents — all clear</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeIncidents.map((inc) => (
                <div key={inc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/7 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${priorityColor[inc.priority] ?? 'bg-white/30'} ${inc.priority === 'critical' ? 'animate-pulse' : ''}`} />
                    <div>
                      <p className="text-sm text-white">{inc.title}</p>
                      <p className="text-xs text-white/50">{inc.location?.zone}{inc.location?.building ? ` — ${inc.location.building}` : ''}</p>
                      <p className="text-xs text-white/30 mt-0.5">{formatDistanceToNow(inc.createdAt, { addSuffix: true })}</p>
                    </div>
                  </div>
                  <Badge className={`${statusBadge[inc.status] ?? statusBadge.reported} border text-xs`}>
                    {inc.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Activity, label: "Live Operations", sub: "Real-time center", color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/10", path: "/operations" },
            { icon: MessageSquare, label: "Broadcasts", sub: "Send announcement", color: "text-[#10b981]", bg: "bg-[#10b981]/10", path: "/communications" },
            { icon: Shield, label: "Emergency", sub: "Coordination", color: "text-red-400", bg: "bg-red-400/10", path: "/emergency" },
            { icon: QrCode, label: "QR Identity", sub: "Child safety", color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10", path: "/qr-identity" },
            { icon: Brain, label: "AI Insights", sub: "Operational AI", color: "text-amber-400", bg: "bg-amber-400/10", path: "/ai-assistant" },
            { icon: ShoppingBag, label: "Marketplace", sub: "Admin panel", color: "text-cyan-400", bg: "bg-cyan-400/10", path: "/marketplace/admin" },
            { icon: Truck, label: "Logistics", sub: "Deliveries", color: "text-[#10b981]", bg: "bg-[#10b981]/10", path: "/logistics" },
            { icon: TrendingUp, label: "Signals", sub: "Community reports", color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/10", path: "/community-signal" },
          ].map(({ icon: Icon, label, sub, color, bg, path }) => (
            <Card key={label} onClick={() => navigate(path)}
              className="cursor-pointer bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-5 hover:border-white/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <div className={`rounded-lg ${bg} p-2.5 w-fit mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-sm text-white">{label}</p>
              <p className="text-xs text-white/50 mt-0.5">{sub}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
