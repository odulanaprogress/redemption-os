import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Home, Brain, Navigation, Bell, User, Radio, AlertTriangle,
  ShieldAlert, MapPin, Users, Clock, Activity, ShoppingBag,
  QrCode, LogOut, Baby, MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationBell } from "../components/NotificationBell";
import { formatDistanceToNow } from "date-fns";

// ── Attendee quick actions ────────────────────────────────────────────────────
const ATTENDEE_ACTIONS = [
  { icon: Brain,        label: "AI Assistant",      description: "Ask anything",       route: "/ai-assistant",      color: "bg-[#0ea5e9]", glow: "shadow-[0_0_15px_rgba(14,165,233,0.2)]" },
  { icon: Navigation,   label: "Smart Navigation",  description: "Find your way",      route: "/navigation",        color: "bg-[#a78bfa]", glow: "shadow-[0_0_15px_rgba(167,139,250,0.2)]" },
  { icon: Radio,        label: "Gospel Feed",       description: "Live sermon",        route: "/gospel-feed",       color: "bg-[#10b981]", glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  { icon: ShoppingBag,  label: "Marketplace",       description: "Verified vendors",   route: "/marketplace",       color: "bg-amber-500", glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
  { icon: MessageSquare,label: "Communications",    description: "Broadcasts & chat",  route: "/communications",    color: "bg-[#06b6d4]", glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]" },
  { icon: AlertTriangle,label: "Report Issue",      description: "Community signal",   route: "/community-signal",  color: "bg-amber-600", glow: "shadow-[0_0_15px_rgba(217,119,6,0.2)]" },
];

// ── Parent quick actions ──────────────────────────────────────────────────────
const PARENT_ACTIONS = [
  { icon: QrCode,       label: "QR Identity",       description: "Child safety tags",  route: "/qr-identity",       color: "bg-[#0ea5e9]", glow: "shadow-[0_0_15px_rgba(14,165,233,0.2)]" },
  { icon: Baby,         label: "Family Members",     description: "Manage your family", route: "/qr-identity",       color: "bg-[#10b981]", glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  { icon: Navigation,   label: "Smart Navigation",   description: "Find your way",     route: "/navigation",        color: "bg-[#a78bfa]", glow: "shadow-[0_0_15px_rgba(167,139,250,0.2)]" },
  { icon: Radio,        label: "Gospel Feed",        description: "Live sermon",       route: "/gospel-feed",       color: "bg-amber-500", glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
  { icon: ShoppingBag,  label: "Marketplace",        description: "Verified vendors",  route: "/marketplace",       color: "bg-[#06b6d4]", glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]" },
  { icon: MessageSquare,label: "Communications",     description: "Broadcasts & updates",route: "/communications",  color: "bg-[#8b5cf6]", glow: "shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
];

export function AttendeeDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();

  const isParent = userProfile?.role === "parent";
  const quickActions = isParent ? PARENT_ACTIONS : ATTENDEE_ACTIONS;
  const recentNotifs = notifications.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white pb-20">
      {/* Header */}
      <div className="bg-white backdrop-blur-lg border-b border-[#E5E7EB] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-[#0D0D0D]">
              Welcome{userProfile?.displayName ? `, ${userProfile.displayName.split(" ")[0]}` : " Back"}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={`text-xs border-0 ${isParent ? "bg-[#10b981]/20 text-[#059669]" : "bg-[#0ea5e9]/20 text-[#5B4FE8]"}`}>
                {isParent ? "Parent / Guardian" : "Attendee"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button onClick={() => navigate("/settings")} variant="ghost" size="icon" className="text-[#6B7280] hover:text-[#0D0D0D]">
              <User className="h-5 w-5" />
            </Button>
            <Button onClick={logout} variant="ghost" size="icon" className="text-[#9CA3AF] hover:text-red-400">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* Parent: QR Identity Banner */}
        {isParent && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              onClick={() => navigate("/qr-identity")}
              className="cursor-pointer bg-gradient-to-br from-[#0ea5e9]/20 to-[#10b981]/10 border-[#5B4FE8]/30 p-5 hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-[#0ea5e9]/20 p-3">
                  <QrCode className="h-7 w-7 text-[#5B4FE8]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-[#0D0D0D] font-semibold">Child Safety QR Tags</h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">Register your children & generate their safety QR codes</p>
                </div>
                <Badge className="bg-[#0ea5e9]/20 text-[#5B4FE8] border-[#5B4FE8]/30 text-xs shrink-0">Tap to open</Badge>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Attendee: Live Event Status */}
        {!isParent && (
          <Card className="bg-gradient-to-br from-[#10b981]/20 to-[#1a1f2e] border-[#10b981]/30 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-[#10b981] animate-pulse" />
                <div>
                  <h2 className="text-lg text-[#0D0D0D]">Sunday Service — Live</h2>
                  <p className="text-sm text-[#6B7280]">Main Sanctuary</p>
                </div>
              </div>
              <Badge className="bg-[#10b981]/20 text-[#059669] border-[#10b981]/30">Live</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#6B7280]">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>Started 12:05 PM</span></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>12,847 attending</span></div>
            </div>
            <Button onClick={() => navigate("/gospel-feed")} className="mt-4 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#059669] border border-[#10b981]/30 w-full">
              <Radio className="h-4 w-4 mr-2" /> Join Live Feed
            </Button>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="mb-4 text-[#0D0D0D]">{isParent ? "Family Tools" : "Quick Actions"}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
                <Card
                  onClick={() => navigate(action.route)}
                  className={`cursor-pointer bg-white backdrop-blur-lg border-[#E5E7EB] p-4 hover:scale-105 transition-all duration-200 ${action.glow} hover:border-[#E5E7EB]`}
                >
                  <div className={`mb-3 inline-flex rounded-xl ${action.color} p-2.5`}>
                    <action.icon className="h-5 w-5 text-[#0D0D0D]" />
                  </div>
                  <h4 className="text-[#0D0D0D] text-sm mb-0.5">{action.label}</h4>
                  <p className="text-xs text-[#6B7280]">{action.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Emergency Actions — both roles */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            onClick={() => navigate("/community-signal")}
            className="cursor-pointer bg-white backdrop-blur-lg border-amber-500/30 p-4 hover:scale-105 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2"><AlertTriangle className="h-5 w-5 text-amber-400" /></div>
              <div><h4 className="text-sm text-[#0D0D0D]">Report Issue</h4><p className="text-xs text-[#6B7280]">Quick report</p></div>
            </div>
          </Card>
          <Card
            onClick={() => navigate("/emergency")}
            className="cursor-pointer bg-white backdrop-blur-lg border-red-500/30 p-4 hover:scale-105 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2"><ShieldAlert className="h-5 w-5 text-red-400" /></div>
              <div><h4 className="text-sm text-[#0D0D0D]">Emergency SOS</h4><p className="text-xs text-[#6B7280]">Instant help</p></div>
            </div>
          </Card>
        </div>

        {/* Live Notifications Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[#0D0D0D]">Live Updates</h3>
              {unreadCount > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">{unreadCount} new</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/communications")} className="text-[#5B4FE8]">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentNotifs.length > 0 ? recentNotifs.map((notif, i) => (
              <motion.div key={notif.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className={`bg-white backdrop-blur-lg border-[#E5E7EB] p-4 ${!notif.read ? 'border-l-2 border-l-[#0ea5e9]' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-[#EDE9FE] p-2 shrink-0"><Activity className="h-4 w-4 text-[#5B4FE8]" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0D0D0D]">{notif.title}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">{notif.message}</p>
                      <p className="text-xs text-[#9CA3AF] mt-1">{formatDistanceToNow(notif.createdAt, { addSuffix: true })}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )) : [
              { icon: Activity, message: "Service starting in 15 minutes", time: "Just now" },
              { icon: MapPin, message: "Main Hall — Low crowd density", time: "5 min ago" },
              { icon: Users, message: "12,847 attendees checked in", time: "10 min ago" },
            ].map((n, i) => (
              <Card key={i} className="bg-white backdrop-blur-lg border-[#E5E7EB] p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#EDE9FE] p-2 shrink-0"><n.icon className="h-4 w-4 text-[#5B4FE8]" /></div>
                  <div><p className="text-sm text-[#0D0D0D]">{n.message}</p><p className="text-xs text-[#9CA3AF] mt-1">{n.time}</p></div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Crowd Status — Attendee only */}
        {!isParent && (
          <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-4">
            <h4 className="text-[#0D0D0D] mb-3">Current Crowd Status</h4>
            {[
              { label: "Main Hall", percent: 85, level: "High",   color: "from-red-500 to-orange-400" },
              { label: "Hall B",    percent: 40, level: "Low",    color: "from-[#10b981] to-[#0ea5e9]" },
              { label: "Gate A",   percent: 78, level: "Medium", color: "from-amber-400 to-orange-400" },
            ].map(({ label, percent, level, color }) => (
              <div key={label} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-[#6B7280]">{label}</span>
                  <span className={`text-xs ${percent > 75 ? "text-red-400" : percent > 50 ? "text-amber-400" : "text-[#059669]"}`}>
                    {level} — {percent}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white backdrop-blur-lg border-t border-[#E5E7EB] px-2 py-3 z-20">
        <div className="flex items-center justify-around">
          {(isParent ? [
            { icon: Home,         label: "Home",     route: "/dashboard",      active: true },
            { icon: QrCode,       label: "QR Tags",  route: "/qr-identity" },
            { icon: ShoppingBag,  label: "Market",   route: "/marketplace" },
            { icon: Bell,         label: `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ""}`, route: "/communications" },
            { icon: User,         label: "Profile",  route: "/settings" },
          ] : [
            { icon: Home,         label: "Home",     route: "/dashboard",      active: true },
            { icon: Brain,        label: "AI",       route: "/ai-assistant" },
            { icon: Navigation,   label: "Navigate", route: "/navigation" },
            { icon: Bell,         label: `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ""}`, route: "/communications" },
            { icon: User,         label: "Profile",  route: "/settings" },
          ]).map((item) => (
            <button key={item.label} onClick={() => navigate(item.route)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative ${
                item.active ? "text-[#5B4FE8]" : "text-[#9CA3AF] hover:text-[#6B7280]"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
