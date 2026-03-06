'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, ProgressSteps, Spinner } from '@/components/ui';
import TravelerInfoStep from './TravelerInfoStep';
import TravelLogisticsStep from './TravelLogisticsStep';
import BudgetStep from './BudgetStep';
import InterestsStep from './InterestsStep';
import ConstraintsStep from './ConstraintsStep';
import type { TripFormData, GeminiItineraryResponse } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const STEPS = ['Travelers', 'Logistics', 'Budget', 'Interests', 'Constraints'];

const DEFAULT_FORM: TripFormData = {
    traveler_info: {
        adults: 2,
        children: 0,
        children_ages: [],
        travel_type: 'couple',
        travel_pace: 'moderate',
        accessibility_needs: false,
    },
    travel_logistics: {
        destination_country: '',
        destination_city: '',
        arrival_datetime: '',
        departure_datetime: '',
        hotel_location: '',
        hotel_checkin_time: '14:00',
        hotel_checkout_time: '11:00',
        transport_mode: 'mixed',
    },
    budget: {
        total_budget: 2000,
        currency: 'USD',
        daily_budget_cap: 300,
    },
    interests: {
        interests: [],
        must_visit_places: [],
        environment_preference: 'mixed',
        time_preference: 'flexible',
    },
    constraints: {
        max_attractions_per_day: 5,
        daily_rest_hours: 2,
        avoid_crowded: false,
        fixed_bookings: [],
    },
};

interface Props {
    onComplete: (data: { tripId: string; itinerary: GeminiItineraryResponse }) => void;
}

export default function MultiStepForm({ onComplete }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';
    const initialStep = (() => {
        const s = parseInt(searchParams.get('step') || '', 10);
        return s >= 1 && s <= STEPS.length ? s - 1 : 0;
    })();

    const [step, setStep] = useState(initialStep);
    const [formData, setFormData] = useState<TripFormData>(DEFAULT_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState(1);

    // Load existing trip data from localStorage when in edit mode
    useEffect(() => {
        if (isEditMode) {
            try {
                const raw = localStorage.getItem('tripData');
                if (raw) {
                    const parsed: TripFormData = JSON.parse(raw);
                    setFormData(parsed);
                }
            } catch {
                // ignore malformed data
            }
        }
    }, [isEditMode]);

    const next = () => {
        // In edit mode, save changes and redirect back to dashboard
        if (isEditMode) {
            localStorage.setItem('tripData', JSON.stringify(formData));
            router.push('/trip/dashboard');
            return;
        }
        if (step < STEPS.length - 1) {
            setDirection(1);
            setStep(s => s + 1);
        }
    };

    const prev = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(s => s - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            // ── City-country validation ──────────────────────
            const { destination_city, destination_country } = formData.travel_logistics;
            if (destination_city && destination_country) {
                const valRes = await fetch('/api/cities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ city: destination_city, country: destination_country }),
                });
                if (!valRes.ok) {
                    throw new Error('City validation service unavailable');
                }
                const valData = await valRes.json();
                if (!valData.valid) {
                    setError('Selected city does not belong to selected country.');
                    setLoading(false);
                    return;
                }
            }
            const res = await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formData }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorMsg = 'Failed to generate itinerary';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMsg = errorJson.error || errorMsg;
                } catch {
                    // response was not JSON (likely HTML error page)
                }
                throw new Error(errorMsg);
            }

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to generate itinerary');
            }

            onComplete(result.data);

            // Save trip data to localStorage and redirect to dashboard
            localStorage.setItem('tripData', JSON.stringify(formData));
            router.push('/trip/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const isLastStep = step === STEPS.length - 1;

    const validateStep = (): boolean => {
        switch (step) {
            case 0: return formData.traveler_info.adults >= 1;
            case 1: return !!(formData.travel_logistics.destination_city && formData.travel_logistics.arrival_datetime && formData.travel_logistics.departure_datetime);
            case 2: return formData.budget.total_budget > 0;
            case 3: return formData.interests.interests.length > 0;
            case 4: return true;
            default: return true;
        }
    };

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <ProgressSteps steps={STEPS} currentStep={step} />

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 min-h-[460px]">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {step === 0 && (
                            <TravelerInfoStep
                                data={formData.traveler_info}
                                onChange={traveler_info => setFormData({ ...formData, traveler_info })}
                            />
                        )}
                        {step === 1 && (
                            <TravelLogisticsStep
                                data={formData.travel_logistics}
                                onChange={travel_logistics => setFormData({ ...formData, travel_logistics })}
                            />
                        )}
                        {step === 2 && (
                            <BudgetStep
                                data={formData.budget}
                                onChange={budget => setFormData({ ...formData, budget })}
                            />
                        )}
                        {step === 3 && (
                            <InterestsStep
                                data={formData.interests}
                                onChange={interests => setFormData({ ...formData, interests })}
                            />
                        )}
                        {step === 4 && (
                            <ConstraintsStep
                                data={formData.constraints}
                                onChange={constraints => setFormData({ ...formData, constraints })}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Error */}
            {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 gap-4">
                <Button
                    variant="outline"
                    onClick={prev}
                    disabled={step === 0 || loading}
                    className={step === 0 ? 'invisible' : ''}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </Button>

                {isLastStep && !isEditMode ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !validateStep()}
                        className="min-w-[200px]"
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Generate Itinerary
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={next}
                        disabled={!validateStep()}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
