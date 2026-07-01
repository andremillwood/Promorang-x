import momentConcert from "@/assets/moment-concert.jpg";
import momentFoodFestival from "@/assets/moment-food-festival.jpg";
import momentCoffee from "@/assets/moment-coffee-meetup.jpg";
import momentYoga from "@/assets/moment-yoga.jpg";
import momentArt from "@/assets/moment-art-workshop.jpg";
import jazzNight from "@/assets/moments/jazz-night.jpg";
import cookingClass from "@/assets/moments/cooking-class.jpg";
import openMic from "@/assets/moments/open-mic.jpg";
import streetArt from "@/assets/moments/street-art.jpg";
import pottery from "@/assets/moments/pottery.jpg";
import sunsetPhoto from "@/assets/moments/sunset-photo.jpg";
import { demoMoments } from "@/data/demo-moments";

export const cultureImages = {
  momentConcert,
  momentFoodFestival,
  momentCoffee,
  momentYoga,
  momentArt,
  jazzNight,
  cookingClass,
  openMic,
  streetArt,
  pottery,
  sunsetPhoto,
};

const formatMomentDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", timeZone: "America/Jamaica" }).format(new Date(value));

const formatMomentTime = (value: string) =>
  new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: "America/Jamaica" }).format(new Date(value));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const cultureEvents = demoMoments.map((moment) => ({
  isSample: true,
  contentOrigin: "demo" as const,
  slug: slugify(moment.title),
  momentId: moment.id,
  title: moment.title,
  shortTitle: moment.title.split(" - ")[0],
  description: moment.description,
  date: formatMomentDate(moment.starts_at),
  time: `${formatMomentTime(moment.starts_at)}${moment.ends_at ? ` - ${formatMomentTime(moment.ends_at)}` : ""}`,
  place: moment.venue_name || moment.location,
  city: moment.location,
  image: moment.image_url,
  category: moment.category,
  proof: moment.proof_type ? `${moment.proof_type} proof` : moment.expected_action_unit,
  attending: String(moment.participant_count),
  price: moment.reward || "RSVP Free",
  reward: moment.reward,
  expectedAction: moment.expected_action_unit,
  host: moment.host?.display_name || "Promorang Host",
}));

export const cultureScenes = [
  {
    isSample: true,
    contentOrigin: "demo" as const,
    slug: "market-rituals",
    title: "Market Rituals",
    tagline: "Food runs, tastings, and reward-bearing visits.",
    description: "A scene for people who discover grocery drops, food moments, and merchant rituals worth showing up for.",
    image: momentFoodFestival,
    logoImage: momentFoodFestival,
    members: "1.8K",
    momentsHosted: "42",
    checkIns: "6.3K",
    rating: "4.8",
    tags: ["Food", "Retail", "Rewards", "Proof"],
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    slug: "service-status",
    title: "Service Status",
    tagline: "Appointments that become remembered access.",
    description: "A scene around barbers, salons, wellness rooms, and service windows where repeat proof unlocks better treatment.",
    image: momentCoffee,
    logoImage: momentCoffee,
    members: "920",
    momentsHosted: "31",
    checkIns: "2.7K",
    rating: "4.7",
    tags: ["Beauty", "Barber", "Wellness", "Status"],
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    slug: "creator-fit",
    title: "Creator Fit",
    tagline: "Creator-led movement, recovery, and proof.",
    description: "A scene for fitness drops and wellness moments where content leads people into real attendance.",
    image: momentYoga,
    logoImage: momentYoga,
    members: "1.2K",
    momentsHosted: "28",
    checkIns: "4.1K",
    rating: "4.9",
    tags: ["Fitness", "Creators", "Check-in", "Perks"],
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    slug: "drop-culture",
    title: "Drop Culture",
    tagline: "Capsules, first access, and founder memories.",
    description: "A scene for fashion, creator merch, and retail drops where being early becomes visible proof.",
    image: momentConcert,
    logoImage: momentConcert,
    members: "2.4K",
    momentsHosted: "36",
    checkIns: "8.5K",
    rating: "4.8",
    tags: ["Fashion", "Drops", "Vault", "Access"],
  },
];

export const cultureCommunities = cultureScenes;

export const cultureCreators = [
  {
    isSample: true,
    contentOrigin: "demo" as const,
    handle: "djmac876",
    name: "DJ Mac",
    role: "DJ • Producer • Curator",
    location: "Kingston, Jamaica",
    bio: "Bringing the best in Hip Hop, Dancehall and Afrobeats to stages across Jamaica and beyond.",
    image: momentConcert,
    avatar: momentCoffee,
    followers: "24.8K",
    following: "1.2K",
    events: "87",
    checkIns: "12.6K",
    booking: "bookings@djmac.com",
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    handle: "visualsbyray",
    name: "VisualsByRay",
    role: "Photographer",
    location: "Kingston, Jamaica",
    bio: "Documenting the rooms, faces, and proof trails that make culture visible.",
    image: streetArt,
    avatar: streetArt,
    followers: "8.7K",
    following: "412",
    events: "34",
    checkIns: "4.2K",
    booking: "hello@visualsbyray.com",
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    handle: "shotbykai",
    name: "ShotByKai",
    role: "Videographer",
    location: "Montego Bay, Jamaica",
    bio: "Turning live energy into content drops, recap reels, and sponsor-ready proof.",
    image: openMic,
    avatar: openMic,
    followers: "6.1K",
    following: "389",
    events: "29",
    checkIns: "3.8K",
    booking: "bookkai@promorang.co",
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    handle: "zjchromatic",
    name: "ZJ Chromatic",
    role: "Host",
    location: "Kingston, Jamaica",
    bio: "Host, connector, and signal booster for rooms that people remember.",
    image: jazzNight,
    avatar: jazzNight,
    followers: "10.2K",
    following: "870",
    events: "56",
    checkIns: "7.9K",
    booking: "chromatic@promorang.co",
  },
];
