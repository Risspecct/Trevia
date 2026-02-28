import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import gsap from "gsap";
import {
  TrendingUp, AlertTriangle, ShieldCheck, Clock, Brain, MapPin,
  Search, Activity, BarChart3, Send, ChevronDown, X,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";
import api from "@/lib/api";
import axios from "axios";

// ── Leaflet icon fix ────────────────────────────────────────
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ── Types ───────────────────────────────────────────────────
interface Hotspot {
  lat: number;
  lng: number;
  area_name: string;
  crime_type: string;
  cases: number;
  risk: string;
}

interface CrimeData {
  city_center: { lat: number; lng: number };
  district: string;
  state: string;
  population: number;
  total_reported_incidents: number;
  crime_risk_index: number;
  safety_score: number;
  conviction_rate: number;
  category_distribution: { category: string; cases: number }[];
  year_trend: { year: number; cases: number }[];
  time_distribution: { time: string; count: number }[];
  ai_safety_directive: string;
  hotspots: Hotspot[];
  total_hotspots: number;
}

interface CityOption {
  state: string;
  district: string;
  label: string;
}

// ── Risk badge color ────────────────────────────────────────
const riskColor = (risk: string) => {
  switch (risk) {
    case "Critical": return "bg-red-600/20 text-red-400 border-red-500/30";
    case "High": return "bg-red-500/15 text-red-400 border-red-400/30";
    case "Medium": return "bg-amber-500/15 text-amber-400 border-amber-400/30";
    default: return "bg-emerald-500/15 text-emerald-400 border-emerald-400/30";
  }
};

// ── Custom tile layer ──────────────────────────────────
const MAP_TILE = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

// ── Chart custom tooltip ────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 border border-border rounded-lg px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-bold text-foreground">{label}</p>
      <p className="text-primary">count: {payload[0].value?.toLocaleString()}</p>
    </div>
  );
};

// ── Component ───────────────────────────────────────────────
const CrimeAnalysis = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CrimeData | null>(null);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [allCities, setAllCities] = useState<CityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch all cities on mount ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/crime/cities");
        setAllCities(res.data.data || []);
      } catch {
        // Silently fail — user can still type
      } finally {
        setCitiesLoading(false);
      }
    })();
  }, []);

  // ── Close dropdown on outside click ───────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Filter suggestions ────────────────────────────────────
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCities.slice(0, 15);
    return allCities.filter(
      (c) =>
        c.district.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.label.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query, allCities]);

  // ── API call ──────────────────────────────────────────────
  const fetchAnalysis = useCallback(async (state: string, district: string) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await api.post("/crime/analyze", { state, district, user_lat: 0, user_lng: 0 });
      setData(res.data.data);
      setShowDropdown(false);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.detail || e.message);
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (city: CityOption) => {
    setQuery(city.label);
    setShowDropdown(false);
    fetchAnalysis(city.state, city.district);
  };

  const handleSearch = () => {
    setShowDropdown(false);
    const match = allCities.find(
      (c) =>
        c.label.toLowerCase() === query.trim().toLowerCase() ||
        c.district.toLowerCase() === query.trim().toLowerCase()
    );
    if (match) {
      fetchAnalysis(match.state, match.district);
    } else if (query.trim()) {
      fetchAnalysis(query.trim(), query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
    setData(null);
    setError("");
    inputRef.current?.focus();
  };

  // ── GSAP entrance ─────────────────────────────────────────
  useEffect(() => {
    if (data && contentRef.current) {
      gsap.fromTo(
        contentRef.current.querySelectorAll(".anim-card"),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [data]);

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      {/* Background */}
      <ParticleCanvas particleCount={60} starCount={35} />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(184,134,11,0.10), transparent 70%)" }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      {/* Title */}
      <div className="relative z-10 max-w-3xl mx-auto mt-10 px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Crime Analysis Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground text-sm md:text-base">
          Search for a city above to view real-time crime analytics, risk assessment, hotspot mapping, and AI-powered safety directives.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative z-10 max-w-xl mx-auto mt-6 px-4" ref={dropdownRef}>
        <div className="relative">
          <div className="glass-card gold-border flex items-center rounded-2xl overflow-hidden">
            <Search className="w-5 h-5 ml-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={citiesLoading ? "Loading cities..." : "Search city... e.g. Hyderabad, Mumbai, Delhi"}
              className="flex-1 bg-transparent px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query && (
              <button onClick={clearSearch} className="px-2 hover:text-foreground text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="px-5 py-4 bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Send className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="mt-2 glass-card gold-border rounded-xl overflow-hidden max-h-72 overflow-y-auto shadow-xl custom-scrollbar">
              {suggestions.map((s, i) => (
                <button
                  key={`${s.state}-${s.district}-${i}`}
                  onClick={() => handleSelect(s)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors flex items-center gap-3 border-b border-border/20 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-foreground font-medium">{s.district}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{s.state}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground ml-auto -rotate-90" />
                </button>
              ))}
              {allCities.length > suggestions.length && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  Type to filter {allCities.length} cities...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="relative z-10 flex flex-col items-center justify-center mt-20 gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm animate-pulse">Analyzing crime data...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="relative z-10 max-w-xl mx-auto mt-8 px-4">
          <div className="glass-card gold-border rounded-2xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {data && (
        <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 mt-8 space-y-6">

          {/* ── Row 1: Stat cards ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Reported Incidents */}
            <MagicBento glowColor="184, 134, 11" enableBorderGlow clickEffect className="anim-card rounded-2xl">
              <div className="glass-card gold-border p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">Total Reported Incidents</span>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-4xl font-bold text-foreground tracking-tight">
                  {data.total_reported_incidents.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Data context: <span className="text-foreground font-medium">{data.district}</span></p>
              </div>
            </MagicBento>

            {/* Crime Risk Index */}
            <MagicBento glowColor="184, 134, 11" enableBorderGlow clickEffect className="anim-card rounded-2xl">
              <div className="glass-card gold-border p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">Crime Risk Index</span>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${data.crime_risk_index > 60 ? "text-red-500" : data.crime_risk_index > 35 ? "text-amber-400" : "text-emerald-400"}`}>
                    {data.crime_risk_index}
                  </span>
                  <span className="text-muted-foreground text-sm">/ 100</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${data.crime_risk_index > 60 ? "bg-red-500" : data.crime_risk_index > 35 ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${data.crime_risk_index}%` }}
                  />
                </div>
              </div>
            </MagicBento>

            {/* Overall Safety Score */}
            <MagicBento glowColor="184, 134, 11" enableBorderGlow clickEffect className="anim-card rounded-2xl">
              <div className="glass-card gold-border p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">Overall Safety Score</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${data.safety_score > 60 ? "text-emerald-400" : data.safety_score > 35 ? "text-amber-400" : "text-red-500"}`}>
                    {data.safety_score}
                  </span>
                  <span className="text-muted-foreground text-sm">/ 100</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${data.safety_score > 60 ? "bg-emerald-400" : data.safety_score > 35 ? "bg-amber-400" : "bg-red-500"}`}
                    style={{ width: `${data.safety_score}%` }}
                  />
                </div>
              </div>
            </MagicBento>
          </div>

          {/* ── Row 2: Charts ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Crime Category Distribution */}
            <MagicBento glowColor="184, 134, 11" enableBorderGlow clickEffect className="anim-card rounded-2xl">
              <div className="glass-card gold-border p-6 rounded-2xl">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground mb-6">
                  <Activity className="w-5 h-5 text-primary" />
                  Crime Category Distribution
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.category_distribution}>
                      <XAxis
                        dataKey="category"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="cases"
                        radius={[6, 6, 0, 0]}
                        fill="rgba(184,134,11,0.5)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </MagicBento>

            {/* Crime Trend (Year) */}
            <MagicBento glowColor="184, 134, 11" enableBorderGlow clickEffect className="anim-card rounded-2xl">
              <div className="glass-card gold-border p-6 rounded-2xl">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Crime Trend Over Years
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.year_trend}>
                      <CartesianGrid stroke="rgba(184,134,11,0.1)" />
                      <XAxis
                        dataKey="year"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="cases"
                        stroke="#c8b88a"
                        strokeWidth={2}
                        dot={{ fill: "#c8b88a", r: 5, stroke: "#1a1a1a", strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: "#c8b88a" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </MagicBento>
          </div>

          {/* ── Row 3: Heatmap + AI Directive ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Heatmap by Time of Day */}
            <MagicBento glowColor="184, 134, 11" enableBorderGlow clickEffect className="anim-card rounded-2xl lg:col-span-3">
              <div className="glass-card gold-border p-6 rounded-2xl">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground mb-6">
                  <Clock className="w-5 h-5 text-primary" />
                  Heatmap: Incidents by Time of Day
                </h3>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.time_distribution}>
                      <XAxis
                        dataKey="time"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        fill="#ef4444"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </MagicBento>

            {/* AI Safety Directive */}
            <MagicBento glowColor="184, 134, 11" enableBorderGlow clickEffect className="anim-card rounded-2xl lg:col-span-2">
              <div className="glass-card gold-border p-6 rounded-2xl flex flex-col justify-between h-full min-h-[340px]">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold mb-6">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="text-primary">AI Safety Directive</span>
                  </h3>
                  <blockquote className="text-foreground text-lg font-serif italic leading-relaxed">
                    "{data.ai_safety_directive}"
                  </blockquote>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/40">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary text-xs font-bold tracking-widest uppercase">
                    Trevia Analytics Agent
                  </span>
                </div>
              </div>
            </MagicBento>
          </div>

          {/* ── Row 4: Incident Hotspots ──────────────────── */}
          <MagicBento glowColor="184, 134, 11" enableBorderGlow clickEffect className="anim-card rounded-2xl">
            <div className="glass-card gold-border p-6 rounded-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: hotspot list */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-foreground mb-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Incident Hotspots
                  </h3>
                  <p className="text-muted-foreground text-sm mb-5">
                    Identified high-frequency zones for tourist vulnerabilities in {data.district}. Exercise caution.
                  </p>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {data.hotspots.map((h, i) => (
                      <div
                        key={i}
                        className="glass-card gold-border rounded-xl p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className={`w-4 h-4 flex-shrink-0 ${h.risk === "Critical" || h.risk === "High" ? "text-red-400" : h.risk === "Medium" ? "text-amber-400" : "text-emerald-400"}`} />
                          <div>
                            <p className="text-foreground text-sm font-semibold">{h.area_name}</p>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">{h.crime_type}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider whitespace-nowrap ${riskColor(h.risk)}`}>
                          {h.risk} Risk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Map */}
                <div className="rounded-2xl overflow-hidden border border-border/40 min-h-[400px] relative">
                  {/* IDENTIFIED RISK PERIMETER label */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                    <span className="text-red-400/60 text-[11px] font-bold tracking-[0.3em] uppercase">
                      Identified Risk Perimeter
                    </span>
                  </div>

                  <MapContainer
                    center={[data.city_center.lat, data.city_center.lng]}
                    zoom={13}
                    className="w-full h-full min-h-[400px]"
                    scrollWheelZoom
                    zoomControl={false}
                    key={`${data.city_center.lat}-${data.city_center.lng}`}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url={MAP_TILE}
                    />

                    {/* Hotspot markers */}
                    {data.hotspots.map((h, i) => (
                      <CircleMarker
                        key={i}
                        center={[h.lat, h.lng]}
                        radius={10}
                        pathOptions={{
                          color: h.risk === "Critical" || h.risk === "High" ? "#ef4444" : h.risk === "Medium" ? "#f59e0b" : "#22c55e",
                          fillColor: h.risk === "Critical" || h.risk === "High" ? "#ef4444" : h.risk === "Medium" ? "#f59e0b" : "#22c55e",
                          fillOpacity: 0.6,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="text-xs">
                            <strong>{h.area_name}</strong>
                            <br />
                            <span className="flex items-center gap-1 mt-1">
                              <Activity className="w-3 h-3" /> {h.crime_type}
                            </span>
                            <span className="block mt-1">Cases: {h.cases.toLocaleString()}</span>
                            <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${h.risk === "High" || h.risk === "Critical" ? "bg-red-100 text-red-600" : h.risk === "Medium" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-700"}`}>
                              {h.risk} Risk
                            </span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}

                    {/* Glow rings around hotspots */}
                    {data.hotspots.map((h, i) => (
                      <CircleMarker
                        key={`glow-${i}`}
                        center={[h.lat, h.lng]}
                        radius={20}
                        pathOptions={{
                          color: h.risk === "Critical" || h.risk === "High" ? "rgba(239,68,68,0.25)" : h.risk === "Medium" ? "rgba(245,158,11,0.25)" : "rgba(34,197,94,0.25)",
                          fillColor: "transparent",
                          weight: 1,
                          fillOpacity: 0,
                        }}
                      />
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          </MagicBento>
        </div>
      )}

    </div>
  );
};

export default CrimeAnalysis;
