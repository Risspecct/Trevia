


















import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  phase: number;
}

interface ParticleCanvasProps {
  particleCount?: number;
  starCount?: number;
  className?: string;
  /** Primary accent color in hex */
  accentColor?: string;
  /** Mouse repulsion radius */
  repulsionRadius?: number;
  /** Spring stiffness (how fast particles return) */
  springStiffness?: number;
  /** Whether to render background glow */
  showGlow?: boolean;
}

/** Convert hex to rgb tuple */
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
};

const ParticleCanvas = ({
  particleCount = 80,
  starCount = 50,
  className = "",
  accentColor = "#568a66",
  repulsionRadius = 120,
  springStiffness = 0.02,
  showGlow = true,
}: ParticleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  const initParticles = useCallback(
    (w: number, h: number) => {
      const [r, g, b] = hexToRgb(accentColor);
      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          radius: 1.5 + Math.random() * 2.5,
          opacity: 0.3 + Math.random() * 0.5,
          color: `rgba(${r}, ${g}, ${b}, %%OP%%)`,
        });
      }
      particlesRef.current = particles;

      const stars: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 0.5 + Math.random() * 1.2,
          opacity: 0.2 + Math.random() * 0.4,
          twinkleSpeed: 0.5 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    },
    [particleCount, starCount, accentColor]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const [cr, cg, cb] = hexToRgb(accentColor);
    const friction = 0.92;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // Draw background glow
      if (showGlow) {
        const glowGrad = ctx.createRadialGradient(
          w * 0.5,
          h * 0.4,
          0,
          w * 0.5,
          h * 0.4,
          w * 0.6
        );
        glowGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.04)`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw stars with twinkle
      for (const star of starsRef.current) {
        const twinkle =
          0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.phase);
        const alpha = star.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.fill();
      }

      // Update & draw particles
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repulsionRadius && dist > 0) {
          const force = (repulsionRadius - dist) / repulsionRadius;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 3;
          p.vy += Math.sin(angle) * force * 3;
        }

        // Spring back to origin
        p.vx += (p.originX - p.x) * springStiffness;
        p.vy += (p.originY - p.y) * springStiffness;

        // Friction
        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        const alpha = p.opacity * (0.7 + 0.3 * Math.sin(t * 1.5 + p.originX));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("%%OP%%", alpha.toFixed(3));
        ctx.fill();

        // Draw glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("%%OP%%", (alpha * 0.15).toFixed(3));
        ctx.fill();
      }

      // Draw faint connection lines between nearby particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.08;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [accentColor, repulsionRadius, springStiffness, showGlow, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ pointerEvents: "none" }}
    />
  );
};

export default ParticleCanvas;
