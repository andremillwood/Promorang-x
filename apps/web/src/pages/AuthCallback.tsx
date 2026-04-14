import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHasCompletedOnboarding } from "@/hooks/useUserPreferences";

const AuthCallback = () => {
    const { user, loading } = useAuth();
    const { hasCompleted, isLoading: prefsLoading } = useHasCompletedOnboarding();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !prefsLoading) {
            if (user) {
                if (hasCompleted) {
                    navigate("/dashboard", { replace: true });
                } else {
                    navigate("/onboarding", { replace: true });
                }
            } else {
                navigate("/auth", { replace: true });
            }
        }
    }, [user, loading, prefsLoading, hasCompleted, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground animate-pulse font-medium">Completing secure login...</p>
        </div>
    );
};

export default AuthCallback;
