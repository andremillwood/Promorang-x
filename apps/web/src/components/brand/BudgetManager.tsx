import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, AlertCircle, Plus } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface BudgetData {
    hasActiveBudget: boolean;
    totalBudget: number;
    allocatedBudget: number;
    spentBudget: number;
    availableBudget: number;
    remainingBudget: number;
    currency: string;
}

interface BudgetManagerProps {
    organizationId: string;
}

const BudgetManager = ({ organizationId }: BudgetManagerProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [budget, setBudget] = useState<BudgetData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [additionalAmount, setAdditionalAmount] = useState(1000);

    useEffect(() => {
        fetchBudget();
    }, [organizationId]);

    const fetchBudget = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/api/brand/budgets?organizationId=${organizationId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.id}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch budget');

            const { budget: fetchedBudget } = await response.json();
            setBudget(fetchedBudget);
        } catch (error: any) {
            toast({
                title: "Error fetching budget",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBudget = async () => {
        setIsAdding(true);
        try {
            const response = await fetch(`${API_URL}/api/brand/budgets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`,
                },
                body: JSON.stringify({
                    organizationId,
                    totalBudget: additionalAmount,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create budget');
            }

            toast({
                title: "Budget Created!",
                description: `$${additionalAmount} budget has been created.`,
            });

            fetchBudget();
        } catch (error: any) {
            toast({
                title: "Error creating budget",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) {
        return <Skeleton className="h-96 rounded-xl" />;
    }

    if (!budget?.hasActiveBudget) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Create Budget</CardTitle>
                    <CardDescription>
                        Set up your campaign budget to start sponsoring moments
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="initialBudget">Initial Budget (USD)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="initialBudget"
                                type="number"
                                min="100"
                                step="100"
                                value={additionalAmount}
                                onChange={(e) => setAdditionalAmount(parseFloat(e.target.value))}
                                className="pl-10"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Minimum: $100
                        </p>
                    </div>
                    <Button onClick={handleCreateBudget} disabled={isAdding}>
                        {isAdding ? "Creating..." : "Create Budget"}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const allocationPercentage = budget.totalBudget > 0
        ? (budget.allocatedBudget / budget.totalBudget) * 100
        : 0;
    const spendPercentage = budget.allocatedBudget > 0
        ? (budget.spentBudget / budget.allocatedBudget) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Budget</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-foreground">
                            ${budget.totalBudget.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Allocated</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-amber-500">
                            ${budget.allocatedBudget.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {Math.round(allocationPercentage)}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Spent</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-primary">
                            ${budget.spentBudget.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {Math.round(spendPercentage)}% of allocated
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Budget Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Allocation Progress */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Budget Allocation</Label>
                            <span className="text-sm font-medium">
                                ${budget.availableBudget.toLocaleString()} available
                            </span>
                        </div>
                        <Progress value={allocationPercentage} className="h-3" />
                        <p className="text-xs text-muted-foreground mt-1">
                            ${budget.allocatedBudget.toLocaleString()} of ${budget.totalBudget.toLocaleString()} allocated to campaigns
                        </p>
                    </div>

                    {/* Spending Progress */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Campaign Spending</Label>
                            <span className="text-sm font-medium">
                                ${budget.remainingBudget.toLocaleString()} remaining
                            </span>
                        </div>
                        <Progress value={spendPercentage} className="h-3" />
                        <p className="text-xs text-muted-foreground mt-1">
                            ${budget.spentBudget.toLocaleString()} of ${budget.allocatedBudget.toLocaleString()} spent on sponsorships
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Alerts */}
            {budget.availableBudget < 100 && (
                <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardContent className="py-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-700 dark:text-amber-400">
                                Low Budget Alert
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                                You have less than $100 available. Consider increasing your budget to continue sponsoring moments.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {budget.remainingBudget < 50 && budget.allocatedBudget > 0 && (
                <Card className="border-red-500/50 bg-red-500/5">
                    <CardContent className="py-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-700 dark:text-red-400">
                                Campaign Budget Nearly Exhausted
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                                Less than $50 remaining in allocated campaign budgets. Your active campaigns may pause soon.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BudgetManager;
