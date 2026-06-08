import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Globe, Lock, Mail, ArrowLeft, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { isMockMode } from "../../config/firebase.config";
import { DEMO_ACCOUNTS } from "../../config/mock-data";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const { login, isAuthenticated, userProfile, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userProfile && !isLoading) {
      redirectBasedOnRole();
    }
  }, [isAuthenticated, userProfile, isLoading]);

  const redirectBasedOnRole = () => {
    if (!userProfile) {
      console.log('[LOGIN] ⏳ User profile not yet loaded');
      return;
    }

    console.log('[LOGIN] 🧭 Redirecting based on role:', userProfile.role);

    // Role-based redirects per audit requirements
    switch (userProfile.role) {
      case 'admin':
        console.log('[LOGIN] ➡️  Redirecting to /admin');
        navigate("/admin", { replace: true });
        break;
      case 'vendor':
        console.log('[LOGIN] ➡️  Redirecting to /marketplace/vendor');
        navigate("/marketplace/vendor", { replace: true });
        break;
      case 'delivery_personnel':
        console.log('[LOGIN] ➡️  Redirecting to /logistics');
        navigate("/logistics", { replace: true });
        break;
      case 'security':
        console.log('[LOGIN] ➡️  Redirecting to /operations');
        navigate("/operations", { replace: true });
        break;
      case 'volunteer':
        console.log('[LOGIN] ➡️  Redirecting to /dashboard');
        navigate("/dashboard", { replace: true });
        break;
      case 'parent':
        console.log('[LOGIN] ➡️  Redirecting to /dashboard');
        navigate("/dashboard", { replace: true });
        break;
      case 'attendee':
      default:
        console.log('[LOGIN] ➡️  Redirecting to /dashboard (default)');
        navigate("/dashboard", { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success("Welcome back!");
    } else if (result.error) {
      toast.error(result.error.message);
    }
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    const result = await login(demoEmail, demoPassword);
    if (result.success) {
      toast.success("Demo login successful!");
    } else if (result.error) {
      toast.error(result.error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.1),transparent_50%)]" />

      <div className="relative w-full max-w-md space-y-4">
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-8">
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
            <h2 className="text-xl text-white mb-2">Welcome Back</h2>
            <p className="text-white/60">Sign in to access your dashboard</p>
            {isMockMode && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                <Zap className="h-3 w-3" />
                Demo Mode — use the quick-login buttons below
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-[#0ea5e9] hover:underline"
              >
                Register here
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-center text-white/40">
              Secure enterprise-grade authentication
            </p>
          </div>
        </Card>

        {/* Demo Accounts Panel */}
        {isMockMode && (
          <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-amber-500/20 overflow-hidden">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between px-5 py-4 text-amber-400 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Quick Demo Login</span>
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
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 transition-all text-left group disabled:opacity-50"
                  >
                    <div>
                      <p className="text-white text-sm group-hover:text-amber-300 transition-colors">{account.role}</p>
                      <p className="text-white/40 text-xs mt-0.5">{account.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs">{account.email}</p>
                    </div>
                  </button>
                ))}
                <p className="text-center text-white/30 text-xs mt-2">All demo accounts use password: <span className="text-white/50 font-mono">demo1234</span></p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
