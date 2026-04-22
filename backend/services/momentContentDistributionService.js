/**
 * MOMENT CONTENT DISTRIBUTION SERVICE
 * 
 * Manages content advertising and distribution during moment interactions:
 * - Pre-check-in sponsor content
 * - Post-check-in sponsored rewards/upsells
 * - In-moment brand messaging
 * - Contextual content recommendations
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Content distribution slots during moment journey
const DISTRIBUTION_SLOTS = {
  PRE_CHECKIN: 'pre_checkin',        // Before user checks in
  POST_CHECKIN: 'post_checkin',      // After successful check-in
  REWARD_CLAIM: 'reward_claim',      // During reward redemption
  MOMENT_JOIN: 'moment_join',        // When user joins moment
  MOMENT_EXIT: 'moment_exit',        // When user leaves moment page
};

const momentContentDistributionService = {
  /**
   * Get sponsored content for a specific moment interaction point
   */
  async getContentForMomentInteraction(momentId, userId, interactionType, options = {}) {
    if (!supabase) return { content: [], sponsorship: null };

    try {
      // 1. Get moment details to understand context
      const { data: moment, error: momentError } = await supabase
        .from('moments')
        .select('*, sponsor_id, advertiser_id, brand_id')
        .eq('id', momentId)
        .single();

      if (momentError) throw momentError;

      // 2. Get active sponsorships for this moment
      const sponsorship = await this.getActiveSponsorship(momentId);

      // 3. Get contextual content based on interaction type
      const content = await this.getContextualContent({
        momentId,
        userId,
        moment,
        sponsorship,
        interactionType,
        ...options
      });

      // 4. Track content distribution
      await this.trackContentDistribution(momentId, userId, interactionType, content);

      return {
        content,
        sponsorship,
        momentContext: {
          name: moment.name,
          category: moment.category,
          location: moment.location,
          sponsor: sponsorship?.sponsor_name || moment.sponsor_name,
        }
      };

    } catch (error) {
      console.error('[Content Distribution] Error:', error);
      return { content: [], sponsorship: null };
    }
  },

  /**
   * Get active sponsorship for a moment
   */
  async getActiveSponsorship(momentId) {
    if (!supabase) return null;

    try {
      // Check for direct moment sponsorship
      const { data, error } = await supabase
        .from('moment_sponsorships')
        .select(`
          *,
          sponsor:sponsor_id (name, logo_url, website, description)
        `)
        .eq('moment_id', momentId)
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      if (data) {
        return {
          id: data.id,
          sponsor_id: data.sponsor_id,
          sponsor_name: data.sponsor?.name,
          sponsor_logo: data.sponsor?.logo_url,
          sponsor_website: data.sponsor?.website,
          sponsor_description: data.sponsor?.description,
          type: data.sponsorship_type,
          budget: data.budget,
          spent: data.spent,
          content_urls: data.content_urls || [],
        };
      }

      return null;
    } catch (error) {
      console.error('[Content Distribution] Error getting sponsorship:', error);
      return null;
    }
  },

  /**
   * Get contextual content based on interaction type and user context
   */
  async getContextualContent({ momentId, userId, moment, sponsorship, interactionType }) {
    const content = [];

    // If there's an active sponsorship, include their content
    if (sponsorship) {
      const sponsorContent = this.formatSponsorContent(sponsorship, interactionType);
      if (sponsorContent) content.push(sponsorContent);
    }

    // Get relevant featured placements for this moment category
    const featuredContent = await this.getFeaturedContentForCategory(
      moment.category,
      interactionType
    );
    content.push(...featuredContent);

    // Get recommended content based on user history
    const recommendedContent = await this.getRecommendedContent(userId, moment);
    content.push(...recommendedContent);

    return content.slice(0, 3); // Max 3 pieces of content
  },

  /**
   * Format sponsor content for display
   */
  formatSponsorContent(sponsorship, interactionType) {
    const templates = {
      [DISTRIBUTION_SLOTS.PRE_CHECKIN]: {
        type: 'sponsor_welcome',
        title: `Welcome from ${sponsorship.sponsor_name}`,
        message: sponsorship.sponsor_description || `Thank you for joining this moment sponsored by ${sponsorship.sponsor_name}.`,
        cta: 'Learn More',
        cta_url: sponsorship.sponsor_website,
        logo_url: sponsorship.sponsor_logo,
        style: 'banner',
      },
      [DISTRIBUTION_SLOTS.POST_CHECKIN]: {
        type: 'sponsor_thanks',
        title: `Thanks for checking in!`,
        message: `${sponsorship.sponsor_name} appreciates your participation.`,
        cta: 'Visit Sponsor',
        cta_url: sponsorship.sponsor_website,
        logo_url: sponsorship.sponsor_logo,
        style: 'card',
      },
      [DISTRIBUTION_SLOTS.REWARD_CLAIM]: {
        type: 'sponsor_bonus',
        title: 'Bonus from Sponsor',
        message: `${sponsorship.sponsor_name} has added a bonus reward!`,
        cta: 'Claim Bonus',
        cta_url: `/rewards?bonus=true&sponsor=${sponsorship.sponsor_id}`,
        logo_url: sponsorship.sponsor_logo,
        style: 'highlight',
      },
      [DISTRIBUTION_SLOTS.MOMENT_JOIN]: {
        type: 'sponsor_announcement',
        title: 'Sponsored Moment',
        message: `This moment is brought to you by ${sponsorship.sponsor_name}.`,
        cta: 'Learn More',
        cta_url: sponsorship.sponsor_website,
        logo_url: sponsorship.sponsor_logo,
        style: 'badge',
      },
    };

    return templates[interactionType] || null;
  },

  /**
   * Get featured content for moment category
   */
  async getFeaturedContentForCategory(category, interactionType) {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('featured_placements')
        .select(`
          *,
          user:user_id (display_name, profile_image)
        `)
        .eq('status', 'active')
        .eq('placement_type', 'category_featured')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .limit(2);

      if (error) throw error;

      return (data || []).map(placement => ({
        type: 'featured',
        title: placement.entity_data?.title || 'Featured Content',
        message: placement.entity_data?.description || '',
        image_url: placement.entity_data?.image_url,
        cta: 'View',
        cta_url: this.getEntityUrl(placement),
        sponsor_name: placement.user?.display_name,
        style: 'card',
      }));
    } catch (error) {
      console.error('[Content Distribution] Error getting featured:', error);
      return [];
    }
  },

  /**
   * Get recommended content based on user history
   */
  async getRecommendedContent(userId, moment) {
    if (!supabase || !userId) return [];

    try {
      // Get user's past moment participation
      const { data: participations, error: partError } = await supabase
        .from('moment_participants')
        .select('moment_id, moment:moment_id(category)')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })
        .limit(5);

      if (partError) throw partError;

      // Get user's content engagement
      const { data: engagements, error: engError } = await supabase
        .from('content_engagements')
        .select('content_id, content:content_id(category, type)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (engError && engError.code !== 'PGRST116') throw engError;

      // Build user preference profile
      const categories = new Set();
      participations?.forEach(p => p.moment?.category && categories.add(p.moment.category));
      engagements?.forEach(e => e.content?.category && categories.add(e.content.category));

      // Add current moment category
      if (moment.category) categories.add(moment.category);

      // Find similar content
      const { data: recommendations, error: recError } = await supabase
        .from('content_pieces')
        .select('*')
        .in('category', Array.from(categories))
        .eq('status', 'published')
        .not('id', 'in', engagements?.map(e => e.content_id) || [])
        .order('engagement_score', { ascending: false })
        .limit(2);

      if (recError) throw recError;

      return (recommendations || []).map(content => ({
        type: 'recommended',
        title: content.title,
        message: content.description?.substring(0, 100) + '...',
        image_url: content.thumbnail_url,
        cta: 'Watch',
        cta_url: `/watch-unlock/${content.id}`,
        style: 'card',
        reason: 'Based on your interests',
      }));
    } catch (error) {
      console.error('[Content Distribution] Error getting recommendations:', error);
      return [];
    }
  },

  /**
   * Track content distribution for analytics
   */
  async trackContentDistribution(momentId, userId, interactionType, content) {
    if (!supabase) return;

    try {
      await supabase
        .from('content_distribution_logs')
        .insert({
          moment_id: momentId,
          user_id: userId,
          interaction_type: interactionType,
          content_count: content.length,
          content_types: content.map(c => c.type),
          distributed_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('[Content Distribution] Error tracking:', error);
    }
  },

  /**
   * Track content interaction (click, view, etc.)
   */
  async trackContentInteraction(contentId, userId, momentId, interactionType, action) {
    if (!supabase) return;

    try {
      await supabase
        .from('content_interaction_logs')
        .insert({
          content_id: contentId,
          user_id: userId,
          moment_id: momentId,
          interaction_type: interactionType,
          action,
          created_at: new Date().toISOString(),
        });

      // If it's a sponsor link click, track conversion
      if (action === 'click' && interactionType.startsWith('sponsor_')) {
        await this.trackSponsorConversion(momentId, userId, contentId);
      }
    } catch (error) {
      console.error('[Content Distribution] Error tracking interaction:', error);
    }
  },

  /**
   * Track sponsor conversion for billing
   */
  async trackSponsorConversion(momentId, userId, sponsorId) {
    if (!supabase) return;

    try {
      // Check if this is a CPC sponsorship
      const { data: sponsorship } = await supabase
        .from('moment_sponsorships')
        .select('id, sponsorship_type, cost_per_click, spent, budget')
        .eq('moment_id', momentId)
        .eq('sponsor_id', sponsorId)
        .eq('sponsorship_type', 'cpc')
        .single();

      if (sponsorship && sponsorship.cost_per_click) {
        // Increment spent amount
        const newSpent = sponsorship.spent + sponsorship.cost_per_click;
        
        await supabase
          .from('moment_sponsorships')
          .update({ 
            spent: newSpent,
            clicks: supabase.rpc('increment', { x: 1 }),
            status: newSpent >= sponsorship.budget ? 'completed' : 'active'
          })
          .eq('id', sponsorship.id);

        // Log conversion
        await supabase
          .from('sponsor_conversions')
          .insert({
            sponsorship_id: sponsorship.id,
            moment_id: momentId,
            user_id: userId,
            amount: sponsorship.cost_per_click,
            conversion_type: 'click',
            created_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('[Content Distribution] Error tracking conversion:', error);
    }
  },

  /**
   * Get sponsor analytics for a moment
   */
  async getSponsorAnalytics(momentId, sponsorId) {
    if (!supabase) return null;

    try {
      // Get distribution stats
      const { data: distributions, error: distError } = await supabase
        .from('content_distribution_logs')
        .select('*')
        .eq('moment_id', momentId)
        .gte('distributed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (distError) throw distError;

      // Get interaction stats
      const { data: interactions, error: intError } = await supabase
        .from('content_interaction_logs')
        .select('*')
        .eq('moment_id', momentId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (intError) throw intError;

      return {
        total_distributions: distributions?.length || 0,
        total_views: interactions?.filter(i => i.action === 'view').length || 0,
        total_clicks: interactions?.filter(i => i.action === 'click').length || 0,
        ctr: interactions?.length > 0
          ? (interactions.filter(i => i.action === 'click').length / interactions.length * 100).toFixed(2)
          : '0.00',
      };
    } catch (error) {
      console.error('[Content Distribution] Error getting analytics:', error);
      return null;
    }
  },

  getEntityUrl(placement) {
    switch (placement.entity_type) {
      case 'content':
        return `/watch-unlock/${placement.entity_id}`;
      case 'moment':
        return `/moments/${placement.entity_id}`;
      case 'promoshare_pool':
        return `/promoshare?pool=${placement.entity_id}`;
      default:
        return '#';
    }
  },
};

module.exports = momentContentDistributionService;
