import React from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Lock, Zap, EyeOff, ArrowRight, ChevronDown } from "lucide-react";
import { BrandLogo, HeroFingerprint, FingerprintLogo } from "../components/FingerprintLogo";

/* ---------------------------------------------------------------------------
   Animated particles background (CSS-driven, lightweight)
   --------------------------------------------------------------------------- */
function ParticleField() {
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.35 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? "var(--accent-cyan)"
                : p.id % 3 === 1
                  ? "var(--accent-purple)"
                  : "var(--privacy)",
          }}
          animate={{
            y: [0, -80, -160, 0],
            x: [0, p.id % 2 === 0 ? 30 : -30, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Feature card with interactive 3D tilt
   --------------------------------------------------------------------------- */
function FeatureCard({
  icon: Icon,
  tag,
  title,
  description,
  delay,
  color,
}: {
  icon: React.ElementType;
  tag: string;
  title: string;
  description: string;
  delay: number;
  color: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  };
  const reset = () => {
    if (ref.current)
      ref.current.style.transform =
        "perspective(800px) rotateY(0) rotateX(0) scale(1)";
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className="card-glass p-8 cursor-default"
      style={{
        transition:
          "transform 150ms ease-out, border-color 300ms ease, box-shadow 300ms ease",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
        style={{ background: `${color}22`, border: `1px solid ${color}33` }}
      >
        <Icon size={22} style={{ color }} strokeWidth={1.5} />
      </div>
      <div
        className="text-[11px] font-bold tracking-[0.1em] uppercase mb-3"
        style={{ color }}
      >
        {tag}
      </div>
      <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
    </motion.div>
  );
}

/* ===========================================================================
   Landing Page
   =========================================================================== */
export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden">
      {/* ── Nav ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-8"
        style={{
          background: "rgba(4,6,8,0.7)",
          backdropFilter: "blur(16px) saturate(1.2)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <BrandLogo size={30} />
          <span className="text-[15px] font-bold tracking-tight">
            StarkPayroll
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Features
          </a>
          <Link to="/dashboard" className="btn-primary py-2 px-4 text-[12px]">
            Launch App <ArrowRight size={14} />
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-[60px]"
      >
        <div className="absolute inset-0 hero-grid" />
        <div className="absolute inset-0 hero-radial" />
        <div className="absolute inset-0 hero-mesh" />
        <ParticleField />

        <div className="relative z-10 max-w-[1200px] w-full mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
          {/* Text */}
          <div className="flex-1 space-y-8 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--privacy-border)] bg-[var(--privacy-muted)] mb-6">
                <div className="status-dot status-dot-success" />
                <span className="text-[11px] font-semibold text-[var(--privacy)] tracking-wide uppercase">
                  Privacy-First Payroll
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-[44px] md:text-[60px] leading-[1.05] font-semibold tracking-[-0.03em]"
            >
              Payroll without
              <br />
              <span className="gradient-text">the public ledger</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-[16px] md:text-[18px] text-[var(--text-secondary)] max-w-[480px] leading-[1.7] font-light mx-auto md:mx-0"
            >
              Companies leak salary data on public blockchains. We fix that. Pay
              employees with fully confidential transfers using ElGamal
              encryption on Starknet.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
            >
              <Link to="/dashboard">
                <span className="btn-primary text-[14px] py-3 px-8">
                  Open Dashboard <ArrowRight size={16} />
                </span>
              </Link>
              <Link to="/dashboard">
                <span className="btn-secondary text-[14px] py-3 px-8">
                  <Zap size={16} className="text-[var(--accent-cyan)]" />
                  Try with StarkZap
                </span>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="flex items-center gap-6 justify-center md:justify-start pt-4"
            >
              {[
                { icon: Shield, label: "Starknet L2", c: "var(--accent-cyan)" },
                { icon: EyeOff, label: "Tongo Encrypted", c: "var(--privacy)" },
                {
                  icon: Zap,
                  label: "StarkZap Signless",
                  c: "var(--accent-purple)",
                },
              ].map(({ icon: I, label, c }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]"
                >
                  <I size={14} style={{ color: c }} />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Fingerprint */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden md:flex items-center justify-center shrink-0"
            style={{ width: 420, height: 420 }}
          >
            <HeroFingerprint size={320} />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} className="text-[var(--text-muted)]" />
        </motion.div>
      </motion.section>

      {/* ── Features ── */}
      <section id="features" className="relative py-32 md:py-40">
        <div className="absolute inset-0 hero-mesh opacity-50" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--accent-cyan)] mb-4">
              Protocol Stack
            </div>
            <h2 className="text-[32px] md:text-[42px] font-semibold tracking-[-0.03em] mb-4">
              Built for{" "}
              <span className="gradient-text">confidential payroll</span>
            </h2>
            <p className="text-[16px] text-[var(--text-secondary)] max-w-[520px] mx-auto leading-[1.7] font-light">
              Three layers of technology ensuring your salary data stays
              private, accessible, and verifiable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={EyeOff}
              tag="Confidential"
              title="Tongo Private Transfers"
              description="Salaries are encrypted using ElGamal encryption. Amounts and history are hidden on-chain, protecting both treasury data and employee privacy."
              delay={0}
              color="#3ecf8e"
            />
            <FeatureCard
              icon={Zap}
              tag="Frictionless"
              title="StarkZap Integration"
              description="Sign in without a browser extension. Create smart accounts instantly with deterministic generation, smoothing onboarding for non-crypto users."
              delay={0.15}
              color="#00d4ff"
            />
            <FeatureCard
              icon={Shield}
              tag="Verified"
              title="Starknet L2 Security"
              description="All transactions settle on Starknet with STARK proofs. Zero-knowledge verification ensures integrity without exposing sensitive data."
              delay={0.3}
              color="#8b5cf6"
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative py-32 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <h2 className="text-[32px] md:text-[42px] font-semibold tracking-[-0.03em] mb-4">
              How it <span className="gradient-text-privacy">works</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {(
              [
                { s: "01", t: "Connect", d: "Link your wallet or use StarkZap for instant signless access.", i: Zap },
                { s: "02", t: "Add Team", d: "Register employees with wallet addresses and optional Tongo keys.", i: Shield },
                { s: "03", t: "Encrypt", d: "Enter your company Tongo key to build encrypted transfer proofs.", i: Lock },
                { s: "04", t: "Pay", d: "Execute confidential transfers. Amounts stay hidden on-chain.", i: EyeOff },
              ] as const
            ).map((item, idx) => (
              <motion.div
                key={item.s}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="relative group"
              >
                <div className="text-[48px] font-bold gradient-text opacity-20 mb-4">
                  {item.s}
                </div>
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4 group-hover:border-[var(--accent-border)] group-hover:shadow-[var(--glow-cyan)] transition-all duration-300">
                  <item.i
                    size={18}
                    className="text-[var(--accent-cyan)]"
                    strokeWidth={1.5}
                  />
                </div>
                <h4 className="text-[16px] font-semibold mb-2">{item.t}</h4>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  {item.d}
                </p>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-[52px] right-0 translate-x-1/2 w-8 h-px bg-gradient-to-r from-[var(--accent-border)] to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 border-t border-[var(--border)]">
        <div className="absolute inset-0 hero-radial" />
        <div className="relative z-10 max-w-[600px] mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-[28px] md:text-[38px] font-semibold tracking-[-0.03em] mb-4">
              Start paying privately
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] mb-8 leading-relaxed">
              No sign-up required. Connect a wallet or use StarkZap to get
              started in seconds.
            </p>
            <Link to="/dashboard">
              <span className="btn-primary text-[14px] py-3.5 px-10">
                Launch Dashboard <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 text-center border-t border-[var(--border)]">
        <div className="flex items-center justify-center gap-6 text-[12px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <FingerprintLogo size={14} gradient={false} className="text-[var(--accent-cyan)]" />
            Built on Starknet
          </span>
          <span className="text-[var(--border)]">|</span>
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-[var(--privacy)]" />
            Encrypted by Tongo
          </span>
          <span className="text-[var(--border)]">|</span>
          <span className="flex items-center gap-1.5">
            <Zap size={12} className="text-[var(--accent-purple)]" />
            Connected by StarkZap
          </span>
        </div>
      </footer>
    </div>
  );
}
