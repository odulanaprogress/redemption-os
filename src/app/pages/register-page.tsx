import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Globe, Lock, Mail, User, Phone, ArrowLeft, Users, Baby } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { UserRole } from "../../types";

type RegisterRole = "attendee" | "parent";

const ROLES: { value: RegisterRole; label: string; icon: typeof Users; description: string; color: string }[] = [
  {
    value: "attendee",
    label: "Attendee",
    icon: Users,
    description: "I am attending the event",
    color: "from-[#0ea5e9] to-[#0284c7]",
  },
  {
    value: "parent",
    label: "Parent / Guardian",
    icon: Baby,
    description: "I have children attending with me",
    color: "from-[#10b981] to-[#059669]",
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RegisterRole>("attendee");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);
  const { register, isLoading } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast.error("Please agree to the Terms of Use and Privacy Policy to continue");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const result = await register(
      formData.email,
      formData.password,
      formData.name,
      selectedRole as UserRole,
      { phoneNumber: formData.phone }
    );

    if (result.success) {
      toast.success("Account created! Welcome to Redemption OS 🎉");
      // Route based on role
      if (selectedRole === "parent") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else if (result.error) {
      toast.error(result.error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.1),transparent_50%)]" />

      <Card className="relative w-full max-w-md bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 -ml-2 text-white/60 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Globe className="h-8 w-8 text-[#0ea5e9]" />
            <h1 className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] bg-clip-text text-2xl font-bold text-transparent">
              Redemption OS
            </h1>
          </div>
          <h2 className="text-xl text-white mb-2">Create Account</h2>
          <p className="text-white/60">Join the intelligent worship ecosystem</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <Label className="text-white/80 mb-3 block">I am joining as...</Label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? "border-[#0ea5e9] bg-[#0ea5e9]/10 shadow-[0_0_20px_rgba(14,165,233,0.2)]"
                      : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`rounded-lg p-2.5 ${
                      isSelected
                        ? `bg-gradient-to-br ${role.color}`
                        : "bg-white/10"
                    }`}
                  >
                    <role.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isSelected ? "text-white" : "text-white/70"}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5 leading-tight">{role.description}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#0ea5e9]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white/80">
              Phone Number <span className="text-white/30 text-xs">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 pt-1">
            <input
              id="terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 accent-[#0ea5e9] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-white/50 leading-relaxed cursor-pointer">
              I agree to the{" "}
              <span className="text-[#0ea5e9] hover:underline cursor-pointer">Terms of Use</span>
              {" "}and{" "}
              <span className="text-[#0ea5e9] hover:underline cursor-pointer">Privacy Policy</span>.
              {selectedRole === "parent" && (
                <span className="block mt-1 text-[#10b981]/80">
                  As a Parent/Guardian, you consent to registering minor children for event safety purposes.
                </span>
              )}
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !agreed}
            className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] hover:opacity-90 text-white shadow-[0_0_25px_rgba(14,165,233,0.5)] disabled:opacity-50 mt-2"
          >
            {isLoading ? "Creating Account..." : `Create ${selectedRole === "parent" ? "Parent" : "Attendee"} Account`}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/60">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#0ea5e9] hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
