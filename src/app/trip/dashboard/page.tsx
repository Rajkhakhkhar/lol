'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui';
import type { TripFormData } from '@/types';
import Grainient from '@/components/Grainient';
import { Logo } from '@/components/common/Logo';
import { getSupabaseBrowserClient } from '@/lib/db/supabase';
import { useRequireAuth } from '@/components/auth/AuthProvider';

interface DashboardRow {
    label: string;
    value: string;
    step: number;
    fieldName: string;
}

export default function TripDashboardPage() {
    const router = useRouter();
    const { loading: authLoading } = useRequireAuth();
    const supabase = useMemo(() => getSupabaseBrowserClient(), []);
    const [rows, setRows] = useState<DashboardRow[]>([]);
    const [loaded, setLoaded] = useState(false);

    const getStepForField = (field: string, dayNumber: number | null = null): number | null => {
        const raw = localStorage.getItem('tripData');
        if (!raw) return null;
        try {
            const data: TripFormData = JSON.parse(raw);
            const tripDays = data.day_plans?.length || 0;

            switch (field) {
                case 'travelers':
                    return 1;
                case 'logistics':
                    return 2;
                case 'day_plan':
                    return 2 + (dayNumber || 1);
                case 'budget':
                    return 3 + tripDays;
                case 'interests':
                    return 4 + tripDays;
                case 'constraints':
                    return 5 + tripDays;
                default:
                    return null;
            }
        } catch {
            return null;
        }
    };

    const handleEdit = (step: number | null, fieldName: string) => {
        if (step === null || step === undefined || Number.isNaN(step)) {
            console.error('Invalid step detected for field:', fieldName);
            return;
        }

        router.push(`/trip/plan?step=${step}&edit=true&from=dashboard`);
    };

    useEffect(() => {
        if (authLoading) {
            return;
        }

        try {
            const raw = localStorage.getItem('tripData');
            if (!raw) {
                setLoaded(true);
                return;
            }

            const data: TripFormData = JSON.parse(raw);
            const built: DashboardRow[] = [];

            const ti = data.traveler_info;
            if (ti) {
                const step = getStepForField('travelers');
                if (step) {
                    built.push({ label: 'Adults', value: ti.adults?.toString() ?? 'Not selected', step, fieldName: 'travelers' });
                    built.push({ label: 'Children', value: ti.children?.toString() ?? 'Not selected', step, fieldName: 'travelers' });
                    built.push({ label: 'Travel Type', value: ti.travel_type ? ti.travel_type.charAt(0).toUpperCase() + ti.travel_type.slice(1) : 'Not selected', step, fieldName: 'travelers' });
                    built.push({ label: 'Travel Pace', value: ti.travel_pace ? ti.travel_pace.charAt(0).toUpperCase() + ti.travel_pace.slice(1) : 'Not selected', step, fieldName: 'travelers' });
                    built.push({ label: 'Accessibility Needs', value: ti.accessibility_needs ? 'Enabled - High Priority' : 'Off', step, fieldName: 'travelers' });
                }
            }

            const tl = data.travel_logistics;
            if (tl) {
                const step = getStepForField('logistics');
                if (step) {
                    built.push({ label: 'Country', value: tl.destination_country || 'Not selected', step, fieldName: 'logistics' });
                    built.push({ label: 'City', value: tl.destination_city || 'Not selected', step, fieldName: 'logistics' });
                    built.push({ label: 'Arrival', value: tl.arrival_datetime || 'Not selected', step, fieldName: 'logistics' });
                    built.push({ label: 'Departure', value: tl.departure_datetime || 'Not selected', step, fieldName: 'logistics' });
                    built.push({ label: 'Transport Mode', value: tl.transport_mode ? tl.transport_mode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Not selected', step, fieldName: 'logistics' });
                }
            }

            if (data.day_plans && data.day_plans.length > 0) {
                if (data.sameHotelForAllDays) {
                    const step = getStepForField('day_plan', 1);
                    if (step) {
                        built.push({ label: 'Hotel (all days)', value: data.day_plans[0]?.hotel || 'Not set', step, fieldName: 'day_plan' });
                    }
                }

                data.day_plans.forEach((dayPlan, index) => {
                    const step = getStepForField('day_plan', index + 1);
                    if (!step) return;

                    const dateLabel = dayPlan.date
                        ? new Date(`${dayPlan.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '';

                    if (!data.sameHotelForAllDays) {
                        built.push({ label: `Day ${dayPlan.dayNumber} Hotel`, value: dayPlan.hotel || 'Not set', step, fieldName: 'day_plan' });
                    }

                    built.push({
                        label: `Day ${dayPlan.dayNumber} (${dateLabel})`,
                        value: dayPlan.places.length > 0 ? dayPlan.places.map(p => `${p.name} @ ${p.time}`).join(', ') : 'No places planned',
                        step,
                        fieldName: 'day_plan',
                    });
                });
            }

            const budget = data.budget;
            if (budget) {
                const step = getStepForField('budget');
                if (step) {
                    built.push({ label: 'Total Budget', value: budget.total_budget ? `${budget.total_budget} ${budget.currency || 'USD'}` : 'Not selected', step, fieldName: 'budget' });
                    built.push({ label: 'Daily Budget Cap', value: budget.daily_budget_cap ? `${budget.daily_budget_cap} ${budget.currency || 'USD'}` : 'Not selected', step, fieldName: 'budget' });
                }
            }

            const interests = data.interests;
            if (interests) {
                const step = getStepForField('interests');
                if (step) {
                    built.push({ label: 'Interests', value: interests.interests?.length ? interests.interests.join(', ') : 'Not selected', step, fieldName: 'interests' });
                    built.push({ label: 'Must-Visit Places', value: interests.must_visit_places?.length ? interests.must_visit_places.join(', ') : 'None', step, fieldName: 'interests' });
                    built.push({ label: 'Environment Preference', value: interests.environment_preference ? interests.environment_preference.charAt(0).toUpperCase() + interests.environment_preference.slice(1) : 'Not selected', step, fieldName: 'interests' });
                }
            }

            const constraints = data.constraints;
            if (constraints) {
                const step = getStepForField('constraints');
                if (step) {
                    built.push({ label: 'Max Attractions/Day', value: constraints.max_attractions_per_day?.toString() ?? 'Not selected', step, fieldName: 'constraints' });
                    built.push({ label: 'Daily Rest Hours', value: constraints.daily_rest_hours?.toString() ?? 'Not selected', step, fieldName: 'constraints' });
                    built.push({ label: 'Avoid Crowded', value: constraints.avoid_crowded ? 'Yes' : 'No', step, fieldName: 'constraints' });
                    built.push({ label: 'Fixed Bookings', value: constraints.fixed_bookings?.length ? `${constraints.fixed_bookings.length} booking(s)` : 'None', step, fieldName: 'constraints' });
                }
            }

            setRows(built);
        } catch {
            setRows([]);
        } finally {
            setLoaded(true);
        }
    }, [authLoading]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (authLoading || !loaded) {
        return (
            <main className="flex-1 min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
                            <Link href="/trip/plan" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Planner
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

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="text-center mb-10 px-4">
                        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3">
                            Trip Summary
                        </h1>
                        <p className="text-white/40 max-w-lg mx-auto mb-6 text-sm sm:text-base">
                            Review your selections below. Click the menu button to edit any section.
                        </p>
                    </div>

                    {rows.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-white/40 text-lg">No trip data found.</p>
                            <Link href="/trip/plan" className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f5f5f5] text-sm font-medium hover:bg-[#202020] hover:border-[#3a3a3a] transition-colors">
                                Start Planning
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] overflow-hidden shadow-lg">
                                {rows.map((row, index) => (
                                    <div key={index} className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-4 ${index !== rows.length - 1 ? 'border-b border-[#2a2a2a]' : ''} hover:bg-[#2a2a2a] transition-colors gap-3 sm:gap-4`}>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs sm:text-sm text-[#7a7a7a] block mb-0.5 sm:mb-0">{row.label}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 sm:text-right pr-2 sm:pr-4">
                                            <span className="text-sm sm:text-sm text-white font-medium break-words sm:truncate block">
                                                {row.value}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(row.step, row.fieldName)}
                                            className="self-end sm:self-center flex-shrink-0 p-3 sm:p-2 rounded-lg bg-[#141414] sm:bg-transparent hover:bg-[#141414] border border-[#2a2a2a] sm:border-transparent hover:border-blue-500 hover:shadow-[0_0_10px_rgba(79,140,255,0.15)] text-[#b5b5b5] hover:text-white transition-all cursor-pointer"
                                            aria-label={`Edit ${row.label}`}
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 mb-10 text-center">
                                <Link href="/trip/summary" className="inline-block w-full sm:w-auto">
                                    <Button className="w-full h-[52px] font-bold shadow-lg">
                                        View Full Day-by-Day Summary
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
