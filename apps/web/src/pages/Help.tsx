import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  HelpCircle,
  Mail,
  MessageSquare,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  Gift,
  Search,
  ChevronDown,
  KeyRound,
  QrCode,
  Wallet,
  Trophy,
  Compass,
} from "lucide-react";
import SEO from "@/components/SEO";

type CategoryId = "all" | "members" | "venues" | "creators" | "brands" | "safety";

interface HowToGuide {
  id: string;
  category: CategoryId;
  categoryLabel: string;
  icon: typeof Users;
  title: string;
  summary: string;
  steps: string[];
  actionLink?: { label: string; href: string };
}

interface FaqItem {
  category: CategoryId;
  q: string;
  a: string;
}

const guides: HowToGuide[] = [
  {
    id: "vote-discoveries",
    category: "members",
    categoryLabel: "Locals & Members",
    icon: Compass,
    title: "How to Vote on Monday Discoveries",
    summary: "Cast your vote in weekly city food & culture debates to influence winning venues and earn early access to Wednesday PromoKeys.",
    steps: [
      "Open the Discover or Radar page every Monday to see active city debates.",
      "Review the competing dishes, venues, or cultural hotspots.",
      "Cast your vote before the Monday night lock.",
      "Active voters receive priority push notifications when Wednesday PromoKeys drop."
    ],
    actionLink: { label: "Vote on Radar", href: "/radar?tab=discover" }
  },
  {
    id: "claim-promokey",
    category: "members",
    categoryLabel: "Locals & Members",
    icon: KeyRound,
    title: "How to Claim & Redeem a PromoKey",
    summary: "Claim limited VIP tasting passes funded by sponsors and redeem them on-site for food, drinks, or secret menu perks.",
    steps: [
      "Be ready on Wednesday at 6:00 PM when the weekly PromoKey batch drops.",
      "Tap 'Claim Key' on your desired venue or moment (limited to 15-25 keys per drop).",
      "Visit the venue during the designated redemption window (usually Friday–Sunday).",
      "Scan the venue's countertop QR code or show your in-app pass to staff to redeem."
    ],
    actionLink: { label: "Explore Drops", href: "/discover" }
  },
  {
    id: "check-in-proof",
    category: "members",
    categoryLabel: "Locals & Members",
    icon: QrCode,
    title: "How to Verify Your Visit & Earn Gems",
    summary: "Prove you showed up to claim your rewards, build your Access Rank, and earn redeemable Gems.",
    steps: [
      "Arrive at the participating venue during operating hours.",
      "Open your Promorang app and tap 'Check In' or open your active pass.",
      "Scan the physical countertop QR code stationed at the host stand or bar.",
      "If prompted, snap a quick photo of your dish/drink to complete the proof loop."
    ],
    actionLink: { label: "Check-in Workspace", href: "/checkin" }
  },
  {
    id: "wallet-withdraw",
    category: "members",
    categoryLabel: "Locals & Members",
    icon: Wallet,
    title: "How to Withdraw Earnings & Manage Gems",
    summary: "Convert your earned bounties and rewards into cash or spend Gems in the marketplace.",
    steps: [
      "Navigate to your Wallet from the navigation menu or dashboard.",
      "Review your Withdrawable Balance and pending Gem rewards.",
      "Connect your payout method (Stripe / Bank / PayPal) for direct deposits.",
      "Initiate a withdrawal or exchange Gems for exclusive partner perks."
    ],
    actionLink: { label: "Open Wallet", href: "/wallet" }
  },
  {
    id: "venue-countertop-qr",
    category: "venues",
    categoryLabel: "Venues & Merchants",
    icon: Building2,
    title: "How Venues Set Up & Verify Countertop QRs",
    summary: "Set up frictionless, tamper-resistant QR check-in stands that automatically authenticate visiting patrons.",
    steps: [
      "Log into your Merchant Dashboard and navigate to 'Venues & Check-in'.",
      "Download or print your venue's unique dynamic Countertop QR display.",
      "Place the stand at your host stand, bar, or checkout counter.",
      "When patrons scan, your dashboard reflects real-time foot traffic and valid redemptions."
    ],
    actionLink: { label: "Merchant Dashboard", href: "/dashboard/venues" }
  },
  {
    id: "creator-bounties",
    category: "creators",
    categoryLabel: "Creators & Tastemakers",
    icon: Sparkles,
    title: "How Creators Claim & Complete Bounties",
    summary: "Earn guaranteed cash payouts by creating authentic content and driving real foot traffic to local venues.",
    steps: [
      "Explore the Bounty Board to view open brand and venue sponsorship opportunities.",
      "Review requirements (e.g. TikTok/Reel coverage, minimum verified check-ins).",
      "Claim the bounty and publish your verified tracking link.",
      "Submit your post link and let the automated attribution engine verify results."
    ],
    actionLink: { label: "Browse Bounty Board", href: "/bounties" }
  },
  {
    id: "brand-campaigns",
    category: "brands",
    categoryLabel: "Brands & Sponsors",
    icon: Trophy,
    title: "How Brands Launch Real-World Activations",
    summary: "Fund high-impact city debates, sponsor VIP PromoKeys, and receive verified proof of foot traffic.",
    steps: [
      "Define your campaign outcome (trial, foot traffic, user-generated content).",
      "Choose target cities, neighborhoods, or venue categories.",
      "Fund the reward pool (PromoKeys, tasting vouchers, creator bounties).",
      "Monitor live analytics with real-time GPS and receipt verification."
    ],
    actionLink: { label: "Brand Solutions", href: "/for-brands" }
  }
];

const faqs: FaqItem[] = [
  {
    category: "members",
    q: "What is a 'PromoKey'?",
    a: "A PromoKey is an exclusive, brand-funded digital VIP pass. When you claim a PromoKey on Wednesday drops, you unlock a free tasting, secret item, or premium experience at a winning local venue."
  },
  {
    category: "members",
    q: "What is a 'Moment'?",
    a: "A Moment is a curated real-world activation or gathering hosted by a tastemaker or venue and backed by brand sponsors to drive verified foot traffic and authentic community connection."
  },
  {
    category: "members",
    q: "What are Gems and how do I earn them?",
    a: "Gems are Promorang's community reward points. You earn Gems by voting in Monday debates, checking in at partner venues, attending Moments, and referring friends. Gems can be spent on secret perks, merch, and marketplace discounts."
  },
  {
    category: "members",
    q: "What is 'Access Rank'?",
    a: "Access Rank is your reputation score. Consistent participation, high-quality reviews, and verified check-ins increase your rank, unlocking higher-tier PromoKeys and exclusive VIP invitations."
  },
  {
    category: "venues",
    q: "How does Promorang guarantee foot traffic for my venue?",
    a: "Unlike pay-per-click ads, Promorang focuses on pre-committed demand. Hundreds of locals vote on winning spots, claim limited tasting keys, and physically verify their arrival using your countertop QR code."
  },
  {
    category: "venues",
    q: "Do I need special hardware to accept PromoKeys?",
    a: "No special hardware is required. You can either print your venue's countertop QR code from the merchant dashboard or scan patrons' in-app vouchers using any standard smartphone."
  },
  {
    category: "creators",
    q: "How do creator bounties get paid out?",
    a: "Once you claim a bounty and submit your content or drive the required verified check-ins, funds are automatically released to your Promorang digital wallet, which you can withdraw anytime via Stripe or bank transfer."
  },
  {
    category: "brands",
    q: "How does Promorang verify that activations actually happened?",
    a: "Every activation uses a multi-factor proof engine: GPS geofencing, dynamic countertop QR scans, verified receipt uploads, and creator post tracking. You get raw proof data, not estimated impressions."
  },
  {
    category: "safety",
    q: "How does Promorang protect my location privacy?",
    a: "We only check location during an intentional check-in action to confirm venue presence. We never sell background location data or track users continuously."
  },
  {
    category: "safety",
    q: "What should I do if a payout, check-in, or PromoKey fails?",
    a: "You can submit a support ticket directly from your account or reach out via our contact page with the venue name, approximate time, and screenshot. Our team responds within 24 hours."
  }
];

const categories: Array<{ id: CategoryId; label: string; icon: typeof Users }> = [
  { id: "all", label: "All Topics", icon: BookOpen },
  { id: "members", label: "Locals & Members", icon: Users },
  { id: "venues", label: "Venues & Merchants", icon: Building2 },
  { id: "creators", label: "Creators & Tastemakers", icon: Sparkles },
  { id: "brands", label: "Brands & Sponsors", icon: Trophy },
  { id: "safety", label: "Safety & Privacy", icon: Shield },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Filtered guides based on search & category
  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      const matchesCategory = activeCategory === "all" || g.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.steps.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Filtered FAQs based on search & category
  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesCategory = activeCategory === "all" || f.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <SEO
        title="Knowledge Base & FAQ Library | Promorang"
        description="Search our complete How-To library, step-by-step guides, and frequently asked questions for locals, venues, creators, and brands."
      />

      <main className="pt-24 pb-20 px-5">
        <div className="container max-w-5xl mx-auto">
          {/* Top Banner Link to What Is Promorang */}
          <div className="mb-8 flex items-center justify-center">
            <Link
              to="/what-is-promorang"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition"
            >
              <Sparkles className="h-3.5 w-3.5" /> New to Promorang? Read &quot;What is Promorang?&quot; in 60 seconds <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
              Knowledge Base & How-To Library
            </h1>
            <p className="text-base md:text-lg text-white/70">
              Find instant answers, step-by-step walkthroughs, and operational guides for every role.
            </p>

            {/* Live Search Input */}
            <div className="mt-8 relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="text"
                placeholder="Search guides, topics, keywords (e.g. PromoKey, QR scan, bounty)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 bg-white/[0.05] border-white/15 rounded-2xl text-white placeholder:text-white/40 focus:border-primary text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase font-bold text-white/40 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition ${
                    activeCategory === cat.id
                      ? "bg-primary text-black"
                      : "border border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-16">
            <Link
              to="/what-is-promorang"
              className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-primary/50 transition group"
            >
              <HelpCircle className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-base mb-1">What is Promorang?</h3>
              <p className="text-xs text-white/60 mb-3">The 60-second plain English breakdown of the whole ecosystem.</p>
              <div className="flex items-center text-primary text-xs font-black group-hover:translate-x-1 transition-transform">
                Read Overview <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            <Link
              to="/how-it-works"
              className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-primary/50 transition group"
            >
              <Compass className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-base mb-1">7-Day Operating Rhythm</h3>
              <p className="text-xs text-white/60 mb-3">How Monday debates become Wednesday drops & weekend movement.</p>
              <div className="flex items-center text-primary text-xs font-black group-hover:translate-x-1 transition-transform">
                See Cycle <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            <div
              onClick={() => navigate('/contact')}
              className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-primary/50 transition group cursor-pointer"
            >
              <MessageSquare className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-base mb-1">Support & Tickets</h3>
              <p className="text-xs text-white/60 mb-3">Direct help from our operations & community team.</p>
              <div className="flex items-center text-primary text-xs font-black group-hover:translate-x-1 transition-transform">
                Contact Support <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>

          {/* How-To Guides Section */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">Step-by-Step</p>
                <h2 className="text-2xl md:text-3xl font-black">How-To Library</h2>
              </div>
              <span className="text-xs text-white/40">
                Showing {filteredGuides.length} {filteredGuides.length === 1 ? "guide" : "guides"}
              </span>
            </div>

            {filteredGuides.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/50 text-sm">
                No step-by-step guides matched &quot;{searchQuery}&quot;. Try adjusting your keywords or category filter.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredGuides.map((guide) => {
                  const Icon = guide.icon;
                  return (
                    <div
                      key={guide.id}
                      className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl flex flex-col justify-between transition hover:border-white/20"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[11px] font-black uppercase tracking-wider">
                            <Icon className="h-3 w-3" />
                            {guide.categoryLabel}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">{guide.title}</h3>
                        <p className="text-xs text-white/65 leading-relaxed mb-5">{guide.summary}</p>
                        
                        <div className="space-y-2 mb-6">
                          {guide.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-white/80">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {guide.actionLink && (
                        <div className="pt-4 border-t border-white/10 flex justify-end">
                          <Link
                            to={guide.actionLink.href}
                            className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
                          >
                            {guide.actionLink.label} <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* FAQs Section */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">Quick Answers</p>
                <h2 className="text-2xl md:text-3xl font-black">Frequently Asked Questions</h2>
              </div>
              <span className="text-xs text-white/40">
                Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? "question" : "questions"}
              </span>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/50 text-sm">
                No FAQs matched &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div
                      key={i}
                      className="border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden transition"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                        className="w-full p-5 flex items-center justify-between text-left gap-4 hover:bg-white/[0.02] transition"
                      >
                        <h3 className="font-bold text-sm md:text-base text-white">{faq.q}</h3>
                        <ChevronDown
                          className={`h-4 w-4 text-white/50 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-white/70 leading-relaxed border-t border-white/5">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Still Need Help Box */}
          <div className="p-8 md:p-12 bg-gradient-to-b from-primary/10 to-white/[0.02] border border-primary/20 rounded-[2.5rem] text-center">
            <h3 className="text-2xl font-black mb-2">Still Have Questions?</h3>
            <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
              Our team is ready to help you set up activations, troubleshoot check-ins, or manage your wallet.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="hero"
                onClick={() => navigate('/contact')}
                className="bg-primary text-black font-black"
              >
                <Mail className="w-4 h-4 mr-2" /> Email Support
              </Button>
              <Link
                to="/what-is-promorang"
                className="inline-flex items-center px-4 py-2 rounded-xl border border-white/15 bg-white/[0.05] text-xs font-bold hover:bg-white/10 transition"
              >
                Learn More About Promorang
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
