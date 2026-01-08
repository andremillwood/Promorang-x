import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Calendar, Users, TrendingUp, Package, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import advertiserService, { type CouponDetail as CouponDetailType } from '@/react-app/services/advertiser';

export default function CouponDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [couponData, setCouponData] = useState<CouponDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isReplenishing, setIsReplenishing] = useState(false);
  const [editData, setEditData] = useState<Partial<CouponType>>({});
  const [replenishQty, setReplenishQty] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!id) {
        setError('No coupon ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await advertiserService.getCoupon(id);

        if (!data) {
          setError('Coupon not found');
          return;
        }

        setCouponData(data);
      } catch (err) {
        console.error('Failed to fetch coupon:', err);
        setError('Failed to load coupon details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      const updated = await advertiserService.updateCoupon(id, editData);
      if (updated && couponData) {
        setCouponData({ ...couponData, coupon: { ...couponData.coupon, ...updated } });
        setIsEditing(false);
        toast({ title: 'Success', description: 'Coupon updated successfully' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update coupon', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await advertiserService.deleteCoupon(id);
      toast({ title: 'Success', description: 'Coupon deleted' });
      navigate('/advertiser/coupons');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete coupon', variant: 'destructive' });
    }
  };

  const handleReplenish = async () => {
    if (!id) return;
    try {
      const updated = await advertiserService.replenishCoupon(id, replenishQty);
      if (updated && couponData) {
        setCouponData({ ...couponData, coupon: { ...couponData.coupon, ...updated } });
        setIsReplenishing(false);
        toast({ title: 'Success', description: `Added ${replenishQty} more coupons` });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to replenish coupon', variant: 'destructive' });
    }
  };

  const toggleStatus = async () => {
    if (!id || !couponData) return;
    const newStatus = couponData.coupon.status === 'active' ? 'paused' : 'active';
    try {
      const updated = await advertiserService.updateCoupon(id, { status: newStatus });
      if (updated) {
        setCouponData({ ...couponData, coupon: { ...couponData.coupon, status: newStatus } });
        toast({ title: 'Success', description: `Coupon ${newStatus}` });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'expired':
        return `${baseClasses} bg-pr-surface-2 text-pr-text-1`;
      case 'depleted':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-700`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !couponData) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error || 'Coupon not found'}</p>
        </div>
      </div>
    );
  }

  const { coupon } = couponData;
  const redemptionRate = coupon.quantity_total > 0
    ? ((coupon.quantity_total - coupon.quantity_remaining) / coupon.quantity_total) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-pr-text-1">{coupon.title}</h1>
            <p className="text-sm text-pr-text-2 mt-1">{coupon.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => {
            setEditData({
              title: coupon.title,
              description: coupon.description,
              value: coupon.value,
              value_unit: coupon.value_unit
            });
            setIsEditing(true);
          }}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" onClick={() => setIsReplenishing(true)}>
            <RefreshCw className="h-4 w-4 mr-2" /> Replenish
          </Button>
          <Button variant="outline" onClick={toggleStatus}>
            {coupon.status === 'active' ? 'Pause' : 'Activate'}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <span className={getStatusBadge(coupon.status)}>
            {coupon.status}
          </span>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editData.title || ''}
                onChange={e => setEditData({ ...editData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editData.description || ''}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Value</label>
                <Input
                  type="number"
                  value={editData.value || 0}
                  onChange={e => setEditData({ ...editData, value: Number(e.target.value) })}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Input
                  value={editData.value_unit || ''}
                  onChange={e => setEditData({ ...editData, value_unit: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReplenishing} onOpenChange={setIsReplenishing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replenish Inventory</DialogTitle>
            <DialogDescription>
              Add more coupons to this campaign's inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <label className="text-sm font-medium">Quantity to Add</label>
            <Input
              type="number"
              value={replenishQty}
              onChange={e => setReplenishQty(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplenishing(false)}>Cancel</Button>
            <Button onClick={handleReplenish}>Add Quantity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <div className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-pr-text-2">Reward Value</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-pr-text-1">
            {coupon.value} {coupon.value_unit}
          </p>
        </div>

        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-pr-text-2">Remaining</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-pr-text-1">
            {coupon.quantity_remaining} / {coupon.quantity_total}
          </p>
        </div>

        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-pr-text-2">Redemption Rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-pr-text-1">
            {redemptionRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-pr-text-2">Assignments</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-pr-text-1">
            {coupon.assignments?.length || 0}
          </p>
        </div>
      </div>

      {/* Assignments */}
      {coupon.assignments && coupon.assignments.length > 0 && (
        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3">
          <div className="p-6 border-b border-pr-surface-3">
            <h2 className="text-lg font-semibold text-pr-text-1">Assignments</h2>
            <p className="text-sm text-pr-text-2 mt-1">
              Where this coupon is currently assigned
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {coupon.assignments.map((assignment) => (
              <div key={assignment.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-pr-text-1">{assignment.target_label}</p>
                  <p className="text-sm text-pr-text-2 mt-1">
                    Type: {assignment.target_type} • Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-pr-surface-2 text-pr-text-1'
                  }`}>
                  {assignment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redemptions */}
      {coupon.redemptions && coupon.redemptions.length > 0 && (
        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3">
          <div className="p-6 border-b border-pr-surface-3">
            <h2 className="text-lg font-semibold text-pr-text-1">Recent Redemptions</h2>
            <p className="text-sm text-pr-text-2 mt-1">
              Latest coupon redemptions by creators
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pr-surface-2">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Redeemed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-pr-surface-card divide-y divide-gray-200">
                {coupon.redemptions.slice(0, 10).map((redemption) => (
                  <tr key={redemption.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-1">
                      {redemption.user_name || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-1">
                      {redemption.reward_value} {redemption.reward_unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-2">
                      {new Date(redemption.redeemed_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${redemption.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-pr-surface-2 text-pr-text-1'
                        }`}>
                        {redemption.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conditions */}
      {coupon.conditions && Object.keys(coupon.conditions).length > 0 && (
        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <h2 className="text-lg font-semibold text-pr-text-1 mb-4">Conditions</h2>
          <div className="space-y-2">
            {Object.entries(coupon.conditions).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-pr-text-2">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium text-pr-text-1">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
