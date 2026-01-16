import { useState, useEffect } from 'react';
import { ChevronDown, Building2, Check, RefreshCw } from 'lucide-react';
import api, { getActiveAdvertiserAccountId, setActiveAdvertiserAccountId } from '../lib/api';

interface AdvertiserAccount {
    id: string;
    name: string;
    logo_url: string | null;
    role: string;
}

export default function AccountSwitcher() {
    const [accounts, setAccounts] = useState<AdvertiserAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeAccountId, setActiveAccountId] = useState<string | null>(getActiveAdvertiserAccountId());

    const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const data = await api.get<AdvertiserAccount[]>('/advertisers/accounts');
                if (data.success && data.accounts) {
                    setAccounts(data.accounts);

                    // If no active account is set, set the first one
                    if (!activeAccountId && data.accounts.length > 0) {
                        const firstId = data.accounts[0].id;
                        setActiveAccountId(firstId);
                        setActiveAdvertiserAccountId(firstId);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch advertiser accounts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    const handleSwitch = (accountId: string) => {
        setActiveAccountId(accountId);
        setActiveAdvertiserAccountId(accountId);
        setOpen(false);
        // Reload to ensure all components fetch data with the new account context
        window.location.reload();
    };

    if (accounts.length <= 1 && !loading) return null;

    const ChevronDownIcon = ChevronDown as any;
    const Building2Icon = Building2 as any;
    const CheckIcon = Check as any;
    const RefreshCwIcon = RefreshCw as any;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 bg-pr-surface-2 hover:bg-pr-surface-3 rounded-lg border border-pr-surface-3 transition-all"
            >
                <div className="w-6 h-6 rounded bg-primary-500 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {activeAccount?.logo_url ? (
                        <img src={activeAccount.logo_url} alt={activeAccount.name} className="w-full h-full object-cover" />
                    ) : (
                        <Building2Icon className="w-4 h-4 text-white" />
                    )}
                </div>
                <span className="text-sm font-medium text-pr-text-1 truncate max-w-[120px]">
                    {activeAccount?.name || 'Select Account'}
                </span>
                <ChevronDownIcon className={`w-4 h-4 text-pr-text-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute top-full mt-2 left-0 w-64 bg-pr-surface-1 rounded-xl shadow-xl border border-pr-surface-3 py-2 z-50 overflow-hidden">
                        <div className="px-4 py-2 border-b border-pr-surface-3">
                            <span className="text-xs font-semibold text-pr-text-3 uppercase tracking-wider">Switch Account</span>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                            {accounts.map(account => (
                                <button
                                    key={account.id}
                                    onClick={() => handleSwitch(account.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-pr-surface-2 transition-colors text-left ${activeAccountId === account.id ? 'bg-primary-500/5' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${activeAccountId === account.id ? 'bg-primary-500' : 'bg-pr-surface-3'}`}>
                                        {account.logo_url ? (
                                            <img src={account.logo_url} alt={account.name} className="w-full h-full rounded object-cover" />
                                        ) : (
                                            <Building2Icon className={`w-4 h-4 ${activeAccountId === account.id ? 'text-white' : 'text-pr-text-3'}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${activeAccountId === account.id ? 'text-primary-500' : 'text-pr-text-1'}`}>
                                            {account.name}
                                        </p>
                                        <p className="text-xs text-pr-text-3 capitalize">{account.role}</p>
                                    </div>
                                    {activeAccountId === account.id && (
                                        <CheckIcon className="w-4 h-4 text-primary-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {loading && (
                            <div className="p-4 text-center">
                                <RefreshCwIcon className="w-5 h-5 animate-spin text-primary-500 mx-auto" />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
