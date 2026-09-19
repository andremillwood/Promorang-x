import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { persistPostAuthNext } from "@/lib/post-auth-next";
import {
  publicObjectReturnPath,
  shouldCapturePublicObjectAuthReturn,
  type PublicObjectLocation,
} from "@/lib/public-object-continuity";
import {
  clearResumableIntent,
  readResumableIntent,
  rememberResumableIntent,
  resumableIntentCopy,
  type ResumableIntent,
  type ResumableIntentKind,
} from "@/lib/resumable-intent";

function focusResumableAction(intent: ResumableIntent) {
  const copy = resumableIntentCopy(intent.kind);
  let target: HTMLElement | null = null;

  if (intent.kind === "moment_join") {
    target = document.querySelector<HTMLElement>("#moment-primary-action button, #moment-primary-action");
  }

  if (!target) {
    const candidates = Array.from(document.querySelectorAll<HTMLElement>("main button, main a"));
    target = candidates.find((candidate) => {
      const haystack = `${candidate.textContent || ""} ${candidate.getAttribute("aria-label") || ""}`.toLowerCase();
      return copy.needles.some((needle) => haystack.includes(needle));
    }) || null;
  }

  if (target) {
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => target?.focus({ preventScroll: true }), 180);
  }
}

export default function RouteScrollManager() {
  const location = useLocation();
  const { user } = useAuth();
  const [resumeIntent, setResumeIntent] = useState<ResumableIntent | null>(null);
  const previousLocationRef = useRef<PublicObjectLocation>({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  });

  useEffect(() => {
    const nextLocation: PublicObjectLocation = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    };
    const previousLocation = previousLocationRef.current;

    if (shouldCapturePublicObjectAuthReturn({ previous: previousLocation, next: nextLocation })) {
      persistPostAuthNext(publicObjectReturnPath(previousLocation));
    }

    previousLocationRef.current = nextLocation;
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (user) return;

    const captureActionIntent = (event: MouseEvent) => {
      const clicked = event.target instanceof Element ? event.target : null;
      if (!clicked) return;
      const marked = clicked.closest<HTMLElement>("[data-resumable-intent], #moment-primary-action");
      if (!marked) return;

      const returnPath = publicObjectReturnPath({
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      });
      let kind = marked.dataset.resumableIntent as ResumableIntentKind | undefined;
      if (!kind && location.pathname.match(/^\/moments\/[^/]+\/?$/)) kind = "moment_join";
      if (!kind) return;
      const pathParts = location.pathname.split("/").filter(Boolean);

      rememberResumableIntent({
        kind,
        returnPath,
        targetId: marked.dataset.resumableTarget || pathParts[pathParts.length - 1] || null,
      });
    };

    document.addEventListener("click", captureActionIntent, true);
    return () => document.removeEventListener("click", captureActionIntent, true);
  }, [user, location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!user || location.pathname === "/auth" || location.pathname === "/post-login") {
      setResumeIntent(null);
      return;
    }
    const currentPath = publicObjectReturnPath({
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });
    setResumeIntent(readResumableIntent(currentPath));
  }, [user, location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (location.hash) return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [location.pathname, location.hash]);

  const continueIntent = () => {
    if (!resumeIntent) return;
    const intent = resumeIntent;
    clearResumableIntent({ kind: intent.kind, targetId: intent.targetId });
    setResumeIntent(null);
    focusResumableAction(intent);
  };

  const dismissIntent = () => {
    if (!resumeIntent) return;
    clearResumableIntent({ kind: resumeIntent.kind, targetId: resumeIntent.targetId });
    setResumeIntent(null);
  };

  if (!resumeIntent) return null;
  const copy = resumableIntentCopy(resumeIntent.kind);

  return (
    <aside className="fixed inset-x-4 top-20 z-[80] mx-auto max-w-2xl rounded-[1.4rem] border border-primary/30 bg-background/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5" role="status" aria-live="polite">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Pick up where you left off</p>
          <p className="mt-1 font-serif text-xl font-bold text-foreground">{copy.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.detail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={dismissIntent} className="min-h-10 rounded-full px-4 text-xs font-bold text-muted-foreground hover:text-foreground">Not now</button>
          <button type="button" onClick={continueIntent} className="min-h-10 rounded-full bg-primary px-5 text-xs font-black text-primary-foreground">Continue</button>
        </div>
      </div>
    </aside>
  );
}
