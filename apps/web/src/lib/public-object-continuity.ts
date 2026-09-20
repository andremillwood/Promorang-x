export type PublicObjectLocation = {
  pathname: string;
  search?: string;
  hash?: string;
};

const EXACT_PUBLIC_OBJECT_PATTERNS = [
  /^\/discoveries\/[^/]+\/?$/,
  /^\/d\/[^/]+\/?$/,
  /^\/moments\/[^/]+\/?$/,
  /^\/shop\/[^/]+\/?$/,
  /^\/storefront\/[^/]+\/?$/,
  /^\/scenes\/[^/]+\/?$/,
  /^\/creators\/[^/]+\/?$/,
  /^\/venues\/[^/]+\/?$/,
  /^\/brands\/[^/]+\/?$/,
  /^\/events\/[^/]+\/?$/,
  /^\/drop\/[^/]+\/?$/,
  /^\/content-drops\/[^/]+\/?$/,
];

export function isPublicObjectPath(pathname?: string | null): boolean {
  if (!pathname) return false;
  return EXACT_PUBLIC_OBJECT_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function publicObjectReturnPath(location: PublicObjectLocation): string {
  const search = location.search || "";
  const hash = location.hash || "";
  return `${location.pathname}${search}${hash}`;
}

export function shouldCapturePublicObjectAuthReturn({
  previous,
  next,
}: {
  previous: PublicObjectLocation;
  next: PublicObjectLocation;
}): boolean {
  if (next.pathname !== "/auth") return false;
  if (!isPublicObjectPath(previous.pathname)) return false;
  const params = new URLSearchParams((next.search || "").replace(/^\?/, ""));
  return !params.get("next");
}
