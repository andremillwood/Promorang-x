import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    UserPlus,
    Mail,
    Shield,
    Crown,
    Eye,
    Edit3,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronDown,
    Loader2,
    Building2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '@/react-app/lib/api';

// Types
interface TeamMember {
    id: string;
    role: 'owner' | 'admin' | 'manager' | 'viewer';
    status: 'active' | 'pending' | 'revoked';
    invitedAt: string;
    acceptedAt: string | null;
    lastActiveAt: string | null;
    user: {
        id: string;
        email: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
    };
    invitedBy: {
        id: string;
        username: string;
        display_name: string;
    } | null;
}

interface Invitation {
    id: string;
    email: string;
    role: 'admin' | 'manager' | 'viewer';
    message: string | null;
    expiresAt: string;
    createdAt: string;
    invitedBy: {
        id: string;
        username: string;
        display_name: string;
    } | null;
}

interface AdvertiserAccount {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    role: string;
}

interface RoleInfo {
    label: string;
    icon: any;
    color: string;
    bgColor: string;
}

const ROLE_INFO: Record<string, RoleInfo> = {
    owner: { label: 'Owner', icon: Crown as any, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    admin: { label: 'Admin', icon: Shield as any, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    manager: { label: 'Manager', icon: Edit3 as any, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    viewer: { label: 'Viewer', icon: Eye as any, color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
};

// Role hierarchy info

export default function AdvertiserTeamSettings() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<AdvertiserAccount[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [currentUserRole, setCurrentUserRole] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState<{ member: TeamMember } | null>(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState<{ member: TeamMember } | null>(null);

    // Form states
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'viewer'>('viewer');
    const [inviteMessage, setInviteMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use the api utility instead of manual fetch with headers
    // api utility handles VITE_API_URL and /api prefix automatically
    // it also automatically adds the Authorization header with the token from localStorage

    // Fetch accounts
    const fetchAccounts = useCallback(async () => {
        try {
            const data = await api.get<any>('/advertisers/accounts');
            if (data.success) {
                setAccounts(data.accounts);
                if (data.accounts.length > 0 && !selectedAccountId) {
                    setSelectedAccountId(data.accounts[0].id);
                }
            }
        } catch (err) {
            console.error('Error fetching accounts:', err);
        }
    }, [selectedAccountId]);

    // Fetch team members
    const fetchTeam = useCallback(async () => {
        if (!selectedAccountId) return;

        try {
            setLoading(true);
            const data = await api.get<any>(`/advertisers/${selectedAccountId}/team`);

            if (data.success) {
                setMembers(data.members);
                setCurrentUserRole(data.currentUserRole);
            } else {
                setError(data.error || 'Failed to load team members');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load team members');
        } finally {
            setLoading(false);
        }
    }, [selectedAccountId]);

    // Fetch invitations
    const fetchInvitations = useCallback(async () => {
        if (!selectedAccountId || !['owner', 'admin'].includes(currentUserRole)) return;

        try {
            const data = await api.get<any>(`/advertisers/${selectedAccountId}/invitations`);

            if (data.success) {
                setInvitations(data.invitations);
            }
        } catch (err) {
            console.error('Error fetching invitations:', err);
        }
    }, [selectedAccountId, currentUserRole]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        if (selectedAccountId) {
            fetchTeam();
        }
    }, [selectedAccountId, fetchTeam]);

    useEffect(() => {
        if (selectedAccountId && currentUserRole) {
            fetchInvitations();
        }
    }, [selectedAccountId, currentUserRole, fetchInvitations]);

    // Send invitation
    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccountId || !inviteEmail) return;

        setIsSubmitting(true);
        try {
            const data = await api.post<any>(`/advertisers/${selectedAccountId}/team/invite`, {
                email: inviteEmail,
                role: inviteRole,
                message: inviteMessage || undefined
            });

            if (data.success) {
                setShowInviteModal(false);
                setInviteEmail('');
                setInviteRole('viewer');
                setInviteMessage('');
                fetchInvitations();
                fetchTeam();
            } else {
                setError(data.error || 'Failed to send invitation');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cancel invitation
    const handleCancelInvite = async (invitationId: string) => {
        if (!selectedAccountId) return;

        try {
            const data = await api.delete<any>(`/advertisers/${selectedAccountId}/invitations/${invitationId}`);

            if (data.success) {
                fetchInvitations();
            } else {
                setError(data.error || 'Failed to cancel invitation');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to cancel invitation');
        }
    };

    // Remove member
    const handleRemoveMember = async (memberId: string) => {
        if (!selectedAccountId) return;

        try {
            const data = await api.delete<any>(`/advertisers/${selectedAccountId}/team/${memberId}`);

            if (data.success) {
                setShowRemoveConfirm(null);
                fetchTeam();
            } else {
                setError(data.error || 'Failed to remove team member');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to remove team member');
        }
    };

    // Update role
    const handleUpdateRole = async (memberId: string, newRole: string) => {
        if (!selectedAccountId) return;

        try {
            const data = await api.patch<any>(`/advertisers/${selectedAccountId}/team/${memberId}/role`, {
                role: newRole
            });

            if (data.success) {
                setShowRoleModal(null);
                fetchTeam();
            } else {
                setError(data.error || 'Failed to update role');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update role');
        }
    };

    const canManageTeam = ['owner', 'admin'].includes(currentUserRole);
    const canChangeRoles = currentUserRole === 'owner';
    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    if (loading && accounts.length === 0) {
        const LoaderIcon = Loader2 as any;
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoaderIcon className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const UsersIcon = Users as any;
    const Trash2Icon = Trash2 as any;
    const Edit3Icon = Edit3 as any;
    const ChevronDownIcon = ChevronDown as any;
    const AlertCircleIcon = AlertCircle as any;
    const Building2Icon = Building2 as any;
    const UserPlusIcon = UserPlus as any;
    const MailIcon = Mail as any;
    const ClockIcon = Clock as any;
    const XCircleIcon = XCircle as any;
    const LoaderIcon = Loader2 as any;
    const CheckCircleIcon = CheckCircle as any;

    return (
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 pb-mobile-nav lg:pb-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <UsersIcon className="w-8 h-8 text-primary-600" />
                    <h1 className="text-3xl font-bold text-pr-text-1">Team Settings</h1>
                </div>
                <p className="text-pr-text-2">Manage who has access to your advertiser account</p>
            </div>

            {/* Account Selector (if multiple accounts) */}
            {accounts.length > 1 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-pr-text-2 mb-2">Select Account</label>
                    <div className="relative">
                        <select
                            value={selectedAccountId || ''}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="w-full md:w-80 bg-pr-surface-2 border border-pr-surface-3 rounded-lg px-4 py-3 text-pr-text-1 appearance-none cursor-pointer"
                        >
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name} ({account.role})
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pr-text-3 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-500 font-medium">{error}</p>
                        <button onClick={() => setError(null)} className="text-sm text-red-400 underline mt-1">
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Current Account Info */}
            {selectedAccount && (
                <div className="mb-6 p-4 bg-pr-surface-1 rounded-xl border border-pr-surface-3 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        {selectedAccount.logo_url ? (
                            <img src={selectedAccount.logo_url} alt={selectedAccount.name} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                            <Building2Icon className="w-6 h-6 text-white" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="font-semibold text-pr-text-1">{selectedAccount.name}</h2>
                        <p className="text-sm text-pr-text-3">Your role: <span className="capitalize font-medium">{currentUserRole}</span></p>
                    </div>
                    {canManageTeam && (
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            <UserPlusIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Invite Member</span>
                        </button>
                    )}
                </div>
            )}

            {/* Team Members */}
            <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden mb-6">
                <div className="p-4 border-b border-pr-surface-3">
                    <h3 className="font-semibold text-pr-text-1 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-primary-500" />
                        Team Members ({members.filter(m => m.status === 'active').length})
                    </h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <LoaderIcon className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="p-8 text-center text-pr-text-3">
                        <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No team members yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-pr-surface-3">
                        {members.filter(m => m.status === 'active').map(member => {
                            const RoleIcon = ROLE_INFO[member.role]?.icon || Eye;
                            const roleInfo = ROLE_INFO[member.role];
                            const isCurrentUser = member.user.id === user?.id;

                            return (
                                <div key={member.id} className="p-4 flex items-center gap-4 hover:bg-pr-surface-2/50 transition-colors">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                                        {member.user.avatar_url ? (
                                            <img src={member.user.avatar_url} alt={member.user.display_name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            member.user.display_name?.charAt(0).toUpperCase() || '?'
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-pr-text-1 truncate">
                                                {member.user.display_name}
                                                {isCurrentUser && <span className="text-pr-text-3 text-sm"> (You)</span>}
                                            </span>
                                        </div>
                                        <p className="text-sm text-pr-text-3 truncate">{member.user.email}</p>
                                    </div>

                                    {/* Role Badge */}
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${roleInfo.bgColor}`}>
                                        <RoleIcon className={`w-4 h-4 ${roleInfo.color}`} />
                                        <span className={`text-sm font-medium ${roleInfo.color}`}>{roleInfo.label}</span>
                                    </div>

                                    {/* Actions */}
                                    {canManageTeam && !isCurrentUser && member.role !== 'owner' && (
                                        <div className="flex items-center gap-2">
                                            {canChangeRoles && (
                                                <button
                                                    onClick={() => setShowRoleModal({ member })}
                                                    className="p-2 rounded-lg text-pr-text-3 hover:text-primary-500 hover:bg-pr-surface-3 transition-colors"
                                                    title="Change role"
                                                >
                                                    <Edit3Icon className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowRemoveConfirm({ member })}
                                                className="p-2 rounded-lg text-pr-text-3 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                title="Remove member"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pending Invitations */}
            {canManageTeam && invitations.length > 0 && (
                <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 overflow-hidden">
                    <div className="p-4 border-b border-pr-surface-3">
                        <h3 className="font-semibold text-pr-text-1 flex items-center gap-2">
                            <MailIcon className="w-5 h-5 text-yellow-500" />
                            Pending Invitations ({invitations.length})
                        </h3>
                    </div>

                    <div className="divide-y divide-pr-surface-3">
                        {invitations.map(invite => {
                            const roleInfo = ROLE_INFO[invite.role];

                            return (
                                <div key={invite.id} className="p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                        <ClockIcon className="w-5 h-5 text-yellow-500" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-pr-text-1 truncate">{invite.email}</p>
                                        <p className="text-sm text-pr-text-3">
                                            Invited by {invite.invitedBy?.display_name || 'Unknown'} •
                                            Expires {new Date(invite.expiresAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${roleInfo.bgColor}`}>
                                        <span className={`text-sm font-medium ${roleInfo.color}`}>{roleInfo.label}</span>
                                    </div>

                                    <button
                                        onClick={() => handleCancelInvite(invite.id)}
                                        className="p-2 rounded-lg text-pr-text-3 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                        title="Cancel invitation"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-pr-text-1 mb-4 flex items-center gap-2">
                            <UserPlusIcon className="w-5 h-5 text-primary-500" />
                            Invite Team Member
                        </h3>

                        <form onSubmit={handleSendInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-pr-text-2 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="w-full bg-pr-surface-2 border border-pr-surface-3 rounded-lg px-4 py-3 text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-pr-text-2 mb-1">Role</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'manager' | 'viewer')}
                                    className="w-full bg-pr-surface-2 border border-pr-surface-3 rounded-lg px-4 py-3 text-pr-text-1 appearance-none cursor-pointer"
                                >
                                    <option value="viewer">Viewer - Read-only access</option>
                                    <option value="manager">Manager - Create & edit campaigns</option>
                                    <option value="admin">Admin - Full access + team management</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-pr-text-2 mb-1">Personal Message (optional)</label>
                                <textarea
                                    value={inviteMessage}
                                    onChange={(e) => setInviteMessage(e.target.value)}
                                    placeholder="Hi! I'd like you to join our team on Promorang..."
                                    rows={3}
                                    className="w-full bg-pr-surface-2 border border-pr-surface-3 rounded-lg px-4 py-3 text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 px-4 py-3 bg-pr-surface-2 text-pr-text-1 rounded-lg hover:bg-pr-surface-3 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !inviteEmail}
                                    className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <LoaderIcon className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <MailIcon className="w-4 h-4" />
                                            Send Invite
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Role Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-pr-text-1 mb-4">Change Role</h3>
                        <p className="text-pr-text-2 mb-4">
                            Select a new role for <span className="font-medium text-pr-text-1">{showRoleModal.member.user.display_name}</span>
                        </p>

                        <div className="space-y-2 mb-6">
                            {(['admin', 'manager', 'viewer'] as const).map(role => {
                                const info = ROLE_INFO[role];
                                const RoleIcon = info.icon;
                                return (
                                    <button
                                        key={role}
                                        onClick={() => handleUpdateRole(showRoleModal.member.id, role)}
                                        className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${showRoleModal.member.role === role
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-pr-surface-3 hover:border-primary-500/50'
                                            }`}
                                    >
                                        <RoleIcon className={`w-5 h-5 ${info.color}`} />
                                        <div className="text-left">
                                            <p className="font-medium text-pr-text-1">{info.label}</p>
                                            <p className="text-sm text-pr-text-3">
                                                {role === 'admin' && 'Full access + team management'}
                                                {role === 'manager' && 'Create & edit campaigns'}
                                                {role === 'viewer' && 'Read-only access'}
                                            </p>
                                        </div>
                                        {showRoleModal.member.role === role && (
                                            <CheckCircleIcon className="w-5 h-5 text-primary-500 ml-auto" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setShowRoleModal(null)}
                            className="w-full px-4 py-3 bg-pr-surface-2 text-pr-text-1 rounded-lg hover:bg-pr-surface-3 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Remove Confirmation Modal */}
            {showRemoveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-pr-text-1 mb-4 flex items-center gap-2">
                            <AlertCircleIcon className="w-5 h-5 text-red-500" />
                            Remove Team Member
                        </h3>
                        <p className="text-pr-text-2 mb-6">
                            Are you sure you want to remove <span className="font-medium text-pr-text-1">{showRemoveConfirm.member.user.display_name}</span> from the team? They will lose access to this account immediately.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRemoveConfirm(null)}
                                className="flex-1 px-4 py-3 bg-pr-surface-2 text-pr-text-1 rounded-lg hover:bg-pr-surface-3 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRemoveMember(showRemoveConfirm.member.id)}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
