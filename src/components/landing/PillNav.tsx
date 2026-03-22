'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import s from './PillNav.module.css';

import { Logo } from '@/components/common/Logo';

interface NavItem {
  label: string;
  href: string;
}

export function PillNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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


  return (
    <header className={cn(s.pillNavContainer, "w-full py-4")}>
      
      {/* 1) DESKTOP HEADER (md and above) */}
      <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto px-6">
        
        {/* LEFT - LOGO */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* RIGHT - NAV */}
        <nav className={s.navGlass}>
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
              className={s.navItem}
            >
              Logout
            </button>
          )}
        </nav>

      </div>

      {/* 2) MOBILE HEADER (below md) - Kept separate as requested */}
      <div className="flex md:hidden items-center justify-between w-full px-4">
        {/* LEFT */}
        <div>
          <Logo />
        </div>

        {/* RIGHT */}
        <button 
          className="text-white text-2xl p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMenuOpen && (
        <div className={cn(s.mobileDropdown, "absolute top-full left-4 right-4 mt-2 p-2 flex flex-col")}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={s.mobileNavItem}
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
              className={s.mobileNavItem}
              style={{ textAlign: 'left' }}
            >
              Logout
            </button>
          )}
        </div>
      )}

    </header>
  );
}

