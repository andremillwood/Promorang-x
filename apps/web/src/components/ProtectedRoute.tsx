import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { buildAuthHref, inferAuthRole, readStoredCommercialAudience } from "@/lib/commercial-intent";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        const next = `${location.pathname}${location.search}`;
        const role = inferAuthRole(location.pathname, location.search, readStoredCommercialAudience());
        return <Navigate to={buildAuthHref(next, role)} state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
