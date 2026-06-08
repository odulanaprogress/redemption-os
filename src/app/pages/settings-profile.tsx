import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  User,
  Bell,
  Globe,
  Shield,
  Moon,
  Sun,
  Wifi,
  Phone,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";

export function SettingsProfile() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    emergencyAlerts: true,
    announcements: true,
    deliveryUpdates: true,
    eventReminders: true,
  });
  const [lowDataMode, setLowDataMode] = useState(false);

  const emergencyContacts = [
    { name: "John Doe", relation: "Spouse", phone: "+1 (555) 123-4567" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628]">
      <div className="bg-[#1a1f2e]/80 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg text-white">Settings & Profile</h1>
            <p className="text-sm text-white/60">Manage your preferences</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg text-white">John Doe</h2>
              <p className="text-sm text-white/60">john.doe@example.com</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">
                Full Name
              </Label>
              <Input
                id="name"
                defaultValue="John Doe"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue="john.doe@example.com"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                defaultValue="+1 (555) 000-0000"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <Button className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] hover:opacity-90 text-white">
              Update Profile
            </Button>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="text-white/80">
                Dark Mode
              </Label>
              <Switch
                id="theme"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-[#0ea5e9]" />
                <Label htmlFor="lowdata" className="text-white/80">
                  Low Data Mode
                </Label>
              </div>
              <Switch
                id="lowdata"
                checked={lowDataMode}
                onCheckedChange={setLowDataMode}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emergency" className="text-white/80">
                Emergency Alerts
              </Label>
              <Switch
                id="emergency"
                checked={notifications.emergencyAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emergencyAlerts: checked })
                }
              />
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <Label htmlFor="announcements" className="text-white/80">
                General Announcements
              </Label>
              <Switch
                id="announcements"
                checked={notifications.announcements}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, announcements: checked })
                }
              />
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <Label htmlFor="delivery" className="text-white/80">
                Delivery Updates
              </Label>
              <Switch
                id="delivery"
                checked={notifications.deliveryUpdates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, deliveryUpdates: checked })
                }
              />
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <Label htmlFor="events" className="text-white/80">
                Event Reminders
              </Label>
              <Switch
                id="events"
                checked={notifications.eventReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, eventReminders: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Language */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language Settings
          </h3>
          <div className="space-y-2">
            <Label htmlFor="language" className="text-white/80">
              Preferred Language
            </Label>
            <select
              id="language"
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </Card>

        {/* Emergency Contacts */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Contacts
          </h3>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#0ea5e9]/10 p-2">
                      <Phone className="h-4 w-4 text-[#0ea5e9]" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{contact.name}</p>
                      <p className="text-xs text-white/60">{contact.relation}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/60">{contact.phone}</p>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/10"
            >
              Add Emergency Contact
            </Button>
          </div>
        </Card>

        {/* Account Security */}
        <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Security
          </h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start border-white/10 text-white hover:bg-white/10"
            >
              Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-white/10 text-white hover:bg-white/10"
            >
              Two-Factor Authentication
            </Button>
          </div>
        </Card>

        {/* Sign Out */}
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="w-full border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        <div className="text-center text-xs text-white/40 py-6">
          Redemption OS v1.0.0 - © 2026
        </div>
      </div>
    </div>
  );
}
