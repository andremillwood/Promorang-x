import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useCallback, useState } from 'react';
import { useMobileNavigation } from './useMobileNavigation';
import { isRecoverableChunkError } from '@/lib/chunk-recovery';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function Harness({ route = 'first' }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { panelRef, triggerRef } = useMobileNavigation(open, close, route);
  return <><button ref={triggerRef} onClick={() => setOpen(true)}>Open</button><aside ref={panelRef} tabIndex={-1} data-testid="drawer" data-open={open}><button onClick={close}>Close</button></aside></>;
}
it('locks scrolling, closes on Escape, restores focus, and dismisses after navigation', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  const { rerender } = render(<Harness />);
  fireEvent.click(screen.getByText('Open')); expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document, { key: 'Escape' }); expect(document.body.style.overflow).toBe(''); expect(screen.getByText('Open')).toHaveFocus();
  fireEvent.click(screen.getByText('Open')); rerender(<Harness route="second" />);
  expect(screen.getByTestId('drawer')).toHaveAttribute('data-open', 'false'); expect(document.body.style.overflow).toBe('');
});
it('only treats chunk loading failures as recoverable deployment errors', () => {
  expect(isRecoverableChunkError('Failed to fetch dynamically imported module: /assets/a.js')).toBe(true);
  for (const message of ['Failed to fetch', "Cannot read properties of undefined", 'Script error', 'An important field is required']) expect(isRecoverableChunkError(message)).toBe(false);
});

 it('keeps admin tabs exclusive and compares query parameters exactly', async () => {
  const { isNavigationItemActive: active } = await import('@/lib/navigation-active');
  expect(active('/admin', '/admin', '?tab=users')).toBe(false);
  expect(active('/admin', '/admin?tab=users', '?other=x&tab=users')).toBe(true);
  expect(active('/admin', '/admin?tab=users', '?tab=users-archive')).toBe(false);
  expect(active('/moments/a', '/moments', '')).toBe(true);
});
it('wraps keyboard focus inside the open drawer', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  const rects = vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{ width: 44, height: 44 }] as unknown as DOMRectList);
  render(<Harness />); fireEvent.click(screen.getByText('Open'));
  const close = screen.getByText('Close'); expect(close).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Tab' }); expect(close).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true }); expect(close).toHaveFocus();
  rects.mockRestore();
});
