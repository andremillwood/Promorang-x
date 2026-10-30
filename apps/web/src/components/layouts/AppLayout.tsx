import { MARKETING_STORY_ROUTES } from "@/components/marketing/marketing-story-routes";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { useLocation, Outlet as RouterOutlet } from "react-router-dom";
const Outlet = RouterOutlet;
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Header from "@/components/Header";
import { PublicHomeBar } from "@/components/culture/PublicHomeBar";
import { PublicMobileNavigation } from "@/components/navigation/PublicMobileNavigation";
import { MobileNavigationOwner } from "@/components/navigation/MobileNavigationOwner";
import "@/components/navigation/public-mobile-navigation.css";
import Footer from "@/components/Footer";
import { RankCelebrationModal } from "@/components/RankCelebrationModal";
import { useState, useEffect, type ComponentProps } from "react";
import { ParticipantWorldLayout } from "@/components/layouts/ParticipantWorldLayout";
import { isParticipantWorldRoute } from "@/lib/participant-world-route";
import "@/styles/stakeholder-production-world.css";

interface AppLayoutProps {
    children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { t: webT } = useWebI18n();
    const { user, activeRole, loading, profile } = useAuth();
    const location = useLocation();

    const [showRankCelebration, setShowRankCelebration] = useState(false);
    const [currentRank, setCurrentRank] = useState<number | null>(null);

    useEffect(() => {
        if (profile?.maturity_state !== undefined) {
            const lastRank = localStorage.getItem("promorang_last_seen_rank");
            const numericLastRank = lastRank ? parseInt(lastRank, 10) : 0;

            if (profile.maturity_state > numericLastRank) {
                setCurrentRank(profile.maturity_state);
                setShowRankCelebration(true);
                localStorage.setItem("promorang_last_seen_rank", profile.maturity_state.toString());
            } else if (lastRank === null) {
                localStorage.setItem("promorang_last_seen_rank", profile.maturity_state.toString());
            }
        }
    }, [profile?.maturity_state]);

    const marketingRoutes = [
        "/", "/join", "/how-it-works", "/what-is-promorang", "/about", "/pricing", "/solutions", "/business/start", "/hosting",
        "/developers", "/for-developers", "/for-communities", "/for-brands", "/for-creators", "/for-merchants", "/for-agencies", "/for-enterprise", "/for-causes",
        "/auth", "/onboarding", "/propose", "/strategies", "/bounties",
        "/help", "/learn", "/faq", "/terms", "/privacy", "/account-deletion", "/contact", "/activate",
        "/economy", "/promopush/info", "/careers", "/go", "/free", "/campaigns"
    ];
    const isPublicDiscoveryRoute = !loading && !user && [
        "/live", "/discover", "/discoveries", "/moments", "/scenes", "/venues",
        "/creators", "/offers", "/storefront", "/profile", "/shop",
    ].some(path => location.pathname === path || location.pathname.startsWith(path + "/"));
    const isMarketingRoute = marketingRoutes.some(path =>
        location.pathname === path || location.pathname.startsWith(path + "/")
    ) || ["/growth", "/organizer"].includes(location.pathname) || (!user && location.pathname === "/search") || isPublicDiscoveryRoute;

    // Consumer preview routes provide their own canonical participant shell and
    // must not inherit DashboardLayout or the marketing header/footer.
    const previewMode = new URLSearchParams(location.search).get("preview");
    const isConsumerPreview =
        location.pathname === "/app-preview" ||
        location.pathname.startsWith("/app-preview/") ||
        (location.pathname === "/" && previewMode === "consumer");

    const isDropLanding = location.pathname.startsWith("/drop/");
    const isAftrHrsLanding =
        location.pathname === "/aftrhrs" ||
        location.pathname.startsWith("/aftrhrs/") ||
        location.pathname === "/moments/aftrhrs" ||
        location.pathname.startsWith("/moments/aftrhrs/");
    const isCleanPage = ["/auth", "/onboarding"].includes(location.pathname) || isDropLanding || isAftrHrsLanding;
    const showFooterCta = !["/", "/live", "/pulse"].includes(location.pathname) && !MARKETING_STORY_ROUTES.some(route => location.pathname === route || location.pathname.startsWith(`${route}/`));

    const isPrivateCommunity = location.pathname === "/community" || location.pathname.startsWith("/community/");
    if (isConsumerPreview || isDropLanding || isAftrHrsLanding || isPrivateCommunity) {
        return <>{children || <Outlet />}</>;
    }

    if (isMarketingRoute) {
        return (
            <MobileNavigationOwner.Provider value={true}>
                <div className={`flex min-h-screen min-w-0 flex-col ${!isCleanPage ? "public-navigation-shell" : ""}`}>
                    {!isCleanPage && <PublicHomeBar />}
                    <div className="min-w-0 flex-1">
                        {children || <Outlet />}
                    </div>
                    {!isCleanPage && <Footer showCta={showFooterCta} />}
                    {!isCleanPage && <PublicMobileNavigation />}
                </div>
            </MobileNavigationOwner.Provider>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground animate-pulse">
                {webT("web.initializing")}
            </div>
        );
    }

    const isParticipantWorld = isParticipantWorldRoute(
        location.pathname,
        location.search,
        activeRole,
    );

    if (user && isParticipantWorld) {
        return (
            <MobileNavigationOwner.Provider value={true}>
                <ParticipantWorldLayout>
                    {children || <Outlet />}
                </ParticipantWorldLayout>
            </MobileNavigationOwner.Provider>
        );
    }

    if (user && !isCleanPage) {
        const stakeholderRole = activeRole || "participant";
        return (
            <MobileNavigationOwner.Provider value={true}>
                <div data-stakeholder-world data-stakeholder-role={stakeholderRole}>
                    <DashboardLayout currentRole={stakeholderRole as ComponentProps<typeof DashboardLayout>["currentRole"]}>
                        {children || <Outlet />}
                    </DashboardLayout>
                </div>
            </MobileNavigationOwner.Provider>
        );
    }

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
        </div>
    );
};

export default AppLayout;
