const toQueryString = (params?: Record<string, string>) => {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null);
  if (entries.length === 0) return '';
  return `?${new URLSearchParams(Object.fromEntries(entries)).toString()}`;
};

const encodeSegment = (segment: string) => encodeURIComponent(segment);

export const Routes = {
  profile: (slug: string, params?: Record<string, string>) =>
    `/profile/${encodeSegment(slug)}${toQueryString(params)}`,
  campaign: (id: string) => `/campaigns/${encodeSegment(id)}`,
  advertiser: (id: string) => `/advertiser/campaigns/${encodeSegment(id)}`,
  drop: (id: string) => `/task/${encodeSegment(id)}`,
  coupon: (id: string) => `/coupon/${encodeSegment(id)}`,
};

export type RouteBuilder = typeof Routes;

export default Routes;
