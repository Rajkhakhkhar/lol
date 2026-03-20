'use client';

import { Input, Select, Toggle } from '@/components/ui';
import type { TravelerInfoForm } from '@/types';
import { Users, Baby, Compass, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    data: TravelerInfoForm;
    onChange: (data: TravelerInfoForm) => void;
}

export default function TravelerInfoStep({ data, onChange }: Props) {
    const update = (field: Partial<TravelerInfoForm>) => onChange({ ...data, ...field });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#2a2a2a] flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
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
                <div className="p-4 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-3">
                    <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-blue-500" />
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

            <div className={cn(
                "p-4 rounded-xl transition-all duration-300 border flex flex-col gap-3",
                data.accessibility_needs 
                    ? "bg-blue-500/5 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "bg-[#202020] border-[#2a2a2a]"
            )}>
                <div className="flex items-center gap-3">
                    <Compass className={cn("w-5 h-5 flex-shrink-0 transition-colors", data.accessibility_needs ? "text-blue-500" : "text-[#7a7a7a]")} />
                    <Toggle
                        checked={data.accessibility_needs}
                        onChange={checked => update({ accessibility_needs: checked })}
                        label="Accessibility Requirements"
                        description="Wheelchair access, limited mobility, or special needs"
                    />
                </div>
                
                {data.accessibility_needs && (
                    <div className="flex items-center gap-2 pl-8 pr-2 py-1 select-none animate-in fade-in slide-in-from-top-1 duration-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-xs text-blue-100/60 italic font-medium">
                            Setting priority: We will highlight accessible transport and recommend optimized routes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
