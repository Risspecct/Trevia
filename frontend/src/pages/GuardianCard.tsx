import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import gsap from "gsap";
import {
  ShieldCheck,
  Phone,
  Copy,
  CheckCircle2,
  ChevronDown,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Languages,
  Volume2,
  Loader2,
  Printer,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";

const STATES = [
  "Goa",
  "Uttar Pradesh",
  "Maharashtra",
  "Bihar",
  "West Bengal",
  "Madhya Pradesh",
  "Tamil Nadu",
  "Rajasthan",
  "Karnataka",
  "Gujarat",
  "Kerala",
  "Punjab",
  "Haryana",
  "Delhi",
  "Telangana",
];

interface EmergencyContact {
  name: string;
  number: string;
}

interface Phrase {
  english: string;
  local: string;
  pronunciation: string;
}

interface GuardianData {
  state_name: string;
  emergency_contacts: EmergencyContact[];
  dos: string[];
  donts: string[];
  phrases: Phrase[];
  critical_alerts: string[];
}

const titleizeKey = (key: string) =>
  key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|\u2022|\*/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeEmergencyContacts = (value: unknown): EmergencyContact[] => {
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (v && typeof v === "object") {
          const name = String((v as any).name ?? (v as any).label ?? "Emergency");
          const number = String((v as any).number ?? (v as any).phone ?? "");
          return { name, number };
        }
        if (typeof v === "string") {
          const [nameRaw, ...rest] = v.split(":");
          const number = rest.join(":").trim();
          return { name: nameRaw.trim() || "Emergency", number };
        }
        return { name: "Emergency", number: "" };
      })
      .filter((c) => c.number.trim().length > 0);
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => ({ name: titleizeKey(k), number: String(v ?? "").trim() }))
      .filter((c) => c.number.length > 0);
  }

  return [];
};

const normalizePhrases = (value: unknown): Phrase[] => {
  // Backend dataset often returns:
  // { language: 'Konkani', phrases: [{ english, local }, ...] }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const maybeList = (value as any).phrases;
    if (Array.isArray(maybeList)) {
      return maybeList
        .map((p: any) => ({
          english: String(p?.english ?? "").trim(),
          local: String(p?.local ?? "").trim(),
          pronunciation: String(p?.pronunciation ?? p?.pronounce ?? "").trim(),
        }))
        .filter((p: Phrase) => p.english.length > 0 || p.local.length > 0);
    }
  }

  if (Array.isArray(value)) {
    return value
      .map((p: any) => ({
        english: String(p?.english ?? "").trim(),
        local: String(p?.local ?? "").trim(),
        pronunciation: String(p?.pronunciation ?? p?.pronounce ?? "").trim(),
      }))
      .filter((p: Phrase) => p.english.length > 0 || p.local.length > 0);
  }

  return [];
};

const normalizeGuardianData = (raw: any): GuardianData => {
  const stateName = String(raw?.state_name ?? raw?.state ?? "").trim();
  return {
    state_name: stateName,
    emergency_contacts: normalizeEmergencyContacts(raw?.emergency_contacts),
    dos: toStringArray(raw?.dos),
    donts: toStringArray(raw?.donts),
    phrases: normalizePhrases(raw?.phrases),
    critical_alerts: toStringArray(raw?.critical_alerts),
  };
};

/* ── Alert Ticker ─────────────────────────────────── */
const AlertTicker = ({ alerts }: { alerts: string[] }) => {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickerRef.current || alerts.length === 0) return;
    const el = tickerRef.current;
    gsap.fromTo(
      el,
      { x: "100%" },
      { x: `-${el.scrollWidth}px`, duration: alerts.length * 8, ease: "none", repeat: -1 }
    );
    return () => { gsap.killTweensOf(el); };
  }, [alerts]);

  if (alerts.length === 0) return null;

  return (
    <div className="overflow-hidden glass-card gold-border rounded-xl py-2 px-4">
      <div ref={tickerRef} className="whitespace-nowrap flex items-center gap-8">
        {alerts.map((a, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm font-medium text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {a}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Flip Card ────────────────────────────────────── */
const FlipCard = ({ front, type }: { front: string; type: "do" | "dont" }) => {
  const [flipped, setFlipped] = useState(false);
  const color = type === "do" ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400";
  const Icon = type === "do" ? ThumbsUp : ThumbsDown;

  return (
    <div
      className="cursor-pointer perspective-[800px]"
      onClick={() => setFlipped((p) => !p)}
    >
      <div
        className={`relative transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        style={{ minHeight: 90 }}
      >
        {/* Front */}
        <div className={`absolute inset-0 backface-hidden glass-card gold-border rounded-xl p-4 flex items-start gap-3 ${color}`}>
          <Icon className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm text-foreground leading-relaxed">{front}</span>
        </div>
        {/* Back */}
        <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] glass-card gold-border rounded-xl p-4 flex items-center justify-center">
          <span className="text-xs text-muted-foreground text-center">
            {type === "do" ? "✅ Recommended" : "❌ Avoid this"}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────── */
const GuardianCard = () => {
  const [searchParams] = useSearchParams();
  const prefilledState = searchParams.get("state") || "";

  const [selectedState, setSelectedState] = useState(prefilledState);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GuardianData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedNum, setCopiedNum] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  /* Auto-fetch if state came from URL */
  useEffect(() => {
    if (prefilledState) fetchGuardian(prefilledState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGuardian = async (state: string) => {
    if (!state) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/guardian/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to load guardian data.");
      }
      const json = await res.json();
      setData(normalizeGuardianData(json.data));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data && resultRef.current) {
      gsap.fromTo(
        resultRef.current.querySelectorAll(".gc-section"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power3.out" }
      );
    }
  }, [data]);

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNum(num);
    setTimeout(() => setCopiedNum(null), 1500);
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Guardian Card – ${data?.state_name}</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px}h2{margin:0 0 4px}h3{margin:18px 0 6px}ul{padding-left:18px}li{margin-bottom:4px}.contacts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.contact{border:1px solid #ccc;padding:8px;border-radius:8px}</style>
      </head><body>${printRef.current.innerHTML}</body></html>
    `);
    w.document.close();
    w.print();
  };

  const handleSubmit = () => {
    if (selectedState) fetchGuardian(selectedState);
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <ParticleCanvas particleCount={70} starCount={40} />

      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(214,186,158,0.12), transparent 70%)" }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border backdrop-blur-sm">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      {/* State Selector */}
      <div className="relative z-10 max-w-3xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-3 pt-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Guardian <span className="gold-text">Angel</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Your offline-ready safety card with emergency contacts, do's &amp; don'ts, local phrases, and critical alerts for any Indian state.
          </p>
        </div>

        <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={12} glowColor="212, 175, 55" className="rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Select State
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="">Choose a state…</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedState}
                className="group flex items-center gap-3 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover-lift gold-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                {loading ? "Loading…" : "Get Safety Card"}
              </button>
            </div>
          </div>
        </MagicBento>

        {error && (
          <div className="glass-card gold-border p-4 rounded-2xl border-red-500/30 bg-red-500/5 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {data && (
        <div ref={resultRef} className="relative z-10 max-w-4xl mx-auto px-6 pb-12 space-y-6">
          {/* Critical Alerts */}
          {data.critical_alerts.length > 0 && (
            <div className="gc-section">
              <AlertTicker alerts={data.critical_alerts} />
            </div>
          )}

          {/* Print hidden content */}
          <div ref={printRef} className="hidden">
            <h2>Guardian Card – {data.state_name}</h2>
            <h3>Emergency Contacts</h3>
            <div className="contacts">
              {data.emergency_contacts.map((c, i) => (
                <div key={i} className="contact"><strong>{c.name}</strong>: {c.number}</div>
              ))}
            </div>
            <h3>Do's</h3>
            <ul>{data.dos.map((d, i) => <li key={i}>{d}</li>)}</ul>
            <h3>Don'ts</h3>
            <ul>{data.donts.map((d, i) => <li key={i}>{d}</li>)}</ul>
            <h3>Local Phrases</h3>
            <ul>
              {data.phrases.map((p, i) => (
                <li key={i}>
                  {p.english} → {p.local}
                  {p.pronunciation ? ` (${p.pronunciation})` : ""}
                </li>
              ))}
            </ul>
            {data.critical_alerts.length > 0 && (
              <>
                <h3>Critical Alerts</h3>
                <ul>{data.critical_alerts.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </>
            )}
          </div>

          {/* Header + Print */}
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={500} particleCount={14} glowColor="212, 175, 55" className="gc-section rounded-2xl">
            <div className="glass-card gold-border p-6 rounded-2xl flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-primary" />
                {data.state_name}
              </h3>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card gold-border text-sm font-semibold text-foreground hover-lift transition-all"
              >
                <Printer className="w-4 h-4" /> Print / PDF
              </button>
            </div>
          </MagicBento>

          {/* Emergency Contacts */}
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={500} particleCount={10} glowColor="248, 113, 113" className="gc-section rounded-2xl">
            <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
              <h4 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Phone className="w-5 h-5 text-red-400" /> Emergency Contacts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.emergency_contacts.map((c, i) => (
                  <div
                    key={i}
                    className="glass-card gold-border rounded-xl p-3 flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs text-muted-foreground block">{c.name}</span>
                      <span className="text-sm font-mono font-bold text-foreground">{c.number}</span>
                    </div>
                    <button
                      onClick={() => copyNumber(c.number)}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                      title="Copy number"
                    >
                      {copiedNum === c.number ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </MagicBento>

          {/* Do's & Don'ts */}
          <div className="gc-section grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Do's */}
            <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={8} glowColor="74, 222, 128" className="rounded-2xl">
              <div className="glass-card gold-border p-6 rounded-2xl space-y-3 h-full">
                <h4 className="flex items-center gap-2 text-base font-semibold text-green-400">
                  <ThumbsUp className="w-5 h-5" /> Do's
                </h4>
                <div className="space-y-2">
                  {data.dos.map((d, i) => (
                    <FlipCard key={i} front={d} type="do" />
                  ))}
                </div>
              </div>
            </MagicBento>

            {/* Don'ts */}
            <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={8} glowColor="248, 113, 113" className="rounded-2xl">
              <div className="glass-card gold-border p-6 rounded-2xl space-y-3 h-full">
                <h4 className="flex items-center gap-2 text-base font-semibold text-red-400">
                  <ThumbsDown className="w-5 h-5" /> Don'ts
                </h4>
                <div className="space-y-2">
                  {data.donts.map((d, i) => (
                    <FlipCard key={i} front={d} type="dont" />
                  ))}
                </div>
              </div>
            </MagicBento>
          </div>

          {/* Phrase Translator */}
          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={500} particleCount={10} glowColor="96, 165, 250" className="gc-section rounded-2xl">
            <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
              <h4 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Languages className="w-5 h-5 text-blue-400" /> Local Phrases
              </h4>
              <div className="space-y-3">
                {data.phrases.map((p, i) => (
                  <div key={i} className="glass-card gold-border rounded-xl p-4 flex items-center justify-between gap-4 group">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-foreground block truncate">{p.english}</span>
                      <span className="text-sm text-primary block truncate">{p.local}</span>
                      {p.pronunciation ? (
                        <span className="text-xs text-muted-foreground italic block truncate">({p.pronunciation})</span>
                      ) : null}
                    </div>
                    <button
                      onClick={() => speak(p.local)}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
                      title="Speak"
                    >
                      <Volume2 className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </MagicBento>
        </div>
      )}
    </div>
  );
};

export default GuardianCard;
