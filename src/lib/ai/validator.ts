import { createLogger } from '../logger';
import type { ItineraryDay, ItineraryActivity, AIConstraintModel } from '@/types';
import { timeToMinutes } from '../utils';

const logger = createLogger('Validator');

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// ── Validate entire itinerary ────────────────────────────────
export function validateItinerary(
    days: ItineraryDay[],
    constraints: AIConstraintModel
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const day of days) {
        const dayResult = validateDay(day, constraints);
        errors.push(...dayResult.errors.map(e => `Day ${day.day_number}: ${e}`));
        warnings.push(...dayResult.warnings.map(w => `Day ${day.day_number}: ${w}`));
    }

    // Budget validation
    const totalCost = days.reduce((sum, d) => sum + d.daily_cost_estimate, 0);
    if (totalCost > constraints.budget.total) {
        errors.push(`Total cost ($${totalCost}) exceeds budget ($${constraints.budget.total})`);
    }

    // Check must-visit places are included
    const allActivities = days.flatMap(d => d.activities.map(a => a.name.toLowerCase()));
    for (const mustVisit of constraints.must_visit) {
        if (!allActivities.some(a => a.includes(mustVisit.toLowerCase()))) {
            warnings.push(`Must-visit place "${mustVisit}" not found in itinerary`);
        }
    }

    return { valid: errors.length === 0, errors, warnings };
}

// ── Validate single day ─────────────────────────────────────
function validateDay(day: ItineraryDay, constraints: AIConstraintModel): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const activities = day.activities;

    // Check activity limit
    const attractionCount = activities.filter(a => a.type === 'attraction').length;
    if (attractionCount > constraints.constraints.max_per_day) {
        errors.push(`${attractionCount} attractions exceeds limit of ${constraints.constraints.max_per_day}`);
    }

    // Check daily budget
    if (day.daily_cost_estimate > constraints.budget.daily_cap && constraints.budget.daily_cap > 0) {
        warnings.push(`Daily cost ($${day.daily_cost_estimate}) exceeds daily cap ($${constraints.budget.daily_cap})`);
    }

    // Check time conflicts
    for (let i = 0; i < activities.length - 1; i++) {
        const current = activities[i];
        const next = activities[i + 1];

        const currentEnd = timeToMinutes(current.end_time);
        const nextStart = timeToMinutes(next.start_time);

        if (currentEnd > nextStart) {
            errors.push(`Time conflict: "${current.name}" ends at ${current.end_time} but "${next.name}" starts at ${next.start_time}`);
        }
    }

    // Check opening hours for attractions
    for (const activity of activities) {
        if (activity.type === 'attraction' && activity.opening_hours) {
            const [openStr, closeStr] = activity.opening_hours.split('-');
            if (openStr && closeStr) {
                const activityStart = timeToMinutes(activity.start_time);
                const openTime = timeToMinutes(openStr.trim());
                const closeTime = timeToMinutes(closeStr.trim());

                if (activityStart < openTime) {
                    errors.push(`"${activity.name}" starts at ${activity.start_time} but opens at ${openStr.trim()}`);
                }
                if (timeToMinutes(activity.end_time) > closeTime) {
                    warnings.push(`"${activity.name}" may extend past closing time ${closeStr.trim()}`);
                }
            }
        }
    }

    // Check rest hours
    const totalActiveMinutes = activities.reduce((sum, a) => sum + a.duration_minutes, 0);
    const totalTravelMinutes = activities.reduce((sum, a) => sum + (a.travel_time_from_previous || 0), 0);
    const totalBusyHours = (totalActiveMinutes + totalTravelMinutes) / 60;
    const availableHours = 16; // assuming 8 hours sleep
    const restNeeded = constraints.constraints.rest_hours;

    if (totalBusyHours > availableHours - restNeeded) {
        warnings.push(`Day is too packed: ${totalBusyHours.toFixed(1)}h busy, needs ${restNeeded}h rest`);
    }

    return { valid: errors.length === 0, errors, warnings };
}

// ── Auto-fix minor issues ────────────────────────────────────
export function autoFixItinerary(days: ItineraryDay[]): ItineraryDay[] {
    return days.map(day => ({
        ...day,
        activities: fixTimeConflicts(day.activities),
    }));
}

function fixTimeConflicts(activities: ItineraryActivity[]): ItineraryActivity[] {
    const fixed = [...activities];

    for (let i = 1; i < fixed.length; i++) {
        const prev = fixed[i - 1];
        const curr = fixed[i];

        const prevEnd = timeToMinutes(prev.end_time);
        const travelBuffer = curr.travel_time_from_previous || 15;
        const currStart = timeToMinutes(curr.start_time);

        if (prevEnd + travelBuffer > currStart) {
            const newStart = prevEnd + travelBuffer;
            const h = Math.floor(newStart / 60);
            const m = newStart % 60;
            fixed[i] = {
                ...curr,
                start_time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
                end_time: (() => {
                    const endMin = newStart + curr.duration_minutes;
                    const eh = Math.floor(endMin / 60);
                    const em = endMin % 60;
                    return `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
                })(),
            };
        }
    }

    return fixed;
}
