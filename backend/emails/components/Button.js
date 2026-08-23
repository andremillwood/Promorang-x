const React = require('react');
const { Button: ReactEmailButton } = require('@react-email/components');
const { BRAND } = require('./Layout');

function Button({ href, children, style = {} }) {
  return React.createElement(
    ReactEmailButton,
    {
      href,
      style: {
        backgroundColor: BRAND.primary,
        borderRadius: '8px',
        color: '#FFFFFF',
        fontSize: '15px',
        fontWeight: '600',
        textDecoration: 'none',
        textAlign: 'center',
        display: 'inline-block',
        padding: '12px 24px',
        boxShadow: '0 2px 4px rgba(255, 107, 0, 0.25)',
        ...style,
      },
    },
    children
  );
}

module.exports = { Button };
