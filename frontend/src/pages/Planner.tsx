import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  MapPin,
  Building2,
  CalendarDays,
  Users,
  Compass,
  Wallet,
  Loader2,
  ShieldCheck,
  Clock,
  Phone,
  Hospital,
  ChevronDown,
  ChevronUp,
  IndianRupee,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";
import { ALL_STATES, getCitiesForState } from "@/data/indianStatesAndCities";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Activity {
  time: string;
  place_name: string;
  latitude: number;
  longitude: number;
  description: string;
  safety_rationale: string;
  estimated_cost: string;
}

interface DayPlan {
  day: number;
  activities: Activity[];
}

interface EmergencyInfo {
  nearest_hospital_area: string;
  emergency_numbers: string;
}

interface ItineraryData {
  trip_summary: string;
  recommended_safe_neighborhood_for_stay: string;
  overall_safety_score: number;
  daily_itinerary: DayPlan[];
  emergency_info: EmergencyInfo;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const travelStyles = [
  { id: "Adventure", label: "Adventure", icon: "🏔️" },
  { id: "Culture & Heritage", label: "Culture & Heritage", icon: "🏛️" },
  { id: "Relaxation", label: "Relaxation", icon: "🌴" },
  { id: "Food & Cuisine", label: "Food & Cuisine", icon: "🍜" },
  { id: "Nature & Wildlife", label: "Nature & Wildlife", icon: "🌿" },
  { id: "Shopping", label: "Shopping", icon: "🛍️" },
];

const budgetOptions = ["Budget", "Mid-Range", "Luxury", "No Limit"];

const safetyColor = (score: number) => {
  if (score >= 8) return { text: "text-green-400", bg: "bg-green-500/15 border-green-500/30" };
  if (score >= 5) return { text: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30" };
  return { text: "text-red-400", bg: "bg-red-500/15 border-red-500/30" };
};

/* Fetch a thumbnail from Wikipedia for a place name */
const fetchPlaceImage = async (placeName: string): Promise<string | null> => {
  try {
    const query = encodeURIComponent(placeName);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${query}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source ?? data.originalimage?.source ?? null;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------ */
/*  Map sub-components                                                 */
/* ------------------------------------------------------------------ */

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
      { padding: [40, 40], maxZoom: 14 }
    );
  }, [positions, map]);
  return null;
}

/** Create a colored SVG marker icon for Leaflet */
function coloredIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 28 42">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 28 14 28s14-17.5 14-28C28 6.268 21.732 0 14 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="6" fill="#fff" opacity="0.9"/>
  </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const Planner = () => {
  // Form state
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [days, setDays] = useState("");
  const [people, setPeople] = useState("");
  const [style, setStyle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [budget, setBudget] = useState("");

  // Result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ItineraryData | null>(null);
  const [placeImages, setPlaceImages] = useState<Record<string, string | null>>({});

  // UI state
  const [openDays, setOpenDays] = useState<number[]>([]);
  const [filterDay, setFilterDay] = useState<number | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Animate form on mount
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current.querySelectorAll(".form-section"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }
      );
    }
  }, []);

  // Animate results when they arrive
  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(
        resultRef.current.querySelectorAll(".result-card"),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [result]);

  // Fetch place images when result arrives
  useEffect(() => {
    if (!result) return;
    const allActivities = result.daily_itinerary.flatMap((d) => d.activities);
    const uniquePlaces = [...new Set(allActivities.map((a) => a.place_name))];
    uniquePlaces.forEach(async (name) => {
      if (placeImages[name] !== undefined) return;
      const img = await fetchPlaceImage(name);
      setPlaceImages((prev) => ({ ...prev, [name]: img }));
    });
  }, [result]);

  // Open first day by default
  useEffect(() => {
    if (result && result.daily_itinerary.length > 0) {
      setOpenDays([1]);
    }
  }, [result]);

  const toggleDay = (day: number) => {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const canSubmit =
    city.trim() && state.trim() && days && people && style && startDate && budget;

  const handleGenerate = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setPlaceImages({});

    try {
      const res = await fetch("http://127.0.0.1:8000/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city.trim(),
          state: state.trim(),
          duration_days: parseInt(days),
          num_people: parseInt(people),
          travel_style: style,
          start_date: startDate,
          budget_level: budget,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to generate itinerary.");
      }

      const json = await res.json();
      setResult(json.data as ItineraryData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Gather all marker positions for the map
  const allPositions: { pos: [number, number]; activity: Activity; day: number }[] =
    result
      ? result.daily_itinerary.flatMap((d) =>
          d.activities.map((a) => ({
            pos: [a.latitude, a.longitude] as [number, number],
            activity: a,
            day: d.day,
          }))
        )
      : [];

  const dayColors = [
    "#b8860b",
    "#60a5fa",
    "#34d399",
    "#f472b6",
    "#a78bfa",
    "#fb923c",
    "#22d3ee",
  ];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <ParticleCanvas particleCount={70} starCount={40} />

      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(184,134,11,0.12), transparent 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      {/* ====  FORM  ==== */}
      <div ref={formRef} className="relative z-10 max-w-3xl mx-auto p-6 space-y-8">
        <div className="form-section text-center space-y-3 pt-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Plan Your <span className="gold-text">Safe Journey</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Tell us where you're headed. We'll craft a safety-first itinerary with AI-powered crime analytics.
          </p>
        </div>

        {/* City & State */}
        <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={12} glowColor="184, 134, 11" className="form-section rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="w-4 h-4 text-primary" /> State
                </label>
                <div className="relative">
                  <select value={state} onChange={(e) => { setState(e.target.value); setCity(""); }}
                    className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/30 transition-all">
                    <option value="">Choose a state...</option>
                    {ALL_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Building2 className="w-4 h-4 text-primary" /> City
                </label>
                <div className="relative">
                  <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!state}
                    className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">{state ? "Choose a city..." : "Select state first"}</option>
                    {getCitiesForState(state).map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </MagicBento>

        {/* Days, People, Start Date */}
        <div className="form-section grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={300} particleCount={8} glowColor="184, 134, 11" className="rounded-2xl">
            <div className="glass-card gold-border p-5 rounded-2xl space-y-2 h-full">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="w-4 h-4 text-primary" /> Days
              </label>
              <input type="number" min={1} max={7} value={days} onChange={(e) => setDays(e.target.value)} placeholder="1-7"
                className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </MagicBento>
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={300} particleCount={8} glowColor="184, 134, 11" className="rounded-2xl">
            <div className="glass-card gold-border p-5 rounded-2xl space-y-2 h-full">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="w-4 h-4 text-primary" /> People
              </label>
              <input type="number" min={1} max={20} value={people} onChange={(e) => setPeople(e.target.value)} placeholder="e.g. 2"
                className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </MagicBento>
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={300} particleCount={8} glowColor="184, 134, 11" className="rounded-2xl">
            <div className="glass-card gold-border p-5 rounded-2xl space-y-2 h-full">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="w-4 h-4 text-primary" /> Start Date
              </label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </MagicBento>
        </div>

        {/* Travel Style */}
        <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={12} glowColor="184, 134, 11" className="form-section rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Compass className="w-4 h-4 text-primary" /> Travel Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {travelStyles.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    style === s.id
                      ? "bg-primary text-primary-foreground gold-glow"
                      : "glass-card gold-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                  }`}>
                  <span>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          </div>
        </MagicBento>

        {/* Budget */}
        <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={10} glowColor="184, 134, 11" className="form-section rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet className="w-4 h-4 text-primary" /> Budget
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {budgetOptions.map((b) => (
                <button key={b} onClick={() => setBudget(b)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    budget === b
                      ? "bg-primary text-primary-foreground gold-glow"
                      : "glass-card gold-border text-muted-foreground hover:text-foreground"
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        </MagicBento>

        {/* Submit */}
        <div className="form-section flex justify-center pb-4">
          <button onClick={handleGenerate} disabled={loading || !canSubmit}
            className="group flex items-center gap-3 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover-lift gold-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            {loading ? "Generating..." : "Generate Itinerary"}
          </button>
        </div>

        {error && (
          <div className="form-section glass-card gold-border p-4 rounded-2xl border-red-500/30 bg-red-500/5 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {/* ====  RESULTS  ==== */}
      {result && (
        <div ref={resultRef} className="relative z-10 max-w-5xl mx-auto px-6 pb-16 space-y-6">

          {/* Trip Summary + Safety Score */}
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={500} particleCount={14} glowColor="184, 134, 11" className="result-card rounded-2xl">
            <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-display font-bold text-foreground">Trip Overview</h3>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${safetyColor(result.overall_safety_score).bg} ${safetyColor(result.overall_safety_score).text}`}>
                  <ShieldCheck className="w-4 h-4" />
                  Safety: {result.overall_safety_score}/10
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.trip_summary}</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="glass-card gold-border px-3 py-1.5 rounded-lg text-primary font-semibold">
                  🏠 Stay: {result.recommended_safe_neighborhood_for_stay}
                </span>
                <span className="glass-card gold-border px-3 py-1.5 rounded-lg text-primary font-semibold">
                  📍 {city}, {state}
                </span>
                <span className="glass-card gold-border px-3 py-1.5 rounded-lg text-primary font-semibold">
                  📅 {result.daily_itinerary.length} Days
                </span>
              </div>
            </div>
          </MagicBento>

          {/* Map */}
          <div className="result-card">
            <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={500} particleCount={10} glowColor="184, 134, 11" className="rounded-2xl">
              <div className="glass-card gold-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Activity Map
                  </h4>
                </div>
                {/* Day filter buttons */}
                <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-border">
                  <button
                    onClick={() => setFilterDay(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filterDay === null ? "bg-primary text-primary-foreground" : "glass-card gold-border text-muted-foreground hover:text-foreground"}`}
                  >
                    All Days
                  </button>
                  {result.daily_itinerary.map((d) => (
                    <button
                      key={d.day}
                      onClick={() => setFilterDay(d.day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${filterDay === d.day ? "bg-primary text-primary-foreground" : "glass-card gold-border text-muted-foreground hover:text-foreground"}`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: dayColors[(d.day - 1) % dayColors.length] }} />
                      Day {d.day}
                    </button>
                  ))}
                </div>
                <div style={{ height: "480px" }}>
                  <MapContainer
                    center={allPositions.length ? allPositions[0].pos : [22.5, 78.9]}
                    zoom={12}
                    className="w-full h-full"
                    scrollWheelZoom
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FitBounds positions={(filterDay ? allPositions.filter((p) => p.day === filterDay) : allPositions).map((p) => p.pos)} />
                    {(filterDay ? allPositions.filter((p) => p.day === filterDay) : allPositions).map((item, i) => (
                      <Marker
                        key={i}
                        position={item.pos}
                        icon={coloredIcon(dayColors[(item.day - 1) % dayColors.length])}
                      >
                        <Popup>
                          <div style={{ maxWidth: 240 }}>
                            {placeImages[item.activity.place_name] && (
                              <img
                                src={placeImages[item.activity.place_name]!}
                                alt={item.activity.place_name}
                                style={{ width: "100%", borderRadius: 8, marginBottom: 8, maxHeight: 140, objectFit: "cover" }}
                              />
                            )}
                            <strong style={{ fontSize: 13 }}>{item.activity.place_name}</strong>
                            <p style={{ fontSize: 11, marginTop: 4, color: "#666" }}>
                              Day {item.day} · {item.activity.time}
                            </p>
                            <p style={{ fontSize: 11, marginTop: 4 }}>{item.activity.description}</p>
                            <p style={{ fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                              💰 {item.activity.estimated_cost}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
                {/* Day color legend */}
                <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-border">
                  {result.daily_itinerary.map((d) => (
                    <span key={d.day} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: dayColors[(d.day - 1) % dayColors.length] }} />
                      Day {d.day}
                    </span>
                  ))}
                </div>
              </div>
            </MagicBento>
          </div>

          {/* Daily Itinerary */}
          {result.daily_itinerary.map((dayPlan) => (
            <div key={dayPlan.day} className="result-card">
              <MagicBento textAutoHide enableBorderGlow clickEffect glowColor={dayColors[(dayPlan.day - 1) % dayColors.length].replace("#", "").match(/.{2}/g)?.map((h) => parseInt(h, 16)).join(", ") || "184, 134, 11"} className="rounded-2xl">
                <div className="glass-card gold-border rounded-2xl overflow-hidden">
                  {/* Day Header */}
                  <button onClick={() => toggleDay(dayPlan.day)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold"
                        style={{ background: dayColors[(dayPlan.day - 1) % dayColors.length] + "22", color: dayColors[(dayPlan.day - 1) % dayColors.length], border: `1px solid ${dayColors[(dayPlan.day - 1) % dayColors.length]}44` }}>
                        {dayPlan.day}
                      </span>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">Day {dayPlan.day}</h4>
                        <p className="text-xs text-muted-foreground">{dayPlan.activities.length} activities planned</p>
                      </div>
                    </div>
                    {openDays.includes(dayPlan.day) ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  {/* Activities */}
                  {openDays.includes(dayPlan.day) && (
                    <div className="px-6 pb-5 space-y-4">
                      {dayPlan.activities.map((activity, idx) => (
                        <div key={idx} className="flex gap-4 group">
                          {/* Timeline line */}
                          <div className="flex flex-col items-center">
                            <span className="w-3 h-3 rounded-full shrink-0 mt-1"
                              style={{ background: dayColors[(dayPlan.day - 1) % dayColors.length], boxShadow: `0 0 8px ${dayColors[(dayPlan.day - 1) % dayColors.length]}66` }} />
                            {idx < dayPlan.activities.length - 1 && (
                              <span className="w-px flex-1 mt-1" style={{ background: `${dayColors[(dayPlan.day - 1) % dayColors.length]}33` }} />
                            )}
                          </div>

                          {/* Card */}
                          <div className="flex-1 glass-card gold-border rounded-xl p-4 space-y-3 mb-2 group-hover:border-primary/40 transition-all">
                            <div className="flex items-start gap-3">
                              {/* Place image */}
                              {placeImages[activity.place_name] && (
                                <img src={placeImages[activity.place_name]!} alt={activity.place_name}
                                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span className="text-xs font-semibold text-primary">{activity.time}</span>
                                </div>
                                <h5 className="text-sm font-semibold text-foreground mt-1 leading-tight">{activity.place_name}</h5>
                              </div>
                              <span className="flex items-center gap-1 text-xs font-semibold text-primary whitespace-nowrap glass-card gold-border px-2 py-1 rounded-lg shrink-0">
                                <IndianRupee className="w-3 h-3" />
                                {activity.estimated_cost.replace(/INR/i, "").trim()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{activity.description}</p>
                            <div className="flex items-start gap-2 text-xs bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground leading-relaxed">{activity.safety_rationale}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </MagicBento>
            </div>
          ))}

          {/* Emergency Info */}
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={8} glowColor="248, 113, 113" className="result-card rounded-2xl">
            <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
              <h4 className="flex items-center gap-2 text-base font-semibold text-red-400">
                <Phone className="w-5 h-5" /> Emergency Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 glass-card gold-border px-4 py-3 rounded-xl">
                  <Hospital className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Nearest Hospital Area</span>
                    <span className="text-muted-foreground">{result.emergency_info.nearest_hospital_area}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 glass-card gold-border px-4 py-3 rounded-xl">
                  <Phone className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Emergency Numbers</span>
                    <span className="text-muted-foreground">{result.emergency_info.emergency_numbers}</span>
                  </div>
                </div>
              </div>
            </div>
          </MagicBento>
        </div>
      )}
    </div>
  );
};

export default Planner;
