// AMI v2 Types - Strict Schema

export type MechanicCategory = 'IRL' | 'Digital' | 'Hybrid';

export type MechanicProofType = 'QR' | 'GPS' | 'Photo' | 'Video' | 'API' | 'Code';

export type MechanicOutcome =
    | 'foot_traffic'
    | 'ugc'
    | 'social_follows'
    | 'app_download'
    | 'sales';

export type MechanicDifficulty = 'Low' | 'Medium' | 'High';

export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export interface ActivationMechanic {
    id: string;
    slug: string;
    version: number;
    status: 'draft' | 'active' | 'deprecated';
    name: string;
    description: string;
    category: MechanicCategory;
    proof_type: MechanicProofType;
    difficulty: MechanicDifficulty;
    total_instances?: number;

    // Outcome & Value
    primary_outcome: MechanicOutcome;
    expected_action_unit?: string; // e.g. "Verified Check-in"

    // Context
    recommended_context_tags: string[];
    disallowed_context_tags: string[];

    // Metrics (computed from view)
    reliability_score: number; // 0-100
    confidence_level: ConfidenceLevel;
    total_participants: number;
    avg_cost_per_action?: number;
    smoothed_completion_rate?: number;
    fraud_rate?: number;

    // Constraints
    min_audience_size: number;
    max_audience_size?: number;
    min_duration_minutes?: number;
    evidence_requirements?: string[];


    created_at?: string;
}
