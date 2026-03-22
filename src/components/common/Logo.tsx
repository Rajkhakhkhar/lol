'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string; // Outer container class
  imageContainerClassName?: string; // Logo image container class
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className, imageContainerClassName, size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12 sm:w-16 sm:h-16'
  };

  const textClasses = {
    sm: 'text-[14px] md:text-[16px] tracking-[2px] md:tracking-[6px]',
    md: 'text-[18px] tracking-[2px] md:tracking-[6px]',
    lg: 'text-xl sm:text-3xl tracking-[2px] md:tracking-[6px]'
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div 
        className={cn(
          sizeClasses[size],
          "rounded-full bg-transparent flex items-center justify-center overflow-hidden transition-all",
          imageContainerClassName
        )}
      >
        <img 
          src="/logo.png" 
          alt="Eyekon Logo" 
          className="w-full h-full object-cover filter brightness-0 invert logo-blink" 
        />
      </div>
      {showText && (
        <span className={cn("text-white font-bold uppercase", textClasses[size])}>
          EYEKON
        </span>
      )}
    </Link>
  );
}
