const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function TeamInvitationEmail({
  inviteeName = 'there',
  inviterName = '',
  companyName = '',
  role = 'Member',
  inviteUrl = '',
  frontendUrl,
}) {
  const previewText = `You've been invited to join ${companyName} on Promorang`;

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
      "You're Invited! 🤝"
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
      `${inviterName} has invited you to join ${companyName} on Promorang as a ${role}.`
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Company: '),
        companyName
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Role: '),
        role
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Invited by: '),
        inviterName
      )
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(Button, { href: inviteUrl }, 'Accept Invitation')
    ),
    React.createElement(
      Text,
      {
        style: {
          fontSize: '13px',
          color: BRAND.textMuted,
          margin: '12px 0 0',
          textAlign: 'center',
        },
      },
      'This invitation will expire in 7 days.'
    )
  );
}

module.exports = TeamInvitationEmail;
