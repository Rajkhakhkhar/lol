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
    setIsLoggedIn(localStorage.getItem('isAuthenticated') === 'true');
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

  return (
    <div 
      ref={containerRef}
      className={cn(
        s.pillNavContainer,
        isScrolled && s.scrolled,
        isHidden && s.hiddenNav
      )}
      onMouseEnter={() => {
        // Stop hiding timer if we are hovering the navbar itself
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setIsHidden(false);
      }}
    >
      <nav className={s.pillNav}>
        {/* Animated Background Indicator */}
        <div ref={indicatorRef} className={s.navIndicator} style={{ opacity: 0 }} />
        
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              s.navItem,
              pathname === item.href && s.navItemActive
            )}
            onClick={() => {
              // Ensure its visible for a moment after clicking
              setIsHidden(false);
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
