import * as React from 'react';

type SelectContextValue = {
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  onValueChange: (value: string) => void;
  registerItem: (item: SelectItemRecord) => () => void;
  items: SelectItemRecord[];
};

type SelectItemRecord = {
  value: string;
  label: React.ReactNode;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

const useSelectContext = () => {
  const ctx = React.useContext<SelectContextValue | null>(SelectContext);
  if (!ctx) {
    throw new Error('Select components must be used within a Select');
  }
  return ctx;
};

export type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
};

export function Select({ value, defaultValue, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [items, setItems] = React.useState<SelectItemRecord[]>([]);

  const selectedValue = value ?? internalValue;

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange]
  );

  const registerItem = React.useCallback((item: SelectItemRecord) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(prevItem => prevItem.value === item.value);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = item;
        return next;
      }
      return [...prev, item];
    });

    return () => {
      setItems(prev => prev.filter(prevItem => prevItem.value !== item.value));
    };
  }, []);

  return (
    <SelectContext.Provider
      value={{
        value: selectedValue,
        open,
        setOpen,
        onValueChange: handleValueChange,
        registerItem,
        items,
      }}
    >
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = '', children, ...props }, ref) => {
    const { setOpen, open } = useSelectContext();
    return (
      <button
        type="button"
        ref={ref}
        className={`flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <svg
          className="ml-2 h-4 w-4 text-gray-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.7a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

export type SelectValueProps = {
  placeholder?: string;
};

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value, items } = useSelectContext();
  const selectedItem = items.find(item => item.value === value);
  return (
    <span className="flex-1 truncate text-sm text-gray-900">
      {selectedItem ? selectedItem.label : placeholder ?? 'Select an option'}
    </span>
  );
}

export type SelectContentProps = React.HTMLAttributes<HTMLDivElement>;

export function SelectContent({ className = '', children, ...props }: SelectContentProps) {
  const { open } = useSelectContext();
  if (!open) {
    return null;
  }

  return (
    <div
      role="listbox"
      className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export type SelectItemProps = React.LiHTMLAttributes<HTMLDivElement> & {
  value: string;
};

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className = '', children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setOpen, registerItem } = useSelectContext();

    React.useEffect(() => {
      return registerItem({ value, label: children });
    }, [children, registerItem, value]);

    const isSelected = selectedValue === value;

    const handleSelect = () => {
      onValueChange(value);
      setOpen(false);
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        className={`flex cursor-pointer items-center px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 ${
          isSelected ? 'bg-gray-100 font-medium' : ''
        } ${className}`}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect();
          }
        }}
        tabIndex={0}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem';
