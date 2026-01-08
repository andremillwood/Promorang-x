import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface AdminTicket {
    id: string;
    user_id: string;
    subject: string;
    message: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
    user: {
        display_name: string;
        email: string;
    };
}

export default function AdminSupport() {
    const [tickets, setTickets] = useState<AdminTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/admin/support');
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (newStatus: string) => {
        if (!selectedTicket) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/support/${selectedTicket.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    admin_notes: replyMessage
                })
            });

            if (res.ok) {
                setTickets(prev => prev.map(t =>
                    t.id === selectedTicket.id ? { ...t, status: newStatus } : t
                ));
                setSelectedTicket(null);
                setReplyMessage('');
            } else {
                alert('Failed to update ticket');
            }
        } catch (e) {
            alert('Error updating ticket');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-white">Loading support tickets...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Support Tickets</h1>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${ticket.status === 'open' ? 'bg-blue-900 text-blue-200' :
                                            ticket.status === 'resolved' ? 'bg-green-900 text-green-200' :
                                                'bg-gray-700 text-gray-300'
                                        }`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium">{ticket.user?.display_name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-400">{ticket.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-300 truncate max-w-xs" title={ticket.subject}>
                                    {ticket.subject}
                                </td>
                                <td className="px-6 py-4 text-gray-400 capitalize">
                                    {ticket.category.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedTicket(ticket)}
                                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Ticket Management Modal */}
            {selectedTicket && (
                <ModalBase isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="lg">
                    <div className="space-y-6">
                        <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    From: {selectedTicket.user?.display_name} ({selectedTicket.user?.email})
                                </p>
                            </div>
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                {selectedTicket.id.split('-').pop()}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-800 whitespace-pre-wrap">{selectedTicket.message}</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700">Admin Response</label>
                            <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Type your reply to the user here..."
                            />

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => handleReply('in_progress')}
                                    disabled={processing}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Mark In Progress
                                </button>
                                <button
                                    onClick={() => handleReply('resolved')}
                                    disabled={processing || !replyMessage}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Resolve & Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBase>
            )}
        </div>
    );
}
