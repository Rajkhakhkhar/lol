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
            default: 'bg-[#141414] text-white border border-[#2a2a2a] hover:border-blue-500 hover:shadow-[0_0_15px_rgba(79, 140, 255,0.3)]',
            secondary: 'bg-[#202020] text-white hover:bg-[#2a2a2a] border border-[#2a2a2a]',
            outline: 'border border-[#2a2a2a] text-[#b5b5b5] hover:text-white hover:border-[#3a3a3a] hover:bg-[#202020]',
            ghost: 'text-[#7a7a7a] hover:text-white hover:bg-white/5',
        destructive: 'bg-pink-900/50 text-pink-200 border border-pink-500/50 hover:bg-pink-900 hover:border-pink-500 hover:shadow-[0_0_15px_rgba(255, 110, 199,0.3)]',
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
                    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
                    'w-full sm:w-auto',
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
            {label && <label className="text-sm font-medium text-[#b5b5b5]">{label}</label>}
            <input
                ref={ref}
                className={cn(
                    'flex h-11 w-full rounded-xl border bg-[#1a1a1a] px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#7a7a7a] transition-all duration-250',
                    'border-[#2a2a2a] focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 focus:outline-none',
                    error && 'border-pink-500/50 focus:border-pink-500 focus:ring-pink-500/20',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-pink-500">{error}</p>}
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
            {label && <label className="text-sm font-medium text-[#b5b5b5]">{label}</label>}
            <select
                ref={ref}
                className={cn(
                    'flex h-11 w-full rounded-xl border bg-[#1a1a1a] px-4 py-2.5 text-[#f5f5f5] transition-all duration-250 appearance-none cursor-pointer',
                    'border-[#2a2a2a] focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 focus:outline-none',
                    error && 'border-pink-500/50 focus:border-pink-500 focus:ring-pink-500/20',
                    className
                )}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#141414] text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-pink-500">{error}</p>}
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
            className="flex items-center justify-between w-full p-3 rounded-xl border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#202020] transition-all cursor-pointer"
        >
            <div className="text-left">
                {label && <p className="text-sm font-medium text-[#f5f5f5]">{label}</p>}
                {description && <p className="text-xs text-[#7a7a7a] mt-0.5">{description}</p>}
            </div>
            <div className={cn(
                'w-11 h-6 rounded-full transition-all duration-300 relative',
                checked ? 'bg-blue-600 shadow-[0_0_10px_rgba(79, 140, 255,0.3)] border border-blue-500' : 'bg-[#141414] border border-[#3a3a3a]'
            )}>
                <div className={cn(
                    'absolute top-[1.5px] w-[18px] h-[18px] rounded-full bg-white shadow-md transition-all duration-300',
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
                'rounded-2xl border border-[#2a2a2a] bg-[#202020] p-4 sm:p-6 shadow-md transition-all duration-250 hover:border-[#3a3a3a] hover:shadow-xl hover:-translate-y-0.5',
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
    variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
    className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants: Record<string, string> = {
        default: 'bg-[#141414] text-[#b5b5b5] border-[#2a2a2a]',
        success: 'bg-[#141414] text-blue-500 border-blue-500/30',
        warning: 'bg-[#141414] text-pink-500 border-pink-500/30',
        error: 'bg-pink-900/30 text-pink-400 border-pink-500/30',
        accent: 'bg-blue-900/30 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(79, 140, 255,0.15)]',
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
            {label && <label className="text-sm font-medium text-[#b5b5b5]">{label}</label>}
            <div className="flex flex-wrap gap-2">
                {options.map(tag => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => toggle(tag)}
                        className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-250 border cursor-pointer',
                            selected.includes(tag)
                                ? 'bg-[#202020] text-white border-blue-500 shadow-[0_0_10px_rgba(79, 140, 255,0.3)]'
                                : 'bg-[#141414] text-[#7a7a7a] border-[#2a2a2a] hover:bg-[#202020] hover:text-[#f5f5f5] hover:border-[#3a3a3a]'
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
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            const activeNode = scrollRef.current.children[currentStep * 2] as HTMLElement;
            if (activeNode) {
                activeNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentStep]);

    return (
        <div className="w-full overflow-x-auto no-scrollbar mb-6 sm:mb-10 pb-2">
            <div 
                ref={scrollRef}
                className="flex items-center justify-start min-w-max mx-auto px-4 sm:px-10 gap-0"
            >
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <div className={cn(
                                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-500 border leading-none shrink-0',
                                    isCompleted
                                        ? 'bg-black border-black text-white shadow-[0_0_15px_rgba(0,0,0,0.3)]'
                                        : isActive
                                            ? 'bg-black border-black text-white shadow-[0_0_10px_rgba(0,0,0,0.2)] scale-110'
                                            : 'bg-[#2a2a2a] border-[#3a3a3a] text-white'
                                )}>
                                    <span className="flex items-center justify-center w-full h-full text-center">{isCompleted ? '✓' : index + 1}</span>
                                </div>
                                <span className={cn(
                                    'text-[10px] sm:text-[11px] font-medium transition-colors w-16 sm:w-24 text-center truncate px-1',
                                    index <= currentStep ? 'text-white' : 'text-[#7a7a7a]'
                                )}>
                                    {step}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="w-8 sm:w-16 h-[2px] mb-4 sm:mb-5 relative shrink-0">
                                    <div className="absolute inset-0 bg-[#2a2a2a] rounded-full" />
                                    <div className={cn(
                                        'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                                        index < currentStep
                                            ? 'bg-black w-full'
                                            : 'w-0'
                                    )} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'default', className }: { size?: 'sm' | 'default' | 'lg'; className?: string }) {
    const sizes = { sm: 'w-4 h-4', default: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <svg
            className={cn('animate-spin text-blue-500', sizes[size], className)}
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}
