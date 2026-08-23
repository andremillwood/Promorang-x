const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function AdminAlertEmail({
  alertType = 'Alert',
  title = 'Admin Alert',
  message = '',
  details = null,
  priority = 'medium',
  ctaUrl = '',
  ctaText = 'View in Admin',
  frontendUrl,
}) {
  const previewText = `Admin Alert: ${title}`;

  const priorityStyles = {
    high: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', label: '🔴 HIGH' },
    medium: { bg: '#FFF7ED', color: '#9A3412', border: '#FED7AA', label: '🟠 MEDIUM' },
    low: { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB', label: '⚪ LOW' },
  };
  const pStyle = priorityStyles[priority] || priorityStyles.medium;

  return React.createElement(
    Layout,
    { previewText, frontendUrl },
    React.createElement(
      Section,
      { style: { textAlign: 'center', marginBottom: '12px' } },
      React.createElement(
        'span',
        {
          style: {
            backgroundColor: pStyle.bg,
            color: pStyle.color,
            border: `1px solid ${pStyle.border}`,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '4px 12px',
            borderRadius: '9999px',
            display: 'inline-block',
          },
        },
        pStyle.label
      )
    ),
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
    React.createElement(
      Card,
      null,
      React.createElement(
        Text,
        {
          style: {
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: BRAND.textMuted,
            margin: '0 0 8px',
          },
        },
        alertType
      ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: '15px',
            lineHeight: '24px',
            color: '#374151',
            margin: '0',
          },
        },
        message
      ),
      details && typeof details === 'object'
        ? React.createElement(
            Section,
            {
              style: {
                marginTop: '12px',
                padding: '12px',
                backgroundColor: BRAND.surfaceAlt,
                borderRadius: '6px',
              },
            },
            ...Object.entries(details).map(([key, value]) =>
              React.createElement(
                Text,
                {
                  key,
                  style: {
                    fontSize: '13px',
                    margin: '2px 0',
                    color: '#374151',
                  },
                },
                React.createElement('strong', null, `${key}: `),
                String(value)
              )
            )
          )
        : null
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        {
          href: ctaUrl || `${frontendUrl || 'https://promorang.co'}/admin`,
        },
        ctaText
      )
    )
  );
}

module.exports = AdminAlertEmail;
