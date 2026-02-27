import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ConfidenceMeterProps {
  score: number;
  size?: number;
  label?: string;
}

const ConfidenceMeter = ({ score, size = 160, label = "Confidence" }: ConfidenceMeterProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (circleRef.current && textRef.current) {
      const offset = circumference - (score / 100) * circumference;
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset: offset, duration: 1.5, ease: "power3.out" }
      );
      gsap.fromTo(textRef.current, { innerText: 0 }, {
        innerText: score,
        duration: 1.5,
        ease: "power3.out",
        snap: { innerText: 1 },
        onUpdate: function () {
          if (textRef.current) {
            textRef.current.textContent = Math.round(gsap.getProperty(textRef.current, "innerText") as number || score).toString();
          }
        },
      });
    }
  }, [score, circumference]);

  const getColor = () => {
    if (score >= 80) return "hsl(var(--primary))";
    if (score >= 60) return "hsl(var(--accent))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span ref={textRef} className="text-3xl font-bold text-foreground">
            0
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceMeter;
