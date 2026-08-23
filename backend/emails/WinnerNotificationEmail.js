const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function WinnerNotificationEmail({
  name = 'there',
  promoTitle = '',
  prizeName = '',
  prizeValue = '',
  claimUrl = '',
  expiresAt = '',
  frontendUrl,
}) {
  const previewText = `🎉 You won ${prizeName || 'a prize'} from "${promoTitle}"!`;

  return React.createElement(
    Layout,
    { previewText, frontendUrl },
    React.createElement(
      Section,
      { style: { textAlign: 'center', marginBottom: '12px' } },
      React.createElement(
        'span',
        {
          style: {
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FDE68A',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '4px 12px',
            borderRadius: '9999px',
            display: 'inline-block',
          },
        },
        '🏆 WINNER'
      )
    ),
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
      'Congratulations, You Won! 🎉'
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
      `Hi ${name}, great news! You've been selected as a winner in the "${promoTitle}" promotion.`
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
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#92400E',
            margin: '0 0 4px',
          },
        },
        'Your Prize'
      ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: '22px',
            fontWeight: '700',
            color: BRAND.text,
            margin: '0 0 4px',
          },
        },
        prizeName || 'Special Prize'
      ),
      prizeValue
        ? React.createElement(
            Text,
            {
              style: {
                fontSize: '14px',
                color: '#78350F',
                margin: '0',
              },
            },
            `Value: ${prizeValue}`
          )
        : null
    ),
    expiresAt
      ? React.createElement(
          Text,
          {
            style: {
              fontSize: '13px',
              color: BRAND.textMuted,
              textAlign: 'center',
              margin: '8px 0 0',
            },
          },
          `⏰ Claim before: ${new Date(expiresAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`
        )
      : null,
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '28px 0 12px' } },
      React.createElement(
        Button,
        { href: claimUrl || (frontendUrl || 'https://promorang.co') + '/rewards' },
        'Claim Your Prize'
      )
    )
  );
}

module.exports = WinnerNotificationEmail;
