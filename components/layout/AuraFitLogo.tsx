import Link from "next/link";
import { AuraFitMark } from "@/components/brand/AuraFitMark";
import { cn } from "@/lib/utils/cn";

interface AuraFitLogoProps {
  className?: string;
  compact?: boolean;
  /** Show TRAIN. TRACK. TRANSFORM. under the wordmark */
  showTagline?: boolean;
  /** Larger mark/wordmark for landing heroes */
  size?: "sm" | "md" | "lg";
}

const markSize = { sm: 32, md: 36, lg: 44 } as const;

export function AuraFitLogo({
  className,
  compact = false,
  showTagline = false,
  size = "md",
}: AuraFitLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 active:opacity-80",
        className
      )}
      aria-label="AuraFit home"
    >
      <AuraFitMark size={markSize[size]} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-bold tracking-tight",
              size === "lg" ? "text-xl md:text-2xl" : "text-lg"
            )}
          >
            <span className="text-white">Aura</span>
            <span className="bg-gradient-to-r from-[#c47a52] via-[#e8b08a] to-[#f5d4b8] bg-clip-text text-transparent">
              Fit
            </span>
          </span>
          {showTagline && (
            <span className="mt-1.5 text-[0.58rem] font-medium uppercase tracking-[0.22em] text-white/70 md:text-[0.65rem]">
              Train. Track. Transform.
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
