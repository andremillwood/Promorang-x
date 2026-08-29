import type { AccessState } from "@/lib/access";

export type StickyJoinBarState = {
    participantCount: number;
    maxParticipants?: number | null;
    isJoined: boolean;
    isPast: boolean;
    isHost: boolean;
    isLoggedIn: boolean;
    isJoining?: boolean;
    accessState?: AccessState;
    missionCount?: number;
    onExploreMissions?: () => void;
};

export function getStickyJoinCtaLabel(state: StickyJoinBarState) {
    if (state.isPast) return "Moment Ended";
    if (!state.isLoggedIn) return "Sign In to Join";
    if (state.isHost) return "Manage Moment";
    if (state.isJoined) return "You're Joined";
    const spotsLeft = state.maxParticipants ? state.maxParticipants - state.participantCount : null;
    if (spotsLeft !== null && spotsLeft <= 0) return "Moment Full";
    if (state.accessState && state.accessState.key !== "available") return state.accessState.ctaLabel;
    return state.isJoining ? "Joining..." : "Join This Moment";
}

export function getStickyJoinTactileVariant(state: StickyJoinBarState) {
    const spotsLeft = state.maxParticipants ? state.maxParticipants - state.participantCount : null;
    const isFull = spotsLeft !== null && spotsLeft <= 0;
    if (state.isPast || isFull) return "obsidian" as const;
    if (state.isJoined) return "success" as const;
    if (state.accessState?.key === "requires_plus" || state.accessState?.key === "blocked") return "obsidian" as const;
    if (state.accessState?.key === "needs_keys") return "vault" as const;
    return "primary" as const;
}

export function getStickyJoinStatusLine(state: StickyJoinBarState) {
    return [
        `${state.participantCount} ${state.participantCount === 1 ? "person" : "people"} joined`,
        state.maxParticipants ? `${state.maxParticipants - state.participantCount} spots left` : null,
        state.accessState && !state.isJoined ? state.accessState.label : null,
    ]
        .filter(Boolean)
        .join(" • ");
}

export function canAttemptStickyJoin(state: StickyJoinBarState) {
    const spotsLeft = state.maxParticipants ? state.maxParticipants - state.participantCount : null;
    const isFull = spotsLeft !== null && spotsLeft <= 0;
    return !(state.isPast || isFull || state.isJoining || state.accessState?.canAttempt === false);
}

export function shouldShowStickyMissions(state: StickyJoinBarState) {
    return (state.missionCount ?? 0) > 0 && Boolean(state.onExploreMissions);
}

export function shouldShowStickyPingSquad(state: StickyJoinBarState) {
    return state.isJoined && !state.isPast && !state.isHost;
}
