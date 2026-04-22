/**
 * FEATURED MARKETPLACE EMAIL SERVICE
 * 
 * Automated email notifications for featured marketplace:
 * - Booking confirmations
 * - Payment receipts
 * - Campaign start/end notifications
 * - Daily analytics summaries
 * - Low balance warnings for CPC campaigns
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const emailService = require('./emailService');

const FEATURED_EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: {
    subject: 'Your Featured Placement is Booked! 🎯',
    templateId: 'featured_booking_confirmation',
  },
  PAYMENT_RECEIPT: {
    subject: 'Payment Received - Featured Placement Activated ✅',
    templateId: 'featured_payment_receipt',
  },
  CAMPAIGN_STARTED: {
    subject: 'Your Featured Campaign is Now Live! 🚀',
    templateId: 'featured_campaign_started',
  },
  CAMPAIGN_ENDING_SOON: {
    subject: 'Your Featured Campaign Ends in 24 Hours ⏰',
    templateId: 'featured_campaign_ending',
  },
  CAMPAIGN_COMPLETED: {
    subject: 'Campaign Complete - View Your Results 📊',
    templateId: 'featured_campaign_completed',
  },
  DAILY_ANALYTICS: {
    subject: 'Daily Featured Campaign Report 📈',
    templateId: 'featured_daily_analytics',
  },
  LOW_BALANCE_WARNING: {
    subject: 'Low Balance Warning - Moment Boost Campaign ⚠️',
    templateId: 'featured_low_balance',
  },
  CPC_BUDGET_DEPLETED: {
    subject: 'Moment Boost Budget Depleted 💰',
    templateId: 'featured_cpc_depleted',
  },
};

const featuredMarketplaceEmailService = {
  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(userId, booking) {
    try {
      const user = await this.getUserDetails(userId);
      if (!user?.email) return;

      const pricing = booking.pricing_details;
      
      const templateData = {
        userName: user.display_name || user.username,
        placementType: booking.placement_type,
        placementName: this.getPlacementTypeName(booking.placement_type),
        duration: booking.duration_days,
        startDate: new Date(booking.start_date).toLocaleDateString(),
        endDate: new Date(booking.end_date).toLocaleDateString(),
        totalAmount: booking.total_amount.toFixed(2),
        platformFee: booking.platform_fee.toFixed(2),
        discount: pricing?.discount_applied > 0 ? `${(pricing.discount_applied * 100).toFixed(0)}%` : null,
        bookingId: booking.id,
        entityName: booking.entity_data?.title || 'Your Content',
        checkoutUrl: `${process.env.FRONTEND_URL}/featured/success?booking_id=${booking.id}`,
      };

      await emailService.sendEmail({
        userId,
        emailType: 'featured_booking_confirmation',
        recipientEmail: user.email,
        subject: FEATURED_EMAIL_TEMPLATES.BOOKING_CONFIRMATION.subject,
        templateData,
      });

      console.log(`[Featured Email] Booking confirmation sent to ${user.email}`);
    } catch (error) {
      console.error('[Featured Email] Failed to send booking confirmation:', error);
    }
  },

  /**
   * Send payment receipt and activation email
   */
  async sendPaymentReceipt(userId, booking) {
    try {
      const user = await this.getUserDetails(userId);
      if (!user?.email) return;

      const templateData = {
        userName: user.display_name || user.username,
        placementType: booking.placement_type,
        placementName: this.getPlacementTypeName(booking.placement_type),
        totalAmount: booking.total_amount.toFixed(2),
        transactionId: booking.payment_transaction_id,
        paidAt: new Date(booking.paid_at).toLocaleString(),
        bookingId: booking.id,
        entityName: booking.entity_data?.title || 'Your Content',
        campaignUrl: this.getCampaignUrl(booking),
      };

      await emailService.sendEmail({
        userId,
        emailType: 'featured_payment_receipt',
        recipientEmail: user.email,
        subject: FEATURED_EMAIL_TEMPLATES.PAYMENT_RECEIPT.subject,
        templateData,
      });

      console.log(`[Featured Email] Payment receipt sent to ${user.email}`);
    } catch (error) {
      console.error('[Featured Email] Failed to send payment receipt:', error);
    }
  },

  /**
   * Send campaign started notification
   */
  async sendCampaignStarted(userId, booking) {
    try {
      const user = await this.getUserDetails(userId);
      if (!user?.email) return;

      const templateData = {
        userName: user.display_name || user.username,
        placementName: this.getPlacementTypeName(booking.placement_type),
        entityName: booking.entity_data?.title || 'Your Content',
        startDate: new Date(booking.start_date).toLocaleDateString(),
        endDate: new Date(booking.end_date).toLocaleDateString(),
        duration: booking.duration_days,
        campaignUrl: this.getCampaignUrl(booking),
        bookingId: booking.id,
      };

      await emailService.sendEmail({
        userId,
        emailType: 'featured_campaign_started',
        recipientEmail: user.email,
        subject: FEATURED_EMAIL_TEMPLATES.CAMPAIGN_STARTED.subject,
        templateData,
      });

      console.log(`[Featured Email] Campaign started notification sent to ${user.email}`);
    } catch (error) {
      console.error('[Featured Email] Failed to send campaign started:', error);
    }
  },

  /**
   * Send 24-hour ending soon reminder
   */
  async sendCampaignEndingSoon(userId, booking) {
    try {
      const user = await this.getUserDetails(userId);
      if (!user?.email) return;

      // Get current analytics
      const analytics = await this.getBookingAnalytics(booking.id);

      const templateData = {
        userName: user.display_name || user.username,
        placementName: this.getPlacementTypeName(booking.placement_type),
        entityName: booking.entity_data?.title || 'Your Content',
        endDate: new Date(booking.end_date).toLocaleDateString(),
        endTime: new Date(booking.end_date).toLocaleTimeString(),
        impressions: analytics?.impressions || 0,
        clicks: analytics?.clicks || 0,
        ctr: analytics?.ctr ? `${(analytics.ctr * 100).toFixed(2)}%` : '0%',
        renewUrl: `${process.env.FRONTEND_URL}/featured?entity_type=${booking.entity_type}&entity_id=${booking.entity_id}`,
      };

      await emailService.sendEmail({
        userId,
        emailType: 'featured_campaign_ending',
        recipientEmail: user.email,
        subject: FEATURED_EMAIL_TEMPLATES.CAMPAIGN_ENDING_SOON.subject,
        templateData,
      });

      console.log(`[Featured Email] Campaign ending soon sent to ${user.email}`);
    } catch (error) {
      console.error('[Featured Email] Failed to send ending soon:', error);
    }
  },

  /**
   * Send campaign completion summary
   */
  async sendCampaignCompleted(userId, booking) {
    try {
      const user = await this.getUserDetails(userId);
      if (!user?.email) return;

      // Get final analytics
      const analytics = await this.getBookingAnalytics(booking.id);

      const templateData = {
        userName: user.display_name || user.username,
        placementName: this.getPlacementTypeName(booking.placement_type),
        entityName: booking.entity_data?.title || 'Your Content',
        startDate: new Date(booking.start_date).toLocaleDateString(),
        endDate: new Date(booking.end_date).toLocaleDateString(),
        duration: booking.duration_days,
        totalImpressions: analytics?.impressions || 0,
        totalClicks: analytics?.clicks || 0,
        ctr: analytics?.ctr ? `${(analytics.ctr * 100).toFixed(2)}%` : '0%',
        costPerImpression: analytics?.impressions > 0 
          ? (booking.total_amount / analytics.impressions).toFixed(4)
          : '0.00',
        costPerClick: analytics?.clicks > 0
          ? (booking.total_amount / analytics.clicks).toFixed(2)
          : '0.00',
        totalSpent: booking.total_amount.toFixed(2),
        renewUrl: `${process.env.FRONTEND_URL}/featured?entity_type=${booking.entity_type}&entity_id=${booking.entity_id}`,
      };

      await emailService.sendEmail({
        userId,
        emailType: 'featured_campaign_completed',
        recipientEmail: user.email,
        subject: FEATURED_EMAIL_TEMPLATES.CAMPAIGN_COMPLETED.subject,
        templateData,
      });

      console.log(`[Featured Email] Campaign completed summary sent to ${user.email}`);
    } catch (error) {
      console.error('[Featured Email] Failed to send campaign completed:', error);
    }
  },

  /**
   * Send daily analytics report
   */
  async sendDailyAnalytics(userId, booking, analytics) {
    try {
      const user = await this.getUserDetails(userId);
      if (!user?.email) return;

      const templateData = {
        userName: user.display_name || user.username,
        placementName: this.getPlacementTypeName(booking.placement_type),
        entityName: booking.entity_data?.title || 'Your Content',
        reportDate: new Date().toLocaleDateString(),
        daysRemaining: Math.ceil((new Date(booking.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        todayImpressions: analytics.daily_impressions || 0,
        todayClicks: analytics.daily_clicks || 0,
        totalImpressions: analytics.impressions || 0,
        totalClicks: analytics.clicks || 0,
        ctr: analytics.ctr ? `${(analytics.ctr * 100).toFixed(2)}%` : '0%',
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/analytics`,
      };

      await emailService.sendEmail({
        userId,
        emailType: 'featured_daily_analytics',
        recipientEmail: user.email,
        subject: FEATURED_EMAIL_TEMPLATES.DAILY_ANALYTICS.subject,
        templateData,
      });

      console.log(`[Featured Email] Daily analytics sent to ${user.email}`);
    } catch (error) {
      console.error('[Featured Email] Failed to send daily analytics:', error);
    }
  },

  /**
   * Send low balance warning for CPC campaigns
   */
  async sendLowBalanceWarning(userId, booking, remainingBudget) {
    try {
      const user = await this.getUserDetails(userId);
      if (!user?.email) return;

      const templateData = {
        userName: user.display_name || user.username,
        placementName: this.getPlacementTypeName(booking.placement_type),
        entityName: booking.entity_data?.title || 'Your Content',
        remainingBudget: remainingBudget.toFixed(2),
        estimatedClicksRemaining: Math.floor(remainingBudget / 0.50),
        addFundsUrl: `${process.env.FRONTEND_URL}/featured?booking_id=${booking.id}&action=add-funds`,
      };

      await emailService.sendEmail({
        userId,
        emailType: 'featured_low_balance',
        recipientEmail: user.email,
        subject: FEATURED_EMAIL_TEMPLATES.LOW_BALANCE_WARNING.subject,
        templateData,
      });

      console.log(`[Featured Email] Low balance warning sent to ${user.email}`);
    } catch (error) {
      console.error('[Featured Email] Failed to send low balance warning:', error);
    }
  },

  /**
   * Send CPC budget depleted notification
   */
  async sendBudgetDepleted(userId, booking, finalAnalytics) {
    try {
      const user = await this.getUserDetails(userId);
      if (!user?.email) return;

      const templateData = {
        userName: user.display_name || user.username,
        placementName: this.getPlacementTypeName(booking.placement_type),
        entityName: booking.entity_data?.title || 'Your Content',
        totalBudget: booking.total_amount.toFixed(2),
        totalImpressions: finalAnalytics?.impressions || 0,
        totalClicks: finalAnalytics?.clicks || 0,
        ctr: finalAnalytics?.ctr ? `${(finalAnalytics.ctr * 100).toFixed(2)}%` : '0%',
        costPerClick: finalAnalytics?.clicks > 0
          ? (booking.total_amount / finalAnalytics.clicks).toFixed(2)
          : '0.00',
        renewUrl: `${process.env.FRONTEND_URL}/featured?entity_type=${booking.entity_type}&entity_id=${booking.entity_id}`,
      };

      await emailService.sendEmail({
        userId,
        emailType: 'featured_cpc_depleted',
        recipientEmail: user.email,
        subject: FEATURED_EMAIL_TEMPLATES.CPC_BUDGET_DEPLETED.subject,
        templateData,
      });

      console.log(`[Featured Email] Budget depleted notification sent to ${user.email}`);
    } catch (error) {
      console.error('[Featured Email] Failed to send budget depleted:', error);
    }
  },

  // Helper functions
  async getUserDetails(userId) {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email, username, display_name')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  },

  async getBookingAnalytics(placementId) {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('featured_placement_analytics')
        .select('*')
        .eq('placement_id', placementId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data || { impressions: 0, clicks: 0, ctr: 0 };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { impressions: 0, clicks: 0, ctr: 0 };
    }
  },

  getPlacementTypeName(type) {
    const names = {
      homepage_hero: 'Homepage Hero Banner',
      homepage_featured: 'Homepage Featured Section',
      category_featured: 'Category Featured',
      moment_featured: 'Featured Moment',
      moment_category_boost: 'Moment Boost (CPC)',
      promoshare_homepage_banner: 'PromoShare Homepage Banner',
      promoshare_sponsored_badge: 'Sponsored Badge',
      promoshare_push_notification: 'Push Notification',
    };
    return names[type] || type;
  },

  getCampaignUrl(booking) {
    switch (booking.entity_type) {
      case 'moment':
        return `${process.env.FRONTEND_URL}/moments/${booking.entity_id}`;
      case 'promoshare_pool':
        return `${process.env.FRONTEND_URL}/promoshare?pool=${booking.entity_id}`;
      case 'content':
        return `${process.env.FRONTEND_URL}/watch-unlock/${booking.entity_id}`;
      default:
        return process.env.FRONTEND_URL;
    }
  },
};

module.exports = featuredMarketplaceEmailService;
