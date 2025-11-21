import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Plus, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/react-app/components/ui/use-toast';
import advertiserService from '@/react-app/services/advertiser';

interface BulkCoupon {
  id: string;
  title: string;
  description: string;
  reward_type: 'coupon' | 'giveaway' | 'credit';
  value: number;
  value_unit: string;
  quantity_total: number;
  start_date: string;
  end_date: string;
}

export default function BulkCouponCreation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<BulkCoupon[]>([]);
  const [creating, setCreating] = useState(false);

  const addCoupon = () => {
    const now = new Date();
    const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    setCoupons([
      ...coupons,
      {
        id: `temp-${Date.now()}`,
        title: '',
        description: '',
        reward_type: 'coupon',
        value: 10,
        value_unit: 'percentage',
        quantity_total: 100,
        start_date: now.toISOString().split('T')[0],
        end_date: inThirtyDays.toISOString().split('T')[0],
      },
    ]);
  };

  const removeCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const duplicateCoupon = (coupon: BulkCoupon) => {
    setCoupons([
      ...coupons,
      {
        ...coupon,
        id: `temp-${Date.now()}`,
        title: `${coupon.title} (Copy)`,
      },
    ]);
  };

  const updateCoupon = (id: string, field: keyof BulkCoupon, value: any) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleBulkCreate = async () => {
    if (coupons.length === 0) {
      toast({
        title: 'No Coupons',
        description: 'Please add at least one coupon to create.',
      });
      return;
    }

    // Validate all coupons
    const invalid = coupons.filter(c => !c.title || c.value <= 0 || c.quantity_total <= 0);
    if (invalid.length > 0) {
      toast({
        title: 'Validation Error',
        description: `${invalid.length} coupon(s) have invalid data. Please check title, value, and quantity.`,
      });
      return;
    }

    setCreating(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const coupon of coupons) {
        try {
          await advertiserService.createCoupon({
            title: coupon.title,
            description: coupon.description,
            reward_type: coupon.reward_type,
            value: coupon.value,
            value_unit: coupon.value_unit,
            quantity_total: coupon.quantity_total,
            start_date: coupon.start_date,
            end_date: coupon.end_date,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to create coupon: ${coupon.title}`, error);
          failCount++;
        }
      }

      toast({
        title: 'Bulk Creation Complete',
        description: `Successfully created ${successCount} coupon(s). ${failCount > 0 ? `${failCount} failed.` : ''}`,
      });

      if (successCount > 0) {
        navigate('/advertiser/coupons');
      }
    } catch (error) {
      console.error('Bulk creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create coupons. Please try again.',
      });
    } finally {
      setCreating(false);
    }
  };

  const exportTemplate = () => {
    const csv = [
      'Title,Description,Reward Type,Value,Value Unit,Quantity,Start Date,End Date',
      '25% Off Premium,Discount on premium subscription,coupon,25,percentage,100,2025-01-01,2025-12-31',
      '100 Bonus Gems,Free gems reward,credit,100,gems,50,2025-01-01,2025-06-30',
      'Creator Merch Pack,Exclusive merchandise,giveaway,1,item,25,2025-01-01,2025-03-31',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coupon_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header
      
      const imported: BulkCoupon[] = lines
        .filter(line => line.trim())
        .map((line, index) => {
          const [title, description, reward_type, value, value_unit, quantity_total, start_date, end_date] = 
            line.split(',').map(s => s.trim());
          
          return {
            id: `imported-${Date.now()}-${index}`,
            title,
            description,
            reward_type: reward_type as any,
            value: parseFloat(value) || 0,
            value_unit,
            quantity_total: parseInt(quantity_total) || 0,
            start_date,
            end_date,
          };
        });

      setCoupons([...coupons, ...imported]);
      toast({
        title: 'Import Successful',
        description: `Imported ${imported.length} coupon(s) from CSV.`,
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-pr-text-1">Bulk Coupon Creation</h1>
            <p className="text-sm text-pr-text-2 mt-1">
              Create multiple coupons at once or import from CSV
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <label>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={importCSV}
            />
            <Button variant="outline" as="span">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-700">
          {coupons.length} coupon(s) ready to create
        </div>
        <div className="flex space-x-3">
          <Button onClick={addCoupon} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </Button>
          <Button 
            onClick={handleBulkCreate} 
            disabled={creating || coupons.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {creating ? 'Creating...' : `Create ${coupons.length} Coupon(s)`}
          </Button>
        </div>
      </div>

      {/* Coupon List */}
      {coupons.length > 0 ? (
        <div className="space-y-4">
          {coupons.map((coupon, index) => (
            <div key={coupon.id} className="bg-pr-surface-card rounded-lg border border-pr-surface-3 p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-pr-text-1">Coupon #{index + 1}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateCoupon(coupon)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCoupon(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-1">Title *</label>
                  <input
                    type="text"
                    value={coupon.title}
                    onChange={(e) => updateCoupon(coupon.id, 'title', e.target.value)}
                    className="w-full rounded-lg border border-pr-surface-3 px-3 py-2"
                    placeholder="e.g. 25% Off Premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-1">Reward Type</label>
                  <select
                    value={coupon.reward_type}
                    onChange={(e) => updateCoupon(coupon.id, 'reward_type', e.target.value)}
                    className="w-full rounded-lg border border-pr-surface-3 px-3 py-2"
                  >
                    <option value="coupon">Coupon</option>
                    <option value="giveaway">Giveaway</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-pr-text-1 mb-1">Description</label>
                  <textarea
                    value={coupon.description}
                    onChange={(e) => updateCoupon(coupon.id, 'description', e.target.value)}
                    className="w-full rounded-lg border border-pr-surface-3 px-3 py-2"
                    rows={2}
                    placeholder="Describe the reward..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-1">Value *</label>
                  <input
                    type="number"
                    value={coupon.value}
                    onChange={(e) => updateCoupon(coupon.id, 'value', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-pr-surface-3 px-3 py-2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-1">Unit</label>
                  <select
                    value={coupon.value_unit}
                    onChange={(e) => updateCoupon(coupon.id, 'value_unit', e.target.value)}
                    className="w-full rounded-lg border border-pr-surface-3 px-3 py-2"
                  >
                    <option value="percentage">%</option>
                    <option value="usd">USD</option>
                    <option value="gems">Gems</option>
                    <option value="keys">Keys</option>
                    <option value="item">Item</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={coupon.quantity_total}
                    onChange={(e) => updateCoupon(coupon.id, 'quantity_total', parseInt(e.target.value))}
                    className="w-full rounded-lg border border-pr-surface-3 px-3 py-2"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={coupon.start_date}
                    onChange={(e) => updateCoupon(coupon.id, 'start_date', e.target.value)}
                    className="w-full rounded-lg border border-pr-surface-3 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-1">End Date</label>
                  <input
                    type="date"
                    value={coupon.end_date}
                    onChange={(e) => updateCoupon(coupon.id, 'end_date', e.target.value)}
                    className="w-full rounded-lg border border-pr-surface-3 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-pr-surface-card rounded-lg border border-pr-surface-3">
          <Plus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-pr-text-1">No coupons yet</h3>
          <p className="mt-1 text-sm text-pr-text-2">
            Get started by adding a coupon or importing from CSV.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <Button onClick={addCoupon}>
              <Plus className="h-4 w-4 mr-2" />
              Add Coupon
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
