'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import MultiStepForm from '@/components/form/MultiStepForm';
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay';
import type { GeminiItineraryResponse } from '@/types';
import Grainient from '@/components/Grainient';
import { PillNav } from '@/components/landing/PillNav';
import { useRequireAuth } from '@/components/auth/AuthProvider';

export default function PlanTripPage() {
    const { loading } = useRequireAuth();
    const [result, setResult] = useState<{
        tripId: string;
        itinerary: GeminiItineraryResponse;
    } | null>(null);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </main>
        );
    }

    return (
        <main className="relative min-h-screen">
            <div className="fixed inset-0 z-0 pointer-events-none">
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

            <div className="relative z-10 flex min-h-screen flex-col">
                <PillNav />

                <section className="app-shell flex-1 pt-28 pb-8 sm:pt-[7.5rem] sm:pb-10">
                    {!result ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="content-shell"
                        >
                            <div className="mx-auto mb-6 flex max-w-4xl flex-col items-center gap-4 text-center sm:mb-8">
                                <div className="space-y-3">
                                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
                                        Planner
                                    </p>
                                    <h1 className="section-title">Plan the trip without the wasted space.</h1>
                                    <p className="section-copy mx-auto max-w-2xl">
                                        Set up the core travel details first, keep the flow clean, and move into the itinerary builder without the cramped card layout.
                                    </p>
                                </div>
                            </div>

                            <Suspense
                                fallback={
                                    <div className="flex justify-center py-20">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
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
                            transition={{ duration: 0.4 }}
                            className="content-shell"
                        >
                            <ItineraryDisplay itinerary={result.itinerary} onReset={() => setResult(null)} />
                        </motion.div>
                    )}
                </section>
            </div>
        </main>
    );
}
