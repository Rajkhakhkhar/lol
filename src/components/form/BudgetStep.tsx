'use client';

import { Input, Select } from '@/components/ui';
import type { BudgetForm } from '@/types';
import { DollarSign, TrendingUp, PiggyBank } from 'lucide-react';

interface Props {
    data: BudgetForm;
    onChange: (data: BudgetForm) => void;
}

const CURRENCIES = [
    { value: 'USD', label: '🇺🇸 USD — US Dollar' },
    { value: 'EUR', label: '🇪🇺 EUR — Euro' },
    { value: 'GBP', label: '🇬🇧 GBP — British Pound' },
    { value: 'JPY', label: '🇯🇵 JPY — Japanese Yen' },
    { value: 'INR', label: '🇮🇳 INR — Indian Rupee' },
    { value: 'AUD', label: '🇦🇺 AUD — Australian Dollar' },
    { value: 'CAD', label: '🇨🇦 CAD — Canadian Dollar' },
    { value: 'SGD', label: '🇸🇬 SGD — Singapore Dollar' },
    { value: 'THB', label: '🇹🇭 THB — Thai Baht' },
    { value: 'AED', label: '🇦🇪 AED — UAE Dirham' },
];

export default function BudgetStep({ data, onChange }: Props) {
    const update = (field: Partial<BudgetForm>) => onChange({ ...data, ...field });
    const dailyCap = data.daily_budget_cap || 0;
    const total = data.total_budget || 0;
    const ratio = total > 0 ? Math.min((dailyCap / total) * 100, 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Budget Planning</h2>
                    <p className="text-sm text-white/50">Set your travel budget and daily limits</p>
                </div>
            </div>

            <Select
                label="Currency"
                value={data.currency}
                onChange={e => update({ currency: e.target.value })}
                options={CURRENCIES}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <PiggyBank className="w-4 h-4 text-emerald-400" />
                        Total Trip Budget
                    </div>
                    <Input
                        type="number"
                        min={0}
                        step={100}
                        value={data.total_budget}
                        onChange={e => update({ total_budget: Math.max(0, parseFloat(e.target.value) || 0) })}
                        placeholder="e.g., 3000"
                    />
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        Daily Spending Cap
                    </div>
                    <Input
                        type="number"
                        min={0}
                        step={50}
                        value={data.daily_budget_cap}
                        onChange={e => update({ daily_budget_cap: Math.max(0, parseFloat(e.target.value) || 0) })}
                        placeholder="e.g., 500"
                    />
                </div>
            </div>

            {/* Budget Visual */}
            {total > 0 && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Daily cap vs total</span>
                        <span className="text-emerald-400 font-bold">{ratio.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${ratio}%` }}
                        />
                    </div>
                    <p className="text-xs text-white/40">
                        {dailyCap > 0 && total > 0
                            ? `Your daily cap allows for about ${Math.floor(total / dailyCap)} days of spending`
                            : 'Set both values to see budget breakdown'}
                    </p>
                </div>
            )}
        </div>
    );
}
