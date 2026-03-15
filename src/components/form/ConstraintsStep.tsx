'use client';

import { useState } from 'react';
import { Input, Toggle } from '@/components/ui';
import type { ConstraintsForm, FixedBooking } from '@/types';
import { Shield, Clock, MapPin, Plus, Trash2, Calendar } from 'lucide-react';

interface Props {
    data: ConstraintsForm;
    onChange: (data: ConstraintsForm) => void;
}

export default function ConstraintsStep({ data, onChange }: Props) {
    const update = (field: Partial<ConstraintsForm>) => onChange({ ...data, ...field });
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [newBooking, setNewBooking] = useState<FixedBooking>({
        name: '', date: '', start_time: '', end_time: '', location: '', notes: '',
    });

    const addBooking = () => {
        if (newBooking.name && newBooking.date && newBooking.start_time) {
            update({ fixed_bookings: [...data.fixed_bookings, newBooking] });
            setNewBooking({ name: '', date: '', start_time: '', end_time: '', location: '', notes: '' });
            setShowBookingForm(false);
        }
    };

    const removeBooking = (index: number) => {
        update({ fixed_bookings: data.fixed_bookings.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#2a2a2a] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Constraints & Rules</h2>
                    <p className="text-sm text-white/50">Set limits to keep your trip comfortable</p>
                </div>
            </div>

            {/* Numeric Constraints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        Max Attractions Per Day
                    </div>
                    <Input
                        type="number"
                        min={1}
                        max={12}
                        value={data.max_attractions_per_day}
                        onChange={e => update({ max_attractions_per_day: Math.max(1, Math.min(12, parseInt(e.target.value) || 5)) })}
                    />
                    <p className="text-xs text-white/40">Recommended: 3–6 for balanced pacing</p>
                </div>

                <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <Clock className="w-4 h-4 text-pink-500" />
                        Daily Rest Hours
                    </div>
                    <Input
                        type="number"
                        min={0}
                        max={8}
                        step={0.5}
                        value={data.daily_rest_hours}
                        onChange={e => update({ daily_rest_hours: Math.max(0, Math.min(8, parseFloat(e.target.value) || 2)) })}
                    />
                    <p className="text-xs text-white/40">Include breaks, naps, and downtime</p>
                </div>
            </div>

            {/* Toggle */}
            <Toggle
                checked={data.avoid_crowded}
                onChange={checked => update({ avoid_crowded: checked })}
                label="Avoid Crowded Places"
                description="Prefer off-the-beaten-path destinations with fewer tourists"
            />

            {/* Fixed Bookings */}
            <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Fixed Bookings
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowBookingForm(!showBookingForm)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#2a2a2a] text-[#b5b5b5] hover:text-[#f5f5f5] hover:border-[#3a3a3a] text-xs font-medium transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Booking
                    </button>
                </div>

                {showBookingForm && (
                    <div className="p-4 rounded-xl bg-[#202020] border border-blue-500/30 space-y-3 animate-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Booking Name"
                                placeholder="e.g., Restaurant Reservation"
                                value={newBooking.name}
                                onChange={e => setNewBooking({ ...newBooking, name: e.target.value })}
                            />
                            <Input
                                label="Location"
                                placeholder="e.g., Downtown"
                                value={newBooking.location}
                                onChange={e => setNewBooking({ ...newBooking, location: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input
                                label="Date"
                                type="date"
                                value={newBooking.date}
                                onChange={e => setNewBooking({ ...newBooking, date: e.target.value })}
                            />
                            <Input
                                label="Start Time"
                                type="time"
                                value={newBooking.start_time}
                                onChange={e => setNewBooking({ ...newBooking, start_time: e.target.value })}
                            />
                            <Input
                                label="End Time"
                                type="time"
                                value={newBooking.end_time}
                                onChange={e => setNewBooking({ ...newBooking, end_time: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={addBooking}
                                className="px-4 py-2 rounded-lg border border-blue-500 bg-blue-600/10 hover:bg-blue-600/20 text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowBookingForm(false)}
                                className="px-4 py-2 rounded-lg bg-white/10 text-white/60 text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {data.fixed_bookings.length === 0 && !showBookingForm && (
                    <p className="text-sm text-white/30 text-center py-4">No fixed bookings added yet</p>
                )}

                {data.fixed_bookings.map((booking, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#141414] border border-[#2a2a2a]">
                        <div>
                            <p className="text-sm font-medium text-white">{booking.name}</p>
                            <p className="text-xs text-white/40">
                                {booking.date} • {booking.start_time} – {booking.end_time} • {booking.location}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeBooking(i)}
                            className="p-2 rounded-lg hover:bg-pink-500/20 text-[#7a7a7a] hover:text-pink-500 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
