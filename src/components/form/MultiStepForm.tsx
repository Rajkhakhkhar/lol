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
    traveler_info: { adults: 2, children: 0, children_ages: [], travel_type: 'couple', travel_pace: 'moderate', accessibility_needs: false },
    travel_logistics: { destination_country: '', destination_city: '', arrival_datetime: '', departure_datetime: '', hotel_location: '', hotel_checkin_time: '14:00', hotel_checkout_time: '11:00', transport_mode: 'mixed' },
    day_plans: [],
    sameHotelForAllDays: true,
    budget: { total_budget: 2000, currency: 'USD', daily_budget_cap: 300 },
    interests: { interests: [], must_visit_places: [], environment_preference: 'mixed', time_preference: 'flexible' },
    constraints: { max_attractions_per_day: 5, daily_rest_hours: 2, avoid_crowded: false, fixed_bookings: [] },
};

function calculateTripDays(arrival: string, departure: string): number {
    if (!arrival || !departure) return 0;
    const start = new Date(arrival);
    const end = new Date(departure);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function generateDayPlans(arrival: string, departure: string, existingPlans: DayPlanForm[], globalHotel: string, sameHotel: boolean): DayPlanForm[] {
    const numDays = calculateTripDays(arrival, departure);
    if (numDays <= 0) return [];
    const startDate = new Date(arrival);
    const plans: DayPlanForm[] = [];
    for (let i = 0; i < numDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
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

export default function MultiStepForm({ onComplete }: { onComplete: (data: { tripId: string; itinerary: GeminiItineraryResponse }) => void }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<TripFormData>(DEFAULT_FORM);
    const [loading, setLoading] = useState(false);
    const [callingAI, setCallingAI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState(1);
    const autofillTriggeredRef = useRef(false);

    const tripDays = useMemo(() => calculateTripDays(formData.travel_logistics.arrival_datetime, formData.travel_logistics.departure_datetime), [formData.travel_logistics]);
    const STEPS = useMemo(() => [...BASE_STEPS_BEFORE_DAYS, ...Array.from({ length: tripDays }, (_, i) => `Day ${i + 1}`), ...BASE_STEPS_AFTER_DAYS], [tripDays]);

    useEffect(() => {
        const s = parseInt(searchParams.get('step') || '', 10);
        if (s >= 1 && s <= STEPS.length) setStep(s - 1);
    }, [searchParams, STEPS]);

    useEffect(() => {
        if (isEditMode) {
            const raw = localStorage.getItem('tripData');
            if (raw) setFormData(JSON.parse(raw));
        }
    }, [isEditMode]);

    useEffect(() => {
        const { arrival_datetime, departure_datetime } = formData.travel_logistics;
        const newDays = calculateTripDays(arrival_datetime, departure_datetime);
        if (newDays > 0 && newDays !== formData.day_plans.length) {
            const globalHotel = formData.sameHotelForAllDays && formData.day_plans.length > 0 ? formData.day_plans[0].hotel : formData.travel_logistics.hotel_location || '';
            const newPlans = generateDayPlans(arrival_datetime, departure_datetime, formData.day_plans, globalHotel, formData.sameHotelForAllDays);
            setFormData(prev => ({ ...prev, day_plans: newPlans }));
        }
    }, [formData.travel_logistics.arrival_datetime, formData.travel_logistics.departure_datetime]);

    const autoFillSuggestions = useCallback(async () => {
        if (autofillTriggeredRef.current || callingAI) return;
        const { destination_city, destination_country } = formData.travel_logistics;
        if (!destination_city || tripDays <= 0 || formData.day_plans.length === 0) return;
        if (!formData.day_plans.every(dp => dp.places.length === 0)) {
            autofillTriggeredRef.current = true;
            return;
        }

        autofillTriggeredRef.current = true;
        setCallingAI(true);
        setLoading(true);

        try {
            const prompt = `Create a travel itinerary for ${destination_city}, ${destination_country} for ${tripDays} days. Suggest 3-4 places per day with HH:MM times. Return ONLY JSON array: [ { "day": number, "places": [ { "name": "string", "time": "HH:MM" } ] } ]`;
            const res = await fetch('/api/itinerary/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const payload = await res.json();
            if (payload.error) throw new Error(payload.error);

            const jsonMatch = (payload.result || "").match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("Invalid AI response");
            const itinerary = JSON.parse(jsonMatch[0]);

            setFormData(prev => ({
                ...prev,
                day_plans: prev.day_plans.map((dp, i) => ({ ...dp, places: itinerary[i]?.places || [] }))
            }));
        } catch (err: any) {
            console.error("Autofill Error:", err);
        } finally {
            setLoading(false);
            setCallingAI(false);
        }
    }, [formData, tripDays, callingAI]);

    useEffect(() => {
        if (step > 1 && step < 2 + tripDays) autoFillSuggestions();
    }, [step, tripDays, autoFillSuggestions]);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            // Requirement #7: Display dashboard immediately after completion without any AI calls
            localStorage.setItem('tripData', JSON.stringify(formData));
            router.push('/trip/dashboard');
        } catch (err: any) {
            setError('Something went wrong saving your trip.');
        } finally {
            setLoading(false);
        }
    };

    const next = () => {
        if (!validateStep()) return;
        if (step < STEPS.length - 1) {
            setDirection(1);
            setStep(s => s + 1);
        } else {
            handleSubmit();
        }
    };

    const prev = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(s => s - 1);
        }
    };

    const validateStep = (): boolean => {
        const s = step;
        if (s === 0) return formData.traveler_info.adults >= 1;
        if (s === 1) {
            const tl = formData.travel_logistics;
            return !!(tl.destination_country && tl.destination_city && tl.arrival_datetime && tl.departure_datetime && new Date(tl.departure_datetime) > new Date(tl.arrival_datetime));
        }
        return true;
    };

    const handleSameHotelToggle = (checked: boolean) => {
        setFormData(prev => {
            const updated = { ...prev, sameHotelForAllDays: checked };
            if (checked && prev.day_plans.length > 0) {
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

    const isLastStep = step === STEPS.length - 1;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProgressSteps steps={STEPS} currentStep={step} />
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-8 min-h-[460px]">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={{ enter: d => ({ x: d > 0 ? 300 : -300, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: d => ({ x: d > 0 ? -300 : 300, opacity: 0 }) }}
                        initial="enter" animate="center" exit="exit"
                    >
                        {step === 0 && <TravelerInfoStep data={formData.traveler_info} onChange={traveler_info => setFormData({ ...formData, traveler_info })} />}
                        {step === 1 && <TravelLogisticsStep data={formData.travel_logistics} onChange={travel_logistics => setFormData({ ...formData, travel_logistics })} />}
                        {step >= 2 && step < 2 + tripDays && formData.day_plans[step - 2] && (
                            <DayPlanStep
                                data={formData.day_plans[step - 2]}
                                onChange={dp => setFormData(prev => { 
                                    const next = [...prev.day_plans]; 
                                    next[step - 2] = dp; 
                                    return { ...prev, day_plans: next }; 
                                })}
                                city={formData.travel_logistics.destination_city}
                                country={formData.travel_logistics.destination_country}
                                sameHotelForAllDays={formData.sameHotelForAllDays}
                                onSameHotelToggle={handleSameHotelToggle}
                                globalHotel={formData.day_plans.length > 0 ? formData.day_plans[0].hotel : ''}
                                onGlobalHotelChange={handleGlobalHotelChange}
                                isFirstDay={step === 2}
                            />
                        )}
                        {step === 2 + tripDays && <BudgetStep data={formData.budget} onChange={budget => setFormData({ ...formData, budget })} />}
                        {step === 3 + tripDays && <InterestsStep data={formData.interests} onChange={interests => setFormData({ ...formData, interests })} />}
                        {step === 4 + tripDays && <ConstraintsStep data={formData.constraints} onChange={constraints => setFormData({ ...formData, constraints })} />}
                    </motion.div>
                </AnimatePresence>
            </div>
            {error && <div className="mt-4 p-4 rounded-xl bg-black border border-pink-500/50 text-pink-500 text-sm">{error}</div>}
            <div className="flex items-center justify-between mt-6">
                <Button variant="outline" onClick={prev} disabled={step === 0 || loading} className={step === 0 ? 'invisible' : ''}>
                    <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={next} disabled={loading || !validateStep()}>
                    {loading ? <Spinner size="sm" /> : (isLastStep ? 'Generate Itinerary' : 'Next')}
                    {!loading && !isLastStep && <ChevronRight className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    );
}
