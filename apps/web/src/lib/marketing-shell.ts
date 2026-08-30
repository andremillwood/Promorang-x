export function isCinematicPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/how-it-works" ||
    pathname === "/promocard" ||
    pathname.startsWith("/economy") ||
    pathname === "/growth" ||
    pathname === "/pioneers" ||
    pathname === "/organizer" ||
    pathname === "/live" ||
    pathname.startsWith("/radar") ||
    pathname.startsWith("/opportunity-radar") ||
    pathname.startsWith("/scenes") ||
    pathname.startsWith("/communities") ||
    pathname.startsWith("/creators") ||
    pathname.startsWith("/events")
  );
}

export function shouldShowMarketingFooterCta(pathname: string): boolean {
  return !["/", "/live", "/pulse"].includes(pathname);
}

export function shouldHideMarketingFooterOnMobile(pathname: string): boolean {
  return pathname === "/";
}
