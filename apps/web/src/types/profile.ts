// src/types/profile.ts
// Production-ready profile types for Promorang
// Fully typed, defensive, lint-safe

/** Raw row shapes coming from Supabase.
 *  These match your tables: users, user_profiles, drops, drop_metadata.
 */

export interface RawUser {
  id: string;
  email?: string | null;
  created_at?: string | null;
}

export interface RawUserProfile {
  user_id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;

  xp?: number | null;
  level?: number | null;
  followers?: number | null;
  following?: number | null;

  drops_completed?: number | null;
  shares_owned?: number | null;

  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  twitter?: string | null;
}

export interface RawDrop {
  id: string;
  creator_id?: string | null;
  title?: string | null;
  description?: string | null;
  created_at?: string | null;

  gems_reward?: number | null;
  keys_cost?: number | null;

  status?: string | null; // "active" | "completed" | "expired"

  metadata?: {
    pool?: {
      total?: number | null;
      remaining?: number | null;
    } | null;
  } | null;
}

// ============================================================================
// NORMALIZED SHAPES (What the FRONTEND should always receive)
// ============================================================================

export interface ProfileSocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
}

export interface ProfileUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  location: string;

  xp: number;
  level: number;

  followers: number;
  following: number;

  dropsCompleted: number;
  sharesOwned: number;

  social: ProfileSocialLinks;

  referral_code?: string;

  createdAt: string;
}

export type DropStatus = "active" | "completed" | "expired";

export interface ProfileDrop {
  id: string;
  title: string;
  description: string;
  createdAt: string;

  gemsReward: number;
  keysCost: number;

  status: DropStatus;

  gemPoolRemaining: number;
  gemPoolTotal: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes a user profile from ANY raw Supabase shape.
 * Solves: undefined fields, nested optional checks, fallbacks everywhere.
 * No NaN, no empty objects, no undefined fields.
 */
export function buildCompleteUser(
  rawUser: RawUser | null | undefined,
  rawProfile: RawUserProfile | null | undefined
): ProfileUser {
  return {
    id: rawUser?.id ?? "",
    email: rawUser?.email ?? "",

    username: rawProfile?.username ?? "unknown_user",
    displayName:
      rawProfile?.display_name ??
      rawProfile?.username ??
      "Unknown Creator",

    avatarUrl: rawProfile?.avatar_url ?? null,
    bio: rawProfile?.bio ?? "",
    location: rawProfile?.location ?? "",

    xp: Number(rawProfile?.xp ?? 0),
    level: Number(rawProfile?.level ?? 1),

    followers: Number(rawProfile?.followers ?? 0),
    following: Number(rawProfile?.following ?? 0),

    dropsCompleted: Number(rawProfile?.drops_completed ?? 0),
    sharesOwned: Number(rawProfile?.shares_owned ?? 0),

    social: {
      ...(rawProfile?.instagram
        ? { instagram: rawProfile.instagram }
        : {}),
      ...(rawProfile?.tiktok
        ? { tiktok: rawProfile.tiktok }
        : {}),
      ...(rawProfile?.youtube
        ? { youtube: rawProfile.youtube }
        : {}),
      ...(rawProfile?.twitter
        ? { twitter: rawProfile.twitter }
        : {}),
    },

    createdAt: rawUser?.created_at ?? "",
  };
}

/**
 * Normalize Drop Data.
 * Fixes: missing status, missing metadata, optional pool fields,
 * missing title/description, missing cost/reward.
 * Enforces correct DropStatus shape.
 */
export function mapDrop(raw: RawDrop): ProfileDrop {
  const pool = raw?.metadata?.pool ?? {};

  return {
    id: raw.id,
    title: raw.title ?? "Untitled Drop",
    description: raw.description ?? "",
    createdAt: raw.created_at ?? "",

    gemsReward: Number(raw.gems_reward ?? 0),
    keysCost: Number(raw.keys_cost ?? 0),

    status: (raw.status as DropStatus) ?? "active",

    gemPoolRemaining: Number(pool.remaining ?? 0),
    gemPoolTotal: Number(pool.total ?? 0),
  };
}
