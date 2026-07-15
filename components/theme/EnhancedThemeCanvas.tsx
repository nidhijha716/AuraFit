"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import type { ThemeAnimationId } from "@/lib/config/themePresets";

interface EnhancedThemeCanvasProps {
  animation: ThemeAnimationId;
  className?: string;
}

interface ThemeColors {
  accent: string;
  glowAccent: string;
  glowSecondary: string;
  accentSoft: string;
  base: string;
}

interface Ember {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  life: number;
}

function readThemeColors(): ThemeColors {
  if (typeof window === "undefined") {
    return {
      accent: "#f0b48a",
      glowAccent: "rgba(240, 180, 138, 0.35)",
      glowSecondary: "rgba(133, 147, 152, 0.25)",
      accentSoft: "rgba(240, 180, 138, 0.22)",
      base: "#121820",
    };
  }

  const root = getComputedStyle(document.documentElement);
  return {
    accent: root.getPropertyValue("--accent").trim() || "#f0b48a",
    glowAccent: root.getPropertyValue("--glow-accent").trim() || "rgba(240,180,138,0.35)",
    glowSecondary:
      root.getPropertyValue("--glow-secondary").trim() ||
      "rgba(133,147,152,0.25)",
    accentSoft:
      root.getPropertyValue("--accent-soft").trim() || "rgba(240,180,138,0.22)",
    base: root.getPropertyValue("--ambient-base").trim() || "#121820",
  };
}

function parseColor(color: string): [number, number, number, number] {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex.padEnd(6, "0").slice(0, 6);
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return [r, g, b, 1];
  }

  const rgba =
    trimmed.match(/rgba?\(([^)]+)\)/)?.[1]?.split(",").map((v) => v.trim()) ??
    [];
  if (rgba.length >= 3) {
    return [
      Number(rgba[0]),
      Number(rgba[1]),
      Number(rgba[2]),
      rgba[3] !== undefined ? Number(rgba[3]) : 1,
    ];
  }

  return [240, 180, 138, 1];
}

function drawOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number
) {
  const [r, g, b, a] = parseColor(color);
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * a})`);
  gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${alpha * a * 0.35})`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawAuroraMesh(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  colors: ThemeColors,
  intensity: number
) {
  const orbs = [
    {
      cx: 0.22 + Math.sin(t * 0.00035) * 0.12,
      cy: 0.18 + Math.cos(t * 0.00028) * 0.1,
      r: Math.min(w, h) * (0.42 + Math.sin(t * 0.0004) * 0.06),
      color: colors.glowAccent,
      alpha: 0.55 * intensity,
    },
    {
      cx: 0.78 + Math.cos(t * 0.00031) * 0.1,
      cy: 0.72 + Math.sin(t * 0.00026) * 0.08,
      r: Math.min(w, h) * (0.38 + Math.cos(t * 0.00033) * 0.05),
      color: colors.glowSecondary,
      alpha: 0.48 * intensity,
    },
    {
      cx: 0.52 + Math.sin(t * 0.00022) * 0.14,
      cy: 0.48 + Math.cos(t * 0.00024) * 0.12,
      r: Math.min(w, h) * (0.34 + Math.sin(t * 0.00038) * 0.04),
      color: colors.accentSoft,
      alpha: 0.42 * intensity,
    },
    {
      cx: 0.12 + Math.cos(t * 0.0002) * 0.08,
      cy: 0.65 + Math.sin(t * 0.00018) * 0.06,
      r: Math.min(w, h) * 0.28,
      color: colors.accent,
      alpha: 0.28 * intensity,
    },
  ];

  ctx.globalCompositeOperation = "screen";
  for (const orb of orbs) {
    drawOrb(ctx, orb.cx * w, orb.cy * h, orb.r, orb.color, orb.alpha);
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawNebulaMesh(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  colors: ThemeColors
) {
  const orbs = [
    { cx: 0.15, cy: 0.2, speed: 0.00018, r: 0.5, color: colors.glowAccent },
    { cx: 0.85, cy: 0.75, speed: 0.00014, r: 0.46, color: colors.accentSoft },
    { cx: 0.55, cy: 0.35, speed: 0.0002, r: 0.4, color: colors.accent },
    { cx: 0.3, cy: 0.8, speed: 0.00016, r: 0.36, color: colors.glowSecondary },
    { cx: 0.7, cy: 0.15, speed: 0.00012, r: 0.32, color: colors.glowAccent },
  ];

  ctx.globalCompositeOperation = "screen";
  orbs.forEach((orb, i) => {
    const angle = t * orb.speed + i * 1.4;
    const x = (orb.cx + Math.sin(angle) * 0.08) * w;
    const y = (orb.cy + Math.cos(angle * 0.85) * 0.07) * h;
    const radius = Math.min(w, h) * orb.r * (0.92 + Math.sin(angle * 2) * 0.08);
    drawOrb(ctx, x, y, radius, orb.color, 0.38);
  });
  ctx.globalCompositeOperation = "source-over";
}

function drawWaves(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  colors: ThemeColors
) {
  const bands = [
    { y: 0.28, amp: 0.04, freq: 2.2, speed: 0.0008, color: colors.glowAccent },
    { y: 0.52, amp: 0.035, freq: 1.8, speed: 0.0006, color: colors.accentSoft },
    { y: 0.72, amp: 0.03, freq: 2.6, speed: 0.0007, color: colors.glowSecondary },
  ];

  ctx.globalCompositeOperation = "screen";
  for (const band of bands) {
    const [r, g, b] = parseColor(band.color);
    const gradient = ctx.createLinearGradient(0, band.y * h - 80, 0, band.y * h + 80);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.22)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const nx = x / w;
      const y =
        band.y * h +
        Math.sin(nx * Math.PI * band.freq + t * band.speed) * band.amp * h;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawPulse(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  colors: ThemeColors
) {
  const cx = w * 0.5;
  const cy = h * 0.45;
  const pulse = 0.5 + Math.sin(t * 0.0012) * 0.5;
  const radius = Math.min(w, h) * (0.35 + pulse * 0.25);

  ctx.globalCompositeOperation = "screen";
  drawOrb(ctx, cx, cy, radius, colors.glowAccent, 0.35 + pulse * 0.25);
  drawOrb(ctx, cx, cy, radius * 0.55, colors.accent, 0.2 + pulse * 0.15);
  drawOrb(
    ctx,
    cx + Math.sin(t * 0.0005) * w * 0.08,
    cy + Math.cos(t * 0.0004) * h * 0.06,
    radius * 0.35,
    colors.glowSecondary,
    0.18
  );
  ctx.globalCompositeOperation = "source-over";
}

function drawShimmer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  colors: ThemeColors
) {
  drawAuroraMesh(ctx, w, h, t, colors, 0.65);

  const sweep = ((t * 0.00015) % 1.6) - 0.3;
  const [r, g, b] = parseColor(colors.glowAccent);

  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.translate(w * sweep, h * -0.1);
  ctx.rotate(-0.35);
  const gradient = ctx.createLinearGradient(-w * 0.3, 0, w * 0.3, 0);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.08)`);
  gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.35)`);
  gradient.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.08)`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(-w * 0.5, -h * 0.2, w * 1.5, h * 1.4);
  ctx.restore();
}

function createEmbers(count: number, w: number, h: number): Ember[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: h + Math.random() * h * 0.2,
    size: 1.5 + Math.random() * 3,
    speed: 0.35 + Math.random() * 0.55,
    drift: 0.2 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    life: Math.random(),
  }));
}

function drawEmbers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  colors: ThemeColors,
  embers: Ember[]
) {
  drawAuroraMesh(ctx, w, h, t * 0.6, colors, 0.45);

  const [r, g, b] = parseColor(colors.accent);
  ctx.globalCompositeOperation = "screen";

  for (const ember of embers) {
    ember.y -= ember.speed;
    ember.x += Math.sin(t * 0.002 + ember.phase) * ember.drift;
    ember.life += 0.004;

    if (ember.y < -20) {
      ember.y = h + 10;
      ember.x = Math.random() * w;
      ember.life = 0;
    }

    const fade = Math.sin(Math.min(ember.life, 1) * Math.PI);
    const alpha = fade * 0.85;

    const gradient = ctx.createRadialGradient(
      ember.x,
      ember.y,
      0,
      ember.x,
      ember.y,
      ember.size * 4
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ember.x, ember.y, ember.size * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
}

export function EnhancedThemeCanvas({
  animation,
  className,
}: EnhancedThemeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const embersRef = useRef<Ember[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (animation === "none" || reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frameId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (animation === "embers" && embersRef.current.length === 0) {
        embersRef.current = createEmbers(28, width, height);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const render = (time: number) => {
      if (document.hidden) {
        frameId = requestAnimationFrame(render);
        return;
      }

      const colors = readThemeColors();
      const [br, bg, bb] = parseColor(colors.base);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgba(${br}, ${bg}, ${bb}, 0.15)`;
      ctx.fillRect(0, 0, width, height);

      switch (animation) {
        case "aurora":
          drawAuroraMesh(ctx, width, height, time, colors, 1);
          break;
        case "nebula":
          drawNebulaMesh(ctx, width, height, time, colors);
          break;
        case "waves":
          drawWaves(ctx, width, height, time, colors);
          drawAuroraMesh(ctx, width, height, time * 0.7, colors, 0.35);
          break;
        case "pulse":
          drawPulse(ctx, width, height, time, colors);
          break;
        case "shimmer":
          drawShimmer(ctx, width, height, time, colors);
          break;
        case "embers":
          drawEmbers(ctx, width, height, time, colors, embersRef.current);
          break;
        default:
          break;
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      embersRef.current = [];
    };
  }, [animation, reduceMotion]);

  if (animation === "none" || reduceMotion) return null;

  return (
    <div className={className} aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ mixBlendMode: "screen" }}
      />
      <div className="theme-enhanced-noise pointer-events-none absolute inset-0" />
      <div className="theme-enhanced-vignette pointer-events-none absolute inset-0" />
      <div className="theme-enhanced-depth pointer-events-none absolute inset-0" />
    </div>
  );
}
