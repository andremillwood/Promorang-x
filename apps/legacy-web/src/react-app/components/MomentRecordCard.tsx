import React from 'react';
import { ShieldCheck, Calendar, Hash, FileText, CheckCircle } from 'lucide-react';

interface MomentRecordProps {
    momentTitle: string;
    momentType: string;
    redeemedAt: string;
    closedAt: string;
    recordHash: string;
    verificationStatus: 'VERIFIED';
}

export function MomentRecordCard({ record }: { record: MomentRecordProps }) {
    const shortHash = record.recordHash.substring(0, 12) + '...';

    // Type-based colors
    const typeColors: Record<string, string> = {
        physical_event: 'bg-orange-100 text-orange-700',
        digital_drop: 'bg-blue-100 text-blue-700',
        content_premiere: 'bg-purple-100 text-purple-700',
        retail_activation: 'bg-emerald-100 text-emerald-700',
    };

    const badgeColor = typeColors[record.momentType] || 'bg-gray-100 text-gray-700';
    const displayType = record.momentType.replace('_', ' ').toUpperCase();

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">

            {/* Watermark Effect */}
            <div className="absolute -right-6 -top-6 text-gray-50 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                <ShieldCheck size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeColor}`}>
                        {displayType}
                    </span>
                    <div className="flex items-center text-green-600 space-x-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        <CheckCircle size={12} />
                        <span className="text-[10px] font-medium">VERIFIED RECORD</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                    {record.momentTitle}
                </h3>

                <div className="space-y-2 mt-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Redeemed: {new Date(record.redeemedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Hash size={14} className="text-gray-400" />
                        <span className="font-mono text-xs bg-gray-50 px-1 py-0.5 rounded border border-gray-100 text-gray-500">
                            {shortHash}
                        </span>
                    </div>
                </div>

                {/* Action / View details (Mock) */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center transition-colors">
                        <FileText size={12} className="mr-1" />
                        View Artifact Data
                    </button>
                </div>
            </div>
        </div>
    );
}
