import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/db/supabase';

function getDisplayName(user: User) {
    const metadataName =
        typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name.trim()
            : '';

    if (metadataName) {
        return metadataName;
    }

    const emailPrefix = user.email?.split('@')[0]?.trim() ?? '';
    return emailPrefix || 'Traveler';
}

export async function ensureProfile(user: User) {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from('profiles').upsert(
        {
            id: user.id,
            email: user.email ?? '',
            full_name: getDisplayName(user),
        },
        { onConflict: 'id' }
    );

    if (error) {
        throw error;
    }
}
