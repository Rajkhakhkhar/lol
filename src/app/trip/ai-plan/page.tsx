'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, ArrowLeft } from 'lucide-react';
import Grainient from '@/components/Grainient';
import Link from 'next/link';
import type { TripFormData } from '@/types';

/**
 * AIPlanPage - Eyekon
 * This page was previously used for AI optimization.
 * Per user requirements, optimization has been removed and the page now
 * handles safe redirection to the dashboard while preserving trip data.
 */
export default function AIPlanPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<TripFormData | null>(null);

    useEffect(() => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            router.push('/');
            return;
        }

        // Load existing trip data from localStorage
        const raw = localStorage.getItem('tripData');
        if (!raw) {
            router.push('/trip/plan');
            return;
        }

        try {
            const data: TripFormData = JSON.parse(raw);
            setFormData(data);
            
            // Per requirement #4: Automatically navigate to dashboard
            // We give it a tiny delay for the "premium" feel and to ensure state is set if needed
            const timer = setTimeout(() => {
                router.push('/trip/dashboard');
            }, 800);
            
            return () => clearTimeout(timer);
        } catch (err) {
            console.error("Error loading trip data:", err);
            router.push('/trip/plan');
        } finally {
            setLoading(false);
        }
    }, [router]);

    return (
        <main className="flex-1 min-h-screen relative font-sans">
            {/* Background Layer - Preserved as per Requirement #6 */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Grainient
                    color1="#000000"
                    color2="#141414"
                    color3="#1d1d1d"
                    timeSpeed={1}
                    warpStrength={0.5}
                />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <nav className="sticky top-0 z-50 glass">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-[10px] group">
                            <div className="w-8 h-8 rounded-full bg-[#141414] border border-[#2a2a2a] flex items-center justify-center shadow-[0_0_10px_rgba(79, 142, 255,0.15)] hover:border-blue-500 transition-colors overflow-hidden">
                                <img src="/logo.png" alt="Eyekon Logo" className="w-full h-full object-cover filter brightness-0 invert" />
                            </div>
                            <span className="text-[18px] font-bold text-white tracking-[2px]">EYEKON</span>
                        </Link>
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => router.push('/trip/dashboard')}
                                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-white/5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("isLoggedIn");
                                    window.location.href = "/";
                                }}
                                className="text-sm text-white/60 hover:text-white transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="w-full max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="flex flex-col items-center justify-center py-20">
                        {/* Loading Spinner - Preserved as per Requirement #6 */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-6"
                        />
                        <h2 className="text-xl font-bold font-display text-white mb-2">
                            {loading ? "Loading your itinerary..." : "Finalizing your journey..."}
                        </h2>
                        <p className="text-white/40">Preparing your dashboard summary</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
