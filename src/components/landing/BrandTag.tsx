'use client';

import { Logo } from '@/components/common/Logo';
import { cn } from '@/lib/utils';
import s from './BrandTag.module.css';

export function BrandTag() {
  return (
    <Logo className={cn(s.brandTag, "fixed top-5 left-5")} size="sm" />
  );
}
