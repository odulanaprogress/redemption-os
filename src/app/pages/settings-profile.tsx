import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft, User, Bell, Globe, Shield, Moon, Sun, Wifi, Phone,
  LogOut, Camera, Loader2, CheckCircle, Upload, KeyRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { cloudinaryService } from "../../services/cloudinary.service";
import { userService } from "../../services/user.service";

export function SettingsProfile() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, userProfile, logout, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber ?? "");
  const [address, setAddress] = useState((userProfile as any)?.address ?? "");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.photoURL ?? "");

  const [notifications, setNotifications] = useState({
    emergencyAlerts: userProfile?.preferences?.notifications ?? true,
    announcements: true,
    deliveryUpdates: true,
    eventReminders: true,
  });
  const [lowDataMode, setLowDataMode] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);

  // Keep form in sync when profile loads
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName ?? "");
      setPhoneNumber(userProfile.phoneNumber ?? "");
      setAddress((userProfile as any).address ?? "");
      setAvatarUrl(userProfile.photoURL ?? "");
    }
  }, [userProfile]);

  // ── Avatar upload ───────────────────────────────────────────────────────────

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const result = await cloudinaryService.uploadImage(file, "redemption-os/avatars", {
      tags: ["avatar"],
      publicId: user?.uid ? `avatar_${user.uid}` : undefined,
    });
    setAvatarUploading(false);
    if (result.success && result.data) {
      setAvatarUrl(result.data.secureUrl);
      await updateProfile({ displayName, photoURL: result.data.secureUrl });
      toast.success("Profile photo updated!");
    } else {
      toast.error(result.error ?? "Photo upload failed");
    }
  };

  // ── Save profile ────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      // Update Firebase Auth display name & photo
      await updateProfile({ displayName, photoURL: avatarUrl || undefined });

      // Update Firestore user profile with extra fields
      await userService.updateUser(user.uid, {
        displayName,
        phoneNumber: phoneNumber || undefined,
        address: address || undefined,
        photoURL: avatarUrl || undefined,
        updatedAt: new Date(),
      } as any);

      toast.success("Profile saved!");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Sign out ────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = (displayName || userProfile?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white">
      {/* Header */}
      <div className="bg-white backdrop-blur-lg border-b border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-[#6B7280] hover:text-[#0D0D0D]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg text-[#0D0D0D]">Settings &amp; Profile</h1>
            <p className="text-sm text-[#6B7280]">Manage your preferences</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* ── Profile Section ─────────────────────────────────────────────────── */}
        <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#8B82F0] flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-[#0D0D0D] font-bold">{initials}</span>
                )}
              </div>
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#0ea5e9] flex items-center justify-center hover:bg-[#0ea5e9]/80 transition-colors border-2 border-[#0a0e1a] disabled:opacity-60"
                title="Upload photo"
              >
                {avatarUploading ? (
                  <Loader2 className="h-3.5 w-3.5 text-[#0D0D0D] animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-[#0D0D0D]" />
                )}
              </button>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div>
              <h2 className="text-lg text-[#0D0D0D]">{displayName || userProfile?.displayName || "Your Name"}</h2>
              <p className="text-sm text-[#6B7280]">{userProfile?.email}</p>
              <p className="text-xs text-[#059669] mt-0.5 capitalize">
                {userProfile?.role ?? "attendee"}
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-[#4B5563]">Full Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]"
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#4B5563]">Email</Label>
              <Input
                id="email"
                type="email"
                value={userProfile?.email ?? ""}
                disabled
                className="bg-[#F8F9FF] border-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#4B5563]">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]"
                placeholder="+234 800 000 0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-[#4B5563]">Address / Seat Location</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D]"
                placeholder="Building A, Row 5, Seat 12"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#5B4FE8] to-[#8B82F0] hover:opacity-90 text-[#0D0D0D]"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </Card>

        {/* ── Appearance ─────────────────────────────────────────────────────── */}
        <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
          <h3 className="text-[#0D0D0D] mb-4 flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="text-[#4B5563]">Dark Mode</Label>
              <Switch
                id="theme"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
            <Separator className="bg-[#F3F4F6]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-[#5B4FE8]" />
                <Label htmlFor="lowdata" className="text-[#4B5563]">Low Data Mode</Label>
              </div>
              <Switch id="lowdata" checked={lowDataMode} onCheckedChange={setLowDataMode} />
            </div>
          </div>
        </Card>

        {/* ── Notifications ───────────────────────────────────────────────────── */}
        <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
          <h3 className="text-[#0D0D0D] mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              { id: "emergencyAlerts", label: "Emergency Alerts", key: "emergencyAlerts" },
              { id: "announcements", label: "General Announcements", key: "announcements" },
              { id: "deliveryUpdates", label: "Delivery Updates", key: "deliveryUpdates" },
              { id: "eventReminders", label: "Event Reminders", key: "eventReminders" },
            ].map((item, i) => (
              <div key={item.id}>
                {i > 0 && <Separator className="bg-[#F3F4F6]" />}
                <div className={`flex items-center justify-between ${i > 0 ? "pt-4" : ""}`}>
                  <Label htmlFor={item.id} className="text-[#4B5563]">{item.label}</Label>
                  <Switch
                    id={item.id}
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [item.key]: checked })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Language ────────────────────────────────────────────────────────── */}
        <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
          <h3 className="text-[#0D0D0D] mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" /> Language Settings
          </h3>
          <div className="space-y-2">
            <Label htmlFor="language" className="text-[#4B5563]">Preferred Language</Label>
            <select id="language" className="w-full rounded-lg bg-[#F8F9FF] border border-[#E5E7EB] text-[#0D0D0D] p-3">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="pt">Português</option>
              <option value="yo">Yorùbá</option>
              <option value="ha">Hausa</option>
              <option value="ig">Igbo</option>
            </select>
          </div>
        </Card>

        {/* ── Emergency Contacts ──────────────────────────────────────────────── */}
        <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
          <h3 className="text-[#0D0D0D] mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" /> Emergency Contacts
          </h3>
          {userProfile?.emergencyContact ? (
            <div className="p-4 bg-[#F8F9FF] rounded-lg mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#EDE9FE] p-2">
                    <Phone className="h-4 w-4 text-[#5B4FE8]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#0D0D0D]">{userProfile.emergencyContact.name}</p>
                    <p className="text-xs text-[#6B7280]">{userProfile.emergencyContact.relationship}</p>
                  </div>
                </div>
                <p className="text-xs text-[#6B7280]">{userProfile.emergencyContact.phoneNumber}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#9CA3AF] mb-3">No emergency contact set.</p>
          )}
          <Button variant="outline" className="w-full border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]">
            <Phone className="h-4 w-4 mr-2" />
            {userProfile?.emergencyContact ? "Update Contact" : "Add Emergency Contact"}
          </Button>
        </Card>

        {/* ── Account Security ────────────────────────────────────────────────── */}
        <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
          <h3 className="text-[#0D0D0D] mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> Account Security
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]">
              Two-Factor Authentication
            </Button>
          </div>
        </Card>

        {/* ── Sign Out ────────────────────────────────────────────────────────── */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        <div className="text-center text-xs text-[#9CA3AF] py-6">
          Redemption OS v1.0.0 — © 2026
        </div>
      </div>
    </div>
  );
}
