import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MarketProvider } from "@/contexts/MarketContext";
import { I18nProvider } from "@/i18n/I18nContext";
import ParticipantExperienceV1 from "@/pages/participant/ParticipantExperienceV1";
import "./index.css";

const rootElement = document.getElementById("participant-next-root");
if (!rootElement) throw new Error("Missing #participant-next-root");

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(rootElement);

function LocalPreviewSignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await signIn(email.trim(), password);
      if (result.error) setError(result.error.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in locally.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080809] px-6 py-12 text-white sm:py-16">
      <div className="mx-auto max-w-md rounded-[1.8rem] border border-white/10 bg-white/[0.025] p-6 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff6a00]">PROMORANG · PARTICIPANT NEXT</p>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-[.95]">Sign in here. Stay local.</h1>
        <p className="mt-4 text-sm leading-6 text-white/55">
          This review surface uses your real PROMORANG account data, but authentication happens directly on localhost so you are not sent back to promorang.co.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[.14em] text-white/45">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/12 bg-black/35 px-4 text-base text-white outline-none transition focus:border-[#ff6a00]/70"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[.14em] text-white/45">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/12 bg-black/35 px-4 text-base text-white outline-none transition focus:border-[#ff6a00]/70"
            />
          </label>

          {error ? (
            <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm leading-5 text-red-100">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#f6c453] px-5 text-sm font-black text-black disabled:opacity-55"
          >
            {submitting ? "Signing in…" : "Open my Participant Next"}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-xs leading-5 text-white/42">
            Google sign-in is intentionally not used for this localhost review. OAuth can fall back to the production Site URL when localhost is not on the Supabase redirect allow-list. Production authentication has not been changed.
          </p>
        </div>
      </div>
    </div>
  );
}

function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#080809] text-sm font-bold text-white/45">Loading your PROMORANG…</div>;
  }

  if (!user) return <LocalPreviewSignIn />;

  return (
    <Routes>
      <Route path="/:surface" element={<ParticipantExperienceV1 />} />
      <Route path="/" element={<Navigate to="/today" replace />} />
      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  );
}

function renderBootError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  root.render(
    <div style={{ minHeight: "100vh", background: "#080809", color: "white", padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <p style={{ color: "#ff6a00", fontSize: 12, fontWeight: 800, letterSpacing: ".18em" }}>PROMORANG · PARTICIPANT NEXT BOOT ERROR</p>
        <h1 style={{ marginTop: 16, fontSize: 36, lineHeight: 1.05 }}>The participant preview could not render.</h1>
        <p style={{ marginTop: 18, color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>{message}</p>
        {stack ? <pre style={{ marginTop: 24, overflowX: "auto", whiteSpace: "pre-wrap", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: 18, background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.62)", fontSize: 12, lineHeight: 1.6 }}>{stack}</pre> : null}
      </div>
    </div>,
  );
}

try {
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>
                <HashRouter>
                  <MarketProvider>
                    <Gate />
                  </MarketProvider>
                </HashRouter>
              </AuthProvider>
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
