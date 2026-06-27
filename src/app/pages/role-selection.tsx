import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Globe, Users, Heart, Shield, Video, Truck, Settings } from "lucide-react";
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
      description: "Access worship services, navigation, and assistance",
      color: "text-[#5B4FE8]",
      bgColor: "bg-[#EDE9FE]",
      route: "/dashboard",
    },
    {
      id: "volunteer" as UserRole,
      icon: Heart,
      title: "Volunteer",
      description: "Coordinate support and assist attendees",
      color: "text-[#059669]",
      bgColor: "bg-emerald-50",
      route: "/dashboard",
    },
    {
      id: "security" as UserRole,
      icon: Shield,
      title: "Security",
      description: "Monitor safety and emergency response",
      color: "text-[#ef4444]",
      bgColor: "bg-[#ef4444]/10",
      route: "/operations",
    },
    {
      id: "attendee" as UserRole,
      icon: Video,
      title: "Media Team",
      description: "Manage broadcasts and technical operations",
      color: "text-[#5B4FE8]",
      bgColor: "bg-[#EDE9FE]",
      route: "/operations",
    },
    {
      id: "admin" as UserRole,
      icon: Settings,
      title: "Admin",
      description: "Full system access and operational control",
      color: "text-[#f59e0b]",
      bgColor: "bg-[#f59e0b]/10",
      route: "/admin",
    },
    {
      id: "delivery_personnel" as UserRole,
      icon: Truck,
      title: "Delivery Personnel",
      description: "Handle logistics and item delivery",
      color: "text-[#06b6d4]",
      bgColor: "bg-[#06b6d4]/10",
      route: "/logistics",
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
