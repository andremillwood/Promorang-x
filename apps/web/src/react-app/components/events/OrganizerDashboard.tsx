import { useState, useEffect } from 'react';
import {
    Users,
    Send,
    TrendingUp,
    CheckCircle,
    Bell,
    Scan,
    Loader2,
    Award
} from 'lucide-react';
import eventsService from '@/react-app/services/events';

interface OrganizerDashboardProps {
    eventId: string;
    event: any;
}

export default function OrganizerDashboard({ eventId, event }: OrganizerDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'attendees' | 'submissions' | 'updates'>('overview');
    const [updateText, setUpdateText] = useState('');
    const [sendingUpdate, setSendingUpdate] = useState(false);

    const [stats] = useState({
        totalRsvps: event.total_rsvps || 0,
        totalCheckIns: event.total_check_ins || 0,
        engagement: event.engagement_score || 0,
        tasksDone: event.total_tasks_completed || 0
    });

    const [attendees, setAttendees] = useState<any[]>([]);
    const [fetchingAttendees, setFetchingAttendees] = useState(false);

    useEffect(() => {
        if (activeTab === 'attendees') {
            fetchAttendees();
        }
    }, [activeTab]);

    const fetchAttendees = async () => {
        try {
            setFetchingAttendees(true);
            const data = await eventsService.getEventAttendees(eventId);
            setAttendees(data);
        } catch (error) {
            console.error('Error fetching attendees:', error);
        } finally {
            setFetchingAttendees(false);
        }
    };

    const handleCheckIn = async (attendee: any) => {
        try {
            await eventsService.checkInAttendee(eventId, { user_id: attendee.user_id });
            alert('Checked in successfully!');
            fetchAttendees();
        } catch (error) {
            alert('Check-in failed');
        }
    };

    const handleSendUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!updateText) return;

        try {
            setSendingUpdate(true);
            await eventsService.postEventUpdate(eventId, updateText);
            setUpdateText('');
            alert('Update sent to all attendees!');
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to send update');
        } finally {
            setSendingUpdate(false);
        }
    };

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-pr-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-pr-text-2 mb-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider">RSVPs</span>
                    </div>
                    <p className="text-2xl font-bold text-pr-text-1">{stats.totalRsvps}</p>
                    <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12% from last event
                    </p>
                </div>
                <div className="p-4 bg-white border border-pr-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-pr-text-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Check-ins</span>
                    </div>
                    <p className="text-2xl font-bold text-pr-text-1">{stats.totalCheckIns}</p>
                    <div className="w-full bg-gray-100 h-1 rounded-full mt-2 overflow-hidden">
                        <div
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: `${(stats.totalCheckIns / (stats.totalRsvps || 1)) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="p-4 bg-white border border-pr-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-pr-text-2 mb-2">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Tasks</span>
                    </div>
                    <p className="text-2xl font-bold text-pr-text-1">{stats.tasksDone}</p>
                    <p className="text-[10px] text-pr-text-3 mt-1">Proof submissions</p>
                </div>
                <div className="p-4 bg-white border border-pr-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-pr-text-2 mb-2">
                        <Bell className="w-4 h-4 text-pink-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Engagement</span>
                    </div>
                    <p className="text-2xl font-bold text-pr-text-1">{stats.engagement}</p>
                    <p className="text-[10px] text-pr-text-3 mt-1">Community score</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <Scan className="w-6 h-6" />
                        <h3 className="font-bold text-lg">Check-in Mode</h3>
                    </div>
                    <p className="text-sm text-purple-100 mb-6">
                        Start checking in attendees at the venue door.
                        Each scan will automatically track attendance and reward users.
                    </p>
                    <button className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 shadow-inner">
                        <Scan className="w-5 h-5" />
                        Launch Scanner
                    </button>
                </div>

                <div className="p-6 bg-pr-surface-2 border border-pr-border rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-6 h-6 text-pr-text-1" />
                        <h3 className="font-bold text-lg text-pr-text-1">Push Announcement</h3>
                    </div>
                    <form onSubmit={handleSendUpdate} className="space-y-4">
                        <textarea
                            value={updateText}
                            onChange={(e) => setUpdateText(e.target.value)}
                            placeholder="Send an update to all attendees (e.g., 'We're starting in 10 minutes!')"
                            className="w-full p-4 bg-white border border-pr-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-24"
                        />
                        <button
                            type="submit"
                            disabled={sendingUpdate || !updateText}
                            className="w-full py-3 bg-pr-text-1 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {sendingUpdate ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Send Announcement
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    const renderAttendees = () => (
        <div className="bg-white border border-pr-border rounded-2xl overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-pr-border bg-pr-surface-2 flex items-center justify-between">
                <h3 className="font-bold text-pr-text-1">Guest List ({attendees.length})</h3>
                <button onClick={fetchAttendees} className="text-xs text-purple-500 font-bold hover:underline">Refresh</button>
            </div>
            {fetchingAttendees ? (
                <div className="p-12 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : attendees.length === 0 ? (
                <div className="p-12 text-center text-pr-text-3">No one has RSVP'd yet.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-pr-surface-1 text-pr-text-3 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="px-6 py-3">Attendee</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Checked In</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pr-border">
                            {attendees.map((attendee) => (
                                <tr key={attendee.id} className="hover:bg-pr-surface-1 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {attendee.users?.profile_image ? (
                                                <img src={attendee.users.profile_image} className="w-8 h-8 rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                                                    {attendee.users?.display_name?.[0] || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-pr-text-1">{attendee.users?.display_name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-pr-text-3">@{attendee.users?.username || 'unknown'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-pr-text-2 capitalize">{attendee.status}</td>
                                    <td className="px-6 py-4">
                                        {attendee.checked_in_at ? (
                                            <span className="text-green-600 font-medium">{new Date(attendee.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        ) : (
                                            <span className="text-pr-text-3">Not yet</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!attendee.checked_in_at && (
                                            <button
                                                onClick={() => handleCheckIn(attendee)}
                                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600"
                                            >
                                                Check-in
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Nav */}
            <div className="flex border-b border-pr-border">
                {['overview', 'attendees', 'submissions', 'updates'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-4 text-sm font-bold capitalize transition-colors ${activeTab === tab
                            ? 'text-purple-500 border-b-2 border-purple-500'
                            : 'text-pr-text-3 hover:text-pr-text-1'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'attendees' && renderAttendees()}
            {(activeTab === 'submissions' || activeTab === 'updates') && (
                <div className="flex flex-col items-center justify-center py-20 text-pr-text-3">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>Building the {activeTab} list...</p>
                </div>
            )}
        </div>
    );
}
