import * as React from 'react';

export type DatePickerProps = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
};

export function DatePicker({ selected, onChange, minDate, maxDate, className = '' }: DatePickerProps) {
  const formatDate = (date: Date | null) => {
    if (!date) {
      return '';
    }
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (value: string) => {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <input
      type="date"
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 ${className}`}
      value={formatDate(selected)}
      onChange={(event) => onChange(parseDate(event.target.value))}
      min={formatDate(minDate ?? null)}
      max={formatDate(maxDate ?? null)}
    />
  );
}
