const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function InvitationAcceptedEmail({
  name = 'there',
  acceptedByName = '',
  companyName = '',
  role = 'Member',
  frontendUrl,
}) {
  const previewText = `${acceptedByName} has joined your team!`;

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
      'New Team Member! 🎉'
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
      `Hi ${name}, great news! ${acceptedByName} has accepted the invitation and joined ${companyName}.`
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'New Member: '),
        acceptedByName
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
        React.createElement('strong', null, 'Team: '),
        companyName
      )
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        {
          href: `${frontendUrl || 'https://promorang.co'}/advertiser/settings/team`,
        },
        'Manage Team'
      )
    )
  );
}

module.exports = InvitationAcceptedEmail;
