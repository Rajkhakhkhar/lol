'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PasswordStrength Component
 * 
 * A self-contained, real-time indicator for password complexity.
 * Evaluates length, uppercase, numbers, and special characters.
 * 
 * Logic:
 * - 0-2 criteria met: Weak (Red)
 * - 3 criteria met: Medium (Yellow)
 * - 4 criteria met: Strong (Green)
 */
export default function PasswordStrength({ password }: { password: string }) {
    if (!password) return null;

    const checks = {
        length: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    let strength = 'Weak';
    let colorClass = 'text-red-500';
    let barColor = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
    let width = 'w-1/3';

    if (score === 3) {
        strength = 'Medium';
        colorClass = 'text-orange-500';
        barColor = 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]';
        width = 'w-2/3';
    } else if (score === 4) {
        strength = 'Strong';
        colorClass = 'text-green-500';
        barColor = 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
        width = 'w-full';
    }

    return (
        <div className="mt-3 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-[2px]">
                <span className="text-white/20">Strength Analysis</span>
                <span className={cn("transition-colors duration-300", colorClass)}>
                    {strength}
                </span>
            </div>
            
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                    className={cn(
                        "h-full transition-all duration-700 ease-out rounded-full", 
                        barColor, 
                        width
                    )} 
                />
            </div>
            
            <div className="flex gap-2 flex-wrap">
                {[
                    { label: "8+ Chars", met: checks.length },
                    { label: "Uppercase", met: checks.hasUpper },
                    { label: "Number", met: checks.hasNumber },
                    { label: "Special", met: checks.hasSpecial }
                ].map((item) => (
                    <div 
                        key={item.label}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-bold tracking-wider transition-all duration-500",
                            item.met 
                                ? "bg-white/10 border-white/20 text-white/90" 
                                : "bg-transparent border-white/5 text-white/10"
                        )}
                    >
                        <div className={cn(
                            "w-1 h-1 rounded-full",
                            item.met ? "bg-blue-400 animate-pulse" : "bg-white/10"
                        )} />
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
