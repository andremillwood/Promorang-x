const React = require('react');
const { Section, Text, Heading } = require('@react-email/components');
const { Layout, BRAND } = require('./components/Layout');
const { Button } = require('./components/Button');
const { Card } = require('./components/Card');

function StreakMilestoneEmail({
  name = 'there',
  streakDays = 0,
  bonusReward = '',
  nextMilestone = 0,
  frontendUrl,
}) {
  const previewText = `${streakDays}-day streak milestone reached!`;

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
      'Streak Milestone! 🔥'
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
      `Hi ${name}, incredible consistency! You've hit a streak milestone.`
    ),
    React.createElement(
      Card,
      {
        style: {
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '1px solid #FED7AA',
          textAlign: 'center',
        },
      },
      React.createElement(
        Text,
        {
          style: {
            fontSize: '48px',
            fontWeight: '800',
            color: BRAND.primary,
            margin: '0',
            lineHeight: '1',
          },
        },
        `${streakDays}`
      ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: BRAND.primaryDark,
            margin: '4px 0 0',
          },
        },
        'Day Streak 🔥'
      )
    ),
    bonusReward
      ? React.createElement(
          Card,
          null,
          React.createElement(
            Text,
            { style: { fontSize: '14px', margin: '4px 0', color: '#374151' } },
            React.createElement('strong', null, 'Bonus Reward: '),
            bonusReward
          ),
          nextMilestone
            ? React.createElement(
                Text,
                {
                  style: {
                    fontSize: '14px',
                    margin: '4px 0',
                    color: BRAND.textMuted,
                  },
                },
                React.createElement('strong', null, 'Next Milestone: '),
                `${nextMilestone} days`
              )
            : null
        )
      : null,
    React.createElement(
      Section,
      { style: { textAlign: 'center', margin: '24px 0 12px' } },
      React.createElement(
        Button,
        { href: `${frontendUrl || 'https://promorang.co'}/dashboard` },
        'Keep Your Streak Going'
      )
    )
  );
}

module.exports = StreakMilestoneEmail;
