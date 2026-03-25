'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PrismaticBurst from '@/components/animations/PrismaticBurst';
import { Logo } from '@/components/common/Logo';
import { getSupabaseBrowserClient } from '@/lib/db/supabase';

export default function ForgotPasswordPage() {
    const supabase = useMemo(() => getSupabaseBrowserClient(), []);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            const redirectTo =
                typeof window !== 'undefined'
                    ? `${window.location.origin}/update-password`
                    : undefined;

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (resetError) {
                throw resetError;
            }

            setMessage('Password reset email sent. Open the email link on this device to choose a new password.');
        } catch (err) {
            const messageText =
                err instanceof Error ? err.message : 'Unable to send reset email.';
            setError(messageText);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center overflow-hidden px-4">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <PrismaticBurst
                    animationType="rotate3d"
                    intensity={0.8}
                    speed={1.5}
                    distort={0}
                    paused={false}
                    offset={{ x: 0, y: 0 }}
                    hoverDampness={0.25}
                    rayCount={0}
                    mixBlendMode="lighten"
                    colors={['#A3A3FF', '#A3A3FF', '#000000']}
                    color0="#A3A3FF"
                    color1="#A3A3FF"
                    color2="#000000"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-[600px] rounded-[48px] border border-white/10 bg-white/5 p-8 shadow-4xl backdrop-blur-3xl sm:p-12 md:p-16"
            >
                <div className="mb-10 flex justify-center">
                    <Logo size="md" showText={false} />
                    <span className="ml-4 self-center text-xl font-bold tracking-[4px] text-white">
                        PASSWORD RECOVERY
                    </span>
                </div>

                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                            Reset Password
                        </h1>
                        <p className="text-base text-white/40">
                            Enter your account email and we will send you a secure reset link.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            <span>{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-white/60 sm:text-xs">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-white/30" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="h-16 w-full rounded-xl border border-white/10 bg-white/5 pl-14 pr-4 text-lg text-white placeholder:text-white/20 focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-white text-lg font-bold text-black shadow-2xl transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                            ) : (
                                <>
                                    Send Reset Link
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-10 border-t border-white/5 pt-10 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
                    >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
