import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import gsap from "gsap";
import {
  ShieldCheck,
  ShieldAlert,
  Phone,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  CircleX,
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

interface EmergencyContact { name: string; number: string; }
interface Phrase { english: string; local: string; pronunciation: string; }
interface GuardianData {
  state_name: string;
  emergency_contacts: EmergencyContact[];
  dos: string[];
  donts: string[];
  phrases: Phrase[];
  critical_alerts: string[];
}

const titleizeKey = (key: string) =>
  key.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (m) => m.toUpperCase());

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value))
    return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string")
    return value.split(/\r?\n|\u2022|\*/g).map((s) => s.trim()).filter(Boolean);
  if (value && typeof value === "object")
    return Object.values(value as Record<string, unknown>).map((v) => (typeof v === "string" ? v : JSON.stringify(v))).map((s) => s.trim()).filter(Boolean);
  return [];
};

const normalizeEmergencyContacts = (value: unknown): EmergencyContact[] => {
  if (Array.isArray(value))
    return value.map((v: any) => ({ name: String(v?.name ?? v?.label ?? "Emergency"), number: String(v?.number ?? v?.phone ?? "") })).filter((c) => c.number.trim().length > 0);
  if (value && typeof value === "object")
    return Object.entries(value as Record<string, unknown>).map(([k, v]) => ({ name: titleizeKey(k), number: String(v ?? "").trim() })).filter((c) => c.number.length > 0);
  return [];
};

const normalizePhrases = (value: unknown): Phrase[] => {
  const mapP = (p: any): Phrase => ({ english: String(p?.english ?? "").trim(), local: String(p?.local ?? "").trim(), pronunciation: String(p?.pronunciation ?? p?.pronounce ?? "").trim() });
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const ml = (value as any).phrases;
    if (Array.isArray(ml)) return ml.map(mapP).filter((p) => p.english || p.local);
  }
  if (Array.isArray(value)) return value.map(mapP).filter((p) => p.english || p.local);
  return [];
};

const normalizeGuardianData = (raw: any): GuardianData => ({
  state_name: String(raw?.state_name ?? raw?.state ?? "").trim(),
  emergency_contacts: normalizeEmergencyContacts(raw?.emergency_contacts),
  dos: toStringArray(raw?.dos),
  donts: toStringArray(raw?.donts),
  phrases: normalizePhrases(raw?.phrases),
  critical_alerts: toStringArray(raw?.critical_alerts),
});

const splitTitleDesc = (text: string): { title: string; desc: string } => {
  const match = text.match(/^([^.:]+[.:])\s+(.+)$/s);
  if (match) return { title: match[1].replace(/[.:]$/, ""), desc: match[2] };
  const words = text.split(/\s+/);
  if (words.length > 5) return { title: words.slice(0, 5).join(" "), desc: words.slice(5).join(" ") };
  return { title: text, desc: "" };
};

const CONTACT_COLORS = [
  { phone: "text-blue-400", bar: "bg-blue-500" },
  { phone: "text-red-400", bar: "bg-red-500" },
  { phone: "text-orange-400", bar: "bg-orange-500" },
  { phone: "text-purple-400", bar: "bg-purple-500" },
  { phone: "text-green-400", bar: "bg-green-500" },
  { phone: "text-cyan-400", bar: "bg-cyan-500" },
];

const AlertBanner = ({ alerts }: { alerts: string[] }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (alerts.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % alerts.length), 6000);
    return () => clearInterval(t);
  }, [alerts.length]);
  if (alerts.length === 0) return null;
  return (
    <div className="rounded-2xl p-4 flex items-start gap-4 border border-red-500/30" style={{ background: "rgba(220,38,38,0.08)" }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-500/20">
        <ShieldAlert className="w-5 h-5 text-red-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Critical Alert / {alerts.length} Active</p>
        <p className="text-sm text-foreground leading-relaxed">{alerts[idx]}</p>
      </div>
      {alerts.length > 1 && (
        <div className="flex gap-1.5 items-center shrink-0 pt-2">
          {alerts.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-red-400 w-4" : "bg-red-400/30"}`} />
          ))}
        </div>
      )}
    </div>
  );
};

const ContactCard = ({ contact, index, copiedNum, onCopy }: { contact: EmergencyContact; index: number; copiedNum: string | null; onCopy: (n: string) => void }) => {
  const color = CONTACT_COLORS[index % CONTACT_COLORS.length];
  const priority = Math.max(100 - index * 10, 50);
  return (
    <MagicBento enableStars={false} enableSpotlight enableBorderGlow clickEffect spotlightRadius={300} particleCount={0} glowColor="212, 175, 55" className="rounded-2xl">
      <div className="glass-card gold-border rounded-2xl p-5 h-full cursor-pointer group relative transition-colors hover:border-primary/40" onClick={() => onCopy(contact.number)}>
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-card ${color.phone}`}>
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-2xl font-mono font-bold text-foreground">{contact.number}</span>
        </div>
        <p className="text-sm font-semibold text-foreground mb-3">{contact.name}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Response Priority</span><span>{priority}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted/20 overflow-hidden">
            <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${priority}%` }} />
          </div>
        </div>
        {copiedNum === contact.number && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-background/80 z-30">
            <span className="flex items-center gap-2 text-green-400 text-sm font-semibold"><CheckCircle2 className="w-5 h-5" /> Copied!</span>
          </div>
        )}
      </div>
    </MagicBento>
  );
};

const GuidelineCard = ({ text, type }: { text: string; type: "do" | "dont" }) => {
  const { title, desc } = splitTitleDesc(text);
  const isDo = type === "do";
  return (
    <div className={`glass-card rounded-2xl p-5 border ${isDo ? "border-green-500/20" : "border-red-500/20"} transition-colors hover:border-opacity-50`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDo ? "bg-green-500/15" : "bg-red-500/15"}`}>
          {isDo ? <CircleCheck className="w-5 h-5 text-green-400" /> : <CircleX className="w-5 h-5 text-red-400" />}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          {desc && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>}
        </div>
      </div>
    </div>
  );
};

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

  useEffect(() => { if (prefilledState) fetchGuardian(prefilledState); }, []);

  const fetchGuardian = async (state: string) => {
    if (!state) return;
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/guardian/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Failed to load guardian data."); }
      const json = await res.json();
      setData(normalizeGuardianData(json.data));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (data && resultRef.current) {
      gsap.fromTo(resultRef.current.querySelectorAll(".gc-section"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power3.out" });
    }
  }, [data]);

  const copyNumber = (num: string) => { navigator.clipboard.writeText(num); setCopiedNum(num); setTimeout(() => setCopiedNum(null), 1500); };

  const speak = (text: string) => { const u = new SpeechSynthesisUtterance(text); u.rate = 0.85; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Guardian Card - ${data?.state_name}</title><style>body{font-family:system-ui,sans-serif;padding:24px}h2{margin:0 0 4px}h3{margin:18px 0 6px}ul{padding-left:18px}li{margin-bottom:4px}.contacts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.contact{border:1px solid #ccc;padding:8px;border-radius:8px}</style></head><body>${printRef.current.innerHTML}</body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <ParticleCanvas particleCount={70} starCount={40} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle, rgba(214,186,158,0.06), transparent 70%)" }} />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      <div className="relative z-10 max-w-3xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-3 pt-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Guardian <span className="gold-text">Angel</span></h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">Your offline-ready safety card with emergency contacts, do&apos;s &amp; don&apos;ts, local phrases, and critical alerts for any Indian state.</p>
        </div>

        <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={12} glowColor="212, 175, 55" className="rounded-2xl">
          <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground"><ShieldCheck className="w-4 h-4 text-primary" /> Select State</label>
              <div className="relative">
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/30 transition-all">
                  <option value="">Choose a state...</option>
                  {STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <button onClick={() => selectedState && fetchGuardian(selectedState)} disabled={loading || !selectedState} className="group flex items-center gap-3 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover-lift gold-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                {loading ? "Loading..." : "Get Safety Card"}
              </button>
            </div>
          </div>
        </MagicBento>

        {error && (<div className="glass-card gold-border p-4 rounded-2xl border-red-500/30 bg-red-500/5 text-red-400 text-sm text-center">{error}</div>)}
      </div>

      {data && (
        <div ref={resultRef} className="relative z-10 max-w-5xl mx-auto px-6 pb-12 space-y-8 mt-4">
          <div ref={printRef} className="hidden">
            <h2>Guardian Card - {data.state_name}</h2>
            <h3>Emergency Contacts</h3>
            <div className="contacts">{data.emergency_contacts.map((c, i) => (<div key={i} className="contact"><strong>{c.name}</strong>: {c.number}</div>))}</div>
            <h3>Do&apos;s</h3>
            <ul>{data.dos.map((d, i) => <li key={i}>{d}</li>)}</ul>
            <h3>Don&apos;ts</h3>
            <ul>{data.donts.map((d, i) => <li key={i}>{d}</li>)}</ul>
            <h3>Local Phrases</h3>
            <ul>{data.phrases.map((p, i) => <li key={i}>{p.english} - {p.local}{p.pronunciation ? ` (${p.pronunciation})` : ""}</li>)}</ul>
            {data.critical_alerts.length > 0 && (<><h3>Critical Alerts</h3><ul>{data.critical_alerts.map((a, i) => <li key={i}>{a}</li>)}</ul></>)}
          </div>

          {data.critical_alerts.length > 0 && (<div className="gc-section"><AlertBanner alerts={data.critical_alerts} /></div>)}

          <div className="gc-section space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-2xl font-display font-bold text-foreground flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-primary" /> Emergency Contacts</h3>
                <p className="text-xs text-muted-foreground mt-1 ml-9">Click any card to instantly copy the dial code.</p>
              </div>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card gold-border text-xs font-semibold text-foreground hover-lift transition-all">
                <Printer className="w-4 h-4" /> Print / PDF
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.emergency_contacts.map((c, i) => (<ContactCard key={i} contact={c} index={i} copiedNum={copiedNum} onCopy={copyNumber} />))}
            </div>
          </div>

          <div className="gc-section space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-display font-bold text-foreground">Travel Guidelines</h3>
              <p className="text-xs text-muted-foreground mt-1">Cultural nuances &amp; safety practices (Hover or click to flip)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-base font-semibold text-green-400 border-b border-green-500/20 pb-2"><CircleCheck className="w-5 h-5" /> The Do&apos;s</h4>
                <div className="space-y-3">{data.dos.map((d, i) => (<GuidelineCard key={i} text={d} type="do" />))}</div>
              </div>
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-base font-semibold text-red-400 border-b border-red-500/20 pb-2"><CircleX className="w-5 h-5" /> The Don&apos;ts</h4>
                <div className="space-y-3">{data.donts.map((d, i) => (<GuidelineCard key={i} text={d} type="dont" />))}</div>
              </div>
            </div>
          </div>

          <MagicBento textAutoHide enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={500} particleCount={10} glowColor="96, 165, 250" className="gc-section rounded-2xl">
            <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
              <h4 className="flex items-center gap-2 text-lg font-display font-bold text-foreground"><Volume2 className="w-5 h-5 text-blue-400" /> Phrase Translator</h4>
              <p className="text-xs text-muted-foreground -mt-2">Essential local phrases  click the speaker to hear pronunciation.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.phrases.map((p, i) => (
                  <div key={i} className="glass-card gold-border rounded-xl p-4 flex items-center justify-between gap-3 group">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-foreground block truncate">{p.english}</span>
                      <span className="text-sm text-primary block truncate">{p.local}</span>
                      {p.pronunciation && <span className="text-xs text-muted-foreground italic block truncate">({p.pronunciation})</span>}
                    </div>
                    <button onClick={() => speak(p.local)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors shrink-0" title="Speak">
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
