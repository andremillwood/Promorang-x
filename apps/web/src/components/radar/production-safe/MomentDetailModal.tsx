import type { MomentProps } from '../MomentCard';
import {
  MomentDetailModal as DemoMomentDetailModal,
  getSubMomentsForMoment as getDemoSubMomentsForMoment,
} from '../MomentDetailModal';
import type { SubMoment } from '../MomentDetailModal';

/**
 * The radar modal's mission generator is a design/demo fixture. It derives
 * missions, point values and rewards from title/venue heuristics, so it must
 * never be treated as production Moment inventory.
 */
export const MomentDetailModal = DemoMomentDetailModal;
export type { SubMoment };

export function getSubMomentsForMoment(moment: MomentProps | null): SubMoment[] {
  return import.meta.env.DEV ? getDemoSubMomentsForMoment(moment) : [];
}
