/**
 * Consistent gradient TREVIA logo used across all pages.
 * The gradient and glow remain the same regardless of route.
 */
const TreviaLogo = ({ className = "" }: { className?: string }) => (
  <h1
    className={`text-lg font-bold font-display tracking-[0.25em] select-none ${className}`}
    style={{
      background: "linear-gradient(135deg, #467c57 0%, #7c9082 45%, #568a66 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      filter: "drop-shadow(0 0 8px rgba(70,124,87,0.35))",
    }}
  >
    TREVIA
  </h1>
);

export default TreviaLogo;
