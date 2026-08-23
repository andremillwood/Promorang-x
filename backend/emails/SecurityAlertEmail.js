const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function SecurityAlertEmail({
  name = 'there',
  device = 'Unknown device',
  location = 'Unknown location',
  timestamp = '',
  frontendUrl,
}) {
  const previewText = 'New login detected on your Promorang account';

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
      '⚠️ Security Alert'
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
      `Hi ${name}, we noticed a new sign-in to your Promorang account:`
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Device: '),
        device
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Location: '),
        location
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Time: '),
        timestamp
          ? new Date(timestamp).toLocaleString()
          : new Date().toLocaleString()
      )
    ),
    React.createElement(
      Text,
      {
        style: {
          fontSize: '14px',
          lineHeight: '22px',
          color: '#4B5563',
          margin: '16px 0',
        },
      },
      "If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately."
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        {
          href: `${frontendUrl || 'https://promorang.co'}/settings/security`,
        },
        'Review Account Security'
      )
    )
  );
}

module.exports = SecurityAlertEmail;
