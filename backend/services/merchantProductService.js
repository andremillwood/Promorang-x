const { supabase } = require('../lib/supabase');
const { generateUniqueCode } = require('../utils/codeGenerator');

/**
 * Merchant Product Service
 * Handles product catalog management, inventory tracking, and redemptions
 */

// ============================================
// PRODUCT CRUD OPERATIONS
// ============================================

/**
 * Create a new merchant product
 * @param {string} merchantId - Merchant user ID
 * @param {object} productData - Product details
 * @returns {Promise<object>} Created product
 */
async function createProduct(merchantId, productData) {
    try {
        const {
            name,
            description,
            category,
            price,
            price_usd,
            points_cost,
            price_points,
            image_url,
            images,
            venue_id,
            organization_id,
            listing_kind,
            fulfillment_mode,
            booking_url,
            service_duration_minutes,
            service_capacity,
            visibility,
            inventory_count,
            inventory_quantity,
            low_stock_threshold,
            redemption_limit_per_user,
            expires_at,
            terms_conditions,
            discount_type,
            discount_value,
        } = productData;

        const normalizedPrice = price ?? price_usd ?? 0;
        const normalizedPointsCost = points_cost ?? price_points ?? null;
        const normalizedInventory = inventory_quantity ?? inventory_count ?? null;
        const normalizedImages = images || (image_url ? [image_url] : []);

        const { data, error } = await supabase
            .from('merchant_products')
            .insert({
                merchant_id: merchantId,
                organization_id,
                name,
                description,
                category,
                price: normalizedPrice,
                price_usd,
                points_cost: normalizedPointsCost,
                price_points,
                image_url,
                images: normalizedImages,
                venue_id,
                inventory_quantity: normalizedInventory,
                inventory_count: normalizedInventory,
                low_stock_threshold: low_stock_threshold || 10,
                redemption_limit_per_user,
                expires_at,
                terms_conditions,
                discount_type,
                discount_value,
                listing_kind: listing_kind || (String(category || '').toLowerCase() === 'service' ? 'service' : 'product'),
                fulfillment_mode: fulfillment_mode || 'pickup',
                booking_url,
                service_duration_minutes,
                service_capacity,
                visibility: visibility || 'public',
                is_active: true,
            })
            .select()
            .single();

        if (error) throw error;

        // Log initial inventory if set
        if (normalizedInventory !== null && normalizedInventory !== undefined) {
            await logInventoryChange(
                data.id,
                'restock',
                normalizedInventory,
                0,
                normalizedInventory,
                'Initial stock',
                merchantId
            );
        }

        return data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw new Error(`Failed to create product: ${error.message}`);
    }
}

/**
 * Get products by merchant
 * @param {string} merchantId - Merchant user ID
 * @param {object} filters - Optional filters (category, is_active)
 * @returns {Promise<array>} List of products
 */
async function getProductsByMerchant(merchantId, filters = {}) {
    try {
        let query = supabase
            .from('merchant_products')
            .select('*')
            .eq('merchant_id', merchantId)
            .order('created_at', { ascending: false });

        if (filters.category) {
            query = query.eq('category', filters.category);
        }

        if (filters.is_active !== undefined) {
            query = query.eq('is_active', filters.is_active);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
    }
}

/**
 * Get single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<object>} Product details
 */
async function getProductById(productId) {
    try {
        const { data, error } = await supabase
            .from('merchant_products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw new Error(`Failed to fetch product: ${error.message}`);
    }
}

/**
 * Update product
 * @param {string} productId - Product ID
 * @param {string} merchantId - Merchant user ID (for authorization)
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated product
 */
async function updateProduct(productId, merchantId, updates) {
    try {
        const normalizedUpdates = { ...updates };

        if (normalizedUpdates.price === undefined && normalizedUpdates.price_usd !== undefined) {
            normalizedUpdates.price = normalizedUpdates.price_usd;
        }

        if (normalizedUpdates.points_cost === undefined && normalizedUpdates.price_points !== undefined) {
            normalizedUpdates.points_cost = normalizedUpdates.price_points;
        }

        if (normalizedUpdates.inventory_quantity === undefined && normalizedUpdates.inventory_count !== undefined) {
            normalizedUpdates.inventory_quantity = normalizedUpdates.inventory_count;
        }

        if (normalizedUpdates.inventory_count === undefined && normalizedUpdates.inventory_quantity !== undefined) {
            normalizedUpdates.inventory_count = normalizedUpdates.inventory_quantity;
        }

        if (normalizedUpdates.images === undefined && normalizedUpdates.image_url) {
            normalizedUpdates.images = [normalizedUpdates.image_url];
        }

        if (!normalizedUpdates.listing_kind && String(normalizedUpdates.category || '').toLowerCase() === 'service') {
            normalizedUpdates.listing_kind = 'service';
        }

        const { data, error } = await supabase
            .from('merchant_products')
            .update(normalizedUpdates)
            .eq('id', productId)
            .eq('merchant_id', merchantId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw new Error(`Failed to update product: ${error.message}`);
    }
}

/**
 * Delete product (soft delete by setting is_active = false)
 * @param {string} productId - Product ID
 * @param {string} merchantId - Merchant user ID (for authorization)
 * @returns {Promise<object>} Deleted product
 */
async function deleteProduct(productId, merchantId) {
    try {
        const { data, error } = await supabase
            .from('merchant_products')
            .update({ is_active: false })
            .eq('id', productId)
            .eq('merchant_id', merchantId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error(`Failed to delete product: ${error.message}`);
    }
}

// ============================================
// INVENTORY MANAGEMENT
// ============================================

/**
 * Update product inventory
 * @param {string} productId - Product ID
 * @param {string} merchantId - Merchant user ID
 * @param {number} newCount - New inventory count
 * @param {string} reason - Reason for change
 * @returns {Promise<object>} Updated product
 */
async function updateInventory(productId, merchantId, newCount, reason = 'Manual adjustment') {
    try {
        // Get current inventory
        const product = await getProductById(productId);

        if (product.merchant_id !== merchantId) {
            throw new Error('Unauthorized: Not your product');
        }

        const previousCount = product.inventory_count ?? product.inventory_quantity ?? 0;
        const change = newCount - previousCount;

        // Update inventory
        const { data, error } = await supabase
            .from('merchant_products')
            .update({
                inventory_count: newCount,
                inventory_quantity: newCount,
            })
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;

        // Log the change
        await logInventoryChange(
            productId,
            change > 0 ? 'restock' : 'adjustment',
            change,
            previousCount,
            newCount,
            reason,
            merchantId
        );

        return data;
    } catch (error) {
        console.error('Error updating inventory:', error);
        throw new Error(`Failed to update inventory: ${error.message}`);
    }
}

/**
 * Log inventory change
 * @param {string} productId - Product ID
 * @param {string} changeType - Type of change
 * @param {number} quantityChange - Amount changed
 * @param {number} previousCount - Previous count
 * @param {number} newCount - New count
 * @param {string} reason - Reason for change
 * @param {string} performedBy - User ID who made the change
 */
async function logInventoryChange(productId, changeType, quantityChange, previousCount, newCount, reason, performedBy) {
    try {
        await supabase
            .from('merchant_inventory_logs')
            .insert({
                product_id: productId,
                change_type: changeType,
                quantity_change: quantityChange,
                previous_count: previousCount,
                new_count: newCount,
                reason,
                performed_by: performedBy,
            });
    } catch (error) {
        console.error('Error logging inventory change:', error);
        // Don't throw - logging failure shouldn't break the main operation
    }
}

/**
 * Get inventory logs for a product
 * @param {string} productId - Product ID
 * @param {number} limit - Max number of logs to return
 * @returns {Promise<array>} Inventory logs
 */
async function getInventoryLogs(productId, limit = 50) {
    try {
        const { data, error } = await supabase
            .from('merchant_inventory_logs')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching inventory logs:', error);
        throw new Error(`Failed to fetch inventory logs: ${error.message}`);
    }
}

/**
 * Get low stock products for a merchant
 * @param {string} merchantId - Merchant user ID
 * @returns {Promise<array>} Products below low stock threshold
 */
async function getLowStockProducts(merchantId) {
    try {
        const { data, error } = await supabase
            .from('merchant_products')
            .select('*')
            .eq('merchant_id', merchantId)
            .eq('is_active', true);

        if (error) throw error;

        return (data || []).filter((product) => {
            const inventory = product.inventory_count ?? product.inventory_quantity;
            if (inventory === null || inventory === undefined) return false;
            return inventory <= (product.low_stock_threshold || 10);
        });
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        throw new Error(`Failed to fetch low stock products: ${error.message}`);
    }
}

// ============================================
// SALES & REDEMPTIONS
// ============================================

/**
 * Create a product sale/redemption
 * @param {string} productId - Product ID
 * @param {string} userId - Buyer user ID
 * @param {object} saleData - Sale details
 * @returns {Promise<object>} Sale record with redemption code
 */
async function createSale(productId, userId, saleData) {
    try {
        const { sale_type, amount_paid, points_paid, metadata = {} } = saleData;

        // Get product details
        const product = await getProductById(productId);

        // Check inventory
        const inventory = product.inventory_count ?? product.inventory_quantity;
        if (inventory !== null && inventory !== undefined && inventory <= 0) {
            throw new Error('Product is out of stock');
        }

        // Check user redemption limit
        if (product.redemption_limit_per_user) {
            const { count } = await supabase
                .from('product_sales')
                .select('*', { count: 'exact', head: true })
                .eq('product_id', productId)
                .eq('user_id', userId)
                .eq('status', 'validated');

            if (count >= product.redemption_limit_per_user) {
                throw new Error('Redemption limit reached for this product');
            }
        }

        // Generate unique redemption code
        const redemptionCode = await generateUniqueCode('product_sales', 'redemption_code');

        // Create sale
        const { data, error } = await supabase
            .from('product_sales')
            .insert({
                product_id: productId,
                user_id: userId,
                merchant_id: product.merchant_id,
                sale_type,
                amount_paid,
                points_paid,
                redemption_code: redemptionCode,
                status: 'pending',
                metadata,
            })
            .select()
            .single();

        if (error) throw error;

        // Inventory is auto-decremented by trigger
        const { data: receipt } = await supabase.from('commerce_receipts').insert({
            user_id: userId,
            merchant_id: product.merchant_id,
            listing_id: productId,
            sale_id: data.id,
            receipt_type: sale_type === 'reservation' ? 'reservation' : 'purchase',
            status: 'issued',
            amount: Number(amount_paid || 0),
            currency: product.currency || 'USD',
            redemption_code: redemptionCode,
            attribution: metadata,
            moment_id: metadata.moment_id || product.linked_moment_id || null,
        }).select().maybeSingle().catch(() => ({ data: null }));
        if (receipt) {
            const commerceOutcomeService = require('./commerceOutcomeService');
            await commerceOutcomeService.processReceipt(receipt).catch((outcomeError) => console.warn('[Merchant Product] Commerce outcomes skipped:', outcomeError.message));
        }

        return data;
    } catch (error) {
        console.error('Error creating sale:', error);
        throw new Error(`Failed to create sale: ${error.message}`);
    }
}

/**
 * Validate a redemption
 * @param {string} redemptionCode - Redemption code
 * @param {string} merchantId - Merchant user ID
 * @returns {Promise<object>} Validated sale
 */
async function validateRedemption(redemptionCode, merchantId) {
    try {
        // Get sale by redemption code
        const { data: sale, error: fetchError } = await supabase
            .from('product_sales')
            .select('*, merchant_products(*)')
            .eq('redemption_code', redemptionCode)
            .single();

        if (fetchError) throw new Error('Invalid redemption code');

        // Verify merchant owns this product
        if (sale.merchant_products.merchant_id !== merchantId) {
            throw new Error('Unauthorized: This redemption is for a different merchant');
        }

        // Check if already validated
        if (sale.status === 'validated') {
            throw new Error('This code has already been redeemed');
        }

        // Check if expired
        if (sale.status === 'expired') {
            throw new Error('This redemption code has expired');
        }

        // Validate the redemption
        const { data, error } = await supabase
            .from('product_sales')
            .update({
                status: 'validated',
                validated_at: new Date().toISOString(),
                validated_by: merchantId,
            })
            .eq('id', sale.id)
            .select('*, merchant_products(*)')
            .single();

        if (error) throw error;

        await supabase
            .from('commerce_receipts')
            .update({
                status: 'fulfilled',
                attribution: {
                    ...(sale.metadata || {}),
                    source: 'merchant_sale_validation',
                    product_sale_id: sale.id,
                    validated_by: merchantId,
                },
            })
            .eq('sale_id', sale.id)
            .eq('merchant_id', merchantId)
            .catch(() => undefined);

        return data;
    } catch (error) {
        console.error('Error validating redemption:', error);
        throw new Error(`Failed to validate redemption: ${error.message}`);
    }
}

/**
 * Get sales for a merchant
 * @param {string} merchantId - Merchant user ID
 * @param {object} filters - Optional filters (status, date range)
 * @returns {Promise<array>} Sales records
 */
async function getSalesByMerchant(merchantId, filters = {}) {
    try {
        let query = supabase
            .from('product_sales')
            .select('*, merchant_products(name, category)')
            .eq('merchant_id', merchantId)
            .order('created_at', { ascending: false });

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate);
        }

        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching sales:', error);
        throw new Error(`Failed to fetch sales: ${error.message}`);
    }
}

module.exports = {
    // Product CRUD
    createProduct,
    getProductsByMerchant,
    getProductById,
    updateProduct,
    deleteProduct,

    // Inventory
    updateInventory,
    getInventoryLogs,
    getLowStockProducts,

    // Sales & Redemptions
    createSale,
    validateRedemption,
    getSalesByMerchant,
};
