import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Baby, QrCode, Phone, User, CheckCircle2, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { familyService } from "../../services/family.service";

export function PreRegistrationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successQR, setSuccessQR] = useState<string | null>(null);

  // Parent Data
  const [parentData, setParentData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  // Child Data
  const [childData, setChildData] = useState({
    firstName: "",
    lastName: "",
    allergies: "",
    medicalNotes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // In a full implementation, we'd create the Parent user account here first.
      // For this demo, we'll just mock a parentId and create the child record.
      const mockParentId = "parent-" + Date.now();
      
      const res = await familyService.createFamilyMember(mockParentId, {
        firstName: childData.firstName,
        lastName: childData.lastName,
        relationship: "child",
        emergencyContact: {
          name: parentData.name,
          phoneNumber: parentData.phone
        },
        allergies: childData.allergies ? childData.allergies.split(",").map(a => a.trim()) : [],
        medicalNotes: childData.medicalNotes
      });

      if (res.success) {
        setSuccessQR(res.data?.qrCode || "MOCK_QR");
        setStep(2);
        toast.success("Child registered successfully!");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.1),transparent_50%)]" />

      <Card className="relative w-full max-w-lg bg-white backdrop-blur-lg border-[#E5E7EB] p-8 shadow-2xl">
        {step === 1 ? (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#a78bfa]/20 to-[#0ea5e9]/20 rounded-full flex items-center justify-center mb-4 border border-[#E5E7EB]">
                <Baby className="h-8 w-8 text-[#5B4FE8]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0D0D0D] mb-2">Child Pre-Registration</h2>
              <p className="text-[#6B7280] text-sm">Register your child before arriving to skip the lines and receive their digital Identity QR Tag instantly.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Parent Info */}
              <div className="space-y-4 p-4 bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl">
                <h3 className="text-[#0D0D0D] font-medium flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-[#5B4FE8]" /> Parent / Guardian Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#6B7280] text-xs">Full Name</Label>
                    <Input required value={parentData.name} onChange={e => setParentData({...parentData, name: e.target.value})} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#6B7280] text-xs">Phone (Emergency)</Label>
                    <Input required type="tel" value={parentData.phone} onChange={e => setParentData({...parentData, phone: e.target.value})} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
              </div>

              {/* Child Info */}
              <div className="space-y-4 p-4 bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl">
                <h3 className="text-[#0D0D0D] font-medium flex items-center gap-2 text-sm">
                  <Baby className="h-4 w-4 text-[#5B4FE8]" /> Child Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#6B7280] text-xs">First Name</Label>
                    <Input required value={childData.firstName} onChange={e => setChildData({...childData, firstName: e.target.value})} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" placeholder="Sammy" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#6B7280] text-xs">Last Name</Label>
                    <Input required value={childData.lastName} onChange={e => setChildData({...childData, lastName: e.target.value})} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-xs flex items-center gap-1"><HeartPulse className="h-3 w-3 text-red-400"/> Allergies (Comma separated, if any)</Label>
                  <Input value={childData.allergies} onChange={e => setChildData({...childData, allergies: e.target.value})} className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]" placeholder="Peanuts, Dairy" />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#a78bfa] to-[#0ea5e9] text-[#0D0D0D] hover:opacity-90">
                {isSubmitting ? "Processing..." : "Register & Get QR Tag"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-20 h-20 bg-[#10b981]/20 rounded-full flex items-center justify-center mb-6 border border-[#10b981]/30">
              <CheckCircle2 className="h-10 w-10 text-[#059669]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0D0D0D] mb-2">Registration Complete!</h2>
            <p className="text-[#6B7280] text-sm mb-8">Please save this QR tag. You will scan this at the Children's Church entrance.</p>
            
            <div className="bg-white p-6 rounded-2xl inline-block mb-8">
              {successQR ? (
                <img src={successQR} alt="Child QR Tag" className="w-48 h-48 mx-auto" />
              ) : (
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            <p className="text-[#5B4FE8] font-semibold text-lg">{childData.firstName} {childData.lastName}</p>
            <p className="text-[#9CA3AF] text-sm mb-8">Emergency Contact: {parentData.phone}</p>

            <Button onClick={() => setStep(1)} variant="outline" className="w-full border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F8F9FF]">
              Register Another Child
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
