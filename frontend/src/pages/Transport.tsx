import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import gsap from "gsap";
import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import {
  Car, Train, Footprints, Bike, ArrowRight,
  Navigation, Clock, Route, Search,
  Loader2, AlertCircle, MapPin, ChevronDown, ChevronUp,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";

/* ─── Constants ─── */

const API = "http://127.0.0.1:8000";

const MAP_TILE =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

const MODES = [
  { key: "driving",   label: "Driving",  icon: Car,        emoji: "🚗" },
  { key: "transit",   label: "Transit",  icon: Train,      emoji: "🚆" },
  { key: "walking",   label: "Walking",  icon: Footprints, emoji: "🚶" },
  { key: "bicycling", label: "Cycling",  icon: Bike,       emoji: "🚲" },
] as const;

/* ─── Types ─── */

interface Step {
  instruction: string;
  distance: string;
  duration: string;
  travel_mode: string;
  transit_details?: Record<string, unknown> | null;
}

interface RouteData {
  distance: string;
  duration: string;
  via?: string;
  start_address: string;
  end_address: string;
  polyline: string;
  steps: Step[];
  error?: string;
}

interface ApiResponse {
  origin: string;
  destination: string;
  routes: Record<string, RouteData>;
  ride_links: { uber: string; ola: string };
}

interface PlaceSuggestion {
  description: string;
  place_id: string;
  gps: { lat: number; lng: number };
}

/* ─── Debounced Autocomplete Hook ─── */

function useAutocomplete(debounceMs = 350) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (timerRef.current) clearTimeout(timerRef.current);

      if (value.trim().length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      timerRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API}/places/autocomplete`, {
            params: { input: value.trim() },
          });
          const list: PlaceSuggestion[] = res.data?.suggestions ?? [];
          setSuggestions(list);
          setOpen(list.length > 0);
        } catch {
          setSuggestions([]);
          setOpen(false);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    [debounceMs],
  );

  const select = useCallback((s: PlaceSuggestion) => {
    setQuery(s.description);
    setSuggestions([]);
    setOpen(false);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { query, setQuery, suggestions, open, loading, handleChange, select, close };
}

/* ─── Polyline Decoder ─── */

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0,
    lat = 0,
    lng = 0;
  while (index < encoded.length) {
    let shift = 0,
      result = 0,
      byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

/* ─── Map helper ─── */

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 13);
      return;
    }
    map.fitBounds(
      positions.map((p) => [p[0], p[1]]) as [number, number][],
      { padding: [40, 40], maxZoom: 14 },
    );
  }, [positions, map]);
  return null;
}

/* ─── Strip HTML tags from instruction text ─── */
function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/* ─── Component ─── */

const Transport = () => {
  const originAc = useAutocomplete();
  const destAc = useAutocomplete();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [activeMode, setActiveMode] = useState("driving");
  const [stepsOpen, setStepsOpen] = useState(true);
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  /* GSAP entrance */
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(
      wrapRef.current.children,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" },
    );
  }, []);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) originAc.close();
      if (destRef.current && !destRef.current.contains(e.target as Node)) destAc.close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Fetch routes */
  const fetchRoutes = async () => {
    if (!originAc.query.trim() || !destAc.query.trim()) return;
    originAc.close();
    destAc.close();
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await axios.post(`${API}/transport/routes`, {
        origin: originAc.query.trim(),
        destination: destAc.query.trim(),
      });
      setData(res.data);
      // Default to first mode that succeeded
      const first = MODES.find((m) => !res.data.routes[m.key]?.error);
      if (first) setActiveMode(first.key);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* Derived state */
  const activeRoute: RouteData | undefined = data?.routes[activeMode];

  const polylinePositions = useMemo<[number, number][]>(() => {
    if (!activeRoute?.polyline) return [];
    try {
      return decodePolyline(activeRoute.polyline);
    } catch {
      return [];
    }
  }, [activeRoute]);

  const successCount = data
    ? MODES.filter((m) => !data.routes[m.key]?.error).length
    : 0;

  /* ─── Render ─── */
  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <ParticleCanvas particleCount={60} starCount={35} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      <div ref={wrapRef} className="relative z-10 max-w-5xl mx-auto p-6 space-y-6">

        {/* ── Title ── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Transport Routes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time route comparison powered by Google Maps
          </p>
        </div>

        {/* ── 1. Route Input ── */}
        <MagicBento
          enableStars enableSpotlight enableBorderGlow clickEffect
          spotlightRadius={400} particleCount={12} glowColor="184, 134, 11"
          className="rounded-2xl" overflowVisible
        >
          <div className="glass-card gold-border p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              {/* Origin */}
              <div className="flex-1 w-full relative" ref={originRef}>
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-primary z-10" />
                <input
                  value={originAc.query}
                  onChange={(e) => originAc.handleChange(e.target.value)}
                  onFocus={() => originAc.suggestions.length > 0 && originAc.handleChange(originAc.query)}
                  placeholder="Origin — e.g. India Gate, New Delhi"
                  className="w-full glass-card gold-border pl-12 pr-4 py-4 rounded-xl text-base bg-card text-foreground outline-none placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && fetchRoutes()}
                />
                {originAc.open && (
                  <ul className="absolute left-0 right-0 top-full mt-1 z-50 glass-card gold-border rounded-xl overflow-hidden shadow-lg max-h-56 overflow-y-auto">
                    {originAc.suggestions.map((s) => (
                      <li
                        key={s.place_id}
                        onMouseDown={() => originAc.select(s)}
                        className="px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 cursor-pointer flex items-start gap-2 border-b border-border/30 last:border-0 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{s.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {originAc.loading && (
                  <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>

              <ArrowRight className="w-5 h-5 text-primary shrink-0 hidden sm:block self-center" />

              {/* Destination */}
              <div className="flex-1 w-full relative" ref={destRef}>
                <Navigation className="absolute left-4 top-4 w-5 h-5 text-primary z-10" />
                <input
                  value={destAc.query}
                  onChange={(e) => destAc.handleChange(e.target.value)}
                  onFocus={() => destAc.suggestions.length > 0 && destAc.handleChange(destAc.query)}
                  placeholder="Destination — e.g. Taj Mahal, Agra"
                  className="w-full glass-card gold-border pl-12 pr-4 py-4 rounded-xl text-base bg-card text-foreground outline-none placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && fetchRoutes()}
                />
                {destAc.open && (
                  <ul className="absolute left-0 right-0 top-full mt-1 z-50 glass-card gold-border rounded-xl overflow-hidden shadow-lg max-h-56 overflow-y-auto">
                    {destAc.suggestions.map((s) => (
                      <li
                        key={s.place_id}
                        onMouseDown={() => destAc.select(s)}
                        className="px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 cursor-pointer flex items-start gap-2 border-b border-border/30 last:border-0 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{s.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {destAc.loading && (
                  <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Search button */}
              <button
                onClick={fetchRoutes}
                disabled={loading || !originAc.query.trim() || !destAc.query.trim()}
                className="shrink-0 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {loading ? "Searching…" : "Find Routes"}
              </button>
            </div>
          </div>
        </MagicBento>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Fetching routes for all transport modes…
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <MagicBento enableBorderGlow glowColor="184, 134, 11" className="rounded-2xl">
            <div className="glass-card gold-border p-6 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </MagicBento>
        )}

        {/* ── Results ── */}
        {data && !loading && (
          <>
            {/* ── 2. Mode Tabs ── */}
            <div>
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold">
                {successCount} mode{successCount !== 1 && "s"} available
              </p>
              <div className="flex gap-2 flex-wrap">
                {MODES.map((m) => {
                  const route = data.routes[m.key];
                  const hasError = !!route?.error;
                  const Icon = m.icon;
                  const isActive = activeMode === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => !hasError && setActiveMode(m.key)}
                      disabled={hasError}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border
                        ${isActive
                          ? "bg-primary text-primary-foreground border-primary gold-glow"
                          : hasError
                            ? "opacity-40 cursor-not-allowed border-border bg-card/50 text-muted-foreground"
                            : "border-border bg-card/80 text-foreground hover:border-primary/50 hover:bg-primary/5"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                      {!hasError && route && (
                        <span className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {route.duration}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Active Route Content ── */}
            {activeRoute && !activeRoute.error ? (
              <>
                {/* ── 3. Stats Bar ── */}
                <MagicBento
                  enableStars enableSpotlight enableBorderGlow clickEffect
                  spotlightRadius={400} particleCount={10} glowColor="184, 134, 11"
                  className="rounded-2xl"
                >
                  <div className="glass-card gold-border p-6 rounded-2xl">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <div className="text-center">
                        <Route className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-xs text-muted-foreground">Distance</p>
                        <p className="font-bold text-foreground">{activeRoute.distance}</p>
                      </div>
                      <div className="text-center">
                        <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-bold text-foreground">{activeRoute.duration}</p>
                      </div>
                      {activeRoute.via && (
                        <div className="text-center col-span-2 sm:col-span-1">
                          <Navigation className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <p className="text-xs text-muted-foreground">Via</p>
                          <p className="font-bold text-foreground text-sm truncate max-w-[200px] mx-auto">
                            {activeRoute.via}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </MagicBento>

                {/* ── 4. Map ── */}
                {polylinePositions.length > 0 && (
                  <MagicBento
                    enableBorderGlow glowColor="184, 134, 11"
                    className="rounded-2xl"
                  >
                    <div className="glass-card gold-border rounded-2xl overflow-hidden" style={{ height: 420 }}>
                      <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        scrollWheelZoom
                        style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                          url={MAP_TILE}
                        />
                        <Polyline
                          positions={polylinePositions}
                          pathOptions={{
                            color: "#b8860b",
                            weight: 5,
                            opacity: 0.85,
                            dashArray: activeMode === "walking" ? "8 12" : undefined,
                          }}
                        />
                        <FitBounds positions={polylinePositions} />
                      </MapContainer>
                    </div>
                  </MagicBento>
                )}

                {/* ── 5. Step-by-step Directions ── */}
                {activeRoute.steps.length > 0 && (
                  <MagicBento
                    enableStars enableSpotlight enableBorderGlow clickEffect
                    spotlightRadius={400} particleCount={10} glowColor="184, 134, 11"
                    className="rounded-2xl"
                  >
                    <div className="glass-card gold-border p-6 rounded-2xl">
                      <button
                        onClick={() => setStepsOpen((v) => !v)}
                        className="w-full flex items-center justify-between mb-4"
                      >
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                          {MODES.find((m) => m.key === activeMode)?.emoji}{" "}
                          Step-by-Step Directions
                          <span className="text-xs font-normal text-muted-foreground">
                            ({activeRoute.steps.length} steps)
                          </span>
                        </h2>
                        {stepsOpen ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      {stepsOpen && (
                        <div className="space-y-0 max-h-[400px] overflow-y-auto pr-1">
                          {activeRoute.steps.map((s, i) => (
                            <div key={i} className="flex gap-4">
                              {/* Timeline */}
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full shrink-0 bg-primary" />
                                {i < activeRoute.steps.length - 1 && (
                                  <div className="w-0.5 flex-1 min-h-[28px] bg-primary/20" />
                                )}
                              </div>
                              {/* Content */}
                              <div className="pb-4 flex-1 min-w-0">
                                <p className="text-sm text-foreground leading-snug">
                                  {stripHtml(s.instruction)}
                                </p>
                                <div className="flex gap-3 mt-1">
                                  {s.distance && (
                                    <span className="text-[11px] text-muted-foreground">
                                      {s.distance}
                                    </span>
                                  )}
                                  {s.duration && (
                                    <span className="text-[11px] text-muted-foreground">
                                      {s.duration}
                                    </span>
                                  )}
                                  {s.travel_mode && (
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary/70">
                                      {s.travel_mode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </MagicBento>
                )}

                {/* ── 6. All Modes Overview ── */}
                <MagicBento
                  enableStars enableSpotlight enableBorderGlow clickEffect
                  spotlightRadius={400} particleCount={10} glowColor="184, 134, 11"
                  className="rounded-2xl"
                >
                  <div className="glass-card gold-border p-6 rounded-2xl">
                    <h2 className="font-bold text-foreground mb-4">
                      📊 All Modes Overview
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MODES.map((m) => {
                        const r = data.routes[m.key];
                        const Icon = m.icon;
                        const hasErr = !!r?.error;
                        return (
                          <button
                            key={m.key}
                            onClick={() => !hasErr && setActiveMode(m.key)}
                            disabled={hasErr}
                            className={`text-left p-4 rounded-xl border transition-all duration-200
                              ${activeMode === m.key
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card/50 hover:border-primary/30"
                              }
                              ${hasErr ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg">{m.emoji}</span>
                              <span className="font-semibold text-foreground">{m.label}</span>
                              {activeMode === m.key && (
                                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                            {hasErr ? (
                              <p className="text-xs text-muted-foreground italic">{r?.error}</p>
                            ) : (
                              <div className="flex gap-4 text-sm">
                                <span className="text-muted-foreground">
                                  <Route className="w-3.5 h-3.5 inline mr-1" />{r?.distance}
                                </span>
                                <span className="text-muted-foreground">
                                  <Clock className="w-3.5 h-3.5 inline mr-1" />{r?.duration}
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </MagicBento>
              </>
            ) : activeRoute?.error ? (
              /* Error for the selected mode */
              <MagicBento enableBorderGlow glowColor="184, 134, 11" className="rounded-2xl">
                <div className="glass-card gold-border p-6 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      No {MODES.find((m) => m.key === activeMode)?.label} route available
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activeRoute.error}</p>
                  </div>
                </div>
              </MagicBento>
            ) : null}
          </>
        )}

        {/* ── Empty State ── */}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Route className="w-12 h-12 text-primary/30" />
            <div>
              <p className="text-muted-foreground text-sm">
                Enter an origin and destination above to compare transport routes.
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Try "India Gate, New Delhi" → "Taj Mahal, Agra"
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Transport;
