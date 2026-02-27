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
}

const MagicBento = ({
  children,
  className = "",
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = false,
  enableMagnetism = false,
  clickEffect = true,
  spotlightRadius = 400,
  particleCount = 12,
  glowColor = "132, 0, 255",
  disableAnimations = false,
}: MagicBentoProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const borderGlowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Star particles
  useEffect(() => {
    if (!enableStars || disableAnimations || !starsContainerRef.current) return;

    const container = starsContainerRef.current;
    const stars: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const star = document.createElement("div");
      star.className = "magic-star";
      star.style.cssText = `
        position: absolute;
        width: ${3 + Math.random() * 5}px;
        height: ${3 + Math.random() * 5}px;
        background: rgba(${glowColor}, ${0.4 + Math.random() * 0.6});
        border-radius: 50%;
        pointer-events: none;
        box-shadow: 0 0 ${2 + Math.random() * 4}px rgba(${glowColor}, 0.5);
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      container.appendChild(star);
      stars.push(star);

      gsap.to(star, {
        x: `random(-30, 30)`,
        y: `random(-30, 30)`,
        opacity: `random(0.2, 1)`,
        scale: `random(0.5, 2)`,
        duration: `random(2, 5)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 2,
      });
    }

    return () => {
      stars.forEach((s) => {
        gsap.killTweensOf(s);
        s.remove();
      });
    };
  }, [enableStars, particleCount, glowColor, disableAnimations]);

  // Spotlight tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || disableAnimations) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (enableSpotlight && spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(${spotlightRadius}px circle at ${x}px ${y}px, rgba(${glowColor}, 0.10), transparent 70%)`;
      }

      if (enableBorderGlow && borderGlowRef.current) {
        const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI);
        borderGlowRef.current.style.background = `conic-gradient(from ${angle}deg, rgba(${glowColor}, 0.35), transparent 60%, rgba(${glowColor}, 0.35))`;
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
    [enableSpotlight, enableBorderGlow, enableTilt, enableMagnetism, spotlightRadius, glowColor, disableAnimations]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!disableAnimations && cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1.01,
        duration: 0.3,
        ease: "power2.out",
      });
      // Glow pulse on hover
      gsap.fromTo(
        cardRef.current,
        { boxShadow: `0 0 0px rgba(${glowColor}, 0)` },
        {
          boxShadow: `0 0 24px rgba(${glowColor}, 0.35), 0 0 60px rgba(${glowColor}, 0.15)`,
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
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      boxShadow: `0 0 0px rgba(${glowColor}, 0)`,
      duration: 0.5,
      ease: "power2.out",
    });

    if (spotlightRef.current) {
      spotlightRef.current.style.background = "transparent";
    }
  };

  // Shared ripple-burst used by both click and mouse-move
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
        box-shadow: 0 0 12px rgba(${glowColor}, 1);
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
        boxShadow: `0 0 40px rgba(${glowColor}, 0.6), 0 0 80px rgba(${glowColor}, 0.3)`,
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
      className={`magic-bento relative overflow-hidden ${className}`}
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

      {/* Spotlight layer */}
      {enableSpotlight && (
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none rounded-[inherit] z-10 transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        />
      )}

      {/* Stars container */}
      {enableStars && (
        <div
          ref={starsContainerRef}
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-[inherit]"
          style={{ opacity: isHovered ? 1 : 0.5, transition: "opacity 0.5s" }}
        />
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
