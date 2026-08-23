const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function WithdrawalCompletedEmail({
  name = 'there',
  amount = 0,
  paymentMethod = '',
  transactionId = '',
  frontendUrl,
}) {
  const previewText = `Your $${Number(amount).toFixed(2)} has been sent.`;

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
          textAlign: 'center',
        },
      },
      'Withdrawal Complete ✅'
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
      `Hi ${name}, your withdrawal has been processed and funds have been sent.`
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
        'Transfer Complete'
      ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#047857',
            margin: '0 0 4px',
          },
        },
        `$${Number(amount).toFixed(2)}`
      ),
      React.createElement(
        Text,
        {
          style: { fontSize: '13px', color: '#065F46', margin: '0' },
        },
        `Sent via ${paymentMethod}`
      )
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        {
          style: {
            fontSize: '14px',
            margin: '4px 0',
            color: '#374151',
            fontFamily: 'monospace',
          },
        },
        React.createElement('strong', { style: { fontFamily: 'inherit' } }, 'Transaction ID: '),
        transactionId || 'N/A'
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Completed: '),
        new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#10b981' } },
        React.createElement('strong', null, 'Status: '),
        'Completed ✓'
      )
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

module.exports = WithdrawalCompletedEmail;
