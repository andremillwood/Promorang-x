import { useState } from 'react';
import { Share2 } from 'lucide-react';
import RelayModal from './RelayModal';
import { type RelayObjectType } from '../../hooks/useRelay';

interface RelayButtonProps {
    objectType: RelayObjectType;
    objectId: string;
    className?: string;
    showLabel?: boolean;
}

export default function RelayButton({ objectType, objectId, className = '', showLabel = true }: RelayButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsModalOpen(true);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 ${className}`}
            >
                <Share2 className="w-4 h-4" />
                {showLabel && <span>Relay</span>}
            </button>

            <RelayModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                objectType={objectType}
                objectId={objectId}
            />
        </>
    );
}
