// This file ensures React is available globally
import React from 'react';

// Make React available globally for any UMD/global scripts
if (typeof window !== 'undefined') {
  window.React = React;
}

export default React;
