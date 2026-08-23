const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function CouponEarnedEmail({
  name = 'there',
  couponCode = '',
  discount = '',
  brandName = '',
  expiresAt = '',
  frontendUrl,
}) {
  const previewText = `You earned a coupon${brandName ? ` from ${brandName}` : ''}!`;

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
      'Coupon Unlocked! 🎟️'
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
      `Hi ${name}, you've earned a coupon${brandName ? ` from ${brandName}` : ''}!`
    ),
    React.createElement(
      Card,
      { style: { textAlign: 'center' } },
      couponCode
        ? React.createElement(
            Text,
            {
              style: {
                fontFamily: 'monospace',
                fontSize: '24px',
                fontWeight: '700',
                color: BRAND.primary,
                letterSpacing: '0.1em',
                padding: '16px 20px',
                border: `2px dashed ${BRAND.primary}`,
                borderRadius: '8px',
                margin: '0 0 12px',
                backgroundColor: '#FFF7ED',
                display: 'inline-block',
              },
            },
            couponCode
          )
        : null,
      discount
        ? React.createElement(
            Text,
            {
              style: {
                fontSize: '18px',
                fontWeight: '600',
                color: BRAND.text,
                margin: '8px 0 4px',
              },
            },
            discount
          )
        : null,
      brandName
        ? React.createElement(
            Text,
            {
              style: { fontSize: '14px', color: BRAND.textMuted, margin: '0' },
            },
            `From: ${brandName}`
          )
        : null,
      expiresAt
        ? React.createElement(
            Text,
            {
              style: {
                fontSize: '13px',
                color: BRAND.textMuted,
                margin: '8px 0 0',
              },
            },
            `Expires: ${new Date(expiresAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}`
          )
        : null
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        { href: `${frontendUrl || 'https://promorang.co'}/rewards` },
        'View My Rewards'
      )
    )
  );
}

module.exports = CouponEarnedEmail;
