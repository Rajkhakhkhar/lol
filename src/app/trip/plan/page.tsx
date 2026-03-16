'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MultiStepForm from '@/components/form/MultiStepForm';
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay';
import type { GeminiItineraryResponse } from '@/types';
import { Globe, ArrowLeft } from 'lucide-react';
import Grainient from '@/components/Grainient';

export default function PlanTripPage() {
    const [result, setResult] = useState<{
        tripId: string;
        itinerary: GeminiItineraryResponse;
    } | null>(null);

    return (
        <main className="flex-1 min-h-screen relative">
            {/* Background Layer */}
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
                {/* Navigation */}
                <nav className="sticky top-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center shadow-[0_0_10px_rgba(79, 140, 255,0.15)] hover:border-blue-500 transition-colors">
                            <Globe className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <span className="text-lg font-bold text-white">
                            Icon<span className="gradient-text">éra</span>
                        </span>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
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
                                Plan Your Trip ✈️
                            </h1>
                            <p className="text-white/40 max-w-lg mx-auto">
                                Fill in your travel details and let AI craft the perfect itinerary for you
                            </p>
                        </div>

                        <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
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
