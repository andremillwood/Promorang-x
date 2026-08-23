const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function ReferralSignupEmail({
  name = 'there',
  referredUserName = '',
  frontendUrl,
}) {
  const previewText = `${referredUserName} just joined using your referral link!`;

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
      'New Referral! 👥'
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
      `Hi ${name}, great news! Someone just joined Promorang using your referral link:`
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        {
          style: {
            fontSize: '18px',
            fontWeight: '600',
            color: BRAND.text,
            margin: '0 0 8px',
          },
        },
        `👤 ${referredUserName}`
      ),
      React.createElement(
        Text,
        {
          style: { fontSize: '14px', color: BRAND.textMuted, margin: '0' },
        },
        "When they become active, you'll earn a bonus!"
      )
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
      'Keep sharing your referral link to grow your network and earnings.'
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        { href: `${frontendUrl || 'https://promorang.co'}/referrals` },
        'View Referral Stats'
      )
    )
  );
}

module.exports = ReferralSignupEmail;
