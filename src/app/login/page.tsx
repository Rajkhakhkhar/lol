'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    Mail,
    User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import PrismaticBurst from '@/components/animations/PrismaticBurst';
import PasswordStrength from '@/components/ui/PasswordStrength';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/components/auth/AuthProvider';
import { ensureProfile } from '@/lib/db/profiles';
import { getSupabaseBrowserClient } from '@/lib/db/supabase';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const supabase = useMemo(() => getSupabaseBrowserClient(), []);

    const [mode, setMode] = useState<AuthMode>('login');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            router.replace('/trip/plan');
        }
    }, [authLoading, router, user]);

    useEffect(() => {
        const verified = new URLSearchParams(window.location.search).get('verified');
        if (verified === '1') {
            setMode('login');
            setMessage('Email verified. If you are not redirected automatically, sign in once.');
        }
    }, []);

    const validatePassword = (value: string) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
        return regex.test(value);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            if (mode === 'signup') {
                if (!fullName.trim()) {
                    setError('Full name is required.');
                    return;
                }

                if (!validatePassword(password)) {
                    setError(
                        'Password must be 8-16 characters and include uppercase, lowercase, a number, and a special character.'
                    );
                    return;
                }

                const redirectTo =
                    typeof window !== 'undefined'
                        ? `${window.location.origin}/login?verified=1`
                        : undefined;

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName.trim() },
                        emailRedirectTo: redirectTo,
                    },
                });

                if (signUpError) {
                    throw signUpError;
                }

                if (data.session && data.user) {
                    await ensureProfile(data.user);
                    router.replace('/trip/plan');
                    return;
                }

                setMode('login');
                setPassword('');
                setShowPassword(false);
                setMessage(
                    'Confirmation email sent. Open the link from the same device/browser, then sign in if you are not redirected.'
                );
                return;
            }

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                throw signInError;
            }

            if (data.user) {
                await ensureProfile(data.user);
            }

            router.replace('/trip/plan');
        } catch (err) {
            const messageText =
                err instanceof Error ? err.message : 'Unable to complete authentication.';
            setError(messageText);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </main>
        );
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 sm:py-8">
            <div className="fixed inset-0 z-0 pointer-events-none">
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
                    colors={['#FFA3A3', '#FFA3A3', '#000000']}
                    color0="#FFA3A3"
                    color1="#FFA3A3"
                    color2="#000000"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-[660px] rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-4xl backdrop-blur-3xl sm:rounded-[40px] sm:p-6 md:p-8"
            >
                <div className="mb-6 flex justify-center sm:mb-8">
                    <Logo size="lg" />
                </div>

                <div className="mb-6 text-center sm:mb-8">
                    <div className="mx-auto mb-5 inline-flex rounded-full border border-white/10 bg-black/20 p-1">
                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                                mode === 'login'
                                    ? 'bg-white text-black'
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('signup')}
                            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                                mode === 'signup'
                                    ? 'bg-white text-black'
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <h1 className="mb-2 text-2xl font-bold text-white sm:mb-4 sm:text-4xl">
                        {mode === 'login' ? 'Secure Access' : 'Create Your Account'}
                    </h1>
                    <p className="text-base text-white/40 sm:text-lg">
                        {mode === 'login'
                            ? 'Sign in to continue planning and managing your trips.'
                            : 'Create an account to save your travel planning progress.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    {mode === 'signup' && (
                        <div className="space-y-3">
                            <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-white/60 sm:text-xs">
                                Full Name
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 sm:h-6 sm:w-6" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your name"
                                    className="h-[52px] w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-base text-white placeholder:text-white/20 focus:border-blue-500 focus:outline-none transition-all sm:h-14 sm:pl-14 sm:text-lg"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-white/60 sm:text-xs">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 sm:h-6 sm:w-6" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="h-[52px] w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-base text-white placeholder:text-white/20 focus:border-blue-500 focus:outline-none transition-all sm:h-14 sm:pl-14 sm:text-lg"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-white/60 sm:text-xs">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 sm:h-6 sm:w-6" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-[52px] w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-14 text-base text-white placeholder:text-white/20 focus:border-pink-500 focus:outline-none transition-all sm:h-14 sm:pl-14 sm:pr-16 sm:text-lg"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
                                ) : (
                                    <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                                )}
                            </button>
                        </div>
                        {mode === 'signup' && password.length > 0 && (
                            <PasswordStrength password={password} />
                        )}
                        {mode === 'login' && (
                            <div className="mt-1.5 flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-white/40 transition-colors hover:text-white sm:text-base"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        )}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 sm:text-base"
                        >
                            <AlertCircle className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300 sm:text-base"
                        >
                            {message}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-white text-lg font-bold text-black shadow-2xl transition-all hover:bg-blue-50 active:scale-[0.98] disabled:opacity-50 sm:mt-4 sm:h-14 sm:text-xl"
                    >
                        {loading ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black sm:h-8 sm:w-8" />
                        ) : (
                            <>
                                {mode === 'login' ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 border-t border-white/5 pt-6 text-center sm:mt-8 sm:pt-8">
                    <p className="text-sm text-white/30 sm:text-base">
                        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button
                            type="button"
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="font-bold text-white transition-colors hover:text-blue-400"
                        >
                            {mode === 'login' ? 'Sign up here' : 'Log in'}
                        </button>
                    </p>
                </div>
            </motion.div>

            <p className="absolute bottom-8 text-[10px] uppercase tracking-[1px] text-white/10 sm:tracking-[4px]">
                EYEKON Security Systems © 2026
            </p>
        </main>
    );
}
