"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import s from "./landing.module.css";
import dynamic from "next/dynamic";
const GridScan = dynamic(() => import("@/components/landing/GridScan").then(mod => mod.GridScan), { ssr: false });
const GalaxyShader = dynamic(() => import("@/components/GalaxyShader").then(mod => mod.GalaxyShader), { ssr: false });

import ImageTrail from "@/components/landing/ImageTrail";
import Shuffle from "@/components/landing/Shuffle";
import Dither from "@/components/Dither";
import ClientCursor from "@/components/ClientCursor";
import { PillNav } from "@/components/landing/PillNav";
import { cn } from "@/lib/utils";

const TRAIL_IMAGES = [
  'https://i.pinimg.com/736x/83/2d/ac/832dac09e0d45055beef6e22d6be4a01.jpg',
  'https://i.pinimg.com/1200x/a1/b7/ec/a1b7ec3fcf3f1c16948a3be4633e7365.jpg',
  'https://i.pinimg.com/1200x/dc/12/01/dc12011c464a71a27804617a107135e0.jpg',
  'https://i.pinimg.com/736x/6a/7f/4f/6a7f4fca12336587b99ea27cd7b797fa.jpg',
  'https://i.pinimg.com/originals/c7/b0/e1/c7b0e1b850706fb18a2598c362c2faae.jpg',
  'https://i.pinimg.com/736x/d9/9e/9e/d99e9ec7b80b68ce2ae28f79fe745bf2.jpg',
  'https://i.pinimg.com/736x/26/fd/e7/26fde7d3bf092e8de9121b076bf98dc8.jpg',
  'https://i.pinimg.com/1200x/16/f9/05/16f9050e154bb6c3f7ebc4a8aae26619.jpg',
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  const startUrl = isLoggedIn ? "/trip/plan" : "/login";

  return (
    <div style={{ scrollBehavior: "smooth" }}>
      <ClientCursor />
      <PillNav />

      {/* ── Hero Section ─────────────────────────── */}
      <section className={cn(s.hero, "relative w-full min-h-screen flex items-center justify-center overflow-hidden max-w-full")} id="home">
        {/* GridScan animation background */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
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

        <div className={s.heroBadge} style={{ position: "relative", zIndex: 1 }}>✨ AI-Powered Travel Planning</div>

        <h1 className={cn(s.heroTitle, "text-3xl sm:text-4xl md:text-6xl")} style={{ position: "relative", zIndex: 1 }}>
          Customize Your Dream Trip{" "}
          <span className={s.heroTitleGradient}>In Minutes</span>
        </h1>

        <p className={cn(s.heroSubtitle, "text-sm sm:text-base md:text-lg")} style={{ position: "relative", zIndex: 1 }}>
          EYEKON uses AI to create optimised, day-by-day itineraries tailored
          to your preferences — so you spend less time planning and more time
          exploring.
        </p>

        <div className={s.heroActions} style={{ position: "relative", zIndex: 1 }}>
          <Link href={startUrl} className={`${s.primaryBtn} cursor-target`} id="hero-start-btn">
            🚀 Start Planning Trip
          </Link>
          <a href="#features" className={`${s.secondaryBtn} cursor-target`}>
            Learn More ↓
          </a>
        </div>

        <div className={s.heroScrollHint} style={{ zIndex: 1 }}>
          <span>Scroll to explore</span>
          <span>↓</span>
        </div>
      </section>

      {/* ── Secondary Section ─────────────────────────── */}
      <section>
        <div style={{ height: "clamp(300px, 60vh, 600px)", position: "relative", overflow: "hidden" }}>
          <ImageTrail
            items={TRAIL_IMAGES}
            variant={1}
          />
        </div>
      </section>

      {/* ── Features & CTA (Shared Background) ───────────────── */}
      <div
        className="relative w-full min-h-[600px] overflow-hidden"
        style={{ background: "transparent" }}
      >
        {/* ── CONTENT ── */}
        <div className="relative z-10 w-full">
          {/* ── Features ────────────────────────────────────── */}
          <section className="relative overflow-hidden w-full min-h-screen py-20 flex flex-col justify-center" id="features">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
              <GalaxyShader />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full">
              {/* EXISTING CONTENT — DO NOT MODIFY */}
              <div className="px-6 max-w-7xl mx-auto w-full">
                <div className={s.sectionHeader}>
                  <span className={s.sectionLabel}>Why EYEKON?</span>
                  <h2 className={s.sectionTitle}>Smart, Fast, and Personalized</h2>
                  <p className={s.sectionDesc}>
                    EYEKON is your comprehensive travel companion. Experience a clean,
                    intuitive planner designed to take the stress out of travel preparation.
                  </p>
                </div>

                <div className={s.featuresGrid}>
                  <FeatureCard
                    icon="🗺️"
                    title="Smart Destination Picker"
                    desc="Select your city and get top recommendations instantly."
                  />
                  <FeatureCard
                    icon="🤖"
                    title="AI Generated Itineraries"
                    desc="Get a fully structured day-by-day plan in seconds."
                  />
                  <FeatureCard
                    icon="✏️"
                    title="Customisable Plans"
                    desc="Swap places, adjust times, and personalise every detail."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA ─────────────────────────────────────────── */}
          <section className="relative overflow-hidden w-full min-h-[600px]" id="how">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
              <GalaxyShader />
            </div>

            {/* Content */}
            <div className={`relative z-10 w-full ${s.section}`}>
              <div className={`${s.ctaBanner} bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300`}>
                <h2 className={s.ctaTitle}>
                  Ready to plan your next adventure?
                </h2>
                <p className={s.ctaDesc}>
                  Join travellers who plan smarter. It takes less than
                  two minutes to create your first itinerary.
                </p>
                <Link href={startUrl} className={`${s.primaryBtn} cursor-target`} id="cta-start-btn">
                  🚀 Start Planning Trip
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className={s.footer} style={{ position: "relative", overflow: "hidden" }}>
        {/* Background Animation */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, opacity: 0.5, pointerEvents: "none" }}>
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

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-10 py-4 md:py-6">
          <div className={cn(s.footerContainer, "flex flex-wrap md:flex-nowrap justify-center md:justify-between gap-6 md:gap-12 text-center md:text-left")}>
            <div className={cn(s.footerBrand, "w-full md:w-auto mb-8 md:mb-0")}>
              <span className={cn(s.footerLogo, "tracking-[2px] md:tracking-[6px]")}>EYEKON</span>
              <p className={cn(s.footerDesc, "mx-auto md:mx-0 max-w-sm")}>
                AI-powered travel planning platform that helps you create smart itineraries in seconds.
              </p>
            </div>

            <div className={cn(s.footerLinks, "flex-1 min-w-[150px] mb-8 md:mb-0")}>
              <h4 className={s.footerLinksTitle}>Quick Links</h4>
              <ul className="flex flex-col gap-2 break-words">
                <li><Link href={startUrl} className="cursor-target">Start Planning</Link></li>
                <li><a href="#features" className="cursor-target">Features</a></li>
                <li><a href="#how-it-works" className="cursor-target">How It Works</a></li>
                <li><a href="#cta" className="cursor-target">Get Started</a></li>
              </ul>
            </div>

            <div className={cn(s.footerLinks, "flex-1 min-w-[150px] mb-8 md:mb-0")}>
              <h4 className={s.footerLinksTitle}>Resources</h4>
              <ul className="flex flex-col gap-2 break-words">
                <li><a href="#" className="cursor-target">Help Center</a></li>
                <li><a href="#" className="cursor-target">Documentation</a></li>
                <li><a href="#" className="cursor-target">Privacy Policy</a></li>
                <li><a href="#" className="cursor-target">Terms</a></li>
              </ul>
            </div>

            <div className={cn(s.footerLinks, "flex-1 min-w-[150px]")}>
              <h4 className={s.footerLinksTitle}>Connect</h4>
              <div className={cn(s.socialIcons, "flex justify-center md:justify-start gap-4")}>
                <a href="#" aria-label="Twitter" className="cursor-target">𝕏</a>
                <a href="#" aria-label="Instagram" className="cursor-target">📸</a>
                <a href="#" aria-label="LinkedIn" className="cursor-target">💼</a>
                <a href="#" aria-label="GitHub" className="cursor-target">💻</a>
              </div>
            </div>
          </div>
          <div className={s.footerBottom}>
            <p>© 2026 EYEKON. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Tiny sub-components ──────── */

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
    <div className={`${s.featureCard} bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300 cursor-target`}>
      <div className={s.featureIcon}>{icon}</div>
      <h3 className={s.featureTitle}>{title}</h3>
      <p className={s.featureDesc}>{desc}</p>
    </div>
  );
}
