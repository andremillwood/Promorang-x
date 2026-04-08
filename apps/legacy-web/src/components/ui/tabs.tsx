import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type TabsContextValue = {
  value: string | undefined;
  onSelect: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

export function Tabs({ value, defaultValue, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value ?? internalValue;

  const handleSelect = useCallback(
    (nextValue: string) => {
      setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange]
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value: activeValue,
      onSelect: handleSelect,
    }),
    [activeValue, handleSelect]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = {
  children: React.ReactNode;
  className?: string;
};

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div role="tablist" className={className}>
      {children}
    </div>
  );
}

type TabsTriggerProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);

  if (!ctx) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      data-state={isActive ? 'active' : 'inactive'}
      aria-selected={isActive}
      className={cn(
        'inline-flex items-center border-b-2 border-transparent px-3 py-2 text-sm font-medium transition',
        isActive ? 'border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700',
        className
      )}
      onClick={() => ctx.onSelect(value)}
    >
      {children}
    </button>
  );
}

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export function TabsContent({ value, children, className }: TabsContentProps) {
  const ctx = useContext(TabsContext);

  if (!ctx) {
    throw new Error('TabsContent must be used within Tabs');
  }

  const isActive = ctx.value === value;

  return (
    <div
      role="tabpanel"
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(isActive ? 'block' : 'hidden', className)}
    >
      {isActive ? children : null}
    </div>
  );
}
