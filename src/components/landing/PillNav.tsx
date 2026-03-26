'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
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
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how' },
    { label: 'Planner', href: '/trip/plan' },
    { label: isLoggedIn ? 'Dashboard' : 'Login', href: isLoggedIn ? '/trip/dashboard' : '/login' },
  ];

  const showAnchorLinks = pathname === '/';
  const visibleNavItems = navItems.filter((item) => showAnchorLinks || !item.href.startsWith('#'));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className={cn(s.pillNavContainer, 'w-full')}>
      <div className="app-shell hidden md:block">
        <div className={cn(s.navGlass, 'grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2')}>
          <Logo className="min-w-fit pr-1" />

          <nav
            className={cn(
              'flex min-w-0 items-center gap-0.5',
              showAnchorLinks ? 'justify-center' : 'justify-end'
            )}
          >
            {visibleNavItems.map((item) => (
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
          </nav>

          <div className="flex items-center justify-end gap-2">
            {isLoggedIn ? (
              <button onClick={handleLogout} className={s.navAction}>
                Logout
              </button>
            ) : (
              <Link href="/login" className={s.navAction}>
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="app-shell md:hidden">
        <div className={cn(s.mobileFrame, 'flex items-center justify-between px-3 py-2.5')}>
          <Logo />
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-white"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className={cn(s.mobileDropdown, 'mt-3 flex flex-col p-2')}>
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={s.mobileNavItem}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className={s.mobileNavItem}
                style={{ textAlign: 'left' }}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className={s.mobileNavItem}
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
