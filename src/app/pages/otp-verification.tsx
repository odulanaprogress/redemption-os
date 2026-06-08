import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { Globe, Shield } from "lucide-react";

export function OtpVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (otp.length === 6) {
      navigate("/role-selection");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_50%)]" />
      
      <Card className="relative w-full max-w-md bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-full bg-[#0ea5e9]/10 p-4">
              <Shield className="h-8 w-8 text-[#0ea5e9]" />
            </div>
          </div>
          <h2 className="text-xl text-white mb-2">Verify Your Account</h2>
          <p className="text-white/60">
            Enter the 6-digit code sent to your phone
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="bg-white/5 border-white/10 text-white" />
                <InputOTPSlot index={1} className="bg-white/5 border-white/10 text-white" />
                <InputOTPSlot index={2} className="bg-white/5 border-white/10 text-white" />
                <InputOTPSlot index={3} className="bg-white/5 border-white/10 text-white" />
                <InputOTPSlot index={4} className="bg-white/5 border-white/10 text-white" />
                <InputOTPSlot index={5} className="bg-white/5 border-white/10 text-white" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6}
            className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] hover:opacity-90 text-white disabled:opacity-50"
          >
            Verify & Continue
          </Button>

          <div className="text-center">
            <p className="text-sm text-white/60">
              Didn't receive code?{" "}
              <button className="text-[#0ea5e9] hover:underline">
                Resend
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
