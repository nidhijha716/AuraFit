import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-white/72"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "aura-input h-12 w-full rounded-2xl px-4 text-sm text-text-primary",
          "placeholder:text-text-muted",
          "transition-all duration-200",
          error && "border-red-400/50 focus:ring-red-400/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
