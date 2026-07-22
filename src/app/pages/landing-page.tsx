import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { motion } from "motion/react";
import {
  Brain,
  Radio,
  Navigation,
  Shield,
  MessageSquare,
  Truck,
  Users,
  Activity,
  MapPin,
  Zap,
  Heart,
  Globe,
} from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  const stats = [
    { label: "Active Attendees", value: "12,847", icon: Users, pulse: true },
    { label: "Live Events", value: "3", icon: Activity, pulse: true },
    { label: "Active Volunteers", value: "284", icon: Heart },
    { label: "Real-time Zones", value: "18", icon: MapPin },
  ];

  const features = [
    {
      icon: Brain,
      title: "AI Assistant",
      description:
        "Intelligent contextual guidance for navigation, worship, and operational needs",
      color: "text-[#5B4FE8]",
      glow: "shadow-[0_0_15px_rgba(14,165,233,0.3)]",
    },
    {
      icon: Radio,
      title: "Live Gospel Feed",
      description:
        "Real-time sermon transcription with scripture highlighting and translations",
      color: "text-[#059669]",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    },
    {
      icon: Navigation,
      title: "Smart Navigation",
      description:
        "AI-powered crowd-aware routing with real-time density heatmaps",
      color: "text-[#5B4FE8]",
      glow: "shadow-[0_0_15px_rgba(167,139,250,0.3)]",
    },
    {
      icon: Shield,
      title: "Emergency Response",
      description:
        "Instant SOS coordination with live responder tracking and alerts",
      color: "text-[#ef4444]",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    },
    {
      icon: MessageSquare,
      title: "Communication Center",
      description:
        "Zone-based announcements and real-time operational notifications",
      color: "text-[#f59e0b]",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    },
    {
      icon: Truck,
      title: "Smart Logistics",
      description:
        "AI-optimized delivery coordination and volunteer dispatch system",
      color: "text-[#06b6d4]",
      glow: "shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Globe className="h-6 w-6 text-[#5B4FE8]" />
            <span className="font-bold text-lg text-[#0D0D0D]">Redemption OS</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              className="text-[#0D0D0D] hover:text-[#5B4FE8]"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] hover:opacity-90 text-white font-semibold shadow-sm"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mb-6 flex items-center justify-center gap-2">
              <Globe className="h-8 w-8 text-[#5B4FE8]" />
              <h1 className="bg-gradient-to-r from-[#0ea5e9] via-[#10b981] to-[#a78bfa] bg-clip-text text-4xl md:text-6xl font-bold text-transparent">
                Redemption OS
              </h1>
            </div>

            <p className="mx-auto mb-4 max-w-3xl text-xl md:text-3xl text-[#111827]">
              Intelligent Infrastructure for Worship, Safety & Real-Time
              Coordination
            </p>

            <p className="mx-auto mb-12 max-w-2xl text-[#6B7280]">
              An intelligent real-time platform designed for large religious
              environments and smart gathering ecosystems. Experience the future
              of worship accessibility and operational excellence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] hover:opacity-90 text-white px-8 py-6 text-lg font-semibold shadow-[0_0_25px_rgba(91,79,232,0.4)]"
              >
                <Zap className="mr-2 h-5 w-5" />
                Sign Up
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="border-[#5B4FE8]/40 text-[#0D0D0D] hover:bg-[#EDE9FE] px-8 py-6 text-lg font-semibold"
              >
                Login
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-xl bg-[#EDE9FE] p-3 ${
                        stat.pulse ? "animate-pulse" : ""
                      }`}
                    >
                      <stat.icon className="h-6 w-6 text-[#5B4FE8]" />
                    </div>
                    <div>
                      <div className="text-2xl text-[#0D0D0D]">{stat.value}</div>
                      <div className="text-sm text-[#6B7280]">{stat.label}</div>
                    </div>
                  </div>
                  {stat.pulse && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                      <span className="text-xs text-[#059669]">Live</span>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl md:text-4xl text-[#0D0D0D]">
              Smart Ecosystem Features
            </h2>
            <p className="mx-auto max-w-2xl text-[#6B7280]">
              Comprehensive tools for worship accessibility, emergency
              coordination, and intelligent logistics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`group bg-white backdrop-blur-lg border-[#E5E7EB] p-6 hover:border-[#E5E7EB] transition-all duration-300 ${feature.glow} hover:scale-105`}
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-3`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="mb-2 text-xl text-[#0D0D0D]">{feature.title}</h3>
                  <p className="text-[#6B7280]">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Worship Accessibility Highlight */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0a1628] border-[#10b981]/30 p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
                  <Radio className="h-4 w-4 text-[#059669]" />
                  <span className="text-sm text-[#059669]">
                    Worship Accessibility
                  </span>
                </div>
                <h2 className="mb-4 text-3xl md:text-4xl text-[#0D0D0D]">
                  Experience Worship Like Never Before
                </h2>
                <p className="mb-6 text-[#6B7280]">
                  Real-time sermon transcription, scripture highlighting,
                  multi-language support, and note-taking capabilities ensure
                  everyone can engage meaningfully with the message.
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#10b981] hover:bg-[#059669] text-[#0D0D0D]"
                >
                  Explore Gospel Feed
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/20 to-transparent rounded-2xl blur-3xl" />
                <Card className="relative bg-[#F8F9FF]/80 backdrop-blur border-[#10b981]/20 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="text-sm text-[#059669]">
                      Live Streaming
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-[#F3F4F6] rounded w-full" />
                    <div className="h-4 bg-[#F3F4F6] rounded w-4/5" />
                    <div className="h-4 bg-[#10b981]/20 rounded w-3/5" />
                    <div className="h-4 bg-[#F3F4F6] rounded w-full" />
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Emergency Coordination */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0a1628] border-[#ef4444]/30 p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ef4444]/20 to-transparent rounded-2xl blur-3xl" />
                <Card className="relative bg-[#F8F9FF]/80 backdrop-blur border-[#ef4444]/20 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#ef4444]" />
                      <span className="text-[#0D0D0D]">Emergency Active</span>
                    </div>
                    <span className="text-sm text-[#059669]">ETA: 2 min</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[#ef4444]/10 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-[#ef4444] animate-pulse" />
                      <span className="text-sm text-[#4B5563]">
                        Medical Emergency - Hall B
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#F8F9FF] rounded-lg">
                      <Users className="h-4 w-4 text-[#5B4FE8]" />
                      <span className="text-sm text-[#6B7280]">
                        3 responders dispatched
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ef4444]/10 px-4 py-2">
                  <Shield className="h-4 w-4 text-[#ef4444]" />
                  <span className="text-sm text-[#ef4444]">
                    Emergency Response
                  </span>
                </div>
                <h2 className="mb-4 text-3xl md:text-4xl text-[#0D0D0D]">
                  Safety & Coordination at Scale
                </h2>
                <p className="mb-6 text-[#6B7280]">
                  Instant SOS activation, intelligent responder dispatch,
                  real-time tracking, and zone-based emergency alerts ensure
                  rapid response in critical situations.
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-[#0D0D0D]"
                >
                  Learn About Safety
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-[#5B4FE8]" />
              <span className="text-[#0D0D0D]">Redemption OS</span>
            </div>
            <p className="text-sm text-[#9CA3AF]">
              © 2026 Redemption OS. Intelligent Infrastructure for Worship &
              Safety.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
