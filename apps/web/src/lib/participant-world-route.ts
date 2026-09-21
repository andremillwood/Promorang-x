const participantJourneyRoots = [
  "/dashboard",
  "/home",
  "/discover",
  "/discovery",
  "/discoveries",
  "/scenes",
  "/moments",
  "/card",
  "/vault",
  "/memories",
  "/profile",
  "/wallet",
  "/saved",
  "/activity",
  "/earn",
  "/growth/referrals",
];

const matchesRoot = (pathname: string, root: string) =>
  pathname === root || pathname.startsWith(`${root}/`);

export function isParticipantWorldRoute(
  pathname: string,
  search: string,
  activeRole?: string | null,
) {
  const view = new URLSearchParams(search).get("view");

  if (pathname === "/dashboard" && view === "studio") return false;
  if (pathname === "/dashboard" && view === "people") return true;
  if (pathname === "/home") return true;

  return (
    (activeRole ?? "participant") === "participant" &&
    participantJourneyRoots.some((root) => matchesRoot(pathname, root))
  );
}
