import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authEntryHref, readIntendedStakeholderNext, readIntendedStakeholderRole, rememberIntendedStakeholder } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";

const AuthCallback = () => {
    const { t } = useI18n();
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const role = searchParams.get("role") || readIntendedStakeholderRole(sessionStorage);
        const next = searchParams.get("next") || readIntendedStakeholderNext(sessionStorage);
        rememberIntendedStakeholder(sessionStorage, { role, next });
        if (!loading) {
            if (user) {
                navigate("/post-login", { replace: true });
            } else {
                navigate(authEntryHref({ role, next, mode: "login" }), { replace: true });
            }
        }
    }, [user, loading, navigate, searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground animate-pulse font-medium">{t("auth.completingLogin")}</p>
        </div>
    );
};

export default AuthCallback;
