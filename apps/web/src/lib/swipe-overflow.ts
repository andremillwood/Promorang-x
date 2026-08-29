export type SwipeOverflowState = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  overflows: boolean;
};

export function getSwipeOverflowState(
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number,
  threshold = 8,
): SwipeOverflowState {
  const maxScroll = Math.max(0, scrollWidth - clientWidth);
  return {
    canScrollLeft: scrollLeft > threshold,
    canScrollRight: maxScroll - scrollLeft > threshold,
    overflows: maxScroll > threshold,
  };
}

export function getNearestSwipeIndex(
  itemCenters: number[],
  viewportMidpoint: number,
): number {
  if (!itemCenters.length) return 0;
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  itemCenters.forEach((center, index) => {
    const distance = Math.abs(center - viewportMidpoint);
    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  });
  return nearest;
}
