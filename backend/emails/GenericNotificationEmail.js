const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function GenericNotificationEmail({
  title = 'Notification',
  badge = '',
  name = '',
  contentHtml = '',
  ctaText = 'View in App',
  ctaUrl = 'https://promorang.co/dashboard',
  frontendUrl,
  previewText,
}) {
  return React.createElement(
    Layout,
    { previewText: previewText || title, frontendUrl },
    badge
      ? React.createElement(
          Section,
          { style: { textAlign: 'center', marginBottom: '12px' } },
          React.createElement(
            'span',
            {
              style: {
                backgroundColor: '#FFF7ED',
                color: BRAND.primary,
                border: '1px solid #FFEDD5',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '4px 12px',
                borderRadius: '9999px',
                display: 'inline-block',
              },
            },
            badge
          )
        )
      : null,
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
      title
    ),
    name
      ? React.createElement(
          Text,
          {
            style: {
              fontSize: '15px',
              color: '#374151',
              fontWeight: '500',
              margin: '0 0 12px',
            },
          },
          `Hi ${name},`
        )
      : null,
    React.createElement(
      Card,
      null,
      typeof contentHtml === 'string'
        ? React.createElement('div', {
            dangerouslySetInnerHTML: { __html: contentHtml },
            style: { fontSize: '14px', lineHeight: '22px', color: '#4B5563' },
          })
        : contentHtml
    ),
    ctaUrl && ctaText
      ? React.createElement(
          Section,
          { style: { textAlign: 'center', margin: '24px 0 12px' } },
          React.createElement(Button, { href: ctaUrl }, ctaText)
        )
      : null
  );
}

module.exports = GenericNotificationEmail;
