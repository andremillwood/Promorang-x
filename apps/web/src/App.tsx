import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TourProvider } from "@/contexts/TourContext";
import AMI_Index from "./pages/AMI_Index";
import Index from "./pages/Index";
import MechanicDetail from "./pages/MechanicDetail";
import ScrollToHash from "./components/ScrollToHash";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Brands from "./pages/Brands";
import Merchants from "./pages/Merchants";
import Hosts from "./pages/Hosts";
import VenueReportTeaser from "./pages/VenueReportTeaser";


// ... existing imports
import AuthPage from "./pages/AuthPage";
import Search from "./pages/Search";
import Activity from "./pages/Activity";
import Following from "./pages/Following";
import Onboarding from "./pages/Onboarding";
import BrandOnboarding from "./pages/onboarding/BrandOnboarding";
import Dashboard from "./pages/Dashboard";
import MomentsApp from "./pages/MomentsApp";
import AdminDashboard from "./pages/AdminDashboard";
import Discover from "./pages/Discover";
import MomentDetail from "./pages/MomentDetail";
import MomentRecord from "./pages/MomentRecord";
import EditMoment from "./pages/EditMoment";
import CheckIn from "./pages/CheckIn";
import Rewards from "./pages/Rewards";
import Analytics from "./pages/Analytics";
import CreateCampaign from "./pages/CreateCampaign";
import CreateBounty from "./pages/CreateBounty";
import CreateMoment from "./pages/CreateMoment";
import CreateProposal from "./pages/CreateProposal";
import AddVenue from "./pages/AddVenue";
import AddProduct from "./pages/AddProduct";
import Settings from "./pages/Settings";
import BountyBoard from "./pages/BountyBoard";
import ForCommunities from "./pages/ForCommunities";
import ForBrands from "./pages/ForBrands";
import ForMerchants from "./pages/ForMerchants";
import ForAgencies from "./pages/ForAgencies";
import Pricing from "./pages/Pricing";
import Hosting from "./pages/Hosting";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import Participants from "./pages/Participants";
import Saved from "./pages/Saved";
import ProposalWorkspace from "./pages/ProposalWorkspace";
import Marketplace from "./pages/Marketplace";
import ServiceCatalog from "./pages/ServiceCatalog";
import AppLayout from "@/components/layouts/AppLayout";
import ProposeLanding from "@/pages/ProposeLanding";
import ProtectedRoute from "@/components/ProtectedRoute";
import BrandCreateCampaign from "@/pages/brand/CreateCampaign";
import HostDiscovery from "@/components/brand/HostDiscovery";
import AuthCallback from "./pages/AuthCallback";
import Gallery from "./pages/Gallery";
import UGCReview from "./pages/UGCReview";
import ActivatePage from "./pages/Activate";

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
              <ScrollToHash />
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/strategies" element={<AMI_Index />} />
                  <Route path="/strategies/:id" element={<MechanicDetail />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/onboarding/brand" element={<BrandOnboarding />} />
                  <Route path="/for-communities" element={<ForCommunities />} />
                  <Route path="/for-brands" element={<ForBrands />} />
                  <Route path="/for-merchants" element={<ForMerchants />} />
                  <Route path="/for-agencies" element={<ForAgencies />} />
                  <Route path="/venue-report/:id" element={<VenueReportTeaser />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/host" element={<Hosting />} />
                  <Route path="/propose" element={<ProposeLanding />} />
                  <Route path="/create-moment" element={<CreateMoment />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/merchants" element={<Merchants />} />
                  <Route path="/hosts" element={<Hosts />} />
                  <Route path="/shop" element={<Marketplace />} />
                  <Route path="/activate" element={<ActivatePage />} />

                  <Route path="/moments/:id" element={<MomentDetail />} />
                  <Route path="/moments/:id/record" element={<MomentRecord />} />
                  <Route path="/moments/:id/edit" element={<EditMoment />} />
                  <Route path="/moments/:id/checkin" element={<CheckIn />} />
                  <Route path="/bounties" element={<BountyBoard />} />
                  <Route path="/momentsapp" element={<MomentsApp />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/moments" element={<Navigate to="/dashboard?tab=moments" replace />} />
                  <Route path="/dashboard/participants" element={<Participants />} />
                  <Route path="/dashboard/campaigns" element={<Navigate to="/dashboard?tab=overview" replace />} />
                  <Route path="/dashboard/venues" element={<Navigate to="/dashboard?tab=venues" replace />} />
                  <Route path="/dashboard/activity" element={<Activity />} />
                  <Route path="/dashboard/following" element={<Following />} />
                  <Route path="/dashboard/saved" element={<Saved />} />
                  <Route path="/dashboard/settings" element={<Settings />} />
                  <Route path="/dashboard/rewards" element={<Rewards />} />
                  <Route path="/dashboard/analytics" element={<Analytics />} />
                  <Route path="/dashboard/campaigns/create" element={<CreateCampaign />} />
                  <Route path="/dashboard/bounties/create" element={<CreateBounty />} />
                  <Route path="/dashboard/moments/create" element={<CreateMoment />} />
                  <Route path="/dashboard/venues/add" element={<AddVenue />} />
                  <Route path="/dashboard/proposals" element={<ProtectedRoute><ProposalWorkspace /></ProtectedRoute>} />
                  <Route path="/dashboard/products/add" element={<AddProduct />} />
                  <Route path="/dashboard/catalog" element={<ProtectedRoute><ServiceCatalog /></ProtectedRoute>} />
                  <Route path="/dashboard/brand/campaigns/create" element={<BrandCreateCampaign />} />
                  <Route path="/dashboard/brand/hosts" element={<HostDiscovery />} />
                  <Route path="/dashboard/gallery" element={<Gallery />} />
                  <Route path="/dashboard/ugc-review" element={<UGCReview />} />
                  <Route path="/profile/:userId" element={<UserProfile />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
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
            </BrowserRouter>
          </TooltipProvider>
        </TourProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
