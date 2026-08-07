import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Globe, Users, Heart, Shield, Video, Truck, Settings, Tv, Activity } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/user.service";
import { UserRole } from "../../types";
import { toast } from "sonner";

export function RoleSelection() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [updating, setUpdating] = useState(false);

  const roles = [
    {
      id: "attendee" as UserRole,
      icon: Users,
      title: "Attendee",
      description: "Access worship services, live gospel feeds, navigation, and camp heat",
      color: "text-[#5B4FE8]",
      bgColor: "bg-[#EDE9FE]",
      route: "/dashboard",
    },
    {
      id: "media" as UserRole,
      icon: Tv,
      title: "Media Operations Team",
      description: "Live STT transcription, stage projector display, & sermon operator",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      route: "/media-sermon-console",
    },
    {
      id: "parent" as UserRole,
      icon: Heart,
      title: "Parent / Guardian",
      description: "Manage family tags, child safety, and QR identities",
      color: "text-[#059669]",
      bgColor: "bg-emerald-50",
      route: "/dashboard",
    },
    {
      id: "admin" as UserRole,
      icon: Settings,
      title: "System Administrator",
      description: "Full admin command center, broadcasts, & system controls",
      color: "text-red-600",
      bgColor: "bg-red-100",
      route: "/admin",
    },
    {
      id: "security" as UserRole,
      icon: Shield,
      title: "Security & Crowd Safety",
      description: "Operations center, incidents, and crowd management",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      route: "/crowd-management",
    },
    {
      id: "volunteer" as UserRole,
      icon: Activity,
      title: "Camp Worker / Volunteer",
      description: "Camp operations, logistics, & emergency response assistance",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      route: "/operations",
    },
  ];

  const handleRoleSelect = async (roleId: UserRole, route: string) => {
    if (!user || !userProfile) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }

    setUpdating(true);

    const result = await userService.updateUser(user.uid, { role: roleId });

    if (result.success) {
      toast.success("Role updated successfully!");
      setTimeout(() => {
        window.location.href = route;
      }, 500);
    } else {
      toast.error("Failed to update role");
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.1),transparent_50%)]" />

      <div className="relative w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Globe className="h-8 w-8 text-[#5B4FE8]" />
            <h1 className="bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] bg-clip-text text-2xl font-bold text-transparent">
              Redemption OS
            </h1>
          </div>
          <h2 className="text-xl text-[#0D0D0D] mb-2">Select Your Role</h2>
          <p className="text-[#6B7280]">Choose how you'll interact with the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role, index) => (
            <motion.div
              key={role.id + index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => !updating && handleRoleSelect(role.id, role.route)}
                className={`cursor-pointer bg-white backdrop-blur-lg border-[#E5E7EB] p-6 hover:border-[#E5E7EB] hover:scale-105 transition-all duration-300 ${updating ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className={`mb-4 inline-flex rounded-xl ${role.bgColor} p-3`}>
                  <role.icon className={`h-8 w-8 ${role.color}`} />
                </div>
                <h3 className="mb-2 text-lg text-[#0D0D0D]">{role.title}</h3>
                <p className="text-sm text-[#6B7280]">{role.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {updating && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-[#6B7280]">
              <div className="h-4 w-4 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
              <span>Updating role...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
