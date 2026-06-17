import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Route-level code splitting — each page loads on demand
const Index = lazy(() => import("./pages/Index"));
const AMI_Index = lazy(() => import("./pages/AMI_Index"));
const MechanicDetail = lazy(() => import("./pages/MechanicDetail"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const BrandOnboarding = lazy(() => import("./pages/onboarding/BrandOnboarding"));
const ForCommunities = lazy(() => import("./pages/ForCommunities"));
const ForBrands = lazy(() => import("./pages/ForBrands"));
const ForCreators = lazy(() => import("./pages/ForCreators"));
const ForMerchants = lazy(() => import("./pages/ForMerchants"));
const ForAgencies = lazy(() => import("./pages/ForAgencies"));
const EconomyConcept = lazy(() => import("./pages/EconomyConcept"));
const VenueReportTeaser = lazy(() => import("./pages/VenueReportTeaser"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Help = lazy(() => import("./pages/Help"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const SupportTickets = lazy(() => import("./pages/SupportTickets"));
const SupportTicketDetail = lazy(() => import("./pages/SupportTicketDetail"));
const ProposeLanding = lazy(() => import("@/pages/ProposeLanding"));
const CreateMoment = lazy(() => import("./pages/CreateMoment"));
const Discover = lazy(() => import("./pages/Discover"));
const ExploreMoments = lazy(() => import("./pages/ExploreMoments"));
const ExploreVenues = lazy(() => import("./pages/ExploreVenues"));
const ExploreRewards = lazy(() => import("./pages/ExploreRewards"));
const ExploreContent = lazy(() => import("./pages/ExploreContent"));
const Pulse = lazy(() => import("./pages/Pulse"));
const WatchUnlock = lazy(() => import("./pages/WatchUnlock"));
const ContentMissionDetail = lazy(() => import("./pages/ContentMissionDetail"));
const Search = lazy(() => import("./pages/Search"));
const Brands = lazy(() => import("./pages/Brands"));
const BrandProfile = lazy(() => import("./pages/BrandProfile"));
const Merchants = lazy(() => import("./pages/Merchants"));
const Hosts = lazy(() => import("./pages/Hosts"));
const VenueProfile = lazy(() => import("./pages/VenueProfile"));
const CategoryArchive = lazy(() => import("./pages/CategoryArchive"));
const LocationArchive = lazy(() => import("./pages/LocationArchive"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const ActivatePage = lazy(() => import("./pages/Activate"));
const MomentDetail = lazy(() => import("./pages/MomentDetail"));
const MomentRecord = lazy(() => import("./pages/MomentRecord"));
const EditMoment = lazy(() => import("./pages/EditMoment"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const BountyBoard = lazy(() => import("./pages/BountyBoard"));
const MomentsApp = lazy(() => import("./pages/MomentsApp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Participants = lazy(() => import("./pages/Participants"));
const Activity = lazy(() => import("./pages/Activity"));
const Following = lazy(() => import("./pages/Following"));
const Saved = lazy(() => import("./pages/Saved"));
const Settings = lazy(() => import("./pages/Settings"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Vault = lazy(() => import("./pages/Vault"));
const MemoryDetail = lazy(() => import("./pages/MemoryDetail"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CreateCampaign = lazy(() => import("./pages/CreateCampaign"));
const CampaignDetail = lazy(() => import("./pages/CampaignDetail"));
const CreateBounty = lazy(() => import("./pages/CreateBounty"));
const CreateProposal = lazy(() => import("./pages/CreateProposal"));
const AddVenue = lazy(() => import("./pages/AddVenue"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const ProposalWorkspace = lazy(() => import("./pages/ProposalWorkspace"));
const ServiceCatalog = lazy(() => import("./pages/ServiceCatalog"));
const HostDiscovery = lazy(() => import("@/components/brand/HostDiscovery"));
const Gallery = lazy(() => import("./pages/Gallery"));
const UGCReview = lazy(() => import("./pages/UGCReview"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PromoShare = lazy(() => import("./pages/PromoShare"));
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
const KYCPage = lazy(() => import("./pages/KYCPage"));
const KYCAdminDashboard = lazy(() => import("./pages/admin/KYCAdminDashboard"));
const LiquidityDashboard = lazy(() => import("./pages/LiquidityDashboard"));
const FeaturedBooking = lazy(() => import("./pages/FeaturedBooking"));
const PostLoginRouter = lazy(() => import("./components/onboarding/PostLoginRouter"));
const NotFound = lazy(() => import("./pages/NotFound"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TourProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <DemoExperienceProvider>
                <ScrollToHash />
                <RouteScrollManager />
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/strategies" element={<AMI_Index />} />
                    <Route path="/strategies/:id" element={<MechanicDetail />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/onboarding/brand" element={<BrandOnboarding />} />
                    <Route path="/post-login" element={<PostLoginRouter />} />
                    <Route path="/for-communities" element={<ForCommunities />} />
                    <Route path="/for-brands" element={<ForBrands />} />
                    <Route path="/for-creators" element={<ForCreators />} />
                    <Route path="/for-merchants" element={<ForMerchants />} />
                    <Route path="/for-agencies" element={<ForAgencies />} />
                    <Route path="/economy/:concept" element={<EconomyConcept />} />
                    <Route path="/venue-report/:id" element={<VenueReportTeaser />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/support" element={<Help />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/support/tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
                    <Route path="/support/tickets/:id" element={<ProtectedRoute><SupportTicketDetail /></ProtectedRoute>} />
                    <Route path="/host" element={<Navigate to="/for-communities" replace />} />
                    <Route path="/why-join" element={<Navigate to="/" replace />} />
                    <Route path="/propose" element={<ProposeLanding />} />
                    <Route path="/create" element={<Navigate to="/create/moment" replace />} />
                    <Route path="/create/moment" element={<CreateMoment />} />
                    <Route path="/create/campaign" element={<CreateCampaign />} />
                    <Route path="/create/bounty" element={<CreateBounty />} />
                    <Route path="/create-moment" element={<Navigate to="/create/moment" replace />} />
                    <Route path="/for-you" element={<Navigate to="/pulse" replace />} />
                    <Route path="/explore" element={<Navigate to="/discover" replace />} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/discover/moments" element={<ExploreMoments />} />
                    <Route path="/discover/venues" element={<ExploreVenues />} />
                    <Route path="/discover/rewards" element={<ExploreRewards />} />
                    <Route path="/discover/content" element={<ExploreContent />} />
                    <Route path="/explore/moments" element={<Navigate to="/discover/moments" replace />} />
                    <Route path="/explore/venues" element={<Navigate to="/discover/venues" replace />} />
                    <Route path="/explore/rewards" element={<Navigate to="/discover/rewards" replace />} />
                    <Route path="/explore/content" element={<Navigate to="/discover/content" replace />} />
                    <Route path="/pulse" element={<Pulse />} />
                    <Route path="/missions" element={<WatchUnlock />} />
                    <Route path="/missions/:id" element={<ContentMissionDetail />} />
                    <Route path="/watch-unlock" element={<Navigate to="/missions" replace />} />
                    <Route path="/watch-unlock/:id" element={<ContentMissionDetail />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/brands" element={<Brands />} />
                    <Route path="/brands/:slug" element={<BrandProfile />} />
                    <Route path="/merchants" element={<Merchants />} />
                    <Route path="/hosts" element={<Hosts />} />
                    <Route path="/shop" element={<Marketplace />} />
                    <Route path="/activate" element={<ActivatePage />} />

                    <Route path="/categories/:categorySlug" element={<CategoryArchive />} />
                    <Route path="/locations/:countrySlug" element={<LocationArchive />} />
                    <Route path="/locations/:countrySlug/:citySlug" element={<LocationArchive />} />
                    <Route path="/venues/:slug" element={<VenueProfile />} />
                    <Route path="/moments/:id" element={<MomentDetail />} />
                    <Route path="/moments/:id/record" element={<MomentRecord />} />
                    <Route path="/moments/:id/edit" element={<EditMoment />} />
                    <Route path="/moments/:id/checkin" element={<CheckIn />} />
                    <Route path="/bounties" element={<BountyBoard />} />
                    <Route path="/momentsapp" element={<MomentsApp />} />
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
                <PWAInstallPrompt />
              </DemoExperienceProvider>
            </BrowserRouter>
          </TooltipProvider>
        </TourProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
