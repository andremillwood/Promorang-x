import { Binoculars, Camera, History, Radio, Sparkles, Users, WandSparkles } from "lucide-react";

export const MISSION_ARCHETYPES = {
  scout: {
    label: "Scout",
    verb: "Find it",
    description: "Spot what is emerging before everyone else does.",
    icon: Binoculars,
    tone: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    exampleAction: "Pin an emerging underground venue or pop-up before it peaks.",
    actionType: "Discovery & Early Geotagging",
    proofMethod: "GPS Check-in & First Photo Submission",
    rewardRange: "150 – 300 pts",
    cameraPrivacy: "No face required · Venue/Environment only",
    targetPersona: "Explorers & Trendsetters",
  },
  aura: {
    label: "Aura",
    verb: "Catch it. Add yours.",
    description: "Capture the energy—or become part of what gets captured.",
    icon: Camera,
    tone: "border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-400/15 to-primary/15 text-fuchsia-100",
    exampleAction: "Record a 5-second ambient vibe video or join the live venue pulse.",
    actionType: "Atmosphere & Real-Time Presence",
    proofMethod: "Short Video / Live Room Verification",
    rewardRange: "100 – 250 pts + Keys",
    cameraPrivacy: "Camera boundaries visible before joining · Face blur optional",
    targetPersona: "Event Attendees & Storytellers",
  },
  rally: {
    label: "Rally",
    verb: "Bring the people",
    description: "Build momentum by bringing the right people together.",
    icon: Users,
    tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    exampleAction: "Bring 3+ friends or squad members to unlock a group discount pass.",
    actionType: "Community & Squad Turnout",
    proofMethod: "Synced Squad Check-in / Shared Invite Link",
    rewardRange: "200 – 500 pts",
    cameraPrivacy: "Private proof only · No public posting needed",
    targetPersona: "Hosts & Social Connectors",
  },
  signal: {
    label: "Signal",
    verb: "Move the word",
    description: "Help something worth noticing reach the right people.",
    icon: Radio,
    tone: "border-orange-400/25 bg-orange-400/10 text-orange-100",
    exampleAction: "Broadcast a newly dropped scene to your followers or group chats.",
    actionType: "Amplification & Distribution",
    proofMethod: "Tracked Share Link & Engagement Conversion",
    rewardRange: "50 – 150 pts / referral",
    cameraPrivacy: "Digital only · Zero camera footprint",
    targetPersona: "Curators & Influencers",
  },
  remix: {
    label: "Remix",
    verb: "Make it yours",
    description: "Interpret the Moment through your own taste and format.",
    icon: WandSparkles,
    tone: "border-violet-400/25 bg-violet-400/10 text-violet-100",
    exampleAction: "Create a recap edit, visual collage, or meme celebrating the scene.",
    actionType: "Creative UGC & Derivative Drops",
    proofMethod: "Social Media Mention & Media Upload",
    rewardRange: "250 – 600 pts + Exclusive Drops",
    cameraPrivacy: "Creator controlled · Public post",
    targetPersona: "Designers & Video Editors",
  },
  lore: {
    label: "Lore",
    verb: "Keep the story",
    description: "Preserve the context, memory, or inside story that matters.",
    icon: History,
    tone: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    exampleAction: "Archive the venue history, setlist memory, or behind-the-scenes backstory.",
    actionType: "Cultural Archiving & Context",
    proofMethod: "Written Note / Audio Clip / Historical Artifact",
    rewardRange: "150 – 350 pts",
    cameraPrivacy: "Private or Public · Audio/Text supported",
    targetPersona: "Historians & Scene Veterans",
  },
  side_quest: {
    label: "Side Quest",
    verb: "Take the detour",
    description: "Complete the playful move beyond the main experience.",
    icon: Sparkles,
    tone: "border-white/20 bg-white/[0.07] text-white",
    exampleAction: "Order the hidden menu item, find the secret mural, or snap the QR clue.",
    actionType: "Gamified Mini-Missions",
    proofMethod: "QR Scan / Receipt Proof / Secret Photo",
    rewardRange: "75 – 200 pts",
    cameraPrivacy: "Flexible · Discreet proof",
    targetPersona: "Adventurers & Casual Visitors",
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

export const ARCHETYPE_I18N = {
  scout: { labelKey: "archetype.scout.label", verbKey: "archetype.scout.verb", descKey: "archetype.scout.desc", actionKey: "archXtra.scout.action", rewardKey: "archXtra.scout.reward", personaKey: "archXtra.scout.persona", exampleKey: "archXtra.scout.example", proofKey: "archXtra.scout.proof", privacyKey: "archXtra.scout.privacy" },
  aura: { labelKey: "archetype.aura.label", verbKey: "archetype.aura.verb", descKey: "archetype.aura.desc", actionKey: "archXtra.aura.action", rewardKey: "archXtra.aura.reward", personaKey: "archXtra.aura.persona", exampleKey: "archXtra.aura.example", proofKey: "archXtra.aura.proof", privacyKey: "archXtra.aura.privacy" },
  rally: { labelKey: "archetype.rally.label", verbKey: "archetype.rally.verb", descKey: "archetype.rally.desc", actionKey: "archXtra.rally.action", rewardKey: "archXtra.rally.reward", personaKey: "archXtra.rally.persona", exampleKey: "archXtra.rally.example", proofKey: "archXtra.rally.proof", privacyKey: "archXtra.rally.privacy" },
  signal: { labelKey: "archetype.signal.label", verbKey: "archetype.signal.verb", descKey: "archetype.signal.desc", actionKey: "archXtra.signal.action", rewardKey: "archXtra.signal.reward", personaKey: "archXtra.signal.persona", exampleKey: "archXtra.signal.example", proofKey: "archXtra.signal.proof", privacyKey: "archXtra.signal.privacy" },
  remix: { labelKey: "archetype.remix.label", verbKey: "archetype.remix.verb", descKey: "archetype.remix.desc", actionKey: "archXtra.remix.action", rewardKey: "archXtra.remix.reward", personaKey: "archXtra.remix.persona", exampleKey: "archXtra.remix.example", proofKey: "archXtra.remix.proof", privacyKey: "archXtra.remix.privacy" },
  lore: { labelKey: "archetype.lore.label", verbKey: "archetype.lore.verb", descKey: "archetype.lore.desc", actionKey: "archXtra.lore.action", rewardKey: "archXtra.lore.reward", personaKey: "archXtra.lore.persona", exampleKey: "archXtra.lore.example", proofKey: "archXtra.lore.proof", privacyKey: "archXtra.lore.privacy" },
  side_quest: { labelKey: "archetype.sideQuest.label", verbKey: "archetype.sideQuest.verb", descKey: "archetype.sideQuest.desc", actionKey: "archXtra.sideQuest.action", rewardKey: "archXtra.sideQuest.reward", personaKey: "archXtra.sideQuest.persona", exampleKey: "archXtra.sideQuest.example", proofKey: "archXtra.sideQuest.proof", privacyKey: "archXtra.sideQuest.privacy" },
} as const;

export const CAMERA_CONSENT_KEYS = {
  open_to_camera: "camCons.open_to_camera",
  ask_first: "camCons.ask_first",
  no_face: "camCons.no_face",
  private_proof: "camCons.private_proof",
  public_post: "camCons.public_post",
} as const;

