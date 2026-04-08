import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Building2,
    Shield,
    Edit3,
    Eye,
    LogIn,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '@/react-app/lib/api';

interface RoleInfo {
    label: string;
    icon: any;
    description: string;
}

const ROLE_INFO: Record<string, RoleInfo> = {
    admin: { label: 'Admin', icon: Shield as any, description: 'Full access + team management' },
    manager: { label: 'Manager', icon: Edit3 as any, description: 'Create & edit campaigns' },
    viewer: { label: 'Viewer', icon: Eye as any, description: 'Read-only access' },
};



interface InvitationDetails {
    id: string;
    email: string;
    role: 'admin' | 'manager' | 'viewer';
    message: string | null;
    expiresAt: string;
    account: {
        id: string;
        name: string;
        logo_url: string | null;
    };
    invitedBy: string;
    type?: 'advertiser' | 'merchant';
}

export default function AcceptInvitation() {
    const { token: inviteToken } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);

    // Fetch invitation details
    useEffect(() => {
        const fetchInvitation = async () => {
            if (!inviteToken) {
                setError('Invalid invitation link');
                setLoading(false);
                return;
            }

            try {
                // Try advertiser invitation first
                const data = await api.get<any>(`/advertisers/invitations/${inviteToken}`);

                if (data.success) {
                    setInvitation({ ...data.invitation, type: 'advertiser' });
                } else {
                    // Try merchant invitation
                    try {
                        const merchantData = await api.get<any>(`/merchant-team/invitations/${inviteToken}`);
                        if (merchantData.success) {
                            setInvitation({ ...merchantData.invitation, type: 'merchant' });
                        } else {
                            setError('Invalid or expired invitation');
                        }
                    } catch (mErr) {
                        setError('Invalid or expired invitation');
                    }
                }
            } catch (err: any) {
                // Try merchant invitation on error
                try {
                    const merchantData = await api.get<any>(`/merchant-team/invitations/${inviteToken}`);
                    if (merchantData.success) {
                        setInvitation({ ...merchantData.invitation, type: 'merchant' });
                    } else {
                        setError(err.message || 'Failed to load invitation details');
                    }
                } catch (mErr) {
                    setError(err.message || 'Failed to load invitation details');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [inviteToken]);

    // Accept invitation
    const handleAccept = async () => {
        if (!inviteToken || !invitation) return;

        setAccepting(true);
        try {
            const endpoint = invitation.type === 'merchant'
                ? `/merchant-team/invitations/${inviteToken}/accept`
                : `/advertisers/invitations/${inviteToken}/accept`;

            const data = await api.post<any>(endpoint);

            if (data.success) {
                setAccepted(true);
                // Redirect to appropriate dashboard
                setTimeout(() => {
                    navigate(invitation.type === 'merchant' ? '/merchant/dashboard' : '/advertiser/dashboard');
                }, 2000);
            } else {
                setError(data.error || 'Failed to accept invitation');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to accept invitation');
        } finally {
            setAccepting(false);
        }
    };

    const LoaderIcon = Loader2 as any;
    const CheckCircleIcon = CheckCircle as any;
    const XCircleIcon = XCircle as any;
    const AlertCircleIcon = AlertCircle as any;
    const Building2Icon = Building2 as any;
    const UsersIcon = Users as any;
    const LogInIcon = LogIn as any;
    const UserPlusIcon = UserPlus as any;
    const RouterLink = Link as any;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pr-surface-background">
                <div className="text-center">
                    <LoaderIcon className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-pr-text-2">Loading invitation...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pr-surface-background p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-red-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <XCircleIcon className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-pr-text-1 mb-2">Invitation Not Found</h1>
                    <p className="text-pr-text-2 mb-6">{error}</p>
                    <RouterLink
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Go to Homepage
                    </RouterLink>
                </div>
            </div>
        );
    }

    // Accepted state
    if (accepted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pr-surface-background p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-green-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-pr-text-1 mb-2">Welcome to the Team! 🎉</h1>
                    <p className="text-pr-text-2 mb-4">
                        You've successfully joined <span className="font-medium text-pr-text-1">{invitation?.account.name}</span>
                    </p>
                    <p className="text-sm text-pr-text-3">Redirecting to your dashboard...</p>
                </div>
            </div>
        );
    }

    const roleInfo = invitation ? ROLE_INFO[invitation.role] : null;
    const RoleIcon = roleInfo?.icon || Eye;

    return (
        <div className="min-h-screen flex items-center justify-center bg-pr-surface-background p-4">
            <div className="max-w-lg w-full">
                {/* Invitation Card */}
                <div className="bg-pr-surface-1 rounded-2xl border border-pr-surface-3 overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-center">
                        <UsersIcon className="w-12 h-12 text-white/80 mx-auto mb-3" />
                        <h1 className="text-2xl font-bold text-white">You're Invited!</h1>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Account Info */}
                        <div className="flex items-center gap-4 p-4 bg-pr-surface-2 rounded-xl mb-6">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                                {invitation?.account.logo_url ? (
                                    <img
                                        src={invitation.account.logo_url}
                                        alt={invitation.account.name}
                                        className="w-full h-full rounded-xl object-cover"
                                    />
                                ) : (
                                    <Building2Icon className="w-7 h-7 text-white" />
                                )}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-pr-text-1">{invitation?.account.name}</h2>
                                <p className="text-sm text-pr-text-3">Invited by {invitation?.invitedBy}</p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="mb-6">
                            <p className="text-sm text-pr-text-3 mb-2">Your Role</p>
                            <div className="flex items-center gap-3 p-3 bg-primary-500/10 rounded-lg border border-primary-500/20">
                                <RoleIcon className="w-5 h-5 text-primary-500" />
                                <div>
                                    <p className="font-medium text-pr-text-1">{roleInfo?.label}</p>
                                    <p className="text-sm text-pr-text-3">{roleInfo?.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Message */}
                        {invitation?.message && (
                            <div className="mb-6 p-4 bg-pr-surface-2 rounded-lg border-l-4 border-primary-500">
                                <p className="text-sm text-pr-text-3 mb-1">Personal message:</p>
                                <p className="text-pr-text-1 italic">"{invitation.message}"</p>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                                <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-500">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {isAuthenticated ? (
                            <button
                                onClick={handleAccept}
                                disabled={accepting}
                                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {accepting ? (
                                    <>
                                        <LoaderIcon className="w-5 h-5 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="w-5 h-5" />
                                        Accept Invitation
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-center text-pr-text-2 mb-4">
                                    Please log in or create an account to accept this invitation
                                </p>
                                <RouterLink
                                    to={`/login?redirect=/invite/${inviteToken}`}
                                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <LogInIcon className="w-5 h-5" />
                                    Log In to Accept
                                </RouterLink>
                                <RouterLink
                                    to={`/register?redirect=/invite/${inviteToken}`}
                                    className="w-full py-4 bg-pr-surface-2 text-pr-text-1 rounded-xl font-semibold hover:bg-pr-surface-3 transition-all flex items-center justify-center gap-2 border border-pr-surface-3"
                                >
                                    <UserPlusIcon className="w-5 h-5" />
                                    Create Account
                                </RouterLink>
                            </div>
                        )}

                        {/* Expiry Notice */}
                        {invitation && (
                            <p className="text-center text-sm text-pr-text-3 mt-4">
                                This invitation expires on {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-pr-text-3 mt-6">
                    Not expecting this invitation?{' '}
                    <RouterLink to="/" className="text-primary-500 hover:underline">
                        Ignore and go to homepage
                    </RouterLink>
                </p>
            </div>
        </div>
    );
}

