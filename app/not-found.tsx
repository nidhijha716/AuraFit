import Link from "next/link";
import { MobileShell } from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function NotFound() {
  return (
    <MobileShell showNav={false}>
      <GlassCard padding="lg" className="mt-20 text-center">
        <p className="text-6xl font-bold aura-section-title">404</p>
        <h1 className="mt-4 text-xl font-bold text-text-primary">Page not found</h1>
        <p className="mt-2 text-sm text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard" className="mt-6 block">
          <Button fullWidth>Go to Dashboard</Button>
        </Link>
      </GlassCard>
    </MobileShell>
  );
}
