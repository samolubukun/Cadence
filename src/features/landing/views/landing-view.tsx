import { LandingNavbar } from "../components/landing-navbar";
import { LandingHero } from "../components/landing-hero";
import { LandingDashboardPreview } from "../components/landing-dashboard-preview";
import { LandingWhy } from "../components/landing-why";
import { LandingModels } from "../components/landing-models";
import { LandingBento } from "../components/landing-bento";
import { LandingVoices } from "../components/landing-voices";
import { LandingPricing } from "../components/landing-pricing";
import { LandingArchitecture } from "../components/landing-architecture";
import { LandingHowItWorks } from "../components/landing-how-it-works";
import { LandingCta } from "../components/landing-cta";
import { LandingFooter } from "../components/landing-footer";

export function LandingView() {
  return (
    <div style={{ minHeight:"100vh", fontFamily:"var(--font-inter)", WebkitFontSmoothing:"antialiased" }}>
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingDashboardPreview />
        <LandingWhy />
        <LandingModels />
        <LandingBento />
        <LandingVoices />
        <LandingPricing />
        <LandingHowItWorks />
        <LandingArchitecture />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
