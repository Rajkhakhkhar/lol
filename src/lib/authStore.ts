// This is a global variable to persist between API calls on the dev server.
// In production, use Redis or a real database (like Supabase).
const globalAny: any = global;

if (!globalAny.otpStore) {
    globalAny.otpStore = new Map<string, { code: string; expires: number }>();
}

export const otpStore = globalAny.otpStore;
