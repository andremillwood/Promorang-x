import { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ModalBase from '@/react-app/components/ModalBase';

interface Ticket {
    id: string;
    subject: string;
    category: string;
    status: string;
    created_at: string;
    admin_notes?: string;
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('account');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/support/my-tickets');
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, category, message })
            });

            if (res.ok) {
                setShowNewTicket(false);
                setSubject('');
                setMessage('');
                fetchTickets();
            } else {
                alert('Failed to submit ticket');
            }
        } catch (error) {
            alert('Error submitting ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'text-blue-500 bg-blue-500/10';
            case 'in_progress': return 'text-orange-500 bg-orange-500/10';
            case 'resolved': return 'text-green-500 bg-green-500/10';
            case 'closed': return 'text-gray-500 bg-gray-500/10';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-2 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-pr-text-1">Help & Support</h1>
                        <p className="text-pr-text-2 mt-1">Track your support requests and report issues.</p>
                    </div>
                    <Button onClick={() => setShowNewTicket(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Send className="w-4 h-4 mr-2" />
                        New Ticket
                    </Button>
                </div>

                {/* Tickets List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-pr-text-2">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <Card className="p-8 text-center bg-pr-surface-card border-pr-surface-3">
                            <div className="bg-pr-surface-1 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-pr-text-2" />
                            </div>
                            <h3 className="text-lg font-medium text-pr-text-1">No tickets yet</h3>
                            <p className="text-pr-text-2">Need help? Submit a new ticket above.</p>
                        </Card>
                    ) : (
                        tickets.map(ticket => (
                            <Card key={ticket.id} className="p-6 bg-pr-surface-card border-pr-surface-3 hover:border-purple-500/50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-pr-text-2 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-pr-text-1 text-lg">{ticket.subject}</h3>
                                        <p className="text-sm text-pr-text-2 capitalize mt-1">Category: {ticket.category.replace('_', ' ')}</p>

                                        {ticket.admin_notes && (
                                            <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                                <p className="text-xs text-purple-400 font-bold mb-1">Support Reply:</p>
                                                <p className="text-sm text-pr-text-1">{ticket.admin_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* New Ticket Modal */}
            <ModalBase isOpen={showNewTicket} onClose={() => setShowNewTicket(false)} title="New Support Request">
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="account">Account Issue</option>
                            <option value="billing">Billing & Payments</option>
                            <option value="content_report">Report Content</option>
                            <option value="bug">Report a Bug</option>
                            <option value="feature_request">Feature Request</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="Brief summary of the issue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="Describe your issue in detail..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </ModalBase>
        </div>
    );
}
