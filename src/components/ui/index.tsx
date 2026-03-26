import * as React from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const variants: Record<string, string> = {
            default:
                "border border-[#2a2a2a] bg-[#141414] text-white hover:border-blue-500 hover:shadow-[0_0_15px_rgba(79,140,255,0.3)]",
            secondary:
                "border border-[#2a2a2a] bg-[#202020] text-white hover:bg-[#2a2a2a]",
            outline:
                "border border-[#2a2a2a] text-[#b5b5b5] hover:border-[#3a3a3a] hover:bg-[#202020] hover:text-white",
            ghost: "text-[#7a7a7a] hover:bg-white/5 hover:text-white",
            destructive:
                "border border-pink-500/50 bg-pink-900/50 text-pink-200 hover:border-pink-500 hover:bg-pink-900 hover:shadow-[0_0_15px_rgba(255,110,199,0.3)]",
        };

        const sizes: Record<string, string> = {
            default: "h-11 px-6 py-2.5",
            sm: "h-9 px-4 text-sm",
            lg: "h-12 px-8 text-lg",
            icon: "h-10 w-10",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-xl font-medium transition-all duration-250 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 sm:w-auto",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

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
                    "flex h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#7a7a7a] transition-all duration-250 focus:border-[#4f8cff] focus:outline-none focus:ring-2 focus:ring-[#4f8cff]/20",
                    error && "border-pink-500/50 focus:border-pink-500 focus:ring-pink-500/20",
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-pink-500">{error}</p>}
        </div>
    )
);
Input.displayName = "Input";

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
                    "flex h-11 w-full appearance-none cursor-pointer rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5 text-[#f5f5f5] transition-all duration-250 focus:border-[#4f8cff] focus:outline-none focus:ring-2 focus:ring-[#4f8cff]/20",
                    error && "border-pink-500/50 focus:border-pink-500 focus:ring-pink-500/20",
                    className
                )}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#141414] text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-pink-500">{error}</p>}
        </div>
    )
);
Select.displayName = "Select";

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
            className="flex w-full items-center justify-between rounded-xl border border-[#2a2a2a] p-3 transition-all hover:border-[#3a3a3a] hover:bg-[#202020]"
        >
            <div className="text-left">
                {label && <p className="text-sm font-medium text-[#f5f5f5]">{label}</p>}
                {description && <p className="mt-0.5 text-xs text-[#7a7a7a]">{description}</p>}
            </div>
            <div
                className={cn(
                    "relative h-6 w-11 rounded-full border transition-all duration-300",
                    checked
                        ? "border-blue-500 bg-blue-600 shadow-[0_0_10px_rgba(79,140,255,0.3)]"
                        : "border-[#3a3a3a] bg-[#141414]"
                )}
            >
                <div
                    className={cn(
                        "absolute top-[1.5px] h-[18px] w-[18px] rounded-full bg-white shadow-md transition-all duration-300",
                        checked ? "left-[22px]" : "left-0.5"
                    )}
                />
            </div>
        </button>
    );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-[#2a2a2a] bg-[#202020] p-4 shadow-md transition-all duration-250 hover:-translate-y-0.5 hover:border-[#3a3a3a] hover:shadow-xl sm:p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "accent";
    className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
    const variants: Record<string, string> = {
        default: "border-[#2a2a2a] bg-[#141414] text-[#b5b5b5]",
        success: "border-blue-500/30 bg-[#141414] text-blue-500",
        warning: "border-pink-500/30 bg-[#141414] text-pink-500",
        error: "border-pink-500/30 bg-pink-900/30 text-pink-400",
        accent: "border-blue-500/50 bg-blue-900/30 text-blue-400 shadow-[0_0_10px_rgba(79,140,255,0.15)]",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

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
                ? selected.filter((value) => value !== tag)
                : [...selected, tag]
        );
    };

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium text-[#b5b5b5]">{label}</label>}
            <div className="flex flex-wrap gap-2">
                {options.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => toggle(tag)}
                        className={cn(
                            "cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-250",
                            selected.includes(tag)
                                ? "border-blue-500 bg-[#202020] text-white shadow-[0_0_10px_rgba(79,140,255,0.3)]"
                                : "border-[#2a2a2a] bg-[#141414] text-[#7a7a7a] hover:border-[#3a3a3a] hover:bg-[#202020] hover:text-[#f5f5f5]"
                        )}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
}

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
                activeNode.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
        }
    }, [currentStep]);

    return (
        <div className="mb-5 w-full overflow-x-auto pb-2 no-scrollbar sm:mb-8">
            <div
                ref={scrollRef}
                className="mx-auto flex min-w-max items-center justify-center gap-0 px-1 sm:px-3"
            >
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <React.Fragment key={index}>
                            <div className="flex shrink-0 flex-col items-center gap-1.5">
                                <div
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold leading-none transition-all duration-500 sm:h-10 sm:w-10 sm:text-sm",
                                        isCompleted
                                            ? "border-black bg-black text-white shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                                            : isActive
                                              ? "scale-110 border-black bg-black text-white shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                                              : "border-[#3a3a3a] bg-[#2a2a2a] text-white"
                                    )}
                                >
                                    <span className="flex h-full w-full items-center justify-center text-center">
                                        {isCompleted ? "✓" : index + 1}
                                    </span>
                                </div>
                                <span
                                    className={cn(
                                        "w-16 truncate px-1 text-center text-[10px] font-medium transition-colors sm:w-24 sm:text-[11px]",
                                        index <= currentStep ? "text-white" : "text-[#7a7a7a]"
                                    )}
                                >
                                    {step}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="relative mb-4 h-[2px] w-8 shrink-0 sm:mb-5 sm:w-16">
                                    <div className="absolute inset-0 rounded-full bg-[#2a2a2a]" />
                                    <div
                                        className={cn(
                                            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                                            index < currentStep ? "w-full bg-black" : "w-0"
                                        )}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

export function Spinner({
    size = "default",
    className,
}: {
    size?: "sm" | "default" | "lg";
    className?: string;
}) {
    const sizes = { sm: "w-4 h-4", default: "w-8 h-8", lg: "w-12 h-12" };

    return (
        <svg
            className={cn("animate-spin text-blue-500", sizes[size], className)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}
