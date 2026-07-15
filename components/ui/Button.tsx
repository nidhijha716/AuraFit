import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "aura-btn-primary font-semibold hover:opacity-95",
  secondary:
    "bg-btn-secondary-bg text-btn-secondary-fg border border-glass-border font-medium hover:bg-[var(--glass-hover)]",
  ghost:
    "bg-transparent text-text-primary font-medium hover:bg-[var(--glass-hover)]",
  outline:
    "border border-glass-border bg-transparent text-text-primary font-medium hover:bg-[var(--glass-hover)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-6 text-base font-semibold",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
