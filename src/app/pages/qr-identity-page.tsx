import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft, Plus, QrCode, Download, Printer, AlertTriangle, User,
  Phone, ShieldCheck, Loader2, Baby, CheckCircle, ChevronRight, Camera,
  ScanLine, MapPin, X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { familyService } from "../../services/family.service";
import { cloudinaryService } from "../../services/cloudinary.service";
import { useAuthStore } from "../../store/auth.store";
import { FamilyMember } from "../../types";
import { Html5QrcodeScanner } from "html5-qrcode";

type Step = "list" | "register" | "card" | "scan";

export function QRIdentityPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, userProfile } = useAuthStore();
  const printRef = useRef<HTMLDivElement>(null);

  const initialStep = searchParams.get("tab") === "scan" ? "scan" : "list";
  const [step, setStep] = useState<Step>(initialStep);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Scanner state
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    allergies: "",
    medicalNotes: "",
    assignedZone: "Children Zone A",
    contactName: "",
    contactRelationship: "Parent",
    contactPhone: "",
    contactAltPhone: "",
  });

  const isAdminOrSecurity = userProfile?.role === "admin" || userProfile?.role === "security";

  useEffect(() => {
    if (step === "list" && user?.uid && !isAdminOrSecurity) {
      setLoading(true);
      familyService.getFamilyMembersByParent(user.uid).then((data) => {
        setMembers(data);
        setLoading(false);
      });
    } else if (step === "list" && isAdminOrSecurity) {
      // Admins/Security just see the scanner option primarily or all mock members if needed
      setMembers(familyService.getAllMockMembers());
    }
  }, [user?.uid, step, isAdminOrSecurity]);

  // Handle Scanner initialization
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (step === "scan") {
      setIsScanning(true);
      setScanResult(null);
      
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );
      
      scanner.render(
        async (decodedText) => {
          // On Success
          if (scanner) {
            scanner.clear();
            setIsScanning(false);
          }
          
          toast.info("QR Code Scanned! Fetching details...");
          const result = await familyService.scanQRCode(decodedText);
          
          if (result.success && result.data) {
            setScanResult(result.data);
            toast.success("Child Identity Verified");
          } else {
            toast.error("Invalid or unrecognized QR tag.");
          }
        },
        (error) => {
          // Ignore frequent failure callbacks during scanning
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [step]);

  const viewQR = async (member: FamilyMember) => {
    setSelectedMember(member);
    if (member.qrCode) {
      setQrCodeUrl(member.qrCode);
    } else {
      const tag = await familyService.getQRTag(member.id);
      setQrCodeUrl(tag?.qrCodeURL ?? null);
    }
    setStep("card");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const result = await cloudinaryService.uploadImage(file, "redemption-os/family-members", { tags: ["family", "child"] });
    setPhotoUploading(false);
    if (result.success && result.data) {
      setPhotoUrl(result.data.secureUrl);
      toast.success("Photo uploaded!");
    } else {
      toast.error(result.error ?? "Photo upload failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSubmitting(true);
    try {
      const allergiesList = form.allergies
        ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean)
        : [];

      const result = await familyService.createFamilyMember(user.uid, {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: new Date(form.dateOfBirth),
        photoURL: photoUrl || undefined,
        allergies: allergiesList,
        medicalNotes: form.medicalNotes || null,
        assignedZone: form.assignedZone,
        emergencyContact: {
          name: form.contactName,
          relationship: form.contactRelationship,
          phoneNumber: form.contactPhone,
          alternatePhone: form.contactAltPhone || null,
        },
      });

      if (result.success && result.data) {
        toast.success(`QR tag generated for ${form.firstName}!`);
        setMembers((prev) => [result.data!.familyMember, ...prev]);
        setSelectedMember(result.data.familyMember);
        setQrCodeUrl(result.data.qrTag.qrCodeURL);
        setStep("card");
      } else {
        toast.error("Failed to register child. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl || !selectedMember) return;
    const link = document.createElement("a");
    link.download = `QR-${selectedMember.firstName}-${selectedMember.lastName}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const printQR = () => {
    if (!printRef.current || !selectedMember) return;
    const content = printRef.current.innerHTML;
    const w = window.open("", "_blank", "width=600,height=800");
    if (!w) return;
    w.document.write(`
      <html><head><title>QR Tag – ${selectedMember.firstName}</title>
      <style>
        body { font-family: sans-serif; display: flex; justify-content: center; padding: 20px; background: white; }
        .tag { border: 2px solid #333; border-radius: 12px; padding: 24px; max-width: 360px; text-align: center; }
        h2 { margin: 8px 0; }
        p { margin: 4px 0; font-size: 14px; color: #555; }
        .alert { background: #fee; border: 1px solid #fcc; border-radius: 8px; padding: 8px; margin-top: 12px; }
        img { border: 1px solid #ddd; border-radius: 8px; margin: 12px 0; }
      </style></head><body>${content}</body></html>
    `);
    w.document.close();
    w.print();
  };

  const inputCls = "bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white">
      {/* Header */}
      <div className="bg-white backdrop-blur-lg border-b border-[#E5E7EB] p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (step === "list" || step === "scan") navigate(-1);
              else setStep("list");
            }}
            className="text-[#6B7280] hover:text-[#0D0D0D]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex justify-between items-center">
            <div>
              <h1 className="text-lg text-[#0D0D0D]">QR Identity System</h1>
              <p className="text-sm text-[#6B7280]">Child Safety & Reunification</p>
            </div>
            {isAdminOrSecurity && step !== "scan" && (
              <Button onClick={() => setStep("scan")} size="sm" className="bg-[#0ea5e9] hover:bg-[#0284c7] text-[#0D0D0D]">
                <ScanLine className="h-4 w-4 mr-2" />
                Scan Tag
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">

          {/* STEP: List */}
          {step === "list" && (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {!isAdminOrSecurity && (
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[#6B7280] text-sm">{members.length} child{members.length !== 1 ? "ren" : ""} registered</p>
                  <Button
                    onClick={() => setStep("register")}
                    className="bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] text-[#0D0D0D]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register Child
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-[#5B4FE8]" />
                </div>
              ) : members.length === 0 ? (
                <Card className="bg-white border-[#E5E7EB] p-10 text-center">
                  <Baby className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
                  <p className="text-[#6B7280] mb-2">No children registered yet</p>
                  {!isAdminOrSecurity && (
                    <>
                      <p className="text-[#9CA3AF] text-sm mb-6">Register your children to generate QR tags for safe tracking.</p>
                      <Button onClick={() => setStep("register")} className="bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] text-[#0D0D0D]">
                        <Plus className="h-4 w-4 mr-2" /> Register First Child
                      </Button>
                    </>
                  )}
                </Card>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <Card
                      key={member.id}
                      className="bg-white border-[#E5E7EB] p-4 flex items-center gap-4 cursor-pointer hover:border-[#0ea5e9]/40 transition-all"
                      onClick={() => viewQR(member)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0ea5e9]/20 to-[#10b981]/20 flex items-center justify-center shrink-0">
                        {member.photoURL ? (
                          <img src={member.photoURL} className="w-12 h-12 rounded-full object-cover" alt="" />
                        ) : (
                          <User className="h-6 w-6 text-[#5B4FE8]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#0D0D0D] font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-[#6B7280] text-sm">{member.assignedZone}</p>
                        {member.allergies && member.allergies.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                            <p className="text-xs text-amber-400">{member.allergies.join(", ")}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-50 text-[#059669] border-[#10b981]/30">
                          <QrCode className="h-3 w-3 mr-1" /> QR Active
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Info card */}
              <Card className="bg-[#0ea5e9]/5 border-[#0ea5e9]/20 p-4 mt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#5B4FE8] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#0D0D0D] text-sm font-medium">How QR Identity Works</p>
                    <p className="text-[#6B7280] text-xs mt-1">Each child gets a unique QR tag. Security staff scan it to instantly see their name, zone, allergies, and your contact info — enabling safe and fast family reunification.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP: Register */}
          {step === "register" && (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="bg-white border-[#E5E7EB] p-6">
                <h2 className="text-[#0D0D0D] mb-6">Register a Child</h2>
                <form onSubmit={handleRegister} className="space-y-5">
                  {/* Child photo */}
                  <div className="flex flex-col items-center gap-3">
                    <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <div
                      onClick={() => photoRef.current?.click()}
                      className="relative w-24 h-24 rounded-full bg-[#F8F9FF] border-2 border-dashed border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#0ea5e9]/50 transition-all overflow-hidden"
                    >
                      {photoUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-[#5B4FE8]" />
                      ) : photoUrl ? (
                        <img src={photoUrl} alt="child" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Camera className="h-6 w-6 text-[#9CA3AF]" />
                          <span className="text-[10px] text-[#9CA3AF]">Add photo</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#9CA3AF]">Child's photo (optional but recommended)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[#4B5563] text-xs">First Name *</Label>
                      <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} required placeholder="e.g. Timmy" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#4B5563] text-xs">Last Name *</Label>
                      <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} required placeholder="e.g. Okonkwo" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[#4B5563] text-xs">Date of Birth *</Label>
                    <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className={inputCls} required />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[#4B5563] text-xs">Assigned Zone</Label>
                    <select
                      value={form.assignedZone}
                      onChange={(e) => setForm({ ...form, assignedZone: e.target.value })}
                      className="w-full rounded-md bg-[#F8F9FF] border border-[#E5E7EB] text-[#0D0D0D] px-3 py-2 text-sm"
                    >
                      {["Children Zone A", "Children Zone B", "Nursery", "Youth Zone"].map((z) => (
                        <option key={z} value={z} className="bg-white">{z}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[#4B5563] text-xs">Allergies (comma separated)</Label>
                    <Input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className={inputCls} placeholder="Peanuts, Latex, Shellfish" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[#4B5563] text-xs">Medical Notes</Label>
                    <Input value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} className={inputCls} placeholder="e.g. Carries inhaler, wears glasses" />
                  </div>

                  <div className="border-t border-[#E5E7EB] pt-4">
                    <p className="text-[#4B5563] text-sm mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#5B4FE8]" /> Emergency Contact
                    </p>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[#4B5563] text-xs">Contact Name *</Label>
                          <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputCls} required placeholder="Full name" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[#4B5563] text-xs">Relationship</Label>
                          <Input value={form.contactRelationship} onChange={(e) => setForm({ ...form, contactRelationship: e.target.value })} className={inputCls} placeholder="Parent, Guardian..." />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[#4B5563] text-xs">Phone Number *</Label>
                          <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputCls} required placeholder="+234 800..." />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[#4B5563] text-xs">Alt. Phone</Label>
                          <Input value={form.contactAltPhone} onChange={(e) => setForm({ ...form, contactAltPhone: e.target.value })} className={inputCls} placeholder="+234 800..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] text-[#0D0D0D] py-5 disabled:opacity-50">
                    {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating QR...</> : <><QrCode className="h-4 w-4 mr-2" />Generate QR Tag</>}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {/* STEP: QR Card (For Parents) */}
          {step === "card" && selectedMember && (
            <motion.div key="card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="text-center mb-4">
                <Badge className="bg-emerald-50 text-[#059669] border-[#10b981]/30 px-3 py-1">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> QR Tag Generated
                </Badge>
              </div>

              <Card className="bg-white border-[#E5E7EB] overflow-hidden">
                <div ref={printRef}>
                  <div className="bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] p-4 text-center">
                    <p className="text-[#4B5563] text-xs uppercase tracking-widest">Redemption OS — Child Safety Tag</p>
                    <h2 className="text-[#0D0D0D] text-xl mt-1">{selectedMember.firstName} {selectedMember.lastName}</h2>
                    <p className="text-[#4B5563] text-sm">{selectedMember.assignedZone}</p>
                  </div>

                  <div className="p-6 flex flex-col items-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-xl border-2 border-[#E5E7EB]" />
                    ) : (
                      <div className="w-48 h-48 rounded-xl bg-[#F8F9FF] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#9CA3AF]" />
                      </div>
                    )}

                    <div className="mt-4 w-full space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-[#F8F9FF] rounded-lg">
                        <Phone className="h-4 w-4 text-[#5B4FE8] shrink-0" />
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Emergency Contact</p>
                          <p className="text-[#0D0D0D] text-sm">{selectedMember.emergencyContact.name} ({selectedMember.emergencyContact.relationship})</p>
                          <p className="text-[#5B4FE8] text-sm">{selectedMember.emergencyContact.phoneNumber}</p>
                        </div>
                      </div>

                      {selectedMember.allergies && selectedMember.allergies.length > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-red-400/70">Allergies</p>
                            <p className="text-red-300 text-sm">{selectedMember.allergies.join(", ")}</p>
                          </div>
                        </div>
                      )}

                      {selectedMember.medicalNotes && (
                        <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-amber-400/70">Medical Notes</p>
                            <p className="text-amber-300 text-sm">{selectedMember.medicalNotes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-[#E5E7EB] grid grid-cols-2 gap-3">
                  <Button onClick={downloadQR} variant="outline" className="border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]">
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                  <Button onClick={printQR} className="bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] text-[#0D0D0D]">
                    <Printer className="h-4 w-4 mr-2" /> Print Tag
                  </Button>
                </div>
              </Card>

              <Button onClick={() => setStep("list")} variant="ghost" className="w-full mt-3 text-[#6B7280] hover:text-[#0D0D0D]">
                Back to Family List
              </Button>
            </motion.div>
          )}

          {/* STEP: Scanner (For Admin/Security) */}
          {step === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              {!scanResult ? (
                <Card className="bg-white border-[#E5E7EB] overflow-hidden">
                  <div className="p-6 text-center">
                    <ScanLine className="h-12 w-12 text-[#5B4FE8] mx-auto mb-4" />
                    <h2 className="text-[#0D0D0D] text-lg font-semibold mb-2">Scan Identity Tag</h2>
                    <p className="text-[#6B7280] text-sm mb-6">Point your camera at the child's QR code to pull up their emergency contact info.</p>
                    
                    <div className="rounded-xl overflow-hidden border-2 border-dashed border-[#0ea5e9]/50 p-2 relative">
                      <div id="reader" className="w-full bg-[#F8F9FF] rounded-lg min-h-[250px]"></div>
                      {isScanning && (
                        <div className="absolute inset-0 border-[3px] border-[#10b981] rounded-xl opacity-50 animate-pulse pointer-events-none" />
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="bg-white border-[#E5E7EB] overflow-hidden">
                  <div className="bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] p-4 flex justify-between items-start">
                    <div>
                      <Badge className="bg-white/20 text-[#0D0D0D] border-none mb-2">Verified Tag</Badge>
                      <h2 className="text-[#0D0D0D] text-2xl font-bold">{scanResult.child.name}</h2>
                      <p className="text-[#111827] flex items-center gap-1 text-sm mt-1">
                        <MapPin className="h-3.5 w-3.5" /> {scanResult.assignedZone}
                      </p>
                    </div>
                    {scanResult.child.photo ? (
                      <img src={scanResult.child.photo} alt="Child" className="w-16 h-16 rounded-full border-2 border-white object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-8 w-8 text-[#0D0D0D]" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Emergency Contact */}
                    <div className="bg-[#EDE9FE] border border-[#5B4FE8]/30 rounded-xl p-4">
                      <h3 className="text-[#0D0D0D] text-sm font-semibold flex items-center gap-2 mb-3">
                        <Phone className="h-4 w-4 text-[#5B4FE8]" /> Emergency Contact
                      </h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[#0D0D0D] font-medium">{scanResult.guardian.name}</p>
                          <p className="text-[#5B4FE8] text-sm">{scanResult.guardian.phoneNumber}</p>
                          <p className="text-[#9CA3AF] text-xs capitalize">{scanResult.guardian.relationship}</p>
                        </div>
                        <a 
                          href={`tel:${scanResult.guardian.phoneNumber}`}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-[#0D0D0D] rounded-lg transition-colors font-medium text-sm"
                        >
                          <Phone className="h-4 w-4" /> Call
                        </a>
                      </div>
                    </div>

                    {/* Alerts */}
                    {(scanResult.child.allergies?.length > 0 || scanResult.child.medicalNotes) && (
                      <div className="grid grid-cols-1 gap-3">
                        {scanResult.child.allergies?.length > 0 && (
                          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-red-400/70">Allergies</p>
                              <p className="text-red-300 text-sm font-medium">{scanResult.child.allergies.join(", ")}</p>
                            </div>
                          </div>
                        )}
                        {scanResult.child.medicalNotes && (
                          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-amber-400/70">Medical Notes</p>
                              <p className="text-amber-300 text-sm">{scanResult.child.medicalNotes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button onClick={() => setScanResult(null)} variant="outline" className="w-full border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6] mt-4">
                      Scan Another Tag
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
