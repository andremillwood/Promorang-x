const React = require('react');
const { Section } = require('@react-email/components');
const { BRAND } = require('./Layout');

function Card({ children, style = {} }) {
  return React.createElement(
    Section,
    {
      style: {
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: `1px solid ${BRAND.border}`,
        padding: '20px',
        margin: '16px 0',
        ...style,
      },
    },
    children
  );
}

module.exports = { Card };
