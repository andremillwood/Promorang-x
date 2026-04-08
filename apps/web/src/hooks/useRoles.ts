import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface RoleRequirements {
    description: string;
    auto_granted?: boolean;
    requirements?: string[];
}

export interface HostApplication {
    id: string;
    user_id: string;
    motivation: string;
    moment_idea: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by?: string;
    reviewed_at?: string;
    rejection_reason?: string;
    created_at: string;
}

/**
 * Get current user's roles
 */
export function useUserRoles() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['user-roles', user?.id],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/roles/me`, {
                headers: {
                    'Authorization': `Bearer ${user?.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch roles');
            const data = await response.json();
            return data.roles as string[];
        },
        enabled: !!user,
    });
}

/**
 * Check if user has a specific role
 */
export function useHasRole(role: string) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['has-role', user?.id, role],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/roles/check/${role}`, {
                headers: {
                    'Authorization': `Bearer ${user?.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to check role');
            const data = await response.json();
            return data.hasRole as boolean;
        },
        enabled: !!user && !!role,
    });
}

/**
 * Get role requirements
 */
export function useRoleRequirements(role: string) {
    return useQuery({
        queryKey: ['role-requirements', role],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/roles/requirements/${role}`);

            if (!response.ok) throw new Error('Failed to fetch requirements');
            return await response.json() as RoleRequirements;
        },
        enabled: !!role,
    });
}

/**
 * Check if user should auto-unlock Host role
 */
export function useCheckHostUnlock() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async () => {
            const response = await fetch(`${API_URL}/api/roles/check-unlock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to check unlock');
            return await response.json();
        },
        onSuccess: (data) => {
            if (data.unlocked) {
                toast({
                    title: 'Host Role Unlocked! 🎉',
                    description: 'You can now create and manage Moments!',
                });
                queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            }
        },
    });
}

/**
 * Get user's host application status
 */
export function useHostApplication() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['host-application', user?.id],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/host-applications/me`, {
                headers: {
                    'Authorization': `Bearer ${user?.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch application');
            const data = await response.json();
            return data.application as HostApplication | null;
        },
        enabled: !!user,
    });
}

/**
 * Submit a host application
 */
export function useSubmitHostApplication() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ motivation, moment_idea }: { motivation: string; moment_idea: string }) => {
            const response = await fetch(`${API_URL}/api/host-applications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ motivation, moment_idea }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit application');
            }

            return await response.json();
        },
        onSuccess: (data) => {
            toast({
                title: 'Application Submitted!',
                description: data.message || 'We\'ll review your application within 24 hours.',
            });
            queryClient.invalidateQueries({ queryKey: ['host-application'] });
        },
        onError: (error: Error) => {
            toast({
                title: 'Submission Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}

/**
 * Get all pending host applications (admin only)
 */
export function usePendingHostApplications() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['pending-host-applications'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/host-applications`, {
                headers: {
                    'Authorization': `Bearer ${user?.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch applications');
            const data = await response.json();
            return data.applications as HostApplication[];
        },
        enabled: !!user,
    });
}

/**
 * Approve a host application (admin only)
 */
export function useApproveHostApplication() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (applicationId: string) => {
            const response = await fetch(`${API_URL}/api/host-applications/${applicationId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.access_token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to approve application');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast({
                title: 'Application Approved',
                description: 'Host role has been granted to the user.',
            });
            queryClient.invalidateQueries({ queryKey: ['pending-host-applications'] });
        },
        onError: (error: Error) => {
            toast({
                title: 'Approval Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}

/**
 * Reject a host application (admin only)
 */
export function useRejectHostApplication() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ applicationId, reason }: { applicationId: string; reason: string }) => {
            const response = await fetch(`${API_URL}/api/host-applications/${applicationId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to reject application');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast({
                title: 'Application Rejected',
                description: 'The user has been notified.',
            });
            queryClient.invalidateQueries({ queryKey: ['pending-host-applications'] });
        },
        onError: (error: Error) => {
            toast({
                title: 'Rejection Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}
