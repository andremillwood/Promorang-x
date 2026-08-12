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
    slug: "sound-system-night-culture",
    title: "Sound System & Night Culture",
    tagline: "Riddims, late-night sessions, and verified dancefloor energy.",
    description: "The home for sound system culture, DJ sets, street dances, and late-night movement across Jamaica and beyond.",
    image: momentConcert,
    logoImage: momentConcert,
    members: "3.4K",
    momentsHosted: "84",
    checkIns: "14.2K",
    rating: "4.9",
    tags: ["Sound System", "Nightlife", "Reggae", "Dancehall", "DJ Sets"],
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    slug: "creative-coffee-club",
    title: "Downtown Coffee & Creative Club",
    tagline: "Morning brews, co-working sessions, and creator linkups.",
    description: "A scene for freelancers, podcasters, designers, and local roasters turning morning coffee into collaborative energy.",
    image: momentCoffee,
    logoImage: momentCoffee,
    members: "1.6K",
    momentsHosted: "52",
    checkIns: "5.8K",
    rating: "4.8",
    tags: ["Coffee", "Co-Working", "Creatives", "Community"],
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    slug: "drop-culture-collective",
    title: "Streetwear & Drop Culture",
    tagline: "First access, founder capsules, and verified collector proof.",
    description: "A scene for independent designers, sneakerheads, vintage pop-ups, and capsule releases where being early matters.",
    image: momentConcert,
    logoImage: momentConcert,
    members: "2.8K",
    momentsHosted: "46",
    checkIns: "9.1K",
    rating: "4.8",
    tags: ["Streetwear", "Drops", "Fashion", "Capsules"],
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    slug: "sunrise-fit-recovery",
    title: "Sunrise Fitness & Recovery",
    tagline: "Run clubs, wellness pop-ups, and creator-led recovery sessions.",
    description: "A fitness and wellness scene where 5K run clubs, beach yoga, and recovery drops turn sweat into community rewards.",
    image: momentYoga,
    logoImage: momentYoga,
    members: "1.9K",
    momentsHosted: "38",
    checkIns: "6.4K",
    rating: "4.9",
    tags: ["Fitness", "Run Club", "Wellness", "Recovery"],
  },
  {
    isSample: true,
    contentOrigin: "demo" as const,
    slug: "city-culinary-rituals",
    title: "City Food & Culinary Rituals",
    tagline: "Pop-up dinners, chef collabs, and secret tasting drops.",
    description: "A culinary scene for foodies, street food runs, secret supper clubs, and merchant tasting rituals worth showing up for.",
    image: momentFoodFestival,
    logoImage: momentFoodFestival,
    members: "2.5K",
    momentsHosted: "61",
    checkIns: "11.3K",
    rating: "4.8",
    tags: ["Food", "Tastings", "Pop-Ups", "Merchant Drops"],
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
