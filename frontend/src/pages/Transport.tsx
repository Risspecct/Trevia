import { useState } from "react";
import {
  ArrowRight, Train, Car, Bus, Bike, Navigation,
  Shield, AlertTriangle, MapPin, Zap, Clock, IndianRupee,
  Users, Star, CloudRain
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend } from "recharts";
import { locations } from "@/data/mockData";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";

/* ─── Mock Data ─── */

const routeOverview = {
  from: "India Gate, New Delhi",
  to: "Taj Mahal, Agra",
  distance: "230 km",
  estimatedTime: "4h 30m",
  costRange: "₹350 – ₹4,000",
  safetyScore: 8.5,
  advisory: "Moderate crowd, safe for day travel",
};

const transportModes = [
  {
    mode: "Metro + Train",
    icon: "🚆",
    duration: "4h 30m",
    cost: "₹350",
    comfort: "Medium",
    safety: 9.0,
    crowd: "Low",
    available: true,
    best: true,
  },
  {
    mode: "Cab",
    icon: "🚕",
    duration: "3h 15m",
    cost: "₹2,800",
    comfort: "High",
    safety: 8.0,
    crowd: "Private",
    available: true,
    best: false,
  },
  {
    mode: "Bus",
    icon: "🚌",
    duration: "5h 00m",
    cost: "₹450",
    comfort: "Low",
    safety: 7.5,
    crowd: "High",
    available: true,
    best: false,
  },
  {
    mode: "Self Drive",
    icon: "🚗",
    duration: "3h 30m",
    cost: "₹1,800",
    comfort: "High",
    safety: 7.0,
    crowd: "Private",
    available: true,
    best: false,
  },
  {
    mode: "Bike Taxi",
    icon: "🏍️",
    duration: "3h 45m",
    cost: "₹1,200",
    comfort: "Low",
    safety: 6.5,
    crowd: "N/A",
    available: false,
    best: false,
  },
];

const metroSteps = [
  { step: 1, text: "Walk 1.2 km to Central Secretariat Metro Station", type: "walk" },
  { step: 2, text: "Board Blue Line towards Rajiv Chowk", type: "metro" },
  { step: 3, text: "Change at Rajiv Chowk (2 min transfer)", type: "transfer" },
  { step: 4, text: "Take train from New Delhi Station to Agra Cantt", type: "train" },
  { step: 5, text: "Auto/Cab to Taj Mahal (3 km, ~₹80)", type: "walk" },
];

const comparisonData = [
  { mode: "Metro+Train", cost: 350, time: 270, safety: 9.0, overall: 8.5, color: "#b8860b" },
  { mode: "Cab", cost: 2800, time: 195, safety: 8.0, overall: 7.0, color: "#a67c00" },
  { mode: "Bus", cost: 450, time: 300, safety: 7.5, overall: 6.5, color: "#8a6d3b" },
  { mode: "Self Drive", cost: 1800, time: 210, safety: 7.0, overall: 7.5, color: "#dfc384" },
];

const liveVehicles = {
  cabs: [
    { driver: "Rajesh K.", distance: "1.2 km", eta: "4 min", type: "Sedan" },
    { driver: "Sunil M.", distance: "2.8 km", eta: "7 min", type: "Hatchback" },
    { driver: "Priya S.", distance: "3.5 km", eta: "10 min", type: "SUV" },
  ],
  bus: { distance: "850 m", eta: "6 min", crowd: "Medium", route: "NH-44 Express" },
  metro: { nextTrain: "3 min", coach: "Low crowd", platform: "Platform 2" },
};

const safetyAlerts = [
  { icon: "🌙", label: "Night risk zone near NH-44 Km 120–145", severity: "Moderate" },
  { icon: "⚠️", label: "Accident-prone: Mathura bypass junction", severity: "High" },
  { icon: "🏥", label: "Nearest hospital: 4 km (Agra Medical College)", severity: "Info" },
  { icon: "🌧️", label: "Light fog expected after 8 PM", severity: "Low" },
  { icon: "🛣️", label: "Road quality: Good (Yamuna Expressway)", severity: "Good" },
];

/* ─── Component ─── */

const Transport = () => {
  const [from, setFrom] = useState(locations[0].id);
  const [to, setTo] = useState(locations[1].id);
  const [activeMode, setActiveMode] = useState("Metro + Train");

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <ParticleCanvas particleCount={60} starCount={35} />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      <div className="relative z-10 max-w-5xl mx-auto p-6 space-y-6">

        {/* ── 1. Route Overview ── */}
        <MagicBento enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={12} glowColor="184, 134, 11" className="rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl">
            {/* Route Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1 w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none">
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <ArrowRight className="w-5 h-5 text-primary shrink-0" />
              <select value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none">
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <Navigation className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="font-bold text-foreground">{routeOverview.distance}</p>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Est. Time</p>
                <p className="font-bold text-foreground">{routeOverview.estimatedTime}</p>
              </div>
              <div className="text-center">
                <IndianRupee className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Cost Range</p>
                <p className="font-bold text-foreground">{routeOverview.costRange}</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Safety Score</p>
                <p className="font-bold text-primary">{routeOverview.safetyScore}/10</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4 italic">
              🛡️ {routeOverview.advisory}
            </p>
          </div>
        </MagicBento>

        {/* ── 2. Transport Mode Cards ── */}
        <div>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-4">Choose Your Mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {transportModes.map((m) => (
              <MagicBento key={m.mode} enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={350} particleCount={8} glowColor="184, 134, 11" className="rounded-2xl">
                <button
                  onClick={() => m.available && setActiveMode(m.mode)}
                  className={`w-full text-left glass-card gold-border p-5 rounded-2xl hover-lift h-full transition-all duration-300 ${activeMode === m.mode ? "ring-2 ring-primary gold-glow" : ""} ${!m.available ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {m.best && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full mb-3">
                      <Zap className="w-3 h-3" /> Best Option
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{m.mode}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.available ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {m.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium text-foreground">{m.duration}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Cost</span><span className="font-bold text-primary">{m.cost}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Comfort</span><span className="font-medium text-foreground">{m.comfort}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Safety</span><span className="font-medium text-foreground">{m.safety}/10</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Crowd</span><span className="font-medium text-foreground">{m.crowd}</span></div>
                  </div>
                </button>
              </MagicBento>
            ))}
          </div>
        </div>

        {/* ── 3. Metro + Train Route Preview ── */}
        <MagicBento enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={10} glowColor="184, 134, 11" className="rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl">
            <h2 className="font-bold text-foreground flex items-center gap-2 mb-5">
              <Train className="w-5 h-5 text-primary" /> Metro + Train Route Preview
            </h2>
            <div className="space-y-0">
              {metroSteps.map((s, i) => (
                <div key={s.step} className="flex gap-4">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${s.type === "metro" || s.type === "train" ? "bg-primary" : "bg-muted-foreground/50"}`} />
                    {i < metroSteps.length - 1 && <div className="w-0.5 flex-1 min-h-[32px] bg-primary/20" />}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-medium text-foreground">{s.text}</p>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {s.type === "walk" ? "🚶 Walk" : s.type === "metro" ? "🚇 Metro" : s.type === "transfer" ? "🔄 Transfer" : "🚂 Train"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MagicBento>

        {/* ── 4. Bar Chart Comparison ── */}
        <MagicBento enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={10} glowColor="184, 134, 11" className="rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl">
            <h2 className="font-bold text-foreground mb-5">📊 Route Comparison</h2>
            <p className="text-xs text-muted-foreground mb-4">Comparing Cost (₹), Travel Time (min), and Safety Score across modes</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="mode" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, color: "hsl(var(--foreground))" }}
                    labelStyle={{ fontWeight: 700, color: "hsl(var(--foreground))" }}
                    formatter={(value: number, name: string) => {
                      if (name === "cost") return [`₹${value}`, "Cost"];
                      if (name === "time") return [`${value} min`, "Travel Time"];
                      if (name === "safety") return [`${value}/10`, "Safety"];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }} />
                  <Bar yAxisId="left" dataKey="cost" name="Cost (₹)" radius={[6, 6, 0, 0]} barSize={24}>
                    {comparisonData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                  <Bar yAxisId="left" dataKey="time" name="Time (min)" radius={[6, 6, 0, 0]} barSize={24} fill="#8a6d3b" fillOpacity={0.6} />
                  <Bar yAxisId="right" dataKey="safety" name="Safety" radius={[6, 6, 0, 0]} barSize={24} fill="#50c878" fillOpacity={0.75} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MagicBento>

        {/* ── 5. Live Vehicle Distance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cabs */}
          <MagicBento enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={300} particleCount={6} glowColor="184, 134, 11" className="rounded-2xl lg:col-span-2">
            <div className="glass-card gold-border p-5 rounded-2xl h-full">
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
                <Car className="w-4 h-4 text-primary" /> Nearby Cabs
              </h3>
              <div className="space-y-3">
                {liveVehicles.cabs.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.driver}</p>
                      <p className="text-xs text-muted-foreground">{c.type} • {c.distance} away</p>
                    </div>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">ETA {c.eta}</span>
                  </div>
                ))}
              </div>
            </div>
          </MagicBento>

          {/* Bus + Metro */}
          <div className="space-y-4">
            <MagicBento enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={250} particleCount={5} glowColor="184, 134, 11" className="rounded-2xl">
              <div className="glass-card gold-border p-5 rounded-2xl">
                <h3 className="font-bold text-foreground flex items-center gap-2 mb-3">
                  <Bus className="w-4 h-4 text-primary" /> Next Bus
                </h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="text-foreground font-medium">{liveVehicles.bus.route}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Distance</span><span className="text-foreground font-medium">{liveVehicles.bus.distance}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">ETA</span><span className="text-primary font-bold">{liveVehicles.bus.eta}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Crowd</span><span className="text-foreground font-medium">{liveVehicles.bus.crowd}</span></div>
                </div>
              </div>
            </MagicBento>

            <MagicBento enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={250} particleCount={5} glowColor="184, 134, 11" className="rounded-2xl">
              <div className="glass-card gold-border p-5 rounded-2xl">
                <h3 className="font-bold text-foreground flex items-center gap-2 mb-3">
                  <Train className="w-4 h-4 text-primary" /> Next Metro
                </h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Next Train</span><span className="text-primary font-bold">{liveVehicles.metro.nextTrain}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Coach</span><span className="text-foreground font-medium">{liveVehicles.metro.coach}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Platform</span><span className="text-foreground font-medium">{liveVehicles.metro.platform}</span></div>
                </div>
              </div>
            </MagicBento>
          </div>
        </div>

        {/* ── 6. Safety Intelligence ── */}
        <MagicBento enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={10} glowColor="184, 134, 11" className="rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl">
            <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" /> Safety Intelligence
            </h2>
            <div className="space-y-3">
              {safetyAlerts.map((a, i) => {
                const sevColor = a.severity === "High" ? "bg-destructive/10 text-destructive" :
                  a.severity === "Moderate" ? "bg-accent/10 text-accent" :
                  a.severity === "Good" ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground";
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                    <span className="text-lg">{a.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{a.label}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${sevColor}`}>
                      {a.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </MagicBento>

      </div>
    </div>
  );
};

export default Transport;
