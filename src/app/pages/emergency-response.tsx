import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  ShieldAlert,
  Phone,
  MapPin,
  Clock,
  Users,
  Navigation,
  AlertTriangle,
} from "lucide-react";
import { motion } from "motion/react";

export function EmergencyResponse() {
  const navigate = useNavigate();
  const [sosActivated, setSosActivated] = useState(false);

  const handleSOS = () => {
    setSosActivated(true);
  };

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
          <div>
            <h1 className="text-lg text-white">Emergency Response</h1>
            <p className="text-sm text-white/60">Instant help & coordination</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {!sosActivated ? (
          <>
            {/* SOS Button */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center py-8"
            >
              <button
                onClick={handleSOS}
                className="relative h-48 w-48 rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] shadow-[0_0_50px_rgba(239,68,68,0.5)] hover:shadow-[0_0_70px_rgba(239,68,68,0.7)] transition-all active:scale-95"
              >
                <div className="absolute inset-4 rounded-full border-4 border-white/30 animate-ping" />
                <div className="relative flex flex-col items-center justify-center h-full">
                  <ShieldAlert className="h-16 w-16 text-white mb-2" />
                  <span className="text-xl font-bold text-white">SOS</span>
                  <span className="text-xs text-white/80">Tap for Emergency</span>
                </div>
              </button>
            </motion.div>

            <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
              <h3 className="text-white mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 text-white hover:bg-white/10"
                >
                  <Phone className="h-4 w-4 mr-3 text-[#10b981]" />
                  Security: +1 (555) 911-0000
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 text-white hover:bg-white/10"
                >
                  <Phone className="h-4 w-4 mr-3 text-[#ef4444]" />
                  Medical: +1 (555) 911-0001
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 text-white hover:bg-white/10"
                >
                  <Phone className="h-4 w-4 mr-3 text-[#0ea5e9]" />
                  Operations: +1 (555) 911-0002
                </Button>
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* SOS Activated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-[#ef4444]/20 to-[#1a1f2e] border-[#ef4444] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-4 w-4 rounded-full bg-[#ef4444] animate-pulse" />
                  <h2 className="text-xl text-white">SOS Activated</h2>
                </div>
                <p className="text-white/80 mb-4">
                  Help is on the way. Stay where you are.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#ef4444]" />
                    <div>
                      <p className="text-xs text-white/60">ETA</p>
                      <p className="text-sm text-white">2 min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#ef4444]" />
                    <div>
                      <p className="text-xs text-white/60">Responders</p>
                      <p className="text-sm text-white">3 en route</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Location */}
            <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
              <h3 className="text-white mb-4">Your Location</h3>
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                <MapPin className="h-5 w-5 text-[#0ea5e9] mt-0.5" />
                <div>
                  <p className="text-sm text-white">Main Hall, Section B</p>
                  <p className="text-xs text-white/60">Row 15, Seat 8</p>
                </div>
              </div>
            </Card>

            {/* Responders */}
            <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
              <h3 className="text-white mb-4">Responders Dispatched</h3>
              <div className="space-y-3">
                {[
                  { name: "Security Team Alpha", eta: "2 min", distance: "120m" },
                  { name: "Medical Unit 1", eta: "3 min", distance: "180m" },
                  { name: "Coordinator", eta: "2 min", distance: "95m" },
                ].map((responder, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                      <div>
                        <p className="text-sm text-white">{responder.name}</p>
                        <p className="text-xs text-white/60">{responder.distance} away</p>
                      </div>
                    </div>
                    <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
                      {responder.eta}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Button
              onClick={() => setSosActivated(false)}
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/10"
            >
              Cancel Emergency
            </Button>
          </>
        )}

        {/* Live Alerts */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white mb-4">Live Emergency Alerts</h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#f59e0b]/10 rounded-lg border border-[#f59e0b]/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-[#f59e0b] mt-0.5" />
                <div>
                  <p className="text-sm text-white">Weather Advisory</p>
                  <p className="text-xs text-white/60">Light rain expected at 3 PM</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
