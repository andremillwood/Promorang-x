/** Compare query values, not substrings (for example users vs users-archive). */
export function isNavigationItemActive(pathname: string, href: string, search: string): boolean {
  const [itemPath, itemQuery] = href.split('?');
  const currentQuery = new URLSearchParams(search);
  if (itemQuery) return pathname === itemPath && Array.from(new URLSearchParams(itemQuery)).every(([key, value]) => currentQuery.get(key) === value);
  if (itemPath === '/dashboard') return (pathname === '/dashboard' || pathname === '/home') && currentQuery.get('view') !== 'studio';
  if (itemPath === '/admin' && currentQuery.has('tab')) return false;
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
}
