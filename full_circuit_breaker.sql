-- FULL CIRCUIT BREAKER IMPLEMENTATION
-- Complete check_circuit_breaker function
-- Run this AFTER amm_migration_no_declare.sql has succeeded

DROP FUNCTION IF EXISTS public.check_circuit_breaker(uuid, numeric, numeric);

CREATE OR REPLACE FUNCTION public.check_circuit_breaker(
    p_pool_id uuid,
    p_price_before numeric,
    p_price_after numeric
)
RETURNS boolean
LANGUAGE plpgsql
AS $func$
DECLARE
    breaker_rec record;
    price_chg_pct numeric;
    is_trig boolean := false;
    reason_txt text;
    reset_time timestamptz;
BEGIN
    -- Get breaker configuration
    SELECT *
    INTO breaker_rec
    FROM public.piece_circuit_breakers
    WHERE pool_id = p_pool_id
    LIMIT 1;

    -- No breaker configured
    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Check if already in cooldown
    IF breaker_rec.is_triggered THEN
        IF breaker_rec.reset_at > now() THEN
            RETURN true;
        ELSE
            -- Auto-reset the breaker
            UPDATE public.piece_circuit_breakers
            SET is_triggered = false,
                reset_at = null,
                triggered_at = null,
                trigger_reason = null,
                updated_at = now()
            WHERE id = breaker_rec.id;
            RETURN false;
        END IF;
    END IF;

    -- Calculate price change percentage
    IF p_price_before > 0 THEN
        price_chg_pct := abs((p_price_after - p_price_before) / p_price_before * 100);
    ELSE
        price_chg_pct := 0;
    END IF;

    -- Check against 1-hour limit
    IF price_chg_pct > breaker_rec.max_price_change_1h_percent THEN
        is_trig := true;
        reason_txt := format('Price moved %.2f%% in 1 hour (limit: %.2f%%)', 
                            price_chg_pct, breaker_rec.max_price_change_1h_percent);
    END IF;

    -- If triggered, update breaker and create alert
    IF is_trig THEN
        reset_time := now() + (breaker_rec.cooldown_minutes || ' minutes')::interval;
        
        UPDATE public.piece_circuit_breakers
        SET is_triggered = true,
            triggered_at = now(),
            trigger_reason = reason_txt,
            last_triggered_at = now(),
            triggered_count = triggered_count + 1,
            reset_at = reset_time,
            updated_at = now()
        WHERE id = breaker_rec.id;

        -- Create alert
        INSERT INTO public.piece_price_alerts (
            pool_id,
            alert_type,
            severity,
            message,
            details
        ) VALUES (
            p_pool_id,
            'circuit_breaker',
            'critical',
            reason_txt,
            jsonb_build_object(
                'price_before', p_price_before,
                'price_after', p_price_after,
                'price_change_percent', price_chg_pct
            )
        );

        -- Pause the pool
        UPDATE public.piece_liquidity_pools
        SET status = 'paused',
            updated_at = now()
        WHERE id = p_pool_id;
    END IF;

    RETURN is_trig;
END;
$func$;

SELECT 'Circuit breaker function created successfully!' as status;
