import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/authStore';

export async function POST(req: Request) {
    try {
        const { identifier, code, newPassword } = await req.json();

        if (!identifier || !code || !newPassword) {
            return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
        }

        const storedData = otpStore.get(identifier);

        if (!storedData || storedData.code !== code || storedData.expires < Date.now()) {
            return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 400 });
        }

        // --- PASSWORD RESET LOGIC ---
        // In a real app, update the user in your database (e.g. Supabase, MongoDB, Postgres).
        // Since we're using mock auth, we'll just log it.
        console.log(`[AUTH] Password for ${identifier} successfully reset to: ${newPassword}`);
        
        // After successful reset, clear the OTP store
        otpStore.delete(identifier);

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Error resetting password:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
