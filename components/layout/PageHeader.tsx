"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
  className?: string;
  accentWord?: string;
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
  className,
  accentWord,
}: PageHeaderProps) {
  const renderTitle = () => {
    if (!accentWord || !title.includes(accentWord)) {
      return (
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          {title}
        </h1>
      );
    }

    const [before, after] = title.split(accentWord);
    return (
      <h1 className="text-2xl font-bold tracking-tight text-white">
        {before}
        <span className="aura-section-title">{accentWord}</span>
        {after}
      </h1>
    );
  };

  return (
    <div className={cn("mb-5 flex min-w-0 max-w-full items-start justify-between gap-3 md:mb-6", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="aura-glass-btn mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl active:scale-[0.97]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
        )}
        <div className="min-w-0 overflow-hidden">
          {renderTitle()}
          {subtitle && (
            <p className="mt-1 text-sm leading-snug text-white/65">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
