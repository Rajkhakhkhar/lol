"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

import ClientCursor from "@/components/ClientCursor";
import Dither from "@/components/Dither";
import { PillNav } from "@/components/landing/PillNav";
import ImageTrail from "@/components/landing/ImageTrail";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

import s from "./landing.module.css";

const GridScan = dynamic(
  () => import("@/components/landing/GridScan").then((mod) => mod.GridScan),
  { ssr: false },
);
const GalaxyShader = dynamic(
  () => import("@/components/GalaxyShader").then((mod) => mod.GalaxyShader),
  { ssr: false },
);

const TRAIL_IMAGES = [
  "https://i.pinimg.com/736x/83/2d/ac/832dac09e0d45055beef6e22d6be4a01.jpg",
  "https://i.pinimg.com/1200x/a1/b7/ec/a1b7ec3fcf3f1c16948a3be4633e7365.jpg",
  "https://i.pinimg.com/1200x/dc/12/01/dc12011c464a71a27804617a107135e0.jpg",
  "https://i.pinimg.com/736x/6a/7f/4f/6a7f4fca12336587b99ea27cd7b797fa.jpg",
  "https://i.pinimg.com/originals/c7/b0/e1/c7b0e1b850706fb18a2598c362c2faae.jpg",
  "https://i.pinimg.com/736x/d9/9e/9e/d99e9ec7b80b68ce2ae28f79fe745bf2.jpg",
  "https://i.pinimg.com/736x/26/fd/e7/26fde7d3bf092e8de9121b076bf98dc8.jpg",
  "https://i.pinimg.com/1200x/16/f9/05/16f9050e154bb6c3f7ebc4a8aae26619.jpg",
];

export default function LandingPage() {
  const { user } = useAuth();
  const startUrl = user ? "/trip/plan" : "/login";

  return (
    <div style={{ scrollBehavior: "smooth" }}>
      <ClientCursor />
      <PillNav />

      <section
        className={cn(s.hero, "relative w-full min-h-screen overflow-hidden max-w-full")}
        id="home"
      >
        <div className="absolute inset-0 z-0 h-full w-full overflow-hidden pointer-events-none">
          <GridScan
            style={{ width: "100%", height: "100%" }}
            sensitivity={0.6}
            lineThickness={1}
            linesColor="#2a1a1a"
            scanColor="#ff9e9e"
            scanOpacity={0.35}
            gridScale={0.12}
            lineStyle="solid"
            lineJitter={0.05}
            scanDirection="pingpong"
            noiseIntensity={0.005}
            scanGlow={0.7}
            scanSoftness={3}
            scanDuration={1.5}
            scanDelay={1}
            scanOnClick={false}
          />
        </div>

        <div className={s.heroInner}>
          <div className={s.heroContent}>
            <div className={s.heroBadge}>AI Travel Planning, Refined</div>

            <h1 className={s.heroTitle}>
              Plan better trips
              <span className={s.heroTitleGradient}> without wasting time on setup.</span>
            </h1>

            <p className={s.heroSubtitle}>
              Build day-by-day itineraries, shape travel details around your pace,
              and keep every plan organized in one clean flow from planning to review.
            </p>

            <div className={s.heroActions}>
              <Link
                href={startUrl}
                className={`${s.primaryBtn} cursor-target`}
                id="hero-start-btn"
              >
                Start Planning
              </Link>
              <a href="#features" className={`${s.secondaryBtn} cursor-target`}>
                View Features
              </a>
            </div>
          </div>
        </div>

        <div className={s.heroScrollHint} style={{ zIndex: 1 }}>
          <span>Scroll to explore</span>
          <span>&darr;</span>
        </div>
      </section>

      <section>
        <div
          style={{
            height: "clamp(300px, 60vh, 600px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <ImageTrail items={TRAIL_IMAGES} variant={1} />
        </div>
      </section>

      <div className="relative w-full min-h-[600px] overflow-hidden" style={{ background: "transparent" }}>
        <div className="relative z-10 w-full">
          <section
            className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden py-20"
            id="features"
          >
            <div className="absolute inset-0 z-0">
              <GalaxyShader />
            </div>

            <div className={cn(s.section, "relative z-10")}>
              <div className={s.sectionHeader}>
                <span className={s.sectionLabel}>Why EYEKON?</span>
                <h2 className={s.sectionTitle}>Smart, Fast, and Personalized</h2>
                <p className={s.sectionDesc}>
                  EYEKON gives you a cleaner way to build itineraries, compare
                  options, and move from inspiration to a structured trip without
                  the usual planning friction.
                </p>
              </div>

              <div className={s.featuresGrid}>
                <FeatureCard
                  icon="Map"
                  title="Smart Destination Picker"
                  desc="Select your city and surface the strongest options without digging through clutter."
                />
                <FeatureCard
                  icon="AI"
                  title="AI Generated Itineraries"
                  desc="Generate a full trip outline in seconds, then adjust it around your schedule and budget."
                />
                <FeatureCard
                  icon="Edit"
                  title="Customizable Plans"
                  desc="Refine each stop, change priorities, and keep the final itinerary readable."
                />
              </div>
            </div>
          </section>

          <section className="relative min-h-[600px] w-full overflow-hidden" id="how">
            <div className="absolute inset-0 z-0">
              <GalaxyShader />
            </div>

            <div className={cn(s.section, "relative z-10")}>
              <div
                className={cn(
                  s.ctaBanner,
                  "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-white/15",
                )}
              >
                <h2 className={s.ctaTitle}>Ready to plan your next adventure?</h2>
                <p className={s.ctaDesc}>
                  Join travelers who plan faster, stay organized, and turn ideas
                  into a complete itinerary in minutes.
                </p>
                <Link
                  href={startUrl}
                  className={`${s.primaryBtn} cursor-target`}
                  id="cta-start-btn"
                >
                  Start Planning Trip
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className={s.footer} style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            opacity: 0.5,
            pointerEvents: "none",
          }}
        >
          <Dither
            waveColor={[1, 0.6196078431372549, 0.6196078431372549]}
            disableAnimation={false}
            enableMouseInteraction
            mouseRadius={0.3}
            colorNum={4}
            pixelSize={3}
            waveAmplitude={0.3}
            waveFrequency={3}
            waveSpeed={0.05}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-4 md:px-8 md:py-6">
          <div
            className={cn(
              s.footerContainer,
              "flex flex-wrap justify-center gap-6 text-center md:flex-nowrap md:justify-between md:gap-12 md:text-left",
            )}
          >
            <div className={cn(s.footerBrand, "mb-8 w-full md:mb-0 md:w-auto")}>
              <span className={cn(s.footerLogo, "tracking-[2px] md:tracking-[6px]")}>
                EYEKON
              </span>
              <p className={cn(s.footerDesc, "mx-auto max-w-sm md:mx-0")}>
                AI-powered travel planning platform that helps you create smart
                itineraries in seconds.
              </p>
            </div>

            <div className={cn(s.footerLinks, "mb-8 min-w-[150px] flex-1 md:mb-0")}>
              <h4 className={s.footerLinksTitle}>Quick Links</h4>
              <ul className="flex flex-col gap-2 break-words">
                <li>
                  <Link href={startUrl} className="cursor-target">
                    Start Planning
                  </Link>
                </li>
                <li>
                  <a href="#features" className="cursor-target">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how" className="cursor-target">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link href={startUrl} className="cursor-target">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div className={cn(s.footerLinks, "mb-8 min-w-[150px] flex-1 md:mb-0")}>
              <h4 className={s.footerLinksTitle}>Resources</h4>
              <ul className="flex flex-col gap-2 break-words">
                <li>
                  <a href="#" className="cursor-target">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="cursor-target">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="cursor-target">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="cursor-target">
                    Terms
                  </a>
                </li>
              </ul>
            </div>

            <div className={cn(s.footerLinks, "min-w-[150px] flex-1")}>
              <h4 className={s.footerLinksTitle}>Connect</h4>
              <div className={cn(s.socialIcons, "flex justify-center gap-4 md:justify-start")}>
                <a href="#" aria-label="Twitter" className="cursor-target">
                  X
                </a>
                <a href="#" aria-label="Instagram" className="cursor-target">
                  IG
                </a>
                <a href="#" aria-label="LinkedIn" className="cursor-target">
                  IN
                </a>
                <a href="#" aria-label="GitHub" className="cursor-target">
                  GH
                </a>
              </div>
            </div>
          </div>
          <div className={s.footerBottom}>
            <p>&copy; 2026 EYEKON. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className={cn(
        s.featureCard,
        "cursor-target rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-white/15",
      )}
    >
      <div className={s.featureIcon}>{icon}</div>
      <h3 className={s.featureTitle}>{title}</h3>
      <p className={s.featureDesc}>{desc}</p>
    </div>
  );
}
