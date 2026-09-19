import {
  CURATED_KINGSTON_MOMENTS as editorialMoments,
  CURATED_KINGSTON_SCENES,
} from '../curated-radar';

/**
 * Production-safe facade for editorial radar fixtures.
 *
 * Editorial Moments may still be indexed directly by explicitly editorial/sample
 * presentation surfaces, but production feed/detail resolution must not turn a
 * static fixture into an actionable Moment. The participant discovery feed uses
 * `.map()` and MomentDetail historically used `.find()`, so those collection
 * operations fail closed outside development.
 */
const moments = import.meta.env.DEV
  ? editorialMoments
  : new Proxy(editorialMoments, {
      get(target, property, receiver) {
        if (property === 'find' || property === 'findIndex') {
          return () => undefined;
        }
        if (property === 'map') {
          return () => [];
        }
        return Reflect.get(target, property, receiver);
      },
    });

export { CURATED_KINGSTON_SCENES };
export const CURATED_KINGSTON_MOMENTS = moments;
