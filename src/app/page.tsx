"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import s from "./landing.module.css";
import { GridScan } from "@/components/landing/GridScan";
import ImageTrail from "@/components/landing/ImageTrail";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ scrollBehavior: "smooth" }}>
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className={`${s.navbar} ${scrolled ? s.navbarScrolled : ""}`}>
        <span className={s.logo}>Iconéra</span>

        <ul className={s.navLinks}>
          <li><a href="#how-it-works">Intro</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#cta">Get Started</a></li>
        </ul>

        <Link href="/trip/plan" className={s.navCta}>
          Start Planning
        </Link>
      </nav>

      {/* ── Hero Section ─────────────────────────── */}
      <section className={s.hero} id="hero">
        {/* GridScan animation background */}
        <div style={{ width: "100%", height: "600px", position: "absolute", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }}>
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
          <a href="#how-it-works" className={s.secondaryBtn}>
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
        <div style={{ height: "500px", position: "relative", overflow: "hidden" }}>
          <ImageTrail
            items={[
              'https://picsum.photos/id/287/300/300',
              'https://picsum.photos/id/1001/300/300',
              'https://picsum.photos/id/1025/300/300',
              'https://picsum.photos/id/1026/300/300',
              'https://picsum.photos/id/1027/300/300',
              'https://picsum.photos/id/1028/300/300',
              'https://picsum.photos/id/1029/300/300',
              'https://picsum.photos/id/1030/300/300',
            ]}
            variant={1}
          />
        </div>
      </section>

      {/* ── Introduction / How It Works ─────────────────── */}
      <section className={s.section} id="how-it-works">
        <span className={s.sectionLabel}>Introduction</span>
        <h2 className={s.sectionTitle}>Welcome to Iconéra</h2>
        <p className={s.sectionDesc}>
          Iconéra is your smart travel companion. No more spreadsheet chaos or dozens of open tabs.
          Just answer a few questions and let our AI do the heavy lifting to plan your perfect getaway.
        </p>

        <div className={s.stepsRow}>
          <StepCard
            num="1"
            title="Enter Details"
            desc="Tell us your destination and dates."
          />
          <StepCard
            num="2"
            title="Get Suggestions"
            desc="Our AI builds a custom itinerary for you."
          />
          <StepCard
            num="3"
            title="Review & Go"
            desc="Fine-tune your trip on the dashboard and you are ready!"
          />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className={s.section} id="features">
        <span className={s.sectionLabel}>Features</span>
        <h2 className={s.sectionTitle}>
          Everything you need in one place
        </h2>
        <p className={s.sectionDesc}>
          A clean, intuitive planner designed to take the stress out of travel preparation.
        </p>

        <div className={s.featuresGrid}>
          <FeatureCard
            icon="🗺️"
            title="Smart Destination Picker"
            desc="Select your city and get top recommendations instantly."
          />
          <FeatureCard
            icon="🤖"
            title="AI Itineraries"
            desc="Get a fully structured day-by-day plan in seconds."
          />
          <FeatureCard
            icon="✏️"
            title="Customisable Plans"
            desc="Swap places, adjust times, and personalise every detail."
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
            Join travellers who plan smarter. It takes less than
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
        </p>
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