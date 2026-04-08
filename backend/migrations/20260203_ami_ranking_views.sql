-- =============================================
-- MIGRATION: AMI RANKING VIEWS AND LOGIC
-- DATE: 2026-02-03
-- DESCRIPTION: Implementation of the ranking logic for the Activation Mechanics Index.
-- =============================================

-- 1. Create a function to re-calculate reliability scores
-- Formula: Score = (BaseScore * 0.3) + (CompletionRate * 0.4) + (VolumeBonus * 0.3)
CREATE OR REPLACE FUNCTION calculate_mechanic_reliability(
    base_score DECIMAL,
    completion_rate DECIMAL,
    total_volume INTEGER
) RETURNS DECIMAL AS $$
DECLARE
    volume_bonus DECIMAL;
BEGIN
    -- Logarithmic volume bonus capped at 100
    IF total_volume > 0 THEN
        volume_bonus := LEAST(100, LN(total_volume) * 10);
    ELSE
        volume_bonus := 0;
    END IF;

    RETURN (base_score * 0.3) + (completion_rate * 0.4) + (volume_bonus * 0.3);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 2. Create the View for Top Mechanics
-- This view joins the definition with the metrics for easy querying
CREATE OR REPLACE VIEW view_ranked_mechanics AS
SELECT 
    am.id,
    am.name,
    am.description,
    am.category,
    am.proof_type,
    am.difficulty,
    am.primary_outcome,
    am.secondary_outcomes,
    am.is_seeded,
    mm.total_instances,
    mm.total_participants,
    mm.avg_completion_rate,
    mm.avg_cost_per_action,
    mm.reliability_score
FROM 
    activation_mechanics am
LEFT JOIN 
    mechanic_metrics mm ON am.id = mm.mechanic_id;


-- 3. Create a trigger to update metrics when a Moment ends (Stub for now)
-- In a real system, verification events would trigger this. 
-- For now, we rely on background jobs or manual refresh.

-- Example Function to update metrics based on verified check-ins
CREATE OR REPLACE FUNCTION update_mechanic_metrics(mechanic_uuid UUID) RETURNS VOID AS $$
BEGIN
    -- This would typically aggregate data from a 'verifications' or 'checkins' table
    -- For now, it's a placeholder logic
    NULL;
END;
$$ LANGUAGE plpgsql;
