const React = require('react');
const { render } = require('@react-email/render');

// Components
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

// Templates
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

/**
 * Render a React email component to HTML string
 * @param {React.ReactElement} element
 * @returns {Promise<string>} HTML string
 */
async function renderEmail(element) {
  return await render(element);
}

module.exports = {
  // Renderer
  renderEmail,

  // Components
  Layout,
  BRAND,
  Button,
  Card,

  // Templates
  WelcomeEmail,
  TicketCreatedEmail,
  GenericNotificationEmail,
  WinnerNotificationEmail,
  DropApprovedEmail,
  DropRejectedEmail,
  DropCompletedEmail,
  SecurityAlertEmail,
  PasswordResetEmail,
  WithdrawalRequestedEmail,
  WithdrawalCompletedEmail,
  SupportTicketResponseEmail,
  ReferralSignupEmail,
  ReferralBonusEmail,
  StreakMilestoneEmail,
  CouponEarnedEmail,
  TeamInvitationEmail,
  InvitationAcceptedEmail,
  AdminAlertEmail,
};
