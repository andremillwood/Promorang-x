import {
  CURATED_DISCOVERIES,
  DISCOVERY_POLLS,
  getActiveDiscoveryPolls as getFixtureActiveDiscoveryPolls,
  getAllCuratedDiscoveries as getFixtureCuratedDiscoveries,
  getAllDiscoveryPolls as getFixtureDiscoveryPolls,
  getCuratedDiscoveryBySlug as getFixtureCuratedDiscoveryBySlug,
  getDiscoveryPollByIdOrSlug as getFixtureDiscoveryPollByIdOrSlug,
  isActiveDiscoveryPoll,
} from '../discoveriesData';

export type {
  DiscoveryComment,
  DiscoveryOption,
  DiscoveryPoll,
  OptionRecommendation,
  SquadRewardGoal,
} from '../discoveriesData';

export { CURATED_DISCOVERIES, DISCOVERY_POLLS, isActiveDiscoveryPoll };

/**
 * Static Discovery data remains available to explicit sample/editorial consumers,
 * but production participant discovery cannot treat those fixtures as recorded
 * demand or approved canonical Discovery records.
 */
export const getActiveDiscoveryPolls = () =>
  import.meta.env.DEV ? getFixtureActiveDiscoveryPolls() : [];

export const getAllDiscoveryPolls = () =>
  import.meta.env.DEV ? getFixtureDiscoveryPolls() : [];

export const getDiscoveryPollByIdOrSlug = (idOrSlug: string) =>
  import.meta.env.DEV ? getFixtureDiscoveryPollByIdOrSlug(idOrSlug) : undefined;

export const getAllCuratedDiscoveries = () =>
  import.meta.env.DEV ? getFixtureCuratedDiscoveries() : [];

export const getCuratedDiscoveryBySlug = (slug: string) =>
  import.meta.env.DEV ? getFixtureCuratedDiscoveryBySlug(slug) : undefined;
