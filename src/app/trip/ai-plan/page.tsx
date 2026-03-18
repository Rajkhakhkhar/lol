'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowLeft, Sparkles, Plus, Trash2, Save, RotateCcw, CheckCircle } from 'lucide-react';
import Grainient from '@/components/Grainient';
import Link from 'next/link';
import type { TripFormData } from '@/types';

interface AIActivity {
    time: string;
    place: string;
    note: string;
}

interface AIDay {
    day: number;
    activities: AIActivity[];
}

interface AIResponse {
    days: AIDay[];
    changes: string[];
}

export default function AIPlanPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<AIResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<TripFormData | null>(null);

    const fetchOptimization = async () => {
        if (loading || !formData) return;
        setLoading(true);
        setError(null);
        
        try {
            const { destination_city, destination_country, arrival_datetime, departure_datetime } = formData.travel_logistics;
            const tripDays = formData.day_plans.length;
            const planStr = formData.day_plans.map(dp => {
                const places = dp.places.map(p => `${p.time} - ${p.name}`).join(', ');
                return `Day ${dp.dayNumber}: ${places || 'No activities planned yet'}`;
            }).join('\n');

            const prompt = `User is planning a trip to ${destination_city}, ${destination_country} for ${tripDays} days (${arrival_datetime} to ${departure_datetime}).
Current Plan:
${planStr}
Interests: ${formData.interests.interests.join(', ')}
Constraints: Max ${formData.constraints.max_attractions_per_day} attractions/day, ${formData.constraints.daily_rest_hours}h rest.

Task: Identify closed days, grouping issues, and bad timing. Suggest a better day-by-day plan with realistic times.
Return ONLY valid JSON: { "days": [ { "day": number, "activities": [ { "time": "HH:MM AM/PM", "place": "Place Name", "note": "Reason for change" } ] } ], "changes": [ "Why we moved X to Y" ] }`;

            const res = await fetch('/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            
            const payload = await res.json();
            if (!payload.success) throw new Error(payload.error || 'Failed to generate plan');

            // Extraction logic as Gemini returns a string now
            const jsonMatch = payload.data.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Invalid response format from AI");
            
            const optimized = JSON.parse(jsonMatch[0]);
            setPlan(optimized);
        } catch (err: any) {
            console.error("Frontend Error:", err);
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const raw = localStorage.getItem('tripData');
        if (!raw) {
            router.push('/trip/plan');
            return;
        }
        const data: TripFormData = JSON.parse(raw);
        setFormData(data);
        setLoading(false); // Initial load done
    }, []);

    const handleUpdateActivity = (dayIndex: number, actIndex: number, field: keyof AIActivity, value: string) => {
        if (!plan) return;
        const newDays = [...plan.days];
        newDays[dayIndex].activities[actIndex] = {
            ...newDays[dayIndex].activities[actIndex],
            [field]: value
        };
        setPlan({ ...plan, days: newDays });
    };

    const handleAddActivity = (dayIndex: number) => {
        if (!plan) return;
        const newDays = [...plan.days];
        newDays[dayIndex].activities.push({
            time: '09:00 AM',
            place: 'New Activity',
            note: 'Added manually'
        });
        setPlan({ ...plan, days: newDays });
    };

    const handleDeleteActivity = (dayIndex: number, actIndex: number) => {
        if (!plan) return;
        const newDays = [...plan.days];
        newDays[dayIndex].activities.splice(actIndex, 1);
        setPlan({ ...plan, days: newDays });
    };

    const finalizeTrip = () => {
        // Save finalized plan back to day_plans if needed, or just redirect
        if (plan && formData) {
            const updatedFormData = { ...formData };
            updatedFormData.day_plans = plan.days.map(d => ({
                dayNumber: d.day,
                date: formData.day_plans[d.day - 1]?.date || '',
                hotel: formData.day_plans[d.day - 1]?.hotel || '',
                places: d.activities.map(a => ({ name: a.place, time: a.time }))
            }));
            localStorage.setItem('tripData', JSON.stringify(updatedFormData));
            alert('Itinerary updated with AI optimizations!');
            router.push('/trip/dashboard');
        }
    };

    return (
        <main className="flex-1 min-h-screen relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Grainient
                    color1="#000000"
                    color2="#141414"
                    color3="#1d1d1d"
                    timeSpeed={1}
                    warpStrength={0.5}
                />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <nav className="sticky top-0 z-50 glass">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-[10px] group">
                            <div className="w-8 h-8 rounded-full bg-[#141414] border border-[#2a2a2a] flex items-center justify-center shadow-[0_0_10px_rgba(79, 142, 255,0.15)] hover:border-blue-500 transition-colors">
                                <Globe className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <span className="text-[18px] font-bold text-white tracking-[2px]">EYEKON</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.push('/trip/dashboard')}
                                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-white/5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Discovery
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="w-full max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-6"
                            />
                            <h2 className="text-xl font-bold font-display text-white mb-2">Iconéra AI is crafting your perfect itinerary...</h2>
                            <p className="text-white/40">Optimizing routes and fixing scheduling errors</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <h2 className="text-xl font-bold text-red-500 mb-4">Error: {error}</h2>
                            <button 
                                onClick={() => fetchOptimization()}
                                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold"
                            >
                                Retry Generating Plan
                            </button>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Your Optimized Itinerary</h1>
                                    <p className="text-white/40">AI has fine-tuned your plan for a seamless experience in {formData?.travel_logistics.destination_city}.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => fetchOptimization()}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        {loading ? 'Thinking...' : 'Regenerate'}
                                    </button>
                                    <button 
                                        onClick={finalizeTrip}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Finalize Trip
                                    </button>
                                </div>
                            </div>

                            {!plan && !loading && (
                                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                                    <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-50" />
                                    <h2 className="text-2xl font-bold text-white mb-2">Ready to optimize your journey?</h2>
                                    <p className="text-white/40 mb-8 max-w-md mx-auto">Click the button below to have Iconéra AI review your itinerary and suggest the best routes and times.</p>
                                    <button 
                                        onClick={() => fetchOptimization()}
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Optimize My Plan
                                    </button>
                                </div>
                            )}

                            {plan?.changes && plan.changes.length > 0 && (
                                <div className="mb-8 p-5 rounded-2xl bg-blue-600/10 border border-blue-500/30">
                                    <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        AI Optimizations Made
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                        {plan.changes.map((change, i) => (
                                            <li key={i} className="text-sm text-white/60 flex gap-2">
                                                <span className="text-blue-400">•</span> {change}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-8">
                                {plan?.days.map((day, dIdx) => (
                                    <div key={dIdx} className="relative p-6 rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl pointer-events-none">0{dIdx + 1}</div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                                <span className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-sm">Day</span>
                                                {dIdx + 1}
                                            </h2>
                                            <button 
                                                onClick={() => handleAddActivity(dIdx)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-600/30 transition-all"
                                            >
                                                <Plus className="w-4 h-4" /> Add Place
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {day.activities.map((act, aIdx) => (
                                                <motion.div 
                                                    key={aIdx}
                                                    layout
                                                    className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all group/item"
                                                >
                                                    <div className="w-full sm:w-28 pt-1">
                                                        <input 
                                                            value={act.time}
                                                            onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'time', e.target.value)}
                                                            className="text-sm font-bold text-blue-400 bg-transparent border-none p-0 focus:ring-0 w-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <input 
                                                            value={act.place}
                                                            onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'place', e.target.value)}
                                                            className="text-lg font-bold text-white bg-transparent border-none p-0 focus:ring-0 w-full"
                                                        />
                                                        <input 
                                                            value={act.note}
                                                            onChange={(e) => handleUpdateActivity(dIdx, aIdx, 'note', e.target.value)}
                                                            className="text-sm text-white/40 bg-transparent border-none p-0 focus:ring-0 w-full italic"
                                                            placeholder="Add a suggestion..."
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteActivity(dIdx, aIdx)}
                                                        className="p-2 opacity-0 group-hover/item:opacity-100 text-white/20 hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                            {day.activities.length === 0 && (
                                                <div className="text-center py-6 text-white/20 border-2 border-dashed border-white/10 rounded-xl">
                                                    No activities planned for this day
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-center pb-20">
                                <button 
                                    onClick={finalizeTrip}
                                    className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-black font-bold text-lg hover:scale-[1.02] transition-all overflow-hidden shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                                    Finalize Your Journey
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
