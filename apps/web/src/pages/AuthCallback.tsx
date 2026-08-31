import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";

const AuthCallback = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { t } = useI18n();

    useEffect(() => {
        if (!loading) {
            if (user) {
                navigate("/post-login", { replace: true });
            } else {
                navigate("/auth", { replace: true });
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground animate-pulse font-medium">{t("authCb.completing")}</p>
        </div>
    );
};

export default AuthCallback;
