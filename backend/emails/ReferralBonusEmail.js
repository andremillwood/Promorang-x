const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function ReferralBonusEmail({
  name = 'there',
  referredUserName = '',
  gemsEarned = 0,
  pointsEarned = 0,
  frontendUrl,
}) {
  const previewText = `You earned ${gemsEarned} Gems from your referral!`;

  return React.createElement(
    Layout,
    { previewText, frontendUrl },
    React.createElement(
      Heading,
      {
        as: 'h1',
        style: {
          fontSize: '24px',
          fontWeight: '700',
          color: BRAND.text,
          margin: '0 0 16px',
          textAlign: 'center',
        },
      },
      'Referral Bonus Earned! 🎁'
    ),
    React.createElement(
      Text,
      {
        style: {
          fontSize: '15px',
          lineHeight: '24px',
          color: '#4B5563',
          margin: '0 0 16px',
        },
      },
      `Hi ${name}, your referral ${referredUserName} has become an active user on Promorang!`
    ),
    React.createElement(
      Card,
      {
        style: {
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '1px solid #FDE68A',
        },
      },
      React.createElement(
        Text,
        {
          style: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#92400E',
            margin: '0 0 8px',
          },
        },
        '🎁 Activation Bonus'
      ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: '24px',
            fontWeight: '700',
            color: BRAND.primary,
            margin: '0 0 4px',
          },
        },
        `+${gemsEarned} Gems`
      ),
      pointsEarned
        ? React.createElement(
            Text,
            {
              style: { fontSize: '14px', color: '#78350F', margin: '0' },
            },
            `+${pointsEarned} Points`
          )
        : null
    ),
    React.createElement(
      Text,
      {
        style: {
          fontSize: '15px',
          lineHeight: '24px',
          color: '#4B5563',
          margin: '16px 0',
        },
      },
      "You'll continue earning commissions from their activity. Keep sharing!"
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        { href: `${frontendUrl || 'https://promorang.co'}/referrals` },
        'View Earnings'
      )
    )
  );
}

module.exports = ReferralBonusEmail;
