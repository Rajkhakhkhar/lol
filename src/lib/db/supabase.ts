import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getClient(): SupabaseClient {
    if (!_supabase) {
        if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
            throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        }
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase;
}

function getAdminClient(): SupabaseClient {
    if (!_supabaseAdmin) {
        if (supabaseServiceKey && isValidUrl(supabaseUrl)) {
            _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        } else {
            _supabaseAdmin = getClient();
        }
    }
    return _supabaseAdmin;
}

// Lazy-initialized Supabase instances — won't crash at import if env vars are missing
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return Reflect.get(getClient(), prop);
    },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return Reflect.get(getAdminClient(), prop);
    },
});

export default supabase;
