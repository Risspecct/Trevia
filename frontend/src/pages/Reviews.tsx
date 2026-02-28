import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import api from "@/lib/api";
import axios from "axios";
import {
  Search,
  Loader2,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquareQuote,
  Landmark,
  MapPin,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";

/* ─── Types ─── */

interface PlaceSuggestion {
  description: string;
  place_id: string;
  gps: { lat: number; lng: number };
}

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
          const res = await api.get("/places/autocomplete", {
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
  const placeAc = useAutocomplete();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current.querySelectorAll(".form-section"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }
      );
    }
  }, []);

  /* Close autocomplete on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) placeAc.close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
    if (!placeAc.query.trim()) return;
    placeAc.close();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post("/reviews/analyze", { place_name: placeAc.query.trim() });
      setResult(res.data.data as ReviewData);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.detail || e.message);
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <ParticleCanvas particleCount={70} starCount={40} />

      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(184,134,11,0.12), transparent 70%)" }}
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

        <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={12} glowColor="184, 134, 11" className="form-section rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Landmark className="w-4 h-4 text-primary" />
                Place Name
              </label>
              <div className="relative" ref={dropdownRef}>
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-primary z-10" />
                <input
                  type="text"
                  value={placeAc.query}
                  onChange={(e) => placeAc.handleChange(e.target.value)}
                  onFocus={() => placeAc.suggestions.length > 0 && placeAc.handleChange(placeAc.query)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Baga Beach Goa, Taj Mahal Agra..."
                  className="w-full glass-card gold-border pl-10 pr-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
                />
                {placeAc.open && (
                  <ul className="absolute left-0 right-0 top-full mt-1 z-50 glass-card gold-border rounded-xl overflow-hidden shadow-lg max-h-56 overflow-y-auto">
                    {placeAc.suggestions.map((s) => (
                      <li
                        key={s.place_id}
                        onMouseDown={() => placeAc.select(s)}
                        className="px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 cursor-pointer flex items-start gap-2 border-b border-border/30 last:border-0 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{s.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {placeAc.loading && (
                  <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={handleSearch}
                disabled={loading || !placeAc.query.trim()}
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
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={500} particleCount={14} glowColor="184, 134, 11" className="result-card rounded-2xl">
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
