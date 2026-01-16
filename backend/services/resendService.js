/**
 * PROMORANG EMAIL SERVICE
 * Comprehensive email service using Resend API
 * Handles all platform email notifications
 */

const { Resend } = require('resend');

// Initialize Resend client
// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;
let resend;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.warn('⚠️ RESEND_API_KEY is missing. Email service will run in mock mode (logging only).');
  resend = {
    emails: {
      send: async (params) => {
        console.log('---------------------------------------------------');
        console.log('📧 MOCK EMAIL SEND (Missing API Key)');
        console.log('To:', params.to);
        console.log('Subject:', params.subject);
        console.log('HTML Preview:', params.html?.substring(0, 100) + '...');
        console.log('---------------------------------------------------');
        return { data: { id: 'mock-email-id-' + Date.now() }, error: null };
      }
    }
  };
}

// Email configuration
const EMAIL_CONFIG = {
  fromAddress: process.env.EMAIL_FROM_ADDRESS || 'Promorang <onboarding@resend.dev>',
  frontendUrl: process.env.FRONTEND_URL || 'https://promorang.co',
  supportEmail: 'support@promorang.co',
};

// Brand colors for email templates
const BRAND = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#f5576c',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

/**
 * Base HTML email template with Promorang branding
 */
function getBaseTemplate({ title, preheader, content, ctaUrl, ctaText, footerNote }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    table, td, div, p { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      margin: 0;
      padding: 0;
      background-color: #f4f4f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      background: ${BRAND.gradient};
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      text-decoration: none;
      margin-bottom: 15px;
      display: block;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 16px;
      color: #4a4a6a;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background: ${BRAND.gradient};
      color: #ffffff !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .highlight-box {
      background: linear-gradient(135deg, #f8f9ff 0%, #fff5f5 100%);
      border-left: 4px solid ${BRAND.primary};
      padding: 20px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    .highlight-box .value {
      font-size: 28px;
      font-weight: 700;
      color: ${BRAND.primary};
      margin: 8px 0;
    }
    .meta-info {
      background: #f8f9fa;
      padding: 15px 20px;
      border-radius: 8px;
      margin: 16px 0;
      font-size: 14px;
      color: #6c757d;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eee;
    }
    .footer p {
      margin: 0 0 10px;
      color: #6c757d;
      font-size: 14px;
    }
    .footer a {
      color: ${BRAND.primary};
      text-decoration: none;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #6c757d;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .content, .header, .footer {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f9; padding: 20px 0;">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <a href="${EMAIL_CONFIG.frontendUrl}" class="logo">🚀 Promorang</a>
            <h1>${title}</h1>
          </div>
          
          <div class="content">
            ${content}
            
            ${ctaUrl && ctaText ? `
            <div class="cta-container">
              <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
            </div>
            ` : ''}
            
            ${footerNote ? `
            <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
              💡 <strong>Pro Tip:</strong> ${footerNote}
            </p>
            ` : ''}
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="https://twitter.com/promorang">Twitter</a>
              <a href="https://instagram.com/promorang">Instagram</a>
              <a href="https://discord.gg/promorang">Discord</a>
            </div>
            <p>
              <a href="${EMAIL_CONFIG.frontendUrl}/settings">Email Preferences</a> | 
              <a href="${EMAIL_CONFIG.frontendUrl}/support">Help Center</a>
            </p>
            <p style="font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} Promorang. All rights reserved.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send an email using Resend
 */
async function sendEmail({ to, subject, html, text, replyTo, tags }) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo: replyTo || EMAIL_CONFIG.supportEmail,
      tags: tags || [{ name: 'platform', value: 'promorang' }],
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { success: false, error: err.message };
  }
}

// =============================================================================
// TRANSACTIONAL EMAILS
// =============================================================================

/**
 * Welcome email for new users
 */
async function sendWelcomeEmail(userEmail, userName) {
  const html = getBaseTemplate({
    title: 'Welcome to Promorang! 🎉',
    preheader: 'Your journey to earning rewards starts now.',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Welcome to <strong>Promorang</strong> – the platform where your engagement turns into real rewards!</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🎁 Welcome Bonus</p>
        <div class="value">100 Points + 10 Keys</div>
        <p style="margin: 0; font-size: 14px;">Already added to your account!</p>
      </div>
      
      <p><strong>Here's what you can do on Promorang:</strong></p>
      <ul style="color: #4a4a6a; padding-left: 20px;">
        <li>📋 Complete Drops to earn Gems</li>
        <li>💎 Invest in content you believe in</li>
        <li>🔥 Build streaks for bonus rewards</li>
        <li>👥 Invite friends and earn commissions</li>
      </ul>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/dashboard`,
    ctaText: 'Go to Dashboard',
    footerNote: 'Complete your first Drop today to unlock your earning potential!',
  });

  const text = `
Welcome to Promorang, ${userName}!

Your journey to earning rewards starts now.

Welcome Bonus: 100 Points + 10 Keys (already added!)

What you can do:
- Complete Drops to earn Gems
- Invest in content you believe in
- Build streaks for bonus rewards
- Invite friends and earn commissions

Get started: ${EMAIL_CONFIG.frontendUrl}/dashboard
  `.trim();

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Promorang! 🎉 Your rewards journey begins',
    html,
    text,
    tags: [{ name: 'type', value: 'welcome' }],
  });
}

/**
 * Password reset email
 */
async function sendPasswordResetEmail(userEmail, resetUrl, userName) {
  const html = getBaseTemplate({
    title: 'Reset Your Password',
    preheader: 'You requested a password reset for your Promorang account.',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <div class="meta-info">
        ⏰ This link expires in 1 hour for security reasons.
      </div>
    `,
    ctaUrl: resetUrl,
    ctaText: 'Reset Password',
    footerNote: "If you didn't request this, you can safely ignore this email. Your password won't be changed.",
  });

  const text = `
Reset Your Password

Hi ${userName || 'there'},

We received a request to reset your password. Visit this link to create a new password:
${resetUrl}

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email.
  `.trim();

  return sendEmail({
    to: userEmail,
    subject: 'Reset your Promorang password',
    html,
    text,
    tags: [{ name: 'type', value: 'password-reset' }],
  });
}

/**
 * Security alert email (new login)
 */
async function sendSecurityAlertEmail(userEmail, userName, alertData) {
  const { alertType, device, location, timestamp } = alertData;

  const html = getBaseTemplate({
    title: 'Security Alert',
    preheader: 'We noticed a new login to your account.',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>We noticed a new sign-in to your Promorang account:</p>
      
      <div class="meta-info">
        <strong>Device:</strong> ${device || 'Unknown device'}<br>
        <strong>Location:</strong> ${location || 'Unknown location'}<br>
        <strong>Time:</strong> ${new Date(timestamp || Date.now()).toLocaleString()}
      </div>
      
      <p>If this was you, no action is needed.</p>
      <p>If you don't recognize this activity, please secure your account immediately.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/settings/security`,
    ctaText: 'Review Account Security',
  });

  return sendEmail({
    to: userEmail,
    subject: '⚠️ New login to your Promorang account',
    html,
    text: `Security Alert: New login detected. Device: ${device}, Location: ${location}, Time: ${timestamp}. If this wasn't you, please secure your account at ${EMAIL_CONFIG.frontendUrl}/settings/security`,
    tags: [{ name: 'type', value: 'security-alert' }],
  });
}

// =============================================================================
// DROP & PLATFORM EMAILS
// =============================================================================

/**
 * Drop application approved
 */
async function sendDropApprovedEmail(userEmail, userName, dropData) {
  const { title, gemReward, deadline } = dropData;

  const html = getBaseTemplate({
    title: 'Application Approved! ✅',
    preheader: `Your application for "${title}" has been approved.`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Great news! Your application for the following Drop has been approved:</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">📋 ${title}</p>
        <div class="value">+${gemReward} Gems</div>
        <p style="margin: 0; font-size: 14px;">Potential reward upon completion</p>
      </div>
      
      ${deadline ? `
      <div class="meta-info">
        ⏰ <strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
      </div>
      ` : ''}
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/drops`,
    ctaText: 'View Drop Details',
    footerNote: "Complete the drop requirements to earn your rewards!",
  });

  return sendEmail({
    to: userEmail,
    subject: `✅ Approved: ${title}`,
    html,
    text: `Your application for "${title}" has been approved! Complete it to earn ${gemReward} Gems.`,
    tags: [{ name: 'type', value: 'drop-approved' }],
  });
}

/**
 * Drop application rejected
 */
async function sendDropRejectedEmail(userEmail, userName, dropData) {
  const { title, reason } = dropData;

  const html = getBaseTemplate({
    title: 'Application Update',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Unfortunately, your application for "<strong>${title}</strong>" was not approved this time.</p>
      
      ${reason ? `
      <div class="meta-info">
        <strong>Feedback:</strong> ${reason}
      </div>
      ` : ''}
      
      <p>Don't worry – there are plenty more opportunities! Check out other available Drops and try again.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/drops`,
    ctaText: 'Browse More Drops',
    footerNote: 'Each rejection is a step closer to your next approval!',
  });

  return sendEmail({
    to: userEmail,
    subject: `Application Update: ${title}`,
    html,
    text: `Your application for "${title}" was not approved. ${reason ? `Feedback: ${reason}` : ''} Browse more drops at ${EMAIL_CONFIG.frontendUrl}/drops`,
    tags: [{ name: 'type', value: 'drop-rejected' }],
  });
}

/**
 * Drop completed - reward earned
 */
async function sendDropCompletedEmail(userEmail, userName, dropData) {
  const { title, gemsEarned, keysEarned, pointsEarned } = dropData;

  const rewards = [];
  if (gemsEarned) rewards.push(`${gemsEarned} Gems`);
  if (keysEarned) rewards.push(`${keysEarned} Keys`);
  if (pointsEarned) rewards.push(`${pointsEarned} Points`);

  const html = getBaseTemplate({
    title: 'Drop Completed! 🎉',
    preheader: `You earned ${rewards.join(' + ')} for completing "${title}"`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Amazing work! You've successfully completed a Drop:</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">📋 ${title}</p>
        <div class="value">+${rewards.join(' + ')}</div>
        <p style="margin: 0; font-size: 14px;">Added to your balance!</p>
      </div>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/wallet`,
    ctaText: 'View Your Wallet',
    footerNote: 'Keep completing drops to build your earnings!',
  });

  return sendEmail({
    to: userEmail,
    subject: `🎉 You earned ${rewards.join(' + ')}!`,
    html,
    text: `Congratulations! You completed "${title}" and earned ${rewards.join(' + ')}.`,
    tags: [{ name: 'type', value: 'drop-completed' }],
  });
}

// =============================================================================
// REFERRAL EMAILS
// =============================================================================

/**
 * New referral signup notification (to referrer)
 */
async function sendReferralSignupEmail(referrerEmail, referrerName, referredUserName) {
  const html = getBaseTemplate({
    title: 'New Referral! 👥',
    preheader: `${referredUserName} just joined using your referral link!`,
    content: `
      <p>Hi ${referrerName || 'there'},</p>
      
      <p>Great news! Someone just joined Promorang using your referral link:</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">👤 ${referredUserName}</p>
        <p style="margin: 8px 0 0; font-size: 14px;">When they become active, you'll earn a bonus!</p>
      </div>
      
      <p>Keep sharing your referral link to grow your network and earnings.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/referrals`,
    ctaText: 'View Referral Stats',
  });

  return sendEmail({
    to: referrerEmail,
    subject: `👥 ${referredUserName} joined via your referral!`,
    html,
    text: `${referredUserName} just joined Promorang using your referral link! View your stats at ${EMAIL_CONFIG.frontendUrl}/referrals`,
    tags: [{ name: 'type', value: 'referral-signup' }],
  });
}

/**
 * Referral activation bonus earned
 */
async function sendReferralActivationEmail(referrerEmail, referrerName, bonusData) {
  const { referredUserName, gemsEarned, pointsEarned } = bonusData;

  const html = getBaseTemplate({
    title: 'Referral Bonus Earned! 🎁',
    preheader: `You earned a bonus because ${referredUserName} became active!`,
    content: `
      <p>Hi ${referrerName || 'there'},</p>
      
      <p>Your referral <strong>${referredUserName}</strong> has become an active user on Promorang!</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🎁 Activation Bonus</p>
        <div class="value">+${gemsEarned} Gems</div>
        ${pointsEarned ? `<p style="margin: 0; font-size: 14px;">+${pointsEarned} Points</p>` : ''}
      </div>
      
      <p>You'll continue earning commissions from their activity. Keep sharing!</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/referrals`,
    ctaText: 'View Earnings',
  });

  return sendEmail({
    to: referrerEmail,
    subject: `🎁 You earned ${gemsEarned} Gems from your referral!`,
    html,
    text: `${referredUserName} became active and you earned ${gemsEarned} Gems!`,
    tags: [{ name: 'type', value: 'referral-activation' }],
  });
}

/**
 * Referral commission earned
 */
async function sendReferralCommissionEmail(referrerEmail, referrerName, commissionData) {
  const { amount, referredUserName, activityType } = commissionData;

  const html = getBaseTemplate({
    title: 'Commission Earned! 💰',
    content: `
      <p>Hi ${referrerName || 'there'},</p>
      
      <p>You just earned a commission from your referral's activity:</p>
      
      <div class="highlight-box">
        <p style="margin: 0;">From: <strong>${referredUserName}</strong></p>
        <p style="margin: 4px 0;">Activity: ${activityType}</p>
        <div class="value">+${amount} Gems</div>
      </div>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/wallet`,
    ctaText: 'View Wallet',
  });

  return sendEmail({
    to: referrerEmail,
    subject: `💰 Commission: +${amount} Gems from ${referredUserName}`,
    html,
    text: `You earned ${amount} Gems in commission from ${referredUserName}'s ${activityType}.`,
    tags: [{ name: 'type', value: 'referral-commission' }],
  });
}

// =============================================================================
// FINANCIAL EMAILS
// =============================================================================

/**
 * Withdrawal request confirmation
 */
async function sendWithdrawalRequestedEmail(userEmail, userName, withdrawalData) {
  const { amount, paymentMethod, estimatedTime } = withdrawalData;

  const html = getBaseTemplate({
    title: 'Withdrawal Request Received',
    preheader: `Your withdrawal of $${amount} is being processed.`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>We've received your withdrawal request:</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">💸 Withdrawal Request</p>
        <div class="value">$${amount.toFixed(2)}</div>
        <p style="margin: 0; font-size: 14px;">via ${paymentMethod}</p>
      </div>
      
      <div class="meta-info">
        ⏰ <strong>Estimated processing time:</strong> ${estimatedTime || '1-3 business days'}
      </div>
      
      <p>We'll send you another email once the transfer is complete.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/wallet`,
    ctaText: 'View Wallet',
  });

  return sendEmail({
    to: userEmail,
    subject: `💸 Withdrawal request: $${amount.toFixed(2)}`,
    html,
    text: `Your withdrawal of $${amount.toFixed(2)} via ${paymentMethod} is being processed. Estimated time: ${estimatedTime}.`,
    tags: [{ name: 'type', value: 'withdrawal-requested' }],
  });
}

/**
 * Withdrawal completed
 */
async function sendWithdrawalCompletedEmail(userEmail, userName, withdrawalData) {
  const { amount, paymentMethod, transactionId } = withdrawalData;

  const html = getBaseTemplate({
    title: 'Withdrawal Complete! ✅',
    preheader: `Your $${amount} has been sent!`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Great news! Your withdrawal has been processed:</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">✅ Transfer Complete</p>
        <div class="value">$${amount.toFixed(2)}</div>
        <p style="margin: 0; font-size: 14px;">Sent via ${paymentMethod}</p>
      </div>
      
      <div class="meta-info">
        <strong>Transaction ID:</strong> ${transactionId || 'N/A'}
      </div>
      
      <p>The funds should appear in your account shortly.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/wallet`,
    ctaText: 'View Transaction History',
  });

  return sendEmail({
    to: userEmail,
    subject: `✅ $${amount.toFixed(2)} withdrawal complete!`,
    html,
    text: `Your withdrawal of $${amount.toFixed(2)} via ${paymentMethod} is complete! Transaction ID: ${transactionId}`,
    tags: [{ name: 'type', value: 'withdrawal-completed' }],
  });
}

/**
 * KYC verification required
 */
async function sendKycRequiredEmail(userEmail, userName, reason) {
  const html = getBaseTemplate({
    title: 'Verification Required',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>To continue with your request, we need to verify your identity.</p>
      
      <div class="meta-info">
        ${reason || 'Withdrawals over $500 require identity verification for security.'}
      </div>
      
      <p>This is a quick, secure process that helps protect your account and comply with regulations.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/settings/kyc`,
    ctaText: 'Start Verification',
    footerNote: 'Verification typically takes just a few minutes.',
  });

  return sendEmail({
    to: userEmail,
    subject: '🔐 Identity verification required',
    html,
    text: `Identity verification is required. Please complete it at ${EMAIL_CONFIG.frontendUrl}/settings/kyc`,
    tags: [{ name: 'type', value: 'kyc-required' }],
  });
}

// =============================================================================
// ENGAGEMENT EMAILS
// =============================================================================

/**
 * Streak milestone email
 */
async function sendStreakMilestoneEmail(userEmail, userName, streakData) {
  const { days, bonusGems, bonusPoints } = streakData;

  const milestoneEmojis = {
    7: '🔥',
    14: '⚡',
    30: '🌟',
    60: '💫',
    100: '🏆',
    365: '👑',
  };
  const emoji = milestoneEmojis[days] || '🎯';

  const html = getBaseTemplate({
    title: `${days}-Day Streak! ${emoji}`,
    preheader: `You've been active for ${days} days straight!`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Incredible dedication! You've maintained your streak for <strong>${days} days</strong>!</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">${emoji} Streak Milestone</p>
        <div class="value">${days} Days</div>
        ${bonusGems || bonusPoints ? `
          <p style="margin: 8px 0 0; font-size: 14px;">Bonus: +${bonusGems || 0} Gems, +${bonusPoints || 0} Points</p>
        ` : ''}
      </div>
      
      <p>Keep it up – the longer your streak, the bigger the rewards!</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/dashboard`,
    ctaText: 'Continue Your Streak',
  });

  return sendEmail({
    to: userEmail,
    subject: `${emoji} ${days}-Day Streak Achievement!`,
    html,
    text: `Amazing! You've maintained a ${days}-day streak. Keep going!`,
    tags: [{ name: 'type', value: 'streak-milestone' }],
  });
}

/**
 * Quest completed
 */
async function sendQuestCompletedEmail(userEmail, userName, questData) {
  const { title, rewards } = questData;

  const html = getBaseTemplate({
    title: 'Quest Complete! 🎯',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>You've completed a quest:</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🎯 ${title}</p>
        <div class="value">${rewards}</div>
      </div>
      
      <p>Check the Quests page for more opportunities!</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/quests`,
    ctaText: 'View More Quests',
  });

  return sendEmail({
    to: userEmail,
    subject: `🎯 Quest Complete: ${title}`,
    html,
    text: `You completed "${title}" and earned ${rewards}!`,
    tags: [{ name: 'type', value: 'quest-completed' }],
  });
}

/**
 * Achievement unlocked
 */
async function sendAchievementUnlockedEmail(userEmail, userName, achievementData) {
  const { title, description, rewardGems, rewardPoints } = achievementData;

  const html = getBaseTemplate({
    title: 'Achievement Unlocked! 🏅',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>You've unlocked a new achievement!</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🏅 ${title}</p>
        <p style="margin: 8px 0; color: #666;">${description}</p>
        ${rewardGems || rewardPoints ? `
          <div class="value">+${rewardGems || 0} Gems, +${rewardPoints || 0} Points</div>
        ` : ''}
      </div>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/profile`,
    ctaText: 'View All Achievements',
  });

  return sendEmail({
    to: userEmail,
    subject: `🏅 Achievement: ${title}`,
    html,
    text: `You unlocked "${title}"! ${description}`,
    tags: [{ name: 'type', value: 'achievement-unlocked' }],
  });
}

/**
 * Coupon earned (refactored from old emailNotifications.js)
 */
async function sendCouponEarnedEmail(userEmail, userName, couponData) {
  const { title, description, value, value_unit, source_label, expires_at } = couponData;

  const valueDisplay = value_unit === 'percentage'
    ? `${value}% OFF`
    : `${value} ${value_unit}`;

  const html = getBaseTemplate({
    title: 'You Earned a Reward! 🎁',
    preheader: `Use your new reward: ${title}`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Congratulations! You've earned a new reward:</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🎁 ${title}</p>
        ${description ? `<p style="margin: 8px 0; color: #666;">${description}</p>` : ''}
        <div class="value">${valueDisplay}</div>
      </div>
      
      <div class="meta-info">
        <strong>How you earned it:</strong> ${source_label}<br>
        <strong>Expires:</strong> ${new Date(expires_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
      </div>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/rewards`,
    ctaText: 'View & Redeem Reward',
    footerNote: 'Check your Rewards tab regularly to discover new perks!',
  });

  return sendEmail({
    to: userEmail,
    subject: `🎁 You Earned: ${title}`,
    html,
    text: `You earned "${title}" - ${valueDisplay}. Expires: ${new Date(expires_at).toLocaleDateString()}. Redeem at ${EMAIL_CONFIG.frontendUrl}/rewards`,
    tags: [{ name: 'type', value: 'coupon-earned' }],
  });
}

/**
 * Weekly rewards digest
 */
async function sendWeeklyDigestEmail(userEmail, userName, stats) {
  const { earned_this_week, available_count, expiring_soon, total_gems, streak_days } = stats;

  const html = getBaseTemplate({
    title: 'Your Weekly Summary 📊',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Here's your Promorang activity for this week:</p>
      
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="text-align: center; padding: 15px; background: #f8f9ff; border-radius: 8px 0 0 8px;">
            <div style="font-size: 24px; font-weight: 700; color: ${BRAND.primary};">${earned_this_week || 0}</div>
            <div style="font-size: 12px; color: #666;">Rewards Earned</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f8f9ff;">
            <div style="font-size: 24px; font-weight: 700; color: ${BRAND.primary};">${total_gems || 0}</div>
            <div style="font-size: 12px; color: #666;">Total Gems</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f8f9ff; border-radius: 0 8px 8px 0;">
            <div style="font-size: 24px; font-weight: 700; color: ${BRAND.primary};">${streak_days || 0}</div>
            <div style="font-size: 12px; color: #666;">Day Streak</div>
          </td>
        </tr>
      </table>
      
      ${expiring_soon > 0 ? `
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        ⚠️ <strong>Action Required:</strong> You have ${expiring_soon} reward${expiring_soon > 1 ? 's' : ''} expiring soon!
      </div>
      ` : ''}
      
      <p>Keep up the great work and keep earning!</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/dashboard`,
    ctaText: 'View Dashboard',
  });

  return sendEmail({
    to: userEmail,
    subject: `📊 Weekly Summary: ${earned_this_week} Rewards Earned`,
    html,
    text: `This week: ${earned_this_week} rewards earned, ${total_gems} total gems, ${streak_days}-day streak.`,
    tags: [{ name: 'type', value: 'weekly-digest' }],
  });
}

// =============================================================================
// EVENT & TICKET EMAILS
// =============================================================================

/**
 * Event ticket purchase confirmation
 */
async function sendTicketPurchaseEmail(userEmail, userName, ticketData) {
  const { eventName, tierName, activationCode, eventDate, eventLocation } = ticketData;

  const html = getBaseTemplate({
    title: 'Ticket Confirmed! 🎟️',
    preheader: `Your ticket for ${eventName} is ready!`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Your ticket has been confirmed!</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🎟️ ${eventName}</p>
        <p style="margin: 8px 0;">Tier: <strong>${tierName}</strong></p>
        <div class="value" style="font-family: monospace;">${activationCode}</div>
        <p style="margin: 8px 0 0; font-size: 12px;">Your activation code (show at entry)</p>
      </div>
      
      <div class="meta-info">
        📅 <strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}<br>
        📍 <strong>Location:</strong> ${eventLocation}
      </div>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/tickets`,
    ctaText: 'View My Tickets',
    footerNote: 'Save this email or take a screenshot of your activation code.',
  });

  return sendEmail({
    to: userEmail,
    subject: `🎟️ Ticket Confirmed: ${eventName}`,
    html,
    text: `Your ticket for ${eventName} is confirmed! Activation Code: ${activationCode}. Date: ${eventDate}. Location: ${eventLocation}.`,
    tags: [{ name: 'type', value: 'ticket-purchase' }],
  });
}

/**
 * Event reminder (24h before)
 */
async function sendEventReminderEmail(userEmail, userName, eventData) {
  const { eventName, activationCode, eventDate, eventLocation } = eventData;

  const html = getBaseTemplate({
    title: 'Event Tomorrow! ⏰',
    preheader: `${eventName} is happening tomorrow!`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Just a reminder – your event is <strong>tomorrow</strong>!</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">📅 ${eventName}</p>
        <p style="margin: 8px 0;">📍 ${eventLocation}</p>
        <p style="margin: 8px 0;">🕐 ${new Date(eventDate).toLocaleString()}</p>
        <div class="value" style="font-family: monospace; font-size: 20px;">${activationCode}</div>
      </div>
      
      <p>Make sure to bring your activation code for entry!</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/tickets`,
    ctaText: 'View Ticket',
  });

  return sendEmail({
    to: userEmail,
    subject: `⏰ Reminder: ${eventName} is tomorrow!`,
    html,
    text: `Reminder: ${eventName} is tomorrow at ${eventLocation}. Your code: ${activationCode}`,
    tags: [{ name: 'type', value: 'event-reminder' }],
  });
}

// =============================================================================
// SUPPORT EMAILS
// =============================================================================

/**
 * Support ticket created
 */
async function sendSupportTicketCreatedEmail(userEmail, userName, ticketData) {
  const { ticketId, subject, category } = ticketData;

  const html = getBaseTemplate({
    title: 'Support Ticket Created',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>We've received your support request:</p>
      
      <div class="meta-info">
        <strong>Ticket ID:</strong> #${ticketId}<br>
        <strong>Category:</strong> ${category}<br>
        <strong>Subject:</strong> ${subject}
      </div>
      
      <p>Our team will review your request and get back to you soon. Most tickets are resolved within 24-48 hours.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/support/tickets/${ticketId}`,
    ctaText: 'View Ticket',
  });

  return sendEmail({
    to: userEmail,
    subject: `Support Ticket #${ticketId}: ${subject}`,
    html,
    text: `Support ticket created. ID: #${ticketId}. Subject: ${subject}. We'll respond within 24-48 hours.`,
    replyTo: EMAIL_CONFIG.supportEmail,
    tags: [{ name: 'type', value: 'support-ticket' }],
  });
}

/**
 * Support ticket response
 */
async function sendSupportTicketResponseEmail(userEmail, userName, ticketData) {
  const { ticketId, subject, responsePreview } = ticketData;

  const html = getBaseTemplate({
    title: 'New Response to Your Ticket',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>We've responded to your support ticket:</p>
      
      <div class="highlight-box">
        <p style="margin: 0;"><strong>Ticket #${ticketId}:</strong> ${subject}</p>
        <p style="margin: 10px 0 0; color: #666;">"${responsePreview}..."</p>
      </div>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/support/tickets/${ticketId}`,
    ctaText: 'View Full Response',
  });

  return sendEmail({
    to: userEmail,
    subject: `Re: Support Ticket #${ticketId}`,
    html,
    text: `New response to ticket #${ticketId}: ${responsePreview}...`,
    replyTo: EMAIL_CONFIG.supportEmail,
    tags: [{ name: 'type', value: 'support-response' }],
  });
}

// =============================================================================
// TEAM MANAGEMENT EMAILS
// =============================================================================

/**
 * Team invitation email - invites a user to join an advertiser account
 */
async function sendTeamInvitationEmail({ to, accountName, accountLogo, inviterName, role, message, token, expiresAt }) {
  const roleDescriptions = {
    admin: 'full access to manage campaigns, team members, and settings',
    manager: 'access to create and manage campaigns and content',
    viewer: 'read-only access to view dashboards and analytics',
  };

  const html = getBaseTemplate({
    title: `You're Invited to ${accountName}! 👥`,
    preheader: `${inviterName} invited you to collaborate on ${accountName}`,
    content: `
      <p>Hi there,</p>
      
      <p><strong>${inviterName}</strong> has invited you to join their team on Promorang!</p>
      
      <div class="highlight-box">
        ${accountLogo ? `<img src="${accountLogo}" alt="${accountName}" style="width: 60px; height: 60px; border-radius: 8px; margin-bottom: 10px;">` : ''}
        <p style="margin: 0; font-weight: 600; font-size: 18px;">🏢 ${accountName}</p>
        <p style="margin: 8px 0 0;">Your role: <strong style="text-transform: capitalize;">${role}</strong></p>
        <p style="margin: 4px 0 0; font-size: 14px; color: #666;">${roleDescriptions[role] || ''}</p>
      </div>
      
      ${message ? `
      <div class="meta-info">
        <strong>Personal message from ${inviterName}:</strong><br>
        "${message}"
      </div>
      ` : ''}
      
      <p>Click the button below to accept this invitation and start collaborating!</p>
      
      <p style="font-size: 13px; color: #888;">This invitation expires on ${new Date(expiresAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/invite/${token}`,
    ctaText: 'Accept Invitation',
    footerNote: "If you don't recognize this invitation, you can safely ignore this email.",
  });

  return sendEmail({
    to,
    subject: `👥 ${inviterName} invited you to ${accountName} on Promorang`,
    html,
    text: `${inviterName} invited you to join ${accountName} as ${role}. Accept at: ${EMAIL_CONFIG.frontendUrl}/invite/${token}`,
    tags: [{ name: 'type', value: 'team-invitation' }],
  });
}

/**
 * Notification to inviter when invitation is accepted
 */
async function sendInvitationAcceptedEmail({ to, newMemberName, accountName }) {
  const html = getBaseTemplate({
    title: 'New Team Member! 🎉',
    preheader: `${newMemberName} joined your team`,
    content: `
      <p>Great news!</p>
      
      <p><strong>${newMemberName}</strong> has accepted your invitation and joined your team on <strong>${accountName}</strong>.</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">✅ Team Member Added</p>
        <p style="margin: 8px 0 0;">${newMemberName} is now part of your team and can start collaborating.</p>
      </div>
      
      <p>You can manage team permissions at any time from your account settings.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/advertiser/settings/team`,
    ctaText: 'View Team',
  });

  return sendEmail({
    to,
    subject: `🎉 ${newMemberName} joined ${accountName}`,
    html,
    text: `${newMemberName} accepted your invitation and joined ${accountName}. View your team at ${EMAIL_CONFIG.frontendUrl}/advertiser/settings/team`,
    tags: [{ name: 'type', value: 'team-member-joined' }],
  });
}

/**
 * Notification when a user is removed from a team
 */
async function sendTeamRemovalEmail({ to, userName, accountName, removedByName }) {
  const html = getBaseTemplate({
    title: 'Team Access Removed',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Your access to <strong>${accountName}</strong> on Promorang has been removed by ${removedByName}.</p>
      
      <p>If you believe this was a mistake, please contact the account owner or our support team.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/dashboard`,
    ctaText: 'Go to Dashboard',
  });

  return sendEmail({
    to,
    subject: `Your access to ${accountName} has been removed`,
    html,
    text: `Your access to ${accountName} has been removed by ${removedByName}. If this was a mistake, please contact support.`,
    tags: [{ name: 'type', value: 'team-removal' }],
  });
}

/**
 * Notification when a user's role is changed
 */
async function sendRoleChangedEmail({ to, userName, accountName, oldRole, newRole, changedByName }) {
  const html = getBaseTemplate({
    title: 'Team Role Updated',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Your role on <strong>${accountName}</strong> has been updated by ${changedByName}.</p>
      
      <div class="highlight-box">
        <p style="margin: 0;">Previous role: <span style="text-transform: capitalize;">${oldRole}</span></p>
        <p style="margin: 8px 0 0; font-weight: 600;">New role: <span style="text-transform: capitalize; color: ${BRAND.primary};">${newRole}</span></p>
      </div>
      
      <p>Your permissions have been updated accordingly.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/advertiser/dashboard`,
    ctaText: 'View Dashboard',
  });

  return sendEmail({
    to,
    subject: `Your role on ${accountName} has been updated`,
    html,
    text: `Your role on ${accountName} has been changed from ${oldRole} to ${newRole} by ${changedByName}.`,
    tags: [{ name: 'type', value: 'team-role-changed' }],
  });
}

// =============================================================================
// ADMIN EMAILS
// =============================================================================

/**
 * Admin alert (high-value withdrawal, suspicious activity, etc.)
 */
async function sendAdminAlertEmail(alertData) {
  const { alertType, title, details, userId, userName, priority } = alertData;

  const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'admin@promorang.co';

  const priorityColors = {
    high: '#dc3545',
    medium: '#ffc107',
    low: '#28a745',
  };

  const html = getBaseTemplate({
    title: `Admin Alert: ${title}`,
    content: `
      <div style="background: ${priorityColors[priority] || priorityColors.medium}; color: white; padding: 10px 15px; border-radius: 5px; margin-bottom: 20px;">
        <strong>${priority?.toUpperCase() || 'MEDIUM'} PRIORITY</strong> - ${alertType}
      </div>
      
      <p><strong>Details:</strong></p>
      <div class="meta-info">
        ${Object.entries(details).map(([key, value]) => `<strong>${key}:</strong> ${value}`).join('<br>')}
      </div>
      
      ${userId ? `<p><strong>User:</strong> ${userName} (ID: ${userId})</p>` : ''}
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/admin`,
    ctaText: 'Open Admin Panel',
  });

  return sendEmail({
    to: adminEmail,
    subject: `[${priority?.toUpperCase() || 'ALERT'}] ${title}`,
    html,
    text: `Admin Alert: ${title}. ${JSON.stringify(details)}`,
    tags: [{ name: 'type', value: 'admin-alert' }],
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Core
  sendEmail,
  getBaseTemplate,
  EMAIL_CONFIG,

  // Transactional
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSecurityAlertEmail,

  // Drops & Platform
  sendDropApprovedEmail,
  sendDropRejectedEmail,
  sendDropCompletedEmail,

  // Referrals
  sendReferralSignupEmail,
  sendReferralActivationEmail,
  sendReferralCommissionEmail,

  // Financial
  sendWithdrawalRequestedEmail,
  sendWithdrawalCompletedEmail,
  sendKycRequiredEmail,

  // Engagement
  sendStreakMilestoneEmail,
  sendQuestCompletedEmail,
  sendAchievementUnlockedEmail,
  sendCouponEarnedEmail,
  sendWeeklyDigestEmail,

  // Events
  sendTicketPurchaseEmail,
  sendEventReminderEmail,

  // Support
  sendSupportTicketCreatedEmail,
  sendSupportTicketResponseEmail,

  // Team Management
  sendTeamInvitationEmail,
  sendInvitationAcceptedEmail,
  sendTeamRemovalEmail,
  sendRoleChangedEmail,

  // Admin
  sendAdminAlertEmail,
};
