import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GUIDE_STEPS, type GuideStep } from '../data/guideSteps';
import { CheckCircle, Circle, ChevronRight, X, Trophy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SuccessGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SuccessGuide({ isOpen, onClose }: SuccessGuideProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    // const [isOpen, setIsOpen] = useState(true); // Moved to Layout.tsx
    const [progress, setProgress] = useState<string[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        fetchProgress();
    }, [user]);

    const fetchProgress = async () => {
        try {
            // setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                // setLoading(false);
                return;
            }

            const response = await fetch('/api/users/guide-progress', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProgress(data.progress || []);
            }
        } catch (error) {
            console.error('Failed to fetch guide progress', error);
        } finally {
            // setLoading(false);
        }
    };

    const handleAction = async (step: GuideStep) => {
        // Optimistically update UI specific to logic if needed, 
        // but for specific actions we might rely on the page visit 
        // or a manual 'Mark as Done' if we can't auto-track everything easily yet.
        // For now, let's navigate.
        navigate(step.link);

        // In a real implementation, we might want to auto-complete some steps based on events.
        // For this MVP, we will auto-mark it as 'viewed/attempted' OR provide a checkbox.
        // Let's implement a manual checkbox for the user to mark "Done" for flexibility,
        // or auto-mark simple navigation tasks.
    };

    const toggleCompletion = async (stepId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const isCompleted = progress.includes(stepId);
        const newStatus = !isCompleted;

        // Optimistic update
        setProgress(prev =>
            newStatus ? [...prev, stepId] : prev.filter(id => id !== stepId)
        );

        try {
            await fetch('/api/users/guide-progress/step', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    guide_id: 'success_guide',
                    step_id: stepId,
                    is_completed: newStatus
                })
            });
        } catch (error) {
            console.error('Failed to update step', error);
            // Revert on error
            setProgress(prev =>
                !newStatus ? [...prev, stepId] : prev.filter(id => id !== stepId)
            );
        }
    };

    const completedCount = progress.length;
    const totalSteps = GUIDE_STEPS.length;
    const completionPercentage = Math.round((completedCount / totalSteps) * 100);

    if (!isOpen) return null;

    // if (loading) return null; // Removed to prevent widget from hiding unexpectedly

    // Don't show if all done and minimized/closed previously? 
    // For now, let's keep it visible until explicitly closed.

    return (
        <div className={`fixed bottom-4 right-4 z-[9999] transition-all duration-300 ${isMinimized ? 'w-auto' : 'w-80 md:w-96'} shadow-2xl`}>
            <div className="bg-pr-surface-card rounded-2xl shadow-2xl border border-pr-border overflow-hidden">
                {/* Header */}
                <div
                    className="bg-slate-900 text-white p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setIsMinimized(!isMinimized)}
                >
                    <div className="flex items-center space-x-3">
                        {/* Debug Indicator - Remove later */}
                        {/* <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute top-0 right-0"></div> */}
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center font-bold text-sm">
                                {completionPercentage}%
                            </div>
                            {/* SVG Circle Progress could go here */}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Success Guide</h3>
                            <p className="text-xs text-slate-400">{completedCount}/{totalSteps} steps completed</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isMinimized ? <ChevronRight className="w-5 h-5" /> : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                }}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {!isMinimized && (
                    <div className="max-h-[400px] overflow-y-auto">
                        {GUIDE_STEPS.map((step) => {
                            const isCompleted = progress.includes(step.id);
                            const StepIcon = step.icon;

                            return (
                                <div
                                    key={step.id}
                                    className={`p-4 border-b border-pr-border hover:bg-pr-surface-2 transition-colors cursor-pointer group ${isCompleted ? 'bg-pr-surface-2' : ''}`}
                                    onClick={() => handleAction(step)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <button
                                            onClick={(e) => toggleCompletion(step.id, e)}
                                            className={`mt-1 flex-shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                                        >
                                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                        </button>
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-semibold ${isCompleted ? 'text-pr-text-2 line-through' : 'text-pr-text-1'}`}>{step.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 mb-2">{step.description}</p>
                                            {!isCompleted && (
                                                <span className="text-xs text-blue-600 font-medium flex items-center group-hover:underline">
                                                    {step.actionLabel}
                                                    <ChevronRight className="w-3 h-3 ml-1" />
                                                </span>
                                            )}
                                        </div>
                                        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-gray-200 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                                            <StepIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {completionPercentage === 100 && (
                            <div className="p-6 text-center bg-green-50">
                                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2 animate-bounce" />
                                <h3 className="font-bold text-green-900">All Steps Completed!</h3>
                                <p className="text-sm text-green-700">You're a Promorang pro now.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
