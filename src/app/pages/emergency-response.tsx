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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white">
      <div className="bg-white backdrop-blur-lg border-b border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-[#6B7280] hover:text-[#0D0D0D]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg text-[#0D0D0D]">Emergency Response</h1>
            <p className="text-sm text-[#6B7280]">Instant help & coordination</p>
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
                <div className="absolute inset-4 rounded-full border-4 border-[#E5E7EB] animate-ping" />
                <div className="relative flex flex-col items-center justify-center h-full">
                  <ShieldAlert className="h-16 w-16 text-[#0D0D0D] mb-2" />
                  <span className="text-xl font-bold text-[#0D0D0D]">SOS</span>
                  <span className="text-xs text-[#4B5563]">Tap for Emergency</span>
                </div>
              </button>
            </motion.div>

            <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
              <h3 className="text-[#0D0D0D] mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]"
                >
                  <Phone className="h-4 w-4 mr-3 text-[#059669]" />
                  Security: +1 (555) 911-0000
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]"
                >
                  <Phone className="h-4 w-4 mr-3 text-[#ef4444]" />
                  Medical: +1 (555) 911-0001
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]"
                >
                  <Phone className="h-4 w-4 mr-3 text-[#5B4FE8]" />
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
                  <h2 className="text-xl text-[#0D0D0D]">SOS Activated</h2>
                </div>
                <p className="text-[#4B5563] mb-4">
                  Help is on the way. Stay where you are.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#ef4444]" />
                    <div>
                      <p className="text-xs text-[#6B7280]">ETA</p>
                      <p className="text-sm text-[#0D0D0D]">2 min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#ef4444]" />
                    <div>
                      <p className="text-xs text-[#6B7280]">Responders</p>
                      <p className="text-sm text-[#0D0D0D]">3 en route</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Location */}
            <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
              <h3 className="text-[#0D0D0D] mb-4">Your Location</h3>
              <div className="flex items-start gap-3 p-4 bg-[#F8F9FF] rounded-lg">
                <MapPin className="h-5 w-5 text-[#5B4FE8] mt-0.5" />
                <div>
                  <p className="text-sm text-[#0D0D0D]">Main Hall, Section B</p>
                  <p className="text-xs text-[#6B7280]">Row 15, Seat 8</p>
                </div>
              </div>
            </Card>

            {/* Responders */}
            <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
              <h3 className="text-[#0D0D0D] mb-4">Responders Dispatched</h3>
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
                    className="flex items-center justify-between p-3 bg-[#F8F9FF] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                      <div>
                        <p className="text-sm text-[#0D0D0D]">{responder.name}</p>
                        <p className="text-xs text-[#6B7280]">{responder.distance} away</p>
                      </div>
                    </div>
                    <Badge className="bg-[#10b981]/20 text-[#059669] border-[#10b981]/30">
                      {responder.eta}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Button
              onClick={() => setSosActivated(false)}
              variant="outline"
              className="w-full border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]"
            >
              Cancel Emergency
            </Button>
          </>
        )}

        {/* Live Alerts */}
        <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
          <h3 className="text-[#0D0D0D] mb-4">Live Emergency Alerts</h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#f59e0b]/10 rounded-lg border border-[#f59e0b]/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-[#f59e0b] mt-0.5" />
                <div>
                  <p className="text-sm text-[#0D0D0D]">Weather Advisory</p>
                  <p className="text-xs text-[#6B7280]">Light rain expected at 3 PM</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
