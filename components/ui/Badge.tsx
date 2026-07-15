import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success";
}

const variants = {
  default: "bg-white/15 text-text-primary ring-1 ring-white/10",
  accent: "aura-icon text-[#f5d4b8] font-semibold",
  success: "bg-emerald-500/20 text-emerald-300 font-semibold ring-1 ring-emerald-400/20",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
