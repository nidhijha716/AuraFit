import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface GuestModeBannerProps {
  className?: string;
  compact?: boolean;
}

export function GuestModeBanner({ className, compact = false }: GuestModeBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#f0b48a]/25 bg-[#f0b48a]/10 px-4 py-3",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="aura-icon mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <Sparkles className="h-4 w-4 text-[#f5d4b8]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              {compact ? "Guest mode" : "You're using AuraFit as a guest"}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/65">
              {compact
                ? "Sign up to save progress across devices."
                : "Browse, train, and explore freely. Create a free account to permanently save workouts, routines, and progress."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/auth?mode=login"
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Log In
          </Link>
          <Link
            href="/auth?mode=signup"
            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#141820] transition hover:opacity-90"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
