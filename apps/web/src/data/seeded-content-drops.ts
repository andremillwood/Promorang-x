import type {
  ContentDistributionCampaign,
  ContentDistributionLeaderboardRow,
} from "@/hooks/useContentDistribution";

export const seededContentDrops: ContentDistributionCampaign[] = [
  {
    id: "seed-drop-release-room",
    owner_id: "seed-creator-maya",
    sponsor_id: "seed-sponsor-island",
    linked_moment_id: "demo-moment-1",
    title: "Release room: move the first-wave video",
    description:
      "A creator is launching a single with a short vertical video, then inviting the first listeners into a live listening room. Open the original, share it with attribution, and help the drop find its first audience.",
    objective_type: "content_launch",
    status: "active",
    starts_at: "2026-06-18T14:00:00.000Z",
    ends_at: "2026-06-27T03:59:00.000Z",
    reward_config: {
      base_points: 4,
      point_multiplier: 1.25,
      points_by_action: {
        click: 2,
        share: 8,
        repost: 10,
        comment: 5,
      },
    },
    promoshare_config: {
      enabled: true,
      actions: ["click", "share", "repost", "comment", "proof_verified"],
      entries_per_action: 2,
      entries_by_action: {
        share: 2,
        repost: 3,
        proof_verified: 5,
      },
    },
    budget_amount: 650,
    budget_currency: "USD",
    metadata: {
      seed: true,
      creator: "Maya Vale",
      sponsor: "Island Signal Co.",
      brief: "Drive the first 500 high-intent listeners and route them to the listening-room Moment.",
    },
    content_distribution_assets: [
      {
        id: "seed-asset-release-room-video",
        campaign_id: "seed-drop-release-room",
        creator_id: "seed-creator-maya",
        title: "30-second release video",
        description: "The original vertical video contributors should open, share, and cite.",
        asset_type: "video",
        target_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        media_url:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
        status: "active",
        attribution_slug: "maya-release-room",
        metadata: {
          platform: "youtube",
          recommended_caption: "First-wave listen. Save your receipt and meet us in the release room.",
        },
      },
    ],
  },
  {
    id: "seed-drop-market-run",
    owner_id: "seed-creator-kai",
    sponsor_id: "seed-sponsor-market",
    title: "Market run: repost the pickup reel",
    description:
      "A streetwear pop-up needs a clean redistribution wave before pickup day. Contributors repost the reel, invite one friend, and turn early online signal into tracked foot traffic.",
    objective_type: "share",
    status: "active",
    starts_at: "2026-06-19T15:00:00.000Z",
    ends_at: "2026-06-25T23:00:00.000Z",
    reward_config: {
      base_points: 3,
      point_multiplier: 1.1,
      points_by_action: {
        click: 1,
        share: 6,
        repost: 8,
        signup: 12,
      },
    },
    promoshare_config: {
      enabled: true,
      actions: ["click", "share", "repost", "signup", "conversion"],
      entries_per_action: 1,
      entries_by_action: {
        repost: 2,
        signup: 4,
        conversion: 8,
      },
    },
    budget_amount: 420,
    budget_currency: "USD",
    metadata: {
      seed: true,
      creator: "Kai Studio",
      sponsor: "Harbour Market",
      brief: "Build repost velocity and route interested buyers to the pickup list.",
    },
    content_distribution_assets: [
      {
        id: "seed-asset-market-run-reel",
        campaign_id: "seed-drop-market-run",
        creator_id: "seed-creator-kai",
        title: "Pickup-day reel",
        description: "A short product reel with a clear pickup call to action.",
        asset_type: "video",
        target_url: "https://www.instagram.com/promorang/",
        media_url:
          "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
        status: "active",
        attribution_slug: "market-run-pickup",
        metadata: {
          platform: "instagram",
          recommended_caption: "Repost, bring one friend, and check in on pickup day.",
        },
      },
    ],
  },
];

export const seededContentDropLeaderboards: Record<string, ContentDistributionLeaderboardRow[]> = {
  "seed-drop-release-room": [
    {
      id: "seed-release-stat-1",
      campaign_id: "seed-drop-release-room",
      user_id: "seed-user-asha",
      rank_position: 1,
      shares_count: 18,
      clicks_count: 92,
      engagements_count: 31,
      conversions_count: 6,
      points_earned: 164,
      promoshare_entries_earned: 42,
      distribution_score: 286,
      user: { id: "seed-user-asha", username: "asha.moves", display_name: "Asha Moves" },
    },
    {
      id: "seed-release-stat-2",
      campaign_id: "seed-drop-release-room",
      user_id: "seed-user-ren",
      rank_position: 2,
      shares_count: 11,
      clicks_count: 61,
      engagements_count: 19,
      conversions_count: 3,
      points_earned: 108,
      promoshare_entries_earned: 27,
      distribution_score: 188,
      user: { id: "seed-user-ren", username: "ren.signal", display_name: "Ren Signal" },
    },
  ],
  "seed-drop-market-run": [
    {
      id: "seed-market-stat-1",
      campaign_id: "seed-drop-market-run",
      user_id: "seed-user-nia",
      rank_position: 1,
      shares_count: 14,
      clicks_count: 74,
      engagements_count: 26,
      conversions_count: 9,
      points_earned: 146,
      promoshare_entries_earned: 35,
      distribution_score: 241,
      user: { id: "seed-user-nia", username: "nia.routes", display_name: "Nia Routes" },
    },
  ],
};

export function getSeededContentDrop(id?: string) {
  return seededContentDrops.find((drop) => drop.id === id);
}
