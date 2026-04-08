const { supabase } = require('../lib/supabase');

/**
 * Merchant Sales Service
 * Handles sales analytics, reporting, and insights for merchants
 */

// ============================================
// SALES ANALYTICS
// ============================================

/**
 * Get sales summary for a merchant
 * @param {string} merchantId - Merchant user ID
 * @param {object} dateRange - Optional date range {startDate, endDate}
 * @returns {Promise<object>} Sales summary
 */
async function getSalesSummary(merchantId, dateRange = {}) {
    try {
        let query = supabase
            .from('product_sales')
            .select('*')
            .eq('merchant_id', merchantId);

        if (dateRange.startDate) {
            query = query.gte('created_at', dateRange.startDate);
        }

        if (dateRange.endDate) {
            query = query.lte('created_at', dateRange.endDate);
        }

        const { data: sales, error } = await query;

        if (error) throw error;

        // Calculate summary metrics
        const summary = {
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + (parseFloat(sale.amount_paid) || 0), 0),
            totalPointsRedeemed: sales.reduce((sum, sale) => sum + (sale.points_paid || 0), 0),
            validatedRedemptions: sales.filter(s => s.status === 'validated').length,
            pendingRedemptions: sales.filter(s => s.status === 'pending').length,
            expiredRedemptions: sales.filter(s => s.status === 'expired').length,
            salesByType: {
                cash: sales.filter(s => s.sale_type === 'cash').length,
                points: sales.filter(s => s.sale_type === 'points').length,
                redemption: sales.filter(s => s.sale_type === 'redemption').length,
            },
        };

        return summary;
    } catch (error) {
        console.error('Error getting sales summary:', error);
        throw new Error(`Failed to get sales summary: ${error.message}`);
    }
}

/**
 * Get top selling products for a merchant
 * @param {string} merchantId - Merchant user ID
 * @param {number} limit - Number of products to return
 * @param {object} dateRange - Optional date range
 * @returns {Promise<array>} Top products with sales count
 */
async function getTopProducts(merchantId, limit = 10, dateRange = {}) {
    try {
        let query = supabase
            .from('product_sales')
            .select('product_id, merchant_products(name, category, image_url)')
            .eq('merchant_id', merchantId);

        if (dateRange.startDate) {
            query = query.gte('created_at', dateRange.startDate);
        }

        if (dateRange.endDate) {
            query = query.lte('created_at', dateRange.endDate);
        }

        const { data: sales, error } = await query;

        if (error) throw error;

        // Group by product and count
        const productSales = {};
        sales.forEach(sale => {
            const productId = sale.product_id;
            if (!productSales[productId]) {
                productSales[productId] = {
                    productId,
                    name: sale.merchant_products?.name || 'Unknown',
                    category: sale.merchant_products?.category || 'Uncategorized',
                    image_url: sale.merchant_products?.image_url,
                    salesCount: 0,
                };
            }
            productSales[productId].salesCount++;
        });

        // Sort by sales count and return top N
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.salesCount - a.salesCount)
            .slice(0, limit);

        return topProducts;
    } catch (error) {
        console.error('Error getting top products:', error);
        throw new Error(`Failed to get top products: ${error.message}`);
    }
}

/**
 * Get sales over time (for charts)
 * @param {string} merchantId - Merchant user ID
 * @param {string} groupBy - Time grouping (day, week, month)
 * @param {object} dateRange - Date range
 * @returns {Promise<array>} Sales data grouped by time period
 */
async function getSalesOverTime(merchantId, groupBy = 'day', dateRange = {}) {
    try {
        const { startDate, endDate } = dateRange;

        // Default to last 30 days if no range provided
        const end = endDate || new Date().toISOString();
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const { data: sales, error } = await supabase
            .from('product_sales')
            .select('created_at, amount_paid, points_paid')
            .eq('merchant_id', merchantId)
            .gte('created_at', start)
            .lte('created_at', end)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group sales by time period
        const grouped = {};
        sales.forEach(sale => {
            const date = new Date(sale.created_at);
            let key;

            if (groupBy === 'day') {
                key = date.toISOString().split('T')[0];
            } else if (groupBy === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else if (groupBy === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!grouped[key]) {
                grouped[key] = {
                    period: key,
                    salesCount: 0,
                    revenue: 0,
                    pointsRedeemed: 0,
                };
            }

            grouped[key].salesCount++;
            grouped[key].revenue += parseFloat(sale.amount_paid) || 0;
            grouped[key].pointsRedeemed += sale.points_paid || 0;
        });

        return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    } catch (error) {
        console.error('Error getting sales over time:', error);
        throw new Error(`Failed to get sales over time: ${error.message}`);
    }
}

/**
 * Get customer insights
 * @param {string} merchantId - Merchant user ID
 * @param {object} dateRange - Optional date range
 * @returns {Promise<object>} Customer insights
 */
async function getCustomerInsights(merchantId, dateRange = {}) {
    try {
        let query = supabase
            .from('product_sales')
            .select('user_id')
            .eq('merchant_id', merchantId);

        if (dateRange.startDate) {
            query = query.gte('created_at', dateRange.startDate);
        }

        if (dateRange.endDate) {
            query = query.lte('created_at', dateRange.endDate);
        }

        const { data: sales, error } = await query;

        if (error) throw error;

        // Calculate customer metrics
        const uniqueCustomers = new Set(sales.map(s => s.user_id)).size;
        const totalPurchases = sales.length;
        const avgPurchasesPerCustomer = uniqueCustomers > 0 ? totalPurchases / uniqueCustomers : 0;

        // Find repeat customers
        const customerPurchases = {};
        sales.forEach(sale => {
            customerPurchases[sale.user_id] = (customerPurchases[sale.user_id] || 0) + 1;
        });

        const repeatCustomers = Object.values(customerPurchases).filter(count => count > 1).length;
        const repeatCustomerRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

        return {
            uniqueCustomers,
            totalPurchases,
            avgPurchasesPerCustomer: Math.round(avgPurchasesPerCustomer * 10) / 10,
            repeatCustomers,
            repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10,
        };
    } catch (error) {
        console.error('Error getting customer insights:', error);
        throw new Error(`Failed to get customer insights: ${error.message}`);
    }
}

/**
 * Get redemption analytics
 * @param {string} merchantId - Merchant user ID
 * @param {object} dateRange - Optional date range
 * @returns {Promise<object>} Redemption analytics
 */
async function getRedemptionAnalytics(merchantId, dateRange = {}) {
    try {
        let query = supabase
            .from('product_sales')
            .select('*')
            .eq('merchant_id', merchantId)
            .not('redemption_code', 'is', null);

        if (dateRange.startDate) {
            query = query.gte('created_at', dateRange.startDate);
        }

        if (dateRange.endDate) {
            query = query.lte('created_at', dateRange.endDate);
        }

        const { data: redemptions, error } = await query;

        if (error) throw error;

        const total = redemptions.length;
        const validated = redemptions.filter(r => r.status === 'validated').length;
        const pending = redemptions.filter(r => r.status === 'pending').length;
        const expired = redemptions.filter(r => r.status === 'expired').length;

        // Calculate average time to redemption
        const validatedRedemptions = redemptions.filter(r => r.validated_at);
        let avgTimeToRedemption = 0;

        if (validatedRedemptions.length > 0) {
            const totalTime = validatedRedemptions.reduce((sum, r) => {
                const created = new Date(r.created_at);
                const validated = new Date(r.validated_at);
                return sum + (validated - created);
            }, 0);
            avgTimeToRedemption = totalTime / validatedRedemptions.length / (1000 * 60 * 60); // Convert to hours
        }

        return {
            total,
            validated,
            pending,
            expired,
            validationRate: total > 0 ? Math.round((validated / total) * 100 * 10) / 10 : 0,
            avgTimeToRedemptionHours: Math.round(avgTimeToRedemption * 10) / 10,
        };
    } catch (error) {
        console.error('Error getting redemption analytics:', error);
        throw new Error(`Failed to get redemption analytics: ${error.message}`);
    }
}

module.exports = {
    getSalesSummary,
    getTopProducts,
    getSalesOverTime,
    getCustomerInsights,
    getRedemptionAnalytics,
};
