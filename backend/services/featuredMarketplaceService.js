/**
 * FEATURED MARKETPLACE SERVICE
 * 
 * Manages paid featured placements for:
 * - Content pieces (homepage, category pages)
 * - Moments (sponsor promotions)
 * - PromoShare pools (sponsored pools)
 * 
 * Pricing models:
 * - Fixed daily rates
 * - Auction-based bidding
 * - Performance-based (CPC/CPM)
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const revenueService = require('./revenueService');
const stripeService = require('./stripeService');
const emailService = require('./featuredMarketplaceEmailService');

// Featured placement pricing tiers
const FEATURED_PLACEMENT_PRICING = {
    // Content placements
    homepage_hero: {
        name: 'Homepage Hero Banner',
        description: 'Premium placement at top of homepage',
        pricing_type: 'fixed_daily',
        base_price_per_day: 150, // $150/day
        min_duration_days: 1,
        max_duration_days: 30,
        available_slots: 3,
        priority: 1
    },
    homepage_featured: {
        name: 'Homepage Featured Section',
        description: 'Featured section on homepage below hero',
        pricing_type: 'fixed_daily',
        base_price_per_day: 75, // $75/day
        min_duration_days: 1,
        max_duration_days: 30,
        available_slots: 6,
        priority: 2
    },
    category_featured: {
        name: 'Category Featured',
        description: 'Featured placement within specific category',
        pricing_type: 'fixed_daily',
        base_price_per_day: 50, // $50/day
        min_duration_days: 1,
        max_duration_days: 14,
        available_slots: 4,
        priority: 3
    },
    
    // Moment placements
    moment_featured: {
        name: 'Featured Moment',
        description: 'Prominent placement in Moments discovery',
        pricing_type: 'fixed_daily',
        base_price_per_day: 100, // $100/day
        min_duration_days: 1,
        max_duration_days: 14,
        available_slots: 5,
        priority: 2
    },
    moment_category_boost: {
        name: 'Moment Category Boost',
        description: 'Boost visibility within specific Moment category',
        pricing_type: 'cpc',
        cost_per_click: 0.50, // $0.50 per click
        min_budget: 25,
        max_budget: 500,
        priority: 3
    },
    
    // PromoShare placements
    promoshare_homepage_banner: {
        name: 'PromoShare Homepage Banner',
        description: 'Banner on PromoShare section of homepage',
        pricing_type: 'fixed_daily',
        base_price_per_day: 200, // $200/day
        min_duration_days: 1,
        max_duration_days: 30,
        available_slots: 2,
        priority: 1
    },
    promoshare_sponsored_badge: {
        name: 'PromoShare Sponsored Badge',
        description: 'Premium sponsored badge on pool listing',
        pricing_type: 'one_time',
        base_price: 100, // $100 flat fee
        priority: 2
    },
    promoshare_push_notification: {
        name: 'PromoShare Push Notification',
        description: 'Send push notification to users about pool',
        pricing_type: 'per_send',
        base_price_per_send: 200, // $200 per notification
        min_sends: 1,
        max_sends: 5,
        priority: 1
    }
};

// Volume discounts for bulk purchases
const VOLUME_DISCOUNTS = {
    7: 0.10,   // 10% off for 7+ days
    14: 0.15,  // 15% off for 14+ days
    30: 0.25   // 25% off for 30 days
};

const featuredMarketplaceService = {
    /**
     * Get all available placement types with pricing
     */
    getPlacementTypes() {
        return Object.entries(FEATURED_PLACEMENT_PRICING).map(([key, config]) => ({
            placement_type: key,
            ...config
        }));
    },

    /**
     * Get pricing for a specific placement type
     */
    getPlacementPricing(placementType, options = {}) {
        const config = FEATURED_PLACEMENT_PRICING[placementType];
        if (!config) {
            throw new Error(`Invalid placement type: ${placementType}`);
        }

        const { duration_days = 1, budget = null } = options;
        
        let pricing = {
            placement_type: placementType,
            name: config.name,
            pricing_type: config.pricing_type,
            base_price: 0,
            discount_applied: 0,
            final_price: 0,
            duration_days: config.pricing_type === 'fixed_daily' ? duration_days : null
        };

        // Calculate base price
        switch (config.pricing_type) {
            case 'fixed_daily':
                pricing.base_price = config.base_price_per_day * duration_days;
                
                // Apply volume discount
                for (const [days, discount] of Object.entries(VOLUME_DISCOUNTS).sort((a, b) => b[0] - a[0])) {
                    if (duration_days >= parseInt(days)) {
                        pricing.discount_applied = discount;
                        break;
                    }
                }
                break;
                
            case 'cpc':
                pricing.base_price = budget || config.min_budget;
                pricing.estimated_clicks = Math.floor(pricing.base_price / config.cost_per_click);
                break;
                
            case 'one_time':
                pricing.base_price = config.base_price;
                break;
                
            case 'per_send':
                pricing.base_price = config.base_price_per_send * (options.send_count || 1);
                break;
        }

        // Apply discount
        if (pricing.discount_applied > 0) {
            pricing.discount_amount = pricing.base_price * pricing.discount_applied;
            pricing.final_price = pricing.base_price - pricing.discount_amount;
        } else {
            pricing.final_price = pricing.base_price;
        }

        // Platform fee (15% on featured placements)
        pricing.platform_fee = Number((pricing.final_price * 0.15).toFixed(2));
        pricing.merchant_revenue = pricing.final_price - pricing.platform_fee;

        return pricing;
    },

    /**
     * Create a featured placement booking
     */
    async createBooking(userId, placementType, entityId, entityType, options = {}) {
        if (!supabase) {
            return { success: false, error: 'Database not available' };
        }

        const { duration_days = 1, start_date = new Date(), budget = null } = options;
        
        try {
            // Calculate pricing
            const pricing = this.getPlacementPricing(placementType, { duration_days, budget });
            
            // Validate availability
            const availability = await this.checkAvailability(placementType, start_date, duration_days);
            if (!availability.available) {
                return { success: false, error: 'No slots available for selected dates' };
            }

            // Calculate end date
            const endDate = new Date(start_date);
            endDate.setDate(endDate.getDate() + duration_days);

            // Create booking record
            const { data: booking, error } = await supabase
                .from('featured_placements')
                .insert({
                    user_id: userId,
                    placement_type: placementType,
                    entity_id: entityId,
                    entity_type: entityType,
                    start_date: start_date.toISOString(),
                    end_date: endDate.toISOString(),
                    duration_days: duration_days,
                    total_amount: pricing.final_price,
                    platform_fee: pricing.platform_fee,
                    status: 'pending_payment',
                    pricing_details: pricing,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // Track revenue
            if (revenueService.trackRevenue) {
                await revenueService.trackRevenue(pricing.platform_fee, `featured_${booking.id}`, 'featured_placement');
            }

            // Send booking confirmation email
            if (emailService.sendBookingConfirmation) {
                await emailService.sendBookingConfirmation(userId, booking);
            }

            return {
                success: true,
                booking,
                pricing,
                payment_required: {
                    amount: pricing.final_price,
                    booking_id: booking.id
                }
            };

        } catch (error) {
            console.error('[Featured Marketplace] Error creating booking:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Check availability for a placement type and date range
     */
    async checkAvailability(placementType, startDate, durationDays) {
        if (!supabase) {
            return { available: true, slots: 1 }; // Demo mode
        }

        const config = FEATURED_PLACEMENT_PRICING[placementType];
        if (!config) {
            return { available: false, error: 'Invalid placement type' };
        }

        try {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + durationDays);

            // Count existing bookings that overlap
            const { count, error } = await supabase
                .from('featured_placements')
                .select('*', { count: 'exact', head: true })
                .eq('placement_type', placementType)
                .in('status', ['active', 'pending_payment'])
                .lt('start_date', endDate.toISOString())
                .gt('end_date', startDate.toISOString());

            if (error) throw error;

            const availableSlots = Math.max(0, config.available_slots - (count || 0));
            
            return {
                available: availableSlots > 0,
                slots: availableSlots,
                total_slots: config.available_slots
            };

        } catch (error) {
            console.error('[Featured Marketplace] Error checking availability:', error);
            return { available: false, error: error.message };
        }
    },

    /**
     * Get active featured placements for display
     */
    async getActivePlacements(placementType = null, limit = 10) {
        if (!supabase) {
            return [];
        }

        try {
            let query = supabase
                .from('featured_placements')
                .select(`
                    *,
                    user:user_id (id, username, display_name, profile_image),
                    ${FEATURED_PLACEMENT_PRICING.moment_featured ? 'moment:entity_id (*)' : ''}
                `)
                .eq('status', 'active')
                .lte('start_date', new Date().toISOString())
                .gte('end_date', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(limit);

            if (placementType) {
                query = query.eq('placement_type', placementType);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('[Featured Marketplace] Error getting placements:', error);
            return [];
        }
    },

    /**
     * Get user's booking history
     */
    async getUserBookings(userId, status = null) {
        if (!supabase) {
            return [];
        }

        try {
            let query = supabase
                .from('featured_placements')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('[Featured Marketplace] Error getting user bookings:', error);
            return [];
        }
    },

    /**
     * Record impression for analytics
     */
    async recordImpression(placementId) {
        if (!supabase) return;

        try {
            await supabase
                .from('featured_placement_analytics')
                .upsert({
                    placement_id: placementId,
                    impressions: supabase.rpc('increment', { x: 1 }),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'placement_id' });
        } catch (error) {
            console.error('[Featured Marketplace] Error recording impression:', error);
        }
    },

    /**
     * Record click for CPC placements
     */
    async recordClick(placementId, userId) {
        if (!supabase) return;

        try {
            // Insert click record
            await supabase
                .from('featured_placement_clicks')
                .insert({
                    placement_id: placementId,
                    user_id: userId,
                    clicked_at: new Date().toISOString()
                });

            // Update analytics
            await supabase
                .from('featured_placement_analytics')
                .upsert({
                    placement_id: placementId,
                    clicks: supabase.rpc('increment', { x: 1 }),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'placement_id' });

        } catch (error) {
            console.error('[Featured Marketplace] Error recording click:', error);
        }
    },

    /**
     * Get featured marketplace revenue stats
     */
    async getRevenueStats(startDate, endDate) {
        if (!supabase) {
            return { total_revenue: 0, total_bookings: 0 };
        }

        try {
            const { data, error } = await supabase
                .from('featured_placements')
                .select('total_amount, platform_fee, placement_type')
                .eq('status', 'active')
                .gte('created_at', startDate)
                .lte('created_at', endDate);

            if (error) throw error;

            const stats = {
                total_revenue: 0,
                total_bookings: data?.length || 0,
                platform_fees: 0,
                by_type: {}
            };

            (data || []).forEach(booking => {
                const amount = parseFloat(booking.total_amount) || 0;
                const fee = parseFloat(booking.platform_fee) || 0;
                
                stats.total_revenue += amount;
                stats.platform_fees += fee;

                if (!stats.by_type[booking.placement_type]) {
                    stats.by_type[booking.placement_type] = { revenue: 0, count: 0 };
                }
                stats.by_type[booking.placement_type].revenue += amount;
                stats.by_type[booking.placement_type].count += 1;
            });

            return stats;

        } catch (error) {
            console.error('[Featured Marketplace] Error getting revenue stats:', error);
            return { total_revenue: 0, total_bookings: 0, error: error.message };
        }
    },

    /**
     * Activate a booking after payment confirmation
     */
    async activateBooking(bookingId) {
        if (!supabase) {
            return { success: false, error: 'Database not available' };
        }

        try {
            const { data, error } = await supabase
                .from('featured_placements')
                .update({ 
                    status: 'active',
                    activated_at: new Date().toISOString()
                })
                .eq('id', bookingId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, booking: data };

        } catch (error) {
            console.error('[Featured Marketplace] Error activating booking:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Create Stripe Checkout session for featured placement booking
     */
    async createCheckoutSession(userId, bookingId) {
        if (!supabase) {
            return { success: false, error: 'Database not available' };
        }

        try {
            // Get booking details
            const { data: booking, error: bookingError } = await supabase
                .from('featured_placements')
                .select('*')
                .eq('id', bookingId)
                .eq('user_id', userId)
                .eq('status', 'pending_payment')
                .single();

            if (bookingError || !booking) {
                return { success: false, error: 'Booking not found or already paid' };
            }

            // Get user details
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('email, display_name')
                .eq('id', userId)
                .single();

            if (userError || !user) {
                return { success: false, error: 'User not found' };
            }

            const pricingDetails = booking.pricing_details;
            const placementConfig = FEATURED_PLACEMENT_PRICING[booking.placement_type];

            // Create Stripe checkout session
            const sessionConfig = {
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: placementConfig?.name || 'Featured Placement',
                            description: `Featured ${booking.entity_type} placement for ${booking.duration_days} day(s)`,
                        },
                        unit_amount: Math.round(booking.total_amount * 100), // Convert to cents
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/featured/success?booking_id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/featured/cancel?booking_id=${bookingId}`,
                customer_email: user.email,
                metadata: {
                    booking_id: bookingId,
                    user_id: userId,
                    placement_type: booking.placement_type,
                    entity_type: booking.entity_type,
                    entity_id: booking.entity_id,
                    duration_days: String(booking.duration_days),
                    total_amount: String(booking.total_amount),
                }
            };

            // Use stripeService if available, otherwise use raw Stripe
            let session;
            if (stripeService.createCheckoutSession) {
                session = await stripeService.createCheckoutSession(sessionConfig);
            } else {
                // Fallback to direct Stripe usage
                const Stripe = require('stripe');
                const stripe = process.env.STRIPE_SECRET_KEY 
                    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
                    : null;
                
                if (!stripe) {
                    return { success: false, error: 'Stripe not configured' };
                }
                
                session = await stripe.checkout.sessions.create(sessionConfig);
            }

            // Store checkout session in database
            await supabase
                .from('stripe_checkout_sessions')
                .insert({
                    session_id: session.id,
                    user_id: userId,
                    booking_type: 'featured_placement',
                    booking_id: bookingId,
                    amount: booking.total_amount,
                    status: 'pending',
                    created_at: new Date().toISOString()
                });

            return {
                success: true,
                sessionId: session.id,
                checkoutUrl: session.url,
                bookingId: bookingId
            };

        } catch (error) {
            console.error('[Featured Marketplace] Error creating checkout session:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Handle Stripe webhook for featured placement payment
     */
    async handlePaymentSuccess(sessionId) {
        if (!supabase) {
            return { success: false, error: 'Database not available' };
        }

        try {
            // Get session details from database
            const { data: sessionRecord, error: sessionError } = await supabase
                .from('stripe_checkout_sessions')
                .select('*')
                .eq('session_id', sessionId)
                .single();

            if (sessionError || !sessionRecord) {
                return { success: false, error: 'Session not found' };
            }

            if (sessionRecord.booking_type !== 'featured_placement') {
                return { success: false, error: 'Invalid booking type' };
            }

            // Update booking status
            const { data: booking, error: updateError } = await supabase
                .from('featured_placements')
                .update({
                    status: 'active',
                    payment_method: 'stripe',
                    payment_transaction_id: sessionId,
                    paid_at: new Date().toISOString(),
                    activated_at: new Date().toISOString()
                })
                .eq('id', sessionRecord.booking_id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Update session status
            await supabase
                .from('stripe_checkout_sessions')
                .update({ status: 'completed' })
                .eq('session_id', sessionId);

            // Track revenue
            if (revenueService.trackRevenue) {
                await revenueService.trackRevenue(
                    booking.platform_fee,
                    sessionId,
                    'featured_placement'
                );
            }

            // Send payment receipt email
            if (emailService.sendPaymentReceipt) {
                await emailService.sendPaymentReceipt(sessionRecord.user_id, booking);
            }

            // Send campaign started notification
            if (emailService.sendCampaignStarted) {
                await emailService.sendCampaignStarted(sessionRecord.user_id, booking);
            }

            return {
                success: true,
                booking,
                message: 'Payment processed successfully'
            };

        } catch (error) {
            console.error('[Featured Marketplace] Error handling payment success:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Check payment status for a booking
     */
    async getPaymentStatus(bookingId) {
        if (!supabase) {
            return { success: false, error: 'Database not available' };
        }

        try {
            const { data: booking, error } = await supabase
                .from('featured_placements')
                .select('status, payment_method, paid_at, payment_transaction_id')
                .eq('id', bookingId)
                .single();

            if (error) throw error;

            return {
                success: true,
                status: booking.status,
                isPaid: booking.status === 'active' || booking.status === 'completed',
                paymentMethod: booking.payment_method,
                paidAt: booking.paid_at,
                transactionId: booking.payment_transaction_id
            };

        } catch (error) {
            console.error('[Featured Marketplace] Error getting payment status:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = featuredMarketplaceService;
