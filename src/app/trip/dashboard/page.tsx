'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui';
import type { TripFormData } from '@/types';
import Grainient from '@/components/Grainient';
import { PillNav } from '@/components/landing/PillNav';
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
    const [rows, setRows] = useState<DashboardRow[]>([]);
    const [loaded, setLoaded] = useState(false);

    const getStepForField = (field: string, dayNumber: number | null = null): number | null => {
        const raw = localStorage.getItem('tripData');
        if (!raw) return null;
        try {
            const data: TripFormData = JSON.parse(raw);
            const tripDays = data.day_plans?.length || 0;

            switch (field) {
                case 'travelers': return 1;
                case 'logistics': return 2;
                case 'day_plan': return 2 + (dayNumber || 1);
                case 'budget': return 3 + tripDays;
                case 'interests': return 4 + tripDays;
                case 'constraints': return 5 + tripDays;
                default: return null;
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
        if (authLoading) return;

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
                    built.push({ label: 'Accessibility', value: ti.accessibility_needs ? 'Enabled' : 'Off', step, fieldName: 'travelers' });
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
                    built.push({ label: 'Transport', value: tl.transport_mode ? tl.transport_mode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Not selected', step, fieldName: 'logistics' });
                }
            }

            if (data.day_plans?.length) {
                if (data.sameHotelForAllDays) {
                    const step = getStepForField('day_plan', 1);
                    if (step) built.push({ label: 'Hotel', value: data.day_plans[0]?.hotel || 'Not set', step, fieldName: 'day_plan' });
                }

                data.day_plans.forEach((dayPlan, index) => {
                    const step = getStepForField('day_plan', index + 1);
                    if (!step) return;
                    const dateLabel = dayPlan.date ? new Date(`${dayPlan.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
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
                    built.push({ label: 'Daily Cap', value: budget.daily_budget_cap ? `${budget.daily_budget_cap} ${budget.currency || 'USD'}` : 'Not selected', step, fieldName: 'budget' });
                }
            }

            const interests = data.interests;
            if (interests) {
                const step = getStepForField('interests');
                if (step) {
                    built.push({ label: 'Interests', value: interests.interests?.length ? interests.interests.join(', ') : 'Not selected', step, fieldName: 'interests' });
                    built.push({ label: 'Must Visit', value: interests.must_visit_places?.length ? interests.must_visit_places.join(', ') : 'None', step, fieldName: 'interests' });
                }
            }

            const constraints = data.constraints;
            if (constraints) {
                const step = getStepForField('constraints');
                if (step) {
                    built.push({ label: 'Max Stops/Day', value: constraints.max_attractions_per_day?.toString() ?? 'Not selected', step, fieldName: 'constraints' });
                    built.push({ label: 'Rest Hours', value: constraints.daily_rest_hours?.toString() ?? 'Not selected', step, fieldName: 'constraints' });
                    built.push({ label: 'Avoid Crowded', value: constraints.avoid_crowded ? 'Yes' : 'No', step, fieldName: 'constraints' });
                }
            }

            setRows(built);
        } catch {
            setRows([]);
        } finally {
            setLoaded(true);
        }
    }, [authLoading]);

    if (authLoading || !loaded) {
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
                    <div className="content-shell">
                        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
                            <div className="max-w-2xl space-y-3">
                                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Dashboard</p>
                                <h1 className="section-title">Review the trip in one pass.</h1>
                                <p className="section-copy max-w-xl">
                                    Cleaner rows, less chrome, and direct jump-back editing.
                                </p>
                            </div>
                            <Link href="/trip/summary" className="inline-flex items-center gap-2 text-sm text-[var(--accent-strong)]">
                                Open full summary
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {rows.length === 0 ? (
                            <div className="panel-soft rounded-[28px] p-8 text-center">
                                <p className="text-lg text-[var(--text-secondary)]">No trip data found.</p>
                                <Link href="/trip/plan" className="mt-5 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:border-white/20">
                                    Start Planning
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="panel-soft overflow-hidden rounded-[28px]">
                                    {rows.map((row, index) => (
                                        <div
                                            key={index}
                                            className={`grid gap-4 px-5 py-4 sm:grid-cols-[180px_1fr_auto] sm:items-center sm:px-6 ${index !== rows.length - 1 ? 'border-b border-white/6' : ''}`}
                                        >
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                                {row.label}
                                            </span>
                                            <span className="min-w-0 break-words text-sm text-white/90">
                                                {row.value}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(row.step, row.fieldName)}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-white/70 transition hover:border-white/20 hover:text-white"
                                                aria-label={`Edit ${row.label}`}
                                            >
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    <Link href="/trip/summary" className="inline-block w-full sm:w-auto">
                                        <Button className="h-12 w-full px-7 font-semibold shadow-none">
                                            View Full Day-by-Day Summary
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
