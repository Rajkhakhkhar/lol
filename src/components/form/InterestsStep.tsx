'use client';

import { useState } from 'react';
import { Input, Select, TagSelector } from '@/components/ui';
import type { InterestsForm, InterestTag } from '@/types';
import { INTEREST_TAGS } from '@/types';
import { Heart, Star, Plus, X } from 'lucide-react';

interface Props {
    data: InterestsForm;
    onChange: (data: InterestsForm) => void;
}

export default function InterestsStep({ data, onChange }: Props) {
    const update = (field: Partial<InterestsForm>) => onChange({ ...data, ...field });
    const [mustVisitInput, setMustVisitInput] = useState('');

    const addMustVisit = () => {
        if (mustVisitInput.trim() && !data.must_visit_places.includes(mustVisitInput.trim())) {
            update({ must_visit_places: [...data.must_visit_places, mustVisitInput.trim()] });
            setMustVisitInput('');
        }
    };

    const removeMustVisit = (place: string) => {
        update({ must_visit_places: data.must_visit_places.filter(p => p !== place) });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-pink-600/20 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Your Interests</h2>
                    <p className="text-sm text-white/50">What kind of experiences are you looking for?</p>
                </div>
            </div>

            {/* Interest Tags */}
            <TagSelector
                label="Select your interests (pick as many as you like)"
                options={INTEREST_TAGS as unknown as string[]}
                selected={data.interests as string[]}
                onChange={selected => update({ interests: selected as InterestTag[] })}
            />

            {data.interests.length > 0 && (
                <p className="text-sm text-violet-400">
                    ✨ {data.interests.length} interest{data.interests.length > 1 ? 's' : ''} selected
                </p>
            )}

            {/* Must Visit Places */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Star className="w-4 h-4 text-amber-400" />
                    Must-Visit Places
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g., Eiffel Tower, Tokyo Skytree..."
                        value={mustVisitInput}
                        onChange={e => setMustVisitInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMustVisit())}
                        className="flex-1"
                    />
                    <button
                        type="button"
                        onClick={addMustVisit}
                        className="h-11 w-11 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>
                {data.must_visit_places.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.must_visit_places.map(place => (
                            <span
                                key={place}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium border border-amber-500/30"
                            >
                                <Star className="w-3 h-3" />
                                {place}
                                <button
                                    type="button"
                                    onClick={() => removeMustVisit(place)}
                                    className="ml-1 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                    label="Environment Preference"
                    value={data.environment_preference}
                    onChange={e => update({ environment_preference: e.target.value as InterestsForm['environment_preference'] })}
                    options={[
                        { value: 'indoor', label: '🏛️ Indoor Activities' },
                        { value: 'outdoor', label: '🏔️ Outdoor Adventures' },
                        { value: 'mixed', label: '🔀 Mix of Both' },
                    ]}
                />
                <Select
                    label="Preferred Time of Day"
                    value={data.time_preference}
                    onChange={e => update({ time_preference: e.target.value as InterestsForm['time_preference'] })}
                    options={[
                        { value: 'morning', label: '🌅 Morning Person' },
                        { value: 'afternoon', label: '☀️ Afternoon Explorer' },
                        { value: 'evening', label: '🌙 Night Owl' },
                        { value: 'flexible', label: '⏰ Flexible / Any time' },
                    ]}
                />
            </div>
        </div>
    );
}
