"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import s from "./landing.module.css";

const GridScan = dynamic(() => import("@/components/landing/GridScan"), {
  ssr: false,
});

/* ═══════════════════════════════════════════════════════════
   Iconéra — Landing Page
   This file is the ONLY change. Nothing else was modified.
   ═══════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className={`${s.navbar} ${scrolled ? s.navbarScrolled : ""}`}>
        <span className={s.logo}>Iconéra</span>

        <ul className={s.navLinks}>
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#cta">Get Started</a></li>
        </ul>

        <Link href="/trip/plan" className={s.navCta}>
          Start Planning
        </Link>
      </nav>

      {/* ── Hero / Main Section ─────────────────────────── */}
      <section className={s.hero} id="hero">
        {/* GridScan animation background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "600px",
            zIndex: 0,
            pointerEvents: "auto",
          }}
        >
          <GridScan
            sensitivity={0.55}
            lineThickness={1}
            linesColor="#392e4e"
            gridScale={0.1}
            scanColor="#FF9FFC"
            scanOpacity={0.4}
            enablePost
            bloomIntensity={0.6}
            chromaticAberration={0.002}
            noiseIntensity={0.01}
          />
        </div>

        {/* Decorative orbs */}
        <div className={`${s.heroOrb} ${s.heroOrb1}`} />
        <div className={`${s.heroOrb} ${s.heroOrb2}`} />

        <div className={s.heroBadge} style={{ position: "relative", zIndex: 1 }}>✨ AI-Powered Travel Planning</div>

        <h1 className={s.heroTitle} style={{ position: "relative", zIndex: 1 }}>
          Plan Your Dream Trip{" "}
          <span className={s.heroTitleGradient}>In Minutes</span>
        </h1>

        <p className={s.heroSubtitle} style={{ position: "relative", zIndex: 1 }}>
          Iconéra uses AI to create optimised, day-by-day itineraries tailored
          to your preferences — so you spend less time planning and more time
          exploring.
        </p>

        <div className={s.heroActions} style={{ position: "relative", zIndex: 1 }}>
          <Link href="/trip/plan" className={s.primaryBtn} id="hero-start-btn">
            🚀 Start Planning Trip
          </Link>
          <a href="#features" className={s.secondaryBtn}>
            Learn More ↓
          </a>
        </div>

        <div className={s.heroScrollHint} style={{ zIndex: 1 }}>
          <span>Scroll to explore</span>
          <span>↓</span>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className={s.section} id="features">
        <span className={s.sectionLabel}>Features</span>
        <h2 className={s.sectionTitle}>
          Everything you need to plan the perfect getaway
        </h2>
        <p className={s.sectionDesc}>
          From choosing your destination to scheduling every hour of your trip,
          Iconéra handles it all with a clean, step-by-step flow.
        </p>

        <div className={s.featuresGrid}>
          <FeatureCard
            icon="🗺️"
            title="Smart Destination Picker"
            desc="Select your city and country, and let the AI suggest the best places to visit based on real traveller data."
          />
          <FeatureCard
            icon="🤖"
            title="AI-Generated Itineraries"
            desc="Get a fully structured day-by-day plan in seconds — including top attractions, suggested times, and hidden gems."
          />
          <FeatureCard
            icon="📅"
            title="Multi-Day Scheduler"
            desc="Organise each day individually. Add hotels, places, and time slots with an intuitive multi-step form."
          />
          <FeatureCard
            icon="✏️"
            title="Fully Editable Plans"
            desc="AI suggestions are just a starting point. Swap places, adjust times, and personalise every detail to your liking."
          />
          <FeatureCard
            icon="📊"
            title="Trip Dashboard"
            desc="View your entire trip at a glance on a beautiful summary dashboard. Edit any section with one click."
          />
          <FeatureCard
            icon="⚡"
            title="Blazing Fast"
            desc="Built with Next.js and cutting-edge tech for instant page loads and a butter-smooth planning experience."
          />
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className={s.section} id="how-it-works">
        <span className={s.sectionLabel}>How It Works</span>
        <h2 className={s.sectionTitle}>Three simple steps to your itinerary</h2>
        <p className={s.sectionDesc}>
          No more spreadsheet chaos. Just answer a few questions and let AI do
          the heavy lifting.
        </p>

        <div className={s.stepsRow}>
          <StepCard
            num="1"
            title="Enter Your Details"
            desc="Tell us your name, destination, and travel dates. We'll tailor everything from there."
          />
          <StepCard
            num="2"
            title="Get AI Suggestions"
            desc="Our AI analyses thousands of data points to recommend the best places and schedule for your trip."
          />
          <StepCard
            num="3"
            title="Review & Customise"
            desc="Fine-tune your itinerary on the dashboard. Add, remove, or rearrange — you're in full control."
          />
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className={s.section} id="cta">
        <div className={s.ctaBanner}>
          <h2 className={s.ctaTitle}>
            Ready to plan your next adventure?
          </h2>
          <p className={s.ctaDesc}>
            Join travellers who plan smarter with AI. It takes less than
            two minutes to create your first itinerary.
          </p>
          <Link href="/trip/plan" className={s.primaryBtn} id="cta-start-btn">
            🚀 Start Planning Trip
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className={s.footer}>
        <p>
          © {new Date().getFullYear()} Iconéra — AI Powered Travel Planner.
          Built with ❤️ and Next.js.
        </p>
      </footer>
    </>
  );
}

/* ── Tiny sub-components (local to this file only) ──────── */

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
    <div className={s.featureCard}>
      <div className={s.featureIcon}>{icon}</div>
      <h3 className={s.featureTitle}>{title}</h3>
      <p className={s.featureDesc}>{desc}</p>
    </div>
  );
}

function StepCard({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className={s.step}>
      <div className={s.stepNumber}>{num}</div>
      <h3 className={s.stepTitle}>{title}</h3>
      <p className={s.stepDesc}>{desc}</p>
    </div>
  );
}