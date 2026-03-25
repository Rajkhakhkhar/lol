'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import s from './PillNav.module.css';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupabaseBrowserClient } from '@/lib/db/supabase';

interface NavItem {
  label: string;
  href: string;
}

export function PillNav() {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = Boolean(user);

  const navItems: NavItem[] = [
    { label: 'Home', href: '#home' },
    { label: 'How It Works', href: '#how' },
    { label: 'Features', href: '#features' },
    { label: 'Start Project', href: '/trip/plan' },
    { label: isLoggedIn ? 'Dashboard' : 'Login', href: isLoggedIn ? '/trip/dashboard' : '/login' }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className={cn(s.pillNavContainer, "w-full py-4")}>
      <div className="hidden md:flex items-center w-full px-6 relative">
        <div className="flex items-center z-10">
          <Logo />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
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
                onClick={handleLogout}
                className={s.navItem}
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>

      <div className="flex md:hidden items-center justify-between w-full px-4">
        <div>
          <Logo />
        </div>

        <button
          className="text-white text-2xl p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? 'X' : '☰'}
        </button>
      </div>

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
              onClick={handleLogout}
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
