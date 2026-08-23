const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function TicketCreatedEmail({
  name = 'there',
  ticketNumber = '',
  subject = 'Support Request',
  category = 'General',
  priority = 'normal',
  message = '',
  ctaUrl = 'https://promorang.co/support',
  frontendUrl,
}) {
  const previewText = `Support Ticket Created: #${ticketNumber} - ${subject}`;

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
      'Support Ticket Received'
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
      `Hi ${name}, thanks for reaching out. We've received your request and our support team is on it.`
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Ticket ID: '),
        `#${ticketNumber}`
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Subject: '),
        subject
      ),
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Category: '),
        category
      ),
      message
        ? React.createElement(
            Text,
            {
              style: {
                fontSize: '13px',
                color: '#6B7280',
                backgroundColor: BRAND.surfaceAlt,
                padding: '12px',
                borderRadius: '6px',
                marginTop: '12px',
              },
            },
            `"${message}"`
          )
        : null
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(Button, { href: ctaUrl }, 'View Ticket Status')
    )
  );
}

module.exports = TicketCreatedEmail;
