import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { MapPin, Heart, Compass, Users, Globe, Send } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleCanvas from "@/components/ParticleCanvas";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";

const travelStyles = [
  { id: "adventure", label: "Adventure", icon: "🏔️" },
  { id: "culture", label: "Culture & Heritage", icon: "🏛️" },
  { id: "relaxation", label: "Relaxation", icon: "🌴" },
  { id: "food", label: "Food & Cuisine", icon: "🍜" },
  { id: "nature", label: "Nature & Wildlife", icon: "🌿" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
];

const budgetOptions = ["Budget", "Mid-Range", "Luxury", "No Limit"];
const groupOptions = ["Solo", "Couple", "Family", "Friends"];

const Dashboard = () => {
  const [origin, setOrigin] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [group, setGroup] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const toggleStyle = (id: string) => {
    setStyles((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current.querySelectorAll(".form-section"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Particle background */}
      <ParticleCanvas particleCount={70} starCount={40} />

      {/* Central glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(184,134,11,0.12), transparent 70%)" }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <TreviaLogo />
        <ThemeToggle />
      </header>

      <div ref={formRef} className="relative z-10 max-w-3xl mx-auto p-6 space-y-8">
        {/* Heading */}
        <div className="form-section text-center space-y-3 pt-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Tell us about <span className="gold-text">your journey</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Help us curate the perfect travel intelligence for you. Answer a few quick questions.
          </p>
        </div>

        {/* Where are you from */}
        <MagicBento
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="184, 134, 11"
          className="form-section rounded-2xl"
        >
          <div className="glass-card gold-border p-6 rounded-2xl space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Globe className="w-4 h-4 text-primary" />
              Where are you from?
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Mumbai, New York, London..."
              className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </MagicBento>

        {/* Travel style */}
        <MagicBento
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="184, 134, 11"
          className="form-section rounded-2xl"
        >
          <div className="glass-card gold-border p-6 rounded-2xl space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Heart className="w-4 h-4 text-primary" />
              What do you enjoy while traveling?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {travelStyles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleStyle(s.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    styles.includes(s.id)
                      ? "bg-primary text-primary-foreground gold-glow"
                      : "glass-card gold-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                  }`}
                >
                  <span>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </MagicBento>

        {/* Budget & Group */}
        <div className="form-section grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MagicBento
            textAutoHide={true}
            enableStars
            enableSpotlight
            enableBorderGlow={true}
            clickEffect
            spotlightRadius={400}
            particleCount={8}
            glowColor="184, 134, 11"
            className="rounded-2xl"
          >
            <div className="glass-card gold-border p-6 rounded-2xl space-y-3 h-full">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Compass className="w-4 h-4 text-primary" />
                Budget Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {budgetOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                      budget === b
                        ? "bg-primary text-primary-foreground gold-glow"
                        : "glass-card gold-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </MagicBento>

          <MagicBento
            textAutoHide={true}
            enableStars
            enableSpotlight
            enableBorderGlow={true}
            clickEffect
            spotlightRadius={400}
            particleCount={8}
            glowColor="184, 134, 11"
            className="rounded-2xl"
          >
            <div className="glass-card gold-border p-6 rounded-2xl space-y-3 h-full">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="w-4 h-4 text-primary" />
                Traveling With
              </label>
              <div className="grid grid-cols-2 gap-2">
                {groupOptions.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGroup(g)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                      group === g
                        ? "bg-primary text-primary-foreground gold-glow"
                        : "glass-card gold-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </MagicBento>
        </div>

        {/* Duration */}
        <MagicBento
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="184, 134, 11"
          className="form-section rounded-2xl"
        >
          <div className="glass-card gold-border p-6 rounded-2xl space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              How many days?
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 5"
              className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </MagicBento>

        {/* Notes */}
        <MagicBento
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="184, 134, 11"
          className="form-section rounded-2xl"
        >
          <div className="glass-card gold-border p-6 rounded-2xl space-y-3">
            <label className="text-sm font-semibold text-foreground">
              Anything else we should know?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Special requirements, accessibility needs, dietary preferences..."
              className="w-full glass-card gold-border px-4 py-3 rounded-xl text-sm bg-card text-foreground outline-none placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </MagicBento>

        {/* Submit */}
        <div className="form-section flex justify-center pb-8">
          <button className="group flex items-center gap-3 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover-lift gold-glow transition-all duration-300">
            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            Generate My Travel Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
