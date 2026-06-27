import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Activity,
  MapPin,
  AlertTriangle,
  Users,
  Truck,
  Radio,
  Brain,
  Shield,
  TrendingUp,
  Clock,
  Zap,
  ScanLine,
} from "lucide-react";
import { motion } from "motion/react";

export function OperationsCenter() {
  const navigate = useNavigate();

  const liveAlerts = [
    {
      id: 1,
      type: "Medical Emergency",
      location: "Main Hall - Section C",
      priority: "high",
      time: "5 min ago",
      responders: 3,
      status: "Active",
    },
    {
      id: 2,
      type: "Traffic Congestion",
      location: "Gate A",
      priority: "medium",
      time: "12 min ago",
      responders: 2,
      status: "Monitoring",
    },
  ];

  const activeZones = [
    { name: "Main Sanctuary", status: "operational", capacity: 85, attendees: 10850 },
    { name: "North Wing", status: "operational", capacity: 62, attendees: 4960 },
    { name: "South Wing", status: "operational", capacity: 48, attendees: 3840 },
    { name: "Parking Lot A", status: "full", capacity: 98, attendees: 980 },
  ];

  const aiRecommendations = [
    {
      type: "routing",
      message: "Redirect incoming traffic from Gate A to Gate C to reduce congestion",
      priority: "high",
    },
    {
      type: "resource",
      message: "Deploy 2 additional volunteers to Main Hall for crowd management",
      priority: "medium",
    },
    {
      type: "communication",
      message: "Send parking update to attendees within 5km radius",
      priority: "low",
    },
  ];

  const operationalStats = [
    { label: "System Status", value: "Optimal", icon: Activity, color: "text-[#059669]" },
    { label: "Response Time", value: "1.8 min", icon: Clock, color: "text-[#5B4FE8]" },
    { label: "Active Responders", value: "47", icon: Users, color: "text-[#5B4FE8]" },
    { label: "Efficiency", value: "94%", icon: TrendingUp, color: "text-[#059669]" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white">
      {/* Command Center Header */}
      <div className="bg-white backdrop-blur-lg border-b border-[#E5E7EB] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="text-[#6B7280] hover:text-[#0D0D0D]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl text-[#0D0D0D]">Operations Command Center</h1>
                <Badge className="bg-[#10b981]/20 text-[#059669] border-[#10b981]/30">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  Live
                </Badge>
              </div>
              <p className="text-sm text-[#6B7280]">Real-time coordination & monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#0ea5e9]/20 text-[#5B4FE8] border-[#5B4FE8]/30">
              12:47 PM
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Operational Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {operationalStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-[#F8F9FF] p-2`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg text-[#0D0D0D]">{stat.value}</p>
                    <p className="text-xs text-[#6B7280]">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Live Alerts */}
        <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg text-[#0D0D0D]">Live Emergency Alerts</h2>
            <Badge className="bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30">
              {liveAlerts.length} Active
            </Badge>
          </div>
          <div className="space-y-3">
            {liveAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-5 rounded-lg border ${
                  alert.priority === "high"
                    ? "bg-[#ef4444]/10 border-[#ef4444]/30"
                    : "bg-[#f59e0b]/10 border-[#f59e0b]/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-3 w-3 rounded-full mt-1 ${
                        alert.priority === "high" ? "bg-[#ef4444]" : "bg-[#f59e0b]"
                      } animate-pulse`}
                    />
                    <div>
                      <h3 className="text-[#0D0D0D] mb-1">{alert.type}</h3>
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <MapPin className="h-3 w-3" />
                        <span>{alert.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      alert.priority === "high"
                        ? "bg-[#ef4444] text-[#0D0D0D]"
                        : "bg-[#f59e0b] text-[#0D0D0D]"
                    }
                  >
                    {alert.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{alert.responders} responders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-[#0D0D0D] hover:bg-[#F3F4F6]">
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Zone Status Grid */}
        <div>
          <h2 className="text-lg text-[#0D0D0D] mb-4">Zone Status Board</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeZones.map((zone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[#EDE9FE] p-2">
                        <MapPin className="h-5 w-5 text-[#5B4FE8]" />
                      </div>
                      <div>
                        <h3 className="text-[#0D0D0D]">{zone.name}</h3>
                        <p className="text-xs text-[#6B7280]">
                          {zone.attendees.toLocaleString()} attendees
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        zone.status === "operational"
                          ? "bg-[#10b981]/20 text-[#059669] border-[#10b981]/30"
                          : "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30"
                      }
                    >
                      {zone.capacity}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        zone.capacity > 80
                          ? "bg-[#ef4444]"
                          : zone.capacity > 60
                          ? "bg-[#f59e0b]"
                          : "bg-[#10b981]"
                      }`}
                      style={{ width: `${zone.capacity}%` }}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <Card className="bg-gradient-to-br from-[#a78bfa]/10 to-[#1a1f2e] border-[#a78bfa]/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#a78bfa]/20 p-3">
              <Brain className="h-6 w-6 text-[#5B4FE8]" />
            </div>
            <div>
              <h2 className="text-lg text-[#0D0D0D]">AI Operational Insights</h2>
              <p className="text-sm text-[#6B7280]">Real-time intelligent recommendations</p>
            </div>
          </div>
          <div className="space-y-3">
            {aiRecommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-3 p-4 bg-[#F8F9FF] rounded-lg"
              >
                <Zap
                  className={`h-5 w-5 mt-0.5 ${
                    rec.priority === "high"
                      ? "text-[#ef4444]"
                      : rec.priority === "medium"
                      ? "text-[#f59e0b]"
                      : "text-[#5B4FE8]"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-[#0D0D0D]">{rec.message}</p>
                  <Badge
                    className={`mt-2 ${
                      rec.priority === "high"
                        ? "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30"
                        : rec.priority === "medium"
                        ? "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30"
                        : "bg-[#0ea5e9]/20 text-[#5B4FE8] border-[#5B4FE8]/30"
                    }`}
                  >
                    {rec.priority} priority
                  </Badge>
                </div>
                <Button size="sm" variant="ghost" className="text-[#0D0D0D] hover:bg-[#F3F4F6]">
                  Execute
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Radio, label: "Broadcast", color: "text-[#059669]", path: "/admin?tab=broadcast" },
            { icon: Shield, label: "Emergency", color: "text-[#ef4444]", path: "/emergency" },
            { icon: ScanLine, label: "Scan QR Tag", color: "text-[#5B4FE8]", path: "/qr-identity?tab=scan" },
            { icon: Truck, label: "Crowd Mgmt", color: "text-[#5B4FE8]", path: "/crowd-management" },
          ].map((action, index) => (
            <Card
              key={index}
              onClick={() => navigate(action.path)}
              className="cursor-pointer bg-white backdrop-blur-lg border-[#E5E7EB] p-4 hover:border-[#E5E7EB] transition-all active:scale-95"
            >
              <div className="flex flex-col items-center gap-2">
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-sm text-[#0D0D0D]">{action.label}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
