'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import PasswordStrength from '@/components/ui/PasswordStrength';
import PrismaticBurst from '@/components/animations/PrismaticBurst';
import { Logo } from '@/components/common/Logo';
import { getSupabaseBrowserClient } from '@/lib/db/supabase';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const supabase = useMemo(() => getSupabaseBrowserClient(), []);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        supabase.auth.getSession().then(({ data }) => {
            if (!active) {
                return;
            }

            if (!data.session) {
                setError('Reset link is invalid or expired. Request a new password reset email.');
            }

            setPageLoading(false);
        });

        return () => {
            active = false;
        };
    }, [supabase]);

    const validatePassword = (value: string) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
        return regex.test(value);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (!validatePassword(password)) {
            setError(
                'Password must be 8-16 characters and include uppercase, lowercase, a number, and a special character.'
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });

            if (updateError) {
                throw updateError;
            }

            setMessage('Password updated successfully. Redirecting to login...');
            setTimeout(() => {
                router.replace('/login');
            }, 1500);
        } catch (err) {
            const messageText =
                err instanceof Error ? err.message : 'Unable to update password.';
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
                    colors={['#A3FFD1', '#A3FFD1', '#000000']}
                    color0="#A3FFD1"
                    color1="#A3FFD1"
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
                        NEW PASSWORD
                    </span>
                </div>

                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                            Set a New Password
                        </h1>
                        <p className="text-base text-white/40">
                            Choose a strong password for your account.
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

                    {pageLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-white/60 sm:text-xs">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-white/30" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-16 w-full rounded-xl border border-white/10 bg-white/5 pl-14 pr-14 text-lg text-white placeholder:text-white/20 focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((current) => !current)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                    </button>
                                </div>
                                {password.length > 0 && <PasswordStrength password={password} />}
                            </div>

                            <div className="space-y-3">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-white/60 sm:text-xs">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-white/30" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-16 w-full rounded-xl border border-white/10 bg-white/5 pl-14 pr-14 text-lg text-white placeholder:text-white/20 focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((current) => !current)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                    </button>
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
                                        Update Password
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </main>
    );
}
