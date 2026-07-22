import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import {
  ArrowLeft,
  Search,
  MapPin,
  Navigation as NavigationIcon,
  X,
  Clock,
  Footprints,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  RCCG_CAMP_CENTER,
  RCCG_CAMP_LOCATIONS,
  POPULAR_DESTINATIONS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  searchLocations,
  haversineDistance,
  formatDistance,
  estimateWalkingMinutes,
} from "../../config/locations";
import type { Destination, LatLng } from "../../types";

// ─── Fix Leaflet default icon broken in Vite/Webpack ─────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Create coloured circle icons per category ────────────────────────────────
function makeCategoryIcon(color: string, size = 32) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="12" fill="${color}" opacity="0.95" stroke="white" stroke-width="2.5"/>
      <circle cx="16" cy="16" r="5" fill="white"/>
    </svg>`.trim();
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

function makeSelectedIcon(size = 38) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 38 46">
      <path d="M19 0C10.163 0 3 7.163 3 16c0 12 16 30 16 30s16-18 16-30C35 7.163 27.837 0 19 0z" fill="#a78bfa" stroke="white" stroke-width="2"/>
      <circle cx="19" cy="16" r="7" fill="white"/>
    </svg>`.trim();
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

// ─── Sub-component: moves the map view when selection changes ─────────────────
function MapFlyTo({ coords, zoom = 16 }: { coords: LatLng; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([coords.lat, coords.lng], zoom, { duration: 1 });
  }, [coords, zoom, map]);
  return null;
}

// ─── OSRM routing (free, no API key) ─────────────────────────────────────────
async function fetchRoute(from: LatLng, to: LatLng): Promise<LatLng[] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const coords: [number, number][] =
      data.routes?.[0]?.geometry?.coordinates ?? [];
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return null;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SmartNavigation() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Destination[]>([]);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isNavigating, setIsNavigating] = useState(false);   // real-time mode
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const routeRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // One-time GPS position on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsError(null);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setGpsError("Location unavailable — showing from Main Gate")
    );
    return () => stopNavigating();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time GPS watching ─────────────────────────────────────────────────
  const stopNavigating = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (routeRefreshRef.current !== null) {
      clearInterval(routeRefreshRef.current);
      routeRefreshRef.current = null;
    }
    setIsNavigating(false);
  }, []);

  const startNavigating = useCallback(async () => {
    if (!selected) return;
    if (!navigator.geolocation) {
      setGpsError("GPS not supported on this device");
      return;
    }
    setIsNavigating(true);
    setGpsError(null);

    // Watch position in real-time
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const loc: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setFlyTarget(loc); // map follows you
      },
      () => setGpsError("GPS signal lost"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    // Recalculate route every 15 seconds
    const refresh = async () => {
      if (!selected) return;
      const loc = await new Promise<LatLng | null>((res) =>
        navigator.geolocation.getCurrentPosition(
          (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => res(null),
          { enableHighAccuracy: true, timeout: 8000 }
        )
      );
      if (loc) {
        const route = await fetchRoute(loc, selected.coordinates);
        if (route) setRouteCoords(route);
      }
    };
    await refresh(); // immediate first fetch
    routeRefreshRef.current = setInterval(refresh, 15000);
  }, [selected]);

  // Search filtering
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const found = searchLocations(query);
    setResults(found.slice(0, 8));
  }, [query]);

  // Select a destination → get route
  async function selectDestination(dest: Destination) {
    setSelected(dest);
    setQuery("");
    setResults([]);
    setFlyTarget(dest.coordinates);
    setRouteCoords(null);
    setRouteError(false);

    const origin = userLocation ?? RCCG_CAMP_CENTER;
    setRouteLoading(true);
    const route = await fetchRoute(origin, dest.coordinates);
    setRouteLoading(false);
    if (route) {
      setRouteCoords(route);
    } else {
      setRouteError(true);
    }
  }

  function clearSelection() {
    setSelected(null);
    setRouteCoords(null);
    setRouteError(false);
    setFlyTarget(null);
  }

  // Filter locations by category
  const filteredLocations =
    activeFilter === "all"
      ? RCCG_CAMP_LOCATIONS
      : RCCG_CAMP_LOCATIONS.filter((d) => d.category === activeFilter);

  // Distance info
  const origin = userLocation ?? RCCG_CAMP_CENTER;
  const distanceMetres = selected
    ? haversineDistance(origin, selected.coordinates)
    : 0;

  const categories = ["all", "auditorium", "gate", "facility", "food", "transit", "office", "hostel"];

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FF] overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex-shrink-0 z-10">
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
            <h1 className="text-base font-semibold text-[#0D0D0D]">Smart Navigation</h1>
            <p className="text-xs text-[#6B7280]">Redemption City — {RCCG_CAMP_LOCATIONS.length} locations mapped</p>
          </div>
          {userLocation && (
            <Badge className="bg-[#10b981]/20 text-[#059669] border-[#10b981]/30 text-xs">
              GPS Active
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search — Medical Centre, Bookshop, Car Park…"
            className="pl-10 pr-10 bg-[#F8F9FF] border-[#E5E7EB] text-[#0D0D0D] placeholder:text-[#9CA3AF] text-sm"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {results.length > 0 && (
          <div className="absolute left-4 right-4 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-50 overflow-hidden">
            {results.map((dest) => (
              <button
                key={dest.id}
                onClick={() => selectDestination(dest)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8F9FF] transition-colors border-b border-[#F3F4F6] last:border-0 text-left"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[dest.category] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0D0D0D] truncate">{dest.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{CATEGORY_LABELS[dest.category]}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#D1D5DB] flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative">
        <MapContainer
          center={[RCCG_CAMP_CENTER.lat, RCCG_CAMP_CENTER.lng]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          {/* OpenStreetMap Tiles — free, no API key */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Fly map to selected location */}
          {flyTarget && <MapFlyTo coords={flyTarget} zoom={16} />}

          {/* Route polyline */}
          {routeCoords && (
            <Polyline
              positions={routeCoords.map((c) => [c.lat, c.lng])}
              pathOptions={{ color: "#a78bfa", weight: 5, opacity: 0.85, dashArray: "10 6" }}
            />
          )}

          {/* All location markers */}
          {filteredLocations.map((dest) => (
            <Marker
              key={dest.id}
              position={[dest.coordinates.lat, dest.coordinates.lng]}
              icon={
                selected?.id === dest.id
                  ? makeSelectedIcon()
                  : makeCategoryIcon(CATEGORY_COLORS[dest.category])
              }
              eventHandlers={{ click: () => selectDestination(dest) }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-semibold text-sm text-[#0D0D0D]">{dest.name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{CATEGORY_LABELS[dest.category]}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                html: `<div style="width:16px;height:16px;background:#0ea5e9;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(14,165,233,0.3)"></div>`,
                className: "",
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup><p className="text-sm font-medium">Your Location</p></Popup>
            </Marker>
          )}
        </MapContainer>

        {/* ── Category filter pills — overlaid on map ── */}
        <div className="absolute top-3 left-3 right-3 z-[400] flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm border ${
                activeFilter === cat
                  ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                  : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F8F9FF]"
              }`}
              style={
                activeFilter === cat && cat !== "all"
                  ? { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] }
                  : {}
              }
            >
              {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* ── Selected destination card — overlaid at bottom of map ── */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 z-[400]">
            <Card className="bg-white border-[#E5E7EB] shadow-xl p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: CATEGORY_COLORS[selected.category] }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0D0D0D] leading-tight">{selected.name}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{CATEGORY_LABELS[selected.category]}</p>
                  </div>
                </div>
                <button
                  onClick={() => { stopNavigating(); clearSelection(); }}
                  className="text-[#9CA3AF] hover:text-[#6B7280] flex-shrink-0 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Stats row */}
              <div className="flex gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#a78bfa]" />
                  <span className="text-sm text-[#374151]">{formatDistance(distanceMetres)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#0ea5e9]" />
                  <span className="text-sm text-[#374151]">{estimateWalkingMinutes(distanceMetres)} min walk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Footprints className="h-4 w-4 text-[#10b981]" />
                  <span className="text-xs text-[#6B7280]">
                    {userLocation ? "from you" : "from Main Gate"}
                  </span>
                </div>
              </div>

              {/* Live navigation banner */}
              {isNavigating && (
                <div className="flex items-center gap-2 bg-[#a78bfa]/10 border border-[#a78bfa]/30 rounded-lg px-3 py-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a78bfa] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#a78bfa]" />
                  </span>
                  <span className="text-xs text-[#7c3aed] font-medium">Live navigation active — map follows your position</span>
                </div>
              )}

              {/* Route status */}
              {routeLoading && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#a78bfa]" />
                  Getting walking route…
                </div>
              )}
              {routeError && !routeLoading && (
                <div className="flex items-center gap-2 text-xs text-[#f59e0b] mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Route unavailable — straight-line distance shown
                </div>
              )}
              {gpsError && (
                <div className="flex items-center gap-2 text-xs text-[#f59e0b] mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  {gpsError}
                </div>
              )}
              {routeCoords && !routeLoading && !isNavigating && (
                <div className="flex items-center gap-2 text-xs text-[#10b981] mb-2">
                  <NavigationIcon className="h-4 w-4" />
                  Route ready — follow the purple path on the map
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {!isNavigating ? (
                  <Button
                    onClick={startNavigating}
                    className="flex-1 bg-[#a78bfa] hover:bg-[#9333ea] text-white text-sm h-10 font-semibold"
                  >
                    <NavigationIcon className="h-4 w-4 mr-2" />
                    Start Navigation
                  </Button>
                ) : (
                  <Button
                    onClick={stopNavigating}
                    variant="outline"
                    className="flex-1 border-[#a78bfa] text-[#7c3aed] hover:bg-[#EDE9FE] text-sm h-10"
                  >
                    Stop Navigation
                  </Button>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.coordinates.lat},${selected.coordinates.lng}&travelmode=walking`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button variant="outline" className="border-[#E5E7EB] text-[#6B7280] h-10 px-3">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        )}


        {/* ── No selection: Popular destinations panel ── */}
        {!selected && (
          <div className="absolute bottom-4 left-4 right-4 z-[400]">
            <Card className="bg-white border-[#E5E7EB] shadow-lg p-4">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
                Popular Destinations
              </p>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => selectDestination(dest)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-[#F3F4F6] bg-[#F8F9FF] hover:border-[#a78bfa]/40 hover:bg-[#EDE9FE]/20 transition-all text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[dest.category] }}
                    />
                    <span className="text-xs text-[#374151] truncate leading-tight">{dest.name}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
