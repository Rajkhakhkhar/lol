'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Grainient from '@/components/Grainient';
import type { TripFormData } from '@/types';
import { Logo } from '@/components/common/Logo';
import { useRequireAuth } from '@/components/auth/AuthProvider';
import { getSupabaseBrowserClient } from '@/lib/db/supabase';

export default function AIPlanPage() {
    const router = useRouter();
    const { loading: authLoading } = useRequireAuth();
    const supabase = useMemo(() => getSupabaseBrowserClient(), []);
    const [loading, setLoading] = useState(true);
    const [, setFormData] = useState<TripFormData | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        const raw = localStorage.getItem('tripData');
        if (!raw) {
            router.push('/trip/plan');
            return;
        }

        try {
            const data: TripFormData = JSON.parse(raw);
            setFormData(data);

            const timer = setTimeout(() => {
                router.push('/trip/dashboard');
            }, 800);

            return () => clearTimeout(timer);
        } catch (err) {
            console.error('Error loading trip data:', err);
            router.push('/trip/plan');
        } finally {
            setLoading(false);
        }
    }, [authLoading, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <main className="flex-1 min-h-screen relative font-sans">
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[72px] h-auto py-3 flex items-center justify-between">
                        <Logo size="sm" />
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => router.push('/trip/dashboard')}
                                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-white/5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-white/60 hover:text-white transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="w-full max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="flex flex-col items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-6"
                        />
                        <h2 className="text-xl font-bold font-display text-white mb-2">
                            {loading ? 'Loading your itinerary...' : 'Finalizing your journey...'}
                        </h2>
                        <p className="text-white/40">Preparing your dashboard summary</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
