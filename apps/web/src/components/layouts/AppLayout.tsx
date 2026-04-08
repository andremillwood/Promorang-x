import { useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AppLayoutProps {
    children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    const { user, roles, activeRole, loading } = useAuth();
    const location = useLocation();

    // Define routes that should always use the marketing layout or NO layout
    const marketingRoutes = [
        "/", "/for-communities", "/for-brands", "/for-merchants",
        "/auth", "/onboarding", "/propose", "/strategies", "/bounties",
        "/help", "/terms", "/privacy", "/contact"
    ];
    const isMarketingRoute = marketingRoutes.some(path =>
        location.pathname === path || location.pathname.startsWith(path + "/")
    );

    // Auth and Onboarding are special "clean" pages
    const isCleanPage = ["/auth", "/onboarding"].includes(location.pathname);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground animate-pulse">
                Initializing...
            </div>
        );
    }

    // If we are on a marketing route, we MUST NOT wrap with DashboardLayout
    // DashboardLayout contains its own Header/Footer logic which might be conflicting
    if (isMarketingRoute) {
        return (
            <div className="flex flex-col min-h-screen">
                {!isCleanPage && <Header />}
                <main className="flex-1">
                    {children || <Outlet />}
                </main>
                {!isCleanPage && <Footer />}
            </div>
        );
    }

    if (user && !isCleanPage) {
        return (
            <DashboardLayout currentRole={(activeRole || "participant") as any}>
                {children || <Outlet />}
            </DashboardLayout>
        );
    }

    // Default marketing layout for public visitors
    return (
        <div className="min-h-screen flex flex-col bg-background">
            {!isCleanPage && <Header />}
            <main className="flex-1">
                {children || <Outlet />}
            </main>
            {!isCleanPage && <Footer />}
        </div>
    );
};

export default AppLayout;
