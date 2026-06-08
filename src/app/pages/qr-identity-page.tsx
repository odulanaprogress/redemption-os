import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft, Plus, QrCode, Download, Printer, AlertTriangle, User,
  Phone, ShieldCheck, Loader2, Baby, CheckCircle, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { familyService } from "../../services/family.service";
import { useAuthStore } from "../../store/auth.store";
import { FamilyMember } from "../../types";

type Step = "list" | "register" | "card";

export function QRIdentityPage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();
  const printRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("list");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    familyService.getFamilyMembersByParent(user.uid).then((data) => {
      setMembers(data);
      setLoading(false);
    });
  }, [user?.uid]);

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
        allergies: allergiesList,
        medicalNotes: form.medicalNotes || undefined,
        assignedZone: form.assignedZone,
        emergencyContact: {
          name: form.contactName,
          relationship: form.contactRelationship,
          phoneNumber: form.contactPhone,
          alternatePhone: form.contactAltPhone || undefined,
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

  const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-white/40";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628]">
      {/* Header */}
      <div className="bg-[#1a1f2e]/80 backdrop-blur-lg border-b border-white/10 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step === "list" ? navigate(-1) : setStep(step === "card" ? "list" : "list")}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg text-white">QR Identity System</h1>
            <p className="text-sm text-white/60">Child Safety & Family Reunification</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">

          {/* STEP: List */}
          {step === "list" && (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="flex justify-between items-center mb-4">
                <p className="text-white/60 text-sm">{members.length} child{members.length !== 1 ? "ren" : ""} registered</p>
                <Button
                  onClick={() => setStep("register")}
                  className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Register Child
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
                </div>
              ) : members.length === 0 ? (
                <Card className="bg-[#1a1f2e]/80 border-white/10 p-10 text-center">
                  <Baby className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">No children registered yet</p>
                  <p className="text-white/40 text-sm mb-6">Register your children to generate QR identity tags for safe tracking at the event.</p>
                  <Button onClick={() => setStep("register")} className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white">
                    <Plus className="h-4 w-4 mr-2" /> Register First Child
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <Card
                      key={member.id}
                      className="bg-[#1a1f2e]/80 border-white/10 p-4 flex items-center gap-4 cursor-pointer hover:border-[#0ea5e9]/40 transition-all"
                      onClick={() => viewQR(member)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0ea5e9]/20 to-[#10b981]/20 flex items-center justify-center shrink-0">
                        {member.photoURL ? (
                          <img src={member.photoURL} className="w-12 h-12 rounded-full object-cover" alt="" />
                        ) : (
                          <User className="h-6 w-6 text-[#0ea5e9]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-white/50 text-sm">{member.assignedZone}</p>
                        {member.allergies && member.allergies.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                            <p className="text-xs text-amber-400">{member.allergies.join(", ")}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30">
                          <QrCode className="h-3 w-3 mr-1" /> QR Active
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-white/30" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Info card */}
              <Card className="bg-[#0ea5e9]/5 border-[#0ea5e9]/20 p-4 mt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#0ea5e9] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">How QR Identity Works</p>
                    <p className="text-white/50 text-xs mt-1">Each child gets a unique QR tag. Security staff scan it to instantly see their name, zone, allergies, and your contact info — enabling safe and fast family reunification.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP: Register */}
          {step === "register" && (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="bg-[#1a1f2e]/80 border-white/10 p-6">
                <h2 className="text-white mb-6">Register a Child</h2>
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-xs">First Name *</Label>
                      <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} required placeholder="e.g. Timmy" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-xs">Last Name *</Label>
                      <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} required placeholder="e.g. Okonkwo" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs">Date of Birth *</Label>
                    <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className={inputCls} required />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs">Assigned Zone</Label>
                    <select
                      value={form.assignedZone}
                      onChange={(e) => setForm({ ...form, assignedZone: e.target.value })}
                      className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
                    >
                      {["Children Zone A", "Children Zone B", "Nursery", "Youth Zone"].map((z) => (
                        <option key={z} value={z} className="bg-[#1a1f2e]">{z}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs">Allergies (comma separated)</Label>
                    <Input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className={inputCls} placeholder="Peanuts, Latex, Shellfish" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs">Medical Notes</Label>
                    <Input value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} className={inputCls} placeholder="e.g. Carries inhaler, wears glasses" />
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white/70 text-sm mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#0ea5e9]" /> Emergency Contact
                    </p>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-xs">Contact Name *</Label>
                          <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputCls} required placeholder="Full name" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-xs">Relationship</Label>
                          <Input value={form.contactRelationship} onChange={(e) => setForm({ ...form, contactRelationship: e.target.value })} className={inputCls} placeholder="Parent, Guardian..." />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-xs">Phone Number *</Label>
                          <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputCls} required placeholder="+234 800..." />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-xs">Alt. Phone</Label>
                          <Input value={form.contactAltPhone} onChange={(e) => setForm({ ...form, contactAltPhone: e.target.value })} className={inputCls} placeholder="+234 800..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white py-5 disabled:opacity-50">
                    {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating QR...</> : <><QrCode className="h-4 w-4 mr-2" />Generate QR Tag</>}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {/* STEP: QR Card */}
          {step === "card" && selectedMember && (
            <motion.div key="card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="text-center mb-4">
                <Badge className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 px-3 py-1">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> QR Tag Generated
                </Badge>
              </div>

              <Card className="bg-[#1a1f2e]/80 border-white/10 overflow-hidden">
                {/* Printable content */}
                <div ref={printRef}>
                  <div className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] p-4 text-center">
                    <p className="text-white/80 text-xs uppercase tracking-widest">Redemption OS — Child Safety Tag</p>
                    <h2 className="text-white text-xl mt-1">{selectedMember.firstName} {selectedMember.lastName}</h2>
                    <p className="text-white/80 text-sm">{selectedMember.assignedZone}</p>
                  </div>

                  <div className="p-6 flex flex-col items-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-xl border-2 border-white/20" />
                    ) : (
                      <div className="w-48 h-48 rounded-xl bg-white/5 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                      </div>
                    )}

                    <div className="mt-4 w-full space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <Phone className="h-4 w-4 text-[#0ea5e9] shrink-0" />
                        <div>
                          <p className="text-xs text-white/40">Emergency Contact</p>
                          <p className="text-white text-sm">{selectedMember.emergencyContact.name} ({selectedMember.emergencyContact.relationship})</p>
                          <p className="text-[#0ea5e9] text-sm">{selectedMember.emergencyContact.phoneNumber}</p>
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

                {/* Action buttons */}
                <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-3">
                  <Button onClick={downloadQR} variant="outline" className="border-white/10 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                  <Button onClick={printQR} className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white">
                    <Printer className="h-4 w-4 mr-2" /> Print Tag
                  </Button>
                </div>
              </Card>

              <Button onClick={() => setStep("list")} variant="ghost" className="w-full mt-3 text-white/60 hover:text-white">
                Back to Family List
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
