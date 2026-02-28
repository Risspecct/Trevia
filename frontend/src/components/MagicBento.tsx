import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";

interface MagicBentoProps {
  children?: React.ReactNode;
  className?: string;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
  disableAnimations?: boolean;
  overflowVisible?: boolean;
}

const MagicBento = ({
  children,
  className = "",
  textAutoHide = true,
  enableStars: _enableStars = false,
  enableSpotlight: _enableSpotlight = false,
  enableBorderGlow = true,
  enableTilt = false,
  enableMagnetism = false,
  clickEffect = true,
  spotlightRadius: _spotlightRadius = 400,
  particleCount: _particleCount = 0,
  glowColor = "184, 134, 11",
  disableAnimations = false,
  overflowVisible = false,
}: MagicBentoProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const borderGlowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Border glow tracking on mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || disableAnimations) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (enableBorderGlow && borderGlowRef.current) {
        const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI);
        borderGlowRef.current.style.background = `conic-gradient(from ${angle}deg, rgba(${glowColor}, 0.4), transparent 60%, rgba(${glowColor}, 0.4))`;
      }

      if (enableTilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        gsap.to(cardRef.current, {
          rotateX,
          rotateY,
          duration: 0.4,
          ease: "power2.out",
        });
      }

      if (enableMagnetism) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const moveX = ((x - centerX) / centerX) * 5;
        const moveY = ((y - centerY) / centerY) * 5;
        gsap.to(cardRef.current, {
          x: moveX,
          y: moveY,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    },
    [enableBorderGlow, enableTilt, enableMagnetism, glowColor, disableAnimations]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!disableAnimations && cardRef.current) {
      // Glow pulse on hover — dark, no glare
      gsap.fromTo(
        cardRef.current,
        { boxShadow: `0 0 0px rgba(${glowColor}, 0)` },
        {
          boxShadow: `0 0 20px rgba(${glowColor}, 0.3), 0 0 50px rgba(${glowColor}, 0.12)`,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!cardRef.current || disableAnimations) return;

    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      boxShadow: `0 0 0px rgba(${glowColor}, 0)`,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  // Click ripple burst
  const spawnRipple = (x: number, y: number, count = 8) => {
    if (!cardRef.current) return;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: rgba(${glowColor}, 0.9);
        border-radius: 50%;
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
        box-shadow: 0 0 10px rgba(${glowColor}, 0.8);
        z-index: 50;
      `;
      cardRef.current.appendChild(particle);

      const angle = (i / count) * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        duration: 0.6 + Math.random() * 0.3,
        ease: "power2.out",
        onComplete: () => particle.remove(),
      });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickEffect || !cardRef.current || disableAnimations) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    spawnRipple(x, y, 8);

    // Flash pulse
    gsap.fromTo(
      cardRef.current,
      { boxShadow: `0 0 0px rgba(${glowColor}, 0)` },
      {
        boxShadow: `0 0 35px rgba(${glowColor}, 0.5), 0 0 70px rgba(${glowColor}, 0.2)`,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      }
    );
  };

  return (
    <div
      ref={cardRef}
      className={`magic-bento relative ${overflowVisible ? "overflow-visible" : "overflow-hidden"} ${className}`}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Border glow layer */}
      {enableBorderGlow && (
        <>
          <div
            ref={borderGlowRef}
            className="absolute -inset-[2px] rounded-[inherit] opacity-0 transition-opacity duration-500 pointer-events-none"
            style={{
              opacity: isHovered ? 1 : 0,
              borderRadius: "inherit",
            }}
          />
          <div
            className="absolute inset-[2px] rounded-[inherit] pointer-events-none"
            style={{
              background: "inherit",
              borderRadius: "inherit",
            }}
          />
        </>
      )}

      {/* Content */}
      <div
        className={`relative z-20 h-full transition-opacity duration-300 ${
          textAutoHide && isHovered ? "opacity-90" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default MagicBento;
