'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, ArrowLeft, MoreVertical, Sparkles } from 'lucide-react';
import type { TripFormData } from '@/types';
import Grainient from '@/components/Grainient';

interface DashboardRow {
    label: string;
    value: string;
    step: number;
    fieldName: string;
}

export default function TripDashboardPage() {
    const router = useRouter();
    const [rows, setRows] = useState<DashboardRow[]>([]);
    const [loaded, setLoaded] = useState(false);

    const getStepForField = (field: string, dayNumber: number | null = null): number | null => {
        const raw = localStorage.getItem('tripData');
        if (!raw) return null;
        try {
            const data: TripFormData = JSON.parse(raw);
            const tripDays = data.day_plans?.length || 0;

            switch (field) {
                case "travelers": return 1;
                case "logistics": return 2;
                case "day_plan": return 2 + (dayNumber || 1);
                case "budget": return 3 + tripDays;
                case "interests": return 4 + tripDays;
                case "constraints": return 5 + tripDays;
                default: return null;
            }
        } catch {
            return null;
        }
    };

    const handleEdit = (step: number | null, fieldName: string) => {
        console.log("Field:", fieldName);
        console.log("Redirect Step:", step);

        if (step === null || step === undefined || isNaN(step)) {
            console.error("Invalid step detected for field:", fieldName, "— blocking redirect");
            return;
        }

        router.push(`/trip/plan?step=${step}&edit=true&from=dashboard`);
    };

    useEffect(() => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            router.push('/');
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

            // ── Step 1: Travelers ──────────────────────────────
            const ti = data.traveler_info;
            if (ti) {
                const s = getStepForField("travelers");
                if (s) {
                    built.push({ label: 'Adults', value: ti.adults?.toString() ?? 'Not selected', step: s, fieldName: 'travelers' });
                    built.push({ label: 'Children', value: ti.children?.toString() ?? 'Not selected', step: s, fieldName: 'travelers' });
                    built.push({ label: 'Travel Type', value: ti.travel_type ? ti.travel_type.charAt(0).toUpperCase() + ti.travel_type.slice(1) : 'Not selected', step: s, fieldName: 'travelers' });
                    built.push({ label: 'Travel Pace', value: ti.travel_pace ? ti.travel_pace.charAt(0).toUpperCase() + ti.travel_pace.slice(1) : 'Not selected', step: s, fieldName: 'travelers' });
                    built.push({ label: 'Accessibility Needs', value: ti.accessibility_needs ? '♿ Enabled — High Priority' : 'Off', step: s, fieldName: 'travelers' });
                }
            }

            // ── Step 2: Logistics ──────────────────────────────
            const tl = data.travel_logistics;
            if (tl) {
                const s = getStepForField("logistics");
                if (s) {
                    built.push({ label: 'Country', value: tl.destination_country || 'Not selected', step: s, fieldName: 'logistics' });
                    built.push({ label: 'City', value: tl.destination_city || 'Not selected', step: s, fieldName: 'logistics' });
                    built.push({ label: 'Arrival', value: tl.arrival_datetime || 'Not selected', step: s, fieldName: 'logistics' });
                    built.push({ label: 'Departure', value: tl.departure_datetime || 'Not selected', step: s, fieldName: 'logistics' });
                    built.push({ label: 'Transport Mode', value: tl.transport_mode ? tl.transport_mode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Not selected', step: s, fieldName: 'logistics' });
                }
            }

            // ── Day Plans ──────────────────────────────────────
            if (data.day_plans && data.day_plans.length > 0) {
                if (data.sameHotelForAllDays) {
                    const s = getStepForField("day_plan", 1);
                    if (s) built.push({ label: 'Hotel (all days)', value: data.day_plans[0]?.hotel || 'Not set', step: s, fieldName: 'day_plan' });
                }

                data.day_plans.forEach((dp, idx) => {
                    const s = getStepForField("day_plan", idx + 1);
                    if (!s) return;
                    const dateLabel = dp.date ? new Date(dp.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

                    if (!data.sameHotelForAllDays) {
                        built.push({ label: `Day ${dp.dayNumber} Hotel`, value: dp.hotel || 'Not set', step: s, fieldName: 'day_plan' });
                    }

                    built.push({
                        label: `Day ${dp.dayNumber} (${dateLabel})`,
                        value: dp.places.length > 0 ? dp.places.map(p => `${p.name} @ ${p.time}`).join(', ') : 'No places planned',
                        step: s,
                        fieldName: 'day_plan'
                    });
                });
            }

            // ── Budget ─────────────────────────────────────────
            const b = data.budget;
            if (b) {
                const s = getStepForField("budget");
                if (s) {
                    built.push({ label: 'Total Budget', value: b.total_budget ? `${b.total_budget} ${b.currency || 'USD'}` : 'Not selected', step: s, fieldName: 'budget' });
                    built.push({ label: 'Daily Budget Cap', value: b.daily_budget_cap ? `${b.daily_budget_cap} ${b.currency || 'USD'}` : 'Not selected', step: s, fieldName: 'budget' });
                }
            }

            // ── Interests ──────────────────────────────────────
            const int = data.interests;
            if (int) {
                const s = getStepForField("interests");
                if (s) {
                    built.push({ label: 'Interests', value: int.interests?.length ? int.interests.join(', ') : 'Not selected', step: s, fieldName: 'interests' });
                    built.push({ label: 'Must-Visit Places', value: int.must_visit_places?.length ? int.must_visit_places.join(', ') : 'None', step: s, fieldName: 'interests' });
                    built.push({ label: 'Environment Preference', value: int.environment_preference ? int.environment_preference.charAt(0).toUpperCase() + int.environment_preference.slice(1) : 'Not selected', step: s, fieldName: 'interests' });
                }
            }

            // ── Constraints ────────────────────────────────────
            const c = data.constraints;
            if (c) {
                const s = getStepForField("constraints");
                if (s) {
                    built.push({ label: 'Max Attractions/Day', value: c.max_attractions_per_day?.toString() ?? 'Not selected', step: s, fieldName: 'constraints' });
                    built.push({ label: 'Daily Rest Hours', value: c.daily_rest_hours?.toString() ?? 'Not selected', step: s, fieldName: 'constraints' });
                    built.push({ label: 'Avoid Crowded', value: c.avoid_crowded ? 'Yes' : 'No', step: s, fieldName: 'constraints' });
                    built.push({ label: 'Fixed Bookings', value: c.fixed_bookings?.length ? `${c.fixed_bookings.length} booking(s)` : 'None', step: s, fieldName: 'constraints' });
                }
            }

            setRows(built);
        } catch {
            // ignore
        } finally {
            setLoaded(true);
        }
    }, []);

    if (!loaded) {
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-[10px] group">
                            <div className="w-8 h-8 rounded-full bg-[#141414] border border-[#2a2a2a] flex items-center justify-center shadow-[0_0_10px_rgba(79, 140, 255,0.15)] hover:border-blue-500 transition-colors">
                                <Globe className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <span className="text-[18px] font-bold text-white tracking-[2px]">
                                EYEKON
                            </span>
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link href="/trip/plan" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Planner
                            </Link>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("isLoggedIn");
                                    window.location.href = "/";
                                }}
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
                            Trip Summary 📋
                        </h1>
                        <p className="text-white/40 max-w-lg mx-auto mb-6 text-sm sm:text-base">
                            Review your selections below. Click ⋮ to edit any section.
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
                                            className="self-end sm:self-center flex-shrink-0 p-3 sm:p-2 rounded-lg bg-[#141414] sm:bg-transparent hover:bg-[#141414] border border-[#2a2a2a] sm:border-transparent hover:border-blue-500 hover:shadow-[0_0_10px_rgba(79, 140, 255,0.15)] text-[#b5b5b5] hover:text-white transition-all cursor-pointer"
                                            aria-label={`Edit ${row.label}`}
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-10 mb-10 text-center">
                                <Link href="/trip/summary">
                                    <button
                                        type="button"
                                        className="px-8 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold border border-blue-500 hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all cursor-pointer shadow-lg active:scale-95"
                                    >
                                        View Full Day-by-Day Summary
                                    </button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
