import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EvidenceItem } from './EvidenceFeed';
import { Download, Share2, CheckCircle2, TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';
import { formatCurrency, formatCompactNumber } from './utils';
import { Badge } from '@/components/ui/badge';

// We typically would pass in actual metrics, but we'll mock them similar to the feed for demonstration
interface AutomatedRecapProps {
    isOpen: boolean;
    onClose: () => void;
    campaignName: string;
    totalSpent: number;
    totalParticipants: number;
    roi: number; // Cost per participant
    evidenceItems: EvidenceItem[]; // We'll assume these are passed in from the parent
}

export function AutomatedRecap({
    isOpen,
    onClose,
    campaignName,
    totalSpent,
    totalParticipants,
    roi,
    evidenceItems
}: AutomatedRecapProps) {
    const [isWhiteLabel, setIsWhiteLabel] = useState(false);

    // For printing/PDF, we can just trigger window.print() and hide other elements with CSS 
    // (@media print { ... }) or we could use jsPDF in a real app.
    const handleDownload = () => {
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border/50 shadow-2xl">
                {/* Action Bar (hidden in print) */}
                <div className="absolute top-4 right-4 z-50 flex gap-2 print:hidden">
                    <Button variant="outline" size="sm" onClick={() => setIsWhiteLabel(!isWhiteLabel)} className="bg-background/80 backdrop-blur-sm border-dashed">
                        {isWhiteLabel ? "Disable White-Label" : "Enable White-Label"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="bg-background/80 backdrop-blur-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button variant="hero" size="sm" className="shadow-lg">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Report
                    </Button>
                </div>

                {/* Report Container */}
                <div className="p-8 md:p-12 max-h-[85vh] overflow-y-auto" id="recap-print-area">
                    
                    {/* Header */}
                    <div className="border-b border-border mb-8 pb-8 text-center pt-4 relative">
                        {isWhiteLabel && (
                            <div className="flex justify-center mb-6">
                                <div className="h-14 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl px-8 flex items-center justify-center shadow-2xl">
                                    <span className="font-serif font-black text-xl tracking-[0.2em] text-white">APEX <span className="text-slate-400 font-sans font-light tracking-widest text-sm">AGENCY</span></span>
                                </div>
                            </div>
                        )}

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 mb-6 text-xs font-bold tracking-widest uppercase">
                            <CheckCircle2 className="w-4 h-4" />
                            Verified Outcome Report
                        </div>
                        <h1 className="text-4xl font-serif font-bold tracking-tighter mb-2">
                            {campaignName}
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            {isWhiteLabel ? (
                                "Independently Verified Campaign Metrics"
                            ) : (
                                "Powered by Promorang Proof Infrastructure"
                            )}
                        </p>
                    </div>

                    {/* Executive Summary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-secondary/50 rounded-2xl p-6 border border-border/50 text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Verified Actions</h3>
                            <p className="text-4xl font-black text-foreground">{formatCompactNumber(totalParticipants)}</p>
                        </div>
                        
                        <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10 text-center">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Cost Per Action (CAC)</h3>
                            <p className="text-4xl font-black text-emerald-600">{formatCurrency(roi)}</p>
                            <p className="text-xs text-emerald-600/70 mt-2 font-medium">42% better than average ad spend</p>
                        </div>

                        <div className="bg-secondary/50 rounded-2xl p-6 border border-border/50 text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Capital Deployed</h3>
                            <p className="text-4xl font-black text-foreground">{formatCurrency(totalSpent)}</p>
                        </div>
                    </div>

                    {/* Evidence Gallery */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-serif font-bold mb-6">Visual Evidence Gallery</h2>
                        {evidenceItems && evidenceItems.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {evidenceItems.filter(e => e.media_url).map(item => (
                                    <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-border/50">
                                        <img src={item.media_url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                                            <p className="text-white font-bold text-sm truncate">{item.user_name}</p>
                                            <p className="text-white/80 text-xs truncate">@ {item.location}</p>
                                            <div className="mt-2 flex items-center gap-1">
                                                <Badge className="bg-emerald-500/80 hover:bg-emerald-500/80 text-[9px] uppercase tracking-tighter px-1.5 py-0">Verified</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                                <p className="text-muted-foreground">Gathering visual evidence...</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Smart Scale CTA */}
                    <div className="mt-12 bg-primary/5 rounded-2xl p-8 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-1">Scale This Campaign</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Your campaign is performing exceptionally well. Increase your budget now to capture 
                                an estimated 500 more verified actions at this low CAC.
                            </p>
                        </div>
                        <Button variant="hero" size="lg" className="shrink-0 w-full md:w-auto shadow-xl shadow-primary/20">
                            Scale Budget
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
