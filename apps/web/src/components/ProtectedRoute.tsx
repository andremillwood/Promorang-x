import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authPathForReturn, persistPostAuthNext } from "@/lib/post-auth-next";
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
        const returnTo = `${location.pathname}${location.search}${location.hash}`;
        persistPostAuthNext(returnTo);
        return <Navigate to={authPathForReturn(returnTo)} state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
