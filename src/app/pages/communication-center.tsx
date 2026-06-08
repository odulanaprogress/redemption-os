import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft,
  MessageSquare,
  Bell,
  Radio,
  AlertTriangle,
  Users,
  MapPin,
  Clock,
} from "lucide-react";
import { motion } from "motion/react";

export function CommunicationCenter() {
  const navigate = useNavigate();

  const announcements = [
    {
      id: 1,
      type: "operational",
      title: "Service Starting Soon",
      message: "Main service will begin in 10 minutes. Please find your seats.",
      time: "2 min ago",
      zone: "All Zones",
      icon: Radio,
      color: "text-[#0ea5e9]",
      bgColor: "bg-[#0ea5e9]/10",
    },
    {
      id: 2,
      type: "alert",
      title: "Parking Update",
      message: "Lot B is now at capacity. Please use Lot C or D.",
      time: "15 min ago",
      zone: "Parking",
      icon: AlertTriangle,
      color: "text-[#f59e0b]",
      bgColor: "bg-[#f59e0b]/10",
    },
    {
      id: 3,
      type: "info",
      title: "Volunteer Coordination",
      message: "All volunteers report to check-in stations for assignment updates.",
      time: "25 min ago",
      zone: "Volunteers",
      icon: Users,
      color: "text-[#10b981]",
      bgColor: "bg-[#10b981]/10",
    },
  ];

  const emergencyAlerts = [
    {
      id: 1,
      title: "Medical Response Active",
      location: "Main Hall, Section C",
      status: "In Progress",
      time: "5 min ago",
    },
  ];

  const zoneNotifications = [
    {
      zone: "Main Sanctuary",
      count: 3,
      lastUpdate: "Just now",
    },
    {
      zone: "North Wing",
      count: 1,
      lastUpdate: "10 min ago",
    },
    {
      zone: "Parking Area",
      count: 5,
      lastUpdate: "5 min ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628]">
      <div className="bg-[#1a1f2e]/80 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg text-white">Communication Center</h1>
            <p className="text-sm text-white/60">Real-time updates & alerts</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white/60 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#ef4444]" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a1f2e]/80 backdrop-blur-lg border border-white/10">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="zones">Zones</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl ${announcement.bgColor} p-3`}>
                      <announcement.icon className={`h-6 w-6 ${announcement.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white mb-1">{announcement.title}</h3>
                          <p className="text-sm text-white/60">{announcement.message}</p>
                        </div>
                        <Badge className="bg-white/5 text-white/60 border-white/10">
                          {announcement.zone}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Clock className="h-3 w-3" />
                        <span>{announcement.time}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <Card className="bg-gradient-to-br from-[#ef4444]/20 to-[#1a1f2e] border-[#ef4444]/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-[#ef4444] animate-pulse" />
                <h2 className="text-lg text-white">Active Emergency Alerts</h2>
              </div>
              {emergencyAlerts.map((alert) => (
                <div key={alert.id} className="space-y-3">
                  <div>
                    <h3 className="text-white mb-2">{alert.title}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <MapPin className="h-4 w-4" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Clock className="h-4 w-4" />
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">
                    {alert.status}
                  </Badge>
                </div>
              ))}
            </Card>

            <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
              <h3 className="text-white mb-4">Recent Emergency Updates</h3>
              <p className="text-sm text-white/60">No recent emergency updates</p>
            </Card>
          </TabsContent>

          <TabsContent value="zones" className="space-y-4">
            <div className="grid gap-4">
              {zoneNotifications.map((zone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[#0ea5e9]/10 p-3">
                          <MapPin className="h-5 w-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                          <h3 className="text-white">{zone.zone}</h3>
                          <p className="text-xs text-white/60">Updated {zone.lastUpdate}</p>
                        </div>
                      </div>
                      <Badge className="bg-[#0ea5e9]/20 text-[#0ea5e9] border-[#0ea5e9]/30">
                        {zone.count} updates
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Communication Analytics */}
        <Card className="mt-6 bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white mb-4">Today's Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl text-white mb-1">127</p>
              <p className="text-xs text-white/60">Announcements</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-white mb-1">18</p>
              <p className="text-xs text-white/60">Zones Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-white mb-1">2</p>
              <p className="text-xs text-white/60">Emergencies</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
