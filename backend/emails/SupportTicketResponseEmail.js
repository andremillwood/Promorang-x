const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function SupportTicketResponseEmail({
  name = 'there',
  ticketNumber = '',
  subject = '',
  responseMessage = '',
  responderName = 'Promorang Support',
  frontendUrl,
}) {
  const previewText = `New response on your ticket #${ticketNumber}`;

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
      'Support Update'
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
      `Hi ${name}, there's a new response on your support ticket:`
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
        React.createElement('strong', null, 'Ticket: '),
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
        { style: { fontSize: '13px', margin: '4px 0', color: BRAND.textMuted } },
        React.createElement('strong', null, 'From: '),
        responderName
      ),
      responseMessage
        ? React.createElement(
            Text,
            {
              style: {
                fontSize: '14px',
                color: '#374151',
                backgroundColor: BRAND.surfaceAlt,
                padding: '12px',
                borderRadius: '6px',
                marginTop: '12px',
                borderLeft: `3px solid ${BRAND.primary}`,
                lineHeight: '22px',
              },
            },
            responseMessage
          )
        : null
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        {
          href: `${frontendUrl || 'https://promorang.co'}/support/tickets/${ticketNumber}`,
        },
        'View Conversation'
      )
    )
  );
}

module.exports = SupportTicketResponseEmail;
