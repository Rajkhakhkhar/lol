'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Badge } from '@/components/ui';
import { Sparkles, MapPin, Landmark, TreePine, Utensils, Theater, ShoppingBag, Mountain, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Place {
    placeName: string;
    shortDescription: string;
    category: string;
}

interface PlaceSuggestionsProps {
    city: string;
    country: string;
    onSelect?: (placeName: string) => void;
    className?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
    landmark: Landmark,
    nature: TreePine,
    food: Utensils,
    culture: Theater,
    shopping: ShoppingBag,
    adventure: Mountain,
};

const CATEGORY_COLORS: Record<string, string> = {
    landmark: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    nature: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    food: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    culture: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    shopping: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    adventure: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
};

export default function PlaceSuggestions({ city, country, onSelect, className }: PlaceSuggestionsProps) {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFallback, setIsFallback] = useState(false);

    const fetchSuggestions = useCallback(async () => {
        if (!city || !country) return;
        
        console.log(`PlaceSuggestions: Fetching for ${city}, ${country}`);
        setLoading(true);
        setIsFallback(false);
        
        try {
            const res = await fetch('/api/api/ai-place-suggestions', { // Note: some users might have nested routes, fixing paths if needed
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city, country }),
            });
            
            // Try/Catch res.json as requested
            let data: any = {};
            try {
                // If the path was /api/ai-place-suggestions
                const response = res.ok ? res : await fetch('/api/ai-place-suggestions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ city, country }),
                });
                data = await response.json();
            } catch (jsonErr) {
                console.error('PlaceSuggestions: JSON parse failed', jsonErr);
            }
            
            if (data.places && Array.isArray(data.places)) {
                setPlaces(data.places);
                setIsFallback(data.isFallback || false);
            }
        } catch (err: any) {
            console.error('PlaceSuggestions Catch Error:', err.message);
        } finally {
            setLoading(false);
        }
    }, [city, country]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    if (!city || !country) return null;

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="text-xs font-bold text-white/50 tracking-wider uppercase">
                    Smart Recommendations {isFallback && "(General)"}
                </h3>
            </div>

            {loading ? (
                <div className="flex flex-wrap gap-2 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-8 w-24 rounded-full bg-white/5 border border-white/5" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {places.map((place, i) => {
                        const Icon = CATEGORY_ICONS[place.category?.toLowerCase()] || MapPin;
                        return (
                            <button
                                key={place.placeName + i}
                                type="button"
                                onClick={() => onSelect?.(place.placeName)}
                                className={cn(
                                    "group flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-neutral-800 transition-all duration-300",
                                    "hover:border-blue-500/50 hover:bg-neutral-700 hover:scale-105 active:scale-95 shadow-sm",
                                    "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
                                )}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <Icon className="w-3 h-3 text-blue-500 group-hover:text-blue-400 transition-colors" />
                                <span className="text-xs font-medium text-white/90 group-hover:text-white">
                                    {place.placeName}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}