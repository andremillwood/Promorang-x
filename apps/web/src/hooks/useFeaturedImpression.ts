/**
 * USE FEATURED IMPRESSION HOOK
 * 
 * Tracks when featured placements are viewed by users.
 * Implements debouncing to prevent duplicate impressions.
 */

import { useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Track which placements have been impressed in this session
const impressedPlacements = new Set<string>();

export function useFeaturedImpression() {
  const { token } = useAuth();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const trackImpression = useCallback(async (placementId: string) => {
    // Don't track if already impressed in this session
    if (impressedPlacements.has(placementId)) {
      return;
    }

    // Debounce to prevent rapid-fire tracking
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/featured-marketplace/${placementId}/record-impression`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          }
        );

        if (response.ok) {
          // Mark as impressed
          impressedPlacements.add(placementId);
          console.log(`[Featured] Impression recorded for ${placementId}`);
        }
      } catch (error) {
        // Silent fail - don't break UX for analytics
        console.error('[Featured] Failed to track impression:', error);
      }
    }, 1000); // 1 second debounce
  }, [token]);

  return { trackImpression };
}

/**
 * USE FEATURED CLICK HOOK
 * 
 * Tracks when users click on featured placements.
 */
export function useFeaturedClick() {
  const { token } = useAuth();

  const trackClick = useCallback(async (placementId: string) => {
    try {
      const response = await fetch(
        `/api/featured-marketplace/${placementId}/record-click`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );

      if (response.ok) {
        console.log(`[Featured] Click recorded for ${placementId}`);
      }
    } catch (error) {
      // Silent fail
      console.error('[Featured] Failed to track click:', error);
    }
  }, [token]);

  return { trackClick };
}
