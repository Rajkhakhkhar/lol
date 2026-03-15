'use client';

import { Input, Select } from '@/components/ui';
import type { TravelLogisticsForm } from '@/types';
import { MapPin, Plane, Hotel, Car } from 'lucide-react';

const citiesByCountry: Record<string, string[]> = {
    India: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Goa'],
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco', 'Las Vegas', 'Washington D.C.', 'Seattle', 'Boston'],
    'United Kingdom': ['London', 'Manchester', 'Liverpool', 'Birmingham', 'Edinburgh', 'Glasgow', 'Bristol', 'Oxford', 'Cambridge'],
    France: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse', 'Bordeaux', 'Strasbourg'],
    Germany: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Dresden'],
    Italy: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Turin', 'Bologna'],
    Spain: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Granada', 'Bilbao'],
    Canada: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary', 'Quebec City'],
    Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
    Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka'],
    China: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Xian'],
    Brazil: ['Rio de Janeiro', 'Sao Paulo', 'Brasilia', 'Salvador', 'Fortaleza'],
    Mexico: ['Mexico City', 'Cancun', 'Guadalajara', 'Monterrey', 'Playa del Carmen'],
    Russia: ['Moscow', 'Saint Petersburg', 'Kazan', 'Sochi', 'Novosibirsk'],
    'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Stellenbosch'],
    Indonesia: ['Jakarta', 'Bali', 'Yogyakarta', 'Surabaya', 'Bandung'],
    Thailand: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi'],
    UAE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
    Singapore: ['Singapore'],
    Switzerland: ['Zurich', 'Geneva', 'Bern', 'Lucerne', 'Interlaken', 'Basel'],
};

interface Props {
    data: TravelLogisticsForm;
    onChange: (data: TravelLogisticsForm) => void;
}

export default function TravelLogisticsStep({ data, onChange }: Props) {
    const update = (field: Partial<TravelLogisticsForm>) => onChange({ ...data, ...field });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#2a2a2a] flex items-center justify-center">
                    <Plane className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Travel Logistics</h2>
                    <p className="text-sm text-white/50">Where and when are you going?</p>
                </div>
            </div>

            {/* Destination */}
            <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Destination
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        label="Country"
                        value={data.destination_country}
                        onChange={e => update({ destination_country: e.target.value, destination_city: '' })}
                        options={[
                            { value: '', label: 'Select a country' },
                            { value: 'India', label: 'India' },
                            { value: 'United States', label: 'United States' },
                            { value: 'United Kingdom', label: 'United Kingdom' },
                            { value: 'France', label: 'France' },
                            { value: 'Germany', label: 'Germany' },
                            { value: 'Italy', label: 'Italy' },
                            { value: 'Spain', label: 'Spain' },
                            { value: 'Canada', label: 'Canada' },
                            { value: 'Australia', label: 'Australia' },
                            { value: 'Japan', label: 'Japan' },
                            { value: 'China', label: 'China' },
                            { value: 'Brazil', label: 'Brazil' },
                            { value: 'Mexico', label: 'Mexico' },
                            { value: 'Russia', label: 'Russia' },
                            { value: 'South Africa', label: 'South Africa' },
                            { value: 'Indonesia', label: 'Indonesia' },
                            { value: 'Thailand', label: 'Thailand' },
                            { value: 'UAE', label: 'UAE' },
                            { value: 'Singapore', label: 'Singapore' },
                            { value: 'Switzerland', label: 'Switzerland' },
                        ]}
                    />
                    <Select
                        label="City"
                        value={data.destination_city}
                        onChange={e => update({ destination_city: e.target.value })}
                        disabled={!data.destination_country}
                        options={[
                            { value: '', label: data.destination_country ? 'Select a city' : 'Select country first' },
                            ...(citiesByCountry[data.destination_country] || []).map(c => ({ value: c, label: c })),
                        ]}
                    />
                </div>
            </div>

            {/* Dates */}
            <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Plane className="w-4 h-4 text-pink-500" />
                    Dates & Times
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Arrival Date & Time"
                        type="datetime-local"
                        value={data.arrival_datetime}
                        onChange={e => update({ arrival_datetime: e.target.value })}
                    />
                    <Input
                        label="Departure Date & Time"
                        type="datetime-local"
                        value={data.departure_datetime}
                        onChange={e => update({ departure_datetime: e.target.value })}
                    />
                </div>
            </div>

            {/* Hotel */}
            <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Hotel className="w-4 h-4 text-blue-500" />
                    Hotel
                </div>
                <Input
                    label="Hotel Location / Name"
                    placeholder="e.g., Shinjuku Granbell Hotel, Tokyo"
                    value={data.hotel_location}
                    onChange={e => update({ hotel_location: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Check-in Time"
                        type="time"
                        value={data.hotel_checkin_time}
                        onChange={e => update({ hotel_checkin_time: e.target.value })}
                    />
                    <Input
                        label="Check-out Time"
                        type="time"
                        value={data.hotel_checkout_time}
                        onChange={e => update({ hotel_checkout_time: e.target.value })}
                    />
                </div>
            </div>

            {/* Transport */}
            <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Car className="w-4 h-4 text-pink-500" />
                    Transport
                </div>
                <Select
                    label="Primary Transport Mode"
                    value={data.transport_mode}
                    onChange={e => update({ transport_mode: e.target.value as TravelLogisticsForm['transport_mode'] })}
                    options={[
                        { value: 'walking', label: '🚶 Walking' },
                        { value: 'public_transport', label: '🚇 Public Transport' },
                        { value: 'car', label: '🚗 Rental Car' },
                        { value: 'taxi', label: '🚕 Taxi / Rideshare' },
                        { value: 'mixed', label: '🔀 Mixed' },
                    ]}
                />
            </div>
        </div>
    );
}
