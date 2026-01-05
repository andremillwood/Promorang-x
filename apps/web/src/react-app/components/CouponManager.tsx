import { useMemo, useState } from 'react';
import { Plus, Gift, TicketPercent, Users, Target, BarChart2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { CouponType, CouponAssignmentType, CouponRedemptionType, DropType } from '../../shared/types';
import { advertiserService } from '@/react-app/services/advertiser';

interface CouponManagerProps {
  coupons: (CouponType & { assignments: CouponAssignmentType[] })[];
  redemptions: CouponRedemptionType[];
  drops?: DropType[];
  onRefresh: () => void;
}

type FormState = {
  title: string;
  description: string;
  reward_type: CouponType['reward_type'];
  value: number;
  value_unit: CouponType['value_unit'];
  quantity_total: number;
  start_date: string;
  end_date: string;
};

const defaultFormState = (): FormState => {
  const now = new Date();
  const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    title: '',
    description: '',
    reward_type: 'coupon',
    value: 10,
    value_unit: 'percentage',
    quantity_total: 10,
    start_date: now.toISOString().split('T')[0],
    end_date: inThirtyDays.toISOString().split('T')[0],
  };
};

export function CouponManager({ coupons, redemptions, drops = [], onRefresh }: CouponManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedDrop, setSelectedDrop] = useState<string>('');
  const [selectedLeaderboardRange, setSelectedLeaderboardRange] = useState<string>('top-10');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const totalDistributed = useMemo(
    () => coupons.reduce((sum, coupon) => sum + (coupon.quantity_total - coupon.quantity_remaining), 0),
    [coupons],
  );

  const leaderboardOptions = [
    { id: 'top-5', label: 'Top 5 Overall' },
    { id: 'top-10', label: 'Top 10 Overall' },
    { id: 'top-25', label: 'Top 25 Overall' },
    { id: 'growth-leaders', label: 'Growth Leaders (Weekly)' },
  ];

  const resetForm = () => {
    setFormState(defaultFormState());
    setSelectedDrop('');
    setSelectedLeaderboardRange('top-10');
  };

  const handleCreateCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    try {
      await advertiserService.createCoupon({
        ...formState,
        quantity_total: Number(formState.quantity_total),
        value: Number(formState.value),
      });
      resetForm();
      setShowCreateForm(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create coupon', error);
      alert('Failed to create coupon. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleAssignToDrop = async (couponId: string) => {
    if (!selectedDrop) {
      alert('Select a drop first.');
      return;
    }
    setAssigning(couponId);
    try {
      const drop = drops.find((entry) => String(entry.id) === selectedDrop);
      await advertiserService.assignCoupon(couponId, {
        target_type: 'drop',
        target_id: selectedDrop,
        target_label: drop?.title || selectedDrop,
      });
      setSelectedDrop('');
      onRefresh();
    } catch (error) {
      console.error('Failed to assign coupon', error);
      alert('Failed to assign coupon to drop.');
    } finally {
      setAssigning(null);
    }
  };

  const handleAssignToLeaderboard = async (couponId: string) => {
    setAssigning(couponId);
    try {
      const option = leaderboardOptions.find((entry) => entry.id === selectedLeaderboardRange);
      await advertiserService.assignCoupon(couponId, {
        target_type: 'leaderboard',
        target_id: selectedLeaderboardRange,
        target_label: option?.label || selectedLeaderboardRange,
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to assign coupon to leaderboard', error);
      alert('Failed to assign coupon to leaderboard.');
    } finally {
      setAssigning(null);
    }
  };

  const handleRedeem = async (couponId: string) => {
    const userName = prompt('Enter recipient name for redemption (for demo)');
    if (userName === null) return;

    setRedeeming(couponId);
    try {
      await advertiserService.redeemCoupon(couponId, { user_name: userName });
      onRefresh();
    } catch (error) {
      console.error('Failed to redeem coupon', error);
      alert('Failed to redeem coupon.');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-pr-text-1">Giveaways & Coupons</h2>
          <p className="text-sm text-pr-text-2">
            Incentivize creators by attaching rewards to drops or leaderboard milestones.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="inline-flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4" />
          <span>Create Incentive</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-pr-surface-3 p-4">
          <div className="flex items-center space-x-3">
            <TicketPercent className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-pr-text-2">Active Incentives</p>
              <p className="text-2xl font-semibold text-pr-text-1">{coupons.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-pr-surface-3 p-4">
          <div className="flex items-center space-x-3">
            <Gift className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-pr-text-2">Rewards Distributed</p>
              <p className="text-2xl font-semibold text-pr-text-1">{totalDistributed}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-pr-surface-3 p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm text-pr-text-2">Recent Redemptions</p>
              <p className="text-2xl font-semibold text-pr-text-1">{redemptions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateCoupon}
          className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-pr-text-1">Create New Incentive</h3>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-full px-3 py-1 text-sm text-pr-text-2 hover:bg-pr-surface-2"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-pr-text-1">Title</label>
              <input
                required
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="e.g. 25% Off Premium Upgrade"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pr-text-1">Reward Type</label>
              <select
                value={formState.reward_type}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, reward_type: event.target.value as FormState['reward_type'] }))
                }
                className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="coupon">Coupon (percentage/flat discount)</option>
                <option value="giveaway">Giveaway (physical/virtual item)</option>
                <option value="credit">Credit (gems/keys)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-pr-text-1">Description</label>
              <textarea
                rows={3}
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="Let creators know what this incentive offers and how to qualify."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pr-text-1">Reward Value</label>
              <input
                type="number"
                min={0}
                value={formState.value}
                onChange={(event) => setFormState((prev) => ({ ...prev, value: Number(event.target.value) }))}
                className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pr-text-1">Unit</label>
              <select
                value={formState.value_unit}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, value_unit: event.target.value as FormState['value_unit'] }))
                }
                className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="percentage">%</option>
                <option value="usd">USD</option>
                <option value="gems">Gems</option>
                <option value="keys">Keys</option>
                <option value="item">Item</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-pr-text-1">Quantity</label>
              <input
                type="number"
                min={1}
                required
                value={formState.quantity_total}
                onChange={(event) => setFormState((prev) => ({ ...prev, quantity_total: Number(event.target.value) }))}
                className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pr-text-1">Start Date</label>
              <input
                type="date"
                value={formState.start_date}
                onChange={(event) => setFormState((prev) => ({ ...prev, start_date: event.target.value }))}
                className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pr-text-1">End Date</label>
              <input
                type="date"
                value={formState.end_date}
                onChange={(event) => setFormState((prev) => ({ ...prev, end_date: event.target.value }))}
                className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pr-text-1">Leaderboard Target</label>
              <select
                value={selectedLeaderboardRange}
                onChange={(event) => setSelectedLeaderboardRange(event.target.value)}
                className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                {leaderboardOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="mt-6 inline-flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-purple-600 hover:to-pink-600 disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
            <span>Create Incentive</span>
          </button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="rounded-2xl border border-pr-surface-3 bg-pr-surface-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-600">
                  {coupon.reward_type === 'giveaway' ? 'Giveaway' : coupon.reward_type === 'credit' ? 'Credit' : 'Coupon'}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-pr-text-1">{coupon.title}</h3>
                {coupon.description && <p className="mt-1 text-sm text-pr-text-2">{coupon.description}</p>}
              </div>
              <div className="text-right text-sm text-pr-text-2">
                <p>{coupon.quantity_remaining} of {coupon.quantity_total} remaining</p>
                <p className="mt-1">Valid until {new Date(coupon.end_date || '').toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-700">
                <div className="flex items-center space-x-2 font-medium">
                  <BarChart2 className="h-4 w-4" />
                  <span>Assignments</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {coupon.assignments.length > 0 ? (
                    coupon.assignments.map((assignment) => (
                      <li key={assignment.id} className="flex items-center space-x-2 text-xs text-purple-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>
                          {assignment.target_type === 'drop' ? 'Drop:' : 'Leaderboard:'} {assignment.target_label}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-purple-500">No assignments yet.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-lg border border-dashed border-pr-surface-3 p-3 text-sm">
                <p className="font-medium text-pr-text-1">Quick Assign</p>
                <div className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-pr-text-2">Attach to Drop</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedDrop}
                        onChange={(event) => setSelectedDrop(event.target.value)}
                        className="flex-1 rounded-lg border border-pr-surface-3 px-2 py-1 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      >
                        <option value="">Select drop</option>
                        {drops.map((drop) => (
                          <option key={drop.id} value={String(drop.id)}>
                            {drop.title}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignToDrop(coupon.id)}
                        disabled={assigning === coupon.id}
                        className="rounded-lg bg-purple-500 px-2 py-1 text-xs font-medium text-white hover:bg-purple-600 disabled:opacity-60"
                      >
                        {assigning === coupon.id ? 'Assigning...' : 'Attach'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-pr-text-2">Leaderboard Reward</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedLeaderboardRange}
                        onChange={(event) => setSelectedLeaderboardRange(event.target.value)}
                        className="flex-1 rounded-lg border border-pr-surface-3 px-2 py-1 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      >
                        {leaderboardOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignToLeaderboard(coupon.id)}
                        disabled={assigning === coupon.id}
                        className="rounded-lg bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-60"
                      >
                        {assigning === coupon.id ? 'Assigning...' : 'Incentivize'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleRedeem(coupon.id)}
                disabled={redeeming === coupon.id}
                className="inline-flex items-center space-x-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{redeeming === coupon.id ? 'Redeeming…' : 'Record Redemption'}</span>
              </button>
              {coupon.status === 'expired' && (
                <span className="inline-flex items-center space-x-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Expired</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {redemptions.length > 0 && (
        <div className="rounded-2xl border border-pr-surface-3 bg-pr-surface-card">
          <div className="flex items-center justify-between border-b border-pr-border px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-pr-text-1">Recent Redemptions</p>
              <p className="text-xs text-pr-text-2">Track who has redeemed your incentives</p>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {redemptions.map((redemption) => (
              <div key={redemption.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-pr-text-1">{redemption.user_name}</p>
                  <p className="text-xs text-pr-text-2">
                    Redeemed {redemption.reward_value}{' '}
                    {redemption.reward_unit === 'percentage' ? '%' : redemption.reward_unit.toUpperCase()}
                  </p>
                </div>
                <div className="text-right text-xs text-pr-text-2">
                  <p>{new Date(redemption.redeemed_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CouponManager;
