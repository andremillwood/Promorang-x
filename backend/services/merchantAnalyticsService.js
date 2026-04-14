const { supabase } = require('../lib/supabase');

/**
 * Merchant Analytics Service
 * Provides sales, product performance, and customer analytics for merchants
 */

/**
 * Get merchant sales summary
 * @param {string} merchantId - Merchant ID
 * @param {object} dateRange - Start and end dates
 * @returns {object} Sales summary
 */
async function getMerchantSalesSummary(merchantId, dateRange = {}) {
    const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = dateRange;

    try {
        const { data, error } = await supabase
            .rpc('get_merchant_sales_summary', {
                p_merchant_id: merchantId,
                p_start_date: startDate.toISOString(),
                p_end_date: endDate.toISOString()
            });

        if (error) throw error;
        return data[0] || {};
    } catch (error) {
        console.error('Error fetching merchant sales summary:', error);
        throw error;
    }
}

/**
 * Get sales analytics by category and date
 * @param {string} merchantId - Merchant ID
 * @param {object} options - Filter options
 * @returns {array} Sales analytics
 */
async function getSalesAnalytics(merchantId, options = {}) {
    const { startDate, endDate, category } = options;

    try {
        let query = supabase
            .from('merchant_sales_analytics')
            .select('*')
            .eq('merchant_id', merchantId)
            .order('sale_date', { ascending: false });

        if (startDate) {
            query = query.gte('sale_date', startDate);
        }

        if (endDate) {
            query = query.lte('sale_date', endDate);
        }

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching sales analytics:', error);
        throw error;
    }
}

/**
 * Get product performance metrics
 * @param {string} merchantId - Merchant ID
 * @returns {array} Product performance data
 */
async function getProductPerformance(merchantId) {
    try {
        const { data, error } = await supabase
            .from('product_performance_analytics')
            .select('*')
            .eq('merchant_id', merchantId)
            .order('total_revenue', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching product performance:', error);
        throw error;
    }
}

/**
 * Get customer segmentation
 * @param {string} merchantId - Merchant ID
 * @returns {array} Customer segments
 */
async function getCustomerSegmentation(merchantId) {
    try {
        const { data, error } = await supabase
            .from('customer_segmentation')
            .select(`
        *,
        product_sales!inner(merchant_products!inner(merchant_id))
      `)
            .eq('product_sales.merchant_products.merchant_id', merchantId);

        if (error) throw error;

        // Group by segment
        const segments = {
            VIP: [],
            Regular: [],
            Occasional: [],
            New: []
        };

        data?.forEach(customer => {
            if (segments[customer.customer_segment]) {
                segments[customer.customer_segment].push(customer);
            }
        });

        return {
            segments,
            summary: {
                vip_count: segments.VIP.length,
                regular_count: segments.Regular.length,
                occasional_count: segments.Occasional.length,
                new_count: segments.New.length,
                total_customers: data?.length || 0
            }
        };
    } catch (error) {
        console.error('Error fetching customer segmentation:', error);
        throw error;
    }
}

/**
 * Get product cross-sell recommendations
 * @param {string} merchantId - Merchant ID
 * @param {number} limit - Number of recommendations
 * @returns {array} Cross-sell recommendations
 */
async function getCrossSellMatrix(merchantId, limit = 10) {
    try {
        const { data, error } = await supabase
            .rpc('get_product_cross_sell_matrix', {
                p_merchant_id: merchantId,
                p_limit: limit
            });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching cross-sell matrix:', error);
        throw error;
    }
}

/**
 * Get redemption analytics
 * @param {string} merchantId - Merchant ID
 * @param {object} dateRange - Start and end dates
 * @returns {array} Redemption analytics
 */
async function getRedemptionAnalytics(merchantId, dateRange = {}) {
    const { startDate, endDate } = dateRange;

    try {
        let query = supabase
            .from('redemption_analytics')
            .select('*')
            .eq('merchant_id', merchantId)
            .order('redemption_date', { ascending: false });

        if (startDate) {
            query = query.gte('redemption_date', startDate);
        }

        if (endDate) {
            query = query.lte('redemption_date', endDate);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching redemption analytics:', error);
        throw error;
    }
}

/**
 * Get low stock products
 * @param {string} merchantId - Merchant ID
 * @returns {array} Low stock products
 */
async function getLowStockProducts(merchantId) {
    try {
        const { data, error } = await supabase
            .from('product_performance_analytics')
            .select('*')
            .eq('merchant_id', merchantId)
            .eq('is_low_stock', true)
            .order('inventory_count', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        throw error;
    }
}

/**
 * Export sales report as CSV data
 * @param {string} merchantId - Merchant ID
 * @param {object} options - Export options
 * @returns {array} CSV data rows
 */
async function exportSalesReport(merchantId, options = {}) {
    const { startDate, endDate } = options;

    try {
        const analytics = await getSalesAnalytics(merchantId, { startDate, endDate });

        // Convert to CSV format
        const csvData = analytics.map(row => ({
            Date: row.sale_date,
            Category: row.category,
            'Total Sales': row.total_sales,
            'Cash Revenue': row.cash_revenue,
            'Points Redeemed': row.points_redeemed,
            'Unique Customers': row.unique_customers,
            'Avg Order Value': row.avg_order_value,
            'Validation Rate': `${(row.validated_sales / row.total_sales * 100).toFixed(2)}%`
        }));

        return csvData;
    } catch (error) {
        console.error('Error exporting sales report:', error);
        throw error;
    }
}

module.exports = {
    getMerchantSalesSummary,
    getSalesAnalytics,
    getProductPerformance,
    getCustomerSegmentation,
    getCrossSellMatrix,
    getRedemptionAnalytics,
    getLowStockProducts,
    exportSalesReport
};
