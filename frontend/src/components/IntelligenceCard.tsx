import { useEffect, useRef } from "react";
import gsap from "gsap";

interface IntelligenceCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  suffix?: string;
  delay?: number;
}

const IntelligenceCard = ({ label, value, icon, suffix, delay = 0 }: IntelligenceCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay, ease: "power2.out" }
      );
    }
  }, [delay]);

  return (
    <div ref={ref} className="glass-card gold-border p-4 rounded-xl hover-lift">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-foreground">
            {value}
            {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceCard;
