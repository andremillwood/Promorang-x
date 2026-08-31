/**
 * PROMORANG EMAIL SERVICE
 * Comprehensive email service using Resend API
 * Handles all platform email notifications
 */

const { Resend } = require('resend');
const { resolveEmailRecipient } = require('./demoEmailRouting');
const { getEmailContent, getLocalizedEmailUrl, normalizeEmailLocale } = require('./emailI18n');

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

const DEFAULT_FRONTEND_URL = 'https://promorang.co';

function buildPublicAssetUrl(path) {
  const baseUrl = (process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/+$/, '');
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

// Email configuration
const EMAIL_CONFIG = {
  fromAddress: process.env.EMAIL_FROM_ADDRESS || 'Promorang <onboarding@resend.dev>',
  frontendUrl: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
  supportEmail: 'support@promorang.co',
  logoUrl: process.env.EMAIL_LOGO_URL || buildPublicAssetUrl('/email-assets/promorang-logo.png'),
};

function getBackendSupabase() {
  try {
    return require('../lib/supabase').supabase;
  } catch (error) {
    console.warn('[EmailService] Supabase unavailable; demo email routing disabled:', error.message);
    return null;
  }
}

// Promorang Brand Colors
// A moment platform - warm, inviting, human
// Orange primary, Black/Charcoal text, Yellow highlights, Warm cream backgrounds
const BRAND = {
  primary: '#FF6B00',        // Promorang Orange - hsl(24, 100%, 50%)
  primaryDark: '#E55A00',    // Deep Orange - hsl(18, 100%, 45%)
  secondary: '#FF9500',      // Secondary Orange
  accent: '#FFCC1A',         // Golden Yellow - hsl(45, 100%, 55%)
  accentSoft: '#FFE066',     // Soft Yellow
  success: '#10b981',        // Emerald 500 - for success states
  surface: '#FDFCF9',        // Warm Cream - hsl(40, 33%, 98%)
  surfaceAlt: '#F5F0E8',     // Darker Cream - hsl(35, 25%, 93%)
  text: '#1F1F1F',           // Charcoal - hsl(0, 0%, 12%)
  textLight: '#3D3D3D',      // Light Charcoal
  textMuted: '#706C65',      // Warm Gray - hsl(30, 8%, 45%)
  border: '#E8E4DC',         // Warm Border - hsl(35, 20%, 88%)
  gradient: 'linear-gradient(135deg, #FF6B00 0%, #FF9500 50%, #FFCC1A 100%)',
  gradientSunset: 'linear-gradient(135deg, #FF6B00 0%, #FF8A00 50%, #FFCC1A 100%)',
  gradientSubtle: 'linear-gradient(180deg, #FDFCF9 0%, #F5F0E8 100%)',
  shadow: '0 8px 30px -8px rgba(255, 107, 0, 0.15)',
};

/**
 * Base HTML email template with Premium Promorang branding
 * Sophisticated, modern, enterprise-grade design
 */
function getBaseTemplate({ title, preheader, content, ctaUrl, ctaText, footerNote, variant = 'default' }) {
  const isMinimal = variant === 'minimal';
  const isSuccess = variant === 'success';
  
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
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <!--[if mso]>
  <style type="text/css">
    table, td, div, p { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: ${BRAND.text};
      margin: 0;
      padding: 0;
      background-color: ${BRAND.surfaceAlt};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-wrapper {
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: ${BRAND.shadow};
    }
    
    .header {
      background: ${BRAND.gradientSunset};
      padding: 56px 40px 48px;
      text-align: center;
      position: relative;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="30" cy="30" r="80" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/><circle cx="170" cy="170" r="100" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/></svg>');
      background-size: 200px;
      opacity: 0.5;
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .brand-lockup {
      display: inline-block;
      margin-bottom: 28px;
      padding: 12px 18px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.24);
      box-shadow: 0 10px 30px rgba(31, 31, 31, 0.12);
      text-decoration: none;
    }

    .brand-logo {
      width: 34px;
      height: 34px;
      display: inline-block;
      vertical-align: middle;
      margin: 0 10px 0 0;
      border: 0;
    }

    .brand-fallback {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 24px;
      font-weight: 600;
      color: #1F1F1F;
      letter-spacing: 0;
      text-decoration: none;
      vertical-align: middle;
    }
    
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 30px;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    
    .header-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin-top: 10px;
      font-weight: 400;
    }
    
    .content {
      padding: 48px 40px;
      background: #ffffff;
    }
    
    .content p {
      margin: 0 0 20px;
      color: ${BRAND.textMuted};
      font-size: 16px;
      line-height: 1.7;
    }
    
    .content strong {
      color: ${BRAND.text};
      font-weight: 600;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: ${BRAND.primary};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    
    .cta-container {
      text-align: center;
      margin: 40px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: ${BRAND.gradient};
      color: #ffffff !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.01em;
      box-shadow: 0 4px 16px 0 rgba(255, 107, 0, 0.35);
      transition: all 0.2s ease;
    }
    
    .cta-secondary {
      display: inline-block;
      background: transparent;
      color: ${BRAND.primary} !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 500;
      font-size: 15px;
      border: 2px solid ${BRAND.primary};
      margin-left: 12px;
    }
    
    .highlight-card {
      background: linear-gradient(135deg, ${BRAND.surface} 0%, ${BRAND.surfaceAlt} 100%);
      border: 1px solid ${BRAND.border};
      border-radius: 14px;
      padding: 28px;
      margin: 28px 0;
      text-align: center;
    }
    
    .highlight-card.success {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-color: #86efac;
    }
    
    .highlight-card .label {
      font-size: 13px;
      font-weight: 600;
      color: ${BRAND.textMuted};
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }
    
    .highlight-card .value {
      font-size: 36px;
      font-weight: 700;
      color: ${BRAND.primary};
      letter-spacing: -0.03em;
      line-height: 1.2;
    }
    
    .highlight-card.success .value {
      color: ${BRAND.success};
    }
    
    .highlight-card .sublabel {
      font-size: 14px;
      color: ${BRAND.textMuted};
      margin-top: 8px;
    }
    
    .info-card {
      background: ${BRAND.surface};
      border-radius: 12px;
      padding: 20px 24px;
      margin: 20px 0;
      border-left: 4px solid ${BRAND.primary};
    }
    
    .info-card-row {
      display: table;
      width: 100%;
      padding: 10px 0;
      border-bottom: 1px solid #e4e4e7;
      font-size: 14px;
    }
    
    .info-card-row:last-child {
      border-bottom: none;
    }
    
    .info-card-label {
      display: table-cell;
      color: ${BRAND.textMuted};
      padding-right: 16px;
    }
    
    .info-card-value {
      display: table-cell;
      text-align: right;
      color: ${BRAND.text};
      font-weight: 500;
      white-space: nowrap;
    }
    
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 24px 0;
    }
    
    .feature-list li {
      padding: 12px 0;
      padding-left: 32px;
      position: relative;
      color: ${BRAND.textMuted};
      font-size: 15px;
    }
    
    .feature-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: ${BRAND.primary};
      font-weight: 700;
      font-size: 16px;
    }
    
    .tip-box {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 20px 24px;
      margin-top: 32px;
      font-size: 14px;
      color: #92400e;
    }
    
    .tip-box strong {
      color: #78350f;
    }
    
    .footer {
      background: #ffffff;
      padding: 40px;
      text-align: center;
      border-top: 1px solid ${BRAND.border};
    }

    .footer-logo {
      width: 26px;
      height: 26px;
      display: inline-block;
      margin: 0 8px 18px 0;
      vertical-align: middle;
      border: 0;
    }

    .footer-brand {
      display: inline-block;
      margin-bottom: 18px;
      color: ${BRAND.text};
      font-family: 'Fraunces', Georgia, serif;
      font-size: 20px;
      font-weight: 600;
      line-height: 26px;
      text-decoration: none;
      vertical-align: middle;
    }

    .social-links {
      margin: 0 0 24px;
      text-align: center;
      font-size: 13px;
      line-height: 1.8;
    }

    .social-links a {
      display: inline-block;
      color: ${BRAND.textMuted};
      text-decoration: none;
      font-weight: 600;
      margin: 0 10px;
    }
    
    .footer-links {
      margin: 24px 0;
      font-size: 13px;
      color: ${BRAND.textMuted};
    }
    
    .footer-links a {
      color: ${BRAND.primary};
      text-decoration: none;
      margin: 0 12px;
      font-weight: 500;
    }
    
    .footer-copyright {
      font-size: 12px;
      color: ${BRAND.textMuted};
      margin-top: 16px;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${BRAND.border}, transparent);
      margin: 32px 0;
    }
    
    .metrics-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }

    .metrics-table td {
      padding: 10px 0;
      border-bottom: 1px solid #e4e4e7;
      font-size: 14px;
    }

    .metrics-table tr:last-child td {
      border-bottom: none;
    }

    .metrics-table-label {
      color: ${BRAND.textMuted};
      padding-right: 16px;
    }

    .metrics-table-value {
      color: ${BRAND.text};
      font-weight: 600;
      text-align: right;
      white-space: nowrap;
    }

    @media only screen and (max-width: 600px) {
      body { background-color: #ffffff; }
      .email-wrapper {
        border-radius: 0;
        box-shadow: none;
      }
      .content { padding: 32px 24px; }
      .header { padding: 36px 24px 32px; }
      .header h1 { font-size: 24px; }
      .footer { padding: 32px 24px; }
      .cta-secondary { display: block; margin: 12px 0 0; }
      .info-card-label, .info-card-value {
        display: block;
        text-align: left;
        white-space: normal;
      }
      .info-card-value { margin-top: 4px; }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND.surfaceAlt}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <div class="email-wrapper">
          <div class="header">
            <div class="header-content">
              <a href="${EMAIL_CONFIG.frontendUrl}" class="brand-lockup">
                <img src="${EMAIL_CONFIG.logoUrl}" width="34" height="34" alt="" class="brand-logo" />
                <span class="brand-fallback">Promorang</span>
              </a>
              <h1>${title}</h1>
            </div>
          </div>
          
          <div class="content">
            ${content}
            
            ${ctaUrl && ctaText ? `
            <div class="cta-container">
              <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
            </div>
            ` : ''}
            
            ${footerNote ? `
            <div class="tip-box">
              <strong>Pro Tip:</strong> ${footerNote}
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <a href="${EMAIL_CONFIG.frontendUrl}" class="footer-brand">
              <img src="${EMAIL_CONFIG.logoUrl}" width="26" height="26" alt="" class="footer-logo" />
              Promorang
            </a>
            <div class="social-links">
              <a href="https://twitter.com/promorang" title="X (Twitter)">X / Twitter</a>
              <a href="https://instagram.com/promorang" title="Instagram">Instagram</a>
              <a href="https://linkedin.com/company/promorang" title="LinkedIn">LinkedIn</a>
              <a href="https://discord.gg/promorang" title="Discord">Discord</a>
            </div>
            <div class="footer-links">
              <a href="${EMAIL_CONFIG.frontendUrl}/settings/notifications">Preferences</a>
              <a href="${EMAIL_CONFIG.frontendUrl}/support">Support</a>
              <a href="${EMAIL_CONFIG.frontendUrl}/privacy">Privacy</a>
            </div>
            <div class="footer-copyright">
              © ${new Date().getFullYear()} Promorang Inc. All rights reserved.
            </div>
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
 * Send an email using Resend (supports html or React component)
 */
async function sendEmail({ to, subject, html, react, text, replyTo, tags, userId, emailType, metadata }) {
  try {
    const recipients = Array.isArray(to) ? to : [to];
    const supabase = getBackendSupabase();
    const resolvedRecipients = await Promise.all(
      recipients.map((recipient) => resolveEmailRecipient(supabase, recipient))
    );

    let finalHtml = html;
    if (react && !finalHtml) {
      try {
        const { renderEmail } = require('../emails');
        finalHtml = await renderEmail(react);
      } catch (err) {
        console.warn('[Resend] Failed to render React email component, falling back:', err.message);
      }
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.fromAddress,
      to: resolvedRecipients,
      subject,
      html: finalHtml,
      text,
      replyTo: replyTo || EMAIL_CONFIG.supportEmail,
      tags: tags || [{ name: 'platform', value: 'promorang' }],
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id, 'to:', resolvedRecipients.join(', '));
    await logSentEmailEvents({
      supabase,
      recipients,
      resolvedRecipients,
      subject,
      tags,
      messageId: data?.id,
      userId,
      emailType,
      metadata,
    });
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { success: false, error: err.message };
  }
}

async function logSentEmailEvents({ supabase, recipients, resolvedRecipients, subject, tags, messageId, userId, emailType, metadata }) {
  if (!supabase) return;

  try {
    const typeTag = Array.isArray(tags)
      ? tags.find((tag) => tag?.name === 'type')?.value
      : null;

    const finalEmailType = emailType || typeTag || 'transactional';

    if (userId) {
      await supabase.from('email_events').insert({
        user_id: userId,
        email_type: finalEmailType,
        event_type: 'sent',
        metadata: {
          subject,
          message_id: messageId,
          recipients: resolvedRecipients,
          ...metadata,
        },
      });
      return;
    }

    for (let index = 0; index < recipients.length; index += 1) {
      const originalRecipient = recipients[index];
      if (typeof originalRecipient !== 'string') continue;

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', originalRecipient.trim().toLowerCase())
        .maybeSingle();

      if (!user?.id) continue;

      await supabase.from('email_events').insert({
        user_id: user.id,
        email_type: finalEmailType,
        event_type: 'sent',
        metadata: {
          subject,
          message_id: messageId,
          original_recipient: originalRecipient,
          resolved_recipient: resolvedRecipients[index],
          ...metadata,
        },
      });
    }
  } catch (error) {
    console.warn('[Resend] Failed to log email event:', error.message);
  }
}

// =============================================================================
// TRANSACTIONAL EMAILS
// =============================================================================

/**
 * Welcome email for new users - Premium brand experience
 */
async function sendWelcomeEmail(userEmail, userName, options = {}) {
  const locale = options.locale || 'en';
  const contentData = getEmailContent('welcome', locale, { name: userName || 'there' });
  const dashboardUrl = getLocalizedEmailUrl('/dashboard', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-card">
        <div class="label">${contentData.bonusLabel}</div>
        <div class="value">${contentData.bonusValue}</div>
        <div class="sublabel">${contentData.bonusSublabel}</div>
      </div>
      
      <div class="section-title">${contentData.sectionTitle}</div>
      <ul class="feature-list">
        ${(contentData.features || []).map(f => `<li>${f}</li>`).join('')}
      </ul>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: ${BRAND.textMuted};">${contentData.readyPrompt}</p>
    `,
    ctaUrl: dashboardUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  const text = `
${contentData.title}, ${userName}!

${contentData.preheader}

${contentData.bonusLabel}: ${contentData.bonusValue} (${contentData.bonusSublabel})

${contentData.sectionTitle}:
${(contentData.features || []).map(f => `- ${f}`).join('\n')}

${contentData.ctaText}: ${dashboardUrl}

${contentData.footerNote}
  `.trim();

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text,
    tags: [{ name: 'type', value: 'welcome' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Password reset email - Premium security experience
 */
async function sendPasswordResetEmail(userEmail, resetUrl, userName, options = {}) {
  const locale = options.locale || 'en';
  const contentData = getEmailContent('passwordReset', locale, { name: userName || 'there' });
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">${contentData.requestTime}</span>
          <span class="info-card-value">${new Date().toLocaleString(dateLocale, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.expiresLabel}</span>
          <span class="info-card-value">${contentData.expiresValue}</span>
        </div>
      </div>
      
      <p style="font-size: 14px; color: ${BRAND.textMuted};">${contentData.securityNote}</p>
    `,
    ctaUrl: resetUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  const text = `
${contentData.title}

${contentData.greeting}

${contentData.intro}

${resetUrl}
${contentData.expiresLabel}: ${contentData.expiresValue}

${contentData.securityNote}
  `.trim();

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text,
    tags: [{ name: 'type', value: 'password-reset' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Security alert email (new login)
 */
async function sendSecurityAlertEmail(userEmail, userName, alertData) {
  const { alertType, device, location, timestamp, locale } = alertData;
  const contentData = getEmailContent('securityAlert', locale, { name: userName || 'there' });
  const securityUrl = getLocalizedEmailUrl('/settings/security', locale, EMAIL_CONFIG.frontendUrl);
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="meta-info">
        <strong>${contentData.deviceLabel}:</strong> ${device || contentData.unknownDevice}<br>
        <strong>${contentData.locationLabel}:</strong> ${location || contentData.unknownLocation}<br>
        <strong>${contentData.timeLabel}:</strong> ${new Date(timestamp || Date.now()).toLocaleString(dateLocale)}
      </div>
      
      <p>${contentData.ifYou}</p>
      <p>${contentData.ifNot}</p>
    `,
    ctaUrl: securityUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.title}: ${contentData.deviceLabel}: ${device || contentData.unknownDevice}, ${contentData.locationLabel}: ${location || contentData.unknownLocation}. ${contentData.ifNot} ${securityUrl}`,
    tags: [{ name: 'type', value: 'security-alert' }, { name: 'locale', value: contentData.locale }],
  });
}

// =============================================================================
// DROP & PLATFORM EMAILS
// =============================================================================

/**
 * Drop application approved
 */
async function sendDropApprovedEmail(userEmail, userName, dropData) {
  const { title, gemReward, deadline, locale } = dropData;
  const contentData = getEmailContent('dropApproved', locale, { name: userName || 'there', dropTitle: title });
  const dropsUrl = getLocalizedEmailUrl('/drops', locale, EMAIL_CONFIG.frontendUrl);
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">📋 ${title}</p>
        <div class="value">+${gemReward} Gems</div>
        <p style="margin: 0; font-size: 14px;">${contentData.rewardUponCompletion}</p>
      </div>
      
      ${deadline ? `
      <div class="meta-info">
        ⏰ <strong>${contentData.deadlineLabel}:</strong> ${new Date(deadline).toLocaleDateString(dateLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
      </div>
      ` : ''}
    `,
    ctaUrl: dropsUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${contentData.payoutLabel}: ${gemReward} Gems. ${dropsUrl}`,
    tags: [{ name: 'type', value: 'drop-approved' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Drop application rejected
 */
async function sendDropRejectedEmail(userEmail, userName, dropData) {
  const { title, reason, locale } = dropData;
  const contentData = getEmailContent('dropRejected', locale, { name: userName || 'there', dropTitle: title });
  const dropsUrl = getLocalizedEmailUrl('/drops', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      ${reason ? `
      <div class="meta-info">
        <strong>${contentData.feedbackLabel}:</strong> ${reason}
      </div>
      ` : ''}
      
      <p>${contentData.moreCopy}</p>
    `,
    ctaUrl: dropsUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.intro.replace(/<[^>]+>/g, '')} ${reason ? `${contentData.feedbackLabel}: ${reason}` : ''} ${dropsUrl}`,
    tags: [{ name: 'type', value: 'drop-rejected' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Drop completed - reward earned - Premium achievement experience
 */
async function sendDropCompletedEmail(userEmail, userName, dropData) {
  const { title, gemsEarned, keysEarned, pointsEarned, locale } = dropData;
  const contentData = getEmailContent('dropCompleted', locale, { name: userName || 'there', dropTitle: title });
  const walletUrl = getLocalizedEmailUrl('/wallet', locale, EMAIL_CONFIG.frontendUrl);
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const rewards = [];
  if (gemsEarned) rewards.push(`${gemsEarned} Gems`);
  if (keysEarned) rewards.push(`${keysEarned} Keys`);
  if (pointsEarned) rewards.push(`${pointsEarned} Points`);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-card success">
        <div class="label">${contentData.earnedLabel}</div>
        <div class="value">${rewards.join(' + ')}</div>
        <div class="sublabel">${contentData.creditedSublabel}</div>
      </div>
      
      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">${contentData.completedLabel}</span>
          <span class="info-card-value">${new Date().toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.statusLabel}</span>
          <span class="info-card-value" style="color: ${BRAND.success};">${contentData.statusValue}</span>
        </div>
      </div>
    `,
    ctaUrl: walletUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.intro.replace(/<[^>]+>/g, '')} ${rewards.join(' + ')}. ${walletUrl}`,
    tags: [{ name: 'type', value: 'drop-completed' }, { name: 'locale', value: contentData.locale }],
  });
}

// =============================================================================
// REFERRAL EMAILS
// =============================================================================

/**
 * New referral signup notification (to referrer)
 */
async function sendReferralSignupEmail(referrerEmail, referrerName, referredUserName, options = {}) {
  const locale = options.locale || 'en';
  const contentData = getEmailContent('referralSignup', locale, { name: referrerName || 'there', referredName: referredUserName });
  const referralsUrl = getLocalizedEmailUrl('/referrals', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">👤 ${referredUserName}</p>
        <p style="margin: 8px 0 0; font-size: 14px;">${contentData.bonusHint}</p>
      </div>
      
      <p>${contentData.keepSharing}</p>
    `,
    ctaUrl: referralsUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: referrerEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${referralsUrl}`,
    tags: [{ name: 'type', value: 'referral-signup' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Referral activation bonus earned
 */
async function sendReferralActivationEmail(referrerEmail, referrerName, bonusData) {
  const { referredUserName, gemsEarned, pointsEarned, locale } = bonusData;
  const contentData = getEmailContent('referralActivation', locale, { name: referrerName || 'there', referredName: referredUserName, gems: gemsEarned });
  const referralsUrl = getLocalizedEmailUrl('/referrals', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🎁 ${contentData.bonusLabel}</p>
        <div class="value">+${gemsEarned} Gems</div>
        ${pointsEarned ? `<p style="margin: 0; font-size: 14px;">+${pointsEarned} Points</p>` : ''}
      </div>
      
      <p>${contentData.keepSharing}</p>
    `,
    ctaUrl: referralsUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: referrerEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} +${gemsEarned} Gems`,
    tags: [{ name: 'type', value: 'referral-activation' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Referral commission earned
 */
async function sendReferralCommissionEmail(referrerEmail, referrerName, commissionData) {
  const { amount, referredUserName, activityType, locale } = commissionData;
  const contentData = getEmailContent('referralCommission', locale, { name: referrerName || 'there', referredName: referredUserName, amount });
  const walletUrl = getLocalizedEmailUrl('/wallet', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0;">${contentData.fromLabel}: <strong>${referredUserName}</strong></p>
        <p style="margin: 4px 0;">${contentData.activityLabel}: ${activityType}</p>
        <div class="value">+${amount} Gems</div>
      </div>
    `,
    ctaUrl: walletUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: referrerEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.subject}. ${activityType}.`,
    tags: [{ name: 'type', value: 'referral-commission' }, { name: 'locale', value: contentData.locale }],
  });
}

// =============================================================================
// FINANCIAL EMAILS
// =============================================================================

/**
 * Withdrawal request confirmation - Premium financial experience
 */
async function sendWithdrawalRequestedEmail(userEmail, userName, withdrawalData) {
  const { amount, paymentMethod, estimatedTime, locale } = withdrawalData;
  const formatted = `$${amount.toFixed(2)}`;
  const contentData = getEmailContent('withdrawalRequested', locale, { name: userName || 'there', amount: formatted, method: paymentMethod });
  const walletUrl = getLocalizedEmailUrl('/wallet', locale, EMAIL_CONFIG.frontendUrl);
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-card">
        <div class="label">${contentData.amountLabel}</div>
        <div class="value" style="color: ${BRAND.text};">${formatted}</div>
        <div class="sublabel">${contentData.viaLabel}</div>
      </div>
      
      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">${contentData.requestedLabel}</span>
          <span class="info-card-value">${new Date().toLocaleString(dateLocale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.methodLabel}</span>
          <span class="info-card-value">${paymentMethod}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.processingLabel}</span>
          <span class="info-card-value">${estimatedTime || contentData.defaultEta}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.statusLabel}</span>
          <span class="info-card-value" style="color: ${BRAND.accent};">${contentData.pendingReview}</span>
        </div>
      </div>
      
      <p style="font-size: 14px; color: ${BRAND.textMuted};">${contentData.reviewNote}</p>
    `,
    ctaUrl: walletUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${paymentMethod}. ${estimatedTime || contentData.defaultEta}.`,
    tags: [{ name: 'type', value: 'withdrawal-requested' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Withdrawal completed - Premium confirmation experience
 */
async function sendWithdrawalCompletedEmail(userEmail, userName, withdrawalData) {
  const { amount, paymentMethod, transactionId, locale } = withdrawalData;
  const formatted = `$${amount.toFixed(2)}`;
  const contentData = getEmailContent('withdrawalCompleted', locale, { name: userName || 'there', amount: formatted, method: paymentMethod });
  const walletUrl = getLocalizedEmailUrl('/wallet', locale, EMAIL_CONFIG.frontendUrl);
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-card success">
        <div class="label">${contentData.completeLabel}</div>
        <div class="value">${formatted}</div>
        <div class="sublabel">${contentData.sentVia}</div>
      </div>
      
      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">${contentData.txnLabel}</span>
          <span class="info-card-value" style="font-family: monospace; font-size: 13px;">${transactionId || 'N/A'}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.completedLabel}</span>
          <span class="info-card-value">${new Date().toLocaleString(dateLocale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.statusLabel}</span>
          <span class="info-card-value" style="color: ${BRAND.success};">${contentData.completedStatus}</span>
        </div>
      </div>
      
      <p style="text-align: center;">${contentData.thanks}</p>
    `,
    ctaUrl: walletUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${paymentMethod}. ${transactionId || ''}`,
    tags: [{ name: 'type', value: 'withdrawal-completed' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * KYC verification required
 */
async function sendKycRequiredEmail(userEmail, userName, reason, options = {}) {
  const locale = (typeof reason === 'object' && reason?.locale) || options.locale || 'en';
  const reasonText = typeof reason === 'string' ? reason : reason?.reason;
  const contentData = getEmailContent('kycRequired', locale, { name: userName || 'there' });
  const kycUrl = getLocalizedEmailUrl('/kyc', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="meta-info">
        ${reasonText || contentData.defaultReason}
      </div>
      
      <p>${contentData.processNote}</p>
    `,
    ctaUrl: kycUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.intro} ${kycUrl}`,
    tags: [{ name: 'type', value: 'kyc-required' }, { name: 'locale', value: contentData.locale }],
  });
}

async function sendKycApprovedEmail(userEmail, userName, approvalData = {}) {
  const { level = 'intermediate', limits, locale } = approvalData;
  const contentData = getEmailContent('kycApproved', locale, { name: userName || 'there' });
  const walletUrl = getLocalizedEmailUrl('/wallet', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>

      <p>${contentData.intro}</p>

      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">${contentData.levelLabel}</span>
          <span class="info-card-value">${level}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.dailyDeposit}</span>
          <span class="info-card-value">$${limits?.daily_deposit_limit || limits?.daily_deposit || 0}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.dailyWithdrawal}</span>
          <span class="info-card-value">$${limits?.daily_withdrawal_limit || limits?.daily_withdrawal || 0}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">${contentData.maxTrade}</span>
          <span class="info-card-value">$${limits?.max_single_trade || limits?.max_single_trade_amount || 0}</span>
        </div>
      </div>

      <p>${contentData.continueCopy}</p>
    `,
    ctaUrl: walletUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.intro.replace(/<[^>]+>/g, '')} ${walletUrl}`,
    tags: [{ name: 'type', value: 'kyc-approved' }, { name: 'locale', value: contentData.locale }],
  });
}

async function sendKycRejectedEmail(userEmail, userName, rejectionData = {}) {
  const { reason, category, locale } = rejectionData;
  const contentData = getEmailContent('kycRejected', locale, { name: userName || 'there' });
  const kycUrl = getLocalizedEmailUrl('/kyc', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>

      <p>${contentData.intro}</p>

      <div class="meta-info">
        <strong>${contentData.reasonLabel}:</strong> ${reason || contentData.defaultReason}<br>
        ${category ? `<strong>${contentData.categoryLabel}:</strong> ${category}` : ''}
      </div>

      <p>${contentData.resubmitCopy}</p>
    `,
    ctaUrl: kycUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.intro} ${reason || contentData.defaultReason} ${kycUrl}`,
    tags: [{ name: 'type', value: 'kyc-rejected' }, { name: 'locale', value: contentData.locale }],
  });
}

async function sendKycAdditionalInfoEmail(userEmail, userName, requestData = {}) {
  const { requestedInfo, locale } = requestData;
  const contentData = getEmailContent('kycAdditionalInfo', locale, { name: userName || 'there' });
  const kycUrl = getLocalizedEmailUrl('/kyc', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>

      <p>${contentData.intro}</p>

      <div class="meta-info">
        ${requestedInfo || contentData.defaultRequest}
      </div>

      <p>${contentData.afterUpdate}</p>
    `,
    ctaUrl: kycUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.intro} ${requestedInfo || contentData.defaultRequest} ${kycUrl}`,
    tags: [{ name: 'type', value: 'kyc-additional-info' }, { name: 'locale', value: contentData.locale }],
  });
}

// =============================================================================
// ENGAGEMENT EMAILS
// =============================================================================

/**
 * Streak milestone email
 */
async function sendStreakMilestoneEmail(userEmail, userName, streakData) {
  const { days, bonusGems, bonusPoints, locale } = streakData;
  const milestoneEmojis = {
    7: '🔥',
    14: '⚡',
    30: '🌟',
    60: '💫',
    100: '🏆',
    365: '👑',
  };
  const emoji = milestoneEmojis[days] || '🎯';
  const contentData = getEmailContent('streakMilestone', locale, {
    name: userName || 'there',
    days,
    emoji,
    bonusGems: bonusGems || 0,
    bonusPoints: bonusPoints || 0,
  });
  const dashboardUrl = getLocalizedEmailUrl('/dashboard', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">${contentData.milestoneLabel}</p>
        <div class="value">${contentData.daysLabel}</div>
        ${bonusGems || bonusPoints ? `
          <p style="margin: 8px 0 0; font-size: 14px;">${contentData.bonusLabel}</p>
        ` : ''}
      </div>
      
      <p>${contentData.keepGoing}</p>
    `,
    ctaUrl: dashboardUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${contentData.keepGoing}`,
    tags: [{ name: 'type', value: 'streak-milestone' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Quest completed
 */
async function sendQuestCompletedEmail(userEmail, userName, questData) {
  const { title, rewards, locale } = questData;
  const contentData = getEmailContent('questCompleted', locale, { name: userName || 'there', title });
  const questsUrl = getLocalizedEmailUrl('/quests', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🎯 ${title}</p>
        <div class="value">${rewards}</div>
      </div>
      
      <p>${contentData.moreCopy}</p>
    `,
    ctaUrl: questsUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${rewards || ''}`,
    tags: [{ name: 'type', value: 'quest-completed' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Achievement unlocked
 */
async function sendAchievementUnlockedEmail(userEmail, userName, achievementData) {
  const { title, description, rewardGems, rewardPoints, locale } = achievementData;
  const contentData = getEmailContent('achievementUnlocked', locale, {
    name: userName || 'there',
    title,
    rewardGems: rewardGems || 0,
    rewardPoints: rewardPoints || 0,
  });
  const profileUrl = getLocalizedEmailUrl('/profile', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🏅 ${title}</p>
        <p style="margin: 8px 0; color: #666;">${description}</p>
        ${rewardGems || rewardPoints ? `
          <div class="value">${contentData.rewardLabel}</div>
        ` : ''}
      </div>
    `,
    ctaUrl: profileUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${description || ''}`,
    tags: [{ name: 'type', value: 'achievement-unlocked' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Coupon earned (refactored from old emailNotifications.js)
 */
async function sendCouponEarnedEmail(userEmail, userName, couponData) {
  const { title, description, value, value_unit, source_label, expires_at, locale } = couponData;
  const contentData = getEmailContent('couponEarned', locale, { name: userName || 'there', title });
  const rewardsUrl = getLocalizedEmailUrl('/rewards', locale, EMAIL_CONFIG.frontendUrl);
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const valueDisplay = value_unit === 'percentage'
    ? `${value}% OFF`
    : `${value} ${value_unit}`;
  const expiresDisplay = new Date(expires_at).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🎁 ${title}</p>
        ${description ? `<p style="margin: 8px 0; color: #666;">${description}</p>` : ''}
        <div class="value">${valueDisplay}</div>
      </div>
      
      <div class="meta-info">
        <strong>${contentData.howLabel}:</strong> ${source_label}<br>
        <strong>${contentData.expiresLabel}:</strong> ${expiresDisplay}
      </div>
    `,
    ctaUrl: rewardsUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${valueDisplay}. ${contentData.expiresLabel}: ${expiresDisplay}. ${rewardsUrl}`,
    tags: [{ name: 'type', value: 'coupon-earned' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Weekly rewards digest
 */
async function sendWeeklyDigestEmail(userEmail, userName, stats) {
  const { earned_this_week, available_count, expiring_soon, total_gems, streak_days, locale } = stats;
  const contentData = getEmailContent('weeklyDigest', locale, {
    name: userName || 'there',
    earned: earned_this_week || 0,
    count: expiring_soon || 0,
  });
  const dashboardUrl = getLocalizedEmailUrl('/dashboard', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="text-align: center; padding: 15px; background: #f8f9ff; border-radius: 8px 0 0 8px;">
            <div style="font-size: 24px; font-weight: 700; color: ${BRAND.primary};">${earned_this_week || 0}</div>
            <div style="font-size: 12px; color: #666;">${contentData.rewardsEarned}</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f8f9ff;">
            <div style="font-size: 24px; font-weight: 700; color: ${BRAND.primary};">${total_gems || 0}</div>
            <div style="font-size: 12px; color: #666;">${contentData.totalGems}</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f8f9ff; border-radius: 0 8px 8px 0;">
            <div style="font-size: 24px; font-weight: 700; color: ${BRAND.primary};">${streak_days || 0}</div>
            <div style="font-size: 12px; color: #666;">${contentData.dayStreak}</div>
          </td>
        </tr>
      </table>
      
      ${expiring_soon > 0 ? `
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        ⚠️ ${contentData.expiring}
      </div>
      ` : ''}
      
      <p>${contentData.keepGoing}</p>
    `,
    ctaUrl: dashboardUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${earned_this_week || 0} / ${total_gems || 0} / ${streak_days || 0}`,
    tags: [{ name: 'type', value: 'weekly-digest' }, { name: 'locale', value: contentData.locale }],
  });
}

// =============================================================================
// EVENT & TICKET EMAILS
// =============================================================================

/**
 * Event ticket purchase confirmation
 */
async function sendTicketPurchaseEmail(userEmail, userName, ticketData) {
  const { eventName, tierName, activationCode, eventDate, eventLocation, locale } = ticketData;
  const contentData = getEmailContent('ticketPurchase', locale, { name: userName || 'there', momentTitle: eventName });
  const ticketsUrl = getLocalizedEmailUrl('/tickets', locale, EMAIL_CONFIG.frontendUrl);
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">🎟️ ${eventName}</p>
        <p style="margin: 8px 0;">${contentData.tierLabel}: <strong>${tierName}</strong></p>
        <div class="value" style="font-family: monospace;">${activationCode}</div>
        <p style="margin: 8px 0 0; font-size: 12px;">${contentData.codeLabel}</p>
      </div>
      
      <div class="meta-info">
        📅 <strong>${contentData.dateLabel}:</strong> ${new Date(eventDate).toLocaleDateString(dateLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}<br>
        📍 <strong>${contentData.locationLabel}:</strong> ${eventLocation}
      </div>
    `,
    ctaUrl: ticketsUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${contentData.codeLabel}: ${activationCode}. ${contentData.dateLabel}: ${eventDate}. ${contentData.locationLabel}: ${eventLocation}.`,
    tags: [{ name: 'type', value: 'ticket-purchase' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Event reminder (24h before)
 */
async function sendEventReminderEmail(userEmail, userName, eventData) {
  const { eventName, activationCode, eventDate, eventLocation, locale } = eventData;
  const contentData = getEmailContent('eventReminder', locale, { name: userName || 'there', momentTitle: eventName });
  const ticketsUrl = getLocalizedEmailUrl('/tickets', locale, EMAIL_CONFIG.frontendUrl);
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">📅 ${eventName}</p>
        <p style="margin: 8px 0;">📍 ${eventLocation}</p>
        <p style="margin: 8px 0;">🕐 ${new Date(eventDate).toLocaleString(dateLocale)}</p>
        <div class="value" style="font-family: monospace; font-size: 20px;">${activationCode}</div>
      </div>
      
      <p>${contentData.bringCode}</p>
    `,
    ctaUrl: ticketsUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${eventLocation}. ${activationCode}`,
    tags: [{ name: 'type', value: 'event-reminder' }, { name: 'locale', value: contentData.locale }],
  });
}

// =============================================================================
// SUPPORT EMAILS
// =============================================================================

/**
 * Support ticket created
 */
async function sendSupportTicketCreatedEmail(userEmail, userName, ticketData) {
  const { ticketId, subject, category, locale } = ticketData;
  const contentData = getEmailContent('supportTicketCreated', locale, {
    name: userName || 'there',
    ticketId,
    subject,
  });
  const ticketUrl = getLocalizedEmailUrl(`/support/tickets/${ticketId}`, locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="meta-info">
        <strong>${contentData.ticketIdLabel}:</strong> #${ticketId}<br>
        <strong>${contentData.categoryLabel}:</strong> ${category}<br>
        <strong>${contentData.subjectLabel}:</strong> ${subject}
      </div>
      
      <p>${contentData.etaCopy}</p>
    `,
    ctaUrl: ticketUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} #${ticketId}. ${subject}`,
    replyTo: EMAIL_CONFIG.supportEmail,
    tags: [{ name: 'type', value: 'support-ticket' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Support ticket response
 */
async function sendSupportTicketResponseEmail(userEmail, userName, ticketData) {
  const { ticketId, subject, responsePreview, locale } = ticketData;
  const contentData = getEmailContent('supportTicketResponse', locale, {
    name: userName || 'there',
    ticketId,
  });
  const ticketUrl = getLocalizedEmailUrl(`/support/tickets/${ticketId}`, locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0;"><strong>${contentData.ticketLabel}</strong> ${subject}</p>
        <p style="margin: 10px 0 0; color: #666;">"${responsePreview}..."</p>
      </div>
    `,
    ctaUrl: ticketUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to: userEmail,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${responsePreview || ''}...`,
    replyTo: EMAIL_CONFIG.supportEmail,
    tags: [{ name: 'type', value: 'support-response' }, { name: 'locale', value: contentData.locale }],
  });
}

// =============================================================================
// TEAM MANAGEMENT EMAILS
// =============================================================================

/**
 * Team invitation email - invites a user to join an advertiser account
 */
async function sendTeamInvitationEmail({ to, accountName, accountLogo, inviterName, role, message, token, expiresAt, locale }) {
  const contentData = getEmailContent('teamInvitation', locale, {
    accountName,
    inviterName,
  });
  const dateLocale = contentData.locale === 'es-419' ? 'es' : contentData.locale === 'pt-BR' ? 'pt-BR' : 'en-US';
  const expiresDisplay = new Date(expiresAt).toLocaleDateString(dateLocale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const expiresCopy = getEmailContent('teamInvitation', locale, {
    accountName,
    inviterName,
    expires: expiresDisplay,
  }).expiresCopy;
  const roleDescriptions = {
    admin: contentData.roleAdmin,
    manager: contentData.roleManager,
    viewer: contentData.roleViewer,
  };
  const inviteUrl = getLocalizedEmailUrl(`/invite/${token}`, locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        ${accountLogo ? `<img src="${accountLogo}" alt="${accountName}" style="width: 60px; height: 60px; border-radius: 8px; margin-bottom: 10px;">` : ''}
        <p style="margin: 0; font-weight: 600; font-size: 18px;">🏢 ${accountName}</p>
        <p style="margin: 8px 0 0;">${contentData.roleLabel}: <strong style="text-transform: capitalize;">${role}</strong></p>
        <p style="margin: 4px 0 0; font-size: 14px; color: #666;">${roleDescriptions[role] || ''}</p>
      </div>
      
      ${message ? `
      <div class="meta-info">
        <strong>${contentData.personalMessage}</strong><br>
        "${message}"
      </div>
      ` : ''}
      
      <p>${contentData.acceptCopy}</p>
      
      <p style="font-size: 13px; color: #888;">${expiresCopy}</p>
    `,
    ctaUrl: inviteUrl,
    ctaText: contentData.ctaText,
    footerNote: contentData.footerNote,
  });

  return sendEmail({
    to,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${inviteUrl}`,
    tags: [{ name: 'type', value: 'team-invitation' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Notification to inviter when invitation is accepted
 */
async function sendInvitationAcceptedEmail({ to, newMemberName, accountName, locale }) {
  const contentData = getEmailContent('invitationAccepted', locale, { newMemberName, accountName });
  const teamUrl = getLocalizedEmailUrl('/advertiser/settings/team', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.intro}</p>
      
      <p>${contentData.body}</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 600;">✅ ${contentData.addedLabel}</p>
        <p style="margin: 8px 0 0;">${contentData.addedCopy}</p>
      </div>
      
      <p>${contentData.manageCopy}</p>
    `,
    ctaUrl: teamUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${teamUrl}`,
    tags: [{ name: 'type', value: 'team-member-joined' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Notification when a user is removed from a team
 */
async function sendTeamRemovalEmail({ to, userName, accountName, removedByName, locale }) {
  const contentData = getEmailContent('teamRemoval', locale, {
    name: userName || 'there',
    accountName,
    removedByName,
  });
  const dashboardUrl = getLocalizedEmailUrl('/dashboard', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <p>${contentData.helpCopy}</p>
    `,
    ctaUrl: dashboardUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${contentData.helpCopy}`,
    tags: [{ name: 'type', value: 'team-removal' }, { name: 'locale', value: contentData.locale }],
  });
}

/**
 * Notification when a user's role is changed
 */
async function sendRoleChangedEmail({ to, userName, accountName, oldRole, newRole, changedByName, locale }) {
  const contentData = getEmailContent('roleChanged', locale, {
    name: userName || 'there',
    accountName,
    changedByName,
  });
  const dashboardUrl = getLocalizedEmailUrl('/advertiser/dashboard', locale, EMAIL_CONFIG.frontendUrl);

  const html = getBaseTemplate({
    title: contentData.title,
    preheader: contentData.preheader,
    content: `
      <p>${contentData.greeting}</p>
      
      <p>${contentData.intro}</p>
      
      <div class="highlight-box">
        <p style="margin: 0;">${contentData.previousRole}: <span style="text-transform: capitalize;">${oldRole}</span></p>
        <p style="margin: 8px 0 0; font-weight: 600;">${contentData.newRole}: <span style="text-transform: capitalize; color: ${BRAND.primary};">${newRole}</span></p>
      </div>
      
      <p>${contentData.permissionsCopy}</p>
    `,
    ctaUrl: dashboardUrl,
    ctaText: contentData.ctaText,
  });

  return sendEmail({
    to,
    subject: contentData.subject,
    html,
    text: `${contentData.preheader} ${oldRole} → ${newRole}`,
    tags: [{ name: 'type', value: 'team-role-changed' }, { name: 'locale', value: contentData.locale }],
  });
}

// =============================================================================
// ADMIN EMAILS
// =============================================================================

// =============================================================================
// PROMPTING & NUDGE EMAILS (Hosts, Brands, Content Engagement)
// =============================================================================

/**
 * Prompt hosts to create their first Moment
 */
async function sendHostCreateMomentPrompt(userEmail, userName, daysSinceSignup) {
  const html = getBaseTemplate({
    title: 'Create Your First Moment',
    preheader: 'Your community is waiting for content.',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>You signed up ${daysSinceSignup} days ago as a Host, but haven't created your first <strong>Moment</strong> yet.</p>
      
      <p>Moments are your chance to:</p>
      <ul class="feature-list">
        <li>Share exclusive content with your community</li>
        <li>Build deeper engagement with followers</li>
        <li>Monetize your most valuable experiences</li>
        <li>Grow your influence on the platform</li>
      </ul>
      
      <div class="highlight-card">
        <div class="label">Getting Started</div>
        <div class="value" style="font-size: 24px;">Takes 5 Minutes</div>
        <div class="sublabel">Upload a photo, video, or link and set your access rules</div>
      </div>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/moments/create`,
    ctaText: 'Create My First Moment',
    footerNote: 'Hosts who create within their first week see 3x more follower engagement.',
  });

  return sendEmail({
    to: userEmail,
    subject: 'Your community is waiting — create your first Moment',
    html,
    text: `Hi ${userName}, create your first Moment to engage your community. Takes 5 minutes: ${EMAIL_CONFIG.frontendUrl}/moments/create`,
    tags: [{ name: 'type', value: 'host-create-moment-prompt' }],
  });
}

/**
 * Prompt hosts who haven't created in a while
 */
async function sendHostReEngagementPrompt(userEmail, userName, daysSinceLastMoment) {
  const html = getBaseTemplate({
    title: 'Your Followers Miss You',
    preheader: 'It has been a while since your last Moment.',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>It's been <strong>${daysSinceLastMoment} days</strong> since your last Moment. Your followers are eager for new content!</p>
      
      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">Last Moment</span>
          <span class="info-card-value">${daysSinceLastMoment} days ago</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">Follower Activity</span>
          <span class="info-card-value" style="color: ${BRAND.accent};">High</span>
        </div>
      </div>
      
      <p>Fresh content keeps your community engaged and growing. What will you share next?</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/moments/create`,
    ctaText: 'Create New Moment',
    footerNote: 'Consistent hosts build 5x larger audiences over time.',
  });

  return sendEmail({
    to: userEmail,
    subject: 'Your followers are waiting for your next Moment',
    html,
    text: `Hi ${userName}, it's been ${daysSinceLastMoment} days since your last Moment. Create new content: ${EMAIL_CONFIG.frontendUrl}/moments/create`,
    tags: [{ name: 'type', value: 'host-reengagement-prompt' }],
  });
}

/**
 * Prompt brands/advertisers to sponsor popular Moments
 */
async function sendBrandSponsorPrompt(userEmail, userName, popularMoments) {
  const momentsList = popularMoments?.slice(0, 3).map(m => `
    <div style="margin: 12px 0; padding: 16px; background: ${BRAND.surface}; border-radius: 10px; border-left: 3px solid ${BRAND.primary};">
      <strong style="color: ${BRAND.text};">${m.title}</strong>
      <p style="margin: 4px 0 0; font-size: 13px; color: ${BRAND.textMuted};">by ${m.hostName} • ${m.engagement} engagements</p>
    </div>
  `).join('') || '';

  const html = getBaseTemplate({
    title: 'Sponsor High-Engagement Moments',
    preheader: 'Put your brand in front of engaged audiences.',
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Moment sponsorship is one of the most effective ways to reach engaged communities on Promorang.</p>
      
      <div class="highlight-card">
        <div class="label">Why Sponsor?</div>
        <div class="value" style="font-size: 20px;">3x Higher Engagement</div>
        <div class="sublabel">vs traditional display advertising</div>
      </div>
      
      ${popularMoments?.length ? `
      <div class="section-title">Trending Now</div>
      <p>These popular Moments are accepting sponsorships:</p>
      ${momentsList}
      ` : ''}
      
      <p>Sponsoring puts your brand message directly into content that users are actively consuming.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/sponsor/moments`,
    ctaText: 'Browse Sponsorship Opportunities',
    footerNote: 'Limited sponsorship slots available per Moment — secure your placement early.',
  });

  return sendEmail({
    to: userEmail,
    subject: 'Reach engaged audiences — sponsor trending Moments',
    html,
    text: `Hi ${userName}, sponsor high-engagement Moments for 3x better engagement. Browse opportunities: ${EMAIL_CONFIG.frontendUrl}/sponsor/moments`,
    tags: [{ name: 'type', value: 'brand-sponsor-prompt' }],
  });
}

/**
 * Prompt users to consume content (Moments waiting)
 */
async function sendContentConsumptionPrompt(userEmail, userName, unreadCount, featuredMoment) {
  const html = getBaseTemplate({
    title: 'Content Waiting For You',
    preheader: `${unreadCount} new Moment${unreadCount > 1 ? 's' : ''} from creators you follow.`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>You have <strong>${unreadCount} new Moment${unreadCount > 1 ? 's' : ''}</strong> waiting from creators you follow.</p>
      
      ${featuredMoment ? `
      <div class="highlight-card" style="text-align: left;">
        <div style="display: flex; gap: 16px; align-items: center;">
          <div style="width: 60px; height: 60px; background: ${BRAND.gradient}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">◆</div>
          <div>
            <div class="label" style="text-align: left; margin-bottom: 4px;">Featured Moment</div>
            <div style="font-weight: 600; color: ${BRAND.text}; font-size: 16px;">${featuredMoment.title}</div>
            <div style="font-size: 13px; color: ${BRAND.textMuted};">by ${featuredMoment.hostName}</div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <p>Don't miss out on exclusive content, behind-the-scenes access, and special offers from your favorite creators.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/moments`,
    ctaText: unreadCount > 1 ? `View ${unreadCount} Moments` : 'View Moment',
    footerNote: 'Engaging with content increases your chances of unlocking exclusive rewards.',
  });

  return sendEmail({
    to: userEmail,
    subject: `${unreadCount} new Moment${unreadCount > 1 ? 's' : ''} waiting from creators you follow`,
    html,
    text: `Hi ${userName}, you have ${unreadCount} new Moment${unreadCount > 1 ? 's' : ''} waiting. View them: ${EMAIL_CONFIG.frontendUrl}/moments`,
    tags: [{ name: 'type', value: 'content-consumption-prompt' }],
  });
}

/**
 * Alert advertiser when campaign budget is running low
 */
async function sendLowBudgetAlert(userEmail, userName, campaignData) {
  const { campaignName, remainingBudget, totalBudget, percentRemaining } = campaignData;

  const html = getBaseTemplate({
    title: 'Campaign Budget Running Low',
    preheader: `${percentRemaining}% of budget remaining for ${campaignName}`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p>Your campaign <strong>${campaignName}</strong> is running low on budget.</p>
      
      <div class="highlight-card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-color: #fbbf24;">
        <div class="label" style="color: #92400e;">Remaining Budget</div>
        <div class="value" style="font-size: 32px; color: #92400e;">${remainingBudget.toLocaleString()} Gems</div>
        <div class="sublabel" style="color: #a16207;">${percentRemaining}% of ${totalBudget.toLocaleString()} Gems total</div>
      </div>
      
      <div class="info-card">
        <div class="info-card-row">
          <span class="info-card-label">Campaign</span>
          <span class="info-card-value">${campaignName}</span>
        </div>
        <div class="info-card-row">
          <span class="info-card-label">Status</span>
          <span class="info-card-value" style="color: ${BRAND.accent};">Active (Low Budget)</span>
        </div>
      </div>
      
      <p>Top up your budget soon to keep your campaign running without interruption.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/advertiser/campaigns`,
    ctaText: 'Add Budget',
    footerNote: 'Campaigns with sufficient budget see 40% more completions.',
  });

  return sendEmail({
    to: userEmail,
    subject: `Campaign "${campaignName}" budget at ${percentRemaining}% — add funds`,
    html,
    text: `Hi ${userName}, your campaign "${campaignName}" is at ${percentRemaining}% budget. Add funds: ${EMAIL_CONFIG.frontendUrl}/advertiser/campaigns`,
    tags: [{ name: 'type', value: 'low-budget-alert' }],
  });
}

/**
 * Notify host when someone wants to join their Moment
 */
async function sendParticipationInterestAlert(userEmail, userName, momentData) {
  const { momentTitle, requesterName, requesterCount } = momentData;

  const html = getBaseTemplate({
    title: 'New Participation Request',
    preheader: `${requesterName} wants to join your Moment`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <p><strong>${requesterName}</strong> wants to participate in your Moment:</p>
      
      <div class="highlight-card">
        <div class="label">Moment</div>
        <div class="value" style="font-size: 20px;">${momentTitle}</div>
        <div class="sublabel">${requesterCount} total requests pending</div>
      </div>
      
      <p>Review and approve participants to grow your engaged community around this content.</p>
    `,
    ctaUrl: `${EMAIL_CONFIG.frontendUrl}/moments/${momentData.momentId}/requests`,
    ctaText: 'Review Requests',
    footerNote: 'Approving engaged participants increases your Moment\'s reach and value.',
  });

  return sendEmail({
    to: userEmail,
    subject: `${requesterName} wants to join your Moment "${momentTitle}"`,
    html,
    text: `Hi ${userName}, ${requesterName} wants to join your Moment "${momentTitle}". Review: ${EMAIL_CONFIG.frontendUrl}/moments/${momentData.momentId}/requests`,
    tags: [{ name: 'type', value: 'participation-request' }],
  });
}

/**
 * Notify user of social engagement (comments, likes on their content)
 */
async function sendSocialEngagementAlert(userEmail, userName, engagementData) {
  const { type, actorName, contentTitle, count } = engagementData;

  const typeLabels = {
    comment: 'commented on',
    like: 'liked',
    share: 'shared',
    follow: 'started following',
  };

  const html = getBaseTemplate({
    title: 'New Engagement',
    preheader: `${actorName} ${typeLabels[type]} your content`,
    content: `
      <p>Hi ${userName || 'there'},</p>
      
      <div style="display: flex; align-items: center; gap: 16px; margin: 24px 0;">
        <div style="width: 50px; height: 50px; background: ${BRAND.gradient}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 600;">
          ${actorName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style="margin: 0; font-size: 16px; color: ${BRAND.text};">
            <strong>${actorName}</strong> ${typeLabels[type]} 
            ${contentTitle ? `your <strong>${contentTitle}</strong>` : 'you'}
          </p>
          ${count > 1 ? `<p style="margin: 4px 0 0; font-size: 13px; color: ${BRAND.textMuted};">and ${count - 1} others</p>` : ''}
        </div>
      </div>
      
      <p>Your content is resonating with the community! Keep creating to build your influence.</p>
    `,
    ctaUrl: contentTitle ? `${EMAIL_CONFIG.frontendUrl}/content/${engagementData.contentId}` : `${EMAIL_CONFIG.frontendUrl}/profile`,
    ctaText: 'View Activity',
    footerNote: 'Engaging back with your community builds stronger relationships.',
  });

  return sendEmail({
    to: userEmail,
    subject: `${actorName} ${typeLabels[type]} your content`,
    html,
    text: `Hi ${userName}, ${actorName} ${typeLabels[type]} your content. View: ${EMAIL_CONFIG.frontendUrl}/profile`,
    tags: [{ name: 'type', value: `social-${type}` }],
  });
}

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
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendKycAdditionalInfoEmail,

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

  // Prompting & Nudge Emails (Hosts, Brands, Engagement)
  sendHostCreateMomentPrompt,
  sendHostReEngagementPrompt,
  sendBrandSponsorPrompt,
  sendContentConsumptionPrompt,
  sendLowBudgetAlert,
  sendParticipationInterestAlert,
  sendSocialEngagementAlert,
};
