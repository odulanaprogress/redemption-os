import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Search,
  Navigation,
} from "lucide-react";
import { motion } from "motion/react";

export function SmartLogistics() {
  const navigate = useNavigate();
  const [itemDescription, setItemDescription] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");

  const activeDeliveries = [
    {
      id: "D12847",
      item: "Water Bottles (Case of 24)",
      from: "Storage - Level 2",
      to: "Main Hall - Section B",
      status: "in-transit",
      eta: "3 min",
      volunteer: "John Smith",
    },
    {
      id: "D12848",
      item: "First Aid Kit",
      from: "Medical Center",
      to: "Gate A",
      status: "assigned",
      eta: "8 min",
      volunteer: "Sarah Johnson",
    },
  ];

  const lostAndFound = [
    {
      id: "LF001",
      item: "Black Backpack",
      location: "North Entrance",
      time: "30 min ago",
      status: "unclaimed",
    },
    {
      id: "LF002",
      item: "Child's Jacket (Blue)",
      location: "Main Hall",
      time: "1 hour ago",
      status: "unclaimed",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white">
      <div className="bg-white backdrop-blur-lg border-b border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-[#6B7280] hover:text-[#0D0D0D]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg text-[#0D0D0D]">Smart Logistics</h1>
            <p className="text-sm text-[#6B7280]">Delivery & coordination</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="request" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white backdrop-blur-lg border border-[#E5E7EB]">
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="track">Track</TabsTrigger>
            <TabsTrigger value="lost">Lost & Found</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4">
            <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
              <h2 className="text-[#0D0D0D] mb-6">Request Delivery</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item" className="text-[#4B5563]">
                    Item Description
                  </Label>
                  <Textarea
                    id="item"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Describe the item you need..."
                    className="bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[#4B5563]">
                    Delivery Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    <Input
                      id="location"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder="Your current location"
                      className="pl-10 bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] hover:opacity-90 text-[#0D0D0D]">
                  <Truck className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </Card>

            <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
              <h3 className="text-[#0D0D0D] mb-4">Quick Items</h3>
              <div className="grid grid-cols-2 gap-3">
                {["Water", "First Aid", "Lost & Found", "Wheelchair"].map((item) => (
                  <Button
                    key={item}
                    variant="outline"
                    className="border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]"
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="track" className="space-y-4">
            <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  placeholder="Enter delivery ID..."
                  className="pl-10 bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF]"
                />
              </div>
            </Card>

            <div>
              <h3 className="text-[#0D0D0D] mb-4">Active Deliveries</h3>
              <div className="space-y-3">
                {activeDeliveries.map((delivery, index) => (
                  <motion.div
                    key={delivery.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-[#0D0D0D]">{delivery.item}</h3>
                            {delivery.status === "in-transit" ? (
                              <Badge className="bg-[#0ea5e9]/20 text-[#5B4FE8] border-[#5B4FE8]/30">
                                <Truck className="h-3 w-3 mr-1" />
                                In Transit
                              </Badge>
                            ) : (
                              <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">
                                Assigned
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280]">ID: {delivery.id}</p>
                        </div>
                        <Badge className="bg-[#10b981]/20 text-[#059669] border-[#10b981]/30">
                          ETA {delivery.eta}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-[#5B4FE8] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-[#9CA3AF]">From</p>
                            <p className="text-sm text-[#0D0D0D]">{delivery.from}</p>
                          </div>
                        </div>
                        <div className="h-px bg-[#F3F4F6] ml-2 w-4" />
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-[#059669] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-[#9CA3AF]">To</p>
                            <p className="text-sm text-[#0D0D0D]">{delivery.to}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                          <p className="text-xs text-[#6B7280]">{delivery.volunteer}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#5B4FE8] hover:text-[#5B4FE8]"
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Track
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lost" className="space-y-4">
            <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  placeholder="Search lost items..."
                  className="pl-10 bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF]"
                />
              </div>
            </Card>

            <div>
              <h3 className="text-[#0D0D0D] mb-4">Lost & Found Items</h3>
              <div className="space-y-3">
                {lostAndFound.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-[#f59e0b]/10 p-2">
                            <Package className="h-5 w-5 text-[#f59e0b]" />
                          </div>
                          <div>
                            <h3 className="text-[#0D0D0D] mb-1">{item.item}</h3>
                            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                              <MapPin className="h-3 w-3" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">
                          Unclaimed
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                          <Clock className="h-3 w-3" />
                          <span>{item.time}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]"
                        >
                          Claim Item
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]"
            >
              Report Lost Item
            </Button>
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <Card className="mt-6 bg-white backdrop-blur-lg border-[#E5E7EB] p-6">
          <h3 className="text-[#0D0D0D] mb-4">Today's Logistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl text-[#0D0D0D] mb-1">47</p>
              <p className="text-xs text-[#6B7280]">Deliveries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#0D0D0D] mb-1">12</p>
              <p className="text-xs text-[#6B7280]">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#0D0D0D] mb-1">5</p>
              <p className="text-xs text-[#6B7280]">Lost Items</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
