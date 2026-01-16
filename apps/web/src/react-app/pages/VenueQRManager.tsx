import { useState, useEffect } from 'react';
import { QrCode, Plus, Download, Printer, TrendingUp, Users, ExternalLink, RefreshCw, MapPin, Palette, Type, MessageSquare, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '@/react-app/utils/api';
import { VenueQRPrintable } from '@/react-app/components/VenueQRPrintable';

interface VenueQR {
    id: string;
    venue_name: string;
    venue_type: string;
    referral_code: string;
    custom_message: string;
    call_to_action: string;
    primary_color: string;
    total_scans: number;
    total_signups: number;
    is_active: boolean;
    created_at: string;
}

export default function VenueQRManager() {
    const { toast } = useToast();
    const [vqrs, setVqrs] = useState<VenueQR[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedVqr, setSelectedVqr] = useState<VenueQR | null>(null);

    const [form, setForm] = useState({
        venue_name: '',
        venue_type: 'store',
        referral_code: '',
        custom_message: '',
        call_to_action: 'Join Promorang & earn rewards!',
        primary_color: '#8B5CF6'
    });

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        fetchVqrs();
    }, []);

    const fetchVqrs = async () => {
        try {
            setLoading(true);
            const response = await apiFetch('/api/venue-qr');
            const data = await response.json();
            if (data.status === 'success') {
                setVqrs(data.data.venue_qr_codes || []);
            }
        } catch (error) {
            console.error('Error fetching Venue QRs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const response = await apiFetch('/api/venue-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (data.status === 'success') {
                toast({ title: 'Success', description: 'Venue QR created!', type: 'success' });
                setVqrs([data.data.venue_qr_code, ...vqrs]);
                setShowCreate(false);
                setForm({
                    venue_name: '',
                    venue_type: 'store',
                    referral_code: '',
                    custom_message: '',
                    call_to_action: 'Join Promorang & earn rewards!',
                    primary_color: '#8B5CF6'
                });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create Venue QR', type: 'destructive' });
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-2 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-pr-text-1 flex items-center gap-3">
                            <QrCode className="h-8 w-8 text-blue-600" /> Venue QR Onboarding
                        </h1>
                        <p className="text-pr-text-2 mt-2">Generate printable QR codes for your IRL locations and onboard new users automatically.</p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-xl font-bold"
                        onClick={() => setShowCreate(true)}
                    >
                        <Plus className="mr-2 h-5 w-5" /> Create New Venue QR
                    </Button>
                </div>

                {vqrs.length === 0 && !showCreate ? (
                    <Card className="p-16 text-center border-dashed border-2 bg-pr-surface-1">
                        <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <QrCode className="h-10 w-10 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-pr-text-1 mb-2">No Venue QR Codes yet</h2>
                        <p className="text-pr-text-2 mb-8 max-w-sm mx-auto">
                            Create your first venue QR code to start onboarding people at your physical locations or events.
                        </p>
                        <Button onClick={() => setShowCreate(true)} size="lg" className="rounded-xl px-8">
                            Get Started
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* List Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {vqrs.map((vqr) => (
                                <Card
                                    key={vqr.id}
                                    className={`p-6 hover:shadow-xl transition-all cursor-pointer border-2 ${selectedVqr?.id === vqr.id ? 'border-blue-500 bg-blue-50/10' : 'border-transparent'}`}
                                    onClick={() => setSelectedVqr(vqr)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="h-14 w-14 rounded-2xl flex flex-col items-center justify-center text-white"
                                                style={{ backgroundColor: vqr.primary_color }}
                                            >
                                                <QrCode className="h-7 w-7" />
                                                <span className="text-[10px] font-black uppercase mt-0.5">{vqr.venue_type}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-pr-text-1">{vqr.venue_name}</h3>
                                                <div className="flex items-center gap-3 text-sm text-pr-text-2 mt-1">
                                                    <span className="font-mono bg-pr-surface-3 px-2 py-0.5 rounded uppercase">{vqr.referral_code}</span>
                                                    <span>•</span>
                                                    <span>Created {new Date(vqr.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full">
                                                <Printer className="h-5 w-5" />
                                            </Button>
                                            <ChevronRight className="h-5 w-5 text-pr-text-2 mt-2" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="bg-pr-surface-2 p-4 rounded-xl">
                                            <p className="text-xs font-bold text-pr-text-2 uppercase tracking-wider mb-1">Total Scans</p>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                                <span className="text-2xl font-black">{vqr.total_scans}</span>
                                            </div>
                                        </div>
                                        <div className="bg-pr-surface-2 p-4 rounded-xl">
                                            <p className="text-xs font-bold text-pr-text-2 uppercase tracking-wider mb-1">Total Signups</p>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-green-500" />
                                                <span className="text-2xl font-black">{vqr.total_signups}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Preview Section */}
                        <div className="lg:col-span-1">
                            {selectedVqr ? (
                                <div className="sticky top-8 space-y-6">
                                    <Card className="p-6 bg-pr-surface-1 overflow-hidden">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <Printer className="h-5 w-5" /> Printable Preview
                                        </h3>

                                        {/* Scale down to fit in card */}
                                        <div className="scale-[0.22] origin-top border shadow-sm pointer-events-none mb-4 mx-auto w-[210mm] h-[297mm]">
                                            <VenueQRPrintable
                                                venueName={selectedVqr.venue_name}
                                                venueType={selectedVqr.venue_type}
                                                referralCode={selectedVqr.referral_code}
                                                customMessage={selectedVqr.custom_message}
                                                callToAction={selectedVqr.call_to_action}
                                                primaryColor={selectedVqr.primary_color}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-12 rounded-xl" onClick={() => handlePrint()}>
                                                <Printer className="mr-2 h-5 w-5" /> Print Materials
                                            </Button>
                                            <Button variant="outline" className="w-full h-12 rounded-xl font-bold">
                                                <Download className="mr-2 h-5 w-5" /> Download PDF
                                            </Button>
                                        </div>
                                    </Card>

                                    {/* Copy Link */}
                                    <Card className="p-6 bg-pr-surface-1">
                                        <h3 className="text-sm font-bold text-pr-text-2 uppercase tracking-widest mb-3">Direct Scan Link</h3>
                                        <div className="flex gap-2">
                                            <input
                                                readOnly
                                                value={`${window.location.origin}/api/venue-qr/scan/${selectedVqr.id}`}
                                                className="flex-1 bg-pr-surface-2 border border-pr-surface-3 rounded-lg px-3 py-2 text-sm font-mono truncate"
                                            />
                                            <Button variant="ghost" className="h-10 w-10 p-0" onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/api/venue-qr/scan/${selectedVqr.id}`);
                                                toast({ title: 'Copied', description: 'Scan link copied to clipboard' });
                                            }}>
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            ) : (
                                <div className="sticky top-8 text-center p-12 bg-pr-surface-1/50 border-dashed border-2 rounded-3xl text-pr-text-2">
                                    <p>Select a venue QR to see preview and download printable materials</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Printer Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .venue-qr-printable, .venue-qr-printable * {
                        visibility: visible;
                    }
                    .venue-qr-printable {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 20mm;
                        box-shadow: none;
                    }
                }
            `}</style>

            {/* Hidden Print Container */}
            <div className="hidden print:block">
                {selectedVqr && (
                    <VenueQRPrintable
                        venueName={selectedVqr.venue_name}
                        venueType={selectedVqr.venue_type}
                        referralCode={selectedVqr.referral_code}
                        customMessage={selectedVqr.custom_message}
                        callToAction={selectedVqr.call_to_action}
                        primaryColor={selectedVqr.primary_color}
                    />
                )}
            </div>

            {/* Simple Modal Backdrop for creation */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="max-w-xl w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            className="absolute top-4 right-4 text-pr-text-2 hover:text-pr-text-1"
                            onClick={() => setShowCreate(false)}
                        >
                            <ChevronRight className="h-6 w-6 rotate-90" />
                        </button>
                        <h2 className="text-2xl font-black text-pr-text-1 mb-1">Create Venue QR</h2>
                        <p className="text-pr-text-2 mb-8">Set up your new physical location onboarding system.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-500" /> Venue Name</label>
                                    <input
                                        required
                                        value={form.venue_name}
                                        onChange={e => setForm({ ...form, venue_name: e.target.value })}
                                        placeholder="e.g. Skyline Event Space"
                                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-surface-3 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> Type</label>
                                    <select
                                        value={form.venue_type}
                                        onChange={e => setForm({ ...form, venue_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-surface-3 rounded-xl"
                                    >
                                        <option value="store">Store / Location</option>
                                        <option value="event">Event / Party</option>
                                        <option value="booth">Booth / Stand</option>
                                        <option value="restaurant">Restaurant</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><Palette className="h-4 w-4 text-blue-500" /> Primary Color</label>
                                <div className="flex gap-3">
                                    {['#8B5CF6', '#3B82F6', '#EF4444', '#10B981', '#F59E0B'].map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`h-10 w-10 rounded-full border-4 ${form.primary_color === color ? 'border-pr-text-1 shadow-lg' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setForm({ ...form, primary_color: color })}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={form.primary_color}
                                        onChange={e => setForm({ ...form, primary_color: e.target.value })}
                                        className="h-10 w-10 p-0 border-none bg-transparent cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-blue-500" /> Promo Message</label>
                                <textarea
                                    value={form.custom_message}
                                    onChange={e => setForm({ ...form, custom_message: e.target.value })}
                                    rows={2}
                                    placeholder="e.g. Scan to support our growth and earn Gems instantly!"
                                    className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-surface-3 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><Type className="h-4 w-4 text-blue-500" /> Call to Action</label>
                                <input
                                    value={form.call_to_action}
                                    onChange={e => setForm({ ...form, call_to_action: e.target.value })}
                                    placeholder="e.g. Join the Movement"
                                    className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-surface-3 rounded-xl"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-2xl"
                                disabled={creating}
                            >
                                {creating ? <RefreshCw className="h-6 w-6 animate-spin" /> : 'Create and Generate QR'}
                            </Button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
