'use client';

import { Suspense, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MultiStepForm from '@/components/form/MultiStepForm';
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay';
import type { GeminiItineraryResponse } from '@/types';
import Grainient from '@/components/Grainient';
import { Logo } from '@/components/common/Logo';
import { useRequireAuth } from '@/components/auth/AuthProvider';
import { getSupabaseBrowserClient } from '@/lib/db/supabase';

export default function PlanTripPage() {
    const { loading } = useRequireAuth();
    const supabase = useMemo(() => getSupabaseBrowserClient(), []);
    const [result, setResult] = useState<{
        tripId: string;
        itinerary: GeminiItineraryResponse;
    } | null>(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </main>
        );
    }

    return (
        <main className="flex-1 min-h-screen relative">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Grainient
                    color1="#000000"
                    color2="#8b0f1f"
                    color3="#d11a35"
                    timeSpeed={1.7}
                    colorBalance={-0.02}
                    warpStrength={1}
                    warpFrequency={5}
                    warpSpeed={2}
                    warpAmplitude={50}
                    blendAngle={0}
                    blendSoftness={0.05}
                    rotationAmount={500}
                    noiseScale={2}
                    grainAmount={0.1}
                    grainScale={2}
                    grainAnimated={false}
                    contrast={1.5}
                    gamma={1}
                    saturation={1}
                    centerX={0}
                    centerY={0}
                    zoom={0.9}
                />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <nav className="sticky top-0 z-50 glass">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[72px] h-auto py-3 flex items-center justify-between">
                        <Logo size="sm" />
                        <div className="flex items-center gap-6">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Link>
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
                    {!result ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-center mb-10">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                                    Plan Your Trip
                                </h1>
                                <p className="text-white/40 max-w-lg mx-auto">
                                    Fill in your travel details and let AI craft the perfect itinerary for you
                                </p>
                            </div>

                            <Suspense
                                fallback={
                                    <div className="flex justify-center py-20">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                }
                            >
                                <MultiStepForm onComplete={setResult} />
                            </Suspense>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ItineraryDisplay
                                itinerary={result.itinerary}
                                onReset={() => setResult(null)}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
