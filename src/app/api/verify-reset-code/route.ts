import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/authStore';

export async function POST(req: Request) {
    try {
        const { identifier, code } = await req.json();

        if (!identifier || !code) {
            return NextResponse.json({ success: false, error: 'Identifier and code are required' }, { status: 400 });
        }

        const storedData = otpStore.get(identifier);

        if (!storedData) {
            return NextResponse.json({ success: false, error: 'No reset code found for this user' }, { status: 400 });
        }

        if (storedData.expires < Date.now()) {
            otpStore.delete(identifier);
            return NextResponse.json({ success: false, error: 'Reset code expired' }, { status: 400 });
        }

        if (storedData.code !== code) {
            return NextResponse.json({ success: false, error: 'Invalid reset code' }, { status: 400 });
        }

        // Code is valid! We don't delete it yet, we'll need it for the actual reset.
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error verifying reset code:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
