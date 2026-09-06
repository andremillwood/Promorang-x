export type HostProfileStats = {
  momentsHosted: number;
  rating?: number;
  reviewCount: number;
};

export function buildHostProfileStats(input: {
  hostedCount?: number | null;
  ratings?: Array<number | null | undefined> | null;
}): HostProfileStats {
  const momentsHosted = Math.max(0, Number(input.hostedCount) || 0);
  const ratings = (input.ratings ?? []).filter((value): value is number =>
    typeof value === "number" && Number.isFinite(value) && value > 0,
  );

  if (!ratings.length) {
    return { momentsHosted, reviewCount: 0 };
  }

  const reviewCount = ratings.length;
  const rating = Math.round((ratings.reduce((sum, value) => sum + value, 0) / reviewCount) * 10) / 10;
  return { momentsHosted, rating, reviewCount };
}

export function hasHostResponseRate(responseRate?: number | null): responseRate is number {
  return typeof responseRate === "number" && Number.isFinite(responseRate);
}
