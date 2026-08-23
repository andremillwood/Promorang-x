const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function DropRejectedEmail({
  name = 'there',
  dropTitle = '',
  reason = '',
  frontendUrl,
}) {
  const previewText = `Application update for "${dropTitle}"`;

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
      'Application Update'
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
      `Hi ${name}, unfortunately, your application for "${dropTitle}" was not approved this time.`
    ),
    reason
      ? React.createElement(
          Card,
          null,
          React.createElement(
            Text,
            { style: { fontSize: '14px', margin: '0', color: '#374151' } },
            React.createElement('strong', null, 'Feedback: '),
            reason
          )
        )
      : null,
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
      "Don't worry — there are plenty more opportunities! Check out other available Drops and try again."
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        { href: `${frontendUrl || 'https://promorang.co'}/drops` },
        'Browse More Drops'
      )
    )
  );
}

module.exports = DropRejectedEmail;
