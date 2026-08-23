const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function DropCompletedEmail({
  name = 'there',
  dropTitle = '',
  gemsEarned = 0,
  keysEarned = 0,
  pointsEarned = 0,
  frontendUrl,
}) {
  const rewards = [];
  if (gemsEarned) rewards.push(`${gemsEarned} Gems`);
  if (keysEarned) rewards.push(`${keysEarned} Keys`);
  if (pointsEarned) rewards.push(`${pointsEarned} Points`);
  const rewardsStr = rewards.join(' + ') || '0 Gems';

  const previewText = `You earned ${rewardsStr} for completing "${dropTitle}"`;

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
      'Mission Accomplished 🎉'
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
      `Hi ${name}, excellent work! You've successfully completed "${dropTitle}" and earned rewards for your engagement.`
    ),
    React.createElement(
      Card,
      {
        style: {
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '1px solid #A7F3D0',
        },
      },
      React.createElement(
        Text,
        {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#065F46',
            margin: '0 0 4px',
          },
        },
        'Rewards Earned'
      ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#047857',
            margin: '0 0 4px',
          },
        },
        rewardsStr
      ),
      React.createElement(
        Text,
        {
          style: { fontSize: '13px', color: '#065F46', margin: '0' },
        },
        'Credited to your account'
      )
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Completed: '),
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#10b981' } },
        React.createElement('strong', null, 'Status: '),
        'Verified & Paid ✓'
      )
    ),
    React.createElement(
      Text,
      {
        style: {
          fontSize: '14px',
          color: BRAND.textMuted,
          textAlign: 'center',
          margin: '16px 0 0',
        },
      },
      'Maintain your daily streak for compounding bonus rewards on every completion.'
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        { href: `${frontendUrl || 'https://promorang.co'}/wallet` },
        'View Wallet'
      )
    )
  );
}

module.exports = DropCompletedEmail;
