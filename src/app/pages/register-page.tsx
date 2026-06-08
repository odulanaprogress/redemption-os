import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Globe, Lock, Mail, User, Phone, ArrowLeft } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const { register, isLoading } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

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
      'attendee',
      {
        phoneNumber: formData.phone,
      }
    );

    if (result.success) {
      toast.success("Account created successfully!");
      navigate("/dashboard");
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

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your.email@example.com"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white/80">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/80">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] hover:opacity-90 text-white shadow-[0_0_25px_rgba(14,165,233,0.5)] disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
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
