export function hasCompletedOnboarding(
  preferences?: { preferred_categories?: string[] | null; preferredCategories?: string[] | null } | null,
): boolean {
  const categories = preferences?.preferred_categories ?? preferences?.preferredCategories ?? [];
  return categories.length > 0;
}

export type PostLoginState = {
  role?: string | null;
  finishedOnboarding: boolean;
  hostedMomentCount?: number;
  joinedMomentCount?: number;
  campaignCount?: number;
  venueCount?: number;
  offerCount?: number;
  creatorContentCount?: number;
  profileComplete?: boolean;
};

export function postLoginPath(state: PostLoginState): string {
  const hosted = (state.hostedMomentCount || 0) > 0;
  const joined = (state.joinedMomentCount || 0) > 0;
  const campaign = (state.campaignCount || 0) > 0;
  const venue = (state.venueCount || 0) > 0;
  const offer = (state.offerCount || 0) > 0;
  const published = (state.creatorContentCount || 0) > 0;

  switch (state.role) {
    case "admin":
      return "/admin?tab=command";
    case "brand":
      if (!state.finishedOnboarding) return "/onboarding/brand";
      if (!offer) return "/offers?template=promoshare-funded-cycle";
      if (!campaign) return "/create/campaign";
      return "/dashboard";
    case "merchant":
      if (!state.finishedOnboarding) return "/onboarding";
      if (!hosted) return "/?firstNight=true";
      if (!venue) return "/dashboard/venues/add?firstTime=true";
      return "/dashboard";
    case "host":
      if (!state.finishedOnboarding) return "/onboarding";
      if (!hosted) return "/?firstNight=true";
      return "/dashboard";
    case "creator":
      if (!state.finishedOnboarding) return "/onboarding";
      if (!offer) return "/offers?template=content-mission";
      if (!published) return "/dashboard?tab=publish";
      return "/dashboard?tab=missions";
    case "agency":
      if (!state.finishedOnboarding) return "/onboarding";
      return "/dashboard";
    case "participant":
    default:
      if (!state.finishedOnboarding) return "/onboarding";
      if (!joined && !hosted) return "/?firstNight=true";
      if (!joined) return "/discover?firstTime=true";
      if (!state.profileComplete) return "/dashboard/settings?firstTime=true";
      return "/dashboard";
  }
}
