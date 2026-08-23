const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function WelcomeEmail({
  name = 'there',
  role = 'promoter',
  ctaUrl = 'https://promorang.co/dashboard',
  frontendUrl,
}) {
  const isAdvertiser = role === 'advertiser';
  const previewText = `Welcome to Promorang! Let's get you started.`;

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
      `Welcome to Promorang, ${name}! 🎉`
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
      isAdvertiser
        ? "We're thrilled to have your brand join the Promorang platform. Connect with authentic creators, launch high-impact drops, and grow your local presence effortlessly."
        : "We're thrilled to have you join Promorang. Discover exclusive drops, earn rewards for promoting brands you love, and turn moments into momentum."
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        Heading,
        {
          as: 'h3',
          style: {
            fontSize: '16px',
            fontWeight: '600',
            color: BRAND.primaryDark,
            margin: '0 0 12px',
          },
        },
        'Quick Next Steps'
      ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: '14px',
            lineHeight: '22px',
            color: '#374151',
            margin: '6px 0',
          },
        },
        isAdvertiser
          ? '1. Complete your business profile\n2. Create your first campaign or drop\n3. Start receiving creator submissions'
          : '1. Complete your creator profile\n2. Explore available drops near you\n3. Share moments and claim rewards'
      )
    ),
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '28px 0 16px' } },
      React.createElement(Button, { href: ctaUrl }, 'Go to Your Dashboard')
    )
  );
}

module.exports = WelcomeEmail;
