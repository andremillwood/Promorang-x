import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import CommunityPortal, { CommunityWorkspace } from './CommunityPortal';
import { communityFixture } from '@/test/communityFixture';
const mocks = vi.hoisted(() => ({ access: {} as Record<string, unknown>, workspace: {} as Record<string, unknown>, mutate: vi.fn() }));
vi.mock('@/hooks/useCommunity', () => ({
  useCommunityAccess: () => mocks.access, useCommunityWorkspace: () => mocks.workspace,
  useCommunityAction: () => ({ mutateAsync: mocks.mutate, isPending: false }),
}));
vi.mock('@/components/SEO', () => ({ default: () => null }));
vi.mock('@/i18n/I18nContext', () => ({ useI18n: () => ({ locale: 'en', t: (key: string) => key }) }));
const show = (tab = 'today', action = vi.fn().mockResolvedValue({})) => {
  render(<MemoryRouter><CommunityWorkspace data={communityFixture} tab={tab} onAction={action} /></MemoryRouter>); return action;
};
beforeEach(() => { vi.clearAllMocks(); mocks.access = { data: { membership: null, paths: ['YouTube Creator'] }, refetch: vi.fn() }; mocks.workspace = { data: communityFixture, refetch: vi.fn() }; });
afterEach(cleanup);
describe('private community experience', () => {
  it('keeps the workspace hidden while an application is pending, even with cached workspace data', () => {
    mocks.access.data = { membership: { status: 'pending' }, paths: ['YouTube Creator'] };
    render(<MemoryRouter><CommunityPortal /></MemoryRouter>);
    expect(screen.getByText('Your introduction is with the team.')).toBeInTheDocument();
    expect(screen.queryByText('Move board')).not.toBeInTheDocument();
  });
  it('does not render stale private data after an access error', () => {
    mocks.access = { ...mocks.access, data: { membership: { status: 'active' } }, isError: true, error: new Error('Membership unavailable') };
    render(<MemoryRouter><CommunityPortal /></MemoryRouter>);
    expect(screen.getByRole('alert')).toHaveTextContent('Membership unavailable');
    expect(screen.queryByText('Move board')).not.toBeInTheDocument();
  });
  it('keeps PromoCard, perks, and Moments connected without a public lead tab', () => {
    show(); expect(screen.getByRole('link', { name: 'My PromoCard' })).toHaveAttribute('href', '/card');
    expect(screen.getByRole('link', { name: /Perks & saved access/ })).toHaveAttribute('href', '/card');
    expect(screen.getByRole('link', { name: /Find a Moment/ })).toHaveAttribute('href', '/moments');
    expect(screen.queryByText('Lead room')).not.toBeInTheDocument();
  });
  it('a claim calls the server and leaves errors visible', async () => {
    const action = vi.fn().mockRejectedValue(new Error('All places on this move are taken'));
    show('board', action); fireEvent.click(screen.getByRole('button', { name: /I’ll take this/ }));
    await waitFor(() => expect(action).toHaveBeenCalledWith('claim', { move_id: 'move-1' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('All places');
  });
  it('distinguishes planned rhythm from booked sessions', () => {
    show('rhythm'); expect(screen.getByText(/These are programming templates/)).toBeInTheDocument();
    expect(screen.getByText(/Sessions will appear here when a lead confirms/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Week 3' }));
    expect(screen.getByText('Make it happen together')).toBeInTheDocument();
  });
  it('states review requirements and grace before a role application', () => {
    show('roles'); expect(screen.getByText(/60 points \+ 2 accepted content moves/)).toBeInTheDocument();
    expect(screen.getByText(/7-day grace period/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Put my name forward/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('What would you bring to the role?');
  });
  it('labels earnings as historical totals and links to the existing wallet', () => {
    show('wins'); expect(screen.getByText(/earned totals, not your available balance/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open your wallet/ })).toHaveAttribute('href', '/wallet');
  });
});
