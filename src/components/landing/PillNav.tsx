'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import s from './PillNav.module.css';

interface NavItem {
  label: string;
  href: string;
}

export function PillNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  const navItems: NavItem[] = [
    { label: 'Home', href: '#home' },
    { label: 'How It Works', href: '#how' },
    { label: 'Features', href: '#features' },
    { label: 'Start Project', href: '/trip/plan' },
    { label: isLoggedIn ? 'Dashboard' : 'Login', href: isLoggedIn ? '/trip/dashboard' : '/login' }
  ];

  // ── Scroll & Hide Behavior ──────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 50) {
        setIsScrolled(true);

        // Cancel previous timer to reset hiding logic
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

        // Auto-hide after 1 second if scrolled down
        hideTimerRef.current = setTimeout(() => {
          setIsHidden(true);
        }, 1000);
      } else {
        setIsScrolled(false);
        setIsHidden(false);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // ── Top Edge Detection ──────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Reveal nav if cursor is within top 10px
      if (e.clientY <= 10) {
        setIsHidden(false);
        // Reset timer to keep it visible while mouse is at top
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      } else if (window.scrollY > 50 && !containerRef.current?.contains(e.target as Node)) {
        // If cursor leaves the top area and we are scrolled, we can hide again 
        // after a delay (this ensures user can interact with nav)
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setIsHidden(true);
        }, 1500); 
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ── GSAP Hover Pill Logic ───────────────────────────────
  useGSAP(() => {
    if (!containerRef.current || !indicatorRef.current) return;

    const navItems = containerRef.current.querySelectorAll(`.${s.navItem}`);
    const indicator = indicatorRef.current;

    navItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const bounds = item.getBoundingClientRect();
        const containerBounds = containerRef.current!.querySelector(`.${s.pillNav}`)!.getBoundingClientRect();
        
        const relativeLeft = bounds.left - containerBounds.left;
        
        gsap.to(indicator, {
          x: relativeLeft,
          width: bounds.width,
          duration: 0.4,
          ease: 'power3.out',
          opacity: 1
        });
      });
    });

    const handleMouseLeave = () => {
      gsap.to(indicator, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    };

    containerRef.current.addEventListener('mouseleave', handleMouseLeave);
  }, { scope: containerRef });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div 
      ref={containerRef}
      className={cn(
        s.pillNavContainer,
        isScrolled && s.scrolled,
        isHidden && !isMenuOpen && s.hiddenNav,
        "w-full max-w-full px-4"
      )}
      onMouseEnter={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setIsHidden(false);
      }}
    >
      <nav className={cn(s.pillNav, "flex items-center justify-between w-full px-4 md:px-0")}>
        {/* Logo (left) */}
        <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover filter brightness-0 invert" />
            </div>
            <span className="text-white font-bold tracking-[2px] md:tracking-[6px] text-sm md:text-base uppercase">EYEKON</span>
        </Link>

        {/* Animated Background Indicator (Desktop only) */}
        <div ref={indicatorRef} className={cn(s.navIndicator, "hidden md:block")} style={{ opacity: 0 }} />
        
        {/* Menu Items (hidden on mobile, flex on desktop) */}
        <div className={cn("hidden md:flex items-center gap-1")}>
            {navItems.map((item) => (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                s.navItem,
                pathname === item.href && s.navItemActive
                )}
            >
                {item.label}
            </Link>
            ))}

            {isLoggedIn && (
            <button
                onClick={() => {
                localStorage.removeItem("isLoggedIn");
                window.location.href = "/";
                }}
                className={cn(s.navItem, "text-sm text-white/60 hover:text-white transition cursor-target px-4")}
            >
                Logout
            </button>
            )}
        </div>

        {/* Hamburger Menu (Mobile only) */}
        <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
            <div className="w-6 h-5 flex flex-col justify-between">
                <span className={cn("w-full h-0.5 bg-white transition-all", isMenuOpen && "rotate-45 translate-y-2")} />
                <span className={cn("w-full h-0.5 bg-white transition-all", isMenuOpen && "opacity-0")} />
                <span className={cn("w-full h-0.5 bg-white transition-all", isMenuOpen && "-rotate-45 -translate-y-2")} />
            </div>
        </button>
        
        {/* Mobile Dropdown */}
        {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-2xl md:hidden z-[2000] flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="text-white text-lg font-medium px-4 py-3 hover:bg-white/5 rounded-xl transition-all"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {item.label}
                    </Link>
                ))}
                {isLoggedIn && (
                    <button
                        onClick={() => {
                            localStorage.removeItem("isLoggedIn");
                            window.location.href = "/";
                        }}
                        className="text-white text-lg font-medium px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-left"
                    >
                        Logout
                    </button>
                )}
            </div>
        )}
      </nav>
    </div>
  );
}
