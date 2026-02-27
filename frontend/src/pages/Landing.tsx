import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ArrowRight, Shield, Sparkles, Map, BarChart3, Plane } from "lucide-react";
import MagicBento from "@/components/MagicBento";
import ParticleCanvas from "@/components/ParticleCanvas";

/* ─── Bento items ─── */
const bentoItems = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Safety Intelligence",
    desc: "Real-time safety scores powered by verified data sources",
    span: "col-span-2",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Cleanliness Index",
    desc: "Hygiene metrics for confident travel",
    span: "",
  },
  {
    icon: <Map className="w-8 h-8" />,
    title: "Smart Mapping",
    desc: "Interactive geospatial overlays",
    span: "",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Tourist Confidence",
    desc: "Aggregated scoring engine for destinations",
    span: "col-span-2",
  },
];

/* ─── Floating cloud component ─── */
const Cloud = ({ style, className }: { style?: React.CSSProperties; className?: string }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 200 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="70" cy="55" rx="70" ry="25" fill="rgba(212,175,55,0.06)" />
    <ellipse cx="100" cy="40" rx="50" ry="30" fill="rgba(212,175,55,0.04)" />
    <ellipse cx="140" cy="50" rx="55" ry="22" fill="rgba(212,175,55,0.05)" />
  </svg>
);

/* ─── Stars field ─── */
const StarField = ({ count = 60 }: { count?: number }) => {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2.5,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-[#d4af37] animate-pulse"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: 0.3 + Math.random() * 0.5,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

/* ─── Animated flight route ─── */
const FlightRoute = () => {
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pathRef.current || !planeRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    // Draw the route line
    tl.to(path, {
      strokeDashoffset: 0,
      duration: 4,
      ease: "power1.inOut",
    });

    // Animate the plane along the path
    tl.to(
      planeRef.current,
      {
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
        },
        duration: 4,
        ease: "power1.inOut",
      },
      0
    );

    // Fade out and reset
    tl.to(path, {
      strokeDashoffset: -length,
      duration: 2,
      ease: "power1.in",
    });

    // Simple fallback: animate plane across screen
    const fallbackTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    fallbackTl.fromTo(
      planeRef.current,
      { x: -100, y: 20, opacity: 0 },
      { x: window.innerWidth + 100, y: -40, opacity: 1, duration: 8, ease: "power1.inOut" }
    );
    fallbackTl.to(planeRef.current, { opacity: 0, duration: 0.5 }, "-=1");

    return () => {
      tl.kill();
      fallbackTl.kill();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d="M-50,500 Q300,200 500,350 T900,250 T1500,300"
          fill="none"
          stroke="rgba(212,175,55,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        {/* Glow filter for the route */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div ref={planeRef} className="absolute top-1/2" style={{ zIndex: 10 }}>
        <Plane className="w-6 h-6 text-[#d4af37] drop-shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
      </div>
    </div>
  );
};

/* ─── City Skyline ─── */
const CitySkyline = () => (
  <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
    <svg viewBox="0 0 1440 200" className="w-full h-32 md:h-48" preserveAspectRatio="none">
      <path
        d="M0,200 L0,160 L40,160 L40,130 L60,130 L60,140 L80,140 L80,110 L100,110 L100,120 L130,120 L130,90 L145,90 L145,100 L160,100 L160,80 L175,80 L175,95 L200,95 L200,130 L220,130 L220,100 L240,100 L240,70 L255,70 L255,60 L270,60 L270,80 L290,80 L290,110 L320,110 L320,90 L340,90 L340,50 L355,50 L355,70 L380,70 L380,100 L400,100 L400,120 L440,120 L440,90 L460,90 L460,40 L480,40 L480,70 L500,70 L500,110 L540,110 L540,130 L580,130 L580,100 L600,100 L600,60 L615,60 L615,45 L630,45 L630,70 L660,70 L660,100 L700,100 L700,120 L740,120 L740,80 L760,80 L760,50 L775,50 L775,65 L800,65 L800,95 L840,95 L840,110 L880,110 L880,70 L900,70 L900,40 L920,40 L920,60 L950,60 L950,80 L980,80 L980,130 L1020,130 L1020,100 L1040,100 L1040,55 L1060,55 L1060,75 L1090,75 L1090,100 L1120,100 L1120,120 L1160,120 L1160,90 L1180,90 L1180,60 L1200,60 L1200,80 L1240,80 L1240,110 L1280,110 L1280,130 L1320,130 L1320,100 L1360,100 L1360,120 L1400,120 L1400,140 L1440,140 L1440,200 Z"
        fill="rgba(18,14,10,0.3)"
      />
      <path
        d="M0,200 L0,170 L60,170 L60,150 L100,150 L100,160 L160,160 L160,140 L200,140 L200,155 L260,155 L260,135 L300,135 L300,150 L360,150 L360,145 L420,145 L420,160 L480,160 L480,140 L540,140 L540,155 L600,155 L600,145 L660,145 L660,160 L720,160 L720,150 L780,150 L780,140 L840,140 L840,155 L900,155 L900,160 L960,160 L960,150 L1020,150 L1020,145 L1080,145 L1080,155 L1140,155 L1140,165 L1200,165 L1200,155 L1260,155 L1260,160 L1320,160 L1320,170 L1380,170 L1380,165 L1440,165 L1440,200 Z"
        fill="rgba(18,14,10,0.15)"
      />
    </svg>
  </div>
);

/* ─── Floating Bubbles ─── */
const FloatingBubbles = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const bubbles: HTMLDivElement[] = [];

    for (let i = 0; i < 15; i++) {
      const bubble = document.createElement("div");
      const size = 40 + Math.random() * 160;
      bubble.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(212, 175, 55, ${0.03 + Math.random() * 0.06});
        filter: blur(${20 + Math.random() * 30}px);
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      container.appendChild(bubble);
      bubbles.push(bubble);

      gsap.to(bubble, {
        x: `random(-80, 80)`,
        y: `random(-80, 80)`,
        scale: `random(0.7, 1.4)`,
        duration: `random(8, 16)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 3,
      });
    }

    return () => {
      bubbles.forEach((b) => {
        gsap.killTweensOf(b);
        b.remove();
      });
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />;
};

/* ─────────────────────────── LANDING ─────────────────────────── */

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const cloud1Ref = useRef<HTMLDivElement>(null);
  const cloud2Ref = useRef<HTMLDivElement>(null);
  const cloud3Ref = useRef<HTMLDivElement>(null);
  const [btnHovered, setBtnHovered] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      heroRef.current?.querySelectorAll(".hero-el") || [],
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.2 }
    );

    tl.fromTo(
      bentoRef.current?.querySelectorAll(".bento-item") || [],
      { opacity: 0, y: 40, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12 },
      "-=0.6"
    );

    // Parallax clouds
    const clouds = [cloud1Ref.current, cloud2Ref.current, cloud3Ref.current];
    clouds.forEach((cloud, i) => {
      if (!cloud) return;
      gsap.fromTo(
        cloud,
        { x: i % 2 === 0 ? -200 : 200, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 3 + i,
          ease: "power1.out",
          delay: i * 0.5,
        }
      );
      gsap.to(cloud, {
        x: i % 2 === 0 ? 60 : -60,
        duration: 20 + i * 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 3 + i,
      });
    });
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#120e0a" }}>
      {/* Star field */}
      <StarField count={80} />

      {/* Particle canvas background */}
      <ParticleCanvas particleCount={90} starCount={60} />

      {/* Flight route animation */}
      <FlightRoute />

      {/* Parallax clouds */}
      <div ref={cloud1Ref} className="absolute top-[10%] left-[5%] w-[300px] opacity-0">
        <Cloud />
      </div>
      <div ref={cloud2Ref} className="absolute top-[20%] right-[8%] w-[250px] opacity-0">
        <Cloud />
      </div>
      <div ref={cloud3Ref} className="absolute top-[35%] left-[40%] w-[200px] opacity-0">
        <Cloud />
      </div>

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none" style={{ background: "rgba(212,175,55,0.06)" }} />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: "rgba(212,175,55,0.03)" }} />

      {/* City Skyline */}
      <CitySkyline />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-8 py-5 backdrop-blur-md" style={{ background: "rgba(18,14,10,0.6)" }}>
        <div className="flex items-center gap-6">
          <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "rgba(212,175,55,0.6)" }}>
            Tourism Intelligence
          </span>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20 z-10">
        <h1 className="hero-el text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.95] max-w-5xl" style={{ color: "#d4af37" }}>
          Welcome to
          <br />
          <span
            className="inline-block mt-2"
            style={{
              background: "linear-gradient(135deg, #d4af37, #f1e5ac, #b8860b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 40px rgba(212,175,55,0.4))",
            }}
          >
            Trevia
          </span>
        </h1>

        <p className="hero-el mt-8 text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: "rgba(212,175,55,0.65)" }}>
          Data-driven insights for safer, smarter, and more confident travel decisions.
          Powered by real-time intelligence and geospatial analytics.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          className="hero-el mt-12 group relative flex items-center gap-3 px-10 py-5 rounded-full font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-500"
          style={{
            background: btnHovered
              ? "linear-gradient(135deg, #d4af37, #f1e5ac)"
              : "#d4af37",
            color: "#120e0a",
            boxShadow: btnHovered
              ? "0 0 60px rgba(212,175,55,0.6), 0 0 120px rgba(212,175,55,0.3)"
              : "0 0 30px rgba(212,175,55,0.2)",
            transform: btnHovered ? "scale(1.05)" : "scale(1)",
          }}
        >
          <span className="relative z-10">Explore Destination Insights</span>
          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
          {/* Shimmer effect on hover */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              opacity: btnHovered ? 1 : 0,
              animation: btnHovered ? "shimmer-btn 1.5s infinite" : "none",
            }}
          />
        </button>
      </section>

      {/* ─── Bento Grid Section ─── */}
      <section ref={bentoRef} className="relative max-w-5xl mx-auto px-6 pb-40 z-10">
        <h2 className="text-center text-sm font-semibold tracking-[0.3em] uppercase mb-12" style={{ color: "rgba(212,175,55,0.5)" }}>
          What Powers Trevia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {bentoItems.map((item, i) => (
            <MagicBento
              key={i}
              textAutoHide={true}
              enableStars
              enableSpotlight
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect
              spotlightRadius={400}
              particleCount={12}
              glowColor="212, 175, 55"
              disableAnimations={false}
              className={`bento-item rounded-2xl ${item.span}`}
            >
              <div
                className="p-8 rounded-2xl h-full border transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]"
                style={{
                  background: "rgba(18,14,10,0.6)",
                  borderColor: "rgba(212,175,55,0.15)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="mb-4" style={{ color: "#d4af37" }}>{item.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#d4af37" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(212,175,55,0.6)" }}>{item.desc}</p>
              </div>
            </MagicBento>
          ))}
        </div>
      </section>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to top, #120e0a, transparent)" }} />

      <style>{`
        @keyframes shimmer-btn {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
