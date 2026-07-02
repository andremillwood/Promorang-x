import { Binoculars, Camera, History, Radio, Sparkles, Users, WandSparkles } from "lucide-react";

export const MISSION_ARCHETYPES = {
  scout: {
    label: "Scout",
    verb: "Find it",
    description: "Spot what is emerging before everyone else does.",
    icon: Binoculars,
    tone: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  },
  aura: {
    label: "Aura",
    verb: "Catch it. Add yours.",
    description: "Capture the energy—or become part of what gets captured.",
    icon: Camera,
    tone: "border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-400/15 to-primary/15 text-fuchsia-100",
  },
  rally: {
    label: "Rally",
    verb: "Bring the people",
    description: "Build momentum by bringing the right people together.",
    icon: Users,
    tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  },
  signal: {
    label: "Signal",
    verb: "Move the word",
    description: "Help something worth noticing reach the right people.",
    icon: Radio,
    tone: "border-orange-400/25 bg-orange-400/10 text-orange-100",
  },
  remix: {
    label: "Remix",
    verb: "Make it yours",
    description: "Interpret the Moment through your own taste and format.",
    icon: WandSparkles,
    tone: "border-violet-400/25 bg-violet-400/10 text-violet-100",
  },
  lore: {
    label: "Lore",
    verb: "Keep the story",
    description: "Preserve the context, memory, or inside story that matters.",
    icon: History,
    tone: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  },
  side_quest: {
    label: "Side Quest",
    verb: "Take the detour",
    description: "Complete the playful move beyond the main experience.",
    icon: Sparkles,
    tone: "border-white/20 bg-white/[0.07] text-white",
  },
} as const;

export type MissionArchetype = keyof typeof MISSION_ARCHETYPES;

export const CAMERA_CONSENT = {
  open_to_camera: "Open to camera",
  ask_first: "Ask before capturing",
  no_face: "No-face participation",
  private_proof: "Private proof only",
  public_post: "Public post required",
} as const;

export type CameraConsent = keyof typeof CAMERA_CONSENT;

