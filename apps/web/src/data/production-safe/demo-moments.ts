import { demoMoments as fixtureMoments } from '../demo-moments';

/**
 * Demo Moments are development fixtures only.
 * Production surfaces must never resolve or act on them as durable Moments.
 */
export const demoMoments = import.meta.env.DEV ? fixtureMoments : [];
