'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, ArrowLeft, MoreVertical } from 'lucide-react';
import type { TripFormData } from '@/types';

interface DashboardRow {
    label: string;
    value: string;
    step: number;
}

export default function TripDashboardPage() {
    const router = useRouter();
    const [rows, setRows] = useState<DashboardRow[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('tripData');
            if (!raw) {
                setLoaded(true);
                return;
            }

            const data: TripFormData = JSON.parse(raw);
            const built: DashboardRow[] = [];

            // Calculate number of day plans to determine step offsets
            const numDayPlans = data.day_plans?.length || 0;
            // Steps: 1=Travelers, 2=Logistics, 3...(2+N)=Day plans, (3+N)=Budget, (4+N)=Interests, (5+N)=Constraints
            const budgetStep = 3 + numDayPlans;
            const interestsStep = 4 + numDayPlans;
            const constraintsStep = 5 + numDayPlans;

            // ── Step 1: Travelers ──────────────────────────────
            const ti = data.traveler_info;
            if (ti) {
                built.push({
                    label: 'Adults',
                    value: ti.adults?.toString() ?? 'Not selected',
                    step: 1,
                });
                built.push({
                    label: 'Children',
                    value: ti.children?.toString() ?? 'Not selected',
                    step: 1,
                });
                built.push({
                    label: 'Travel Type',
                    value: ti.travel_type
                        ? ti.travel_type.charAt(0).toUpperCase() + ti.travel_type.slice(1)
                        : 'Not selected',
                    step: 1,
                });
                built.push({
                    label: 'Travel Pace',
                    value: ti.travel_pace
                        ? ti.travel_pace.charAt(0).toUpperCase() + ti.travel_pace.slice(1)
                        : 'Not selected',
                    step: 1,
                });
                built.push({
                    label: 'Accessibility Needs',
                    value: ti.accessibility_needs ? 'Yes' : 'No',
                    step: 1,
                });
            }

            // ── Step 2: Logistics ──────────────────────────────
            const tl = data.travel_logistics;
            if (tl) {
                built.push({
                    label: 'Country',
                    value: tl.destination_country || 'Not selected',
                    step: 2,
                });
                built.push({
                    label: 'City',
                    value: tl.destination_city || 'Not selected',
                    step: 2,
                });
                built.push({
                    label: 'Arrival',
                    value: tl.arrival_datetime || 'Not selected',
                    step: 2,
                });
                built.push({
                    label: 'Departure',
                    value: tl.departure_datetime || 'Not selected',
                    step: 2,
                });
                built.push({
                    label: 'Transport Mode',
                    value: tl.transport_mode
                        ? tl.transport_mode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                        : 'Not selected',
                    step: 2,
                });
            }

            // ── Day Plans ──────────────────────────────────────
            if (data.day_plans && data.day_plans.length > 0) {
                // Show same-hotel info
                if (data.sameHotelForAllDays) {
                    built.push({
                        label: 'Hotel (all days)',
                        value: data.day_plans[0]?.hotel || 'Not set',
                        step: 3, // First day step
                    });
                }

                data.day_plans.forEach((dp, idx) => {
                    const dayStep = 3 + idx; // step numbers for each day
                    const dateLabel = dp.date
                        ? new Date(dp.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '';

                    if (!data.sameHotelForAllDays) {
                        built.push({
                            label: `Day ${dp.dayNumber} Hotel`,
                            value: dp.hotel || 'Not set',
                            step: dayStep,
                        });
                    }

                    built.push({
                        label: `Day ${dp.dayNumber} (${dateLabel})`,
                        value: dp.places.length > 0
                            ? dp.places.map(p => `${p.name} @ ${p.time}`).join(', ')
                            : 'No places planned',
                        step: dayStep,
                    });
                });
            }

            // ── Budget ─────────────────────────────────────────
            const b = data.budget;
            if (b) {
                built.push({
                    label: 'Total Budget',
                    value: b.total_budget ? `${b.total_budget} ${b.currency || 'USD'}` : 'Not selected',
                    step: budgetStep,
                });
                built.push({
                    label: 'Daily Budget Cap',
                    value: b.daily_budget_cap ? `${b.daily_budget_cap} ${b.currency || 'USD'}` : 'Not selected',
                    step: budgetStep,
                });
            }

            // ── Interests ──────────────────────────────────────
            const int = data.interests;
            if (int) {
                built.push({
                    label: 'Interests',
                    value: int.interests?.length ? int.interests.join(', ') : 'Not selected',
                    step: interestsStep,
                });
                built.push({
                    label: 'Must-Visit Places',
                    value: int.must_visit_places?.length ? int.must_visit_places.join(', ') : 'None',
                    step: interestsStep,
                });
                built.push({
                    label: 'Environment Preference',
                    value: int.environment_preference
                        ? int.environment_preference.charAt(0).toUpperCase() + int.environment_preference.slice(1)
                        : 'Not selected',
                    step: interestsStep,
                });
            }

            // ── Constraints ────────────────────────────────────
            const c = data.constraints;
            if (c) {
                built.push({
                    label: 'Max Attractions/Day',
                    value: c.max_attractions_per_day?.toString() ?? 'Not selected',
                    step: constraintsStep,
                });
                built.push({
                    label: 'Daily Rest Hours',
                    value: c.daily_rest_hours?.toString() ?? 'Not selected',
                    step: constraintsStep,
                });
                built.push({
                    label: 'Avoid Crowded',
                    value: c.avoid_crowded ? 'Yes' : 'No',
                    step: constraintsStep,
                });
                built.push({
                    label: 'Fixed Bookings',
                    value: c.fixed_bookings?.length
                        ? `${c.fixed_bookings.length} booking(s)`
                        : 'None',
                    step: constraintsStep,
                });
            }

            setRows(built);
        } catch {
            // malformed data — show empty
        } finally {
            setLoaded(true);
        }
    }, []);

    const handleEdit = (step: number) => {
        router.push(`/trip/plan?step=${step}&edit=true`);
    };

    if (!loaded) {
        return (
            <main className="flex-1 min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

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
                        href="/trip/plan"
                        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Planner
                    </Link>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                        Trip Summary 📋
                    </h1>
                    <p className="text-white/40 max-w-lg mx-auto">
                        Review your selections below. Click ⋮ to edit any section.
                    </p>
                </div>

                {rows.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-white/40 text-lg">No trip data found.</p>
                        <Link
                            href="/trip/plan"
                            className="inline-block mt-4 px-6 py-3 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                        >
                            Start Planning
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                        {rows.map((row, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between px-5 py-4 ${index !== rows.length - 1 ? 'border-b border-white/[0.06]' : ''
                                    } hover:bg-white/[0.03] transition-colors`}
                            >
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm text-white/50">{row.label}</span>
                                </div>
                                <div className="flex-1 min-w-0 text-right pr-4">
                                    <span className="text-sm text-white font-medium truncate block">
                                        {row.value}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleEdit(row.step)}
                                    className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                                    aria-label={`Edit ${row.label}`}
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
