/**
 * Email Preview Server
 * Run: node emails/preview.js
 * Opens a local server to preview all React Email templates in the browser.
 */

const http = require('http');
const React = require('react');
const { renderEmail } = require('./index');

const WelcomeEmail = require('./WelcomeEmail');
const TicketCreatedEmail = require('./TicketCreatedEmail');
const GenericNotificationEmail = require('./GenericNotificationEmail');
const WinnerNotificationEmail = require('./WinnerNotificationEmail');
const DropApprovedEmail = require('./DropApprovedEmail');
const DropRejectedEmail = require('./DropRejectedEmail');
const DropCompletedEmail = require('./DropCompletedEmail');
const SecurityAlertEmail = require('./SecurityAlertEmail');
const PasswordResetEmail = require('./PasswordResetEmail');
const WithdrawalRequestedEmail = require('./WithdrawalRequestedEmail');
const WithdrawalCompletedEmail = require('./WithdrawalCompletedEmail');
const SupportTicketResponseEmail = require('./SupportTicketResponseEmail');
const ReferralSignupEmail = require('./ReferralSignupEmail');
const ReferralBonusEmail = require('./ReferralBonusEmail');
const StreakMilestoneEmail = require('./StreakMilestoneEmail');
const CouponEarnedEmail = require('./CouponEarnedEmail');
const TeamInvitationEmail = require('./TeamInvitationEmail');
const InvitationAcceptedEmail = require('./InvitationAcceptedEmail');
const AdminAlertEmail = require('./AdminAlertEmail');

// Template registry with sample data
const templates = {
  welcome: {
    label: 'Welcome Email',
    component: WelcomeEmail,
    props: { name: 'Sarah', role: 'promoter' },
  },
  'welcome-advertiser': {
    label: 'Welcome Email (Advertiser)',
    component: WelcomeEmail,
    props: { name: 'Alex', role: 'advertiser' },
  },
  'ticket-created': {
    label: 'Support Ticket Created',
    component: TicketCreatedEmail,
    props: {
      name: 'Sarah',
      ticketNumber: 'TK-4821',
      subject: 'Payment not received',
      category: 'Billing',
      message: "I completed a drop 3 days ago but haven't received my gems yet.",
    },
  },
  'ticket-response': {
    label: 'Support Ticket Response',
    component: SupportTicketResponseEmail,
    props: {
      name: 'Sarah',
      ticketNumber: 'TK-4821',
      subject: 'Payment not received',
      responseMessage:
        "Hi Sarah, thanks for reaching out! I've looked into your account and the gems for the 'Kingston Coffee' drop have now been credited. You should see them in your wallet. Please let us know if you have any other questions!",
      responderName: 'Marcus - Promorang Support',
    },
  },
  'generic-notification': {
    label: 'Generic Notification',
    component: GenericNotificationEmail,
    props: {
      title: 'New Drop Available',
      badge: 'NEW DROP',
      name: 'Sarah',
      contentHtml:
        '<p><strong>Kingston Coffee Co.</strong> just launched a new drop in your area!</p><p>Earn <strong>50 Gems</strong> by sharing your coffee experience.</p>',
      ctaText: 'View Drop',
      ctaUrl: 'https://promorang.co/drops/kingston-coffee',
    },
  },
  'winner-notification': {
    label: 'Winner Notification',
    component: WinnerNotificationEmail,
    props: {
      name: 'Sarah',
      promoTitle: 'Kingston Summer Giveaway',
      prizeName: 'JBL Flip 6 Speaker',
      prizeValue: '$129.99',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  'drop-approved': {
    label: 'Drop Approved',
    component: DropApprovedEmail,
    props: {
      name: 'Sarah',
      dropTitle: 'Kingston Coffee Experience',
      gemReward: 50,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  'drop-rejected': {
    label: 'Drop Rejected',
    component: DropRejectedEmail,
    props: {
      name: 'Sarah',
      dropTitle: 'Luxury Resort Weekend',
      reason:
        'The drop requires creators with 5,000+ followers. Keep growing your audience and try again!',
    },
  },
  'drop-completed': {
    label: 'Drop Completed',
    component: DropCompletedEmail,
    props: {
      name: 'Sarah',
      dropTitle: 'Kingston Coffee Experience',
      gemsEarned: 50,
      keysEarned: 2,
      pointsEarned: 100,
    },
  },
  'security-alert': {
    label: 'Security Alert',
    component: SecurityAlertEmail,
    props: {
      name: 'Sarah',
      device: 'Chrome on MacOS',
      location: 'Kingston, Jamaica',
      timestamp: new Date().toISOString(),
    },
  },
  'password-reset': {
    label: 'Password Reset',
    component: PasswordResetEmail,
    props: {
      name: 'Sarah',
      resetUrl: 'https://promorang.co/reset-password?token=abc123',
    },
  },
  'withdrawal-requested': {
    label: 'Withdrawal Requested',
    component: WithdrawalRequestedEmail,
    props: { name: 'Sarah', amount: 250.0, paymentMethod: 'PayPal' },
  },
  'withdrawal-completed': {
    label: 'Withdrawal Completed',
    component: WithdrawalCompletedEmail,
    props: {
      name: 'Sarah',
      amount: 250.0,
      paymentMethod: 'PayPal',
      transactionId: 'TXN-7829384',
    },
  },
  'referral-signup': {
    label: 'Referral Signup',
    component: ReferralSignupEmail,
    props: { name: 'Sarah', referredUserName: 'Marcus Johnson' },
  },
  'referral-bonus': {
    label: 'Referral Bonus',
    component: ReferralBonusEmail,
    props: {
      name: 'Sarah',
      referredUserName: 'Marcus Johnson',
      gemsEarned: 25,
      pointsEarned: 50,
    },
  },
  'streak-milestone': {
    label: 'Streak Milestone',
    component: StreakMilestoneEmail,
    props: {
      name: 'Sarah',
      streakDays: 30,
      bonusReward: '100 Gems + 5 Keys',
      nextMilestone: 60,
    },
  },
  'coupon-earned': {
    label: 'Coupon Earned',
    component: CouponEarnedEmail,
    props: {
      name: 'Sarah',
      couponCode: 'PROMO25OFF',
      discount: '25% OFF',
      brandName: 'Kingston Coffee Co.',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  'team-invitation': {
    label: 'Team Invitation',
    component: TeamInvitationEmail,
    props: {
      inviteeName: 'Alex',
      inviterName: 'Sarah Williams',
      companyName: 'Kingston Coffee Co.',
      role: 'Campaign Manager',
      inviteUrl: 'https://promorang.co/invite/abc123',
    },
  },
  'invitation-accepted': {
    label: 'Invitation Accepted',
    component: InvitationAcceptedEmail,
    props: {
      name: 'Sarah',
      acceptedByName: 'Alex Thompson',
      companyName: 'Kingston Coffee Co.',
      role: 'Campaign Manager',
    },
  },
  'admin-alert': {
    label: 'Admin Alert',
    component: AdminAlertEmail,
    props: {
      alertType: 'Withdrawal Review',
      title: 'Large Withdrawal Pending',
      message:
        'A withdrawal of $5,000.00 requires manual review before processing.',
      priority: 'high',
      details: {
        'User': 'marcus@example.com',
        'Amount': '$5,000.00',
        'Method': 'Bank Transfer',
        'Account Age': '45 days',
      },
    },
  },
};

const PORT = process.env.EMAIL_PREVIEW_PORT || 3333;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const templateKey = url.pathname.slice(1);

  // Index page
  if (!templateKey || templateKey === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Promorang Email Previews</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F5F0E8; color: #1F1F1F; }
          .header { background: linear-gradient(135deg, #FF6B00 0%, #FF9500 100%); padding: 40px 32px; color: white; }
          .header h1 { font-size: 28px; margin-bottom: 8px; }
          .header p { opacity: 0.9; font-size: 15px; }
          .container { max-width: 800px; margin: 0 auto; padding: 32px 20px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
          .card { background: white; border-radius: 10px; padding: 16px 20px; text-decoration: none; color: #1F1F1F; border: 1px solid #E5E0D8; transition: all 0.15s; }
          .card:hover { border-color: #FF6B00; box-shadow: 0 4px 12px rgba(255, 107, 0, 0.15); transform: translateY(-1px); }
          .card .label { font-size: 15px; font-weight: 600; }
          .card .key { font-size: 12px; color: #6B7280; margin-top: 4px; font-family: monospace; }
          .section { margin-top: 28px; }
          .section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #6B7280; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📧 Promorang Email Previews</h1>
          <p>${Object.keys(templates).length} templates available · Click any template to preview</p>
        </div>
        <div class="container">
          <div class="grid">
            ${Object.entries(templates)
              .map(
                ([key, { label }]) => `
              <a href="/${key}" class="card">
                <div class="label">${label}</div>
                <div class="key">/${key}</div>
              </a>
            `
              )
              .join('')}
          </div>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Render template
  const template = templates[templateKey];
  if (!template) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`Template "${templateKey}" not found. Visit / for the full list.`);
    return;
  }

  try {
    const element = React.createElement(template.component, template.props);
    const html = await renderEmail(element);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error rendering "${templateKey}": ${err.message}\n\n${err.stack}`);
  }
});

server.listen(PORT, () => {
  console.log(`\n📧  Promorang Email Preview Server`);
  console.log(`   ${Object.keys(templates).length} templates loaded`);
  console.log(`   http://localhost:${PORT}\n`);
  console.log(`   Templates:`);
  Object.entries(templates).forEach(([key, { label }]) => {
    console.log(`     http://localhost:${PORT}/${key}  →  ${label}`);
  });
  console.log('');
});
