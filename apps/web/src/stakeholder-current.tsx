import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MarketProvider } from "@/contexts/MarketContext";
import { I18nProvider } from "@/i18n/I18nContext";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import "./index.css";

const CreatorDashboardV2 = lazy(() => import("@/components/dashboards/CreatorDashboardV2"));
const HostDashboardV2 = lazy(() => import("@/components/dashboards/HostDashboardV2"));
const MerchantDashboardV2 = lazy(() => import("@/components/dashboards/MerchantDashboardV2"));
const BrandDashboardV2 = lazy(() => import("@/components/dashboards/BrandDashboardV2"));
const AgencyDashboard = lazy(() => import("@/components/dashboards/AgencyDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

const roles = ["creator", "host", "merchant", "brand", "agency", "admin"] as const;
type RoleKey = (typeof roles)[number];

const queryClient = new QueryClient();
const rootElement = document.getElementById("stakeholder-current-root");
if (!rootElement) throw new Error("Missing #stakeholder-current-root");

function ReferenceHeader({ role }: { role: RoleKey }) {
  const navigate = useNavigate();
  const nextHref = `/stakeholder-next.html#/${role}/today`;
  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-[#080809]/95 px-4 py-3 text-white backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3">
        <div className="mr-auto flex items-center gap-3">
          <PromorangMark size={30} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff6a00]">PROMORANG · CURRENT PRODUCT</p>
            <p className="text-xs text-white/45">Authenticated comparison reference · not a redesign surface</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1" aria-label="Current product role reference">
          {roles.map((item) => (
            <button key={item} type="button" onClick={() => navigate(`/${item}`)} className={`rounded-full px-3 py-2 text-xs font-bold capitalize ${item === role ? "bg-white text-black" : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white"}`}>
              {item === "merchant" ? "Merchant / Venue" : item}
            </button>
          ))}
        </div>
        <a href={nextHref} className="rounded-full border border-[#ff6a00]/35 bg-[#ff6a00]/10 px-4 py-2 text-xs font-black text-[#ff9a4d] hover:bg-[#ff6a00]/15">Open Next →</a>
      </div>
    </header>
  );
}

function CurrentRoleSurface({ role }: { role: RoleKey }) {
  const { user, loading, activeRole } = useAuth();
  if (loading) return <div className="grid min-h-[70vh] place-items-center bg-[#080809] text-sm font-bold text-white/45">Loading current product…</div>;
  if (!user) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#080809] px-6 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff6a00]">Authentication required</p>
          <h1 className="mt-3 text-3xl font-black">Use your existing PROMORANG session.</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">This page renders current production role components and their real account/workspace context. Sign in through PROMORANG first, then return here.</p>
          <a href="/auth" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-black text-black">Open sign in</a>
        </div>
      </div>
    );
  }

  const mismatch = activeRole && activeRole !== role && role !== "admin";
  const Component = role === "creator" ? CreatorDashboardV2
    : role === "host" ? HostDashboardV2
    : role === "merchant" ? MerchantDashboardV2
    : role === "brand" ? BrandDashboardV2
    : role === "agency" ? AgencyDashboard
    : AdminDashboard;

  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 lg:px-8">
      {mismatch ? (
        <div className="mx-auto mb-5 max-w-[1600px] rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Your active production role is <strong>{activeRole}</strong>. This reference is rendering the <strong>{role}</strong> component for UI comparison; account-scoped data may still reflect the active workspace.
        </div>
      ) : null}
      <div className="mx-auto max-w-[1600px]">
        <Suspense fallback={<div className="grid min-h-[40vh] place-items-center text-sm font-bold text-muted-foreground">Loading current role surface…</div>}>
          <Component />
        </Suspense>
      </div>
    </main>
  );
}

function CurrentReferenceRoutes() {
  const location = useLocation();
  const role = (location.pathname.split("/").filter(Boolean)[0] || "creator") as RoleKey;
  const safeRole: RoleKey = roles.includes(role) ? role : "creator";
  return (
    <div className="min-h-screen bg-[#080809]">
      <ReferenceHeader role={safeRole} />
      <Routes>
        {roles.map((item) => <Route key={item} path={`/${item}`} element={<CurrentRoleSurface role={item} />} />)}
        <Route path="/" element={<Navigate to="/creator" replace />} />
        <Route path="*" element={<Navigate to="/creator" replace />} />
      </Routes>
    </div>
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <HashRouter>
              <AuthProvider>
                <MarketProvider>
                  <CurrentReferenceRoutes />
                </MarketProvider>
              </AuthProvider>
            </HashRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </I18nProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
