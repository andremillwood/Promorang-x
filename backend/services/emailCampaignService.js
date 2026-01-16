/**
 * PROMORANG EMAIL CAMPAIGN SERVICE
 * Proactive email campaigns for growth hacking, onboarding, and re-engagement
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const resendService = require('./resendService');

// =============================================================================
// CAMPAIGN DEFINITIONS
// =============================================================================

const ONBOARDING_SEQUENCES = {
    creator: {
        name: 'Creator Onboarding',
        steps: [
            { day: 0, emailType: 'welcome', sent: true }, // Already sent at registration
            { day: 1, emailType: 'onboarding_drops_tutorial' },
            { day: 2, emailType: 'onboarding_first_gems' },
            { day: 3, emailType: 'onboarding_streak_system' },
            { day: 4, emailType: 'onboarding_referral_intro' },
            { day: 5, emailType: 'onboarding_success_stories' },
            { day: 7, emailType: 'onboarding_winback' },
        ],
    },
    advertiser: {
        name: 'Advertiser Onboarding',
        steps: [
            { day: 0, emailType: 'welcome', sent: true },
            { day: 1, emailType: 'advertiser_first_drop' },
            { day: 2, emailType: 'advertiser_moves_pricing' },
            { day: 3, emailType: 'advertiser_best_practices' },
            { day: 5, emailType: 'advertiser_roi_guide' },
            { day: 7, emailType: 'advertiser_support_offer' },
        ],
    },
    merchant: {
        name: 'Merchant Onboarding',
        steps: [
            { day: 0, emailType: 'welcome', sent: true },
            { day: 1, emailType: 'merchant_product_tips' },
            { day: 3, emailType: 'merchant_gems_promo' },
            { day: 5, emailType: 'merchant_external_stores' },
            { day: 7, emailType: 'merchant_first_promo' },
        ],
    },
};

const RE_ENGAGEMENT_TRIGGERS = {
    inactive_3_days: { days: 3, emailType: 'reengagement_soft_reminder' },
    inactive_7_days: { days: 7, emailType: 'reengagement_fomo' },
    inactive_14_days: { days: 14, emailType: 'reengagement_incentive' },
    inactive_30_days: { days: 30, emailType: 'reengagement_survey' },
};

// =============================================================================
// ONBOARDING SEQUENCE MANAGEMENT
// =============================================================================

/**
 * Start onboarding sequence for a new user
 */
async function startOnboardingSequence(userId, userType = 'creator') {
    if (!supabase) return { success: true, mock: true };

    const sequence = ONBOARDING_SEQUENCES[userType] || ONBOARDING_SEQUENCES.creator;

    try {
        // Check if already started
        const { data: existing } = await supabase
            .from('email_campaign_state')
            .select('id')
            .eq('user_id', userId)
            .eq('sequence_name', `${userType}_onboarding`)
            .single();

        if (existing) {
            return { success: false, message: 'Sequence already started' };
        }

        // Create campaign state
        const { error } = await supabase
            .from('email_campaign_state')
            .insert({
                user_id: userId,
                sequence_name: `${userType}_onboarding`,
                current_step: 1, // Step 0 (welcome) already sent at registration
                last_email_sent_at: new Date().toISOString(),
            });

        if (error) throw error;

        console.log(`[Email Campaign] Started ${userType} onboarding for user ${userId}`);
        return { success: true, sequence: sequence.name };
    } catch (error) {
        console.error('[Email Campaign] Error starting sequence:', error);
        return { success: false, error };
    }
}

/**
 * Process pending onboarding emails for all users
 * Called by scheduled job
 */
async function processOnboardingEmails() {
    if (!supabase) return { processed: 0 };

    try {
        // Get all active onboarding sequences
        const { data: activeSequences, error } = await supabase
            .from('email_campaign_state')
            .select(`
        id,
        user_id,
        sequence_name,
        current_step,
        last_email_sent_at,
        created_at,
        users!email_campaign_state_user_id_fkey(email, display_name, username, user_type, last_activity_date)
      `)
            .is('completed_at', null);

        if (error) throw error;

        let processed = 0;

        for (const state of activeSequences || []) {
            const userType = state.sequence_name.replace('_onboarding', '');
            const sequence = ONBOARDING_SEQUENCES[userType];

            if (!sequence) continue;

            // Calculate days since signup
            const daysSinceSignup = Math.floor(
                (Date.now() - new Date(state.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            // Find the next email to send
            const currentStep = sequence.steps[state.current_step];

            if (!currentStep) {
                // Sequence complete
                await supabase
                    .from('email_campaign_state')
                    .update({ completed_at: new Date().toISOString() })
                    .eq('id', state.id);
                continue;
            }

            // Check if it's time to send this email
            if (daysSinceSignup >= currentStep.day) {
                const user = state.users;
                if (user?.email) {
                    // Check if user has been active (skip re-engagement if active)
                    const isActive = user.last_activity_date &&
                        (Date.now() - new Date(user.last_activity_date).getTime()) < 24 * 60 * 60 * 1000;

                    // Skip winback email if user is active
                    if (currentStep.emailType.includes('winback') && isActive) {
                        await supabase
                            .from('email_campaign_state')
                            .update({
                                current_step: state.current_step + 1,
                                last_email_sent_at: new Date().toISOString(),
                            })
                            .eq('id', state.id);
                        continue;
                    }

                    // Send the email
                    const result = await sendOnboardingEmail(
                        user.email,
                        user.display_name || user.username,
                        currentStep.emailType,
                        { userType, daysSinceSignup }
                    );

                    if (result.success) {
                        // Update state
                        await supabase
                            .from('email_campaign_state')
                            .update({
                                current_step: state.current_step + 1,
                                last_email_sent_at: new Date().toISOString(),
                            })
                            .eq('id', state.id);

                        // Log email event
                        await logEmailEvent(state.user_id, currentStep.emailType, 'sent');
                        processed++;
                    }
                }
            }
        }

        console.log(`[Email Campaign] Processed ${processed} onboarding emails`);
        return { processed };
    } catch (error) {
        console.error('[Email Campaign] Error processing onboarding:', error);
        return { processed: 0, error };
    }
}

// =============================================================================
// RE-ENGAGEMENT CAMPAIGNS
// =============================================================================

/**
 * Check for inactive users and send re-engagement emails
 */
async function processReEngagementEmails() {
    if (!supabase) return { processed: 0 };

    try {
        let processed = 0;

        for (const [triggerKey, trigger] of Object.entries(RE_ENGAGEMENT_TRIGGERS)) {
            // Find users inactive for exactly this many days (to avoid duplicate sends)
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - trigger.days);
            const targetDateStr = targetDate.toISOString().split('T')[0];

            const { data: inactiveUsers, error } = await supabase
                .from('users')
                .select('id, email, display_name, username')
                .eq('last_activity_date', targetDateStr)
                .not('email', 'is', null);

            if (error) throw error;

            for (const user of inactiveUsers || []) {
                // Check if we already sent this re-engagement email
                const { data: alreadySent } = await supabase
                    .from('email_events')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('email_type', trigger.emailType)
                    .single();

                if (alreadySent) continue;

                // Send re-engagement email
                const result = await sendReEngagementEmail(
                    user.email,
                    user.display_name || user.username,
                    trigger.emailType,
                    { inactiveDays: trigger.days }
                );

                if (result.success) {
                    await logEmailEvent(user.id, trigger.emailType, 'sent');
                    processed++;
                }
            }
        }

        console.log(`[Email Campaign] Processed ${processed} re-engagement emails`);
        return { processed };
    } catch (error) {
        console.error('[Email Campaign] Error processing re-engagement:', error);
        return { processed: 0, error };
    }
}

/**
 * Send streak warning email (before streak breaks)
 */
async function sendStreakWarning(userId) {
    if (!supabase) return { success: true };

    try {
        const { data: user } = await supabase
            .from('users')
            .select('email, display_name, username')
            .eq('id', userId)
            .single();

        const { data: streak } = await supabase
            .from('user_streaks')
            .select('current_streak')
            .eq('user_id', userId)
            .single();

        if (!user?.email || !streak?.current_streak) return { success: false };

        // Only warn if streak is substantial (3+ days)
        if (streak.current_streak < 3) return { success: false, reason: 'Streak too short' };

        const result = await sendStreakWarningEmail(
            user.email,
            user.display_name || user.username,
            streak.current_streak
        );

        if (result.success) {
            await logEmailEvent(userId, 'streak_warning', 'sent');
        }

        return result;
    } catch (error) {
        console.error('[Email Campaign] Error sending streak warning:', error);
        return { success: false, error };
    }
}

// =============================================================================
// EMAIL SENDING FUNCTIONS
// =============================================================================

/**
 * Send onboarding email based on type
 */
async function sendOnboardingEmail(email, userName, emailType, context) {
    const emailConfig = getOnboardingEmailConfig(emailType, userName, context);

    if (!emailConfig) {
        console.error(`[Email Campaign] Unknown email type: ${emailType}`);
        return { success: false, error: 'Unknown email type' };
    }

    return resendService.sendEmail({
        to: email,
        subject: emailConfig.subject,
        html: resendService.getBaseTemplate(emailConfig),
        text: emailConfig.textContent,
        tags: [{ name: 'type', value: emailType }, { name: 'campaign', value: 'onboarding' }],
    });
}

/**
 * Send re-engagement email based on type
 */
async function sendReEngagementEmail(email, userName, emailType, context) {
    const emailConfig = getReEngagementEmailConfig(emailType, userName, context);

    if (!emailConfig) {
        console.error(`[Email Campaign] Unknown email type: ${emailType}`);
        return { success: false, error: 'Unknown email type' };
    }

    return resendService.sendEmail({
        to: email,
        subject: emailConfig.subject,
        html: resendService.getBaseTemplate(emailConfig),
        text: emailConfig.textContent,
        tags: [{ name: 'type', value: emailType }, { name: 'campaign', value: 'reengagement' }],
    });
}

/**
 * Send streak warning email
 */
async function sendStreakWarningEmail(email, userName, currentStreak) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://promorang.co';

    return resendService.sendEmail({
        to: email,
        subject: `⚠️ Your ${currentStreak}-day streak is at risk!`,
        html: resendService.getBaseTemplate({
            title: "Don't Lose Your Streak!",
            preheader: `Your ${currentStreak}-day streak will break at midnight`,
            content: `
        <p>Hi ${userName},</p>
        
        <p>Your <strong>${currentStreak}-day streak</strong> is about to break! 😱</p>
        
        <div class="highlight-box">
          <p style="margin: 0; font-weight: 600;">🔥 ${currentStreak} Days</p>
          <p style="margin: 8px 0 0; font-size: 14px;">Log in before midnight to keep it going!</p>
        </div>
        
        <p>Just a quick check-in is all it takes. Plus, you'll earn bonus gems for maintaining your streak!</p>
      `,
            ctaUrl: `${frontendUrl}/dashboard`,
            ctaText: 'Save My Streak',
        }),
        text: `Your ${currentStreak}-day streak is at risk! Log in before midnight to keep it going.`,
        tags: [{ name: 'type', value: 'streak_warning' }, { name: 'campaign', value: 'engagement' }],
    });
}

// =============================================================================
// EMAIL CONTENT CONFIGURATIONS
// =============================================================================

function getOnboardingEmailConfig(emailType, userName, context) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://promorang.co';

    const configs = {
        // Day 1: How Drops Work
        onboarding_drops_tutorial: {
            title: 'How to Earn with Drops 📋',
            subject: '📋 Your guide to earning with Drops',
            preheader: 'Learn how to complete drops and earn gems',
            content: `
        <p>Hi ${userName},</p>
        
        <p>Ready to start earning? Here's how <strong>Drops</strong> work:</p>
        
        <div class="highlight-box">
          <p><strong>1. Browse Drops</strong> - Find tasks that match your skills</p>
          <p><strong>2. Apply</strong> - Submit your application (costs Keys)</p>
          <p><strong>3. Complete</strong> - Follow the instructions and submit proof</p>
          <p><strong>4. Earn</strong> - Get Gems deposited to your wallet!</p>
        </div>
        
        <p>Start with easy drops to build your reputation, then unlock higher-paying opportunities.</p>
      `,
            ctaUrl: `${frontendUrl}/drops`,
            ctaText: 'Browse Drops Now',
            footerNote: 'Pro tip: Apply early – popular drops fill up fast!',
            textContent: `How to Earn with Drops: 1. Browse drops, 2. Apply, 3. Complete, 4. Earn gems!`,
        },

        // Day 2: First 100 Gems
        onboarding_first_gems: {
            title: 'Your Path to 100 Gems 💎',
            subject: '💎 How to earn your first 100 Gems',
            preheader: 'The fastest ways to hit your first milestone',
            content: `
        <p>Hi ${userName},</p>
        
        <p>Here's your roadmap to earning <strong>100 Gems</strong> this week:</p>
        
        <div class="meta-info">
          ✅ <strong>Daily Check-in</strong> - Up to 50 gems/week<br>
          ✅ <strong>Complete 2 Easy Drops</strong> - 20-50 gems each<br>
          ✅ <strong>Refer 1 Friend</strong> - 100 gems bonus when they're active
        </div>
        
        <p>Once you hit 100 Gems, you can convert them to real money or use them for premium features!</p>
      `,
            ctaUrl: `${frontendUrl}/dashboard`,
            ctaText: 'Start Earning',
            textContent: `Your path to 100 gems: Daily check-ins, complete 2 drops, refer a friend.`,
        },

        // Day 3: Streak System
        onboarding_streak_system: {
            title: 'Build Your Streak 🔥',
            subject: '🔥 The secret to maximizing your earnings',
            preheader: 'Daily streaks = bonus rewards',
            content: `
        <p>Hi ${userName},</p>
        
        <p>Did you know you can earn <strong>extra gems every single day</strong> just by logging in?</p>
        
        <div class="highlight-box">
          <p style="margin: 0;"><strong>🔥 Streak Rewards:</strong></p>
          <p>Day 1-6: 5-30 gems/day</p>
          <p>Day 7: 50 gems (weekly milestone!)</p>
          <p>Day 30: 150 gems (monthly milestone!)</p>
        </div>
        
        <p>The longer your streak, the bigger the rewards. Don't break the chain!</p>
      `,
            ctaUrl: `${frontendUrl}/dashboard`,
            ctaText: 'Check In Today',
            textContent: `Build your streak for bonus gems! Day 7 = 50 gems, Day 30 = 150 gems.`,
        },

        // Day 4: Referral Program
        onboarding_referral_intro: {
            title: 'Earn While You Share 👥',
            subject: '👥 Double your earnings with referrals',
            preheader: 'Get paid when your friends earn',
            content: `
        <p>Hi ${userName},</p>
        
        <p>Want to <strong>earn while you sleep?</strong> Invite friends to Promorang!</p>
        
        <div class="highlight-box">
          <p><strong>🎁 When they sign up:</strong> 50 gems for you</p>
          <p><strong>⚡ When they become active:</strong> 100 gems bonus</p>
          <p><strong>💰 Forever:</strong> 5% of everything they earn</p>
        </div>
        
        <p>Top referrers earn thousands of gems per month. Your network is your net worth!</p>
      `,
            ctaUrl: `${frontendUrl}/referrals`,
            ctaText: 'Get My Referral Link',
            textContent: `Earn 5% of everything your referrals earn. Get your link now!`,
        },

        // Day 5: Success Stories
        onboarding_success_stories: {
            title: "They Did It, So Can You 🌟",
            subject: '🌟 How creators are earning on Promorang',
            preheader: 'Real stories from our community',
            content: `
        <p>Hi ${userName},</p>
        
        <p>Meet some of our successful creators:</p>
        
        <div class="meta-info">
          <strong>@SarahCreates</strong> - Earned 5,000 gems in her first month<br>
          "I just do 2-3 drops per day. It adds up fast!"
        </div>
        
        <div class="meta-info" style="margin-top: 10px;">
          <strong>@TechMike</strong> - Built a referral network of 50+<br>
          "Passive income from referrals changed everything."
        </div>
        
        <p>You're just getting started. Your success story is next! 🚀</p>
      `,
            ctaUrl: `${frontendUrl}/drops`,
            ctaText: 'Write Your Story',
            textContent: `See how other creators are earning thousands of gems. You're next!`,
        },

        // Day 7: Win-back (if inactive)
        onboarding_winback: {
            title: "We Miss You! 👋",
            subject: '👋 Come back for a special bonus',
            preheader: 'Special offer inside',
            content: `
        <p>Hi ${userName},</p>
        
        <p>We noticed you haven't been around lately. 😢</p>
        
        <p>Come back today and we'll give you a <strong>2X gem bonus</strong> on your next completed drop!</p>
        
        <div class="highlight-box">
          <p style="margin: 0; font-weight: 600;">🎁 Welcome Back Bonus</p>
          <div class="value">2X Gems</div>
          <p style="margin: 0; font-size: 14px;">On your next drop (expires in 48 hours)</p>
        </div>
      `,
            ctaUrl: `${frontendUrl}/drops`,
            ctaText: 'Claim My Bonus',
            textContent: `We miss you! Come back for 2X gems on your next drop.`,
        },

        // Advertiser: First Drop
        advertiser_first_drop: {
            title: 'Create Your First Campaign 🚀',
            subject: '🚀 Launch your first Drop in minutes',
            preheader: 'Get your brand in front of creators',
            content: `
        <p>Hi ${userName},</p>
        
        <p>Ready to get real people sharing your brand? Create your first <strong>Drop</strong> and watch the magic happen.</p>
        
        <div class="meta-info">
          <strong>Steps to launch:</strong><br>
          1. Set your objective (awareness, content, reviews)<br>
          2. Define the task and rewards<br>
          3. Fund with Gems<br>
          4. Watch applications roll in!
        </div>
      `,
            ctaUrl: `${frontendUrl}/advertiser/drops/new`,
            ctaText: 'Create a Drop',
            textContent: `Create your first campaign and get creators sharing your brand.`,
        },
    };

    return configs[emailType] || null;
}

function getReEngagementEmailConfig(emailType, userName, context) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://promorang.co';

    const configs = {
        // 3 days inactive
        reengagement_soft_reminder: {
            title: "New Drops Are Waiting 🎯",
            subject: '🎯 New earning opportunities for you',
            preheader: 'Fresh drops just for you',
            content: `
        <p>Hi ${userName},</p>
        
        <p>While you were away, new Drops were added that match your profile!</p>
        
        <p>Log in to see what's available before they fill up.</p>
      `,
            ctaUrl: `${frontendUrl}/drops`,
            ctaText: 'See New Drops',
            textContent: `New drops are waiting for you! Log in to see what's available.`,
        },

        // 7 days inactive
        reengagement_fomo: {
            title: "You're Missing Out! 😱",
            subject: '😱 Others are earning while you wait',
            preheader: 'Don\'t fall behind',
            content: `
        <p>Hi ${userName},</p>
        
        <p>In the last 7 days, Promorang creators have earned over <strong>1 million Gems</strong>!</p>
        
        <p>There are ${Math.floor(Math.random() * 20) + 30} active drops right now that you could complete today.</p>
        
        <div class="highlight-box">
          <p style="margin: 0;">🏆 Top earner this week: 15,000 gems</p>
          <p style="margin: 8px 0 0;">📈 Average drop reward: 45 gems</p>
        </div>
      `,
            ctaUrl: `${frontendUrl}/drops`,
            ctaText: 'Start Earning Again',
            textContent: `Creators earned millions of gems this week. Get back in the game!`,
        },

        // 14 days inactive
        reengagement_incentive: {
            title: "Special Comeback Offer 🎁",
            subject: '🎁 Complete 1 drop, earn 2X rewards',
            preheader: 'Limited time bonus',
            content: `
        <p>Hi ${userName},</p>
        
        <p>We really want you back. Here's a <strong>special offer</strong> just for you:</p>
        
        <div class="highlight-box">
          <p style="margin: 0; font-weight: 600;">🎁 Comeback Bonus</p>
          <div class="value">2X Gems</div>
          <p style="margin: 0; font-size: 14px;">On your next 3 completed drops</p>
        </div>
        
        <p>This offer expires in 72 hours. Don't miss it!</p>
      `,
            ctaUrl: `${frontendUrl}/drops`,
            ctaText: 'Claim 2X Bonus',
            textContent: `Special offer: 2X gems on your next 3 drops. Expires in 72 hours!`,
        },

        // 30 days inactive
        reengagement_survey: {
            title: "We Want to Hear From You",
            subject: '💬 Quick question + free bonus',
            preheader: 'Help us improve & get rewarded',
            content: `
        <p>Hi ${userName},</p>
        
        <p>It's been a month since we've seen you. We'd love to know why.</p>
        
        <p>Take our 30-second survey and we'll add <strong>50 free Gems</strong> to your account.</p>
        
        <div class="meta-info">
          Your feedback helps us build a better platform for everyone.
        </div>
      `,
            ctaUrl: `${frontendUrl}/feedback?source=reengagement`,
            ctaText: 'Take Survey (50 Gems)',
            textContent: `We miss you! Take a 30-second survey and get 50 free gems.`,
        },
    };

    return configs[emailType] || null;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Log email event for tracking
 */
async function logEmailEvent(userId, emailType, eventType) {
    if (!supabase) return;

    try {
        await supabase
            .from('email_events')
            .insert({
                user_id: userId,
                email_type: emailType,
                event_type: eventType,
            });
    } catch (error) {
        console.error('[Email Campaign] Error logging event:', error);
    }
}

/**
 * Get email campaign stats
 */
async function getCampaignStats() {
    if (!supabase) return null;

    try {
        const { data: stats } = await supabase
            .from('email_events')
            .select('email_type, event_type')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const summary = {};
        for (const event of stats || []) {
            if (!summary[event.email_type]) {
                summary[event.email_type] = { sent: 0, opened: 0, clicked: 0 };
            }
            summary[event.email_type][event.event_type]++;
        }

        return summary;
    } catch (error) {
        console.error('[Email Campaign] Error getting stats:', error);
        return null;
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    // Sequence management
    startOnboardingSequence,
    processOnboardingEmails,

    // Re-engagement
    processReEngagementEmails,
    sendStreakWarning,

    // Individual emails
    sendOnboardingEmail,
    sendReEngagementEmail,
    sendStreakWarningEmail,

    // Utilities
    logEmailEvent,
    getCampaignStats,

    // Constants
    ONBOARDING_SEQUENCES,
    RE_ENGAGEMENT_TRIGGERS,
};
