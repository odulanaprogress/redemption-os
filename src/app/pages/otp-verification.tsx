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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_50%)]" />
      
      <Card className="relative w-full max-w-md bg-white backdrop-blur-lg border-[#E5E7EB] p-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-full bg-[#EDE9FE] p-4">
              <Shield className="h-8 w-8 text-[#5B4FE8]" />
            </div>
          </div>
          <h2 className="text-xl text-[#0D0D0D] mb-2">Verify Your Account</h2>
          <p className="text-[#6B7280]">
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
                <InputOTPSlot index={0} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" />
                <InputOTPSlot index={1} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" />
                <InputOTPSlot index={2} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" />
                <InputOTPSlot index={3} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" />
                <InputOTPSlot index={4} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" />
                <InputOTPSlot index={5} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6}
            className="w-full bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] hover:opacity-90 text-[#0D0D0D] disabled:opacity-50"
          >
            Verify & Continue
          </Button>

          <div className="text-center">
            <p className="text-sm text-[#6B7280]">
              Didn't receive code?{" "}
              <button className="text-[#5B4FE8] hover:underline">
                Resend
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
