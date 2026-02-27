import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Search,
  Loader2,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquareQuote,
  Landmark,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";

interface ReviewItem {
  rating: number;
  text: string;
  score: number;
}

interface ReviewData {
  place_name: string;
  best_review: ReviewItem;
  worst_review: ReviewItem;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const SentimentBar = ({ score, label }: { score: number; label: string }) => {
  const pct = Math.round(score * 100);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(barRef.current, { width: "0%" }, { width: `${pct}%`, duration: 1.2, ease: "power3.out" });
    }
  }, [pct]);

  const color =
    pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold text-foreground">{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
        <div ref={barRef} className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
};

const Reviews = () => {
  const [placeName, setPlaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewData | null>(null);
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
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power3.out" }
      );
    }
  }, [result]);

  const handleSearch = async () => {
    if (!placeName.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/reviews/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_name: placeName.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to fetch reviews.");
      }

      const json = await res.json();
      setResult(json.data as ReviewData);
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
        style={{ background: "radial-gradient(circle, rgba(86,138,102,0.12), transparent 70%)" }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      {/* Search */}
      <div ref={formRef} className="relative z-10 max-w-3xl mx-auto p-6 space-y-8">
        <div className="form-section text-center space-y-3 pt-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Review <span className="gold-text">Intelligence</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Enter a place name to fetch and analyze real Google Maps reviews with AI-powered sentiment analysis.
          </p>
        </div>

        <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={12} glowColor="70, 124, 87" className="form-section rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Landmark className="w-4 h-4 text-primary" />
                Place Name
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. Baga Beach Goa, Taj Mahal Agra..."
                className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={handleSearch}
                disabled={loading || !placeName.trim()}
                className="group flex items-center gap-3 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover-lift gold-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                {loading ? "Analyzing Reviews..." : "Analyze Reviews"}
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
          {/* Place header */}
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={500} particleCount={14} glowColor="70, 124, 87" className="result-card rounded-2xl">
            <div className="glass-card gold-border p-6 rounded-2xl text-center space-y-2">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center justify-center gap-3">
                <MessageSquareQuote className="w-7 h-7 text-primary" />
                {result.place_name}
              </h3>
              <p className="text-sm text-muted-foreground">AI-analyzed sentiment from real visitor reviews</p>
            </div>
          </MagicBento>

          {/* Best & Worst */}
          <div className="result-card grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Review */}
            <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={10} glowColor="74, 222, 128" className="rounded-2xl">
              <div className="glass-card gold-border p-6 rounded-2xl space-y-4 h-full border-green-500/20">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-base font-semibold text-green-400">
                    <ThumbsUp className="w-5 h-5" /> Best Review
                  </h4>
                  <StarRating rating={result.best_review.rating} />
                </div>
                <SentimentBar score={result.best_review.score} label="Sentiment Score" />
                <div className="glass-card gold-border rounded-xl p-4 max-h-60 overflow-y-auto custom-scrollbar">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    "{result.best_review.text}"
                  </p>
                </div>
              </div>
            </MagicBento>

            {/* Worst Review */}
            <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={10} glowColor="248, 113, 113" className="rounded-2xl">
              <div className="glass-card gold-border p-6 rounded-2xl space-y-4 h-full border-red-500/20">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-base font-semibold text-red-400">
                    <ThumbsDown className="w-5 h-5" /> Worst Review
                  </h4>
                  <StarRating rating={result.worst_review.rating} />
                </div>
                <SentimentBar score={result.worst_review.score} label="Sentiment Score" />
                <div className="glass-card gold-border rounded-xl p-4 max-h-60 overflow-y-auto custom-scrollbar">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    "{result.worst_review.text}"
                  </p>
                </div>
              </div>
            </MagicBento>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
