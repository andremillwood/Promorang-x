const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function WithdrawalRequestedEmail({
  name = 'there',
  amount = 0,
  paymentMethod = '',
  estimatedTime = '1-3 business days',
  frontendUrl,
}) {
  const previewText = `Your withdrawal of $${Number(amount).toFixed(2)} is being processed.`;

  return React.createElement(
    Layout,
    { previewText, frontendUrl },
    React.createElement(
      Heading,
      {
        as: 'h1',
        style: {
          fontSize: '22px',
          fontWeight: '700',
          color: BRAND.text,
          margin: '0 0 16px',
        },
      },
      'Withdrawal Request Received'
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
      `Hi ${name}, we've received your withdrawal request and are processing it through our secure payment system.`
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: BRAND.textMuted,
            margin: '0 0 4px',
          },
        },
        'Withdrawal Amount'
      ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: '28px',
            fontWeight: '700',
            color: BRAND.text,
            margin: '0 0 8px',
          },
        },
        `$${Number(amount).toFixed(2)}`
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '6px 0', color: '#374151' } },
        React.createElement('strong', null, 'Method: '),
        paymentMethod
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '6px 0', color: '#374151' } },
        React.createElement('strong', null, 'Processing Time: '),
        estimatedTime
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '6px 0', color: BRAND.accent } },
        React.createElement('strong', null, 'Status: '),
        'Pending Review'
      )
    ),
    React.createElement(
      Text,
      {
        style: {
          fontSize: '13px',
          color: BRAND.textMuted,
          margin: '12px 0 0',
        },
      },
      "You'll receive a confirmation email once the transfer has been initiated. For security, all withdrawals are reviewed by our team."
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        { href: `${frontendUrl || 'https://promorang.co'}/wallet` },
        'View Withdrawal Status'
      )
    )
  );
}

module.exports = WithdrawalRequestedEmail;
