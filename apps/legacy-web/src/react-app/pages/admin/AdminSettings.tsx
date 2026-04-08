import { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';

interface User {
    id: string;
    email: string;
    display_name: string;
    role: string;
    user_type: string;
}

export default function AdminSettings() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null); // Ideally typed from context

    // NOTE: In a real app we'd get current user from context to check if they are Master Admin
    // For now we'll rely on the backend error to stop them if they aren't authorized.

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const res = await fetch('/api/admin/users/role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newRole })
            });

            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
                alert('Role updated successfully');
            } else {
                const err = await res.json();
                alert(`Failed: ${err.error}`);
            }
        } catch (e) {
            alert('Network error');
        }
    };

    if (loading) return <div className="text-white">Loading users...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Admin Settings & Roles</h1>
            <p className="text-gray-400">Manage user roles and permissions. Only Master Admins can change roles.</p>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Current Role</th>
                            <th className="px-6 py-4 text-right">Change Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium">{user.display_name}</div>
                                    <div className="text-xs text-gray-400">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {user.role === 'master_admin' ? (
                                            <span className="flex items-center gap-1 text-purple-400 font-bold text-xs uppercase bg-purple-400/10 px-2 py-1 rounded">
                                                <Lock className="w-3 h-3" /> Master Admin
                                            </span>
                                        ) : user.role === 'admin' ? (
                                            <span className="text-blue-400 font-bold text-xs uppercase bg-blue-400/10 px-2 py-1 rounded">Admin</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs uppercase bg-gray-700 px-2 py-1 rounded">{user.role || 'User'}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.role === 'master_admin' ? (
                                        <span className="text-gray-600 text-xs italic">Immutable</span>
                                    ) : (
                                        <select
                                            value={user.role || 'user'}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="bg-gray-900 border border-gray-600 text-gray-300 text-sm rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="user">User</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
