/**
 * HouseSelectionGate Component
 * 
 * Forces house selection for Day 0 users before Today loads.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ChevronRight } from 'lucide-react';
import { HOUSES, type House } from '../../types/todayGame';
import { selectHouse } from '../../lib/mockTodayApi';

interface HouseSelectionGateProps {
    onHouseSelected: (houseId: string) => void;
}

export function HouseSelectionGate({ onHouseSelected }: HouseSelectionGateProps) {
    const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!selectedHouse || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await selectHouse(selectedHouse);
            onHouseSelected(selectedHouse);
        } catch (e) {
            console.error('Failed to select house:', e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex flex-col items-center justify-center p-6">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">
                    Choose Your House
                </h1>
                <p className="text-zinc-400 max-w-md">
                    Join a House to compete in the District Wars.
                    Your actions earn points for your House.
                </p>
            </motion.div>

            {/* House grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8">
                {HOUSES.map((house, index) => (
                    <motion.button
                        key={house.id}
                        className={`
                            relative p-5 rounded-xl border-2 text-left
                            transition-all duration-200
                            ${selectedHouse === house.id
                                ? 'border-white bg-white/10'
                                : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/50'
                            }
                        `}
                        onClick={() => setSelectedHouse(house.id)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Selected indicator */}
                        {selectedHouse === house.id && (
                            <motion.div
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <span className="text-xs">✓</span>
                            </motion.div>
                        )}

                        {/* House icon */}
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-3"
                            style={{ backgroundColor: `${house.color}20` }}
                        >
                            {house.icon}
                        </div>

                        {/* House name */}
                        <h3
                            className="font-bold text-lg mb-1"
                            style={{ color: house.color }}
                        >
                            {house.name}
                        </h3>

                        {/* Motto */}
                        <p className="text-xs text-zinc-400 italic">
                            "{house.motto}"
                        </p>
                    </motion.button>
                ))}
            </div>

            {/* Confirm button */}
            <motion.button
                className={`
                    px-8 py-4 rounded-xl font-bold text-lg
                    flex items-center gap-2
                    transition-all duration-200
                    ${selectedHouse
                        ? 'bg-white text-black hover:bg-zinc-200'
                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    }
                `}
                disabled={!selectedHouse || isSubmitting}
                onClick={handleConfirm}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Joining...
                    </>
                ) : (
                    <>
                        Join the Fight
                        <ChevronRight className="w-5 h-5" />
                    </>
                )}
            </motion.button>

            {/* Note */}
            <motion.p
                className="text-xs text-zinc-500 mt-4 text-center max-w-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                Your House is permanent for this season. Choose wisely!
            </motion.p>
        </div>
    );
}
