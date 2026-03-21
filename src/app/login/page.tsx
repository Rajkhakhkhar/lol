'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import PrismaticBurst from '@/components/animations/PrismaticBurst';
import PasswordStrength from '@/components/ui/PasswordStrength';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        return email.toLowerCase().endsWith('@gmail.com');
    };

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
        return regex.test(password);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateEmail(email)) {
            setError("Email must be a valid @gmail.com address");
            return;
        }

        if (!validatePassword(password)) {
            setError("Password must be 8-16 characters and include uppercase, lowercase, a number, and a special character.");
            return;
        }

        setLoading(true);
        
        // Mock authentication
        setTimeout(() => {
            localStorage.setItem('isLoggedIn', 'true');
            setLoading(false);
            router.push('/trip/plan');
        }, 1000);
    };

    return (
        <main className="flex-1 min-h-screen relative overflow-hidden font-sans flex items-center justify-center px-4">
            {/* Background Layer */}
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
                    colors={['#FFA3A3', '#FFA3A3', '#000000']}
                    color0="#FFA3A3"
                    color1="#FFA3A3"
                    color2="#000000"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-[720px] p-8 sm:p-16 md:p-24 rounded-[32px] sm:rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-4xl my-8"
            >
                <div className="flex justify-center mb-8 sm:mb-12">
                    <div className="flex flex-col items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg overflow-hidden">
                            <img src="/logo.png" alt="Eyekon Logo" className="w-full h-full object-cover filter brightness-0 invert logo-blink" />
                        </div>
                        <span className="text-xl sm:text-3xl font-bold text-white tracking-[4px] sm:tracking-[8px]">EYEKON</span>
                    </div>
                </div>

                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Secure Access</h1>
                    <p className="text-white/40 text-base sm:text-lg">Login with your Google account credentials</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] sm:text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-white/30" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@gmail.com"
                                className="w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-all text-base sm:text-lg"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] sm:text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-white/30" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500 transition-all text-base sm:text-lg"
                            />
                        </div>
                        {password.length > 0 && <PasswordStrength password={password} />}
                        <div className="flex justify-end mt-1.5">
                            <Link 
                                href="/forgot-password" 
                                className="text-sm sm:text-base text-white/40 hover:text-white transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm sm:text-base"
                        >
                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 sm:h-16 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 sm:mt-8 shadow-2xl text-lg sm:text-xl"
                    >
                        {loading ? (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>Sign In <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" /></>
                        )}
                    </button>
                </form>

                <div className="mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-white/5 text-center">
                    <p className="text-sm sm:text-base text-white/30">
                        Don't have an account? {' '}
                        <button className="text-white font-bold hover:text-blue-400 transition-colors">Contact Admin</button>
                    </p>
                </div>
            </motion.div>
            
            <p className="text-[10px] text-white/10 uppercase tracking-[4px] absolute bottom-8">EYEKON Security Systems © 2026</p>
        </main>
    );
}
