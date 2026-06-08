import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft, AlertTriangle, Users, Volume2, Heart, Car, Wrench,
  CheckCircle, Clock, Send, MapPin, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { incidentService } from "../../services/incident.service";
import { useAuthStore } from "../../store/auth.store";
import { formatDistanceToNow } from "date-fns";
import { Incident } from "../../types";

const CATEGORIES = [
  { id: "overcrowding", icon: Users, label: "Overcrowding", color: "text-amber-400", type: "other" as const },
  { id: "sound", icon: Volume2, label: "Sound Issue", color: "text-[#0ea5e9]", type: "facility" as const },
  { id: "medical", icon: Heart, label: "Medical Emergency", color: "text-red-400", type: "medical" as const },
  { id: "missing", icon: AlertTriangle, label: "Missing Child", color: "text-red-400", type: "lost_child" as const },
  { id: "traffic", icon: Car, label: "Traffic Issue", color: "text-amber-400", type: "other" as const },
  { id: "facility", icon: Wrench, label: "Facility Problem", color: "text-cyan-400", type: "facility" as const },
];

const PRIORITY_MAP = { low: "low", medium: "medium", high: "high" } as const;

export function CommunitySignal() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[0] | null>(null);
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myReports, setMyReports] = useState<Incident[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    setLoadingReports(true);
    incidentService.getIncidents({ reportedBy: user.uid }).then((reports) => {
      setMyReports(reports.slice(0, 5));
      setLoadingReports(false);
    });
  }, [user?.uid, submitted]);

  const handleSubmit = async () => {
    if (!selectedCategory || !description.trim()) {
      toast.error("Please select a category and provide a description.");
      return;
    }
    if (!user?.uid) {
      toast.error("You must be logged in to submit a report.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await incidentService.createIncident({
        reportedBy: user.uid,
        type: selectedCategory.type,
        priority: PRIORITY_MAP[severity],
        status: "reported",
        title: selectedCategory.label,
        description: description.trim(),
        location: { zone: "Main Hall", building: "Section B" },
      });

      if (result.success) {
        toast.success("Report submitted! Our team will respond shortly.");
        setSubmitted(true);
        setSelectedCategory(null);
        setDescription("");
        setSeverity("medium");
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    reported: { label: "Reported", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30", icon: Clock },
    acknowledged: { label: "Acknowledged", color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/10 border-[#0ea5e9]/30", icon: Clock },
    in_progress: { label: "In Progress", color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10 border-[#a78bfa]/30", icon: Clock },
    resolved: { label: "Resolved", color: "text-[#10b981]", bg: "bg-[#10b981]/10 border-[#10b981]/30", icon: CheckCircle },
    closed: { label: "Closed", color: "text-white/40", bg: "bg-white/5 border-white/10", icon: CheckCircle },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628]">
      <div className="bg-[#1a1f2e]/80 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-white/60 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg text-white">Community Signal</h1>
            <p className="text-sm text-white/60">Report an issue to our team</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {submitted && (
          <Card className="bg-[#10b981]/10 border-[#10b981]/30 p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-[#10b981] shrink-0" />
            <p className="text-[#10b981] text-sm">Report submitted successfully! Our team is reviewing it.</p>
          </Card>
        )}

        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h2 className="text-white mb-4">Select Category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Card
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer p-4 transition-all ${
                  selectedCategory?.id === cat.id
                    ? "bg-[#0ea5e9]/20 border-[#0ea5e9]"
                    : "bg-[#0a0e1a]/50 border-white/10 hover:border-white/30"
                }`}
              >
                <cat.icon className={`h-6 w-6 mb-2 ${cat.color}`} />
                <p className="text-sm text-white">{cat.label}</p>
              </Card>
            ))}
          </div>
        </Card>

        {selectedCategory && (
          <>
            <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
              <h3 className="text-white mb-4">Severity Level</h3>
              <div className="flex gap-3">
                {(["low", "medium", "high"] as const).map((level) => (
                  <Button
                    key={level}
                    onClick={() => setSeverity(level)}
                    variant={severity === level ? "default" : "outline"}
                    className={
                      severity === level
                        ? level === "high" ? "bg-red-500 hover:bg-red-600 border-none"
                          : level === "medium" ? "bg-amber-500 hover:bg-amber-600 border-none"
                          : "bg-[#10b981] hover:bg-[#059669] border-none"
                        : "border-white/10 text-white hover:bg-white/10"
                    }
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
              <h3 className="text-white mb-4">Description</h3>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail — location, number of people affected, any immediate danger..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
              />
            </Card>

            <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-4 flex items-center gap-3">
              <MapPin className="h-4 w-4 text-[#0ea5e9] shrink-0" />
              <div>
                <p className="text-xs text-white/50">Auto-detected location</p>
                <p className="text-sm text-white">Main Hall, Section B</p>
              </div>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !description.trim()}
              className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] hover:opacity-90 text-white py-6 disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="h-5 w-5 mr-2" /> Submit Report</>
              )}
            </Button>
          </>
        )}

        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white mb-4">Your Recent Reports</h3>
          {loadingReports ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-white/40" />
            </div>
          ) : myReports.length === 0 ? (
            <p className="text-center text-white/40 text-sm py-4">No reports submitted yet</p>
          ) : (
            <div className="space-y-3">
              {myReports.map((report) => {
                const cfg = statusConfig[report.status] ?? statusConfig.reported;
                const StatusIcon = cfg.icon;
                return (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-sm text-white">{report.title}</p>
                      <p className="text-xs text-white/40">
                        {formatDistanceToNow(report.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <Badge className={`${cfg.bg} ${cfg.color} border`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
