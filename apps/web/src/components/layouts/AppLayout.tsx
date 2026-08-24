import { useLocation, Outlet as RouterOutlet } from "react-router-dom";
const Outlet = RouterOutlet as any;
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RankCelebrationModal } from "@/components/RankCelebrationModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useState, useEffect } from "react";

interface AppLayoutProps {
    children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    const { user, roles, activeRole, loading, profile } = useAuth();
    const location = useLocation();

    const [showRankCelebration, setShowRankCelebration] = useState(false);
    const [currentRank, setCurrentRank] = useState<number | null>(null);

    // Track rank changes for celebration
    useEffect(() => {
        if (profile?.maturity_state !== undefined) {
            const lastRank = localStorage.getItem("promorang_last_seen_rank");
            const numericLastRank = lastRank ? parseInt(lastRank, 10) : 0;

            if (profile.maturity_state > numericLastRank) {
                setCurrentRank(profile.maturity_state);
                setShowRankCelebration(true);
                localStorage.setItem("promorang_last_seen_rank", profile.maturity_state.toString());
            } else if (lastRank === null) {
                // Initialize if first time
                localStorage.setItem("promorang_last_seen_rank", profile.maturity_state.toString());
            }
        }
    }, [profile?.maturity_state]);

    // Define routes that should always use the marketing layout or NO layout
    const marketingRoutes = [
        "/", "/for-communities", "/for-brands", "/for-creators", "/for-merchants", "/for-agencies", "/for-enterprise", "/for-causes",
        "/auth", "/onboarding", "/propose", "/strategies", "/bounties",
        "/help", "/terms", "/privacy", "/account-deletion", "/contact", "/activate",
        "/economy", "/promopush/info", "/careers", "/go", "/free", "/campaigns"
    ];
    const isMarketingRoute = marketingRoutes.some(path =>
        location.pathname === path || location.pathname.startsWith(path + "/")
    ) || ["/growth", "/organizer"].includes(location.pathname);

    // Consumer preview routes provide their own canonical participant shell and
    // must not inherit DashboardLayout or the marketing header/footer.
    const isConsumerPreview = location.pathname === "/app-preview" || location.pathname.startsWith("/app-preview/");

    // Organizer sub-routes provide their own full workspace shell. Rendering them
    // inside DashboardLayout creates a participant sidebar/header around the
    // organizer sidebar and constrains the workspace inside a second container.
    const isOrganizerWorkspace = location.pathname.startsWith("/organizer/");

    // Auth and Onboarding are special "clean" pages
    const isCleanPage = ["/auth", "/onboarding"].includes(location.pathname);
    const showFooterCta = !["/live", "/pulse"].includes(location.pathname);

    if (isConsumerPreview || isOrganizerWorkspace) {
        return <>{children || <Outlet />}</>;
    }

    // If we are on a marketing route, we MUST NOT wrap with DashboardLayout
    // DashboardLayout contains its own Header/Footer logic which might be conflicting
    if (isMarketingRoute) {
        return (
            <div className="flex min-h-screen flex-col overflow-x-clip">
                {!isCleanPage && <Header />}
                <main className="flex-1 overflow-x-clip">
                    {children || <Outlet />}
                </main>
                {!isCleanPage && <Footer showCta={showFooterCta} />}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground animate-pulse">
                Initializing...
            </div>
        );
    }

    if (user && !isCleanPage) {
        return (
            <DashboardLayout currentRole={(activeRole || "participant") as any}>
                {children || <Outlet />}
                <PWAInstallPrompt />
            </DashboardLayout>
        );
    }

    // Default marketing layout for public visitors
    return (
        <div className="min-h-screen flex flex-col bg-background overflow-x-clip">
            {!isCleanPage && <Header />}
            <main className="flex-1 overflow-x-clip">
                {children || <Outlet />}
            </main>
            {!isCleanPage && <Footer showCta={showFooterCta} />}

            <RankCelebrationModal
                isOpen={showRankCelebration}
                currentRank={currentRank || 0}
                onClose={() => setShowRankCelebration(false)}
            />
            <PWAInstallPrompt />
        </div>
    );
};

export default AppLayout;
