'use client';

import { Input, Select, Toggle } from '@/components/ui';
import type { TravelerInfoForm } from '@/types';
import { Users, Baby, Compass } from 'lucide-react';

interface Props {
    data: TravelerInfoForm;
    onChange: (data: TravelerInfoForm) => void;
}

export default function TravelerInfoStep({ data, onChange }: Props) {
    const update = (field: Partial<TravelerInfoForm>) => onChange({ ...data, ...field });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Who&apos;s Traveling?</h2>
                    <p className="text-sm text-white/50">Tell us about your travel group</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Number of Adults"
                    type="number"
                    min={1}
                    max={20}
                    value={data.adults}
                    onChange={e => update({ adults: Math.max(1, parseInt(e.target.value) || 1) })}
                />
                <Input
                    label="Number of Children"
                    type="number"
                    min={0}
                    max={10}
                    value={data.children}
                    onChange={e => {
                        const children = Math.max(0, parseInt(e.target.value) || 0);
                        const ages = data.children_ages.slice(0, children);
                        while (ages.length < children) ages.push(5);
                        update({ children, children_ages: ages });
                    }}
                />
            </div>

            {data.children > 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-violet-400" />
                        <label className="text-sm font-medium text-white/80">Children Ages</label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {data.children_ages.map((age, i) => (
                            <Input
                                key={i}
                                type="number"
                                min={0}
                                max={17}
                                value={age}
                                className="w-20"
                                onChange={e => {
                                    const ages = [...data.children_ages];
                                    ages[i] = parseInt(e.target.value) || 0;
                                    update({ children_ages: ages });
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                    label="Travel Type"
                    value={data.travel_type}
                    onChange={e => update({ travel_type: e.target.value as TravelerInfoForm['travel_type'] })}
                    options={[
                        { value: 'solo', label: '🧑 Solo Traveler' },
                        { value: 'couple', label: '💑 Couple' },
                        { value: 'family', label: '👪 Family' },
                        { value: 'friends', label: '👯 Friends' },
                        { value: 'business', label: '💼 Business' },
                    ]}
                />
                <Select
                    label="Travel Pace"
                    value={data.travel_pace}
                    onChange={e => update({ travel_pace: e.target.value as TravelerInfoForm['travel_pace'] })}
                    options={[
                        { value: 'relaxed', label: '🌊 Relaxed — Take it easy' },
                        { value: 'moderate', label: '⚡ Moderate — Balanced mix' },
                        { value: 'intensive', label: '🚀 Intensive — See everything' },
                    ]}
                />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Compass className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <Toggle
                    checked={data.accessibility_needs}
                    onChange={checked => update({ accessibility_needs: checked })}
                    label="Accessibility Requirements"
                    description="Wheelchair access, limited mobility, or special needs"
                />
            </div>
        </div>
    );
}
