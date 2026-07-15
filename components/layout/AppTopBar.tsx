"use client";

import { AuraFitLogo } from "@/components/layout/AuraFitLogo";
import { ThemeMenu } from "@/components/theme/ThemeMenu";

export function AppTopBar() {
  return (
    <header
      className="mb-4 flex items-center justify-between gap-3"
      aria-label="App header"
    >
      <AuraFitLogo className="lg:hidden" />
      <ThemeMenu className="ml-auto" />
    </header>
  );
}
