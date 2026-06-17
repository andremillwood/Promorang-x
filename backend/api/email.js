const express = require('express');
const router = express.Router();

const { supabase } = require('../lib/supabase');
const { normalizeEmail } = require('../services/demoEmailRouting');
const emailCampaignService = require('../services/emailCampaignService');

function getResendService() {
  return require('../services/resendService');
}

router.post('/welcome', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const userId = req.body?.user_id || req.body?.userId;
  const userName = req.body?.name || req.body?.display_name || req.body?.username || email?.split('@')[0];
  const userType = req.body?.user_type || req.body?.role || 'creator';

  if (!email) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }

  try {
    if (supabase) {
      let query = supabase.from('users').select('id, email, user_type').eq('email', email);
      if (userId) query = query.eq('id', userId);
      const { data: user, error } = await query.maybeSingle();

      if (error) throw error;

      let resolvedUser = user;
      if (!resolvedUser && userId) {
        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email,
            username: email.split('@')[0],
            display_name: userName,
            user_type: userType,
            user_tier: 'free',
          }, { onConflict: 'id' })
          .select('id, email, user_type')
          .single();

        if (createError) {
          console.warn('[Email API] Could not create users row for welcome event:', createError.message);
        } else {
          resolvedUser = createdUser;
        }
      }

      if (resolvedUser?.id) {
        await emailCampaignService.startOnboardingSequence(resolvedUser.id, resolvedUser.user_type || userType);
      }
    }

    const { sendWelcomeEmail } = getResendService();
    const result = await sendWelcomeEmail(email, userName);
    return res.status(result.success ? 200 : 500).json({ success: result.success, result });
  } catch (error) {
    console.error('[Email API] Failed to send welcome email:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/contact', async (req, res) => {
  const firstName = String(req.body?.first_name || req.body?.firstName || '').trim();
  const lastName = String(req.body?.last_name || req.body?.lastName || '').trim();
  const email = normalizeEmail(req.body?.email);
  const subject = String(req.body?.subject || '').trim();
  const message = String(req.body?.message || '').trim();
  const topic = String(req.body?.topic || 'general').trim();

  if (!firstName || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: 'First name, valid email, subject, and message are required',
    });
  }

  const recipient = process.env.SUPPORT_EMAIL || process.env.ADMIN_ALERT_EMAIL || 'andremillwood@gmail.com';
  const name = [firstName, lastName].filter(Boolean).join(' ');

  try {
    const { sendEmail, getBaseTemplate } = getResendService();
    const html = getBaseTemplate({
      title: 'New Contact Request',
      preheader: `${name} contacted Promorang about ${subject}`,
      content: `
        <p><strong>${name}</strong> submitted a message from the public contact page.</p>
        <div class="info-card">
          <div class="info-card-row">
            <span class="info-card-label">Email</span>
            <span class="info-card-value">${email}</span>
          </div>
          <div class="info-card-row">
            <span class="info-card-label">Topic</span>
            <span class="info-card-value">${topic}</span>
          </div>
          <div class="info-card-row">
            <span class="info-card-label">Subject</span>
            <span class="info-card-value">${subject}</span>
          </div>
        </div>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
      ctaUrl: `mailto:${email}?subject=Re:%20${encodeURIComponent(subject)}`,
      ctaText: 'Reply by Email',
    });

    const result = await sendEmail({
      to: recipient,
      subject: `Contact: ${subject}`,
      html,
      text: `New contact request\n\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\nSubject: ${subject}\n\n${message}`,
      replyTo: email,
      tags: [{ name: 'type', value: 'contact-request' }],
    });

    return res.status(result.success ? 200 : 500).json({
      success: result.success,
      result,
    });
  } catch (error) {
    console.error('[Email API] Failed to send contact request:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
