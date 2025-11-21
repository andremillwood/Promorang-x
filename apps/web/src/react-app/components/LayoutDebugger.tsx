import { useEffect, useMemo, useState } from 'react';

/**
 * Layout Debugger Component
 * Activated via URL parameter: ?debug=layout
 * 
 * Features:
 * - Visual grid boundaries
 * - Card max-width indicators
 * - Overflow detection
 * - Breakpoint indicator
 * - Theme token display
 */

export function LayoutDebugger() {
  const [isActive, setIsActive] = useState(false);
  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateActive = () => {
      const params = new URLSearchParams(window.location.search);
      setIsActive(params.get('debug') === 'layout');
    };

    const handlePopState = () => updateActive();

    const wrapHistoryMethod = <T extends 'pushState' | 'replaceState'>(type: T) => {
      const original = window.history[type];
      return (...args: Parameters<typeof original>) => {
        const result = original.apply(window.history, args);
        updateActive();
        return result;
      };
    };

    const restorePushState = window.history.pushState;
    const restoreReplaceState = window.history.replaceState;

    window.history.pushState = wrapHistoryMethod('pushState');
    window.history.replaceState = wrapHistoryMethod('replaceState');
    window.addEventListener('popstate', handlePopState);

    updateActive();

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = restorePushState;
      window.history.replaceState = restoreReplaceState;
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    if (typeof window === 'undefined') {
      return;
    }

    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('xs (<640px)');
      else if (width < 768) setBreakpoint('sm (640-768px)');
      else if (width < 1024) setBreakpoint('md (768-1024px)');
      else if (width < 1280) setBreakpoint('lg (1024-1280px)');
      else if (width < 1536) setBreakpoint('xl (1280-1536px)');
      else if (width < 1920) setBreakpoint('2xl (1536-1920px)');
      else setBreakpoint('ultrawide (>1920px)');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Debug Styles */}
      <style>{`
        /* Grid boundaries */
        .debug-layout [class*="grid"] {
          outline: 2px dashed #ff00ff !important;
          outline-offset: -2px;
        }

        /* Sidebar boundaries */
        .debug-layout aside {
          outline: 3px solid #00ff00 !important;
          outline-offset: -3px;
        }

        /* Main content area */
        .debug-layout main {
          outline: 3px solid #0000ff !important;
          outline-offset: -3px;
        }

        /* Cards */
        .debug-layout [class*="card"],
        .debug-layout [class*="Card"],
        .debug-layout [class*="rounded-xl"],
        .debug-layout [class*="bg-pr-surface-card"] {
          outline: 2px solid #ff6b00 !important;
          outline-offset: -2px;
        }

        /* Max-width containers */
        .debug-layout [class*="max-w"] {
          outline: 2px dotted #ffff00 !important;
          outline-offset: -2px;
        }

        /* Overflow detection */
        .debug-layout * {
          position: relative;
        }

        .debug-layout *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .debug-layout *::-webkit-scrollbar-track {
          background: rgba(255, 0, 0, 0.1);
        }

        .debug-layout *::-webkit-scrollbar-thumb {
          background: rgba(255, 0, 0, 0.5);
          border-radius: 4px;
        }

        /* Highlight elements that overflow */
        .debug-layout *[style*="overflow: hidden"],
        .debug-layout *.overflow-hidden {
          box-shadow: inset 0 0 0 2px rgba(0, 255, 0, 0.3) !important;
        }
      `}</style>

      {/* Debug Info Panel */}
      <div
        className="fixed top-4 right-4 z-[9999] bg-black text-white p-4 rounded-lg shadow-2xl font-mono text-xs max-w-xs"
        style={{ pointerEvents: 'none' }}
      >
        <div className="font-bold text-sm mb-2 text-green-400">🔍 Layout Debugger</div>
        
        <div className="space-y-1 text-[10px]">
          <div>
            <span className="text-gray-400">Breakpoint:</span>{' '}
            <span className="text-yellow-300 font-bold">{breakpoint}</span>
          </div>
          <div>
            <span className="text-gray-400">Width:</span>{' '}
            <span className="text-blue-300">{window.innerWidth}px</span>
          </div>
          <div>
            <span className="text-gray-400">Height:</span>{' '}
            <span className="text-blue-300">{window.innerHeight}px</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700 space-y-1 text-[10px]">
          <div className="font-bold text-white mb-1">Legend:</div>
          <div><span className="text-green-400">█</span> Sidebars</div>
          <div><span className="text-blue-400">█</span> Main content</div>
          <div><span className="text-orange-400">█</span> Cards</div>
          <div><span className="text-yellow-400">█</span> Max-width containers</div>
          <div><span className="text-purple-400">█</span> Grid layouts</div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700 text-[10px]">
          <div className="text-gray-400">Remove ?debug=layout to disable</div>
        </div>
      </div>

      {/* Apply debug class to body */}
      <DebugClassApplier />
    </>
  );
}

function DebugClassApplier() {
  useEffect(() => {
    document.body.classList.add('debug-layout');
    return () => {
      document.body.classList.remove('debug-layout');
    };
  }, []);

  return null;
}

export default LayoutDebugger;
