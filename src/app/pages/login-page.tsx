import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Globe, Lock, Mail, ArrowLeft, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { isMockMode } from "../../config/firebase.config";
import { DEMO_ACCOUNTS, MOCK_USERS, MOCK_PROFILES } from "../../config/mock-data";
import { authService } from "../../services/auth.service";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { login, resetPassword, isAuthenticated, userProfile, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userProfile && !isLoading && !isSeeding) {
      redirectBasedOnRole();
    }
  }, [isAuthenticated, userProfile, isLoading, isSeeding]);

  const redirectBasedOnRole = () => {
    if (!userProfile) return;
    switch (userProfile.role) {
      case "admin": navigate("/admin", { replace: true }); break;
      case "vendor": navigate("/marketplace/vendor", { replace: true }); break;
      case "delivery_personnel": navigate("/logistics", { replace: true }); break;
      case "security": navigate("/operations", { replace: true }); break;
      default: navigate("/dashboard", { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) { toast.success("Welcome back!"); }
    else if (result.error) { toast.error(result.error.message); }
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    const result = await login(demoEmail, demoPassword);
    if (result.success) { toast.success("Demo login successful!"); }
    else if (result.error) { toast.error(result.error.message); }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email address first"); return; }
    setResettingPassword(true);
    const result = await resetPassword(email);
    if (result.success) { toast.success("Password reset email sent!"); }
    else if (result.error) { toast.error(result.error.message); }
    setResettingPassword(false);
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm("This will create all demo accounts in your LIVE Firebase database. Are you sure?")) return;
    setIsSeeding(true);
    toast.info("Seeding live database with demo users... please wait.");
    try {
      let successCount = 0;
      for (const user of MOCK_USERS) {
        const profile = MOCK_PROFILES[user.uid];
        const res = await authService.register(user.email, user.password, user.displayName, profile.role, profile);
        if (res.success || res.error?.code === "auth/email-already-in-use") { successCount++; }
      }
      await authService.logout();
      toast.success(`Successfully seeded ${successCount} demo users!`);
    } catch (e) {
      toast.error("An error occurred while seeding the database.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8">
          <button
            onClick={() => navigate("/")}
            className="mb-6 flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0D0D0D] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          {/* Logo & heading */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-[#5B4FE8] flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#0D0D0D] tracking-tight">Redemption OS</span>
            </div>
            <h1 className="text-xl font-semibold text-[#0D0D0D] mb-1">Welcome back</h1>
            <p className="text-sm text-[#6B7280]">Sign in to access your dashboard</p>
            {isMockMode && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDE9FE] text-[#5B4FE8] text-xs font-medium">
                <Zap className="h-3 w-3" />
                Demo Mode — use quick-login below
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-[#0D0D0D]">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="pl-10 h-10 border-[#E5E7EB] bg-white text-[#0D0D0D] placeholder:text-[#9CA3AF] focus:border-[#5B4FE8] focus:ring-[#5B4FE8]/10 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-[#0D0D0D]">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resettingPassword}
                  className="text-xs text-[#5B4FE8] hover:text-[#4840C8] transition-colors"
                >
                  {resettingPassword ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-10 border-[#E5E7EB] bg-white text-[#0D0D0D] placeholder:text-[#9CA3AF] focus:border-[#5B4FE8] focus:ring-[#5B4FE8]/10 rounded-md"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#5B4FE8] hover:bg-[#4840C8] text-white rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B7280]">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-[#5B4FE8] font-medium hover:text-[#4840C8] transition-colors"
              >
                Register here
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-xs text-center text-[#9CA3AF]">
              Secure enterprise-grade authentication
            </p>
            {!isMockMode && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="border-[#E5E7EB] text-[#6B7280] hover:text-[#0D0D0D] hover:border-[#5B4FE8] hover:text-[#5B4FE8] rounded-md"
                >
                  <Zap className="mr-2 h-3 w-3 text-[#D97706]" />
                  {isSeeding ? "Seeding database..." : "Seed demo accounts to live DB"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Demo Accounts Panel */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="w-full flex items-center justify-between px-5 py-4 text-[#5B4FE8] hover:bg-[#F8F9FF] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Quick login (Live database)</span>
            </div>
            {showDemo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDemo && (
            <div className="px-5 pb-5 grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  onClick={() => quickLogin(account.email, account.password)}
                  disabled={isLoading}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-[#F8F9FF] hover:bg-[#EDE9FE] border border-[#E5E7EB] hover:border-[#5B4FE8]/30 transition-all text-left group disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0D0D0D] group-hover:text-[#5B4FE8] transition-colors">{account.role}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{account.description}</p>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">{account.email}</p>
                </button>
              ))}
              <p className="text-center text-[#9CA3AF] text-xs mt-2">
                Seed the database first if accounts don't exist yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
