import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Navigation as NavigationIcon,
  Search,
  MapPin,
  Zap,
  Clock,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

export function SmartNavigation() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const popularDestinations = [
    { name: "Main Sanctuary", crowd: "low", distance: "150m", icon: MapPin },
    { name: "Hall B", crowd: "medium", distance: "320m", icon: MapPin },
    { name: "Medical Center", crowd: "low", distance: "210m", icon: MapPin },
    { name: "Gate C", crowd: "low", distance: "450m", icon: MapPin },
  ];

  const getCrowdColor = (crowd: string) => {
    switch (crowd) {
      case "low":
        return "text-[#10b981]";
      case "medium":
        return "text-[#f59e0b]";
      case "high":
        return "text-[#ef4444]";
      default:
        return "text-white/60";
    }
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
          <div className="flex-1">
            <h1 className="text-lg text-white">Smart Navigation</h1>
            <p className="text-sm text-white/60">AI-powered routing</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a location..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </Card>

        {/* Active Route */}
        <Card className="bg-gradient-to-br from-[#a78bfa]/20 to-[#1a1f2e] border-[#a78bfa]/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg text-white mb-1">Route to Hall B</h2>
              <p className="text-sm text-white/60">Via North Corridor - Less Crowded</p>
            </div>
            <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
              <TrendingDown className="h-3 w-3 mr-1" />
              Optimal
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#a78bfa]" />
              <div>
                <p className="text-xs text-white/60">ETA</p>
                <p className="text-sm text-white">4 min</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#a78bfa]" />
              <div>
                <p className="text-xs text-white/60">Distance</p>
                <p className="text-sm text-white">320m</p>
              </div>
            </div>
          </div>
          <Button className="w-full bg-[#a78bfa] hover:bg-[#9333ea] text-white">
            <NavigationIcon className="h-4 w-4 mr-2" />
            Start Navigation
          </Button>
        </Card>

        {/* Crowd Heatmap */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white mb-4">Live Crowd Density</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Main Sanctuary</span>
                <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
                  35% capacity
                </Badge>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[35%] bg-gradient-to-r from-[#10b981] to-[#0ea5e9]" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">North Corridor</span>
                <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">
                  65% capacity
                </Badge>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-gradient-to-r from-[#f59e0b] to-[#ef4444]" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Gate A</span>
                <Badge className="bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30">
                  78% capacity
                </Badge>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-[#ef4444]" />
              </div>
            </div>
          </div>
        </Card>

        {/* Popular Destinations */}
        <div>
          <h3 className="text-white mb-4">Popular Destinations</h3>
          <div className="space-y-3">
            {popularDestinations.map((dest, index) => (
              <Card
                key={index}
                className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-4 cursor-pointer hover:border-white/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#a78bfa]/10 p-2">
                      <dest.icon className="h-5 w-5 text-[#a78bfa]" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{dest.name}</p>
                      <p className="text-xs text-white/60">{dest.distance}</p>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      dest.crowd === "low"
                        ? "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30"
                        : "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30"
                    }`}
                  >
                    {dest.crowd}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <Card className="bg-gradient-to-br from-[#f59e0b]/20 to-[#1a1f2e] border-[#f59e0b]/30 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[#f59e0b]/10 p-2">
              <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-sm text-white mb-1">Congestion Alert</p>
              <p className="text-xs text-white/60">
                High traffic detected at South Entrance. Consider using Gate C instead.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
