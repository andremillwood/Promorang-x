import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Coins,
  Compass,
  FileText,
  Gem,
  KeyRound,
  MapPin,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ConceptKey = "overview" | "moments" | "points" | "keys" | "pieces" | "content" | "promoshare-gems" | "network";
type IconType = typeof KeyRound;

type RoleValue = {
  role: string;
  why: string;
  outcome: string;
  action: string;
  href: string;
  icon: IconType;
};

type StepValue = {
  label: string;
  title: string;
  text: string;
};

type ProofValue = {
  label: string;
  value: string;
  helper: string;
};

const routes = [
  { icon: Ticket, title: "Find moments", href: "/explore/moments", text: "See real opportunities where this becomes useful." },
  { icon: WalletCards, title: "Open wallet", href: "/wallet", text: "See what you have earned, unlocked, or saved." },
  { icon: Sparkles, title: "Create a moment", href: "/moments/create", text: "Turn a gathering, mission, or offer into something people can join." },
];

const roleLabel = (role: string) => role.replace("Hosts and venues", "Hosts");

const concepts: Record<ConceptKey, {
  eyebrow: string;
  title: string;
  description: string;
  stake: string;
  icon: IconType;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  proof: ProofValue[];
  roles: RoleValue[];
  steps: StepValue[];
  receipts: string[];
  closing: string;
}> = {
  overview: {
    eyebrow: "How it works",
    title: "Promorang turns real moments into useful value.",
    description:
      "Start with something real: a moment people can join, host, sponsor, or document. Promorang then helps that activity become easier to prove, remember, reward, and repeat.",
    stake:
      "Different people need different answers. Participants want to know what they can join or earn. Hosts want better attendance and follow-up. Brands want proof their spend created real activity. Creators want their content connected to something people can act on.",
    icon: Compass,
    primaryCta: "Find moments",
    primaryHref: "/explore/moments",
    secondaryCta: "Create a moment",
    secondaryHref: "/moments/create",
    proof: [
      { label: "What starts it", value: "A moment", helper: "Something real to attend, host, sponsor, create, or document." },
      { label: "What proves it", value: "A Mark", helper: "A record that someone showed up or contributed." },
      { label: "What follows", value: "Value", helper: "Access, rewards, content, memory, and stronger reasons to return." },
    ],
    roles: [
      {
        role: "Participants",
        why: "You want to know what is worth showing up for.",
        outcome: "Promorang helps your participation count toward access, rewards, memories, and better future invitations.",
        action: "Start with moments",
        href: "/explore/moments",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "You need more than a flyer and a headcount.",
        outcome: "Promorang helps you see who came, what happened, and how to bring the right people back.",
        action: "Create a moment",
        href: "/moments/create",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "You need sponsorship to produce real activity, not just impressions.",
        outcome: "Promorang connects spend to attendance, content, rewards, and proof people acted.",
        action: "Explore brand use",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "You need content to lead somewhere useful.",
        outcome: "Promorang lets content point back to moments, participation, rewards, and people who may return.",
        action: "Explore creator use",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "Create or join", text: "Someone publishes a moment and people decide to participate." },
      { label: "02", title: "Prove it happened", text: "Marks, check-ins, content, referrals, and actions create a record." },
      { label: "03", title: "Use the record", text: "That record can support access, rewards, memory, and future decisions." },
    ],
    receipts: ["Moments", "Marks", "Points", "Keys", "Pieces", "Content", "PromoShare", "Gems", "Network value"],
    closing: "The simple version: real activity creates a record, and that record can become useful later.",
  },
  moments: {
    eyebrow: "Moments",
    title: "Moments are the unit everything else has to point back to.",
    description:
      "A moment is something people can actually join: an event, drop, mission, offer, ritual, gathering, or activity.",
    stake:
      "Moments keep Promorang tied to real activity. They give every Mark, reward, piece of content, and invitation a clear place to point back to.",
    icon: Ticket,
    primaryCta: "Browse moments",
    primaryHref: "/explore/moments",
    secondaryCta: "Create a moment",
    secondaryHref: "/moments/create",
    proof: [
      { label: "For participants", value: "Reason", helper: "A clear invitation to go somewhere, do something, or contribute." },
      { label: "For hosts", value: "Surface", helper: "A place to organize attendance, proof, access, and follow-up." },
      { label: "For brands", value: "Activation", helper: "A concrete context where funded value can be earned or used." },
    ],
    roles: [
      {
        role: "Participants",
        why: "You need a useful reason to leave the feed and enter the real world.",
        outcome: "Moments show what is worth joining and what value can come from participation.",
        action: "Find a moment",
        href: "/explore/moments",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "Your event should be more useful than a flyer.",
        outcome: "Moments connect discovery, check-in, Marks, access, content, rewards, and return behavior.",
        action: "Host a moment",
        href: "/moments/create",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "A campaign needs a place where value can be experienced.",
        outcome: "Moments turn sponsorship into an activity people can attend, prove, share, and remember.",
        action: "Fund moments",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "Your content needs an anchor in something people can act on.",
        outcome: "Moments give creator missions and stories a live context with proof attached.",
        action: "Create with moments",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "Publish", text: "A host, creator, venue, or brand creates a moment with a clear reason to join." },
      { label: "02", title: "Participate", text: "People join, check in, invite, create, or complete the activity." },
      { label: "03", title: "Remember", text: "The moment becomes a record that can unlock access, rewards, content, and future value." },
    ],
    receipts: ["Live events", "Creator missions", "Venue rituals", "Drops", "Offers", "Check-ins"],
    closing: "Moments matter because they keep value tied to something that actually happened.",
  },
  points: {
    eyebrow: "Marks and Points",
    title: "Marks and Points show that participation happened.",
    description:
      "Marks record that someone showed up or contributed. Points help show useful activity before it becomes access, rewards, or a better record.",
    stake:
      "Participants need proof their effort counts. Hosts and brands need a way to distinguish real movement from empty attention. Marks and Points create the first readable layer.",
    icon: Coins,
    primaryCta: "Find ways to earn",
    primaryHref: "/explore/moments",
    secondaryCta: "Open activity",
    secondaryHref: "/activity",
    proof: [
      { label: "For participants", value: "Progress", helper: "Your activity becomes visible and easier to build on." },
      { label: "For hosts", value: "Proof", helper: "Attendance and contribution become more useful than a headcount." },
      { label: "For brands", value: "Signal", helper: "Rewards can follow verified behavior instead of broad guessing." },
    ],
    roles: [
      {
        role: "Participants",
        why: "You need your real activity to count somewhere.",
        outcome: "Marks and Points help your attendance, reviews, content, and contribution become part of your record.",
        action: "Join a moment",
        href: "/explore/moments",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "You need to know who actually showed up and helped the room.",
        outcome: "Marks and Points help separate actual participation from passive interest.",
        action: "Track participation",
        href: "/moments/create",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "You need a better basis for offers, perks, and sponsored rewards.",
        outcome: "Points give campaigns a way to reward verified participation instead of guessing who cared.",
        action: "Design a campaign",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "You need your audience actions to connect to something measurable.",
        outcome: "Marks and Points help creator-led participation turn into proof, reward access, and future invitations.",
        action: "Create a mission",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "Attend", text: "A participant joins a moment, place, mission, or offer." },
      { label: "02", title: "Mark", text: "Promorang records a verified action tied to that real context." },
      { label: "03", title: "Progress", text: "Points help activity become access, rewards, future invitations, or a stronger record." },
    ],
    receipts: ["Marks", "Check-ins", "Reviews", "Photos", "Referrals", "Progression"],
    closing: "Marks and Points matter because nobody should have to guess what participation happened.",
  },
  keys: {
    eyebrow: "Access",
    title: "Keys make limited access feel earned, not arbitrary.",
    description:
      "When space, rewards, or follow-through matter, Keys help Promorang decide who should get access without turning the experience into a cold application process.",
    stake:
      "Keys are for moments where space, perks, or rewards are limited. They help hosts invite people who have already shown real interest, and they help participants understand why they earned access.",
    icon: KeyRound,
    primaryCta: "Find gated moments",
    primaryHref: "/explore/moments",
    secondaryCta: "Open wallet",
    secondaryHref: "/wallet",
    proof: [
      { label: "For participants", value: "Access", helper: "Use earned history to reach limited moments and offers." },
      { label: "For hosts", value: "Intent", helper: "Protect capacity for people with a stronger history of showing up." },
      { label: "For brands", value: "Quality", helper: "Put budget behind people more likely to follow through." },
    ],
    roles: [
      {
        role: "Participants",
        why: "You need a way to prove you are more than a casual click.",
        outcome: "Keys can move you from browsing to priority access when a moment, reward, or room is limited.",
        action: "Build access history",
        href: "/explore/moments",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "A full RSVP list is not the same as a full room.",
        outcome: "Keys add light friction so scarce space goes to people with a better history of showing up.",
        action: "Create a gated moment",
        href: "/moments/create",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "If you sponsor perks or VIP access, you want them going to people who are likely to show up and care.",
        outcome: "Keys make access feel earned before samples, perks, or limited inventory are released.",
        action: "Fund better access",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "If you run a drop, mission, or intimate room, you need the right people in it.",
        outcome: "Keys help protect limited creator-led moments without making the invitation feel closed off.",
        action: "Build with Promorang",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "Show up", text: "Join real moments and leave Marks that record participation." },
      { label: "02", title: "Earn Keys", text: "Consistent participation can give you Keys for limited moments, rewards, or offers." },
      { label: "03", title: "Use them", text: "Spend Keys when a host, venue, or campaign limits access to people with stronger history." },
    ],
    receipts: ["Limited moments", "Funded rewards", "Capacity control", "Priority access", "Higher-trust rooms"],
    closing: "Keys are useful when a moment cannot simply be open to everyone.",
  },
  pieces: {
    eyebrow: "Lasting Upside",
    title: "Pieces give important participation a place to live.",
    description:
      "A good moment should not disappear the second it ends. Pieces give early contribution, strong participation, and shared memory a place people can return to.",
    stake:
      "The value is continuity. Participants get remembered, hosts get identity, and sponsors get a story connected to actual movement instead of a campaign that evaporates.",
    icon: Sparkles,
    primaryCta: "Open vault",
    primaryHref: "/vault",
    secondaryCta: "View portfolio",
    secondaryHref: "/portfolio",
    proof: [
      { label: "For participants", value: "Memory", helper: "Participation can become visible beyond one night." },
      { label: "For hosts", value: "Identity", helper: "Recurring moments can develop a lasting profile." },
      { label: "For brands", value: "Story", helper: "Sponsorship can attach to proof people revisit." },
    ],
    roles: [
      {
        role: "Participants",
        why: "Being early, consistent, or helpful should not vanish after the event ends.",
        outcome: "Pieces can make your strongest participation easier to remember, revisit, and connect to future value.",
        action: "Open your vault",
        href: "/vault",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "Recurring rooms need identity, not just another listing.",
        outcome: "Pieces help a moment, venue, or community build a lasting record around proof, memory, and return behavior.",
        action: "Create a recurring moment",
        href: "/moments/create",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "The best sponsorships leave evidence people can point back to.",
        outcome: "Pieces can connect funded participation, content, and community proof to a story that keeps working after launch.",
        action: "Explore brand use",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "Your creative work needs a place where it can keep mattering.",
        outcome: "Pieces can give missions, drops, and cultural moments a visible home that credits participation and keeps momentum alive.",
        action: "Explore creator use",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "Moment happens", text: "People show up, create, refer, verify, or contribute." },
      { label: "02", title: "Proof collects", text: "Marks, content, and activity create a stronger record around the moment." },
      { label: "03", title: "Piece persists", text: "The strongest proof can live in a profile, vault, or portfolio instead of disappearing." },
    ],
    receipts: ["Early participation", "Creator missions", "Moment identity", "Vault memory", "Portfolio record"],
    closing: "Pieces matter when a moment deserves a life after the feed.",
  },
  content: {
    eyebrow: "Content",
    title: "Content should prove and extend the moment, not float away from it.",
    description:
      "Photos, recaps, creator missions, reviews, and media can help people understand what happened, who showed up, and why a moment is worth joining next time.",
    stake:
      "Content gives the platform social proof, memory, and distribution. The difference is that it should point back into real moments instead of becoming disconnected media.",
    icon: FileText,
    primaryCta: "Browse content",
    primaryHref: "/explore/content",
    secondaryCta: "Create a moment",
    secondaryHref: "/moments/create",
    proof: [
      { label: "For participants", value: "Proof", helper: "Content helps your contribution become visible." },
      { label: "For hosts", value: "Memory", helper: "A moment can keep working after the room clears." },
      { label: "For brands", value: "Evidence", helper: "Campaign value is easier to understand when content points to participation." },
    ],
    roles: [
      {
        role: "Participants",
        why: "You may help a moment by documenting, reviewing, or sharing what happened.",
        outcome: "Content can strengthen your record when it is connected to a real moment or place.",
        action: "Explore content",
        href: "/explore/content",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "Your best moments need proof people can revisit.",
        outcome: "Content helps future guests, sponsors, and communities understand why the room mattered.",
        action: "Create a content-ready moment",
        href: "/moments/create",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "You need proof that a campaign became lived behavior.",
        outcome: "Content creates evidence that funded value reached people in a real context.",
        action: "Fund content loops",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "Your media can do more when it connects to action.",
        outcome: "Creator content can become the bridge between discovery, attendance, proof, and repeat movement.",
        action: "Build creator missions",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "Capture", text: "People document, review, recap, or create around a real moment." },
      { label: "02", title: "Connect", text: "The media points back to moments, places, creators, brands, or communities." },
      { label: "03", title: "Convert", text: "Content helps others decide to join, trust, fund, or return." },
    ],
    receipts: ["Photos", "Recaps", "Reviews", "Creator missions", "Public proof", "Discovery archives"],
    closing: "Content matters when it helps people understand what actually happened and what to do next.",
  },
  "promoshare-gems": {
    eyebrow: "PromoShare and Gems",
    title: "PromoShare and Gems turn verified activity into usable reward value.",
    description:
      "PromoShare tracks who qualifies for reward cycles. Gems are the spendable unit that makes funded value easier to track and use across moments, rewards, pieces, and marketplace activity.",
    stake:
      "This is where Promorang has to be most clear: rewards should feel earned, funded, limited, and connected to verified contribution.",
    icon: Gem,
    primaryCta: "See PromoShare",
    primaryHref: "/promoshare",
    secondaryCta: "Open wallet",
    secondaryHref: "/wallet",
    proof: [
      { label: "For participants", value: "Reward", helper: "Qualified activity can become useful value." },
      { label: "For hosts", value: "Incentive", helper: "Rewards can support attendance, contribution, and return behavior." },
      { label: "For brands", value: "Governance", helper: "Funded value can be capped, measured, and tied to proof." },
    ],
    roles: [
      {
        role: "Participants",
        why: "You need to know what can be earned and why it is legitimate.",
        outcome: "PromoShare and Gems make reward access easier to understand, track, and use.",
        action: "Open wallet",
        href: "/wallet",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "You need incentives that drive quality participation, not random discount hunting.",
        outcome: "Qualified reward loops can support specific actions, repeat visits, and campaign goals.",
        action: "Create a rewardable moment",
        href: "/moments/create",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "You need reward spend to be accountable.",
        outcome: "PromoShare and Gems help connect budget to verified actions, caps, cycles, and measurable outcomes.",
        action: "Explore sponsorship",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "You need missions and content to connect to real upside.",
        outcome: "Creator-led participation can qualify for reward cycles when tied to verified contribution.",
        action: "Create reward missions",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "Qualify", text: "A user completes activity tied to a real moment, campaign, or contribution." },
      { label: "02", title: "Enter", text: "PromoShare records the verified action under the correct reward rules." },
      { label: "03", title: "Use", text: "Gems make reward value easier to spend, track, and explain." },
    ],
    receipts: ["Reward cycles", "Gems", "Eligibility", "Funded campaigns", "Wallet", "Payout-safe value"],
    closing: "PromoShare and Gems matter when rewards need to feel earned, measured, and useful.",
  },
  network: {
    eyebrow: "Network Value",
    title: "The people around a moment can make it worth more.",
    description:
      "Promorang is not only about one person earning something. It is about rooms getting stronger when people return, bring friends, create content, and help a place become part of their life.",
    stake:
      "The value is repeat behavior: people returning, inviting others, creating proof, and helping a moment become more useful to everyone involved.",
    icon: Users,
    primaryCta: "Explore communities",
    primaryHref: "/for-communities",
    secondaryCta: "See PromoShare",
    secondaryHref: "/promoshare",
    proof: [
      { label: "For participants", value: "Standing", helper: "Your relationships and repeat behavior can become visible." },
      { label: "For hosts", value: "Return", helper: "A good room becomes easier to rebuild." },
      { label: "For brands", value: "Movement", helper: "Campaigns gain value when people carry them forward." },
    ],
    roles: [
      {
        role: "Participants",
        why: "You often create value by bringing people, posting proof, and returning.",
        outcome: "Network value helps that contribution become visible instead of disappearing into the background.",
        action: "Find your next room",
        href: "/explore/moments",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "The hardest part is not one turnout. It is getting the right people to come back.",
        outcome: "Network value helps identify repeat movement, trusted crews, and the relationships that make rooms easier to grow.",
        action: "Build a community loop",
        href: "/for-communities",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "Impressions are weak if no one carries the experience forward.",
        outcome: "Network value links sponsorship to referral, attendance, content, and public proof instead of one-time exposure.",
        action: "Design a movement",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "Your audience is not just reach. It is a group that can move.",
        outcome: "Network value helps creators turn content and attendance into a stronger graph around moments and places.",
        action: "Connect content to moments",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "People gather", text: "A room forms around a moment, place, creator, brand, or community." },
      { label: "02", title: "Signal spreads", text: "Referrals, content, repeat visits, and Marks show what is actually moving." },
      { label: "03", title: "Value grows", text: "Better rooms, stronger offers, PromoShare access, and future invitations become easier to justify." },
    ],
    receipts: ["Referrals", "Repeat visits", "Creator content", "PromoShare relevance", "Community rhythm"],
    closing: "Network value matters when the people around a moment are part of the product.",
  },
};

export default function EconomyConcept() {
  const { concept } = useParams();
  const conceptKey = (concept ?? "overview") as ConceptKey;
  const data = concepts[conceptKey];

  if (!data) {
    return <Navigate to="/" replace />;
  }

  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-[#f7f3ed] text-foreground">
      <SEO title={`${data.eyebrow} - Promorang`} description={data.description} />

      <section className="relative overflow-hidden border-b border-black/10 bg-[#1e1e1d] pb-12 pt-28 text-white md:pb-16 md:pt-32">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,113,16,0.22),transparent_55%)]" />
        <div className="container relative z-10 px-6">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <Badge className="border-primary/25 bg-primary/15 text-primary">
                {data.eyebrow}
              </Badge>
              <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-gradient-primary text-primary-foreground shadow-2xl shadow-primary/25">
                <Icon className="h-9 w-9" />
              </div>
              <h1 className="mt-8 max-w-4xl font-serif text-4xl font-bold leading-[0.95] md:text-6xl">
                {data.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                {data.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <Link to={data.primaryHref}>
                    {data.primaryCta}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                  <Link to={data.secondaryHref}>{data.secondaryCta}</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">Choose your path</p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Start with the role closest to you. Each path shows why the system matters and what to do next.
              </p>

              <Tabs defaultValue="0" className="mt-5">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1.5 md:grid-cols-4">
                  {data.roles.map((role, index) => (
                    <TabsTrigger
                      key={role.role}
                      value={String(index)}
                      className="rounded-xl px-3 py-2 text-xs font-bold text-zinc-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {roleLabel(role.role)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {data.roles.map((role, index) => (
                  <TabsContent key={role.role} value={String(index)} className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                          <role.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-zinc-400">{role.role}</p>
                          <h2 className="mt-2 text-2xl font-semibold leading-tight text-white md:text-3xl">
                            {role.why}
                          </h2>
                          <p className="mt-3 text-sm leading-7 text-zinc-300">{role.outcome}</p>
                        </div>
                      </div>
                      <Button variant="hero" className="mt-5 w-full sm:w-auto" asChild>
                        <Link to={role.href}>
                          {role.action}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {data.proof.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          </div>
                          <p className="mt-3 text-lg font-bold text-white">{item.value}</p>
                          <p className="mt-2 text-xs leading-5 text-zinc-300">{item.helper}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-6">
          <div className="rounded-[2rem] border border-black/10 bg-[#242321] p-5 text-white md:p-8">
            <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">What happens</p>
                <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">The simple version</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{data.closing}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {data.steps.map((step) => (
                  <div key={step.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <span className="text-xs font-black uppercase tracking-[0.22em] text-primary">{step.label}</span>
                    <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Where users see this</p>
                  <h2 className="mt-3 font-serif text-3xl font-bold">Places this appears in the product</h2>
                </div>
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {data.receipts.map((item) => (
                  <span key={item} className="rounded-full border border-black/10 bg-[#f7f3ed] px-4 py-2 text-sm font-semibold text-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-primary/25 bg-primary/10 p-6 md:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-serif text-3xl font-bold">Choose a next step</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Join something worth showing up for, create a moment others can act on, or open your record to see what your activity is building.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {routes.map((route) => (
              <Link
                key={route.title}
                to={route.href}
                className="group rounded-[1.25rem] border border-black/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <route.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{route.title}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{route.text}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
