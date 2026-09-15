import { useLocation, Outlet as RouterOutlet } from "react-router-dom";
const Outlet = RouterOutlet as any;
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PromorangAppShell from "@/components/promorang-v2/shell/PromorangAppShell";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RankCelebrationModal } from "@/components/RankCelebrationModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useState, useEffect } from "react";

interface AppLayoutProps {
    children?: React.ReactNode;
}

const PARTICIPANT_SHELL_OVERRIDE_KEY = "promorang:participant-shell";

const AppLayout = ({ children }: AppLayoutProps) => {
    const { user, activeRole, loading, profile } = useAuth();
    const location = useLocation();

    const [showRankCelebration, setShowRankCelebration] = useState(false);
    const [currentRank, setCurrentRank] = useState<number | null>(null);

    const uiOverride = new URLSearchParams(location.search).get("ui");
    const storedShellOverride = typeof window === "undefined"
        ? null
        : localStorage.getItem(PARTICIPANT_SHELL_OVERRIDE_KEY);
    const forceLegacyParticipantShell = uiOverride === "v1" || (uiOverride !== "v2" && storedShellOverride === "v1");

    useEffect(() => {
        if (uiOverride === "v1") {
            localStorage.setItem(PARTICIPANT_SHELL_OVERRIDE_KEY, "v1");
        } else if (uiOverride === "v2") {
            localStorage.removeItem(PARTICIPANT_SHELL_OVERRIDE_KEY);
        }
    }, [uiOverride]);

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
        const content = (
            <>
                {children || <Outlet />}
                <PWAInstallPrompt />
            </>
        );

        // Canary V2 on Participant first. `?ui=v1` persists a local rollback;
        // `?ui=v2` clears it. Commercial/admin roles remain on the proven shell.
        if ((activeRole || "participant") === "participant" && !forceLegacyParticipantShell) {
            return (
                <PromorangAppShell currentRole="participant">
                    {content}
                </PromorangAppShell>
            );
        }

        return (
            <DashboardLayout currentRole={(activeRole || "participant") as any}>
                {content}
            </DashboardLayout>
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
