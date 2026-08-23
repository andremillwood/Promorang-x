const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function PasswordResetEmail({
  name = 'there',
  resetUrl = '',
  frontendUrl,
}) {
  const previewText = 'Reset your Promorang password';

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
      'Reset Your Password'
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
      `Hi ${name}, we received a request to reset the password for your Promorang account. Click the button below to securely create a new password.`
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Request Time: '),
        new Date().toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Expires: '),
        '1 hour'
      )
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(Button, { href: resetUrl }, 'Reset Password')
    ),
    React.createElement(
      Text,
      {
        style: {
          fontSize: '13px',
          color: BRAND.textMuted,
          margin: '16px 0 0',
        },
      },
      "If you didn't request this reset, you can safely ignore this email. Your account remains secure and your password will not be changed."
    )
  );
}

module.exports = PasswordResetEmail;
