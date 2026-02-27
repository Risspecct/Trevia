import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { AlertTriangle, Droplets, Users } from "lucide-react";
import { locations } from "@/data/mockData";
import MapView from "@/components/MapView";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";

const overlays = [
  { id: "crime", label: "Crime Heatmap", icon: <AlertTriangle className="w-4 h-4" /> },
  { id: "clean", label: "Cleanliness", icon: <Droplets className="w-4 h-4" /> },
  { id: "crowd", label: "Crowd Level", icon: <Users className="w-4 h-4" /> },
];

const insightData: Record<string, { location: string; detail: string; severity: string }[]> = {
  crime: [
    { location: "India Gate", detail: "Low pickpocket risk near vendors", severity: "Low" },
    { location: "Marina Beach", detail: "Moderate incidents after 9 PM", severity: "Medium" },
    { location: "Taj Mahal", detail: "Scam risks near entry gates — beware of fake guides", severity: "Medium" },
    { location: "Jaipur City Palace", detail: "Safe during day, avoid Johari Bazaar alleys post 10 PM", severity: "Low" },
    { location: "Leh Ladakh", detail: "Very safe — low crime, occasional vehicle theft reported", severity: "Low" },
    { location: "Varanasi Ghats", detail: "Petty theft common during Ganga Aarti crowds", severity: "High" },
    { location: "Goa Beaches", detail: "Drug-related incidents in North Goa after midnight", severity: "High" },
    { location: "Hampi Ruins", detail: "Extremely safe, minimal crime activity", severity: "Low" },
  ],
  clean: [
    { location: "Taj Mahal", detail: "Well maintained, daily cleaning", severity: "Good" },
    { location: "Marina Beach", detail: "Littering concerns on weekends", severity: "Poor" },
    { location: "India Gate", detail: "Generally clean, food stalls leave litter at night", severity: "Medium" },
    { location: "Jaipur City Palace", detail: "Heritage-maintained, clean walkways", severity: "Good" },
    { location: "Leh Ladakh", detail: "Pristine environment, eco-tourism enforced", severity: "Good" },
    { location: "Varanasi Ghats", detail: "Mixed — some ghats well-kept, others heavily polluted", severity: "Poor" },
    { location: "Goa Beaches", detail: "Beach cleaning crews active mornings only", severity: "Medium" },
    { location: "Hampi Ruins", detail: "ASI-maintained, clean and well-preserved", severity: "Good" },
  ],
  crowd: [
    { location: "India Gate", detail: "Peak hours 5–8 PM", severity: "High" },
    { location: "Leh Ladakh", detail: "Sparse except summer season", severity: "Low" },
    { location: "Taj Mahal", detail: "Extremely crowded on weekends & holidays, arrive before 7 AM", severity: "High" },
    { location: "Jaipur City Palace", detail: "Moderate crowds, manageable with timed entry", severity: "Medium" },
    { location: "Marina Beach", detail: "Packed during evenings and festivals", severity: "High" },
    { location: "Varanasi Ghats", detail: "Massive crowds during Ganga Aarti (6–7 PM)", severity: "High" },
    { location: "Goa Beaches", detail: "Seasonal — heavy Dec-Jan, quiet monsoon months", severity: "Medium" },
    { location: "Hampi Ruins", detail: "Low footfall, peaceful exploration", severity: "Low" },
  ],
};

const Insights = () => {
  const [activeOverlays, setActiveOverlays] = useState<string[]>(["crime"]);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleOverlay = (id: string) => {
    setActiveOverlays((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current.querySelectorAll(".insight-item"),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }
      );
    }
  }, [activeOverlays]);

  const markers = locations.map((l) => ({
    lat: l.lat,
    lng: l.lng,
    label: l.name,
  }));

  const severityColor = (s: string) => {
    if (["Low", "Good"].includes(s)) return "bg-primary/10 text-primary";
    if (["Medium"].includes(s)) return "bg-accent/10 text-accent";
    return "bg-destructive/10 text-destructive";
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <ParticleCanvas particleCount={60} starCount={35} />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      <div className="relative z-10 flex flex-col lg:flex-row gap-4 p-4 lg:p-6">
        {/* Map */}
        <div className="flex-1 min-h-[500px]">
          <div className="flex gap-2 mb-4">
            {overlays.map((o) => (
              <button
                key={o.id}
                onClick={() => toggleOverlay(o.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeOverlays.includes(o.id)
                    ? "bg-primary text-primary-foreground gold-glow"
                    : "glass-card gold-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.icon} {o.label}
              </button>
            ))}
          </div>
          <MapView center={[22.5, 78.9]} zoom={5} markers={markers} className="h-[calc(100%-50px)]" />
        </div>

        {/* Panel */}
        <div ref={panelRef} className="lg:w-96 shrink-0 space-y-3">
          {activeOverlays.flatMap((oid) =>
            (insightData[oid] || []).map((item, i) => (
              <MagicBento
                key={`${oid}-${i}`}
                enableStars
                enableSpotlight
                enableBorderGlow={true}
                clickEffect
                spotlightRadius={300}
                particleCount={8}
                glowColor="212, 175, 55"
                className="insight-item rounded-xl"
              >
                <div className="glass-card gold-border p-4 rounded-xl hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm text-foreground">{item.location}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(item.severity)}`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </MagicBento>
            ))
          )}
          {activeOverlays.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">
              Select an overlay to view insights
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
