import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MarketProvider } from "@/contexts/MarketContext";
import { I18nProvider } from "@/i18n/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import ParticipantExperienceV1 from "@/pages/participant/ParticipantExperienceV1";
import ParticipantCompleteReviewV2 from "@/pages/participant/ParticipantCompleteReviewV2";
import "./index.css";
import "./participant-next.css";

const rootElement = document.getElementById("participant-next-root");
if (!rootElement) throw new Error("Missing #participant-next-root");

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(rootElement);
const liveMode = new URLSearchParams(window.location.search).get("live") === "1";

const desktopNav = [
  ["today", "Today"],
  ["discover", "Discover"],
  ["card", "Card"],
  ["vault", "Vault"],
  ["you", "You"],
] as const;

function LocalPreviewSignIn() {
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/participant-next.html?live=1`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (oauthError) setError(oauthError.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start Google sign-in.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080809] px-6 py-12 text-white sm:py-16">
      <div className="mx-auto max-w-md rounded-[1.8rem] border border-white/10 bg-white/[0.025] p-6 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff6a00]">PROMORANG · PARTICIPANT NEXT · LIVE</p>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-[.95]">Continue with Google.</h1>
        <p className="mt-4 text-sm leading-6 text-white/55">Live mode uses your actual PROMORANG account and data. The default review mode requires no login.</p>
        {error ? <p role="alert" className="mt-6 rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm leading-5 text-red-100">{error}</p> : null}
        <button type="button" onClick={handleGoogleSignIn} disabled={submitting} className="mt-7 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-5 text-sm font-black text-black disabled:opacity-55"><span className="grid h-6 w-6 place-items-center rounded-full border border-black/10 text-xs font-black">G</span>{submitting ? "Opening Google…" : "Continue with Google"}</button>
        <a href="/participant-next.html#/today" className="mt-5 block text-center text-xs font-bold text-[#ff9a4d]">Return to no-login review mode</a>
      </div>
    </div>
  );
}

function LiveGate() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#080809] text-sm font-bold text-white/45">Loading your PROMORANG…</div>;
  if (!user) return <LocalPreviewSignIn />;
  return <Routes><Route path="/:surface" element={<ParticipantExperienceV1 />} /><Route path="/" element={<Navigate to="/today" replace />} /><Route path="*" element={<Navigate to="/today" replace />} /></Routes>;
}

function ReviewRoutes() {
  return <Routes><Route path="/*" element={<ParticipantCompleteReviewV2 />} /></Routes>;
}

function DesktopReviewNav() {
  return (
    <header className="participant-desktop-header hidden border-b border-white/[0.06] bg-[#080809] text-white lg:block">
      <div className="mx-auto flex h-[78px] max-w-[1620px] items-center gap-8 px-8">
        <div className="flex min-w-[260px] items-center gap-3">
          <PromorangMark size={34} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff6a00]">PROMORANG</p>
            <p className="text-xs font-semibold text-white/45">Move. Return. Keep.</p>
          </div>
        </div>
        <nav className="flex flex-1 items-center justify-center gap-1" aria-label="Participant navigation">
          {desktopNav.map(([key, label]) => (
            <NavLink key={key} to={`/${key}`} className={({ isActive }) => `rounded-full px-4 py-2.5 text-sm font-bold transition ${isActive ? "bg-[#eadcc6] text-black" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex min-w-[260px] items-center justify-end gap-5">
          <div className="text-right"><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/30">World</p><p className="mt-1 text-sm font-bold text-white/75">Kingston</p></div>
          <span className="rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/[.06] px-3 py-2 text-[9px] font-black uppercase tracking-[.14em] text-[#ff9a4d]">Review data · illustrative</span>
        </div>
      </div>
    </header>
  );
}

function ReviewFrame() {
  const location = useLocation();
  const surface = (location.pathname.split("/").filter(Boolean)[0] || "today").toLowerCase();
  return <div className="participant-review-frame" data-surface={surface}><DesktopReviewNav /><ReviewRoutes /></div>;
}

function renderBootError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  root.render(<div style={{ minHeight: "100vh", background: "#080809", color: "white", padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}><div style={{ maxWidth: 920, margin: "0 auto" }}><p style={{ color: "#ff6a00", fontSize: 12, fontWeight: 800, letterSpacing: ".18em" }}>PROMORANG · PARTICIPANT NEXT BOOT ERROR</p><h1 style={{ marginTop: 16, fontSize: 36, lineHeight: 1.05 }}>The participant preview could not render.</h1><p style={{ marginTop: 18, color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>{message}</p>{stack ? <pre style={{ marginTop: 24, overflowX: "auto", whiteSpace: "pre-wrap", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: 18, background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.62)", fontSize: 12, lineHeight: 1.6 }}>{stack}</pre> : null}</div></div>);
}

try {
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <HashRouter>
                {liveMode ? <AuthProvider><MarketProvider><LiveGate /></MarketProvider></AuthProvider> : <ReviewFrame />}
              </HashRouter>
            </ThemeProvider>
          </QueryClientProvider>
        </I18nProvider>
      </HelmetProvider>
    </React.StrictMode>,
  );
} catch (error) {
  console.error("[PROMORANG Participant Next] boot failed", error);
  renderBootError(error);
}
