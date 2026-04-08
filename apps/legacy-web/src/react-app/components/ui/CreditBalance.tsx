/**
 * CreditBalance
 * 
 * Reusable component for displaying Verified Credit balances with USD equivalent.
 * Ensures consistent display across the platform and helps users
 * understand the real-world value of their success.
 * 
 * 1 Credit = $1 USD
 */

import { ShieldCheck } from 'lucide-react';

interface CreditBalanceProps {
    amount: number;
    size?: 'sm' | 'md' | 'lg';
    showUsd?: boolean;
    showIcon?: boolean;
    className?: string;
}

export default function CreditBalance({
    amount,
    size = 'md',
    showUsd = true,
    showIcon = true,
    className = ''
}: CreditBalanceProps) {
    const formattedAmount = amount.toLocaleString();
    const usdAmount = amount.toFixed(2);

    const sizeClasses = {
        sm: {
            container: 'gap-1',
            icon: 'w-3 h-3',
            amount: 'text-sm font-medium',
            usd: 'text-[10px]',
        },
        md: {
            container: 'gap-1.5',
            icon: 'w-4 h-4',
            amount: 'text-lg font-black',
            usd: 'text-xs',
        },
        lg: {
            container: 'gap-2',
            icon: 'w-5 h-5',
            amount: 'text-2xl font-black',
            usd: 'text-sm',
        },
    };

    const styles = sizeClasses[size];

    return (
        <div className={`inline-flex flex-col ${className}`}>
            <div className={`flex items-center ${styles.container}`}>
                {showIcon && (
                    <ShieldCheck className={`${styles.icon} text-blue-500`} />
                )}
                <span className={`${styles.amount} text-pr-text-1 tracking-tight`}>
                    {formattedAmount}
                </span>
            </div>
            {showUsd && (
                <span className={`${styles.usd} text-pr-text-3 font-medium`}>
                    ≈ ${usdAmount} USD
                </span>
            )}
        </div>
    );
}

/**
 * Inline variant for use within text
 */
export function CreditBalanceInline({ amount, showUsd = true }: { amount: number; showUsd?: boolean }) {
    return (
        <span className="inline-flex items-center gap-1 group">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="font-black tracking-tight">{amount.toLocaleString()}</span>
            {showUsd && (
                <span className="text-pr-text-3 text-sm font-medium">
                    (${amount.toFixed(2)})
                </span>
            )}
        </span>
    );
}
