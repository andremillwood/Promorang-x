import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { routerBasename } from "@/i18n/locale-routing";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TourProvider } from "@/contexts/TourContext";
import { DemoExperienceProvider } from "@/contexts/DemoExperienceContext";
import { lazy, Suspense } from "react";
import ScrollToHash from "./components/ScrollToHash";
import RouteScrollManager from "./components/RouteScrollManager";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import AppLayout from "@/components/layouts/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import GrowthTracker from "@/components/GrowthTracker";
import MetaPixel from "@/components/MetaPixel";
import { MarketProvider } from "@/contexts/MarketContext";

import ChunkErrorBoundary from "./components/ChunkErrorBoundary";
import { MidasDemonstrationTour } from "./components/demo/MidasDemonstrationTour";
import { PromorangRolePilotHUD } from "./components/onboarding/PromorangRolePilotHUD";
import { IntentGoalModal } from "./components/intent/IntentGoalModal";

// Route-level code splitting — each page loads on demand
const Index = lazy(() => import("./pages/Index"));
const AMI_Index = lazy(() => import("./pages/AMI_Index"));
const MechanicDetail = lazy(() => import("./pages/MechanicDetail"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PostLoginRouter = lazy(() => import("@/components/onboarding/PostLoginRouter"));
const BrandOnboarding = lazy(() => import("./pages/onboarding/BrandOnboarding"));
const ForCommunities = lazy(() => import("./pages/ForCommunities"));
const ForBrands = lazy(() => import("./pages/ForBrands"));
const SolutionsHub = lazy(() => import("./pages/SolutionsHub"));
const ForCreators = lazy(() => import("./pages/ForCreators"));
const ForMerchants = lazy(() => import("./pages/ForMerchants"));
const ForAgencies = lazy(() => import("./pages/ForAgencies"));
const ForEnterprise = lazy(() => import("./pages/ForEnterprise"));
const ForCauses = lazy(() => import("./pages/ForCauses"));
const ForDevelopers = lazy(() => import("./pages/ForDevelopers"));
const DeveloperConsole = lazy(() => import("./pages/DeveloperConsole"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const ValueStudioPage = lazy(() => import("./pages/ValueStudioPage"));
const WhatIsPromorang = lazy(() => import("./pages/WhatIsPromorang"));
const Communities = lazy(() => import("./pages/Communities"));
const CommunityDetail = lazy(() => import("./pages/CommunityDetail"));
const Creators = lazy(() => import("./pages/Creators"));
const CreatorDetail = lazy(() => import("./pages/CreatorDetail"));
const EventExperienceDetail = lazy(() => import("./pages/EventExperienceDetail"));
const GrowthHub = lazy(() => import("./pages/GrowthHub"));
const Referrals = lazy(() => import("./pages/Referrals"));
const PioneerPoints = lazy(() => import("./pages/PioneerPoints"));
const Pioneers = lazy(() => import("./pages/Pioneers"));
const OrganizerWorkspace = lazy(() => import("./pages/OrganizerWorkspace"));
const OrganizerLanding = lazy(() => import("./pages/OrganizerLanding"));
const EconomyConcept = lazy(() => import("./pages/EconomyConcept"));
const VenueReportTeaser = lazy(() => import("./pages/VenueReportTeaser"));
const Hosting = lazy(() => import("./pages/Hosting"));
const Pricing = lazy(() => import("./pages/Pricing"));
const NodesPage = lazy(() => import("./pages/NodesPage"));
const MembershipCheckout = lazy(() => import("./pages/MembershipCheckout"));
const BillingResult = lazy(() => import("./pages/BillingResult"));
const Help = lazy(() => import("./pages/Help"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const AccountDeletion = lazy(() => import("./pages/AccountDeletion"));
const Contact = lazy(() => import("./pages/Contact"));
const SupportTickets = lazy(() => import("./pages/SupportTickets"));
const SupportTicketDetail = lazy(() => import("./pages/SupportTicketDetail"));
const GuestRsvp = lazy(() => import("./pages/GuestRsvp"));
const GuestPass = lazy(() => import("./pages/GuestPass"));
const HostGuestOperations = lazy(() => import("./pages/HostGuestOperations"));
const ProposeLanding = lazy(() => import("@/pages/ProposeLanding"));
const CreateMoment = lazy(() => import("./pages/CreateMoment"));
const Discover = lazy(() => import("./pages/Discover"));
const DiscoveryDetail = lazy(() => import("./pages/DiscoveryDetail"));
const DiscoveryAcquisitionPage = lazy(() => import("./pages/DiscoveryAcquisitionPage"));
const ExploreMoments = lazy(() => import("./pages/ExploreMoments"));
const EventScout = lazy(() => import("./pages/EventScout"));
const ExploreVenues = lazy(() => import("./pages/ExploreVenues"));
const ExploreRewards = lazy(() => import("./pages/ExploreRewards"));
const ExploreContent = lazy(() => import("./pages/ExploreContent"));
const Momentum = lazy(() => import("./pages/Momentum"));
const Pulse = lazy(() => import("./pages/Pulse"));
const PulseFeed = lazy(() => import("./pages/PulseFeed"));
const ForYou = lazy(() => import("./pages/ForYou"));
const WatchUnlock = lazy(() => import("./pages/WatchUnlock"));
const ContentMissionDetail = lazy(() => import("./pages/ContentMissionDetail"));
const Search = lazy(() => import("./pages/Search"));
const Brands = lazy(() => import("./pages/Brands"));
const BrandProfile = lazy(() => import("./pages/BrandProfile"));
const Merchants = lazy(() => import("./pages/Merchants"));
const Hosts = lazy(() => import("./pages/Hosts"));
const VenueProfile = lazy(() => import("./pages/VenueProfile"));
const ScoutEnrichment = lazy(() => import("./pages/ScoutEnrichment"));
const CategoryArchive = lazy(() => import("./pages/CategoryArchive"));
const LocationArchive = lazy(() => import("./pages/LocationArchive"));
const CityStewards = lazy(() => import("./pages/CityStewards"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const CommerceDetail = lazy(() => import("./pages/CommerceDetail"));
const CommerceReceiptDetail = lazy(() => import("./pages/CommerceReceiptDetail"));
const MerchantStorefront = lazy(() => import("./pages/MerchantStorefront"));
const OfferDetail = lazy(() => import("./pages/OfferDetail"));
const PublicValueReceipt = lazy(() => import("./pages/PublicValueReceipt"));
const ActivatePage = lazy(() => import("./pages/Activate"));
const MomentDetail = lazy(() => import("./pages/MomentDetail"));
const MomentRecord = lazy(() => import("./pages/MomentRecord"));
const EditMoment = lazy(() => import("./pages/EditMoment"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const BountyBoard = lazy(() => import("./pages/BountyBoard"));
const MomentsApp = lazy(() => import("./pages/MomentsApp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PeopleHome = lazy(() => import("./pages/PeopleHome"));
const MyPeople = lazy(() => import("./pages/MyPeople"));
const GiveSomething = lazy(() => import("./pages/GiveSomething"));
const CreateSomething = lazy(() => import("./pages/CreateSomething"));
const EarnOpportunities = lazy(() => import("./pages/EarnOpportunities"));
const WhatHappened = lazy(() => import("./pages/WhatHappened"));
const MyPromoCard = lazy(() => import("./pages/MyPromoCard"));
const DropClaim = lazy(() => import("./pages/DropClaim"));
const StartCommunity = lazy(() => import("./pages/StartCommunity"));
const PutInventoryUp = lazy(() => import("./pages/PutInventoryUp"));
const Participants = lazy(() => import("./pages/Participants"));
const Activity = lazy(() => import("./pages/Activity"));
const Following = lazy(() => import("./pages/Following"));
const Saved = lazy(() => import("./pages/Saved"));
const Settings = lazy(() => import("./pages/Settings"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Vault = lazy(() => import("./pages/Vault"));
const MemoryDetail = lazy(() => import("./pages/MemoryDetail"));
const CampaignIntelligence = lazy(() => import("./pages/CampaignIntelligence"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CreateCampaign = lazy(() => import("./pages/CreateCampaign"));
const CampaignDetail = lazy(() => import("./pages/CampaignDetail"));
const CreateBounty = lazy(() => import("./pages/CreateBounty"));
const CreateProposal = lazy(() => import("./pages/CreateProposal"));
const AddVenue = lazy(() => import("./pages/AddVenue"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const ProposalWorkspace = lazy(() => import("./pages/ProposalWorkspace"));
const ActivationDetail = lazy(() => import("./pages/ActivationDetail"));
const ServiceCatalog = lazy(() => import("./pages/ServiceCatalog"));
const HostDiscovery = lazy(() => import("@/components/brand/HostDiscovery"));
const Gallery = lazy(() => import("./pages/Gallery"));
const UGCReview = lazy(() => import("./pages/UGCReview"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PromoShare = lazy(() => import("./pages/PromoShare"));
const CardDropClaim = lazy(() => import("./pages/CardDropClaim"));
const ContentDrops = lazy(() => import("./pages/ContentDrops"));
const ContentDropDetail = lazy(() => import("./pages/ContentDropDetail"));
const OfferStudio = lazy(() => import("./pages/OfferStudio"));
const PromoPush = lazy(() => import("./pages/PromoPush"));
const PromoPushCreator = lazy(() => import("./pages/PromoPushCreator"));
const PromoPushLanding = lazy(() => import("./pages/PromoPushLanding"));
const PromoPushEntry = lazy(() => import("./pages/PromoPushEntry"));
const PromoPushCareers = lazy(() => import("./pages/PromoPushCareers"));
const PromoPushPromoterPortal = lazy(() => import("./pages/PromoPushPromoterPortal"));
const PromoShareAdmin = lazy(() => import("./pages/admin/PromoShareAdmin"));
const FeaturedPlacementsAdmin = lazy(() => import("./pages/admin/FeaturedPlacementsAdmin"));
const TradingMarketplace = lazy(() => import("./pages/TradingMarketplace"));
const PiecePortfolio = lazy(() => import("./pages/PiecePortfolio"));
const PieceProfile = lazy(() => import("./pages/PieceProfile"));
const PieceOwnerManage = lazy(() => import("./pages/PieceOwnerManage"));
const KYCPage = lazy(() => import("./pages/KYCPage"));
const KYCAdminDashboard = lazy(() => import("./pages/admin/KYCAdminDashboard"));
const ClaimPages = lazy(() => import("./pages/ClaimPages"));
const LiquidityDashboard = lazy(() => import("./pages/LiquidityDashboard"));
const FeaturedBooking = lazy(() => import("./pages/FeaturedBooking"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PromorangPresents = lazy(() => import("./pages/PromorangPresents"));
const PromorangAccess = lazy(() => import("./pages/PromorangAccess"));
const PromorangCrew = lazy(() => import("./pages/PromorangCrew"));
const OpportunityRadar = lazy(() => import("./pages/OpportunityRadar"));

// Campaign Expansion Pages
const ReferralSprintPage = lazy(() => import("./pages/ReferralSprintPage"));
const SeasonShowdownPage = lazy(() => import("./pages/SeasonShowdownPage"));
const MerchantCouponHub = lazy(() => import("./pages/MerchantCouponHub"));
const GemRushPage = lazy(() => import("./pages/GemRushPage"));
const ActionDetail = lazy(() => import("./pages/ActionDetail"));
const LeadMagnetFunnels = lazy(() => import("./pages/LeadMagnetFunnels"));
const CampaignLanding = lazy(() => import("./pages/CampaignLanding"));
const ArlaCampaignHub = lazy(() => import("./pages/ArlaCampaignHub"));
const ArlaCommercialProposal = lazy(() => import("./pages/ArlaCommercialProposal"));
const MidasCommercialProposal = lazy(() => import("./pages/MidasCommercialProposal"));
const MidasHostPortal = lazy(() => import("./pages/MidasHostPortal"));
const MidasWeekendCampaign = lazy(() => import("./pages/MidasWeekendCampaign"));
const MidasBrandSponsorshipProposal = lazy(() => import("./pages/MidasBrandSponsorshipProposal"));
const StewardDashboard = lazy(() => import("./pages/StewardDashboard"));
const MerchantActionStudio = lazy(() => import("./pages/MerchantActionStudio"));
const ActivatedReferralsDashboard = lazy(() => import("./pages/ActivatedReferralsDashboard"));
const StaffScanner = lazy(() => import("./pages/StaffScanner"));


const queryClient = new QueryClient();
const CanonicalSceneRedirect = () => { const { slug } = useParams(); return <Navigate to={`/scenes/${slug || ""}`} replace />; };
const CanonicalDiscoveryRedirect = () => { const { slug } = useParams(); return <Navigate to={`/discoveries/${slug || ""}`} replace />; };

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TourProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={routerBasename()}>
              <MarketProvider>
              <DemoExperienceProvider>
                <MetaPixel />
                <GrowthTracker />
                <ScrollToHash />
                <RouteScrollManager />
                <MidasDemonstrationTour />
                <PromorangRolePilotHUD />
                <IntentGoalModal />
                <ChunkErrorBoundary>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                  <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/strategies" element={<AMI_Index />} />
                    <Route path="/strategies/:id" element={<MechanicDetail />} />
                    <Route path="/free/:funnel" element={<LeadMagnetFunnels />} />
                    <Route path="/presents" element={<PromorangPresents />} />
                    <Route path="/nightlife" element={<PromorangPresents />} />
                    <Route path="/nightlife/ilhh" element={<PromorangPresents />} />
                    <Route path="/nightlife/encore" element={<PromorangPresents />} />
                    <Route path="/this-week" element={<PromorangPresents />} />
                    <Route path="/access" element={<PromorangAccess />} />
                    <Route path="/crew" element={<PromorangCrew />} />
                    <Route path="/passport" element={<PromorangCrew />} />
                    <Route path="/campaigns/arla-whip-and-cook" element={<ArlaCampaignHub />} />
                    <Route path="/campaigns/arla" element={<ArlaCampaignHub />} />
                    <Route path="/arla" element={<ArlaCampaignHub />} />
                    <Route path="/proposals/arla-pro" element={<ArlaCommercialProposal />} />
                    <Route path="/proposals/arla" element={<ArlaCommercialProposal />} />
                    <Route path="/proposals/midas" element={<MidasCommercialProposal />} />
                    <Route path="/proposals/midas-entertainment" element={<MidasCommercialProposal />} />
                    <Route path="/midas" element={<MidasCommercialProposal />} />
                    <Route path="/sponsorships/midas" element={<MidasBrandSponsorshipProposal />} />
                    <Route path="/proposals/midas/sponsors" element={<MidasBrandSponsorshipProposal />} />
                    <Route path="/brands/midas-summer-2026" element={<MidasBrandSponsorshipProposal />} />
                    <Route path="/campaigns/midas" element={<MidasWeekendCampaign />} />
                    <Route path="/campaigns/midas-summer-weekend" element={<MidasWeekendCampaign />} />
                    <Route path="/midas-summer-2026" element={<MidasWeekendCampaign />} />
                    <Route path="/hosts/midas" element={<MidasHostPortal />} />
                    <Route path="/hosts/midas-entertainment" element={<MidasHostPortal />} />
                    <Route path="/dashboard/hosts/midas" element={<MidasHostPortal />} />
                    <Route path="/dashboard/host/midas" element={<MidasHostPortal />} />
                    <Route path="/campaigns/:campaign" element={<CampaignLanding />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/onboarding/brand" element={<BrandOnboarding />} />
                    <Route path="/post-login" element={<PostLoginRouter />} />
                    <Route path="/for-communities" element={<ForCommunities />} />
                    <Route path="/for-brands" element={<ForBrands />} />
                    <Route path="/solutions" element={<SolutionsHub />} />
                    <Route path="/solutions/:vertical" element={<SolutionsHub />} />
                    <Route path="/for-creators" element={<ForCreators />} />
                    <Route path="/for-merchants" element={<ForMerchants />} />
                    <Route path="/for-agencies" element={<ForAgencies />} />
                    <Route path="/for-enterprise" element={<ForEnterprise />} />
                    <Route path="/for-causes" element={<ForCauses />} />
                    <Route path="/developers" element={<ForDevelopers />} />
                    <Route path="/for-developers" element={<ForDevelopers />} />
                    <Route path="/developers/keys" element={<DeveloperConsole />} />
                    <Route path="/developers/console" element={<DeveloperConsole />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/value-studio" element={<ValueStudioPage />} />
                    <Route path="/simulator" element={<ValueStudioPage />} />
                    <Route path="/sandbox" element={<ValueStudioPage />} />
                    <Route path="/what-is-promorang" element={<WhatIsPromorang />} />
                    <Route path="/about" element={<WhatIsPromorang />} />
                    <Route path="/learn" element={<Help />} />
                    <Route path="/faq" element={<Help />} />
                    <Route path="/scenes" element={<Communities />} />
                    <Route path="/scene/:slug" element={<CanonicalSceneRedirect />} />
                    <Route path="/action/:slug" element={<ActionDetail />} />
                    <Route path="/steward/dashboard" element={<ProtectedRoute><StewardDashboard /></ProtectedRoute>} />
                    <Route path="/merchant/actions" element={<ProtectedRoute><MerchantActionStudio /></ProtectedRoute>} />
                    <Route path="/referrals/activated" element={<ProtectedRoute><ActivatedReferralsDashboard /></ProtectedRoute>} />
                    <Route path="/scenes/:slug" element={<CommunityDetail />} />
                    <Route path="/communities" element={<Navigate to="/scenes" replace />} />
                    <Route path="/communities/:slug" element={<CanonicalSceneRedirect />} />
                    <Route path="/creators" element={<Creators />} />
                    <Route path="/creators/:handle" element={<CreatorDetail />} />
                    <Route path="/economy" element={<EconomyConcept />} />
                    <Route path="/economy/:concept" element={<EconomyConcept />} />
                    <Route path="/venue-report/:id" element={<VenueReportTeaser />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/nodes" element={<NodesPage />} />
                    <Route path="/membership/checkout" element={<ProtectedRoute><MembershipCheckout /></ProtectedRoute>} />
                    <Route path="/claim-pages" element={<ProtectedRoute><ClaimPages /></ProtectedRoute>} />
                    <Route path="/billing/result" element={<ProtectedRoute><BillingResult /></ProtectedRoute>} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/support" element={<Help />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/account-deletion" element={<AccountDeletion />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/support/tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
                    <Route path="/support/tickets/:id" element={<ProtectedRoute><SupportTicketDetail /></ProtectedRoute>} />
                    <Route path="/rsvp/:momentId" element={<GuestRsvp />} />
                    <Route path="/guest-pass/:token" element={<GuestPass />} />
                    <Route path="/host/moments/:momentId/guests" element={<ProtectedRoute><HostGuestOperations /></ProtectedRoute>} />
                    <Route path="/join/participant" element={<Navigate to="/pricing" replace />} />
                    <Route path="/join/venue" element={<Navigate to="/for-merchants" replace />} />
                    <Route path="/hosting" element={<Hosting />} />
                    <Route path="/host" element={<Navigate to="/hosting" replace />} />
                    <Route path="/why-join" element={<Navigate to="/" replace />} />
                    <Route path="/propose" element={<ProposeLanding />} />
                    <Route path="/create" element={<ProtectedRoute><CreateSomething /></ProtectedRoute>} />
                    <Route path="/create/moment" element={<ProtectedRoute><CreateMoment /></ProtectedRoute>} />
                    <Route path="/people" element={<ProtectedRoute><MyPeople /></ProtectedRoute>} />
                    <Route path="/give" element={<ProtectedRoute><GiveSomething /></ProtectedRoute>} />
                    <Route path="/earn" element={<ProtectedRoute><EarnOpportunities /></ProtectedRoute>} />
                    <Route path="/happened" element={<ProtectedRoute><WhatHappened /></ProtectedRoute>} />
                    <Route path="/card" element={<ProtectedRoute><MyPromoCard /></ProtectedRoute>} />
                    <Route path="/start" element={<ProtectedRoute><StartCommunity /></ProtectedRoute>} />
                    <Route path="/stock" element={<ProtectedRoute><PutInventoryUp /></ProtectedRoute>} />
                    <Route path="/home" element={<ProtectedRoute><PeopleHome /></ProtectedRoute>} />
                    <Route path="/drop/:slug" element={<DropClaim />} />
                    <Route path="/app-preview" element={<PeopleHome />} />
                    <Route path="/app-preview/people" element={<MyPeople />} />
                    <Route path="/app-preview/give" element={<GiveSomething />} />
                    <Route path="/app-preview/create" element={<CreateSomething />} />
                    <Route path="/app-preview/earn" element={<EarnOpportunities />} />
                    <Route path="/app-preview/happened" element={<WhatHappened />} />
                    <Route path="/app-preview/card" element={<MyPromoCard />} />
                    <Route path="/app-preview/start" element={<StartCommunity />} />
                    <Route path="/app-preview/stock" element={<PutInventoryUp />} />
                    <Route path="/create/campaign" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
                    <Route path="/create/bounty" element={<ProtectedRoute><CreateBounty /></ProtectedRoute>} />
                    <Route path="/create-moment" element={<Navigate to="/create/moment" replace />} />
                    <Route path="/for-you" element={<ProtectedRoute><ForYou /></ProtectedRoute>} />
                    <Route path="/live" element={<Pulse />} />
                    <Route path="/explore" element={<Navigate to="/discover" replace />} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/d/:slug" element={<DiscoveryAcquisitionPage />} />
                    <Route path="/discoveries/:slug" element={<DiscoveryDetail />} />
                    <Route path="/discovery/:slug" element={<CanonicalDiscoveryRedirect />} />
                    <Route path="/discover/moments" element={<ExploreMoments />} />
                    <Route path="/discover/venues" element={<ExploreVenues />} />
                    <Route path="/discover/rewards" element={<ExploreRewards />} />
                    <Route path="/discover/content" element={<ExploreContent />} />
                    <Route path="/radar" element={<OpportunityRadar />} />
                    <Route path="/opportunity-radar" element={<OpportunityRadar />} />
                    <Route path="/explore/moments" element={<Navigate to="/discover/moments" replace />} />
                    <Route path="/explore/venues" element={<Navigate to="/discover/venues" replace />} />
                    <Route path="/explore/rewards" element={<Navigate to="/discover/rewards" replace />} />
                    <Route path="/rewards" element={<Navigate to="/discover/rewards" replace />} />
                    <Route path="/explore/content" element={<Navigate to="/discover/content" replace />} />
                    <Route path="/events" element={<Navigate to="/discover/moments" replace />} />
                    <Route path="/events/:slug" element={<EventExperienceDetail />} />
                    <Route path="/momentum" element={<Momentum />} />
                    <Route path="/pulse" element={<Pulse />} />
                    <Route path="/pulse-feed" element={<PulseFeed />} />
                    <Route path="/missions" element={<WatchUnlock />} />
                    <Route path="/missions/:id" element={<ContentMissionDetail />} />
                    <Route path="/watch-unlock" element={<Navigate to="/missions" replace />} />
                    <Route path="/watch-unlock/:id" element={<ContentMissionDetail />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/notifications" element={<Activity />} />
                    <Route path="/brands" element={<Brands />} />
                    <Route path="/brands/:slug" element={<BrandProfile />} />
                    <Route path="/merchants" element={<Merchants />} />
                    <Route path="/hosts" element={<Hosts />} />
                    <Route path="/shop" element={<Marketplace />} />
                    <Route path="/shop/category/:category" element={<Marketplace />} />
                    <Route path="/shop/:listingId" element={<CommerceDetail />} />
                    <Route path="/r/:id" element={<PublicValueReceipt />} />
                    <Route path="/receipts/value/:id" element={<PublicValueReceipt />} />
                    <Route path="/receipts/:id" element={<ProtectedRoute><CommerceReceiptDetail /></ProtectedRoute>} />
                    <Route path="/storefront/:merchantId" element={<MerchantStorefront />} />
                    <Route path="/activate" element={<ActivatePage />} />

                    {/* Campaign Expansion Routes */}
                    <Route path="/sprint" element={<ReferralSprintPage />} />
                    <Route path="/seasons/showdown" element={<SeasonShowdownPage />} />
                    <Route path="/merchant/coupons" element={<MerchantCouponHub />} />
                    <Route path="/merchant/scan" element={<StaffScanner />} />
                    <Route path="/staff/scanner" element={<StaffScanner />} />
                    <Route path="/flash-sales" element={<GemRushPage />} />

                    <Route path="/categories/:categorySlug" element={<CategoryArchive />} />
                    <Route path="/locations/:countrySlug" element={<LocationArchive />} />
                    <Route path="/locations/:countrySlug/:citySlug" element={<LocationArchive />} />
                    <Route path="/city-stewards" element={<CityStewards />} />
                    <Route path="/venues/:slug" element={<VenueProfile />} />
                    <Route path="/scout/enrichment" element={<ProtectedRoute><ScoutEnrichment /></ProtectedRoute>} />
                    <Route path="/scout/events" element={<ProtectedRoute><EventScout /></ProtectedRoute>} />
                    <Route path="/moments/:id" element={<MomentDetail />} />
                    <Route path="/moments/:id/record" element={<MomentRecord />} />
                    <Route path="/moments/:id/edit" element={<ProtectedRoute><EditMoment /></ProtectedRoute>} />
                    <Route path="/moments/:id/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
                    <Route path="/bounties" element={<BountyBoard />} />
                    <Route path="/momentsapp" element={<MomentsApp />} />
                    <Route path="/growth" element={<GrowthHub />} />
                    <Route path="/campaign-intelligence" element={<ProtectedRoute><CampaignIntelligence /></ProtectedRoute>} />
                    <Route path="/pioneers" element={<Pioneers />} />
                    <Route path="/growth/pioneer" element={<ProtectedRoute><PioneerPoints /></ProtectedRoute>} />
                    <Route path="/growth/content" element={<Navigate to="/content-drops" replace />} />
                    <Route path="/growth/promoshare" element={<Navigate to="/promoshare" replace />} />
                    <Route path="/growth/campaigns" element={<Navigate to="/promopush" replace />} />
                    <Route path="/growth/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
                    <Route path="/growth/pieces" element={<Navigate to="/portfolio" replace />} />
                    <Route path="/growth/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
                    <Route path="/growth/earnings" element={<Navigate to="/wallet" replace />} />
                    <Route path="/organizer" element={<OrganizerLanding />} />
                    <Route path="/organizer/events" element={<ProtectedRoute><OrganizerWorkspace /></ProtectedRoute>} />
                    <Route path="/organizer/events/new" element={<Navigate to="/create/moment" replace />} />
                    <Route path="/organizer/events/:id" element={<Navigate to="/dashboard?tab=moments" replace />} />
                    <Route path="/organizer/events/:id/attendees" element={<Navigate to="/dashboard/participants" replace />} />
                    <Route path="/organizer/events/:id/check-in" element={<Navigate to="/dashboard/activity" replace />} />
                    <Route path="/organizer/events/:id/promote" element={<Navigate to="/promopush" replace />} />
                    <Route path="/organizer/events/:id/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
                    <Route path="/organizer/communities" element={<ProtectedRoute><OrganizerWorkspace /></ProtectedRoute>} />
                    <Route path="/organizer/scenes" element={<ProtectedRoute><OrganizerWorkspace /></ProtectedRoute>} />
                    <Route path="/organizer/promoters" element={<ProtectedRoute><OrganizerWorkspace /></ProtectedRoute>} />
                    <Route path="/organizer/revenue" element={<ProtectedRoute><OrganizerWorkspace /></ProtectedRoute>} />
                    <Route path="/organizer/tickets" element={<ProtectedRoute><OrganizerWorkspace /></ProtectedRoute>} />
                    <Route path="/organizer/settings" element={<ProtectedRoute><OrganizerWorkspace /></ProtectedRoute>} />
                    <Route path="/organizer/check-ins" element={<ProtectedRoute><OrganizerWorkspace /></ProtectedRoute>} />
                    <Route path="/organizer/analytics" element={<ProtectedRoute><OrganizerWorkspace /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/participant" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard/creator" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard/host" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard/brand" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard/merchant" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard/agency" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard/moments" element={<Navigate to="/dashboard?tab=moments" replace />} />
                    <Route path="/dashboard/participants" element={<Participants />} />
                    <Route path="/dashboard/campaigns" element={<Navigate to="/dashboard?tab=overview" replace />} />
                    <Route path="/dashboard/venues" element={<Navigate to="/dashboard?tab=venues" replace />} />
                    <Route path="/dashboard/activity" element={<Activity />} />
                    <Route path="/dashboard/following" element={<Following />} />
                    <Route path="/dashboard/saved" element={<Saved />} />
                    <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
                    <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
                    <Route path="/dashboard/settings" element={<Settings />} />
                    <Route path="/dashboard/rewards" element={<Navigate to="/vault" replace />} />
                    <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                    <Route path="/promoshare" element={<PromoShare />} />
                    <Route path="/claim-drop" element={<CardDropClaim />} />
                    <Route path="/content-drops" element={<ContentDrops />} />
                    <Route path="/content-drops/:id" element={<ContentDropDetail />} />
                    <Route path="/offers" element={<ProtectedRoute><OfferStudio /></ProtectedRoute>} />
                    <Route path="/dashboard/offers" element={<ProtectedRoute><OfferStudio /></ProtectedRoute>} />
                    <Route path="/promopush" element={<ProtectedRoute><PromoPush /></ProtectedRoute>} />
                    <Route path="/promopush/creator" element={<ProtectedRoute><PromoPushCreator /></ProtectedRoute>} />
                    <Route path="/promopush/info" element={<PromoPushLanding />} />
                    <Route path="/promopush/promoter" element={<ProtectedRoute><PromoPushPromoterPortal /></ProtectedRoute>} />
                    <Route path="/careers/:role" element={<PromoPushCareers />} />
                    <Route path="/go/:code" element={<PromoPushEntry />} />
                    <Route path="/sponsor" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/sponsor/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
                    <Route path="/featured" element={<FeaturedBooking />} />
                    <Route path="/vault" element={<Vault />} />
                    <Route path="/memories/:id" element={<MemoryDetail />} />
                    <Route path="/dashboard/analytics" element={<Analytics />} />
                    <Route path="/dashboard/campaigns/create" element={<Navigate to="/create/campaign" replace />} />
                    <Route path="/dashboard/campaigns/:id" element={<CampaignDetail />} />
                    <Route path="/dashboard/bounties/create" element={<Navigate to="/create/bounty" replace />} />
                    <Route path="/dashboard/moments/create" element={<Navigate to="/create/moment" replace />} />
                    <Route path="/dashboard/venues/add" element={<AddVenue />} />
                    <Route path="/dashboard/proposals" element={<ProtectedRoute><ProposalWorkspace /></ProtectedRoute>} />
                    <Route path="/dashboard/proposals/:id" element={<ProtectedRoute><ActivationDetail /></ProtectedRoute>} />
                    <Route path="/dashboard/products/add" element={<AddProduct />} />
                    <Route path="/dashboard/catalog" element={<ProtectedRoute><ServiceCatalog /></ProtectedRoute>} />
                    <Route path="/dashboard/brand/campaigns/create" element={<Navigate to="/create/campaign" replace />} />
                    <Route path="/dashboard/brand/hosts" element={<HostDiscovery />} />
                    <Route path="/dashboard/gallery" element={<Gallery />} />
                    <Route path="/dashboard/ugc-review" element={<UGCReview />} />
                    <Route path="/profile/:userId" element={<UserProfile />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/promoshare" element={<PromoShareAdmin />} />
                    <Route path="/admin/featured" element={<FeaturedPlacementsAdmin />} />
                    <Route path="/admin/kyc" element={<ProtectedRoute><KYCAdminDashboard /></ProtectedRoute>} />
                    <Route path="/marketplace" element={<ProtectedRoute><TradingMarketplace /></ProtectedRoute>} />
                    <Route path="/portfolio" element={<ProtectedRoute><PiecePortfolio /></ProtectedRoute>} />
                    <Route path="/pieces/:pieceType/:assetId" element={<ProtectedRoute><PieceProfile /></ProtectedRoute>} />
                    <Route path="/pieces/:pieceType/:assetId/manage" element={<ProtectedRoute><PieceOwnerManage /></ProtectedRoute>} />
                    <Route path="/kyc" element={<ProtectedRoute><KYCPage /></ProtectedRoute>} />
                    <Route path="/liquidity" element={<ProtectedRoute><LiquidityDashboard /></ProtectedRoute>} />
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

                  <Route
                    path="/propose/new"
                    element={
                      <ProtectedRoute>
                        <CreateProposal />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
                </ChunkErrorBoundary>
                <PWAInstallPrompt />
              </DemoExperienceProvider>
              </MarketProvider>
            </BrowserRouter>
          </TooltipProvider>
        </TourProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
