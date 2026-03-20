import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { otpStore } from '@/lib/authStore';

export async function POST(req: Request) {
    try {
        const { method, identifier } = await req.json();

        if (!identifier) {
            return NextResponse.json({ success: false, error: 'Identifier is required' }, { status: 400 });
        }

        // Generate a random 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        otpStore.set(identifier, { code: otpCode, expires });

        // --- DEVELOPMENT / FALLBACK LOGIC ---
        // If API keys are missing, we log the OTP to the console and return success 
        // to allow frontend testing without real service credentials.
        const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;
        const isTwilioConfigured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER;

        console.log(`[AUTH DEBUG] Recovery Code for ${identifier}: ${otpCode}`);

        if (method === 'email') {
            if (!isEmailConfigured) {
                console.warn(`[AUTH WARNING] Email credentials missing. OTP ${otpCode} logged to console only.`);
                return NextResponse.json({ success: true, debug: true, message: 'Code sent (Debug Mode)' });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: `"EYEKON Security" <${process.env.EMAIL_USER}>`,
                to: identifier,
                subject: "Your Password Recovery Code",
                text: `Your recovery code is: ${otpCode}. This code will expire in 10 minutes.`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; background: #0a0a0a; color: white;">
                        <h2 style="color: #4f8cff; letter-spacing: 2px;">EYEKON SECURITY</h2>
                        <p style="font-size: 16px;">Someone requested a password reset for your account.</p>
                        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: white;">${otpCode}</span>
                        </div>
                        <p style="color: #666;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                    </div>
                `,
            });
        } else if (method === 'phone') {
            if (!isTwilioConfigured) {
                console.warn(`[AUTH WARNING] Twilio credentials missing. OTP ${otpCode} logged to console only.`);
                return NextResponse.json({ success: true, debug: true, message: 'Code sent (Debug Mode)' });
            }

            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );

            await client.messages.create({
                body: `Your EYEKON recovery code is: ${otpCode}. It expires in 10 mins.`,
                to: identifier,
                from: process.env.TWILIO_PHONE_NUMBER,
            });
        } else if (method === 'pin') {
            // For PIN recovery, normally you'd check if the identifier exists and has a PIN.
            // For this demo/safe-update, we'll assume the identifier is valid.
            console.log(`[AUTH DEBUG] PIN recovery initiated for ${identifier}`);
        } else {
            return NextResponse.json({ success: false, error: 'Invalid recovery method' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error sending reset code:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
