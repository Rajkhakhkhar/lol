import * as React from "react";
import { cn } from "@/lib/utils";

// ── Button ───────────────────────────────────────────────────
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const variants: Record<string, string> = {
            default: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25',
            secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
            outline: 'border border-white/20 text-white hover:bg-white/5',
            ghost: 'text-white/70 hover:text-white hover:bg-white/5',
            destructive: 'bg-red-600 text-white hover:bg-red-700',
        };
        const sizes: Record<string, string> = {
            default: 'h-11 px-6 py-2.5',
            sm: 'h-9 px-4 text-sm',
            lg: 'h-12 px-8 text-lg',
            icon: 'h-10 w-10',
        };
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

// ── Input ────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => (
        <div className="space-y-1.5">
            {label && <label className="text-sm font-medium text-white/80">{label}</label>}
            <input
                ref={ref}
                className={cn(
                    'flex h-11 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 transition-all duration-200',
                    'border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none',
                    'backdrop-blur-sm',
                    error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    )
);
Input.displayName = 'Input';

// ── Select ───────────────────────────────────────────────────
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => (
        <div className="space-y-1.5">
            {label && <label className="text-sm font-medium text-white/80">{label}</label>}
            <select
                ref={ref}
                className={cn(
                    'flex h-11 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-white transition-all duration-200 appearance-none cursor-pointer',
                    'border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none',
                    'backdrop-blur-sm',
                    error && 'border-red-500/50',
                    className
                )}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    )
);
Select.displayName = 'Select';

// ── Toggle / Switch ──────────────────────────────────────────
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className="flex items-center justify-between w-full p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
        >
            <div className="text-left">
                {label && <p className="text-sm font-medium text-white">{label}</p>}
                {description && <p className="text-xs text-white/50 mt-0.5">{description}</p>}
            </div>
            <div className={cn(
                'w-11 h-6 rounded-full transition-all duration-300 relative',
                checked ? 'bg-violet-600' : 'bg-white/10'
            )}>
                <div className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300',
                    checked ? 'left-[22px]' : 'left-0.5'
                )} />
            </div>
        </button>
    );
}

// ── Card ─────────────────────────────────────────────────────
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// ── Badge ────────────────────────────────────────────────────
interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error';
    className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants: Record<string, string> = {
        default: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
        success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        error: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return (
        <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}

// ── Tag Selector ─────────────────────────────────────────────
interface TagSelectorProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label?: string;
}

export function TagSelector({ options, selected, onChange, label }: TagSelectorProps) {
    const toggle = (tag: string) => {
        onChange(
            selected.includes(tag)
                ? selected.filter(t => t !== tag)
                : [...selected, tag]
        );
    };

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium text-white/80">{label}</label>}
            <div className="flex flex-wrap gap-2">
                {options.map(tag => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => toggle(tag)}
                        className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer',
                            selected.includes(tag)
                                ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                        )}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── Progress Steps ───────────────────────────────────────────
interface ProgressStepsProps {
    steps: string[];
    currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
    return (
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2',
                            index < currentStep
                                ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/30'
                                : index === currentStep
                                    ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-lg shadow-violet-500/20 scale-110'
                                    : 'bg-white/5 border-white/10 text-white/30'
                        )}>
                            {index < currentStep ? '✓' : index + 1}
                        </div>
                        <span className={cn(
                            'text-xs font-medium transition-colors hidden sm:block',
                            index <= currentStep ? 'text-violet-300' : 'text-white/30'
                        )}>
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className="flex-1 mx-2 sm:mx-4">
                            <div className={cn(
                                'h-0.5 rounded-full transition-all duration-500',
                                index < currentStep
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600'
                                    : 'bg-white/10'
                            )} />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'default', className }: { size?: 'sm' | 'default' | 'lg'; className?: string }) {
    const sizes = { sm: 'w-4 h-4', default: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <svg
            className={cn('animate-spin text-violet-500', sizes[size], className)}
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}
