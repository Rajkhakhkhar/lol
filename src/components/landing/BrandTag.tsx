'use client';

import React from 'react';
import Link from 'next/link';
import s from './BrandTag.module.css';
import { cn } from '@/lib/utils';

export function BrandTag() {
  return (
    <Link href="#home" className={s.brandTag}>
      <div className={s.brandLogoPlaceholder}>
        <img src="/logo.png" alt="Eyekon Logo" className={cn(s.brandLogo, 'logo-blink')} />
      </div>
      <span className={s.brandText}>EYEKON</span>
    </Link>
  );
}
