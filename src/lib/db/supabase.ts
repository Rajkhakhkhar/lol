import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

function assertPublicConfig() {
    if (!isValidUrl(supabaseUrl) || !supabasePublishableKey) {
        throw new Error(
            'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
        );
    }
}

let browserClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function createBrowserSupabaseClient() {
    assertPublicConfig();

    return createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
}

export function getSupabaseBrowserClient() {
    if (!browserClient) {
        browserClient = createBrowserSupabaseClient();
    }

    return browserClient;
}

function getServiceClient() {
    if (!serviceClient) {
        if (supabaseServiceKey && isValidUrl(supabaseUrl)) {
            serviceClient = createClient(supabaseUrl, supabaseServiceKey);
        } else {
            serviceClient = getSupabaseBrowserClient();
        }
    }

    return serviceClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return Reflect.get(getSupabaseBrowserClient(), prop);
    },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return Reflect.get(getServiceClient(), prop);
    },
});

export default supabase;
