'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MultiStepForm from '@/components/form/MultiStepForm';
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay';
import type { GeminiItineraryResponse } from '@/types';
import { Globe, ArrowLeft } from 'lucide-react';

export default function PlanTripPage() {
    const [result, setResult] = useState<{
        tripId: string;
        itinerary: GeminiItineraryResponse;
    } | null>(null);

    return (
        <main className="flex-1 min-h-screen">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Globe className="w-5 h-5 text-white" />
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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

                        <MultiStepForm onComplete={setResult} />
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
        </main>
    );
}
