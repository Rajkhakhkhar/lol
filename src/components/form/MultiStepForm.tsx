'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, ProgressSteps, Spinner } from '@/components/ui';
import TravelerInfoStep from './TravelerInfoStep';
import TravelLogisticsStep from './TravelLogisticsStep';
import DayPlanStep from './DayPlanStep';
import BudgetStep from './BudgetStep';
import InterestsStep from './InterestsStep';
import ConstraintsStep from './ConstraintsStep';
import type { TripFormData, GeminiItineraryResponse, DayPlanForm } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const BASE_STEPS_BEFORE_DAYS = ['Travelers', 'Logistics'];
const BASE_STEPS_AFTER_DAYS = ['Budget', 'Interests', 'Constraints'];

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
    day_plans: [],
    sameHotelForAllDays: true,
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

/** Calculate trip days from arrival/departure datetime strings */
function calculateTripDays(arrival: string, departure: string): number {
    if (!arrival || !departure) return 0;
    const start = new Date(arrival);
    const end = new Date(departure);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/** Generate day plan forms from date range */
function generateDayPlans(arrival: string, departure: string, existingPlans: DayPlanForm[], globalHotel: string, sameHotel: boolean): DayPlanForm[] {
    const numDays = calculateTripDays(arrival, departure);
    if (numDays <= 0) return [];

    const startDate = new Date(arrival);
    const plans: DayPlanForm[] = [];

    for (let i = 0; i < numDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        // Reuse existing plan if available for this day number
        const existing = existingPlans.find(p => p.dayNumber === i + 1);

        plans.push({
            date: dateStr,
            dayNumber: i + 1,
            hotel: existing?.hotel || (sameHotel ? globalHotel : ''),
            places: existing?.places || [],
        });
    }

    return plans;
}

export default function MultiStepForm({ onComplete }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';

    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<TripFormData>(DEFAULT_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState(1);
    const autofillTriggeredRef = useRef(false);

    // Calculate trip days dynamically
    const tripDays = useMemo(
        () => calculateTripDays(
            formData.travel_logistics.arrival_datetime,
            formData.travel_logistics.departure_datetime
        ),
        [formData.travel_logistics.arrival_datetime, formData.travel_logistics.departure_datetime]
    );

    // Build dynamic step labels
    const STEPS = useMemo(() => {
        const daySteps = Array.from({ length: tripDays }, (_, i) => `Day ${i + 1}`);
        return [...BASE_STEPS_BEFORE_DAYS, ...daySteps, ...BASE_STEPS_AFTER_DAYS];
    }, [tripDays]);

    // Set initial step from URL params
    useEffect(() => {
        const s = parseInt(searchParams.get('step') || '', 10);
        if (s >= 1 && s <= STEPS.length) {
            setStep(s - 1);
        }
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    // Load existing trip data from localStorage when in edit mode
    useEffect(() => {
        if (isEditMode) {
            try {
                const raw = localStorage.getItem('tripData');
                if (raw) {
                    const parsed: TripFormData = JSON.parse(raw);
                    // Ensure new fields have defaults
                    if (!parsed.day_plans) parsed.day_plans = [];
                    if (parsed.sameHotelForAllDays === undefined) parsed.sameHotelForAllDays = true;
                    setFormData(parsed);
                }
            } catch {
                // ignore malformed data
            }
        }
    }, [isEditMode]);

    // Regenerate day plans when dates change
    useEffect(() => {
        const { arrival_datetime, departure_datetime } = formData.travel_logistics;
        const newDays = calculateTripDays(arrival_datetime, departure_datetime);

        if (newDays > 0 && newDays !== formData.day_plans.length) {
            const globalHotel = formData.sameHotelForAllDays && formData.day_plans.length > 0
                ? formData.day_plans[0].hotel
                : formData.travel_logistics.hotel_location || '';

            const newPlans = generateDayPlans(
                arrival_datetime,
                departure_datetime,
                formData.day_plans,
                globalHotel,
                formData.sameHotelForAllDays
            );
            setFormData(prev => ({ ...prev, day_plans: newPlans }));
        }
    }, [formData.travel_logistics.arrival_datetime, formData.travel_logistics.departure_datetime]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── AI Auto-fill: fetch AI itinerary and pre-populate day schedules ──
    const autoFillSuggestions = useCallback(async () => {
        if (autofillTriggeredRef.current) return;
        const { destination_city, destination_country, arrival_datetime, departure_datetime } = formData.travel_logistics;
        if (!destination_city || tripDays <= 0) return;

        // Don't trigger until day plans have been generated
        if (formData.day_plans.length === 0) return;

        // Only auto-fill if all day plans are currently empty
        const allEmpty = formData.day_plans.every(dp => dp.places.length === 0);
        if (!allEmpty) {
            autofillTriggeredRef.current = true;
            return;
        }

        autofillTriggeredRef.current = true;

        try {
            const res = await fetch('/api/itinerary/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city: destination_city,
                    country: destination_country,
                    days: tripDays,
                }),
            });
            if (!res.ok) return;

            const data = await res.json();
            const itinerary: Array<{ day: number; places: Array<{ name: string; time: string }> }> =
                Array.isArray(data.itinerary) ? data.itinerary : [];
            if (itinerary.length === 0) return;

            // Distribute AI-generated places into day_plans using functional updater
            // to get the latest state (avoids race with generateDayPlans effect)
            setFormData(prev => {
                // If day_plans are still empty at apply-time, generate them first
                let plans = prev.day_plans;
                if (plans.length === 0 && arrival_datetime && departure_datetime) {
                    const globalHotel = prev.travel_logistics.hotel_location || '';
                    plans = generateDayPlans(
                        arrival_datetime,
                        departure_datetime,
                        [],
                        globalHotel,
                        prev.sameHotelForAllDays
                    );
                }

                const updatedPlans = plans.map((dp, i) => {
                    // Find the matching day from the AI response
                    const aiDay = itinerary.find(d => d.day === i + 1) || itinerary[i];
                    if (aiDay && Array.isArray(aiDay.places) && aiDay.places.length > 0 && dp.places.length === 0) {
                        return {
                            ...dp,
                            places: aiDay.places
                                .filter(p => p && typeof p.name === 'string' && p.name.trim())
                                .map(p => ({
                                    name: p.name.trim(),
                                    time: typeof p.time === 'string' && /^\d{2}:\d{2}$/.test(p.time) ? p.time : '10:00',
                                })),
                        };
                    }
                    return dp;
                });
                return { ...prev, day_plans: updatedPlans };
            });
        } catch {
            // Silently fail — user can still add places manually
        }
    }, [formData.travel_logistics.destination_city, formData.travel_logistics.destination_country, formData.travel_logistics.arrival_datetime, formData.travel_logistics.departure_datetime, formData.day_plans, tripDays]);

    // Trigger auto-fill when entering the first Day step
    useEffect(() => {
        const { type: stepType, dayIndex } = getStepType(step);
        if (stepType === 'day' && dayIndex === 0) {
            autoFillSuggestions();
        }
    }, [step, autoFillSuggestions]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Map step index to logical step type
    const getStepType = (s: number): { type: 'traveler' | 'logistics' | 'day' | 'budget' | 'interests' | 'constraints'; dayIndex?: number } => {
        if (s === 0) return { type: 'traveler' };
        if (s === 1) return { type: 'logistics' };
        // Day steps: indices 2 through (2 + tripDays - 1)
        if (tripDays > 0 && s >= 2 && s < 2 + tripDays) {
            return { type: 'day', dayIndex: s - 2 };
        }
        // After-day steps offset
        const afterDayStart = 2 + tripDays;
        if (s === afterDayStart) return { type: 'budget' };
        if (s === afterDayStart + 1) return { type: 'interests' };
        if (s === afterDayStart + 2) return { type: 'constraints' };
        return { type: 'constraints' }; // fallback
    };

    const validateStep = (): boolean => {
        const { type, dayIndex } = getStepType(step);
        switch (type) {
            case 'traveler': return formData.traveler_info.adults >= 1;
            case 'logistics': {
                const tl = formData.travel_logistics;
                if (!tl.destination_city || !tl.arrival_datetime || !tl.departure_datetime) return false;
                // Validate end date is not before start date
                const start = new Date(tl.arrival_datetime);
                const end = new Date(tl.departure_datetime);
                if (end <= start) return false;
                return true;
            }
            case 'day': return true; // Day plans are optional (places can be empty)
            case 'budget': return formData.budget.total_budget > 0;
            case 'interests': return formData.interests.interests.length > 0;
            case 'constraints': return true;
            default: return true;
        }
    };

    // Date validation error message
    const dateError = useMemo(() => {
        const { arrival_datetime, departure_datetime } = formData.travel_logistics;
        if (arrival_datetime && departure_datetime) {
            const start = new Date(arrival_datetime);
            const end = new Date(departure_datetime);
            if (end <= start) {
                return 'Departure date must be after arrival date.';
            }
        }
        return null;
    }, [formData.travel_logistics.arrival_datetime, formData.travel_logistics.departure_datetime]);

    // Global hotel handling for "same hotel for all days"
    const globalHotel = formData.day_plans.length > 0 ? formData.day_plans[0].hotel : '';

    const handleSameHotelToggle = (checked: boolean) => {
        setFormData(prev => {
            const updated = { ...prev, sameHotelForAllDays: checked };
            if (checked && prev.day_plans.length > 0) {
                // Apply first day's hotel to all
                const hotel = prev.day_plans[0].hotel;
                updated.day_plans = prev.day_plans.map(dp => ({ ...dp, hotel }));
            }
            return updated;
        });
    };

    const handleGlobalHotelChange = (hotel: string) => {
        setFormData(prev => ({
            ...prev,
            day_plans: prev.day_plans.map(dp => ({ ...dp, hotel })),
        }));
    };

    const handleDayPlanChange = (dayIndex: number, dayPlan: DayPlanForm) => {
        setFormData(prev => {
            const updated = [...prev.day_plans];
            updated[dayIndex] = dayPlan;

            // If same hotel mode and hotel changed, apply to all
            if (prev.sameHotelForAllDays && dayPlan.hotel !== prev.day_plans[dayIndex]?.hotel) {
                return {
                    ...prev,
                    day_plans: updated.map(dp => ({ ...dp, hotel: dayPlan.hotel })),
                };
            }

            return { ...prev, day_plans: updated };
        });
    };

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
    };

    const { type: currentStepType, dayIndex: currentDayIndex } = getStepType(step);

    return (
        <div className="w-full max-w-3xl mx-auto">
            <ProgressSteps steps={STEPS} currentStep={step} />

            <div className="relative overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] backdrop-blur-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] p-6 sm:p-8 min-h-[460px]">
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
                        {currentStepType === 'traveler' && (
                            <TravelerInfoStep
                                data={formData.traveler_info}
                                onChange={traveler_info => setFormData({ ...formData, traveler_info })}
                            />
                        )}
                        {currentStepType === 'logistics' && (
                            <>
                                <TravelLogisticsStep
                                    data={formData.travel_logistics}
                                    onChange={travel_logistics => setFormData({ ...formData, travel_logistics })}
                                />
                                {dateError && (
                                    <div className="mt-3 p-3 rounded-xl bg-[#141414] border border-pink-500/50 text-pink-500 shadow-[0_0_10px_rgba(255, 110, 199,0.1)] text-sm">
                                        {dateError}
                                    </div>
                                )}
                                {tripDays > 0 && !dateError && (
                                    <div className="mt-3 p-3 rounded-xl bg-[#141414] border border-blue-500/50 text-blue-500 shadow-[0_0_10px_rgba(79, 140, 255,0.1)] text-sm">
                                        📅 Trip duration: <strong>{tripDays} day{tripDays > 1 ? 's' : ''}</strong> — {tripDays} daily planning page{tripDays > 1 ? 's' : ''} will be generated.
                                    </div>
                                )}
                            </>
                        )}
                        {currentStepType === 'day' && currentDayIndex !== undefined && formData.day_plans[currentDayIndex] && (
                            <DayPlanStep
                                data={formData.day_plans[currentDayIndex]}
                                onChange={(dayPlan) => handleDayPlanChange(currentDayIndex, dayPlan)}
                                city={formData.travel_logistics.destination_city}
                                country={formData.travel_logistics.destination_country}
                                sameHotelForAllDays={formData.sameHotelForAllDays}
                                onSameHotelToggle={handleSameHotelToggle}
                                globalHotel={globalHotel}
                                onGlobalHotelChange={handleGlobalHotelChange}
                                isFirstDay={currentDayIndex === 0}
                            />
                        )}
                        {currentStepType === 'budget' && (
                            <BudgetStep
                                data={formData.budget}
                                onChange={budget => setFormData({ ...formData, budget })}
                            />
                        )}
                        {currentStepType === 'interests' && (
                            <InterestsStep
                                data={formData.interests}
                                onChange={interests => setFormData({ ...formData, interests })}
                            />
                        )}
                        {currentStepType === 'constraints' && (
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
                <div className="mt-4 p-4 rounded-xl bg-[#141414] border border-pink-500/50 text-pink-500 shadow-[0_0_15px_rgba(255, 110, 199,0.15)] text-sm">
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
