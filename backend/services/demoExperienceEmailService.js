const { supabase } = require('../lib/supabase');
const resendService = require('./resendService');

function describeRole(role) {
  const labels = {
    participant: 'Participant Demo',
    host: 'Host Demo',
    brand: 'Brand Demo',
    merchant: 'Merchant Demo',
    agency: 'Agency Demo',
    creator: 'Creator Demo',
    investor: 'Investor Demo',
    advertiser: 'Advertiser Demo',
    operator: 'Operator Demo',
    matrix: 'Matrix Builder Demo',
    'sampling-merchant': 'Sampling Merchant Demo',
    'active-sampling': 'Active Sampling Demo',
    'graduated-merchant': 'Graduated Merchant Demo',
  };

  return labels[role] || 'Promorang Demo';
}

async function getUserById(userId) {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, username, display_name, user_type')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[DemoExperienceEmail] Failed to load user:', error.message);
    return null;
  }

  return data || null;
}

async function getMerchantContext(advertiserId) {
  if (!supabase || !advertiserId) return null;

  const { data, error } = await supabase
    .from('advertiser_profiles')
    .select('user_id, company_name, company_website, merchant_state, users!inner(id, email, username, display_name, user_type)')
    .eq('user_id', advertiserId)
    .maybeSingle();

  if (error) {
    console.warn('[DemoExperienceEmail] Failed to load merchant context:', error.message);
    return null;
  }

  return data || null;
}

async function sendDemoSessionStartedEmail({ role, demoAccount, demoUserId, demoEmailRecipient }) {
  if (!demoEmailRecipient) {
    return { success: false, skipped: true, reason: 'no_demo_email_recipient' };
  }

  const roleLabel = describeRole(role);
  const loginEmail = demoAccount?.email || 'demo@promorang.co';
  const loginPassword = 'demo123456';
  const userName = demoAccount?.name || demoAccount?.display_name || 'there';

  const html = resendService.getBaseTemplate({
    title: `${roleLabel} Ready`,
    preheader: `Your ${roleLabel.toLowerCase()} inbox is now connected.`,
    content: `
      <p>Hi ${userName},</p>
      <p>Your demo email inbox is now attached to the <strong>${roleLabel}</strong> experience.</p>

      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">Demo login</span>
          <span class="info-card-value">${loginEmail}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">Password</span>
          <span class="info-card-value">${loginPassword}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">Inbox routing</span>
          <span class="info-card-value">${demoEmailRecipient}</span>
        </div>
      </div>

      <p>As you move through the demo, platform emails for this seeded account will route to this inbox so you can test the full loop.</p>
    `,
    ctaUrl: `${resendService.EMAIL_CONFIG.frontendUrl}/dashboard`,
    ctaText: 'Open Demo',
  });

  return resendService.sendEmail({
    to: loginEmail,
    subject: `${roleLabel} inbox connected`,
    html,
    text: `Your ${roleLabel} inbox is connected. Demo login: ${loginEmail}. Password: ${loginPassword}. Emails will route to ${demoEmailRecipient}.`,
    tags: [{ name: 'type', value: 'demo-session-started' }],
    userId: demoUserId,
    emailType: 'demo_session_started',
    metadata: { role, demoEmailRecipient },
  });
}

async function sendSamplingActivationCreatedEmail(advertiserId, activation) {
  const merchant = await getMerchantContext(advertiserId);
  const merchantUser = merchant?.users;
  if (!merchantUser?.email) return { success: false, skipped: true, reason: 'merchant_email_missing' };

  const merchantName = merchant?.company_name || merchantUser.display_name || merchantUser.username;
  const activationUrl = `${resendService.EMAIL_CONFIG.frontendUrl}/advertiser/dashboard`;

  const html = resendService.getBaseTemplate({
    title: 'Sampling Activation Is Live',
    preheader: `${activation.name} is now visible in your demo experience.`,
    content: `
      <p>Hi ${merchantName},</p>
      <p>Your sampling activation is now live in the demo environment.</p>

      <div class="highlight-box">
        <p style="margin:0;font-weight:600;">${activation.name}</p>
        <p style="margin:8px 0;">${activation.description || 'Your offer is now available to users.'}</p>
        <div class="value">${activation.value_amount} ${activation.value_unit || 'usd'}</div>
      </div>

      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">Redemption limit</span>
          <span class="info-card-value">${activation.max_redemptions}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">Duration</span>
          <span class="info-card-value">${activation.duration_days} days</span>
        </div>
      </div>
    `,
    ctaUrl: activationUrl,
    ctaText: 'Open Merchant Dashboard',
  });

  return resendService.sendEmail({
    to: merchantUser.email,
    subject: `Sampling live: ${activation.name}`,
    html,
    text: `Your sampling activation "${activation.name}" is now live with ${activation.max_redemptions} redemptions over ${activation.duration_days} days.`,
    tags: [{ name: 'type', value: 'sampling-activation-created' }],
    userId: merchantUser.id,
    emailType: 'sampling_activation_created',
    metadata: { activationId: activation.id, advertiserId },
  });
}

async function sendSamplingParticipationEmail({ advertiserId, activation, participation }) {
  const [merchant, participant] = await Promise.all([
    getMerchantContext(advertiserId),
    getUserById(participation.user_id),
  ]);

  const merchantUser = merchant?.users;
  if (!merchantUser?.email) return { success: false, skipped: true, reason: 'merchant_email_missing' };

  const participantName = participant?.display_name || participant?.username || 'A demo visitor';
  const merchantName = merchant?.company_name || merchantUser.display_name || merchantUser.username;

  const html = resendService.getBaseTemplate({
    title: 'New Sampling Interest',
    preheader: `${participantName} interacted with ${activation.name}.`,
    content: `
      <p>Hi ${merchantName},</p>
      <p>You have a new demo participation on your sampling activation.</p>

      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">Activation</span>
          <span class="info-card-value">${activation.name}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">Visitor</span>
          <span class="info-card-value">${participantName}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">Action</span>
          <span class="info-card-value">${participation.action_type}</span>
        </div>
      </div>
    `,
    ctaUrl: `${resendService.EMAIL_CONFIG.frontendUrl}/advertiser/dashboard`,
    ctaText: 'Review Activity',
  });

  return resendService.sendEmail({
    to: merchantUser.email,
    subject: `New demo participation on ${activation.name}`,
    html,
    text: `${participantName} interacted with "${activation.name}" via ${participation.action_type}.`,
    tags: [{ name: 'type', value: 'sampling-participation' }],
    userId: merchantUser.id,
    emailType: 'sampling_participation',
    metadata: {
      activationId: activation.id,
      advertiserId,
      participantId: participation.user_id,
      actionType: participation.action_type,
    },
  });
}

async function sendSamplingVerificationEmail({ advertiserId, activation, participation }) {
  const [merchant, participant] = await Promise.all([
    getMerchantContext(advertiserId),
    getUserById(participation.user_id),
  ]);

  const merchantUser = merchant?.users;
  const participantName = participant?.display_name || participant?.username || 'there';
  const merchantName = merchant?.company_name || merchantUser?.display_name || merchantUser?.username || 'there';

  const sends = [];

  if (merchantUser?.email) {
    sends.push(
      resendService.sendEmail({
        to: merchantUser.email,
        subject: `Participation verified for ${activation.name}`,
        html: resendService.getBaseTemplate({
          title: 'Participation Verified',
          content: `
            <p>Hi ${merchantName},</p>
            <p>${participantName}'s interaction on <strong>${activation.name}</strong> has been verified.</p>
          `,
          ctaUrl: `${resendService.EMAIL_CONFIG.frontendUrl}/advertiser/dashboard`,
          ctaText: 'View Merchant Activity',
        }),
        text: `${participantName}'s interaction on "${activation.name}" has been verified.`,
        tags: [{ name: 'type', value: 'sampling-verification-merchant' }],
        userId: merchantUser.id,
        emailType: 'sampling_verification_merchant',
        metadata: { activationId: activation.id, participantId: participation.user_id },
      })
    );
  }

  if (participant?.email) {
    sends.push(
      resendService.sendEmail({
        to: participant.email,
        subject: `Your ${activation.name} interaction was verified`,
        html: resendService.getBaseTemplate({
          title: 'Interaction Verified',
          content: `
            <p>Hi ${participantName},</p>
            <p>Your demo interaction for <strong>${activation.name}</strong> has been verified.</p>
            <p>You can continue through the flow and redeem the offer in the merchant experience.</p>
          `,
          ctaUrl: `${resendService.EMAIL_CONFIG.frontendUrl}/rewards`,
          ctaText: 'View Rewards',
        }),
        text: `Your interaction for "${activation.name}" has been verified.`,
        tags: [{ name: 'type', value: 'sampling-verification-user' }],
        userId: participant.id,
        emailType: 'sampling_verification_user',
        metadata: { activationId: activation.id, advertiserId },
      })
    );
  }

  return Promise.allSettled(sends);
}

async function sendSamplingRedemptionEmail({ advertiserId, activation, participation }) {
  const [merchant, participant] = await Promise.all([
    getMerchantContext(advertiserId),
    getUserById(participation.user_id),
  ]);

  const merchantUser = merchant?.users;
  const participantName = participant?.display_name || participant?.username || 'there';
  const merchantName = merchant?.company_name || merchantUser?.display_name || merchantUser?.username || 'there';
  const sends = [];

  if (participant?.email) {
    sends.push(
      resendService.sendCouponEarnedEmail(
        participant.email,
        participantName,
        {
          title: activation.name,
          description: activation.description,
          value: activation.value_amount,
          value_unit: activation.value_unit,
          source_label: merchantName,
          expires_at: activation.expires_at,
        }
      )
    );
  }

  if (merchantUser?.email) {
    sends.push(
      resendService.sendEmail({
        to: merchantUser.email,
        subject: `Redemption recorded for ${activation.name}`,
        html: resendService.getBaseTemplate({
          title: 'Reward Redeemed',
          content: `
            <p>Hi ${merchantName},</p>
            <p>${participantName} just redeemed <strong>${activation.name}</strong>.</p>

            <div class="info-card">
              <div class="info-card-row">
                <span class="info-card-label">Current redemptions</span>
                <span class="info-card-value">${activation.current_redemptions + 1}</span>
              </div>
              <div class="info-card-row">
                <span class="info-card-label">Max redemptions</span>
                <span class="info-card-value">${activation.max_redemptions}</span>
              </div>
            </div>
          `,
          ctaUrl: `${resendService.EMAIL_CONFIG.frontendUrl}/advertiser/dashboard`,
          ctaText: 'View Merchant Dashboard',
        }),
        text: `${participantName} redeemed "${activation.name}".`,
        tags: [{ name: 'type', value: 'sampling-redemption-merchant' }],
        userId: merchantUser.id,
        emailType: 'sampling_redemption_merchant',
        metadata: { activationId: activation.id, participantId: participation.user_id },
      })
    );
  }

  return Promise.allSettled(sends);
}

async function sendSamplingGraduationEmail({ advertiserId, activationId, graduationReason, metrics }) {
  const merchant = await getMerchantContext(advertiserId);
  const merchantUser = merchant?.users;
  if (!merchantUser?.email) return { success: false, skipped: true, reason: 'merchant_email_missing' };

  const merchantName = merchant?.company_name || merchantUser.display_name || merchantUser.username;

  const html = resendService.getBaseTemplate({
    title: 'Sampling Complete',
    preheader: 'Your demo sampling phase has reached graduation.',
    content: `
      <p>Hi ${merchantName},</p>
      <p>Your sampling phase has graduated in the demo environment.</p>

      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">Reason</span>
          <span class="info-card-value">${graduationReason}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">Verified actions</span>
          <span class="info-card-value">${metrics.verified_actions ?? 0}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">Redemption rate</span>
          <span class="info-card-value">${Math.round((metrics.redemption_rate || 0) * 100)}%</span>
        </div>
      </div>
    `,
    ctaUrl: `${resendService.EMAIL_CONFIG.frontendUrl}/advertiser/dashboard`,
    ctaText: 'Review Graduation',
  });

  return resendService.sendEmail({
    to: merchantUser.email,
    subject: 'Your sampling demo has graduated',
    html,
    text: `Your sampling phase graduated due to ${graduationReason}. Verified actions: ${metrics.verified_actions ?? 0}. Redemption rate: ${Math.round((metrics.redemption_rate || 0) * 100)}%.`,
    tags: [{ name: 'type', value: 'sampling-graduation' }],
    userId: merchantUser.id,
    emailType: 'sampling_graduation',
    metadata: { advertiserId, activationId, graduationReason, ...metrics },
  });
}

module.exports = {
  sendDemoSessionStartedEmail,
  sendSamplingActivationCreatedEmail,
  sendSamplingParticipationEmail,
  sendSamplingVerificationEmail,
  sendSamplingRedemptionEmail,
  sendSamplingGraduationEmail,
};
