'use client';

import { motion } from 'framer-motion';
import { Card, Badge } from '@/components/ui';
import type { GeminiItineraryResponse, ItineraryDay, ItineraryActivity, ActivityType } from '@/types';
import { formatTime, formatCurrency } from '@/lib/utils';
import {
    MapPin, Clock, DollarSign, Star, Utensils, Hotel,
    Camera, Coffee, Footprints, Calendar, TrendingUp,
    AlertCircle, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

// ── Activity type config ─────────────────────────────────────
const activityConfig: Record<ActivityType, { icon: typeof MapPin; color: string; bg: string }> = {
    attraction: { icon: Camera, color: 'text-violet-400', bg: 'bg-violet-500/20 border-violet-500/30' },
    meal: { icon: Utensils, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
    travel: { icon: Footprints, color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
    rest: { icon: Coffee, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
    hotel: { icon: Hotel, color: 'text-pink-400', bg: 'bg-pink-500/20 border-pink-500/30' },
    fixed_booking: { icon: Calendar, color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/30' },
    free_time: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
};

// ── Activity Card ────────────────────────────────────────────
function ActivityCard({ activity, index }: { activity: ItineraryActivity; index: number }) {
    const config = activityConfig[activity.type] || activityConfig.attraction;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-8"
        >
            {/* Timeline dot */}
            <div className={`absolute left-0 top-3 w-4 h-4 rounded-full border-2 ${config.bg} z-10`} />
            {/* Timeline line */}
            <div className="absolute left-[7px] top-7 bottom-0 w-0.5 bg-white/10" />

            <div className={`p-4 rounded-xl border ${config.bg} backdrop-blur-sm hover:bg-white/5 transition-all duration-200 group`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-white text-sm truncate">{activity.name}</h4>
                            {activity.description && (
                                <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{activity.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/40">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(activity.start_time)} – {formatTime(activity.end_time)}
                                </span>
                                {activity.duration_minutes > 0 && (
                                    <span>{activity.duration_minutes}min</span>
                                )}
                                {activity.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate max-w-[150px]">{activity.location}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {activity.estimated_cost > 0 && (
                            <Badge variant="default">
                                <DollarSign className="w-3 h-3 mr-0.5" />
                                {activity.estimated_cost}
                            </Badge>
                        )}
                        {activity.travel_time_from_previous > 0 && (
                            <span className="text-[10px] text-white/30">
                                +{activity.travel_time_from_previous}min travel
                            </span>
                        )}
                    </div>
                </div>

                {activity.notes && (
                    <p className="text-[11px] text-white/30 mt-2 italic">{activity.notes}</p>
                )}
            </div>
        </motion.div>
    );
}

// ── Day Card ─────────────────────────────────────────────────
function DayCard({ day, defaultOpen }: { day: ItineraryDay; defaultOpen: boolean }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: day.day_number * 0.1 }}
        >
            <Card className="overflow-hidden">
                {/* Day Header */}
                <button
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex flex-col items-center justify-center shadow-lg shadow-violet-500/20">
                            <span className="text-[10px] font-medium text-white/80 uppercase leading-tight">Day</span>
                            <span className="text-xl font-bold text-white leading-tight">{day.day_number}</span>
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-white text-lg">{day.theme}</h3>
                            <p className="text-sm text-white/40">{day.date}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 text-sm text-white/40">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-violet-400" />
                                {day.activities.filter(a => a.type === 'attraction').length} stops
                            </span>
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                {formatCurrency(day.daily_cost_estimate)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                {day.total_travel_time}min travel
                            </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {/* Day Activities */}
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 space-y-3"
                    >
                        {/* Mobile stats */}
                        <div className="flex sm:hidden items-center gap-3 text-xs text-white/40 mb-4">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-violet-400" />
                                {day.activities.filter(a => a.type === 'attraction').length} stops
                            </span>
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-emerald-400" />
                                {formatCurrency(day.daily_cost_estimate)}
                            </span>
                        </div>

                        {day.activities.map((activity, i) => (
                            <ActivityCard key={activity.id || i} activity={activity} index={i} />
                        ))}
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
}

// ── Main Itinerary Display ───────────────────────────────────
interface Props {
    itinerary: GeminiItineraryResponse;
    onReset: () => void;
}

export default function ItineraryDisplay({ itinerary, onReset }: Props) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header Stats */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    Your Itinerary is Ready ✨
                </h1>
                <p className="text-white/50">
                    {itinerary.days.length} days of carefully planned adventure
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="text-center p-4">
                    <Calendar className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{itinerary.days.length}</p>
                    <p className="text-xs text-white/40">Days</p>
                </Card>
                <Card className="text-center p-4">
                    <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{formatCurrency(itinerary.total_estimated_cost)}</p>
                    <p className="text-xs text-white/40">Est. Cost</p>
                </Card>
                <Card className="text-center p-4">
                    <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{itinerary.optimization_score}</p>
                    <p className="text-xs text-white/40">AI Score</p>
                </Card>
                <Card className="text-center p-4">
                    <MapPin className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                        {itinerary.days.reduce((s, d) => s + d.activities.filter(a => a.type === 'attraction').length, 0)}
                    </p>
                    <p className="text-xs text-white/40">Attractions</p>
                </Card>
            </div>

            {/* Notes */}
            {itinerary.notes.length > 0 && (
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-white/80">Generation Notes</span>
                    </div>
                    <ul className="space-y-1">
                        {itinerary.notes.map((note, i) => (
                            <li key={i} className="text-xs text-white/40 flex items-start gap-2">
                                <span className="text-white/20">•</span>
                                {note}
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Day Cards */}
            <div className="space-y-4">
                {itinerary.days.map((day, i) => (
                    <DayCard key={day.day_number} day={day} defaultOpen={i === 0} />
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={onReset}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium cursor-pointer"
                >
                    Plan Another Trip
                </button>
            </div>
        </div>
    );
}
