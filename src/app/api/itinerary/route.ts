import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { destination, days, budget } = await req.json();

        if (!destination || !days || !budget) {
            return NextResponse.json(
                { error: 'Missing required fields: destination, days, budget' },
                { status: 400 }
            );
        }

        // Pool of sample activities to pick from
        const activityPool = [
            'Visit main attraction',
            'Local food tour',
            'Museum visit',
            'Evening city walk',
            'Historical landmark tour',
            'Shopping at local markets',
            'Scenic viewpoint hike',
            'Boat ride or water activity',
            'Cultural show or performance',
            'Try street food specialties',
            'Visit a local park or garden',
            'Photography walk',
            'Cooking class',
            'Temple or monument visit',
            'Sunset viewing spot',
        ];

        // Generate a plan for each day
        const plan = Array.from({ length: Number(days) }, (_, i) => {
            const startIdx = (i * 2) % activityPool.length;
            const activities = [
                activityPool[startIdx],
                activityPool[(startIdx + 1) % activityPool.length],
            ];
            return { day: i + 1, activities };
        });

        const itinerary = {
            destination,
            days: Number(days),
            budget: Number(budget),
            plan,
        };

        return NextResponse.json(itinerary);
    } catch {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
