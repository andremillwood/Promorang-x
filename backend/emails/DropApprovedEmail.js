const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function DropApprovedEmail({
  name = 'there',
  dropTitle = '',
  gemReward = 0,
  deadline = '',
  frontendUrl,
}) {
  const previewText = `Your application for "${dropTitle}" has been approved!`;

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
      'Application Approved! ✅'
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
      `Hi ${name}, great news! Your application for the following Drop has been approved:`
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        {
          style: {
            fontSize: '16px',
            fontWeight: '600',
            color: BRAND.text,
            margin: '0 0 8px',
          },
        },
        `📋 ${dropTitle}`
      ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: '22px',
            fontWeight: '700',
            color: BRAND.primary,
            margin: '0 0 4px',
          },
        },
        `+${gemReward} Gems`
      ),
      React.createElement(
        Text,
        {
          style: { fontSize: '13px', color: BRAND.textMuted, margin: '0' },
        },
        'Potential reward upon completion'
      ),
      deadline
        ? React.createElement(
            Text,
            {
              style: {
                fontSize: '14px',
                color: '#374151',
                margin: '12px 0 0',
                padding: '8px 12px',
                backgroundColor: BRAND.surfaceAlt,
                borderRadius: '6px',
              },
            },
            `⏰ Deadline: ${new Date(deadline).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`
          )
        : null
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        { href: `${frontendUrl || 'https://promorang.co'}/drops` },
        'View Drop Details'
      )
    )
  );
}

module.exports = DropApprovedEmail;
