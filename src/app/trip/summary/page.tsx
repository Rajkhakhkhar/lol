'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2, Hotel, MapPin, Share2 } from 'lucide-react';
import type { TripFormData } from '@/types';
import Grainient from '@/components/Grainient';
import { Button } from '@/components/ui';
import { PillNav } from '@/components/landing/PillNav';
import { useRequireAuth } from '@/components/auth/AuthProvider';

export default function PlanSummaryPage() {
    const { loading: authLoading } = useRequireAuth();
    const [formData, setFormData] = useState<TripFormData | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        try {
            const raw = localStorage.getItem('tripData');
            if (raw) {
                setFormData(JSON.parse(raw));
            }
        } catch (err) {
            console.error('Error loading trip data:', err);
        } finally {
            setLoaded(true);
        }
    }, [authLoading]);

    const handleShare = async () => {
        if (!formData) return;

        const { destination_city, destination_country } = formData.travel_logistics;
        const tripDays = formData.day_plans.length;
        let shareText = `Trip to ${destination_city}, ${destination_country} (${tripDays} Days)\n\n`;

        formData.day_plans.forEach((day) => {
            shareText += `Day ${day.dayNumber}:\n`;
            shareText += `Hotel: ${day.hotel || 'Not specified'}\n`;
            shareText += day.nothingPlanned || day.places.length === 0
                ? 'Places: Nothing planned\n\n'
                : `Places: ${day.places.map((p) => p.name).join(', ')}\n\n`;
        });

        if (navigator.share) {
            try {
                await navigator.share({ title: `My Trip to ${destination_city}`, text: shareText });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                alert('Plan copied to clipboard.');
            } catch (err) {
                console.error('Error copying to clipboard:', err);
            }
        }
    };

    if (authLoading || !loaded) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </main>
        );
    }

    if (!formData) {
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <div className="panel-soft rounded-[28px] p-8 text-center">
                    <h1 className="text-xl text-white">No trip data found</h1>
                    <Link href="/trip/plan" className="mt-5 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:border-white/20">
                        Start Planning
                    </Link>
                </div>
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
                    <div className="content-shell max-w-5xl">
                        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
                            <div className="space-y-3">
                                <Link href="/trip/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-white">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Dashboard
                                </Link>
                                <h1 className="section-title">Full itinerary summary.</h1>
                                <p className="section-copy max-w-2xl">
                                    Day-by-day review with less padding, wider reading width, and cleaner activity blocks.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 rounded-full border-white/10 bg-transparent px-4 shadow-none w-fit">
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.day_plans.map((day) => (
                                <article key={day.dayNumber} className="panel-soft rounded-[28px] p-5 sm:p-6">
                                    <div className="mb-5 flex flex-col gap-4 border-b border-white/6 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                                                <Calendar className="h-5 w-5 text-[var(--accent)]" />
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                                    Day {day.dayNumber}
                                                </div>
                                                <h3 className="text-xl font-semibold text-white">
                                                    {new Date(`${day.date}T00:00:00`).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-sm text-[var(--text-secondary)]">
                                            <Hotel className="h-4 w-4 text-[var(--accent)]" />
                                            {day.hotel || 'No hotel specified'}
                                        </div>
                                    </div>

                                    {(day.nothingPlanned || day.places.length === 0) ? (
                                        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm text-[var(--text-secondary)]">
                                            <CheckCircle2 className="h-4 w-4 text-white/30" />
                                            Nothing planned for this day
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {day.places.map((place, index) => (
                                                <div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <MapPin className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                                                        <span className="truncate text-sm font-medium text-white/92">
                                                            {place.name}
                                                        </span>
                                                    </div>
                                                    <div className="inline-flex w-fit items-center rounded-full border border-white/8 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                                                        {place.time}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>

                        <div className="mt-8 panel-soft rounded-[28px] p-6 text-center sm:p-8">
                            <h4 className="text-2xl font-semibold text-white">Ready to share this plan?</h4>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                                Copy or share the full itinerary once everything looks right.
                            </p>
                            <Button onClick={handleShare} className="mt-6 gap-2 px-6 shadow-none">
                                <Share2 className="w-4 h-4" />
                                Share Full Itinerary
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
