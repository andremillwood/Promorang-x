import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, Share2 } from 'lucide-react';

interface MomentAnchorProps {
    anchor: string;
    label?: string;
}

export default function MomentAnchor({ anchor, label = "MOMENT ANCHOR" }: MomentAnchorProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(anchor);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-pr-surface-2 border border-pr-border rounded-xl p-4 relative overflow-hidden group max-w-sm mx-auto shadow-sm">
            {/* Watermark Background */}
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <ShieldCheck size={100} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 border-b border-pr-border/30 pb-2">
                    <span className="text-[10px] font-black tracking-[0.2em] text-pr-text-3 uppercase">
                        {label}
                    </span>
                    <ShieldCheck size={14} className="text-pr-text-3" />
                </div>

                <div className="font-mono text-sm font-bold text-pr-text-1 tracking-wider break-all mb-4 text-center py-2 px-3 bg-white/50 rounded border border-pr-border/20">
                    {anchor}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-pr-text-1 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                        {copied ? (
                            <>
                                <Check size={14} />
                                COPIED
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                COPY ANCHOR
                            </>
                        )}
                    </button>
                    <button
                        className="p-2 rounded-lg border border-pr-border hover:bg-pr-surface-1 transition-colors text-pr-text-2"
                        title="Share Artifact"
                    >
                        <Share2 size={16} />
                    </button>
                </div>

                <p className="mt-4 text-[9px] text-pr-text-3 text-center leading-tight">
                    This anchor confirms your verified presence at this moment.
                    Paste it in your social caption to bridge the expression.
                </p>
            </div>
        </div>
    );
}
