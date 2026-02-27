import { useEffect, useRef } from "react";
import gsap from "gsap";

interface BubbleBackgroundProps {
  bubbleCount?: number;
  colors?: string[];
  className?: string;
}

const BubbleBackground = ({
  bubbleCount = 20,
  colors = [
    "rgba(214, 186, 158, 0.12)",
    "rgba(214, 186, 158, 0.08)",
    "rgba(132, 0, 255, 0.06)",
    "rgba(255, 255, 255, 0.05)",
    "rgba(74, 64, 57, 0.08)",
  ],
  className = "",
}: BubbleBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const bubbles: HTMLDivElement[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement("div");
      const size = 60 + Math.random() * 200;
      const color = colors[Math.floor(Math.random() * colors.length)];

      bubble.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        filter: blur(${30 + Math.random() * 40}px);
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      container.appendChild(bubble);
      bubbles.push(bubble);

      gsap.to(bubble, {
        x: `random(-100, 100)`,
        y: `random(-100, 100)`,
        scale: `random(0.6, 1.5)`,
        opacity: `random(0.3, 1)`,
        duration: `random(6, 14)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 4,
      });
    }

    return () => {
      bubbles.forEach((b) => {
        gsap.killTweensOf(b);
        b.remove();
      });
    };
  }, [bubbleCount, colors]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    />
  );
};

export default BubbleBackground;
