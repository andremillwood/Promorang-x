const React = require('react');
const {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
  Preview,
} = require('@react-email/components');

const BRAND = {
  primary: '#FF6B00',
  primaryDark: '#E55A00',
  secondary: '#FF9500',
  accent: '#FFCC1A',
  surface: '#FDFCF9',
  surfaceAlt: '#F5F0E8',
  text: '#1F1F1F',
  textMuted: '#6B7280',
  border: '#E5E0D8',
};

const DEFAULT_FRONTEND_URL = 'https://promorang.co';

function Layout({
  previewText = 'Update from Promorang',
  children,
  frontendUrl = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
  supportEmail = 'support@promorang.co',
  logoUrl = `${process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL}/email-assets/promorang-logo.png`,
  showFooter = true,
}) {
  return React.createElement(
    Html,
    { lang: 'en' },
    React.createElement(Head, null),
    previewText ? React.createElement(Preview, null, previewText) : null,
    React.createElement(
      Body,
      {
        style: {
          backgroundColor: BRAND.surfaceAlt,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
          margin: 0,
          padding: '24px 0',
          color: BRAND.text,
        },
      },
      React.createElement(
        Container,
        {
          style: {
            backgroundColor: BRAND.surface,
            borderRadius: '16px',
            border: `1px solid ${BRAND.border}`,
            margin: '0 auto',
            maxWidth: '580px',
            padding: '32px 28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          },
        },
        // Header / Logo
        React.createElement(
          Section,
          { style: { textAlign: 'center', marginBottom: '24px' } },
          React.createElement(
            Link,
            { href: frontendUrl, target: '_blank' },
            React.createElement(Img, {
              src: logoUrl,
              alt: 'Promorang',
              width: '140',
              style: { margin: '0 auto', display: 'block', maxWidth: '100%' },
            })
          )
        ),
        // Main Content
        children,
        // Footer
        showFooter &&
          React.createElement(
            Section,
            { style: { marginTop: '36px', textAlign: 'center' } },
            React.createElement(Hr, {
              style: { borderColor: BRAND.border, margin: '24px 0 16px' },
            }),
            React.createElement(
              Text,
              {
                style: {
                  fontSize: '12px',
                  color: BRAND.textMuted,
                  margin: '4px 0',
                },
              },
              'You are receiving this email because of your activity on Promorang.'
            ),
            React.createElement(
              Text,
              {
                style: {
                  fontSize: '12px',
                  color: BRAND.textMuted,
                  margin: '4px 0',
                },
              },
              React.createElement(
                Link,
                {
                  href: `${frontendUrl}/settings/notifications`,
                  style: { color: BRAND.primary, textDecoration: 'underline' },
                },
                'Notification Preferences'
              ),
              ' • ',
              React.createElement(
                Link,
                {
                  href: `mailto:${supportEmail}`,
                  style: { color: BRAND.primary, textDecoration: 'underline' },
                },
                'Contact Support'
              )
            ),
            React.createElement(
              Text,
              {
                style: {
                  fontSize: '11px',
                  color: BRAND.textMuted,
                  margin: '8px 0 0',
                },
              },
              `© ${new Date().getFullYear()} Promorang. All rights reserved.`
            )
          )
      )
    )
  );
}

module.exports = { Layout, BRAND };
