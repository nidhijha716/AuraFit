"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AuraFitLogo } from "@/components/layout/AuraFitLogo";
import { HeroVideo } from "@/components/landing/HeroVideo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const chapters = [
  {
    num: "01",
    title: "Train",
    line: "One exercise at a time.",
    body: "Guided sessions keep you locked in — clear cues, real focus, finish strong.",
  },
  {
    num: "02",
    title: "Track",
    line: "Progress you can feel.",
    body: "Streaks, history, estimated calories, and day-by-day muscle breakdown — always labeled as estimates.",
  },
  {
    num: "03",
    title: "Transform",
    line: "Your plan. Your pace.",
    body: "Build a weekly routine around your goals, experience, and schedule — guest or account.",
  },
] as const;

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function LandingPage() {
  return (
    <AuthGuard requireAuth={false} requireOnboarding={false}>
      <LandingPageContent />
    </AuthGuard>
  );
}

function LandingPageContent() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  const progress = reduceMotion ? scrollYProgress : smoothProgress;
  const videoOpacity = useTransform(progress, [0, 0.55, 0.85], [1, 0.35, 0]);
  const heroTextOpacity = useTransform(progress, [0, 0.35, 0.55], [1, 0.6, 0]);

  return (
    <div className="relative w-full bg-[#0a0c10]">
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ opacity: videoOpacity }}
        aria-hidden
      >
        <HeroVideo />
      </motion.div>

      {/* ── Hero (unchanged experience) ── */}
      <section
        ref={heroRef}
        className="relative z-10 flex min-h-dvh w-full flex-col"
      >
        <header className="safe-top absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-5 md:px-10 md:pt-8">
          <AuraFitLogo size="md" />
          <Link
            href="/auth?mode=login"
            className="rounded-xl bg-black/30 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/15 transition hover:bg-white/10 md:text-base"
          >
            Log In
          </Link>
        </header>

        <motion.div
          style={{ opacity: heroTextOpacity }}
          className="flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-28 text-center md:px-10 md:pb-20 md:pt-36"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="hero-subtext mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80 md:text-xs"
          >
            Your Smart Gym Companion
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.65, ease: easeOut }}
            className="hero-headline max-w-4xl text-balance text-[2.35rem] font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          >
            <span className="block">Push Your</span>
            <span className="block bg-gradient-to-r from-white via-[#fff4ec] to-[#f0b48a] bg-clip-text text-transparent">
              Limits Today
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.55, ease: easeOut }}
            className="hero-subtext mt-4 max-w-md text-[15px] leading-relaxed text-white/88 md:mt-5 md:max-w-lg md:text-lg"
          >
            Every rep counts. Train with purpose — AuraFit guides you one
            exercise at a time until you finish strong.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: easeOut }}
            className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:max-w-md sm:flex-row sm:justify-center md:mt-8"
          >
            <Link
              href="/auth?mode=signup"
              className="w-full sm:w-auto sm:max-w-[220px] sm:flex-1"
            >
              <Button
                size="lg"
                fullWidth
                className="!rounded-full !bg-white !text-[#141820] shadow-xl shadow-black/30 hover:!opacity-95"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link
              href="/auth?mode=login"
              className="w-full sm:w-auto sm:max-w-[220px] sm:flex-1"
            >
              <Button
                size="lg"
                variant="outline"
                fullWidth
                className="!rounded-full !border-white/35 !bg-white/8 !text-white backdrop-blur-md hover:!bg-white/15"
              >
                Log In
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="mt-4 text-center text-sm text-white/70"
          >
            No account needed.{" "}
            <Link
              href="/dashboard"
              className="font-semibold text-[#f5d4b8] hover:underline"
            >
              Explore as guest
            </Link>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ opacity: heroTextOpacity }}
          className="flex flex-col items-center gap-1 pb-8 md:pb-10"
          aria-hidden
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
            Scroll
          </span>
          <ChevronDown className="h-6 w-6 animate-bounce text-white/70" />
        </motion.div>
      </section>

      {/* ── Scroll story (new) ── */}
      <section className="landing-sheet relative z-20 rounded-t-[2rem] md:rounded-t-[2.5rem]">
        <div className="landing-sheet-handle" aria-hidden />

        <div className="mx-auto max-w-3xl px-5 pb-6 pt-14 md:px-8 md:pt-20">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: easeOut }}
            className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f0b48a]/85"
          >
            Train. Track. Transform.
          </motion.p>
        </div>

        {chapters.map((chapter, i) => (
          <article
            key={chapter.title}
            className={cn(
              "relative mx-auto flex min-h-[72dvh] max-w-3xl flex-col justify-center px-5 py-16 md:min-h-[78dvh] md:px-8 md:py-24",
              i < chapters.length - 1 && "landing-chapter-divider"
            )}
          >
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, ease: easeOut }}
              className="mb-4 text-xs font-semibold tracking-[0.28em] text-white/35"
            >
              {chapter.num}
            </motion.p>

            <motion.h2
              initial={
                reduceMotion ? false : { opacity: 0, y: 28, filter: "blur(6px)" }
              }
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: easeOut }}
              className="text-[clamp(2.75rem,12vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-white"
            >
              <span className="aura-section-title">{chapter.title}</span>
            </motion.h2>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: 0.06, duration: 0.55, ease: easeOut }}
              className="mt-5 max-w-md text-xl font-semibold text-white/90 md:text-2xl"
            >
              {chapter.line}
            </motion.p>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.1, duration: 0.5, ease: easeOut }}
              className="mt-3 max-w-md text-[15px] leading-relaxed text-white/60 md:text-base"
            >
              {chapter.body}
            </motion.p>
          </article>
        ))}

        {/* Quiet tagline beat */}
        <div className="relative overflow-hidden px-5 py-24 md:py-32">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 0.35 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(240,180,138,0.22),transparent_68%)]" />
          </motion.div>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.75, ease: easeOut }}
            className="relative text-center text-[clamp(1.15rem,4.5vw,1.85rem)] font-semibold uppercase tracking-[0.28em] text-white/85"
          >
            Train. Track.{" "}
            <span className="aura-section-title tracking-[0.28em]">
              Transform.
            </span>
          </motion.p>
        </div>

        {/* Closing CTA */}
        <div className="mx-auto max-w-lg px-5 pb-16 text-center md:pb-20">
          <motion.h3
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: easeOut }}
            className="text-2xl font-bold text-white md:text-3xl"
          >
            Ready when you are
          </motion.h3>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, duration: 0.5, ease: easeOut }}
            className="mt-2 text-sm text-white/60 md:text-base"
          >
            Start free as a guest, or create an account to keep everything
            synced.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.5, ease: easeOut }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Link href="/auth?mode=signup" className="sm:min-w-[200px]">
              <Button size="lg" fullWidth>
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard" className="sm:min-w-[200px]">
              <Button size="lg" variant="outline" fullWidth>
                Explore as guest
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Credit */}
        <footer className="border-t border-white/8 px-5 py-10 text-center md:py-12">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm text-white/45"
          >
            Made by{" "}
            <span className="font-semibold bg-gradient-to-r from-[#c47a52] via-[#e8b08a] to-[#f5d4b8] bg-clip-text text-transparent">
              Nidhi
            </span>
          </motion.p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/25">
            AuraFit
          </p>
        </footer>
      </section>
    </div>
  );
}
