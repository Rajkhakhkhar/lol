'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, ProgressSteps, Spinner, Toggle } from '@/components/ui';
import TravelerInfoStep from './TravelerInfoStep';
import TravelLogisticsStep from './TravelLogisticsStep';
import DayPlanStep from './DayPlanStep';
import BudgetStep from './BudgetStep';
import InterestsStep from './InterestsStep';
import ConstraintsStep from './ConstraintsStep';
import type { TripFormData, GeminiItineraryResponse, DayPlanForm } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const INITIAL_STEPS = ['Travelers', 'Trip Setup'];
const FINAL_STEPS = ['Budget', 'Interests', 'Constraints'];

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
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState(1);

    const tripDays = useMemo(() => calculateTripDays(formData.travel_logistics.arrival_datetime, formData.travel_logistics.departure_datetime), [formData.travel_logistics.arrival_datetime, formData.travel_logistics.departure_datetime]);

    const steps = useMemo(() => {
        const daySteps = Array.from({ length: tripDays }, (_, i) => `Day ${i + 1}`);
        return [...INITIAL_STEPS, ...daySteps, ...FINAL_STEPS];
    }, [tripDays]);

    useEffect(() => {
        const s = parseInt(searchParams.get('step') || '', 10);
        if (s >= 1 && s <= steps.length) setStep(s - 1);
    }, [searchParams, steps.length]);

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

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            localStorage.setItem('tripData', JSON.stringify(formData));
            router.push('/trip/dashboard');
        } catch (err: any) {
            setError('Something went wrong saving your trip.');
        } finally {
            setLoading(false);
        }
    };

    const validateStep = (): boolean => {
        const s = step;
        if (s === 0) return formData.traveler_info.adults >= 1;
        if (s === 1) {
            const tl = formData.travel_logistics;
            return !!(tl.destination_country && tl.destination_city && tl.arrival_datetime && tl.departure_datetime && new Date(tl.departure_datetime) > new Date(tl.arrival_datetime));
        }
        
        // Day Plan Validation
        const isDayStep = s >= INITIAL_STEPS.length && s < INITIAL_STEPS.length + tripDays;
        if (isDayStep) {
            const dayIdx = s - INITIAL_STEPS.length;
            const dayPlan = formData.day_plans[dayIdx];
            return !!(dayPlan && (dayPlan.places.length > 0 || dayPlan.nothingPlanned));
        }

        return true;
    };

    const next = () => {
        if (!validateStep()) return;
        if (step < steps.length - 1) {
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

    const isLastStep = step === steps.length - 1;
    
    // Logic for rendering steps based on the new dynamic flow
    const isDayStep = step >= INITIAL_STEPS.length && step < INITIAL_STEPS.length + tripDays;
    const dayIndex = isDayStep ? step - INITIAL_STEPS.length : -1;
    
    // Find index for FINAL_STEPS
    const finalStepRelativeIndex = step - (INITIAL_STEPS.length + tripDays);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProgressSteps steps={steps} currentStep={step} />
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-8 min-h-[460px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        variants={{ 
                            enter: { opacity: 0 }, 
                            center: { opacity: 1 }, 
                            exit: { opacity: 0 } 
                        }}
                        initial="enter" 
                        animate="center" 
                        exit="exit"
                        transition={{ duration: 0.2 }}
                    >
                        {/* INITIAL STEPS */}
                        {step === 0 && <TravelerInfoStep data={formData.traveler_info} onChange={traveler_info => setFormData({ ...formData, traveler_info })} />}
                        {step === 1 && <TravelLogisticsStep data={formData.travel_logistics} onChange={travel_logistics => setFormData({ ...formData, travel_logistics })} accessibilityNeeds={formData.traveler_info.accessibility_needs} />}
                        
                        {/* DYNAMIC DAY STEPS */}
                        {isDayStep && dayIndex !== -1 && (
                            <DayPlanStep
                                data={formData.day_plans[dayIndex]}
                                onChange={updatedDay => setFormData(prev => { 
                                    const next = [...prev.day_plans]; 
                                    next[dayIndex] = updatedDay; 
                                    return { ...prev, day_plans: next }; 
                                })}
                                city={formData.travel_logistics.destination_city}
                                country={formData.travel_logistics.destination_country}
                                sameHotelForAllDays={formData.sameHotelForAllDays}
                                onSameHotelToggle={handleSameHotelToggle}
                                globalHotel={formData.day_plans.length > 0 ? formData.day_plans[0].hotel : ''}
                                onGlobalHotelChange={handleGlobalHotelChange}
                                isFirstDay={dayIndex === 0}
                                isLastDay={dayIndex === tripDays - 1}
                                allDays={formData.day_plans}
                                accessibilityNeeds={formData.traveler_info.accessibility_needs}
                            />
                        )}

                        {/* FINAL PREFERENCE STEPS */}
                        {finalStepRelativeIndex === 0 && <BudgetStep data={formData.budget} onChange={budget => setFormData({ ...formData, budget })} />}
                        {finalStepRelativeIndex === 1 && (
                            <InterestsStep 
                                data={formData.interests} 
                                onChange={interests => setFormData({ ...formData, interests })}
                                city={formData.travel_logistics.destination_city}
                                country={formData.travel_logistics.destination_country}
                                dayPlans={formData.day_plans}
                                onAddToDay={(dayNumber: number, placeName: string) => {
                                    setFormData(prev => {
                                        const newDayPlans = [...prev.day_plans];
                                        const dayIdx = dayNumber - 1;
                                        if (newDayPlans[dayIdx] && !newDayPlans[dayIdx].places.some(p => p.name === placeName)) {
                                            newDayPlans[dayIdx] = {
                                                ...newDayPlans[dayIdx],
                                                places: [...newDayPlans[dayIdx].places, { name: placeName, time: '10:00' }]
                                            };
                                        }
                                        return { ...prev, day_plans: newDayPlans };
                                    });
                                }}
                            />
                        )}
                        {finalStepRelativeIndex === 2 && <ConstraintsStep data={formData.constraints} onChange={constraints => setFormData({ ...formData, constraints })} />}
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
