import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Link } from 'react-router-dom';
import { withI18n } from '@/test/withI18n';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { clearInstallPrompt } from '@/lib/pwa-install';

beforeEach(() => {
  vi.useFakeTimers(); localStorage.clear(); clearInstallPrompt();
  window.history.replaceState({}, '', '/');
  vi.stubGlobal('matchMedia', vi.fn(query => ({ matches: !query.includes('display-mode'), addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function offer() {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  Object.assign(event, { prompt: vi.fn().mockResolvedValue(undefined), userChoice: Promise.resolve({ outcome: 'accepted' }) });
  act(() => { window.dispatchEvent(event); }); return event as Event & { prompt: ReturnType<typeof vi.fn> };
}
it('retains a prompt offered before mounting and makes installation reachable from participant routes', async () => {
  const event = offer();
  render(withI18n(<MemoryRouter initialEntries={['/today']}><PWAInstallPrompt /></MemoryRouter>));
  act(() => { vi.advanceTimersByTime(2500); });
  const install = screen.getByRole('button', { name: "Install" });
  await act(async () => { fireEvent.click(install); });
  expect(event.prompt).toHaveBeenCalledOnce(); expect(screen.queryByRole('complementary')).toBeNull();
});
it('captures on auth routes and displays only after leaving them', () => {
  render(withI18n(<MemoryRouter initialEntries={['/auth']}><Link to="/discover">Continue</Link><PWAInstallPrompt /></MemoryRouter>));
  offer(); act(() => { vi.advanceTimersByTime(2500); });
  expect(screen.queryByRole('complementary')).toBeNull();
  fireEvent.click(screen.getByText('Continue')); expect(screen.getByRole('complementary')).toBeInTheDocument();
});
it('does not crash when local storage is blocked and hides after installation', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  render(withI18n(<MemoryRouter><PWAInstallPrompt /></MemoryRouter>));
  offer(); act(() => { vi.advanceTimersByTime(2500); });
  expect(screen.getByRole('complementary')).toBeInTheDocument();
  act(() => { window.dispatchEvent(new Event('appinstalled')); }); expect(screen.queryByRole('complementary')).toBeNull();
});
it('does not offer installation inside the installed app', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  render(withI18n(<MemoryRouter><PWAInstallPrompt /></MemoryRouter>)); offer();
  act(() => { vi.advanceTimersByTime(2500); }); expect(screen.queryByRole('complementary')).toBeNull();
});

it('shows iOS guidance, persists dismissal, and respects the cooldown on remount', () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone');
  const view = render(withI18n(<MemoryRouter><PWAInstallPrompt /></MemoryRouter>));
  act(() => { vi.advanceTimersByTime(2500); });
  expect(screen.getByText('Add to Home Screen')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: "Install" })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /dismiss|close|later/i }));
  view.unmount();
  render(withI18n(<MemoryRouter><PWAInstallPrompt /></MemoryRouter>));
  act(() => { vi.advanceTimersByTime(2500); });
  expect(screen.queryByRole('complementary')).toBeNull();
});
it('does not reopen delayed iOS guidance after an installation event', () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone');
  render(withI18n(<MemoryRouter><PWAInstallPrompt /></MemoryRouter>));
  act(() => { window.dispatchEvent(new Event('appinstalled')); vi.advanceTimersByTime(2500); });
  expect(screen.queryByRole('complementary')).toBeNull();
});
