"use client";

import { MeshBackground } from "@/components/landing/mesh-background";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StatsSection } from "@/components/landing/stats-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <MeshBackground />
      <div className="relative z-10">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <StatsSection />
        <CtaSection />
      </div>
    </main>
  );
}
