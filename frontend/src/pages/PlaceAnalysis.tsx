import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Search,
  MapPin,
  Building2,
  Landmark,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";

interface SafetyDetails {
  risk_level: string;
  crime_context: string;
  safety_tips: string[];
}

interface ImportantInfo {
  best_time: string;
  needs_to_know: string[];
}

interface PlaceData {
  place_name: string;
  summary: string;
  pros: string[];
  cons: string[];
  safety_details: SafetyDetails;
  important_info: ImportantInfo;
}

const riskColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "low":
      return "text-green-400";
    case "medium":
      return "text-yellow-400";
    case "high":
      return "text-red-400";
    default:
      return "text-muted-foreground";
  }
};

const riskBg = (level: string) => {
  switch (level.toLowerCase()) {
    case "low":
      return "bg-green-500/10 border-green-500/30";
    case "medium":
      return "bg-yellow-500/10 border-yellow-500/30";
    case "high":
      return "bg-red-500/10 border-red-500/30";
    default:
      return "bg-muted/10 border-muted/30";
  }
};

const PlaceAnalysis = () => {
  const [placeName, setPlaceName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlaceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current.querySelectorAll(".form-section"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }
      );
    }
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(
        resultRef.current.querySelectorAll(".result-card"),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [result]);

  const handleAnalyze = async () => {
    if (!placeName.trim() || !city.trim() || !state.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/place/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_name: placeName.trim(),
          city: city.trim(),
          state: state.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to analyze the place.");
      }

      const json = await res.json();
      setResult(json.data as PlaceData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <ParticleCanvas particleCount={70} starCount={40} />

      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(214,186,158,0.12), transparent 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border backdrop-blur-sm">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      {/* Search Form */}
      <div ref={formRef} className="relative z-10 max-w-3xl mx-auto p-6 space-y-8">
        <div className="form-section text-center space-y-3 pt-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Analyze a <span className="gold-text">Place</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Enter a place name along with its city and state to get AI-powered
            safety insights, pros & cons, and important travel info.
          </p>
        </div>

        <MagicBento
          textAutoHide
          enableStars
          enableSpotlight
          enableBorderGlow
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="212, 175, 55"
          className="form-section rounded-2xl"
        >
          <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
            {/* Place Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Landmark className="w-4 h-4 text-primary" />
                Place Name
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="e.g. Bara Imambara, Taj Mahal..."
                className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Building2 className="w-4 h-4 text-primary" />
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lucknow"
                  className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Uttar Pradesh"
                  className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleAnalyze}
                disabled={loading || !placeName.trim() || !city.trim() || !state.trim()}
                className="group flex items-center gap-3 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover-lift gold-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                {loading ? "Analyzing..." : "Analyze Place"}
              </button>
            </div>
          </div>
        </MagicBento>

        {error && (
          <div className="form-section glass-card gold-border p-4 rounded-2xl border-red-500/30 bg-red-500/5 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div ref={resultRef} className="relative z-10 max-w-4xl mx-auto px-6 pb-12 space-y-6">
          {/* Place Name & Summary */}
          <MagicBento
            textAutoHide
            enableStars
            enableSpotlight
            enableBorderGlow
            clickEffect
            spotlightRadius={500}
            particleCount={14}
            glowColor="212, 175, 55"
            className="result-card rounded-2xl"
          >
            <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-3">
                <Landmark className="w-7 h-7 text-primary" />
                {result.place_name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.summary}
              </p>
            </div>
          </MagicBento>

          {/* Pros & Cons */}
          <div className="result-card grid grid-cols-1 md:grid-cols-2 gap-4">
            <MagicBento
              textAutoHide
              enableStars
              enableSpotlight
              enableBorderGlow
              clickEffect
              spotlightRadius={350}
              particleCount={8}
              glowColor="74, 222, 128"
              className="rounded-2xl"
            >
              <div className="glass-card gold-border p-6 rounded-2xl space-y-4 h-full">
                <h4 className="flex items-center gap-2 text-base font-semibold text-green-400">
                  <ThumbsUp className="w-5 h-5" />
                  Pros
                </h4>
                <ul className="space-y-2">
                  {result.pros.map((pro, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            </MagicBento>

            <MagicBento
              textAutoHide
              enableStars
              enableSpotlight
              enableBorderGlow
              clickEffect
              spotlightRadius={350}
              particleCount={8}
              glowColor="248, 113, 113"
              className="rounded-2xl"
            >
              <div className="glass-card gold-border p-6 rounded-2xl space-y-4 h-full">
                <h4 className="flex items-center gap-2 text-base font-semibold text-red-400">
                  <ThumbsDown className="w-5 h-5" />
                  Cons
                </h4>
                <ul className="space-y-2">
                  {result.cons.map((con, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </MagicBento>
          </div>

          {/* Safety Details */}
          <MagicBento
            textAutoHide
            enableStars
            enableSpotlight
            enableBorderGlow
            clickEffect
            spotlightRadius={500}
            particleCount={10}
            glowColor="250, 204, 21"
            className="result-card rounded-2xl"
          >
            <div className="glass-card gold-border p-6 rounded-2xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h4 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <ShieldAlert className="w-5 h-5 text-yellow-400" />
                  Safety Alert
                </h4>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border ${riskBg(
                    result.safety_details.risk_level
                  )} ${riskColor(result.safety_details.risk_level)}`}
                >
                  {result.safety_details.risk_level} Risk
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.safety_details.crime_context}
              </p>
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Safety Tips
                </h5>
                <ul className="space-y-2">
                  {result.safety_details.safety_tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </MagicBento>

          {/* Important Info */}
          <MagicBento
            textAutoHide
            enableStars
            enableSpotlight
            enableBorderGlow
            clickEffect
            spotlightRadius={500}
            particleCount={10}
            glowColor="96, 165, 250"
            className="result-card rounded-2xl"
          >
            <div className="glass-card gold-border p-6 rounded-2xl space-y-5">
              <h4 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Info className="w-5 h-5 text-blue-400" />
                Important Information
              </h4>

              <div className="flex items-center gap-3 glass-card gold-border px-4 py-3 rounded-xl">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Best Time to Visit
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {result.important_info.best_time}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-foreground">
                  Things to Know
                </h5>
                <ul className="space-y-2">
                  {result.important_info.needs_to_know.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </MagicBento>
        </div>
      )}
    </div>
  );
};

export default PlaceAnalysis;
