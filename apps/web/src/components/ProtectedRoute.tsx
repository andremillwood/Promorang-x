import { Navigate, useLocation } from "react-router-dom";
import { authEntryHref } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
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
        return <Navigate to={authEntryHref({ next, mode: "login" })} state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
