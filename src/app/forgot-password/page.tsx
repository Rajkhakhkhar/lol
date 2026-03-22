'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, Mail, Phone, Lock, AlertCircle, Key, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import PrismaticBurst from '@/components/animations/PrismaticBurst';
import PasswordStrength from '@/components/ui/PasswordStrength';
import { Logo } from '@/components/common/Logo';

type RecoveryMethod = 'email' | 'phone' | 'pin';

/**
 * ForgotPasswordPage Component
 * 
 * Provides a 3-step password recovery flow:
 * 1. Method Selection & Identifier Input (Email, Phone, or PIN)
 * 2. OTP/Code Verification
 * 3. New Password Submission
 * 
 * Safety Features:
 * - Relative API paths for environment compatibility.
 * - Loading states for all asynchronous actions.
 * - Comprehensive error handling for network and logic failures.
 * - Automatic redirect to login upon success.
 */
export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [method, setMethod] = useState<RecoveryMethod>('email');
    const [identifier, setIdentifier] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/send-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method, identifier }),
            });

            const data = await res.json();
            if (data.success) {
                setStep(2);
            } else {
                setError(data.error || 'Failed to send code');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/verify-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method, identifier, code }),
            });

            const data = await res.json();
            if (data.success) {
                setStep(3);
            } else {
                setError(data.error || 'Invalid code');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method, identifier, code, newPassword }),
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 min-h-screen relative overflow-hidden font-sans flex items-center justify-center px-4">
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
                className="relative z-10 w-full max-w-[600px] p-8 sm:p-12 md:p-16 rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-4xl my-8"
            >
                <div className="flex justify-center mb-10">
                    <Logo size="md" showText={false} />
                    <span className="text-xl font-bold text-white tracking-[4px] ml-4 self-center">PASSWORD RECOVERY</span>
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-10"
                        >
                            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Password reset!</h2>
                            <p className="text-white/60 text-lg mb-8">Redirecting you to login...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    {step === 1 ? 'Recover Password' : step === 2 ? 'Verify Identity' : 'Set New Password'}
                                </h1>
                                <p className="text-white/40 text-base">
                                    {step === 1 ? 'Choose your preferred recovery method' : step === 2 ? `Enter the code sent to your ${method}` : 'Create a strong new password'}
                                </p>
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            {step === 1 && (
                                <form onSubmit={handleSendCode} className="space-y-6">
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['email', 'phone', 'pin'] as RecoveryMethod[]).map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setMethod(m)}
                                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === m ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'}`}
                                            >
                                                {m === 'email' && <Mail className="w-6 h-6" />}
                                                {m === 'phone' && <Phone className="w-6 h-6" />}
                                                {m === 'pin' && <Key className="w-6 h-6" />}
                                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{m}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] sm:text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">
                                            {method === 'email' ? 'Email Address' : method === 'phone' ? 'Phone Number' : 'Account Identifier'}
                                        </label>
                                        <div className="relative">
                                            {method === 'phone' ? <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30" /> : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30" />}
                                            <input
                                                type={method === 'email' ? 'email' : 'text'}
                                                required
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                placeholder={method === 'email' ? 'name@gmail.com' : method === 'phone' ? '+1 (555) 000-0000' : 'Enter identifier'}
                                                className="w-full h-16 pl-14 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-all text-lg"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl text-lg"
                                    >
                                        {loading ? <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <>Send Code <ArrowRight className="w-5 h-5" /></>}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleVerifyCode} className="space-y-6">
                                    <div className="space-y-3 text-center">
                                        <label className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-wider">Recovery Code</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="000000"
                                            className="w-full h-20 text-center text-4xl font-mono tracking-[1rem] rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500 transition-all mb-4"
                                            autoFocus
                                        />
                                        <p className="text-sm text-white/30">
                                            Didn't receive the code? {' '}
                                            <button type="button" onClick={() => setStep(1)} className="text-white hover:text-blue-400 transition-colors font-bold uppercase text-[10px] tracking-wider ml-1">Change Method</button>
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl text-lg"
                                    >
                                        {loading ? <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Verify Code'}
                                    </button>
                                </form>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] sm:text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full h-16 pl-14 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-all text-lg"
                                                />
                                            </div>
                                            {newPassword.length > 0 && <PasswordStrength password={newPassword} />}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] sm:text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Confirm New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full h-16 pl-14 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-all text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl text-lg"
                                    >
                                        {loading ? <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Update Password'}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-10 pt-10 border-t border-white/5 text-center">
                    <Link href="/login" className="text-sm font-bold text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 group">
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
