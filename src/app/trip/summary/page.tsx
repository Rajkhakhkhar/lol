'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, ArrowLeft, Share2, Hotel, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import type { TripFormData } from '@/types';
import Grainient from '@/components/Grainient';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/common/Logo';

export default function PlanSummaryPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<TripFormData | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            router.push('/');
            return;
        }

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
    }, [router]);

    const handleShare = async () => {
        if (!formData) return;

        const { destination_city, destination_country } = formData.travel_logistics;
        const tripDays = formData.day_plans.length;
        
        let shareText = `Trip to ${destination_city}, ${destination_country} (${tripDays} Days)\n\n`;

        formData.day_plans.forEach((day) => {
            shareText += `Day ${day.dayNumber}:\n`;
            shareText += `Hotel: ${day.hotel || 'Not specified'}\n`;
            if (day.nothingPlanned || day.places.length === 0) {
                shareText += `Places: Nothing planned\n`;
            } else {
                shareText += `Places: ${day.places.map(p => p.name).join(', ')}\n`;
            }
            shareText += `\n`;
        });

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My Trip to ${destination_city}`,
                    text: shareText,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                alert('Plan copied to clipboard!');
            } catch (err) {
                console.error('Error copying to clipboard:', err);
            }
        }
    };

    if (!loaded) {
        return (
            <main className="flex-1 min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    if (!formData) {
        return (
            <main className="flex-1 min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-xl text-white mb-4">No trip data found</h1>
                <Link href="/trip/plan">
                    <Button>Start Planning</Button>
                </Link>
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
                    contrast={1.5}
                />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <nav className="sticky top-0 z-50 glass">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[72px] h-auto py-3 flex items-center justify-between">
                        <Logo size="sm" />
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Share Plan</span>
                            </Button>
                        </div>
                    </div>
                </nav>

                <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link href="/trip/dashboard" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">Full Itinerary Summary</h1>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {formData.day_plans.map((day) => (
                            <Card key={day.dayNumber} className="relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="text-6xl font-black italic">DAY {day.dayNumber}</span>
                                </div>
                                
                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Day {day.dayNumber}</div>
                                        <h3 className="text-lg font-bold text-white">
                                            {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {/* Hotel Section */}
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <Hotel className="w-4 h-4 text-[#7a7a7a] mt-1" />
                                        <div className="flex-1">
                                            <div className="text-[10px] text-[#7a7a7a] uppercase font-bold tracking-tight mb-0.5">Staying At</div>
                                            <div className="text-sm text-white font-medium">{day.hotel || 'No Hotel Specified'}</div>
                                        </div>
                                    </div>

                                    {/* Places Section */}
                                    <div className="space-y-3">
                                        <div className="text-[10px] text-[#7a7a7a] uppercase font-bold tracking-tight px-3">Places To Visit</div>
                                        
                                        {(day.nothingPlanned || day.places.length === 0) ? (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-black border border-white/5 opacity-60">
                                                <CheckCircle2 className="w-4 h-4 text-white/20" />
                                                <span className="text-sm text-white/40 italic">Nothing planned for this day</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {day.places.map((place, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#2a2a2a] group/place hover:border-blue-500/30 transition-all">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                                            <span className="text-sm text-white/90 font-medium truncate">{place.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/5 border border-blue-500/10 shrink-0">
                                                            <span className="text-[10px] font-bold text-blue-400">{place.time}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-12 text-center p-8 rounded-2xl bg-black border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                        <h4 className="text-xl font-bold text-white mb-2 relative z-10">All set for your adventure?</h4>
                        <p className="text-sm text-white/40 mb-6 relative z-10">Share your detailed plan with travel buddies or keep it for your reference.</p>
                        <Button onClick={handleShare} className="gap-2 relative z-10">
                            <Share2 className="w-4 h-4" />
                            Share Full Itinerary
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
