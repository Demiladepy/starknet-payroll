import { motion } from "framer-motion";

/**
 * Fingerprint logo — privacy-first brand identity.
 * Renders an SVG fingerprint that can be sized and colored via props.
 * Optionally animated with a draw-in effect on mount.
 */
export function FingerprintLogo({
  size = 28,
  className = "",
  animated = false,
  gradient = true,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
  gradient?: boolean;
}) {
  const id = `fp-grad-${size}`;

  // Fingerprint arcs — concentric ridges like a real print
  const paths = [
    // Core — tight center swirl
    "M50 62c0-6.6 5.4-12 12-12",
    "M50 62c0 6.6-5.4 12-12 12",
    // Inner ridges
    "M50 68c0-10 8.1-18 18-18",
    "M50 68c0 10-8.1 18-18 18",
    "M50 56c0 10-8.1 18-18 18",
    "M50 56c0-10 8.1-18 18-18",
    // Mid ridges
    "M50 74c0-14.4 11.6-26 26-26",
    "M50 74c0 13.3-10.7 24-24 24",
    "M50 50c0 14.4-11.6 26-26 26",
    "M50 50c0-13.3 10.7-24 24-24",
    // Outer ridges
    "M50 80c0-19.3 15.7-35 35-35",
    "M50 80c0 16.6-13.4 30-30 30",
    "M50 44c0 19.3-15.7 35-35 35",
    "M50 44c0-16.6 13.4-30 30-30",
    // Outermost ridges
    "M50 86c0-23.2 18.8-42 42-42",
    "M50 86c0 20 -16.1 36-36 36",
    "M50 38c0 23.2-18.8 42-42 42",
    "M50 38c0-20 16.1-36 36-36",
  ];

  const strokeProps = {
    fill: "none",
    stroke: gradient ? `url(#${id})` : "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-purple)" />
          </linearGradient>
        </defs>
      )}

      {paths.map((d, i) =>
        animated ? (
          <motion.path
            key={i}
            d={d}
            {...strokeProps}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: {
                duration: 1.2,
                delay: i * 0.06,
                ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
              },
              opacity: { duration: 0.3, delay: i * 0.06 },
            }}
          />
        ) : (
          <path key={i} d={d} {...strokeProps} />
        )
      )}
    </svg>
  );
}

/**
 * Full branded logo mark — fingerprint inside a rounded container
 * with gradient background and glow effect.
 */
export function BrandLogo({
  size = 32,
  showGlow = false,
}: {
  size?: number;
  showGlow?: boolean;
}) {
  const iconSize = Math.round(size * 0.55);

  return (
    <div
      className="relative flex items-center justify-center rounded-xl shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
        boxShadow: showGlow
          ? "0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(139,92,246,0.15)"
          : undefined,
      }}
    >
      <FingerprintLogo size={iconSize} gradient={false} className="text-white" />
    </div>
  );
}

/**
 * Large hero fingerprint with animated draw-in and surrounding glow.
 */
export function HeroFingerprint({ size = 200 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow backdrop */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.4,
          height: size * 1.4,
          background:
            "radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Rotating ring */}
      <motion.div
        className="absolute rounded-full border border-[var(--accent-border)]"
        style={{
          width: size * 1.15,
          height: size * 1.15,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[0, 72, 144, 216, 288].map((deg) => (
          <div
            key={deg}
            className="absolute w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translateX(${size * 0.575}px) translate(-50%, -50%)`,
              boxShadow: "0 0 6px var(--accent-cyan)",
            }}
          />
        ))}
      </motion.div>
      {/* Counter-rotating inner ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          border: "1px solid rgba(139,92,246,0.15)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[0, 120, 240].map((deg) => (
          <div
            key={deg}
            className="absolute w-1 h-1 rounded-full bg-[var(--accent-purple)]"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translateX(${size * 0.425}px) translate(-50%, -50%)`,
              boxShadow: "0 0 4px var(--accent-purple)",
            }}
          />
        ))}
      </motion.div>
      {/* The fingerprint */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <FingerprintLogo size={size * 0.6} animated gradient />
      </motion.div>
    </div>
  );
}
