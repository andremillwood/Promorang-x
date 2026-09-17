import {
  CURATED_KINGSTON_MOMENTS as editorialMoments,
  CURATED_KINGSTON_SCENES,
} from '../curated-radar';

/**
 * Production-safe facade for editorial radar fixtures.
 *
 * Editorial Moments may still be mapped/sliced/indexed by presentation surfaces,
 * but production detail resolution must not turn a static fixture into an
 * actionable Moment. MomentDetail historically used `.find()` as that bridge,
 * so fail that lookup closed outside development while preserving read-only
 * editorial presentation elsewhere.
 */
const moments = import.meta.env.DEV
  ? editorialMoments
  : new Proxy(editorialMoments, {
      get(target, property, receiver) {
        if (property === 'find' || property === 'findIndex') {
          return () => undefined;
        }
        return Reflect.get(target, property, receiver);
      },
    });

export { CURATED_KINGSTON_SCENES };
export const CURATED_KINGSTON_MOMENTS = moments;
