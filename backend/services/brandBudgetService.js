const { supabase } = require('../lib/supabase');

/**
 * Brand Budget Service
 * Manages budget creation, allocation, and tracking for brand organizations
 */

/**
 * Create a new budget for a brand organization
 * @param {string} organizationId - Organization ID
 * @param {object} budgetData - Budget details
 * @returns {Promise<object>} Created budget
 */
async function createBudget(organizationId, budgetData) {
    const {
        totalBudget,
        currency = 'USD',
        periodStart,
        periodEnd
    } = budgetData;

    // Check if active budget already exists
    const { data: existing } = await supabase
        .from('brand_budgets')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

    if (existing) {
        throw new Error('An active budget already exists for this organization');
    }

    const { data: budget, error } = await supabase
        .from('brand_budgets')
        .insert({
            organization_id: organizationId,
            total_budget: totalBudget,
            currency,
            period_start: periodStart,
            period_end: periodEnd,
            status: 'active'
        })
        .select()
        .single();

    if (error) throw error;

    return budget;
}

/**
 * Get current active budget for an organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object|null>} Active budget or null
 */
async function getActiveBudget(organizationId) {
    const { data: budget, error } = await supabase
        .from('brand_budgets')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }

    return budget;
}

/**
 * Check available funds for an organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object>} Budget availability info
 */
async function checkAvailableFunds(organizationId) {
    const budget = await getActiveBudget(organizationId);

    if (!budget) {
        return {
            hasActiveBudget: false,
            totalBudget: 0,
            allocatedBudget: 0,
            spentBudget: 0,
            availableBudget: 0,
            remainingBudget: 0
        };
    }

    const availableBudget = budget.total_budget - budget.allocated_budget;
    const remainingBudget = budget.allocated_budget - budget.spent_budget;

    return {
        hasActiveBudget: true,
        totalBudget: parseFloat(budget.total_budget),
        allocatedBudget: parseFloat(budget.allocated_budget),
        spentBudget: parseFloat(budget.spent_budget),
        availableBudget: parseFloat(availableBudget),
        remainingBudget: parseFloat(remainingBudget),
        currency: budget.currency,
        periodStart: budget.period_start,
        periodEnd: budget.period_end
    };
}

/**
 * Allocate funds from budget to a campaign
 * @param {string} budgetId - Budget ID
 * @param {number} amount - Amount to allocate
 * @returns {Promise<object>} Updated budget
 */
async function allocateFunds(budgetId, amount) {
    // Get current budget
    const { data: budget, error: fetchError } = await supabase
        .from('brand_budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

    if (fetchError) throw fetchError;

    // Check if enough budget available
    const availableBudget = budget.total_budget - budget.allocated_budget;
    if (availableBudget < amount) {
        throw new Error(`Insufficient budget. Available: $${availableBudget}, Requested: $${amount}`);
    }

    // Update allocated budget
    const { data: updated, error: updateError } = await supabase
        .from('brand_budgets')
        .update({
            allocated_budget: parseFloat(budget.allocated_budget) + parseFloat(amount)
        })
        .eq('id', budgetId)
        .select()
        .single();

    if (updateError) throw updateError;

    return updated;
}

/**
 * Record spending against a budget
 * @param {string} budgetId - Budget ID
 * @param {number} amount - Amount spent
 * @param {string} description - Spending description
 * @returns {Promise<object>} Updated budget
 */
async function recordSpend(budgetId, amount, description = '') {
    // Get current budget
    const { data: budget, error: fetchError } = await supabase
        .from('brand_budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

    if (fetchError) throw fetchError;

    // Check if spending exceeds allocated budget
    const newSpent = parseFloat(budget.spent_budget) + parseFloat(amount);
    if (newSpent > parseFloat(budget.allocated_budget)) {
        throw new Error(`Spending exceeds allocated budget. Allocated: $${budget.allocated_budget}, Attempting to spend: $${newSpent}`);
    }

    // Update spent budget
    const { data: updated, error: updateError } = await supabase
        .from('brand_budgets')
        .update({
            spent_budget: newSpent
        })
        .eq('id', budgetId)
        .select()
        .single();

    if (updateError) throw updateError;

    return updated;
}

/**
 * Increase total budget
 * @param {string} budgetId - Budget ID
 * @param {number} additionalAmount - Amount to add
 * @returns {Promise<object>} Updated budget
 */
async function increaseBudget(budgetId, additionalAmount) {
    const { data: budget, error: fetchError } = await supabase
        .from('brand_budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

    if (fetchError) throw fetchError;

    const { data: updated, error: updateError } = await supabase
        .from('brand_budgets')
        .update({
            total_budget: parseFloat(budget.total_budget) + parseFloat(additionalAmount)
        })
        .eq('id', budgetId)
        .select()
        .single();

    if (updateError) throw updateError;

    return updated;
}

/**
 * Pause a budget
 * @param {string} budgetId - Budget ID
 * @returns {Promise<object>} Updated budget
 */
async function pauseBudget(budgetId) {
    const { data: updated, error } = await supabase
        .from('brand_budgets')
        .update({ status: 'paused' })
        .eq('id', budgetId)
        .select()
        .single();

    if (error) throw error;

    return updated;
}

/**
 * Reactivate a paused budget
 * @param {string} budgetId - Budget ID
 * @returns {Promise<object>} Updated budget
 */
async function reactivateBudget(budgetId) {
    const { data: updated, error } = await supabase
        .from('brand_budgets')
        .update({ status: 'active' })
        .eq('id', budgetId)
        .select()
        .single();

    if (error) throw error;

    return updated;
}

/**
 * Get budget history for an organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<array>} Budget history
 */
async function getBudgetHistory(organizationId) {
    const { data: budgets, error } = await supabase
        .from('brand_budgets')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return budgets;
}

/**
 * Get budget utilization metrics
 * @param {string} budgetId - Budget ID
 * @returns {Promise<object>} Utilization metrics
 */
async function getBudgetUtilization(budgetId) {
    const { data: budget, error } = await supabase
        .from('brand_budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

    if (error) throw error;

    const totalBudget = parseFloat(budget.total_budget);
    const allocatedBudget = parseFloat(budget.allocated_budget);
    const spentBudget = parseFloat(budget.spent_budget);

    const allocationRate = totalBudget > 0 ? (allocatedBudget / totalBudget) * 100 : 0;
    const spendRate = allocatedBudget > 0 ? (spentBudget / allocatedBudget) * 100 : 0;
    const overallUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

    return {
        totalBudget,
        allocatedBudget,
        spentBudget,
        availableBudget: totalBudget - allocatedBudget,
        remainingBudget: allocatedBudget - spentBudget,
        allocationRate: Math.round(allocationRate * 100) / 100,
        spendRate: Math.round(spendRate * 100) / 100,
        overallUtilization: Math.round(overallUtilization * 100) / 100,
        currency: budget.currency
    };
}

module.exports = {
    createBudget,
    getActiveBudget,
    checkAvailableFunds,
    allocateFunds,
    recordSpend,
    increaseBudget,
    pauseBudget,
    reactivateBudget,
    getBudgetHistory,
    getBudgetUtilization
};
