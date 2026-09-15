import { useLocation, Outlet as RouterOutlet } from "react-router-dom";
const Outlet = RouterOutlet as any;
import { useAuth } from "@/contexts/AuthContext";
import PromorangAppShell from "@/components/promorang-v2/shell/PromorangAppShell";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RankCelebrationModal } from "@/components/RankCelebrationModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useState, useEffect } from "react";

interface AppLayoutProps {
    children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
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
        "/", "/for-communities", "/for-brands", "/for-creators", "/for-merchants", "/for-agencies", "/for-enterprise", "/for-causes",
        "/auth", "/onboarding", "/propose", "/strategies", "/bounties",
        "/help", "/terms", "/privacy", "/account-deletion", "/contact", "/activate",
        "/economy", "/promopush/info", "/careers", "/go", "/free", "/campaigns"
    ];
    const isMarketingRoute = marketingRoutes.some(path =>
        location.pathname === path || location.pathname.startsWith(path + "/")
    ) || ["/growth", "/organizer"].includes(location.pathname);

    // Consumer preview routes provide their own canonical participant shell and
    // must not inherit the authenticated application shell or marketing chrome.
    const previewMode = new URLSearchParams(location.search).get("preview");
    const isConsumerPreview =
        location.pathname === "/app-preview" ||
        location.pathname.startsWith("/app-preview/") ||
        (location.pathname === "/" && previewMode === "consumer");

    const isOrganizerWorkspace = location.pathname.startsWith("/organizer/");
    const isDropLanding = location.pathname.startsWith("/drop/");
    const isAftrHrsLanding =
        location.pathname === "/aftrhrs" ||
        location.pathname.startsWith("/aftrhrs/") ||
        location.pathname === "/moments/aftrhrs" ||
        location.pathname.startsWith("/moments/aftrhrs/");
    const isCleanPage = ["/auth", "/onboarding"].includes(location.pathname) || isDropLanding || isAftrHrsLanding;
    const showFooterCta = !["/live", "/pulse"].includes(location.pathname);

    const isPrivateCommunity = location.pathname === "/community" || location.pathname.startsWith("/community/");
    if (isConsumerPreview || isOrganizerWorkspace || isDropLanding || isAftrHrsLanding || isPrivateCommunity) {
        return <>{children || <Outlet />}</>;
    }

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
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--pr-v2-canvas))] text-[hsl(var(--pr-v2-text-2))]">
                <div role="status" aria-live="polite" className="flex items-center gap-3 text-sm">
                    <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse" />
                    Preparing PROMORANG…
                </div>
            </div>
        );
    }

    if (user && !isCleanPage) {
        return (
            <PromorangAppShell currentRole={(activeRole || "participant") as any}>
                {children || <Outlet />}
                <PWAInstallPrompt />
            </PromorangAppShell>
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
            <PWAInstallPrompt />
        </div>
    );
};

export default AppLayout;
