import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Home, Brain, Navigation, Bell, User, Radio, AlertTriangle,
  ShieldAlert, MapPin, Users, Clock, Activity, ShoppingBag,
  QrCode, LogOut, Baby, MessageSquare, ChevronLeft, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationBell } from "../components/NotificationBell";
import { formatDistanceToNow } from "date-fns";
import { messageService, Broadcast } from "../../services/message.service";
import { locationService, UserLocationDoc } from "../../services/location.service";

// ── Redemption City Gallery Slides ──────────────────────────────────────────
const GALLERY_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
    caption: "Holy Ghost Congress — Main Sanctuary, 2024",
  },
  {
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80",
    caption: "Overflow Arena — Evening Praise & Worship Session",
  },
  {
    url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
    caption: "Prayer Garden — All-Night Intercession, Redemption City",
  },
];

// ── Attendee quick actions ────────────────────────────────────────────────────
const ATTENDEE_ACTIONS = [
  { icon: Brain,         label: "AI Assistant",     description: "Ask anything",      route: "/ai-assistant",     color: "bg-[#0ea5e9]",  shadow: "hover:shadow-[0_4px_20px_rgba(14,165,233,0.45)]" },
  { icon: Navigation,    label: "Smart Navigation", description: "Find your way",     route: "/navigation",       color: "bg-[#a78bfa]",  shadow: "hover:shadow-[0_4px_20px_rgba(167,139,250,0.45)]" },
  { icon: Radio,         label: "Gospel Feed",      description: "Live sermon",       route: "/gospel-feed",      color: "bg-[#10b981]",  shadow: "hover:shadow-[0_4px_20px_rgba(16,185,129,0.45)]" },
  { icon: ShoppingBag,   label: "Marketplace",      description: "Verified vendors",  route: "/marketplace",      color: "bg-amber-500",  shadow: "hover:shadow-[0_4px_20px_rgba(245,158,11,0.45)]" },
  { icon: MessageSquare, label: "Communications",   description: "Broadcasts & chat", route: "/communications",   color: "bg-[#06b6d4]",  shadow: "hover:shadow-[0_4px_20px_rgba(6,182,212,0.45)]" },
  { icon: AlertTriangle, label: "Report Issue",     description: "Community signal",  route: "/community-signal", color: "bg-amber-600",  shadow: "hover:shadow-[0_4px_20px_rgba(217,119,6,0.45)]" },
];

// ── Parent quick actions ──────────────────────────────────────────────────────
const PARENT_ACTIONS = [
  { icon: QrCode,        label: "QR Identity",      description: "Child safety tags",    route: "/qr-identity",    color: "bg-[#0ea5e9]",  shadow: "hover:shadow-[0_4px_20px_rgba(14,165,233,0.45)]" },
  { icon: Baby,          label: "Family Members",   description: "Manage your family",   route: "/qr-identity",    color: "bg-[#10b981]",  shadow: "hover:shadow-[0_4px_20px_rgba(16,185,129,0.45)]" },
  { icon: Navigation,    label: "Smart Navigation", description: "Find your way",        route: "/navigation",     color: "bg-[#a78bfa]",  shadow: "hover:shadow-[0_4px_20px_rgba(167,139,250,0.45)]" },
  { icon: Radio,         label: "Gospel Feed",      description: "Live sermon",          route: "/gospel-feed",    color: "bg-amber-500",  shadow: "hover:shadow-[0_4px_20px_rgba(245,158,11,0.45)]" },
  { icon: ShoppingBag,   label: "Marketplace",      description: "Verified vendors",     route: "/marketplace",    color: "bg-[#06b6d4]",  shadow: "hover:shadow-[0_4px_20px_rgba(6,182,212,0.45)]" },
  { icon: MessageSquare, label: "Communications",   description: "Broadcasts & updates", route: "/communications", color: "bg-[#8b5cf6]",  shadow: "hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]" },
];

// ── Image Carousel ────────────────────────────────────────────────────────────
function RedemptionCityGallery() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
  };

  const next = () => go((current + 1) % GALLERY_SLIDES.length, 1);
  const prev = () => go((current - 1 + GALLERY_SLIDES.length) % GALLERY_SLIDES.length, -1);

  useEffect(() => {
    intervalRef.current = setInterval(next, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [current]);

  const slide = GALLERY_SLIDES[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="rounded-2xl overflow-hidden relative h-48 md:h-64 lg:h-72 bg-[#1a1f2e]">
      {/* Frosted violet badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#5B4FE8]/70 backdrop-blur-md px-3 py-1 border border-[#a78bfa]/40">
        <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
        <span className="text-white text-[11px] font-semibold tracking-wide">Redemption City</span>
      </div>

      {/* Slides */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.45, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img src={slide.url} alt={slide.caption} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="absolute bottom-10 left-4 right-4 text-white text-xs md:text-sm font-medium drop-shadow"
          >
            {slide.caption}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      <button onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 backdrop-blur-sm p-1.5 text-white hover:bg-black/50 transition">
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 backdrop-blur-sm p-1.5 text-white hover:bg-black/50 transition">
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      {/* Dot navigation */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
        {GALLERY_SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i, i > current ? 1 : -1)}
            className={`rounded-full transition-all duration-300 ${i === current ? "bg-white w-4 h-1.5" : "bg-white/40 w-1.5 h-1.5"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AttendeeDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();

  const isParent = userProfile?.role === "parent";
  const quickActions = isParent ? PARENT_ACTIONS : ATTENDEE_ACTIONS;

  const [liveBroadcasts, setLiveBroadcasts] = useState<Broadcast[]>([]);
  const [liveLocations, setLiveLocations] = useState<UserLocationDoc[]>([]);

  // Real-time Firestore subscriptions for dashboard widgets
  useEffect(() => {
    const unsubBroadcasts = messageService.subscribeToBroadcasts((data) => {
      setLiveBroadcasts(data);
    });

    const unsubLocations = locationService.subscribeToLiveLocations((locs) => {
      setLiveLocations(locs);
    });

    return () => {
      unsubBroadcasts();
      unsubLocations();
    };
  }, []);

  // Compute live occupancy rates based on real-time location stream
  const mainCount = liveLocations.filter(
    (l) => l.lat >= 6.799 && l.lat <= 6.805 && l.lng >= 3.445 && l.lng <= 3.451
  ).length;
  const youthCount = liveLocations.filter(
    (l) => l.lat >= 6.824 && l.lat <= 6.828 && l.lng >= 3.464 && l.lng <= 3.468
  ).length;
  const gateCount = liveLocations.filter(
    (l) => l.lat >= 6.825 && l.lat <= 6.829 && l.lng >= 3.460 && l.lng <= 3.464
  ).length;

  const crowdItems = [
    { label: "Main Sanctuary (3km Arena)", percent: liveLocations.length > 0 ? Math.min(95, Math.max(15, mainCount * 12 + 40)) : 72, color: "from-red-500 to-orange-400" },
    { label: "Youth Centre & Arena",       percent: liveLocations.length > 0 ? Math.min(90, Math.max(10, youthCount * 15 + 25)) : 55, color: "from-amber-400 to-orange-400" },
    { label: "Express Main Gate",          percent: liveLocations.length > 0 ? Math.min(90, Math.max(10, gateCount * 10 + 20)) : 38, color: "from-[#10b981] to-[#0ea5e9]" },
    { label: "Prayer & Meditation Garden", percent: liveLocations.length > 0 ? Math.min(85, Math.max(5, Math.round(liveLocations.length * 8 + 15))) : 22, color: "from-[#10b981] to-[#0ea5e9]" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#f3f0ff] lg:pl-16 xl:pl-20">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-[#f0edff] px-4 lg:px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            {/* Brand pill — desktop only */}
            <div className="hidden lg:flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#5B4FE8] animate-pulse" />
              <span className="text-xs font-semibold text-[#5B4FE8] tracking-widest uppercase">Redemption OS</span>
            </div>
            <h1 className="text-xl lg:text-2xl text-[#0D0D0D] font-bold">
              Welcome{userProfile?.displayName ? `, ${userProfile.displayName.split(" ")[0]}` : " Back"}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={`text-xs border-0 ${isParent ? "bg-[#10b981]/20 text-[#059669]" : "bg-[#5B4FE8]/10 text-[#5B4FE8]"}`}>
                {isParent ? "Parent / Guardian" : "Attendee"}
              </Badge>
              <span className="hidden sm:inline text-xs text-[#9CA3AF]">Holy Ghost Congress 2024</span>
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

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-8">

        {/* Desktop: two-column layout */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 xl:gap-8">

          {/* ── LEFT / MAIN COLUMN ── */}
          <div className="space-y-5">

            {/* Parent: QR Identity Banner */}
            {isParent && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Card onClick={() => navigate("/qr-identity")}
                  className="cursor-pointer bg-gradient-to-br from-[#0ea5e9]/20 to-[#10b981]/10 border-[#f0edff] p-5 hover:scale-[1.01] transition-all">
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
              <Card className="bg-gradient-to-br from-[#5B4FE8]/10 to-[#1a1f2e] border-[#f0edff] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#10b981] animate-pulse" />
                    <div>
                      <h2 className="text-lg md:text-xl text-[#0D0D0D] font-semibold">Holy Ghost Congress — Live</h2>
                      <p className="text-sm text-[#6B7280]">Main Sanctuary · Redemption City</p>
                    </div>
                  </div>
                  <Badge className="bg-[#10b981]/20 text-[#059669] border-[#10b981]/30 shrink-0">Live</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>Started 6:00 AM</span></div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>94,312 attending</span></div>
                </div>
                <Button onClick={() => navigate("/gospel-feed")}
                  className="mt-4 bg-[#5B4FE8]/20 hover:bg-[#5B4FE8]/30 text-[#5B4FE8] border border-[#5B4FE8]/30 w-full sm:w-auto">
                  <Radio className="h-4 w-4 mr-2" /> Join Live Feed
                </Button>
              </Card>
            )}

            {/* Redemption City Photo Gallery */}
            <RedemptionCityGallery />

            {/* Quick Actions */}
            <div>
              <h3 className="mb-4 text-[#0D0D0D] font-semibold text-base">{isParent ? "Family Tools" : "Quick Actions"}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
                {quickActions.map((action, i) => (
                  <motion.div key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
                    <Card onClick={() => navigate(action.route)}
                      className={`cursor-pointer bg-white border-[#f0edff] p-2.5 sm:p-4 overflow-hidden hover:scale-105 transition-all duration-200 ${action.shadow}`}>
                      <div className={`mb-2 sm:mb-3 inline-flex rounded-xl ${action.color} p-2 sm:p-2.5`}>
                        <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <h4 className="text-[#0D0D0D] text-xs sm:text-sm mb-0.5 font-medium leading-tight break-words">{action.label}</h4>
                      <p className="text-[10px] sm:text-xs text-[#6B7280] leading-tight line-clamp-2">{action.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Card onClick={() => navigate("/community-signal")}
                className="cursor-pointer bg-white border-[#f0edff] p-4 hover:scale-105 transition-all hover:shadow-[0_4px_20px_rgba(245,158,11,0.35)]">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2"><AlertTriangle className="h-5 w-5 text-amber-400" /></div>
                  <div><h4 className="text-sm text-[#0D0D0D] font-medium">Report Issue</h4><p className="text-xs text-[#6B7280]">Quick report</p></div>
                </div>
              </Card>
              <Card onClick={() => navigate("/emergency")}
                className="cursor-pointer bg-white border-[#f0edff] p-4 hover:scale-105 transition-all hover:shadow-[0_4px_20px_rgba(239,68,68,0.35)]">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-500/10 p-2"><ShieldAlert className="h-5 w-5 text-red-400" /></div>
                  <div><h4 className="text-sm text-[#0D0D0D] font-medium">Emergency SOS</h4><p className="text-xs text-[#6B7280]">Instant help</p></div>
                </div>
              </Card>
            </div>

          </div>{/* end left column */}

          {/* ── RIGHT / SIDEBAR COLUMN (lg+) ── */}
          <div className="mt-5 lg:mt-0 space-y-5">

            {/* Crowd Status */}
            {!isParent && (
              <Card className="bg-white border-[#f0edff] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[#0D0D0D] font-semibold">Current Crowd Status</h4>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                    <Activity className="h-3 w-3 mr-1 animate-pulse" />Live Stream
                  </Badge>
                </div>
                {crowdItems.map(({ label, percent, color }) => {
                  const level = percent > 75 ? "High" : percent > 50 ? "Medium" : "Low";
                  return (
                    <div key={label} className="mb-3 last:mb-0">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-[#6B7280] text-xs font-medium">{label}</span>
                        <span className={`text-xs font-medium ${percent > 75 ? "text-red-500" : percent > 50 ? "text-amber-500" : "text-emerald-600"}`}>
                          {level} — {percent}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#ede9fe] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}

            {/* Live Notifications Feed */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[#0D0D0D] font-semibold">Live Updates</h3>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">{unreadCount} new</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/communications")} className="text-[#5B4FE8]">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {notifications.length > 0 || liveBroadcasts.length > 0 ? (
                  [
                    ...notifications.map((n) => ({
                      id: n.id,
                      title: n.title,
                      message: n.message,
                      createdAt: n.createdAt,
                    })),
                    ...liveBroadcasts.map((b) => ({
                      id: b.id,
                      title: b.title,
                      message: b.message,
                      createdAt: b.createdAt,
                    })),
                  ]
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .slice(0, 3)
                    .map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                        <Card className="bg-white border-[#f0edff] p-4 border-l-2 border-l-[#5B4FE8]">
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-[#EDE9FE] p-2 shrink-0"><Activity className="h-4 w-4 text-[#5B4FE8]" /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#0D0D0D] font-medium">{item.title}</p>
                              <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{item.message}</p>
                              <p className="text-xs text-[#9CA3AF] mt-1">{formatDistanceToNow(item.createdAt, { addSuffix: true })}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                ) : (
                  [
                    { icon: Activity, message: "Holy Ghost Congress: Night session begins at 9 PM", time: "Just now" },
                    { icon: MapPin,   message: "Prayer Garden — Low crowd density, open seating", time: "5 min ago" },
                    { icon: Users,    message: "94,312 attendees currently checked in", time: "10 min ago" },
                  ].map((n, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                      <Card className="bg-white border-[#f0edff] p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-[#EDE9FE] p-2 shrink-0"><n.icon className="h-4 w-4 text-[#5B4FE8]" /></div>
                          <div>
                            <p className="text-sm text-[#0D0D0D]">{n.message}</p>
                            <p className="text-xs text-[#9CA3AF] mt-1">{n.time}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Crowd Status — mobile/tablet (shown below actions on small screens, hidden on lg where it's in sidebar) */}
            {isParent && (
              <Card className="bg-white border-[#f0edff] p-5">
                <h4 className="text-[#0D0D0D] font-semibold mb-2">Family Summary</h4>
                <p className="text-sm text-[#6B7280]">Manage registered family members and their QR safety tags from the QR Identity section.</p>
                <Button onClick={() => navigate("/qr-identity")} variant="ghost" size="sm" className="mt-3 text-[#5B4FE8] px-0">
                  Open QR Identity →
                </Button>
              </Card>
            )}

          </div>{/* end right / sidebar */}

        </div>{/* end desktop grid */}
      </div>{/* end body */}

      {/* ── Bottom Navigation (mobile + tablet only) ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#f0edff] px-2 py-2 z-20 lg:hidden">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {(isParent ? [
            { icon: Home,        label: "Home",    route: "/dashboard",   active: true },
            { icon: QrCode,      label: "QR Tags", route: "/qr-identity" },
            { icon: ShoppingBag, label: "Market",  route: "/marketplace" },
            { icon: Bell,        label: `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ""}`, route: "/communications" },
            { icon: User,        label: "Profile", route: "/settings" },
          ] : [
            { icon: Home,        label: "Home",    route: "/dashboard",   active: true },
            { icon: Brain,       label: "AI",      route: "/ai-assistant" },
            { icon: Navigation,  label: "Navigate",route: "/navigation" },
            { icon: Bell,        label: `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ""}`, route: "/communications" },
            { icon: User,        label: "Profile", route: "/settings" },
          ]).map((item) => (
            <button key={item.label} onClick={() => navigate(item.route)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors relative ${
                item.active ? "text-[#5B4FE8]" : "text-[#9CA3AF] hover:text-[#6B7280]"
              }`}>
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
              {item.active && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#5B4FE8]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop sidebar nav ── */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-16 xl:w-20 bg-white border-r border-[#f0edff] flex-col items-center py-6 gap-4 z-20">
        <div className="h-8 w-8 rounded-xl bg-[#5B4FE8] flex items-center justify-center mb-4">
          <span className="text-white text-xs font-bold">ROS</span>
        </div>
        {(isParent ? [
          { icon: Home,        label: "Home",     route: "/dashboard",   active: true },
          { icon: QrCode,      label: "QR Tags",  route: "/qr-identity" },
          { icon: ShoppingBag, label: "Market",   route: "/marketplace" },
          { icon: Bell,        label: "Alerts",   route: "/communications" },
          { icon: User,        label: "Profile",  route: "/settings" },
        ] : [
          { icon: Home,        label: "Home",     route: "/dashboard",   active: true },
          { icon: Brain,       label: "AI",       route: "/ai-assistant" },
          { icon: Navigation,  label: "Navigate", route: "/navigation" },
          { icon: Bell,        label: "Alerts",   route: "/communications" },
          { icon: User,        label: "Profile",  route: "/settings" },
        ]).map((item) => (
          <button key={item.label} onClick={() => navigate(item.route)}
            title={item.label}
            className={`group relative flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
              item.active
                ? "bg-[#5B4FE8]/10 text-[#5B4FE8]"
                : "text-[#9CA3AF] hover:text-[#5B4FE8] hover:bg-[#5B4FE8]/5"
            }`}>
            <item.icon className="h-5 w-5" />
            <span className="text-[9px] font-medium">{item.label}</span>
            {item.active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-[#5B4FE8]" />
            )}
          </button>
        ))}
        {/* Logout at bottom */}
        <div className="flex-1" />
        <button onClick={logout} title="Logout"
          className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-[#9CA3AF] hover:text-red-400 transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="text-[9px] font-medium">Logout</span>
        </button>
      </div>

    </div>
  );
}
