const toQueryString = (params?: Record<string, string>) => {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null);
  if (entries.length === 0) return '';
  return `?${new URLSearchParams(Object.fromEntries(entries)).toString()}`;
};

const encodeSegment = (segment: string) => encodeURIComponent(segment);

export const slugifyUserIdentifier = (value: string) => {
  if (!value) return 'creator';
  return encodeSegment(
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^[-_]+|[-_]+$/g, '') || 'creator'
  );
};

export const Routes = {
  profile: (slug: string, params?: Record<string, string>) =>
    `/profile/${slugifyUserIdentifier(slug)}${toQueryString(params)}`,
  publicProfile: (slug: string, params?: Record<string, string>) =>
    `/users/${slugifyUserIdentifier(slug)}${toQueryString(params)}`,
  campaign: (id: string) => `/campaigns/${encodeSegment(id)}`,
  advertiser: (id: string) => `/advertiser/campaigns/${encodeSegment(id)}`,
  drop: (id: string) => `/task/${encodeSegment(id)}`,
  coupon: (id: string) => `/coupon/${encodeSegment(id)}`,
};

export type RouteBuilder = typeof Routes;

export default Routes;
