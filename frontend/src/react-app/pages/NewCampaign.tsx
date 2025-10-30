import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Target, DollarSign, Calendar, Hash, Percent, BarChart2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useMoveCosts } from '@/react-app/hooks/useMoveCosts';
import { cn } from '@/lib/utils';

type CampaignObjective = 'awareness' | 'engagement' | 'conversions' | 'traffic' | 'app_installs' | 'video_views';

export default function NewCampaign() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    objective: 'engagement' as CampaignObjective,
    description: '',
    startDate: new Date(),
    endDate: null as Date | null,
    budget: 1000,
    dailyBudget: 100,
    bidStrategy: 'lowest_cost' as 'lowest_cost' | 'cost_cap' | 'bid_cap',
    bidAmount: 5,
    targetCtr: 2.0,
    targetCpc: 0.5,
    campaignType: 'standard' as 'proof' | 'standard' | 'premium',
    audienceSize: 1000,
    locations: [] as string[],
    interests: [] as string[],
  });

  const { moveBalance, moveCost, loading: calculatingCost, calculateMoveCost } = useMoveCosts();
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [insufficientMoves, setInsufficientMoves] = useState(false);

  // Calculate move cost when form changes
  useEffect(() => {
    const calculateCost = async () => {
      const cost = await calculateMoveCost({
        campaignType: formData.campaignType,
        duration: formData.endDate ? 
          Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 7,
        audienceSize: formData.audienceSize,
        locations: formData.locations,
        interests: formData.interests,
        isPremium: formData.campaignType === 'premium'
      });
      
      if (cost) {
        setCalculatedCost(cost.totalCost);
        setInsufficientMoves(moveBalance < cost.totalCost);
      }
    };

    calculateCost();
  }, [formData, calculateMoveCost, moveBalance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'description' ? value : Number(value)
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (insufficientMoves) {
      alert('You do not have enough moves to create this campaign. Please reduce the scope or purchase more moves.');
      return;
    }
    
    if (!calculatedCost) {
      alert('Calculating move cost. Please wait...');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...formData,
          userId: localStorage.getItem('userId'),
          duration: formData.endDate ? 
            Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 7
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }
      
      const result = await response.json();
      
      // Show success message and navigate
      alert(`Campaign created successfully! ${result.movesSpent} moves deducted from your balance.`);
      navigate('/campaigns');
      
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert(`Failed to create campaign: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const objectives = [
    { value: 'awareness', label: 'Brand Awareness' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'traffic', label: 'Traffic' },
    { value: 'app_installs', label: 'App Installs' },
    { value: 'video_views', label: 'Video Views' },
  ];

  const bidStrategies = [
    { value: 'lowest_cost', label: 'Lowest Cost' },
    { value: 'cost_cap', label: 'Cost Cap' },
    { value: 'bid_cap', label: 'Bid Cap' },
  ];

  const campaignTypes = [
    { value: 'proof', label: 'Proof Drop', description: 'Test with a small audience', cost: '10 moves' },
    { value: 'standard', label: 'Standard Campaign', description: 'Reach a larger audience', cost: '50 moves' },
    { value: 'premium', label: 'Premium Campaign', description: 'Maximum reach and features', cost: '100 moves' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="h-8 w-8" 
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Campaign</h2>
          <p className="text-sm text-gray-500">
            Set up a new marketing campaign to promote your brand
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-8">
          {/* Move Cost Summary */}
          {calculatedCost !== null && (
            <div className={cn(
              "p-4 rounded-lg border",
              insufficientMoves ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap className={cn("h-5 w-5", insufficientMoves ? "text-red-500" : "text-blue-500")} />
                  <div>
                    <p className="font-medium">
                      {insufficientMoves ? 'Not enough moves' : 'Move cost'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {calculatedCost} moves required (you have {moveBalance})
                    </p>
                  </div>
                </div>
                {insufficientMoves ? (
                  <Button variant="outline" size="sm" onClick={() => navigate('/account/billing')}>
                    Get More Moves
                  </Button>
                ) : (
                  <div className="text-sm font-medium text-green-600">
                    Sufficient balance
                  </div>
                )}
              </div>
              
              {moveCost && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Base cost:</div>
                    <div className="text-right">{moveCost.baseCost} moves</div>
                    
                    {moveCost.durationModifier > 0 && (
                      <>
                        <div>Duration ({moveCost.durationModifier.toFixed(1)}x):</div>
                        <div className="text-right">+{Math.round(moveCost.baseCost * moveCost.durationModifier)} moves</div>
                      </>
                    )}
                    
                    {moveCost.audienceModifier > 0 && (
                      <>
                        <div>Audience size ({moveCost.audienceModifier.toFixed(1)}x):</div>
                        <div className="text-right">+{Math.round(moveCost.baseCost * moveCost.audienceModifier)} moves</div>
                      </>
                    )}
                    
                    {moveCost.premiumModifier > 0 && (
                      <>
                        <div>Premium features ({moveCost.premiumModifier.toFixed(1)}x):</div>
                        <div className="text-right">+{Math.round(moveCost.baseCost * moveCost.premiumModifier)} moves</div>
                      </>
                    )}
                    
                    <div className="font-medium">Total cost:</div>
                    <div className="text-right font-medium">{moveCost.totalCost} moves</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Campaign Details</h3>
              <p className="text-sm text-gray-500">Basic information about your campaign</p>
            </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="campaignType" className="block text-sm font-medium text-gray-700">
                    Campaign Type
                  </label>
                  <Select
                    value={formData.campaignType}
                    onValueChange={(value) => handleSelectChange('campaignType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                            <div className="text-sm text-gray-500">{type.cost}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="audienceSize" className="block text-sm font-medium text-gray-700">
                    Target Audience Size
                  </label>
                  <Input
                    type="number"
                    name="audienceSize"
                    id="audienceSize"
                    min="100"
                    step="100"
                    value={formData.audienceSize}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Larger audiences may require more moves
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Campaign Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="objective" className="block text-sm font-medium text-gray-700">
                    Campaign Objective
                  </label>
                  <div className="mt-1">
                    <Select
                      value={formData.objective}
                      onValueChange={(value) => handleSelectChange('objective', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an objective" />
                      </SelectTrigger>
                      <SelectContent>
                        {objectives.map((obj) => (
                          <SelectItem key={obj.value} value={obj.value}>
                            <div className="flex items-center">
                              <Target className="mr-2 h-4 w-4" />
                              {obj.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <div className="mt-1">
                    <Textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Describe the purpose of this campaign..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Schedule & Budget</h3>
                <p className="mt-1 text-sm text-gray-500">
                  When and how much you want to spend
                </p>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <div className="mt-1">
                      <DatePicker
                        selected={formData.startDate}
                        onChange={(date) => handleDateChange('startDate', date)}
                        minDate={new Date()}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      End Date (Optional)
                    </label>
                    <div className="mt-1">
                      <DatePicker
                        selected={formData.endDate}
                        onChange={(date) => handleDateChange('endDate', date)}
                        minDate={formData.startDate}
                        className="w-full"
                        isClearable
                        placeholderText="No end date"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                      Total Budget ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="number"
                        name="budget"
                        id="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        min="1"
                        step="0.01"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="dailyBudget" className="block text-sm font-medium text-gray-700">
                      Daily Budget ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="number"
                        name="dailyBudget"
                        id="dailyBudget"
                        value={formData.dailyBudget}
                        onChange={handleChange}
                        min="1"
                        step="0.01"
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.endDate 
                        ? `~${Math.ceil(formData.budget / formData.dailyBudget)} days of runtime`
                        : 'Will run until budget is spent'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Bidding & Optimization</h3>
                <p className="mt-1 text-sm text-gray-500">
                  How you want to bid and optimize your campaign
                </p>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="bidStrategy" className="block text-sm font-medium text-gray-700">
                      Bid Strategy
                    </label>
                    <div className="mt-1">
                      <Select
                        value={formData.bidStrategy}
                        onValueChange={(value) => handleSelectChange('bidStrategy', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a bid strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          {bidStrategies.map((strategy) => (
                            <SelectItem key={strategy.value} value={strategy.value}>
                              {strategy.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.bidStrategy === 'lowest_cost' && 'Automatically get the most results for your budget'}
                      {formData.bidStrategy === 'cost_cap' && 'Control your average cost per result'}
                      {formData.bidStrategy === 'bid_cap' && 'Set a maximum bid for each result'}
                    </p>
                  </div>

                  {formData.bidStrategy !== 'lowest_cost' && (
                    <div className="sm:col-span-3">
                      <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">
                        {formData.bidStrategy === 'cost_cap' ? 'Cost Cap' : 'Bid Cap'} ($)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="number"
                          name="bidAmount"
                          id="bidAmount"
                          value={formData.bidAmount}
                          onChange={handleChange}
                          min="0.01"
                          step="0.01"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-3">
                    <label htmlFor="targetCtr" className="block text-sm font-medium text-gray-700">
                      Target CTR (%)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Percent className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="number"
                        name="targetCtr"
                        id="targetCtr"
                        value={formData.targetCtr}
                        onChange={handleChange}
                        min="0.1"
                        max="100"
                        step="0.1"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="targetCpc" className="block text-sm font-medium text-gray-700">
                      Target CPC ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="number"
                        name="targetCpc"
                        id="targetCpc"
                        value={formData.targetCpc}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || insufficientMoves}
                className={cn(
                  "relative overflow-hidden",
                  insufficientMoves && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  'Creating...'
                ) : insufficientMoves ? (
                  'Not Enough Moves'
                ) : (
                  <>
                    <span className="relative z-10">Create Campaign ({calculatedCost} moves)</span>
                    <span 
                      className="absolute inset-y-0 left-0 bg-blue-600"
                      style={{ 
                        width: `${Math.min(100, (moveBalance / (calculatedCost || 1)) * 100)}%`,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
    </div>
  );
}
